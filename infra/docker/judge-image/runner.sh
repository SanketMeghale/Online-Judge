#!/bin/bash
set -e

LANG=$1
FILE=$2

if [ -z "$LANG" ] || [ -z "$FILE" ]; then
  echo "Usage: runner.sh <language> <file_path>"
  exit 1
fi

case "$LANG" in
  python|py)
    python3 "$FILE"
    ;;
  javascript|js)
    node "$FILE"
    ;;
  cpp)
    g++ -O2 "$FILE" -o /tmp/solution_exe
    /tmp/solution_exe
    ;;
  java)
    DIR=$(dirname "$FILE")
    CLASS=$(basename "$FILE" .java)
    javac "$FILE"
    java -cp "$DIR" "$CLASS"
    ;;
  *)
    echo "Unsupported language: $LANG"
    exit 1
    ;;
esac
