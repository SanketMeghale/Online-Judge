#!/bin/bash
# ==============================================================================
# Java Compiler Script
# Usage: ./compile_java.sh <SourceFile.java>
# ==============================================================================

SOURCE_FILE="${1:-Solution.java}"

# Compile Java source code into bytecode
javac "$SOURCE_FILE"

COMPILE_STATUS=$?

if [ $COMPILE_STATUS -ne 0 ]; then
    echo "[CE] Java Compilation failed." >&2
    exit 1
fi

exit 0
