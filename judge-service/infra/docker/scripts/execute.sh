#!/bin/bash
set -u

LANGUAGE="${1,,}"
TIMEOUT_DURATION="${2:-3s}"
INPUT_FILE="/workspace/input.txt"
OUTPUT_FILE="/workspace/output.txt"
ERROR_FILE="/workspace/error.txt"
METRICS_FILE="/workspace/metrics.txt"

case "$LANGUAGE" in
  c|cpp|c++) COMMAND=(/workspace/solution) ;;
  java) COMMAND=(java -Xmx192m -Xss8m -Dfile.encoding=UTF-8 -cp /workspace Main) ;;
  python|python3) COMMAND=(python3 -I -u /workspace/solution.py) ;;
  javascript|js) COMMAND=(node --max-old-space-size=192 /workspace/solution.js) ;;
  *)
    echo "__OJ_VERDICT__:RE" >&2
    echo "Unsupported language: $LANGUAGE" >&2
    exit 1
    ;;
esac

timeout --signal=KILL "$TIMEOUT_DURATION" /usr/bin/time -f "__OJ_MEMORY_KB__:%M\n__OJ_EXEC_SECONDS__:%e" -o "$METRICS_FILE" \
  "${COMMAND[@]}" <"$INPUT_FILE" >"$OUTPUT_FILE" 2>"$ERROR_FILE"
EXIT_CODE=$?

if [ -f "$METRICS_FILE" ]; then cat "$METRICS_FILE" >&2; fi

if [ "$EXIT_CODE" -eq 124 ] || [ "$EXIT_CODE" -eq 137 ]; then
  echo "__OJ_VERDICT__:TLE" >&2
  echo "Execution exceeded ${TIMEOUT_DURATION}." >&2
  exit 124
fi
if [ "$EXIT_CODE" -ne 0 ]; then
  echo "__OJ_VERDICT__:RE" >&2
  cat "$ERROR_FILE" >&2
  exit 1
fi
cat "$OUTPUT_FILE"
exit 0
