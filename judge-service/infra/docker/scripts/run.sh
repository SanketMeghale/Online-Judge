#!/bin/bash
# ==============================================================================
# Master Execution & Timeout Monitoring Script
# Supported Languages: python, c, cpp, java
# Arguments: $1 = language, $2 = timeout_seconds (default 2s)
# ==============================================================================

LANGUAGE="${1,,}"
TIMEOUT_SEC="${2:-2}"
INPUT_FILE="/workspace/input.txt"
OUTPUT_FILE="/workspace/output.txt"
ERROR_FILE="/workspace/error.txt"
METRICS_FILE="/workspace/metrics.txt"

# 1. Compilation Phase (C, C++, Java)
if [ "$LANGUAGE" = "c" ]; then
    /opt/judge/scripts/compile_c.sh /workspace/solution.c /workspace/solution 2> "$ERROR_FILE"
    if [ $? -ne 0 ]; then
        echo "__OJ_VERDICT__:CE" >&2
        cat "$ERROR_FILE" >&2
        exit 2
    fi
    EXEC_CMD="/workspace/solution"

elif [ "$LANGUAGE" = "cpp" ] || [ "$LANGUAGE" = "c++" ]; then
    /opt/judge/scripts/compile_cpp.sh /workspace/solution.cpp /workspace/solution 2> "$ERROR_FILE"
    if [ $? -ne 0 ]; then
        echo "__OJ_VERDICT__:CE" >&2
        cat "$ERROR_FILE" >&2
        exit 2
    fi
    EXEC_CMD="/workspace/solution"

elif [ "$LANGUAGE" = "java" ]; then
    /opt/judge/scripts/compile_java.sh /workspace/Solution.java 2> "$ERROR_FILE"
    if [ $? -ne 0 ]; then
        echo "__OJ_VERDICT__:CE" >&2
        cat "$ERROR_FILE" >&2
        exit 2
    fi
    EXEC_CMD="java -Xmx128m -cp /workspace Solution"

elif [ "$LANGUAGE" = "python" ] || [ "$LANGUAGE" = "python3" ]; then
    EXEC_CMD="python3 /workspace/solution.py"

elif [ "$LANGUAGE" = "javascript" ] || [ "$LANGUAGE" = "js" ]; then
    EXEC_CMD="node /workspace/solution.js"

else
    echo "__OJ_VERDICT__:RE" >&2
    echo "Unsupported language: $LANGUAGE" >&2
    exit 1
fi

# 2. Execution Phase with Timeout and Resource Tracking
# Uses GNU time utility to measure execution duration (ms) and peak RSS memory (KB)
START_TIME=$(date +%s%3N)

timeout "$TIMEOUT_SEC" /usr/bin/time -f "__OJ_MEMORY_KB__:%M" -o "$METRICS_FILE" \
    bash -c "$EXEC_CMD < \"$INPUT_FILE\" > \"$OUTPUT_FILE\" 2> \"$ERROR_FILE\""
EXIT_CODE=$?

END_TIME=$(date +%s%3N)
ELAPSED_MS=$((END_TIME - START_TIME))
if [ -f "$METRICS_FILE" ]; then
    cat "$METRICS_FILE" >&2
fi

# 3. Verdict Determination
if [ $EXIT_CODE -eq 124 ]; then
    echo "__OJ_VERDICT__:TLE" >&2
    echo "Time Limit Exceeded (${TIMEOUT_SEC}s)." >&2
    exit 124
elif [ $EXIT_CODE -eq 137 ]; then
    echo "__OJ_VERDICT__:MLE" >&2
    echo "Memory Limit Exceeded." >&2
    exit 137
elif [ $EXIT_CODE -ne 0 ]; then
    echo "__OJ_VERDICT__:RE" >&2
    cat "$ERROR_FILE" >&2
    exit 1
else
    echo "__OJ_RUNTIME_MS__:${ELAPSED_MS}" >&2
    cat "$OUTPUT_FILE"
    exit 0
fi
