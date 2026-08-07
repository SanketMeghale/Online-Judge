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

  // If user code ALREADY provides a standalone main entry point or stdio read, run directly
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

  const pid = (problemId || "").toLowerCase().trim();

  // ==========================================
  // Problem 1: TWO-SUM
  // ==========================================
  if (pid === "two-sum" || !pid) {
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

  // ==========================================
  // Problem 2: CACHE-STAMPEDE
  // ==========================================
  if (pid === "cache-stampede") {
    if (normLang === "python" || normLang === "python3" || normLang === "py") {
      return `${code}

import json

def _run_harness():
    stdin_raw = "${safeStdin}".strip()
    keys = ["a", "b", "a", "c"]
    if stdin_raw and "keys = " in stdin_raw:
        try:
            raw_keys = stdin_raw.replace("keys = ", "").replace("[", "").replace("]", "").strip()
            keys = [k.strip().replace("'", "").replace('"', '') for k in raw_keys.split(",")]
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
    elif 'Solution' in globals():
        sol = Solution()
        if hasattr(sol, 'preventCacheStampede'):
            res = sol.preventCacheStampede(keys)
            if isinstance(res, list):
                print(", ".join([f"fetch({x})" if not str(x).startswith("fetch(") else str(x) for x in res]))
            else:
                print(", ".join(fetches))

if __name__ == '__main__':
    _run_harness()
`;
    }

    if (normLang === "javascript" || normLang === "js") {
      return `${code}

(async function _runHarness() {
  let keys = ["a", "b", "a", "c"];
  const stdinRaw = "${safeStdin}".trim();
  if (stdinRaw && stdinRaw.includes("keys = ")) {
    try {
      const rawKeys = stdinRaw.replace("keys = ", "").replace(/[\\[\\]]/g, "").trim();
      keys = rawKeys.split(",").map(k => k.trim().replace(/^["']|["']$/g, ""));
    } catch (e) {}
  }

  const fetches = [];
  const dummyFetch = async (k) => {
    const msg = "fetch(" + k + ")";
    if (!fetches.includes(msg)) fetches.push(msg);
    return msg;
  };

  if (typeof preventCacheStampede === "function") {
    await preventCacheStampede(keys, dummyFetch);
    console.log(fetches.join(", "));
  } else if (typeof Solution === "function") {
    const sol = new Solution();
    if (typeof sol.preventCacheStampede === "function") {
      const res = await sol.preventCacheStampede(keys);
      if (Array.isArray(res)) {
        console.log(res.map(x => String(x).startsWith("fetch(") ? x : "fetch(" + x + ")").join(", "));
      } else {
        console.log(fetches.join(", "));
      }
    }
  }
})();
`;
    }
  }

  // ==========================================
  // Problem 3: MERGE-ISLANDS (numIslands2)
  // ==========================================
  if (pid === "merge-islands") {
    if (normLang === "python" || normLang === "python3" || normLang === "py") {
      return `${code}

import json

def _run_harness():
    stdin_raw = "${safeStdin}".strip()
    m, n = 3, 3
    positions = [[0,0],[0,1],[1,2]]
    if stdin_raw:
        try:
            for part in stdin_raw.split(","):
                part = part.strip()
                if part.startswith("m = "):
                    m = int(part.replace("m = ", ""))
                elif part.startswith("n = "):
                    n = int(part.replace("n = ", ""))
            if "positions = " in stdin_raw:
                pos_str = stdin_raw.split("positions = ")[1].strip()
                positions = json.loads(pos_str)
        except Exception:
            pass

    sol = Solution() if 'Solution' in globals() else None
    if sol and hasattr(sol, 'numIslands2'):
        res = sol.numIslands2(m, n, positions)
        print(json.dumps(res))
    elif 'numIslands2' in globals():
        res = numIslands2(m, n, positions)
        print(json.dumps(res))

if __name__ == '__main__':
    _run_harness()
`;
    }

    if (normLang === "javascript" || normLang === "js") {
      return `${code}

(function _runHarness() {
  let m = 3, n = 3, positions = [[0,0],[0,1],[1,2]];
  const stdinRaw = "${safeStdin}".trim();
  if (stdinRaw) {
    try {
      if (stdinRaw.includes("m = ")) {
        m = parseInt(stdinRaw.split("m = ")[1].split(",")[0].trim(), 10);
      }
      if (stdinRaw.includes("n = ")) {
        n = parseInt(stdinRaw.split("n = ")[1].split(",")[0].trim(), 10);
      }
      if (stdinRaw.includes("positions = ")) {
        positions = JSON.parse(stdinRaw.split("positions = ")[1].trim());
      }
    } catch(e) {}
  }

  if (typeof numIslands2 === "function") {
    console.log(JSON.stringify(numIslands2(m, n, positions)));
  } else if (typeof Solution === "function") {
    const sol = new Solution();
    if (typeof sol.numIslands2 === "function") {
      console.log(JSON.stringify(sol.numIslands2(m, n, positions)));
    }
  }
})();
`;
    }
  }

  // ==========================================
  // Problem 4: BINARY-LIFT (TreeAncestor)
  // ==========================================
  if (pid === "binary-lift") {
    if (normLang === "python" || normLang === "python3" || normLang === "py") {
      return `${code}

import json

def _run_harness():
    stdin_raw = "${safeStdin}".strip()
    parent = [-1,0,0,1,1]
    node, k = 4, 2
    if stdin_raw:
        try:
            if "parent = " in stdin_raw:
                p_part = stdin_raw.split("parent = ")[1].split(", query")[0].strip()
                parent = json.loads(p_part)
            if "query = " in stdin_raw:
                q_part = stdin_raw.split("query = ")[1].strip().replace("(", "[").replace(")", "]")
                q = json.loads(q_part)
                node, k = q[0], q[1]
        except Exception:
            pass

    n = len(parent)
    if 'TreeAncestor' in globals():
        obj = TreeAncestor(n, parent)
        if hasattr(obj, 'getKthAncestor'):
            res = obj.getKthAncestor(node, k)
            print(res)

if __name__ == '__main__':
    _run_harness()
`;
    }

    if (normLang === "javascript" || normLang === "js") {
      return `${code}

(function _runHarness() {
  let parent = [-1,0,0,1,1];
  let node = 4, k = 2;
  const stdinRaw = "${safeStdin}".trim();
  if (stdinRaw) {
    try {
      if (stdinRaw.includes("parent = ")) {
        const pPart = stdinRaw.split("parent = ")[1].split(", query")[0].trim();
        parent = JSON.parse(pPart);
      }
      if (stdinRaw.includes("query = ")) {
        const qPart = stdinRaw.split("query = ")[1].trim().replace("(", "[").replace(")", "]");
        const q = JSON.parse(qPart);
        node = q[0]; k = q[1];
      }
    } catch(e) {}
  }

  const n = parent.length;
  if (typeof TreeAncestor === "function") {
    const obj = new TreeAncestor(n, parent);
    if (typeof obj.getKthAncestor === "function") {
      console.log(obj.getKthAncestor(node, k));
    }
  }
})();
`;
    }
  }

  // ==========================================
  // Generic Fallback Smart Auto-Invoker (for JS / Python)
  // ==========================================
  if (normLang === "javascript" || normLang === "js") {
    return `${code}

(function _autoRunGeneric() {
  if (typeof Solution === 'function') {
    try {
      const sol = new Solution();
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(sol)).filter(m => m !== 'constructor');
      if (methods.length > 0) {
        console.log(JSON.stringify(sol[methods[0]]()));
      }
    } catch(e) {}
  }
})();
`;
  }

  if (normLang === "python" || normLang === "python3" || normLang === "py") {
    return `${code}

if __name__ == '__main__':
    if 'Solution' in globals():
        try:
            sol = Solution()
            methods = [m for m in dir(sol) if not m.startswith('_')]
            if methods:
                fn = getattr(sol, methods[0])
                import inspect
                sig = inspect.signature(fn)
                if len(sig.parameters) == 0:
                    res = fn()
                    if res is not None: print(res)
        except Exception:
            pass
`;
  }

  return code;
}
