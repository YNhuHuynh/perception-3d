# Seeing Before Generating — Project Page

Project page for the NeurIPS 2026 submission
**"Seeing Before Generating: Object Perception Enhances Single-View 3D Reconstruction"** (PGR-3D).

> Perception rescues 3D reconstruction where generative priors fail.

## Structure

```
project_page/
├── index.html                  # main page
├── static/
│   ├── css/style.css           # theme-aware styling (light/dark)
│   ├── js/main.js              # interactive gallery, theme toggle, copy-bibtex
│   ├── images/
│   │   ├── teaser/             # hero rescue grid + per-object cells (6 objects × conditions × rgb/normal)
│   │   ├── qualitative/        # Wonder3D synergy, Era3D six-view, 30-object grid
│   │   └── architecture/       # overview.svg (hand-built pipeline diagram)
│   └── videos/                 # (empty — rotating meshes TODO)
├── README.md
└── LICENSE
```

## Local preview

```bash
cd project_page
python -m http.server 8000
# open http://localhost:8000  (via SSH tunnel if remote)
```

## Assets

All images are model outputs / renders from the paper's figure pipeline
(`paper_draft/fig_b_era3d_final`, `fig_a_wonder3d_synergy`, `fig_era3d_combined_views`,
`fig_wonder3d_combined_30obj`) on the GSO-30 benchmark. The architecture SVG was
authored from `architecture_description.md`.

## TODO before publishing

- [ ] De-anonymize (authors, affiliations, links) once accepted / camera-ready.
- [ ] Add paper + arXiv + code links.
- [ ] Optional: rotating-mesh MP4s under `static/videos/`.
- [ ] Deploy to GitHub Pages.
