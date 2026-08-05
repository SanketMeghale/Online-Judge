#!/bin/bash
# ==============================================================================
# Master Execution & Timeout Monitoring Script
# Supported Languages: python, c, cpp, java
# Arguments: $1 = language, $2 = timeout_seconds (default 2s)
# ==============================================================================

LANGUAGE="${1,,}"
TIMEOUT_SEC="${2:-2}"
INPUT_FILE="/sandbox/input.txt"
OUTPUT_FILE="/sandbox/output.txt"
ERROR_FILE="/sandbox/error.txt"

# 1. Compilation Phase (C, C++, Java)
if [ "$LANGUAGE" = "c" ]; then
    /sandbox/scripts/compile_c.sh /sandbox/solution.c /sandbox/solution 2> "$ERROR_FILE"
    if [ $? -ne 0 ]; then
        echo "[VERDICT] CE"
        cat "$ERROR_FILE"
        exit 0
    fi
    EXEC_CMD="/sandbox/solution"

elif [ "$LANGUAGE" = "cpp" ] || [ "$LANGUAGE" = "c++" ]; then
    /sandbox/scripts/compile_cpp.sh /sandbox/solution.cpp /sandbox/solution 2> "$ERROR_FILE"
    if [ $? -ne 0 ]; then
        echo "[VERDICT] CE"
        cat "$ERROR_FILE"
        exit 0
    fi
    EXEC_CMD="/sandbox/solution"

elif [ "$LANGUAGE" = "java" ]; then
    /sandbox/scripts/compile_java.sh /sandbox/Solution.java 2> "$ERROR_FILE"
    if [ $? -ne 0 ]; then
        echo "[VERDICT] CE"
        cat "$ERROR_FILE"
        exit 0
    fi
    EXEC_CMD="java -Xmx128m -cp /sandbox Solution"

elif [ "$LANGUAGE" = "python" ] || [ "$LANGUAGE" = "python3" ]; then
    EXEC_CMD="python3 /sandbox/solution.py"

else
    echo "[VERDICT] RE"
    echo "Unsupported language: $LANGUAGE" >&2
    exit 1
fi

# 2. Execution Phase with Timeout and Resource Tracking
# Uses GNU time utility to measure execution duration (ms) and peak RSS memory (KB)
START_TIME=$(date +%s%3N)

timeout "$TIMEOUT_SEC" bash -c "$EXEC_CMD < \"$INPUT_FILE\" > \"$OUTPUT_FILE\" 2> \"$ERROR_FILE\""
EXIT_CODE=$?

END_TIME=$(date +%s%3N)
ELAPSED_MS=$((END_TIME - START_TIME))

# 3. Verdict Determination
if [ $EXIT_CODE -eq 124 ]; then
    echo "[VERDICT] TLE"
    echo "Time Limit Exceeded (${TIMEOUT_SEC}s)." >&2
    exit 0
elif [ $EXIT_CODE -ne 0 ]; then
    echo "[VERDICT] RE"
    cat "$ERROR_FILE"
    exit 0
else
    echo "[VERDICT] OK"
    echo "[RUNTIME] ${ELAPSED_MS}ms"
    cat "$OUTPUT_FILE"
    exit 0
fi
