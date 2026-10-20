"""Generate the social preview images (Open Graph cards) for the site.

LinkedIn, Slack, iMessage and others show these when a link is shared.
Each image is 1200x630 and echoes the homepage's yellow folder design.

Run from the repo root after adding or retitling a Deep Read:

    python3 scripts/og-images.py

Writes public/og/<name>.png and public/assets/itk-logo.png. Needs Python 3 with Pillow (pip install pillow).
"""
import re
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'og'
FONTS = ROOT / 'scripts' / 'fonts'
ARTICLES = ROOT / 'src' / 'content' / 'deep-reads'

W, H = 1200, 630
SCALE = 2  # draw at 2x, then downsample for smooth edges

CANVAS = (253, 252, 250)  # --canvas #FDFCFA
YELLOW = (252, 243, 135)  # --hero-yellow #FCF387
INK = (26, 26, 26)  # --deep-ink #1A1A1A
SECONDARY = (98, 95, 90)  # --secondary-copy #625F5A

# Pages that aren't Deep Reads: name -> (kicker, title)
PAGES = {
    'home': ('', 'Own the positioning that scales everything.'),
    'contact': ('', 'Let’s talk about your positioning.'),
    'deep-reads': ('Deep Reads', 'Go a little deeper. If you dare.'),
    'category-leadership': ('', 'You don’t create category leadership by being a little bit better.'),
}


# --- Minimal SVG path rendering (enough for the logo and folder tab) ------------

def _tokens(d):
    return re.findall(r'[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?', d)


def _subpaths(d, steps=24):
    """Flatten an SVG path into polygons. Supports M L H V C Q Z (absolute)."""
    toks = _tokens(d)
    polys, cur, i = [], [], 0
    x = y = 0.0
    cmd = None

    def num():
        nonlocal i
        i += 1
        return float(toks[i - 1])

    while i < len(toks):
        if re.fullmatch(r'[A-Za-z]', toks[i]):
            cmd = toks[i]
            i += 1
        if cmd == 'M':
            if cur:
                polys.append(cur)
            x, y = num(), num()
            cur = [(x, y)]
            cmd = 'L'
        elif cmd == 'L':
            x, y = num(), num()
            cur.append((x, y))
        elif cmd == 'H':
            x = num()
            cur.append((x, y))
        elif cmd == 'V':
            y = num()
            cur.append((x, y))
        elif cmd == 'C':
            x1, y1, x2, y2, x3, y3 = (num() for _ in range(6))
            for s in range(1, steps + 1):
                t = s / steps
                mt = 1 - t
                cur.append((
                    mt**3 * x + 3 * mt**2 * t * x1 + 3 * mt * t**2 * x2 + t**3 * x3,
                    mt**3 * y + 3 * mt**2 * t * y1 + 3 * mt * t**2 * y2 + t**3 * y3,
                ))
            x, y = x3, y3
        elif cmd == 'Q':
            x1, y1, x2, y2 = (num() for _ in range(4))
            for s in range(1, steps + 1):
                t = s / steps
                mt = 1 - t
                cur.append((mt**2 * x + 2 * mt * t * x1 + t**2 * x2, mt**2 * y + 2 * mt * t * y1 + t**2 * y2))
            x, y = x2, y2
        elif cmd in ('Z', 'z'):
            if cur:
                polys.append(cur)
                x, y = cur[0]
            cur = []
        else:
            raise ValueError(f'Unsupported SVG path command: {cmd}')
    if cur:
        polys.append(cur)
    return polys


def render_svg(path, width):
    """Rasterise a simple single-colour SVG to an RGBA image `width` px wide."""
    svg = Path(path).read_text()
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', svg).group(1).split()]
    k = width / vb[2]
    size = (round(vb[2] * k), round(vb[3] * k))
    out = Image.new('RGBA', size, (0, 0, 0, 0))
    for attrs in re.findall(r'<path ([^>]*)>', svg):
        d = re.search(r'\bd="([^"]*)"', attrs).group(1)
        fill = re.search(r'fill="#([0-9a-fA-F]{6})"', attrs).group(1)
        rgb = tuple(int(fill[j:j + 2], 16) for j in (0, 2, 4))
        mask = Image.new('1', size, 0)
        for poly in _subpaths(d):
            layer = Image.new('1', size, 0)
            ImageDraw.Draw(layer).polygon([((px - vb[0]) * k, (py - vb[1]) * k) for px, py in poly], fill=1)
            mask = ImageChops.logical_xor(mask, layer)  # even-odd: letter counters stay open
        out.paste(Image.new('RGBA', size, rgb + (255,)), (0, 0), mask.convert('L'))
    return out


