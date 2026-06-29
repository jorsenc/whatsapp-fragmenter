# Graph Report - .  (2026-06-18)

## Corpus Check
- 10 files · ~70,310 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 35 nodes · 30 edges · 11 communities (4 shown, 7 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]

## God Nodes (most connected - your core abstractions)
1. `scripts` - 3 edges
2. `getFileTree()` - 2 edges
3. `broadcastTree()` - 2 edges
4. `Real-time Explorer System` - 2 edges
5. `main` - 1 edges
6. `test` - 1 edges
7. `keywords` - 1 edges
8. `author` - 1 edges
9. `license` - 1 edges
10. `chokidar` - 1 edges

## Surprising Connections (you probably didn't know these)
- `Gemini Generated Logo 1` --semantically_similar_to--> `Gemini Generated Logo 2`  [INFERRED] [semantically similar]
  logos/Gemini_Generated_Image_53t8q553t8q553t8.png → logos/Gemini_Generated_Image_ioq8ioq8ioq8ioq8.png
- `Logo v2 JPG` --semantically_similar_to--> `Logo v2 PNG`  [INFERRED] [semantically similar]
  logos/logo-v2.jpg → logos/logo-v2.png

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Real-time File System Sync Flow** — server_js, index_html, realtime_explorer [INFERRED 0.95]

## Communities (11 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.22
Nodes (8): author, description, keywords, license, main, name, type, version

### Community 1 - "Community 1"
Cohesion: 0.22
Nodes (8): chokidar, fs, http, path, server, watcher, WebSocket, wss

### Community 2 - "Community 2"
Cohesion: 0.67
Nodes (3): dependencies, chokidar, ws

### Community 3 - "Community 3"
Cohesion: 0.67
Nodes (3): scripts, start, test

## Knowledge Gaps
- **27 isolated node(s):** `name`, `version`, `description`, `main`, `test` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `scripts` connect `Community 3` to `Community 0`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Real-time Explorer System` (e.g. with `index.html` and `server.js`) actually correct?**
  _`Real-time Explorer System` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _27 weakly-connected nodes found - possible documentation gaps or missing edges._