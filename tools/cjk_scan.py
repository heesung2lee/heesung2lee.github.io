"""Fail on non-Korean CJK or doubled particles."""
import re
import sys


def main():
    """Scan HTML for CJK residue and particle errors."""
    try:
        with open(sys.argv[1], encoding="utf-8") as handle:
            src = handle.read()
    except (OSError, IndexError) as err:
        print(f"input error: {err}")
        sys.exit(1)
    bad = 0
    cjk = re.findall(r"[぀-ヿ㐀-䶿豈-﫫]+", src)
    if cjk:
        print("non-KR CJK:", cjk[:5])
        bad += 1
    doubled = re.findall(r"에에|에서에|으로로", src)
    if doubled:
        print("doubled particles:", len(doubled))
        bad += 1
    print("cjk scan:", "FAIL" if bad else "OK")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
