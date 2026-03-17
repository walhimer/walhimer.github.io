#!/usr/bin/env python3
"""Inline external libraries into installation HTML files for self-contained archive."""
import re
import os

DIST = os.path.dirname(os.path.abspath(__file__))
INST = os.path.join(DIST, 'installations')

def extract_p5():
    with open(os.path.join(INST, 'technical-drawing.html'), 'r') as f:
        content = f.read()
    scripts = re.findall(r'<script[^>]*>([\s\S]*?)</script>', content)
    return scripts[0]  # p5.js

def process_surrender_machines(p5_js):
    path = os.path.join(INST, 'surrender-machines.html')
    with open(path, 'r') as f:
        content = f.read()
    # Remove p5 CDN (cdn.jsdelivr.net or cdnjs)
    content = re.sub(r'  <!-- p5\.js via CDN -->\s*\n  <script src="[^"]+"></script>\s*\n', '', content)
    # Remove existing inline p5 (from prior run — wrong version)
    content = re.sub(r'\s*<script>\s*\n/\*! p5\.js[\s\S]*?</script>\s*\n', '', content)
    # Remove Google Fonts
    content = re.sub(r'  <!-- Fonts -->\s*\n  <link rel="preconnect"[^>]+>\s*\n  <link rel="preconnect"[^>]+>\s*\n  <link href="[^"]+"[^>]+>\s*\n', '', content)
    # Replace font families
    content = content.replace("font-family: 'Cormorant Garamond', Georgia, serif;", "font-family: Georgia, 'Times New Roman', serif;")
    content = content.replace("font-family: 'IBM Plex Mono', monospace;", "font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;")
    # Add inline p5 1.11.11 before </head>
    content = content.replace('</head>', '<script>\n' + p5_js + '\n</script>\n</head>')
    with open(path, 'w') as f:
        f.write(content)
    print('Updated surrender-machines.html')

def process_traveling_landscape(p5_js):
    path = os.path.join(INST, 'traveling-landscape.html')
    with open(path, 'r') as f:
        content = f.read()
    # Remove p5 CDN
    content = re.sub(r'  <script src="https://cdnjs\.cloudflare\.com/ajax/libs/p5\.js/[^"]+"></script>\s*\n', '', content)
    # Remove Google Fonts
    content = re.sub(r'  <link rel="preconnect" href="https://fonts\.googleapis\.com" />\s*\n  <link rel="preconnect" href="https://fonts\.gstatic\.com" crossorigin />\s*\n  <link href="https://fonts\.googleapis\.com/css2[^"]+" rel="stylesheet" />\s*\n', '', content)
    content = content.replace("font-family: 'Cormorant Garamond', Georgia, serif;", "font-family: Georgia, 'Times New Roman', serif;")
    content = content.replace("font-family: 'IBM Plex Mono', monospace;", "font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;")
    # Add inline p5 before </head>
    content = content.replace('</head>', '<script>\n' + p5_js + '\n</script>\n</head>')
    with open(path, 'w') as f:
        f.write(content)
    print('Updated traveling-landscape.html')

def process_bloom_four_walls(three_js):
    path = os.path.join(INST, 'bloom-four-walls.html')
    with open(path, 'r') as f:
        content = f.read()
    content = content.replace(
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>',
        '<script>\n' + three_js + '\n</script>'
    )
    with open(path, 'w') as f:
        f.write(content)
    print('Updated bloom-four-walls.html')

def process_bloom_release(tone_js):
    path = os.path.join(INST, 'bloom-release.html')
    with open(path, 'r') as f:
        content = f.read()
    content = content.replace(
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js"></script>',
        '<script>\n' + tone_js + '\n</script>'
    )
    with open(path, 'w') as f:
        f.write(content)
    print('Updated bloom-release.html')

