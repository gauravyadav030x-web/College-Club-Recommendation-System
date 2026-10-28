import json
from typing import List, Dict, Any, Optional, Set
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.config import settings
from app.services.graph_engine import ClubGraphEngine
from app.services.ranking import (
    normalize_text,
    build_hashmap_indices,
    parse_json_list,
    calculate_set_overlap,
    rank_and_tiebreak,
    generate_recommendation_reason,
)

class ContentBasedRecommender:
    """
    Advanced Content-Based Recommendation Engine with TF-IDF Vectorization,
    Cosine Similarity, Set Overlap, HashMap Candidate Generation, and NetworkX BFS Graph Proximity.
    """

    def __init__(self):
        self.graph_engine = ClubGraphEngine()
        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=2500,
            sublinear_tf=True
        )

    def _build_club_corpus_item(self, club: Any) -> str:
        """Constructs a rich text representation for a club."""
        parts = [
            club.name or "",
            club.category or "",
            club.description or "",
            club.meeting_info or "",
            club.schedule or ""
        ]

        # Extract interest names
        if hasattr(club, "interests") and club.interests:
            for interest in club.interests:
                int_name = interest.name if hasattr(interest, "name") else str(interest)
                parts.append(int_name)
                # Boost interest terms
                parts.append(int_name)

        # Extract required skills
        skills = parse_json_list(getattr(club, "skills_required", None))
        for skill in skills:
            parts.append(f"skill {skill}")

        # Extract preferred activities
        activities = parse_json_list(getattr(club, "preferred_activities", None))
        for activity in activities:
            parts.append(f"activity {activity}")

        return normalize_text(" ".join(parts))

    def _build_student_query(
        self,
        interests: List[str],
        skills: List[str],
        activities: List[str],
        department: Optional[str] = None
    ) -> str:
        """Builds normalized query text representing the student profile."""
        query_parts = []
        if department:
            query_parts.append(department)

        # Repeat interests to give them higher term frequency weight
        for interest in interests:
            query_parts.extend([interest, interest])

        for skill in skills:
            query_parts.append(f"skill {skill}")

        for activity in activities:
            query_parts.append(f"activity {activity}")

        return normalize_text(" ".join(query_parts))

    def recommend(
        self,
        clubs: List[Any],
        student_interests: List[str],
        student_skills: Optional[List[str]] = None,
        student_activities: Optional[List[str]] = None,
        department: Optional[str] = None,
        top_k: int = 10,
        category_filter: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes complete hybrid content-based recommendation workflow.
        Returns top-K ranked clubs with match explanations and relevance scores.
        """
        student_skills = student_skills or []
        student_activities = student_activities or []
        clean_interests = [normalize_text(i) for i in student_interests if i and i.strip()]
        clean_skills = [normalize_text(s) for s in student_skills if s and s.strip()]
        clean_activities = [normalize_text(a) for a in student_activities if a and a.strip()]

        # Filter active clubs only
        active_clubs = [c for c in clubs if getattr(c, "is_active", True)]
        if category_filter:
            norm_cat = normalize_text(category_filter)
            active_clubs = [c for c in active_clubs if normalize_text(c.category) == norm_cat]

        if not active_clubs:
            return {
                "total_found": 0,
                "query_interests": student_interests,
                "query_skills": student_skills,
                "recommendations": [],
                "graph_insights": {}
            }

        # 1. DSA Graph: Build graph and run BFS for graph proximity scores
        self.graph_engine.build_graph(active_clubs)
        graph_scores = self.graph_engine.bfs_related_clubs(student_interests, max_depth=2)
        graph_analytics = self.graph_engine.get_graph_analytics()

        # 2. DSA HashMap: Index clubs by interest and skill for fast candidate lookup
        interest_to_clubs, skill_to_clubs, category_to_clubs = build_hashmap_indices(active_clubs)

        # 3. ML Feature Extraction: Build Club Corpus & fit TF-IDF
        club_corpus = [self._build_club_corpus_item(club) for club in active_clubs]
        student_query_text = self._build_student_query(
            clean_interests, clean_skills, clean_activities, department
        )

        tfidf_sim_scores = np.zeros(len(active_clubs))
        if student_query_text.strip():
            try:
                # Fit TF-IDF on club corpus + query
                all_texts = club_corpus + [student_query_text]
                tfidf_matrix = self.vectorizer.fit_transform(all_texts)

                # Separate club vectors and student vector
                club_vectors = tfidf_matrix[:-1]
                student_vector = tfidf_matrix[-1:]

                # Compute Cosine Similarity
                sim_matrix = cosine_similarity(student_vector, club_vectors)
                tfidf_sim_scores = sim_matrix[0]
            except Exception:
                tfidf_sim_scores = np.zeros(len(active_clubs))

        student_int_set = set(clean_interests)
        student_skill_set = set(clean_skills)
        student_act_set = set(clean_activities)

        candidates: List[Dict[str, Any]] = []

        w_tfidf = settings.TFIDF_WEIGHT
        w_overlap = settings.OVERLAP_WEIGHT
        w_graph = settings.GRAPH_WEIGHT

        # If student has not selected any interests/skills, distribute weights to popular recommendation
        has_user_input = bool(clean_interests or clean_skills or clean_activities)

        for idx, club in enumerate(active_clubs):
            club_int_names = []
            if hasattr(club, "interests") and club.interests:
                club_int_names = [i.name if hasattr(i, "name") else str(i) for i in club.interests]

            club_skills = parse_json_list(getattr(club, "skills_required", None))
            club_activities = parse_json_list(getattr(club, "preferred_activities", None))

            # DSA Sets: Compute intersection and Jaccard overlap
            club_int_set = {normalize_text(i) for i in club_int_names if i}
            overlap_score, matched_int_set = calculate_set_overlap(student_int_set, club_int_set)

            # Map matched normalized interests back to original casing
            matched_interests_list = [
                name for name in club_int_names
                if normalize_text(name) in matched_int_set
            ]

            # Match skills and activities via Sets
            club_skill_set = {normalize_text(s) for s in club_skills if s}
            matched_skill_set = student_skill_set.intersection(club_skill_set)
            matched_skills_list = [
                s for s in club_skills
                if normalize_text(s) in matched_skill_set
            ]

            club_act_set = {normalize_text(a) for a in club_activities if a}
            matched_act_set = student_act_set.intersection(club_act_set)
            matched_act_list = [
                a for a in club_activities
                if normalize_text(a) in matched_act_set
            ]

            # TF-IDF similarity component
            tfidf_component = float(tfidf_sim_scores[idx])

            # Graph BFS component
            graph_component = float(graph_scores.get(club.id, 0.0))

            # Combine multi-factor score
            if has_user_input:
                raw_score = (
                    (w_tfidf * tfidf_component) +
                    (w_overlap * overlap_score) +
                    (w_graph * graph_component)
                )
                # Scale to 0-100% Relevance Score
                relevance_score = round(min(100.0, max(0.0, raw_score * 100.0)), 1)
            else:
                # Cold start: baseline campus interest score
                relevance_score = 70.0 + (idx % 20)

            # Generate natural language reason
            reason = generate_recommendation_reason(
                club_name=club.name,
                category=club.category,
                matched_interests=matched_interests_list,
                matched_skills=matched_skills_list,
                matched_activities=matched_act_list,
                graph_discovered=(graph_component > 0)
            )

            candidates.append({
                "club_id": club.id,
                "club_name": club.name,
                "slug": club.slug,
                "category": club.category,
                "description": club.description,
                "score": relevance_score,
                "tfidf_score": round(tfidf_component * 100.0, 1),
                "overlap_score": round(overlap_score * 100.0, 1),
                "graph_score": round(graph_component * 100.0, 1),
                "matched_interests": matched_interests_list,
                "matched_skills": matched_skills_list,
                "matched_activities": matched_act_list,
                "reason": reason,
                "meeting_info": getattr(club, "meeting_info", "Weekly Meetings"),
                "location": getattr(club, "location", "Student Center"),
                "contact_email": getattr(club, "contact_email", "club@university.edu"),
                "is_favorited": False,
                "membership_status": None
            })

        # 4. DSA Sorting with deterministic tie-breaking
        ranked_results = rank_and_tiebreak(candidates)
        top_recommendations = ranked_results[:top_k]

        return {
            "total_found": len(ranked_results),
            "query_interests": student_interests,
            "query_skills": student_skills,
            "recommendations": top_recommendations,
            "graph_insights": graph_analytics
        }

recommender = ContentBasedRecommender()
