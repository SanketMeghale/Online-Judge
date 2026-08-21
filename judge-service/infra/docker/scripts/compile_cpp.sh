#!/bin/bash
# ==============================================================================
# C++ Compiler Script
# Usage: ./compile_cpp.sh <source_file.cpp> <output_binary>
# ==============================================================================

SOURCE_FILE="${1:-solution.cpp}"
OUTPUT_BINARY="${2:-solution}"

# Compile C++ source code with -O2 optimization and C++20 standard
g++ -O2 -Wall -std=c++20 "$SOURCE_FILE" -o "$OUTPUT_BINARY" -lm

COMPILE_STATUS=$?

if [ $COMPILE_STATUS -ne 0 ]; then
    echo "[CE] C++ Compilation failed." >&2
    exit 1
fi

exit 0
