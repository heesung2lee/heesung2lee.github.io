"""Extract inline <script> blocks (no src) from HTML for node --check."""
import os
import re
import sys


def main():
    """Extract inline script blocks to output directory."""
    try:
        with open(sys.argv[1], encoding="utf-8") as handle:
            html = handle.read()
    except (OSError, IndexError) as err:
        print(f"input error: {err}")
        sys.exit(1)
    try:
        outdir = sys.argv[2]
    except IndexError:
        print("usage: extract_inline.py INPUT.html OUTDIR")
        sys.exit(1)
    try:
        os.makedirs(outdir, exist_ok=True)
    except OSError as err:
        print(f"mkdir error: {err}")
        sys.exit(1)
    count = 0
    for match in re.finditer(r"<script(?:\s[^>]*)?>", html):
        if "src=" in match.group(0):
            continue
        end = html.find("</script>", match.end())
        body = html[match.end():end]
        if body.strip():
            try:
                with open(f"{outdir}/block{count}.js", "w",
                          encoding="utf-8") as handle:
                    handle.write(body)
            except OSError as err:
                print(f"write error: {err}")
                sys.exit(1)
            count += 1
    print(f"extracted {count} blocks")


if __name__ == "__main__":
    main()
