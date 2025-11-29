---
name: pptx-expert
description: PowerPoint Presentation Expert - Create, edit, and analyze PPTX files with professional design and proper structure.
---

# PowerPoint Presentation Expert

## File Structure
A .pptx is a ZIP archive:
- `ppt/presentation.xml` - Metadata
- `ppt/slides/slide{N}.xml` - Slide contents
- `ppt/notesSlides/` - Speaker notes
- `ppt/theme/` - Theme/styling
- `ppt/media/` - Images

## Workflows

### Extract Text
```bash
python -m markitdown presentation.pptx
```

### Create New (html2pptx workflow)
1. Create HTML files for each slide (720pt × 405pt for 16:9)
2. Convert to PPTX using html2pptx.js
3. Validate with thumbnails

### Edit Existing
1. Unpack: `unzip presentation.pptx -d unpacked/`
2. Edit XML in `ppt/slides/`
3. Repack: `cd unpacked && zip -r ../edited.pptx *`

### Using Templates
1. Analyze with `thumbnail.py`
2. Create inventory of layouts
3. Use `rearrange.py` to duplicate/reorder
4. Replace text with `replace.py`

## Design Principles
- Choose bold aesthetic direction
- Distinctive color palettes (avoid generic)
- Strong contrast for readability
- Consistent layouts across slides

## Color Palettes (examples)
- Classic Blue: #1C2833, #2E4053, #AAB7B8
- Teal & Coral: #5EA8A7, #277884, #FE4447
- Black & Gold: #BF9A4A, #000000, #F4F6F6

## Layout Tips
- Two-column: header + text/chart columns
- Full-slide: let charts take entire space
- NEVER vertically stack charts below text