def main():
    import urllib.request

    print('Extracting p5.js from technical-drawing.html...')
    p5_js = extract_p5()
    print(f'  p5.js (v1.7.0): {len(p5_js):,} chars')

    # Surrender Machines requires p5.js 1.11.11 — v1.7.0 breaks the sketch
    print('Loading p5.js 1.11.11 for surrender-machines...')
    p5_1111_url = 'https://cdn.jsdelivr.net/npm/p5@1.11.11/lib/p5.min.js'
    p5_1111_path = '/tmp/p5-1.11.11.min.js'
    p5_1111_js = None
    if os.path.exists(p5_1111_path):
        with open(p5_1111_path, 'r') as f:
            p5_1111_js = f.read()
    if not p5_1111_js:
        try:
            with urllib.request.urlopen(p5_1111_url) as r:
                p5_1111_js = r.read().decode()
        except Exception:
            import subprocess
            subprocess.run(['curl', '-sL', p5_1111_url, '-o', p5_1111_path], check=True)
            with open(p5_1111_path, 'r') as f:
                p5_1111_js = f.read()
    print(f'  p5.js (v1.11.11): {len(p5_1111_js):,} chars')

    print('Loading Three.js...')
    three_paths = [
        os.path.expanduser('~/.cursor/projects/var-folders-t9-xdfmvz4x5b54dysx97vw8-lw0000gn-T-5bed3e4d-352e-4fc9-8980-d4da51b65470/agent-tools/3801840e-895b-4a56-923c-1aed64255252.txt'),
    ]
    three_js = None
    for p in three_paths:
        if os.path.exists(p):
            with open(p, 'r') as f:
                three_js = f.read()
            break
    if not three_js:
        url = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
        with urllib.request.urlopen(url) as r:
            three_js = r.read().decode()
    print(f'  Three.js: {len(three_js):,} chars')

    print('Loading Tone.js...')
    tone_paths = [
        os.path.expanduser('~/.cursor/projects/var-folders-t9-xdfmvz4x5b54dysx97vw8-lw0000gn-T-5bed3e4d-352e-4fc9-8980-d4da51b65470/agent-tools/f59df8d6-cc67-4366-9ca0-17f7bdb08dbf.txt'),
    ]
    tone_js = None
    for p in tone_paths:
        if os.path.exists(p):
            with open(p, 'r') as f:
                tone_js = f.read()
            break
    if not tone_js:
        url = 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js'
        with urllib.request.urlopen(url) as r:
            tone_js = r.read().decode()
    print(f'  Tone.js: {len(tone_js):,} chars')

    process_surrender_machines(p5_1111_js)
    process_traveling_landscape(p5_js)
    process_bloom_four_walls(three_js)
    process_bloom_release(tone_js)
    process_living_commons(p5_js)
    print('Done.')

def process_living_commons(p5_js):
    path = os.path.join(INST, 'living-commons.html')
    sketch_path = os.path.join(DIST, 'sketches', 'living-commons-artwork.html')
    with open(sketch_path, 'r') as f:
        artwork = f.read()
    # Extract sketch script (second script tag - the main sketch)
    scripts = re.findall(r'<script[^>]*>([\s\S]*?)</script>', artwork)
    sketch = scripts[1] if len(scripts) > 1 else ''
    if not sketch or 'function setup' not in sketch:
        print('  Could not extract living-commons sketch')
        return
    # Adapt setup to use container
    sketch = sketch.replace(
        "createCanvas(windowWidth, windowHeight);",
        """var c=document.getElementById('commons-canvas');
  var w=c?c.offsetWidth:800; var h=c?c.offsetHeight:450;
  var cnv=createCanvas(w,h);
  if(c) cnv.parent('commons-canvas');"""
    )
    sketch = sketch.replace(
        "document.getElementById('stat-lights').textContent        = lights.length;",
        "var sl=document.getElementById('stat-lights');if(sl)sl.textContent=lights.length;"
    )
    sketch = sketch.replace(
        "document.getElementById('stat-contributions').textContent = totalContributions;",
        "var sc=document.getElementById('stat-contributions');if(sc)sc.textContent=totalContributions;"
    )
    sketch = sketch.replace(
        "document.getElementById('stat-shapes').textContent        = shapes.length;",
        "var ss=document.getElementById('stat-shapes');if(ss)ss.textContent=shapes.length;"
    )
    sketch = sketch.replace(
        "document.getElementById('stat-cooperators').textContent   = currentCooperators;",
        "var sco=document.getElementById('stat-cooperators');if(sco)sco.textContent=currentCooperators;"
    )
    sketch = sketch.replace(
        """function showMessage(text) {
      let el = document.getElementById('message');
      el.textContent = text;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 3500);
    }""",
        """function showMessage(text) {
      var el = document.getElementById('message');
      if (el) { el.textContent = text; el.classList.add('show');
        setTimeout(function(){el.classList.remove('show');}, 3500); }
    }"""
    )
    sketch = sketch.replace(
        "function windowResized() {\n      resizeCanvas(windowWidth, windowHeight);\n    }",
        """function windowResized() {
      var c=document.getElementById('commons-canvas');
      if(c) resizeCanvas(c.offsetWidth, c.offsetHeight);
    }"""
    )
    with open(path, 'r') as f:
        content = f.read()
    # Add p5 + sketch before the scroll reveal script
    inject = '<script>\n' + p5_js + '\n</script>\n<script>\n' + sketch + '\n</script>\n'
    content = content.replace(
        '  <script>\n    // Scroll reveal',
        inject + '  <script>\n    // Scroll reveal'
    )
    with open(path, 'w') as f:
        f.write(content)
    print('Updated living-commons.html')
