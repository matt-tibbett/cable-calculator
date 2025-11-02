import os
from pathlib import Path
import re

def build():
    base_dir = Path(__file__).resolve().parent
    dist_dir = base_dir.parent / "dist"
    os.makedirs(dist_dir, exist_ok=True)

    html_path = base_dir / "index.html"
    css_path = base_dir / "style.css"
    js_path = base_dir / "script.js"

    html = html_path.read_text(encoding="utf-8")
    css = css_path.read_text(encoding="utf-8")
    js = js_path.read_text(encoding="utf-8")

    # --- Replace <link ...style.css...> with inline <style> ---
    html = re.sub(
        r'<link\s+[^>]*href=["\']style\.css["\'][^>]*>',
        f"<style>\n{css}\n</style>",
        html,
        flags=re.IGNORECASE
    )

    # --- Replace <script src="script.js"></script> with inline JS ---
    html = re.sub(
        r'<script\s+[^>]*src=["\']script\.js["\'][^>]*>\s*</script>',
        f"<script>\n{js}\n</script>",
        html,
        flags=re.IGNORECASE
    )

    # Write final single-file build
    out_path = dist_dir / "index.html"
    out_path.write_text(html, encoding="utf-8")
    print(f"✅ Build complete! File written → {out_path}")

if __name__ == "__main__":
    build()
