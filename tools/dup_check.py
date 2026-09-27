"""Fail if the same function is defined in index.html AND a module."""
import re
import sys


def main():
    """Check top-level duplicate function definitions across files."""
    files = sys.argv[1:]
    defs = {}
    for fname in files:
        try:
            with open(fname, encoding="utf-8") as handle:
                src = handle.read()
        except FileNotFoundError:
            continue
        depth = 0
        for match in re.finditer(
            r"^(\s*)function ([A-Za-z_][A-Za-z0-9_]*)|([{}])",
            src,
            re.M,
        ):
            if match.group(3) == "{":
                depth += 1
            elif match.group(3) == "}":
                depth = max(0, depth - 1)
            elif match.group(2) and not match.group(1):
                # column 0 = top-level definition
                defs.setdefault(match.group(2), []).append(fname)
    bad = 0
    for name, locs in defs.items():
        if "index.html" in locs and len(locs) > 1:
            print(f"DUP: {name} in {locs}")
            bad += 1
            continue
        mods = {loc for loc in locs if loc != "index.html"}
        if len(mods) > 1:
            print(f"DUP across modules: {name} in {sorted(mods)}")
            bad += 1
    print("duplicate check:", "FAIL" if bad else "OK")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
