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
  }

  // ==========================================
  // Problem 2: VALID-PARENTHESES
  // ==========================================
  if (pid === "valid-parentheses") {
    if (normLang === "python" || normLang === "python3" || normLang === "py") {
      return `${code}

import json

def _run_harness():
    stdin_raw = "${safeStdin}".strip()
    s = "()[]{}"
    if stdin_raw and "s = " in stdin_raw:
        try:
            s_val = stdin_raw.replace("s = ", "").strip()
            if s_val.startswith('"') and s_val.endswith('"'): s_val = json.loads(s_val)
            s = s_val
        except Exception: pass

    sol = Solution() if 'Solution' in globals() else None
    if sol and hasattr(sol, 'isValid'):
        print(str(sol.isValid(s)).lower())
    elif 'isValid' in globals():
        print(str(isValid(s)).lower())

if __name__ == '__main__':
    _run_harness()
`;
    }

    if (normLang === "javascript" || normLang === "js") {
      return `${code}

(function _runHarness() {
  let s = "()[]{}";
  const stdinRaw = "${safeStdin}".trim();
  if (stdinRaw && stdinRaw.includes("s = ")) {
    try {
      let sVal = stdinRaw.replace("s = ", "").trim();
      if (sVal.startsWith('"')) sVal = JSON.parse(sVal);
      s = sVal;
    } catch(e) {}
  }

  if (typeof isValid === "function") {
    console.log(isValid(s));
  } else if (typeof Solution === "function") {
    const sol = new Solution();
    if (typeof sol.isValid === "function") {
      console.log(sol.isValid(s));
    }
  }
})();
`;
    }
  }

  // ==========================================
  // Problem 3: PALINDROME-NUMBER
  // ==========================================
  if (pid === "palindrome-number") {
    if (normLang === "python" || normLang === "python3" || normLang === "py") {
      return `${code}

import json

def _run_harness():
    stdin_raw = "${safeStdin}".strip()
    x = 121
    if stdin_raw and "x = " in stdin_raw:
        try: x = int(stdin_raw.replace("x = ", "").strip())
        except Exception: pass

    sol = Solution() if 'Solution' in globals() else None
    if sol and hasattr(sol, 'isPalindrome'):
        print(str(sol.isPalindrome(x)).lower())
    elif 'isPalindrome' in globals():
        print(str(isPalindrome(x)).lower())

if __name__ == '__main__':
    _run_harness()
`;
    }

    if (normLang === "javascript" || normLang === "js") {
      return `${code}

(function _runHarness() {
  let x = 121;
  const stdinRaw = "${safeStdin}".trim();
  if (stdinRaw && stdinRaw.includes("x = ")) {
    try { x = parseInt(stdinRaw.replace("x = ", "").trim(), 10); } catch(e) {}
  }

  if (typeof isPalindrome === "function") {
    console.log(isPalindrome(x));
  } else if (typeof Solution === "function") {
    const sol = new Solution();
    if (typeof sol.isPalindrome === "function") {
      console.log(sol.isPalindrome(x));
    }
  }
})();
`;
    }
  }

  // ==========================================
  // Problem 4: REVERSE-STRING
  // ==========================================
  if (pid === "reverse-string") {
    if (normLang === "python" || normLang === "python3" || normLang === "py") {
      return `${code}

import json

def _run_harness():
    stdin_raw = "${safeStdin}".strip()
    s = ["h","e","l","l","o"]
    if stdin_raw and "s = " in stdin_raw:
        try: s = json.loads(stdin_raw.replace("s = ", "").strip())
        except Exception: pass

    sol = Solution() if 'Solution' in globals() else None
    if sol and hasattr(sol, 'reverseString'):
        sol.reverseString(s)
        print(json.dumps(s))
    elif 'reverseString' in globals():
        res = reverseString(s)
        print(json.dumps(s if res is None else res))

if __name__ == '__main__':
    _run_harness()
`;
    }

    if (normLang === "javascript" || normLang === "js") {
      return `${code}

(function _runHarness() {
  let s = ["h","e","l","l","o"];
  const stdinRaw = "${safeStdin}".trim();
  if (stdinRaw && stdinRaw.includes("s = ")) {
    try { s = JSON.parse(stdinRaw.replace("s = ", "").trim()); } catch(e) {}
  }

  if (typeof reverseString === "function") {
    const res = reverseString(s);
    console.log(JSON.stringify(res !== undefined ? res : s));
  } else if (typeof Solution === "function") {
    const sol = new Solution();
    if (typeof sol.reverseString === "function") {
      const res = sol.reverseString(s);
      console.log(JSON.stringify(res !== undefined ? res : s));
    }
  }
})();
`;
    }
  }

  // ==========================================
  // Problem 5: BEST-TIME-TO-BUY-AND-SELL-STOCK
  // ==========================================
  if (pid === "best-time-to-buy-and-sell-stock") {
    if (normLang === "python" || normLang === "python3" || normLang === "py") {
      return `${code}

import json

def _run_harness():
    stdin_raw = "${safeStdin}".strip()
    prices = [7,1,5,3,6,4]
    if stdin_raw and "prices = " in stdin_raw:
        try: prices = json.loads(stdin_raw.replace("prices = ", "").strip())
        except Exception: pass

    sol = Solution() if 'Solution' in globals() else None
    if sol and hasattr(sol, 'maxProfit'):
        print(sol.maxProfit(prices))
    elif 'maxProfit' in globals():
        print(maxProfit(prices))

if __name__ == '__main__':
    _run_harness()
`;
    }

    if (normLang === "javascript" || normLang === "js") {
      return `${code}

(function _runHarness() {
  let prices = [7,1,5,3,6,4];
  const stdinRaw = "${safeStdin}".trim();
  if (stdinRaw && stdinRaw.includes("prices = ")) {
    try { prices = JSON.parse(stdinRaw.replace("prices = ", "").trim()); } catch(e) {}
  }

  if (typeof maxProfit === "function") {
    console.log(maxProfit(prices));
  } else if (typeof Solution === "function") {
    const sol = new Solution();
    if (typeof sol.maxProfit === "function") {
      console.log(sol.maxProfit(prices));
    }
  }
})();
`;
    }
  }

  // ==========================================
  // Problem 6: SINGLE-NUMBER
  // ==========================================
  if (pid === "single-number") {
    if (normLang === "python" || normLang === "python3" || normLang === "py") {
      return `${code}

import json

def _run_harness():
    stdin_raw = "${safeStdin}".strip()
    nums = [2,2,1]
    if stdin_raw and "nums = " in stdin_raw:
        try: nums = json.loads(stdin_raw.replace("nums = ", "").strip())
        except Exception: pass

    sol = Solution() if 'Solution' in globals() else None
    if sol and hasattr(sol, 'singleNumber'):
        print(sol.singleNumber(nums))
    elif 'singleNumber' in globals():
        print(singleNumber(nums))

if __name__ == '__main__':
    _run_harness()
`;
    }

    if (normLang === "javascript" || normLang === "js") {
      return `${code}

(function _runHarness() {
  let nums = [2,2,1];
  const stdinRaw = "${safeStdin}".trim();
  if (stdinRaw && stdinRaw.includes("nums = ")) {
    try { nums = JSON.parse(stdinRaw.replace("nums = ", "").trim()); } catch(e) {}
  }

  if (typeof singleNumber === "function") {
    console.log(singleNumber(nums));
  } else if (typeof Solution === "function") {
    const sol = new Solution();
    if (typeof sol.singleNumber === "function") {
      console.log(sol.singleNumber(nums));
    }
  }
})();
`;
    }
  }

  // ==========================================
  // Problem 7: CLIMBING-STAIRS
  // ==========================================
  if (pid === "climbing-stairs") {
    if (normLang === "python" || normLang === "python3" || normLang === "py") {
      return `${code}

import json

def _run_harness():
    stdin_raw = "${safeStdin}".strip()
    n = 2
    if stdin_raw and "n = " in stdin_raw:
        try: n = int(stdin_raw.replace("n = ", "").strip())
        except Exception: pass

    sol = Solution() if 'Solution' in globals() else None
    if sol and hasattr(sol, 'climbStairs'):
        print(sol.climbStairs(n))
    elif 'climbStairs' in globals():
        print(climbStairs(n))

if __name__ == '__main__':
    _run_harness()
`;
    }

    if (normLang === "javascript" || normLang === "js") {
      return `${code}

(function _runHarness() {
  let n = 2;
  const stdinRaw = "${safeStdin}".trim();
  if (stdinRaw && stdinRaw.includes("n = ")) {
    try { n = parseInt(stdinRaw.replace("n = ", "").trim(), 10); } catch(e) {}
  }

  if (typeof climbStairs === "function") {
    console.log(climbStairs(n));
  } else if (typeof Solution === "function") {
    const sol = new Solution();
    if (typeof sol.climbStairs === "function") {
      console.log(sol.climbStairs(n));
    }
  }
})();
`;
    }
  }

  // ==========================================
  // Problem 8: CACHE-STAMPEDE
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
  // Problem 9: MERGE-ISLANDS (numIslands2)
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
  // Problem 10: BINARY-LIFT (TreeAncestor)
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
