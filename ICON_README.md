# App Icon Generation

## Quick Method (Online):

1. Go to: https://realfavicongenerator.net/
2. Upload `icon.svg`
3. Generate icons
4. Download and extract
5. Use `icon-192.png` and `icon-512.png`

## OR Use ImageMagick (if installed):

```bash
# Generate 192x192
convert icon.svg -resize 192x192 icon-192.png

# Generate 512x512
convert icon.svg -resize 512x512 icon-512.png
```

## OR Manual (Figma/Photoshop):

1. Open icon.svg in Figma/Photoshop
2. Export as PNG:
   - 192×192px
   - 512×512px
3. Save as `icon-192.png` and `icon-512.png`

Place both PNG files in the root directory.
