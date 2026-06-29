# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This workspace contains a comprehensive Spanish-language guide: **"Optimización Profesional de la Ficha de Producto en Amazon KDP"** — a detailed manual covering all aspects of optimizing book product listings on Amazon's Kindle Direct Publishing platform for novelists.

**Document Type:** Technical/operational reference guide (not a code repository)  
**Language:** Spanish  
**Primary Audience:** Self-publishing authors and novelists

## Content Structure

The guide is organized into eight major sections:

1. **Ecosystem of Metadata and Account Configuration** — Legal requirements, account setup, metadata structure
2. **Physical Formatting and Print Sizes** — PDF specifications, margins, cover design calculations, file requirements
3. **Digital eBook Quality Assurance** — EPUB formatting, CSS best practices, content validation rules
4. **Keyword Strategy Algorithm** — 7-keyword search optimization, niche research, indexing techniques
5. **Classification and 3-Category System** — Category selection rules, dynamic categorization, penalties for miscategorization
6. **Persuasive Synopsis Writing** — Copywriting structure, emotional engagement, HTML formatting for descriptions
7. **Visual Optimization and A+ Content** — Image specifications, multi-module design, accessibility guidelines
8. **Algorithmic Safety and Risk Mitigation** — Review manipulation prevention, IP compliance, AI disclosure requirements

## Key Technical Specifications (Reference)

### Print Format Dimensions
- 4.25" × 6.87" (10.795 × 17.45 cm) — Trade format; standard for novels >200 pages
- 5" × 8" (12.7 × 20.32 cm) — Standard for novels <200 pages
- Margin tables for interior files keyed to page count (24–828 pages)
- Spine thickness calculation: white paper = 0.0625 mm/page; cream paper = 0.0711 mm/page

### Digital Asset Specs
- eBook cover: 2560 × 3840 pixels, RGB, 300 DPI minimum (JPEG)
- A+ content images: 72 DPI minimum (300 DPI recommended), max 2 MB per file
- Alt text mandatory for all images (accessibility requirement)

### Policy Constraints
- Exactly 3 categories (strict limit); automated reclassification if miscategorized
- 7 search keywords (no tildes in Spanish; avoid plurals/punctuation variants)
- No external URLs, phone numbers, or email addresses in description
- HTML tags permitted in synopsis: `<b>`, `<i>`, `<u>`, `<br>`, `<p>`, `<ul>`, `<li>`

## Working with This Document

When maintaining or extending this guide:

- **Citations:** All claims reference numbered sources (1–38) at the end. Verify sources before major updates; some sources are Reddit discussions and may shift in relevance.
- **Tables:** Keep two-column and multi-column tables aligned with markdown syntax; embedded images are base64-encoded PNG diagrams.
- **Terminology:** Maintain Spanish terminology where it reflects official KDP language (e.g., "medianil" for gutter margin, "sangría" for bleed).
- **Specificity:** Include pixel/millimeter measurements and platform-specific thresholds; generic advice is less useful than precise technical bounds.
- **Audience Level:** Assume readers are novelists with little prior publishing experience but willingness to engage with technical detail.

## Updates and Maintenance Notes

- **Last verified:** References and policies are current as of 2025 (see date references in sources)
- **Amazon KDP Policy:** Policies shift quarterly; prioritize official KDP documentation (sources 3, 6, 7, 9, 10, 12, 18, 22, 25) over third-party reinterpretation
- **Category System:** Major overhaul occurred when Amazon transitioned from 10-category to 3-category system; backlog of older articles reference obsolete workflows
- **A+ Content Access:** Gated feature—authors must meet sales/review thresholds to unlock (not noted in this guide but relevant for readers attempting implementation)

## Common Questions

**Q: Should I translate this for non-Spanish speakers?**  
A: The guide is written for a Spanish-language audience. Translation should preserve metric/imperial conversions (already provided in tables) and technical KDP terminology. Translator should be familiar with KDP platform layout.

**Q: Are embedded image diagrams critical?**  
A: The base64-encoded PNG diagrams in the "Obras citadas" section are placeholder references. They do not render in standard markdown viewers. If regenerating, replace with actual dimension diagrams or remove if context is clear from surrounding text.

**Q: Which sections change most frequently?**  
A: Sections 4 (keyword algorithm) and 8 (policy/AI disclosure) are most volatile. The 3-category system (Section 5) is stable post-2023. Physical specs (Section 2) rarely change.
