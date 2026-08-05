function escapeStr(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

export function wrapCodeWithHarness({ code, language, problemId, stdin = "" }) {
  if (!code) return code;
  const normLang = (language || "").toLowerCase().trim();
  const safeStdin = escapeStr(stdin);

  // If user code ALREADY provides a standalone main entry point, run directly without wrapping
  if (
    code.includes("if __name__ == '__main__':") ||
    code.includes("if __name__=='__main__':") ||
    code.includes("process.stdin") ||
    code.includes("sys.stdin.read") ||
    code.includes("int main()") ||
    code.includes("int main(") ||
    code.includes("public static void main(")
  ) {
    return code;
  }

  // Problem: two-sum (or default problem harness)
  if (problemId === "two-sum" || !problemId) {
    if (normLang === "python" || normLang === "python3" || normLang === "py") {
      return `${code}

import json, sys

def _run_harness():
    stdin_raw = "${safeStdin}".strip()
    nums = [2, 7, 11, 15]
    target = 9
    if stdin_raw and "nums = " in stdin_raw:
        try:
            parts = stdin_raw.split("target = ")
            nums_part = parts[0].replace("nums = ", "").strip().rstrip(",")
            nums = json.loads(nums_part)
            target = int(parts[1].strip())
        except Exception:
            pass
    elif stdin_raw:
        try:
            data = json.loads(stdin_raw)
            if isinstance(data, list) and len(data) == 2:
                nums, target = data[0], data[1]
        except Exception:
            pass

    sol = Solution() if 'Solution' in globals() else None
    if sol and hasattr(sol, 'twoSum'):
        res = sol.twoSum(nums, target)
        print(json.dumps(res))
    elif 'twoSum' in globals():
        res = twoSum(nums, target)
        print(json.dumps(res))

if __name__ == '__main__':
    _run_harness()
`;
    }

    if (normLang === "javascript" || normLang === "js") {
      return `${code}

(function _runHarness() {
  let nums = [2, 7, 11, 15];
  let target = 9;
  const stdinRaw = "${safeStdin}".trim();
  if (stdinRaw && stdinRaw.includes("nums = ")) {
    try {
      const parts = stdinRaw.split("target = ");
      const numsPart = parts[0].replace("nums = ", "").trim().replace(/,$/, "");
      nums = JSON.parse(numsPart);
      target = parseInt(parts[1].trim(), 10);
    } catch (e) {}
  }

  if (typeof twoSum === "function") {
    const res = twoSum(nums, target);
    console.log(JSON.stringify(res));
  } else if (typeof Solution === "function") {
    const sol = new Solution();
    if (typeof sol.twoSum === "function") {
      console.log(JSON.stringify(sol.twoSum(nums, target)));
    }
  }
})();
`;
    }

    if (normLang === "cpp" || normLang === "c++") {
      return `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
using namespace std;

${code}

int main() {
    string raw = "${safeStdin}";
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;

    size_t targetPos = raw.find("target = ");
    if (targetPos != string::npos) {
        string targetStr = raw.substr(targetPos + 9);
        try { target = stoi(targetStr); } catch(...) {}

        size_t numsPos = raw.find("nums = [");
        if (numsPos != string::npos) {
            size_t endBracket = raw.find("]", numsPos);
            if (endBracket != string::npos) {
                string arrContent = raw.substr(numsPos + 8, endBracket - (numsPos + 8));
                stringstream ss(arrContent);
                nums.clear();
                string val;
                while (getline(ss, val, ',')) {
                    val.erase(remove(val.begin(), val.end(), ' '), val.end());
                    if (!val.empty()) {
                        try { nums.push_back(stoi(val)); } catch(...) {}
                    }
                }
            }
        }
    }

    Solution sol;
    vector<int> res = sol.twoSum(nums, target);
    cout << "[";
    for (size_t i = 0; i < res.size(); ++i) {
        cout << res[i] << (i + 1 < res.size() ? ", " : "");
    }
    cout << "]" << endl;
    return 0;
}
`;
    }

    if (normLang === "java") {
      return `import java.util.*;

${code}

class Harness {
    public static void main(String[] args) {
        String raw = "${safeStdin}";
        int[] nums = new int[]{2, 7, 11, 15};
        int target = 9;

        if (raw.contains("target = ")) {
            try {
                String[] parts = raw.split("target = ");
                target = Integer.parseInt(parts[1].trim());
                String numsStr = parts[0].replace("nums = ", "").trim();
                numsStr = numsStr.replace("[", "").replace("]", "").replace(" ", "");
                String[] valStrs = numsStr.split(",");
                nums = new int[valStrs.length];
                for (int i = 0; i < valStrs.length; i++) {
                    nums[i] = Integer.parseInt(valStrs[i]);
                }
            } catch (Exception e) {}
        }

        Solution sol = new Solution();
        int[] res = sol.twoSum(nums, target);
        System.out.println(Arrays.toString(res));
    }
}
`;
    }
  }

  // Problem: cache-stampede
  if (problemId === "cache-stampede") {
    if (normLang === "python" || normLang === "python3" || normLang === "py") {
      return `${code}

import json

def _run_harness():
    stdin_raw = "${safeStdin}".strip()
    keys = ["a", "b", "a", "c"]
    if stdin_raw and "keys = " in stdin_raw:
        try:
            raw_keys = stdin_raw.replace("keys = ", "").strip()
            raw_keys = raw_keys.replace("[", "[\"").replace("]", "\"]").replace(", ", "\", \"")
            keys = json.loads(raw_keys)
        except Exception:
            pass

    fetches = []
    def dummy_fetch(k):
        msg = f"fetch({k})"
        if msg not in fetches:
            fetches.append(msg)
        return msg

    if 'prevent_cache_stampede' in globals():
        prevent_cache_stampede(keys, dummy_fetch)
        print(", ".join(fetches))

if __name__ == '__main__':
    _run_harness()
`;
    }
  }

  return code;
}
