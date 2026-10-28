import pytest
from app.services.graph_engine import ClubGraphEngine

class MockClub:
    def __init__(self, id, name, category, interests=None, skills=None, is_active=True):
        self.id = id
        self.name = name
        self.category = category
        self.interests = [MockInterest(i) for i in (interests or [])]
        self.skills_required = skills or []
        self.is_active = is_active

class MockInterest:
    def __init__(self, name):
        self.name = name

def test_graph_construction_and_bfs_traversal():
    engine = ClubGraphEngine()
    clubs = [
        MockClub(1, "AI Club", "Technology", interests=["Artificial Intelligence", "Coding"]),
        MockClub(2, "Data Science Club", "Technology", interests=["Machine Learning", "Data Science"]),
        MockClub(3, "Dance Club", "Arts", interests=["Dance", "Music"]),
        MockClub(4, "Inactive Robotics", "Technology", interests=["Robotics"], is_active=False)
    ]

    engine.build_graph(clubs)

    # Inactive club node should not exist in graph
    assert not engine.graph.has_node("club:4")

    # Seed with Artificial Intelligence:
    # 1-hop should discover Club 1 (AI Club)
    # Semantic bridge connects AI <-> Machine Learning, which should discover Club 2 (Data Science Club) via 2 hops!
    scores = engine.bfs_related_clubs(["Artificial Intelligence"], max_depth=2)

    assert 1 in scores
    assert scores[1] == 1.0  # Direct interest connection
    # Check 4 is excluded
    assert 4 not in scores

def test_graph_analytics():
    engine = ClubGraphEngine()
    clubs = [
        MockClub(1, "Web Club", "Technology", interests=["Coding", "Web Development"]),
        MockClub(2, "Art Club", "Arts", interests=["Design", "Photography"])
    ]
    engine.build_graph(clubs)
    analytics = engine.get_graph_analytics()

    assert analytics["total_nodes"] > 0
    assert analytics["total_edges"] > 0
    assert isinstance(analytics["top_connected_interests"], list)
