#!/bin/bash
set -u

LANGUAGE="${1,,}"
STDOUT_FILE="/workspace/compile_stdout.txt"
STDERR_FILE="/workspace/compile_stderr.txt"
METRICS_FILE="/workspace/compile_metrics.txt"

case "$LANGUAGE" in
  c)
    COMPILER="gcc"
    VERSION=$(gcc -dumpfullversion 2>/dev/null || gcc -dumpversion)
    COMMAND=(gcc -O2 -std=c17 /workspace/solution.c -o /workspace/solution -lm)
    ;;
  cpp|c++)
    COMPILER="g++"
    VERSION=$(g++ -dumpfullversion 2>/dev/null || g++ -dumpversion)
    COMMAND=(g++ -O2 -std=c++20 /workspace/solution.cpp -o /workspace/solution -lm)
    ;;
  java)
    COMPILER="javac"
    VERSION=$(javac -version 2>&1 | awk '{print $2}')
    COMMAND=(javac /workspace/Main.java)
    ;;
  python|python3)
    COMPILER="python3"
    VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    COMMAND=(python3 -m py_compile /workspace/solution.py)
    ;;
  javascript|js)
    COMPILER="node"
    VERSION=$(node --version 2>&1 | sed 's/^v//')
    COMMAND=(node --check /workspace/solution.js)
    ;;
  *)
    echo "Unsupported language: $LANGUAGE" >"$STDERR_FILE"
    COMPILER="unknown"
    VERSION=""
    COMMAND=(false)
    ;;
esac

/usr/bin/time -f "__OJ_COMPILE_SECONDS__:%e" -o "$METRICS_FILE" \
  "${COMMAND[@]}" >"$STDOUT_FILE" 2>"$STDERR_FILE"
STATUS=$?

echo "__OJ_COMPILER__:${COMPILER}" >&2
echo "__OJ_COMPILER_VERSION__:${VERSION}" >&2
if [ -f "$METRICS_FILE" ]; then cat "$METRICS_FILE" >&2; fi
if [ -s "$STDOUT_FILE" ]; then cat "$STDOUT_FILE"; fi
if [ "$STATUS" -ne 0 ]; then
  echo "__OJ_VERDICT__:CE" >&2
  cat "$STDERR_FILE" >&2
  exit 2
fi
exit 0
