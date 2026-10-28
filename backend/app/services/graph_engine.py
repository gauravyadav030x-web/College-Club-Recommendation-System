import networkx as nx
from typing import List, Dict, Set, Tuple, Any
from collections import deque

class ClubGraphEngine:
    """
    Graph Engine using NetworkX and explicit Breadth-First Search (BFS).
    Represents the bipartite/multitype knowledge graph of Clubs, Interests, Categories, and Skills.
    """

    def __init__(self):
        self.graph = nx.Graph()
        self.club_ids: Set[int] = set()
        self.interest_nodes: Set[str] = set()

    def build_graph(self, clubs: List[Any], interests: List[Any] = None) -> None:
        """
        Builds the graph structure from club and interest entities.
        DSA Graph representation:
          Nodes:
            - 'club:<id>' (attributes: type='club', id=id, name=name, is_active=is_active)
            - 'interest:<name>' (attributes: type='interest', name=name)
            - 'category:<name>' (attributes: type='category', name=name)
            - 'skill:<name>' (attributes: type='skill', name=name)
        """
        self.graph.clear()
        self.club_ids.clear()
        self.interest_nodes.clear()

        # Add predefined semantic bridges between strongly related interests
        semantic_bridges = [
            ("Artificial Intelligence", "Machine Learning"),
            ("Machine Learning", "Data Science"),
            ("Artificial Intelligence", "Robotics"),
            ("Coding", "Web Development"),
            ("Coding", "Gaming"),
            ("Design", "Web Development"),
            ("Photography", "Design"),
            ("Debate", "Public Speaking"),
            ("Entrepreneurship", "Public Speaking"),
            ("Dance", "Music"),
            ("Sports", "Gaming")
        ]
        for int1, int2 in semantic_bridges:
            n1 = f"interest:{int1.lower()}"
            n2 = f"interest:{int2.lower()}"
            self.graph.add_node(n1, type="interest", name=int1)
            self.graph.add_node(n2, type="interest", name=int2)
            self.graph.add_edge(n1, n2, weight=0.75, relation="semantic_related")
            self.interest_nodes.add(n1)
            self.interest_nodes.add(n2)

        for club in clubs:
            if not club.is_active:
                continue  # Requirement: Avoid recommending or traversing inactive clubs

            club_node = f"club:{club.id}"
            self.graph.add_node(
                club_node,
                type="club",
                id=club.id,
                name=club.name,
                category=club.category,
                is_active=club.is_active
            )
            self.club_ids.add(club.id)

            # Category edge
            if club.category:
                cat_node = f"category:{club.category.lower()}"
                self.graph.add_node(cat_node, type="category", name=club.category)
                self.graph.add_edge(club_node, cat_node, weight=0.5, relation="belongs_to_category")

            # Interest edges
            if hasattr(club, "interests") and club.interests:
                for interest in club.interests:
                    int_name = interest.name if hasattr(interest, "name") else str(interest)
                    int_node = f"interest:{int_name.lower()}"
                    self.graph.add_node(int_node, type="interest", name=int_name)
                    self.interest_nodes.add(int_node)
                    self.graph.add_edge(club_node, int_node, weight=1.0, relation="targets_interest")

            # Skill edges
            skills = []
            if hasattr(club, "skills_required") and club.skills_required:
                import json
                if isinstance(club.skills_required, str):
                    try:
                        skills = json.loads(club.skills_required)
                    except Exception:
                        skills = [s.strip() for s in club.skills_required.split(",") if s.strip()]
                elif isinstance(club.skills_required, list):
                    skills = club.skills_required

            for skill in skills:
                skill_node = f"skill:{skill.lower()}"
                self.graph.add_node(skill_node, type="skill", name=skill)
                self.graph.add_edge(club_node, skill_node, weight=0.8, relation="requires_skill")

    def bfs_related_clubs(self, seed_interests: List[str], max_depth: int = 2) -> Dict[int, float]:
        """
        DSA BFS Implementation:
        Discovers related clubs through shared interests and category bridges.
        - Distance 1 (Direct interest matches): proximity weight = 1.0
        - Distance 2 (Related interests or shared category): proximity weight = 0.5
        Time Complexity: O(V + E) where V is nodes and E is edges in the active subgraph.
        """
        if not seed_interests or not self.graph:
            return {}

        queue = deque()
        visited: Set[str] = set()
        club_scores: Dict[int, float] = {}

        # Initialize BFS queue with all matching interest nodes
        for interest in seed_interests:
            int_node = f"interest:{interest.lower().strip()}"
            if self.graph.has_node(int_node):
                queue.append((int_node, 0))
                visited.add(int_node)

        while queue:
            current_node, depth = queue.popleft()

            if depth >= max_depth:
                continue

            for neighbor in self.graph.neighbors(current_node):
                if neighbor not in visited:
                    visited.add(neighbor)
                    node_data = self.graph.nodes[neighbor]

                    # If neighbor is an active club, calculate proximity score
                    if node_data.get("type") == "club":
                        club_id = node_data.get("id")
                        # Closer distance receives higher score: depth 0 -> club at depth 1 gives 1.0; depth 1 -> depth 2 gives 0.5
                        hop_score = 1.0 if depth == 0 else 0.5
                        club_scores[club_id] = max(club_scores.get(club_id, 0.0), hop_score)

                    # Continue BFS exploration up to max_depth
                    queue.append((neighbor, depth + 1))

        return club_scores

    def get_graph_analytics(self) -> Dict[str, Any]:
        """
        Computes graph analytics for administrative insights.
        """
        if not self.graph or self.graph.number_of_nodes() == 0:
            return {
                "total_nodes": 0,
                "total_edges": 0,
                "connected_components": 0,
                "density": 0.0,
                "top_connected_interests": []
            }

        # Calculate degree centrality for interest nodes
        interest_degrees = []
        for node, data in self.graph.nodes(data=True):
            if data.get("type") == "interest":
                interest_degrees.append({
                    "name": data.get("name", node.replace("interest:", "")),
                    "degree": self.graph.degree(node)
                })

        interest_degrees.sort(key=lambda x: x["degree"], reverse=True)

        return {
            "total_nodes": self.graph.number_of_nodes(),
            "total_edges": self.graph.number_of_edges(),
            "connected_components": nx.number_connected_components(self.graph),
            "density": round(nx.density(self.graph), 4),
            "top_connected_interests": interest_degrees[:6]
        }
