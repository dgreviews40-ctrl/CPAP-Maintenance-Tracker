# Icon Generation Instructions

## Current Status

✅ **SVG Icon Created**: `icon.svg` - A professional CPAP tracker icon with:
- Blue background (#0079FF)
- White CPAP machine illustration
- Maintenance wrench indicator
- Green status light

## Generate Favicon Files

To create favicon.ico and other icon formats, use one of these free online tools:

### Option 1: RealFaviconGenerator (Recommended)
1. Go to https://realfavicongenerator.net/
2. Upload `public/icon.svg`
3. Download the generated favicon package
4. Extract and place files in the `public/` directory

### Option 2: Favicon.io
1. Go to https://favicon.io/favicon-converter/
2. Upload `public/icon.svg`
3. Download the generated icons
4. Place in the `public/` directory

### Option 3: Manual Conversion
If you have ImageMagick or similar tools installed:

```bash
# Convert SVG to ICO
convert icon.svg -define icon:auto-resize=16,32,48,64,256 favicon.ico

# Convert SVG to PNG (various sizes)
convert icon.svg -resize 512x512 icon-512.png
convert icon.svg -resize 192x192 icon-192.png
convert icon.svg -resize 180x180 apple-touch-icon.png
```

## Files Needed

- `favicon.ico` - Main favicon (16x16, 32x32, 48x48)
- `icon-192.png` - Android icon
- `icon-512.png` - High-res icon
- `apple-touch-icon.png` - iOS icon (180x180)

## Icon Design

The icon represents:
- **Blue Background**: Trust and reliability
- **CPAP Machine**: Main subject
- **Wrench**: Maintenance focus
- **Green Light**: System status indicator

