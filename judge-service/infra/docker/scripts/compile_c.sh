#!/bin/bash
# ==============================================================================
# C Compiler Script
# Usage: ./compile_c.sh <source_file.c> <output_binary>
# ==============================================================================

SOURCE_FILE="${1:-solution.c}"
OUTPUT_BINARY="${2:-solution}"

# Compile C source code with -O2 optimization and warnings enabled
gcc -O2 -Wall -std=c17 "$SOURCE_FILE" -o "$OUTPUT_BINARY" -lm

COMPILE_STATUS=$?

if [ $COMPILE_STATUS -ne 0 ]; then
    echo "[CE] Compilation failed." >&2
    exit 1
fi

exit 0