# --- Type ------------------------------------------------------------------------------

def fraunces(size):
    font = ImageFont.truetype(str(FONTS / 'Fraunces.ttf'), size)
    axes = {a['name']: a for a in font.get_variation_axes()}
    values = []
    for name in axes:
        values.append({b'Optical Size': 48, b'Weight': 320, b'Softness': 0, b'Wonky': 1}.get(name, axes[name]['default']))
    font.set_variation_by_axes(values)
    return font


def dm_sans(size, weight=400):
    font = ImageFont.truetype(str(FONTS / 'DMSans.ttf'), size)
    axes = {a['name']: a for a in font.get_variation_axes()}
    font.set_variation_by_axes([{b'Optical size': 14, b'Weight': weight}.get(n, axes[n]['default']) for n in axes])
    return font


def wrap(draw, text, font, max_width):
    lines, line = [], ''
    for word in text.split():
        trial = f'{line} {word}'.strip()
        if draw.textlength(trial, font=font) <= max_width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


def card(kicker, title, footer, out_path):
    s = SCALE
    img = Image.new('RGB', (W * s, H * s), CANVAS)
    draw = ImageDraw.Draw(img)

    # Folder: tab (with the logo) sitting on a rounded yellow panel.
    margin, top = 36 * s, 96 * s
    draw.rounded_rectangle((margin, top, W * s - margin, H * s - margin), radius=28 * s, fill=YELLOW)
    tab = render_svg(ROOT / 'public/assets/hero-yellow-tab.svg', 330 * s)
    img.paste(tab, (margin + 4 * s, top - tab.height + 2 * s), tab)
    logo = render_svg(ROOT / 'public/assets/itk-logo.svg', 196 * s)
    img.paste(logo, (margin + 4 * s + (tab.width - logo.width) // 2, top - tab.height + (tab.height - logo.height) // 2 + 6 * s), logo)

    # Title: largest size that fits in four lines.
    left, right = 92 * s, W * s - 92 * s
    text_top = top + (112 if kicker else 86) * s
    bottom_limit = H * s - margin - 92 * s
    for size in range(92, 46, -2):
        font = fraunces(size * s)
        lines = wrap(draw, title, font, right - left)
        line_h = round(size * s * 1.0)
        if len(lines) <= 4 and text_top + line_h * len(lines) <= bottom_limit:
            break

    if kicker:
        kfont = dm_sans(20 * s, 600)
        x = left
        for ch in kicker.upper():
            draw.text((x, top + 62 * s), ch, font=kfont, fill=INK)
            x += draw.textlength(ch, font=kfont) + 2.4 * s

    y = text_top
    for line in lines:
        draw.text((left, y), line, font=font, fill=INK)
        y += line_h

    draw.text((left, H * s - margin - 62 * s), footer, font=dm_sans(24 * s), fill=SECONDARY)

    img = img.resize((W, H), Image.LANCZOS)
    OUT.mkdir(parents=True, exist_ok=True)
    img.save(out_path, optimize=True)
    print('wrote', out_path.relative_to(ROOT))


def frontmatter_title(path):
    m = re.search(r'^title:\s*"(.*)"\s*$', path.read_text(encoding='utf-8'), re.M)
    return m.group(1).replace('\\"', '"')


if __name__ == '__main__':
    # Raster logo for search engines' structured data (they don't take SVG).
    logo = render_svg(ROOT / 'public/assets/itk-logo.svg', 600)
    logo.save(ROOT / 'public/assets/itk-logo.png', optimize=True)
    print('wrote public/assets/itk-logo.png')
    for name, (kicker, title) in PAGES.items():
        card(kicker, title, 'In The Kitchen · Positioning for B2B tech', OUT / f'{name}.png')
    for md in sorted(ARTICLES.glob('*.md')):
        card('Deep Reads', frontmatter_title(md), 'Jon Itkin · In The Kitchen', OUT / f'{md.stem}.png')
