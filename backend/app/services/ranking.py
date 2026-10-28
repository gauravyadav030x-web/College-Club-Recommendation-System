import json
import re
from typing import List, Dict, Set, Any, Tuple

def normalize_text(text: str) -> str:
    """Normalize input text by lowercasing, removing special characters, and stripping."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    return " ".join(text.split())

def build_hashmap_indices(clubs: List[Any]) -> Tuple[Dict[str, Set[int]], Dict[str, Set[int]], Dict[str, Set[int]]]:
    """
    DSA HashMap / Inverted Index:
    Maps normalized interest names, skills, and categories to sets of club IDs.
    Provides O(1) candidate lookup instead of repeatedly scanning every club in O(N).
    """
    interest_to_clubs: Dict[str, Set[int]] = {}
    skill_to_clubs: Dict[str, Set[int]] = {}
    category_to_clubs: Dict[str, Set[int]] = {}

    for club in clubs:
        if not club.is_active:
            continue

        # Map category
        if club.category:
            cat_key = normalize_text(club.category)
            category_to_clubs.setdefault(cat_key, set()).add(club.id)

        # Map interests
        if hasattr(club, "interests") and club.interests:
            for interest in club.interests:
                int_name = interest.name if hasattr(interest, "name") else str(interest)
                norm_int = normalize_text(int_name)
                if norm_int:
                    interest_to_clubs.setdefault(norm_int, set()).add(club.id)

        # Map skills
        skills = parse_json_list(getattr(club, "skills_required", None))
        for skill in skills:
            norm_skill = normalize_text(skill)
            if norm_skill:
                skill_to_clubs.setdefault(norm_skill, set()).add(club.id)

    return interest_to_clubs, skill_to_clubs, category_to_clubs

def parse_json_list(val: Any) -> List[str]:
    """Safely parse JSON or comma-separated lists of strings."""
    if not val:
        return []
    if isinstance(val, list):
        return [str(item).strip() for item in val if str(item).strip()]
    if isinstance(val, str):
        val = val.strip()
        if val.startswith("[") and val.endswith("]"):
            try:
                parsed = json.loads(val)
                return [str(item).strip() for item in parsed if str(item).strip()]
            except Exception:
                pass
        return [item.strip() for item in val.split(",") if item.strip()]
    return []

def calculate_set_overlap(student_set: Set[str], club_set: Set[str]) -> Tuple[float, Set[str]]:
    """
    DSA Sets implementation:
    Computes exact overlap and Jaccard similarity.
    Intersection identifies common elements in O(min(|A|, |B|)).
    """
    if not student_set or not club_set:
        return 0.0, set()

    intersection = student_set.intersection(club_set)
    # Weighted overlap score: proportion of student's desired interests matched
    recall_score = len(intersection) / len(student_set)
    # Jaccard index for balance
    union = student_set.union(club_set)
    jaccard = len(intersection) / len(union) if union else 0.0

    combined_overlap = (0.7 * recall_score) + (0.3 * jaccard)
    return combined_overlap, intersection

def rank_and_tiebreak(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    DSA Sorting Implementation:
    Ranks recommendation items with a deterministic tie-breaking rule:
      Primary: Higher relevance score (descending)
      Secondary: Greater number of matched interests (descending)
      Tertiary: Club name alphabetically (ascending)
    Time complexity: O(K log K) with Python Timsort.
    """
    return sorted(
        items,
        key=lambda x: (
            -round(x.get("score", 0.0), 2),
            -len(x.get("matched_interests", [])),
            x.get("club_name", "").lower()
        )
    )

def generate_recommendation_reason(
    club_name: str,
    category: str,
    matched_interests: List[str],
    matched_skills: List[str],
    matched_activities: List[str],
    graph_discovered: bool = False
) -> str:
    """Generate transparent, human-readable explanation for why a club was recommended."""
    reasons = []

    if matched_interests:
        if len(matched_interests) == 1:
            reasons.append(f"Directly matches your interest in {matched_interests[0]}")
        elif len(matched_interests) == 2:
            reasons.append(f"Strongly matches your interests in {matched_interests[0]} and {matched_interests[1]}")
        else:
            reasons.append(f"Matches {len(matched_interests)} of your interests including {', '.join(matched_interests[:2])} and more")

    if matched_skills:
        reasons.append(f"Aligns with your skill in {', '.join(matched_skills[:2])}")

    if matched_activities:
        reasons.append(f"Offers preferred activities like {', '.join(matched_activities[:2])}")

    if graph_discovered and not matched_interests:
        reasons.append(f"Discovered via semantic connection in the {category} community")

    if not reasons:
        return f"Popular and active campus club in {category} welcoming new student members"

    return "; ".join(reasons) + "."
