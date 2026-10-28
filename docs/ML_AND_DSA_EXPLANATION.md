# Machine Learning and Data Structures & Algorithms Implementation

CampusConnect implements real, tested ML algorithms and Data Structures & Algorithms integrated directly into the production code.

---

## 1. Machine Learning: Content-Based Filtering

### 1.1 Vector Space Modeling (TF-IDF)
For each club $C_j$, a rich text document $D_j$ is assembled:
$$D_j = \text{name} \circ \text{category} \circ \text{description} \circ \text{interests}^2 \circ \text{skills} \circ \text{activities}$$

Term Frequency - Inverse Document Frequency (TF-IDF) reflects how important a term $t$ is to a document $D$ in a corpus $N$:
$$\text{TF}(t, D) = \frac{f_{t, D}}{\sum_{t' \in D} f_{t', D}}$$
$$\text{IDF}(t, \mathcal{D}) = \ln \left(\frac{1 + |\mathcal{D}|}{1 + |\{D \in \mathcal{D} : t \in D\}|}\right) + 1$$
$$\text{TF-IDF}(t, D, \mathcal{D}) = \text{TF}(t, D) \times \text{IDF}(t, \mathcal{D})$$

### 1.2 Cosine Similarity
Given student query vector $\mathbf{s}$ and club vector $\mathbf{c}_j$:
$$\text{Sim}_{\text{TF-IDF}}(\mathbf{s}, \mathbf{c}_j) = \frac{\mathbf{s} \cdot \mathbf{c}_j}{\|\mathbf{s}\|_2 \|\mathbf{c}_j\|_2} = \frac{\sum_{i=1}^{M} s_i c_{j, i}}{\sqrt{\sum_{i=1}^M s_i^2} \sqrt{\sum_{i=1}^M c_{j, i}^2}}$$
Value lies in range $[0, 1]$.

---

## 2. Data Structures & Algorithms (DSA)

### 2.1 Graph Formulation & Breadth-First Search (BFS)
- **Graph Type**: Bipartite / Multigraph $G = (V, E)$ constructed with `NetworkX`.
- **Node Set $V$**:
  - Club Nodes: $v \in V_{\text{club}}$ (with metadata: `id`, `name`, `is_active`)
  - Interest Nodes: $v \in V_{\text{interest}}$
  - Skill Nodes: $v \in V_{\text{skill}}$
  - Category Nodes: $v \in V_{\text{category}}$
- **Edge Set $E$**:
  - Club-to-Interest edges (weight = 1.0)
  - Club-to-Category edges (weight = 0.5)
  - Club-to-Skill edges (weight = 0.8)
  - Semantic cross-interest bridges (weight = 0.75, e.g. AI $\leftrightarrow$ ML $\leftrightarrow$ Data Science)

#### BFS Exploration:
```python
def bfs_related_clubs(seed_interests, max_depth=2):
    queue = deque([(seed, 0) for seed in seed_interests])
    visited = set(seed_interests)
    while queue:
        node, depth = queue.popleft()
        if depth >= max_depth: continue
        for neighbor in graph.neighbors(node):
            if neighbor not in visited:
                visited.add(neighbor)
                if is_club(neighbor) and is_active(neighbor):
                    score = 1.0 if depth == 0 else 0.5
                    club_scores[club_id] = max(club_scores.get(club_id, 0), score)
                queue.append((neighbor, depth + 1))
```
- **Time Complexity**: $O(|V| + |E|)$ where $|V|$ is the number of nodes and $|E|$ is the number of edges.
- **Space Complexity**: $O(|V|)$ for the BFS queue and visited set.

---

### 2.2 HashMap Inverted Index
- **Structure**:
  - `Dict[str, Set[int]]` mapping normalized interest names $\rightarrow$ candidate club IDs.
- **Purpose**: Eliminates the need to iterate through all clubs when filtering candidate sets, reducing candidate retrieval from $O(N)$ to $O(1)$ average time.

---

### 2.3 Set Theory & Jaccard Overlap
For student interest set $S$ and club interest set $C$:
- **Intersection**: $S \cap C$ computed in $O(\min(|S|, |C|))$.
- **Recall Metric**: $\frac{|S \cap C|}{|S|}$
- **Jaccard Metric**: $\frac{|S \cap C|}{|S \cup C|}$
- **Combined Set Overlap**:
  $$\text{Score}_{\text{Overlap}} = 0.7 \left(\frac{|S \cap C|}{|S|}\right) + 0.3 \left(\frac{|S \cap C|}{|S \cup C|}\right)$$

---

### 2.4 Composite Relevance Scoring
$$\text{Relevance Score} = 100 \times \left(0.50 \cdot \text{Sim}_{\text{TF-IDF}} + 0.35 \cdot \text{Score}_{\text{Overlap}} + 0.15 \cdot \text{Score}_{\text{Graph}}\right)$$
The score is scaled to $[0, 100]$ and transparently presented as a **Relevance Score**, not a probability.

---

### 2.5 Deterministic Ranking with Tie-Breaking
When candidate scores are tied, a deterministic multi-key comparator sorts items:
```python
sorted(
    candidates,
    key=lambda x: (
        -round(x["score"], 2),              # 1. Highest score descending
        -len(x["matched_interests"]),       # 2. More matched interests descending
        x["club_name"].lower()              # 3. Alphabetical ascending
    )
)
```
- **Time Complexity**: $O(K \log K)$ via Python's Timsort where $K$ is the number of active candidate clubs.
- **Space Complexity**: $O(K)$ aux storage.
