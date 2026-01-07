#!/usr/bin/env python3
"""Fix curly quotes in markdown files that break Nunjucks parsing."""

import sys
from pathlib import Path

def fix_curly_quotes(filepath):
    p = Path(filepath)
    content = p.read_text(encoding='utf-8')

    # Replace curly quotes with straight single quotes
    # Left double curly quote: U+201C
    # Right double curly quote: U+201D
    fixed = content.replace('\u201c', "'").replace('\u201d', "'")

    if fixed != content:
        p.write_text(fixed, encoding='utf-8')
        print(f"Fixed curly quotes in {filepath}")
    else:
        print(f"No curly quotes found in {filepath}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: fix-curly-quotes.py <file>")
        sys.exit(1)
    fix_curly_quotes(sys.argv[1])
