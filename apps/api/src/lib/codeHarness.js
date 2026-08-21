/**
 * codeHarness.js
 * Wraps LeetCode-style solution code with a full program harness so it can be
 * executed end-to-end by the isolated execution worker.
 *
 * Strategy:
 * 1. If the user's code already has a main() / __main__ / process.stdin entry
 *    point, return it unchanged — the user controls the IO themselves.
 * 2. Otherwise, inject a problem-specific harness that reads the sample input,
 *    calls the function / class method, and prints the output.
 *
 * Supported languages: Python, JavaScript, C++, Java, C
 * Supported problems: two-sum, valid-parentheses, palindrome-number,
 *   reverse-string, best-time-to-buy-and-sell-stock, single-number,
 *   climbing-stairs, cache-stampede, merge-islands, binary-lift
 * Fallback: generic harness that attempts to auto-invoke the first method.
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Escape a string so it can safely appear inside a double-quoted string literal */
function escapeStr(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

/** Escape for single-quoted Python string literals */
function escapePyStr(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

// ─── Entry Point ─────────────────────────────────────────────────────────────

export function wrapCodeWithHarness({ code, language, problemId, stdin = "" }) {
  if (!code) return code;

  const normLang = (language || "").toLowerCase().trim();

  // If user's code already drives its own main / stdin, run it as-is.
  if (hasOwnEntryPoint(code)) return code;

  const pid = (problemId || "").toLowerCase().trim();

  // Route to the correct per-problem harness
  const wrapped = buildHarness({ code, normLang, pid, stdin });
  return wrapped !== null ? wrapped : code;
}

function hasOwnEntryPoint(code) {
  return (
    code.includes("if __name__ == '__main__':") ||
    code.includes("if __name__=='__main__':") ||
    code.includes("process.stdin") ||
    code.includes("sys.stdin") ||
    /\binput\s*\(/.test(code) ||
    code.includes("readFileSync(0") ||
    code.includes("readline") ||
    code.includes("Scanner") ||         // Java stdin
    code.includes("BufferedReader") ||
    code.includes("int main()") ||
    code.includes("int main(") ||
    code.includes("public static void main(")
  );
}

// ─── Harness Router ──────────────────────────────────────────────────────────

function buildHarness({ code, normLang, pid, stdin }) {
  switch (pid) {
    case "two-sum":
      return twoSumHarness(code, normLang, stdin);
    case "valid-parentheses":
      return validParenthesesHarness(code, normLang, stdin);
    case "palindrome-number":
      return palindromeNumberHarness(code, normLang, stdin);
    case "reverse-string":
      return reverseStringHarness(code, normLang, stdin);
    case "best-time-to-buy-and-sell-stock":
      return bestTimeHarness(code, normLang, stdin);
    case "single-number":
      return singleNumberHarness(code, normLang, stdin);
    case "climbing-stairs":
      return climbingStairsHarness(code, normLang, stdin);
    case "cache-stampede":
      return cacheStampedeHarness(code, normLang, stdin);
    case "merge-islands":
      return mergeIslandsHarness(code, normLang, stdin);
    case "binary-lift":
      return binaryLiftHarness(code, normLang, stdin);
    default:
      return genericHarness(code, normLang, stdin);
  }
}

// ─── Problem 1: Two Sum ──────────────────────────────────────────────────────

function twoSumHarness(code, lang, stdin) {
  const safe = escapePyStr(stdin);
  const safeJs = escapeStr(stdin);

  if (isPython(lang)) {
    return `${code}

import json, sys

def _harness():
    raw = (__import__('sys').stdin.read() or '${safe}').strip()
    nums = [2, 7, 11, 15]
    target = 9
    if raw:
        try:
            lines = [l.strip() for l in raw.splitlines() if l.strip()]
            if len(lines) >= 2:
                nums = json.loads(lines[0])
                target = int(lines[1])
            elif 'target = ' in raw:
                parts = raw.split('target = ')
                nums = json.loads(parts[0].replace('nums = ', '').strip().rstrip(','))
                target = int(parts[1].strip())
        except Exception:
            pass
    sol = Solution() if 'Solution' in globals() else None
    if sol:
        fn = getattr(sol, 'twoSum', None) or getattr(sol, 'two_sum', None)
        print(json.dumps(fn(nums, target)))
    elif 'twoSum' in globals():
        print(json.dumps(twoSum(nums, target)))
    elif 'two_sum' in globals():
        print(json.dumps(two_sum(nums, target)))
    else:
        print("[]")

if __name__ == '__main__':
    _harness()
`;
  }

  if (isJavaScript(lang)) {
    return `${code}

(function() {
  let nums = [2,7,11,15], target = 9;
  const raw = (require("fs").readFileSync(0, "utf8") || "${safeJs}").trim();
  if (raw) {
    try {
      const lines = raw.split("\\n").map(l => l.trim()).filter(Boolean);
      if (lines.length >= 2) { nums = JSON.parse(lines[0]); target = parseInt(lines[1], 10); }
      else if (raw.includes("target = ")) {
        const p = raw.split("target = ");
        nums = JSON.parse(p[0].replace("nums = ", "").trim().replace(/,$/, ""));
        target = parseInt(p[1], 10);
      }
    } catch(e) {}
  }
  const sol = typeof Solution !== "undefined" ? new Solution() : null;
  const res = sol ? sol.twoSum(nums, target) : (typeof twoSum === "function" ? twoSum(nums, target) : []);
  console.log(JSON.stringify(res));
})();
`;
  }

  if (isCpp(lang)) {
    return `#include <bits/stdc++.h>
using namespace std;

${code}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n, target;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cin >> target;
    Solution sol;
    auto res = sol.twoSum(nums, target);
    cout << "[" << res[0] << ", " << res[1] << "]" << endl;
    return 0;
}
`;
  }

  if (isJava(lang)) {
    return `import java.util.*;

${code}

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();
        Solution sol = new Solution();
        int[] res = sol.twoSum(nums, target);
        System.out.println("[" + res[0] + ", " + res[1] + "]");
    }
}
`;
  }

  if (isC(lang)) {
    return `#include <stdio.h>
#include <stdlib.h>

${code}

int main() {
    int n, target;
    scanf("%d", &n);
    int* nums = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    scanf("%d", &target);
    int resultSize;
    int* res = twoSum(nums, n, target, &resultSize);
    printf("[%d, %d]\\n", res[0], res[1]);
    free(nums); free(res);
    return 0;
}
`;
  }

  return null;
}

// ─── Problem 2: Valid Parentheses ────────────────────────────────────────────

function validParenthesesHarness(code, lang, stdin) {
  const safe = escapePyStr(stdin);
  const safeJs = escapeStr(stdin);

  if (isPython(lang)) {
    return `${code}

import json

def _harness():
    raw = (__import__('sys').stdin.read() or '${safe}').strip()
    s = '()[]{}'
    if raw:
        try:
            val = raw.replace('s = ', '').strip().strip('"').strip("'")
            s = val
        except Exception:
            pass
    sol = Solution()
    print(str(sol.isValid(s)).lower())

if __name__ == '__main__':
    _harness()
`;
  }

  if (isJavaScript(lang)) {
    return `${code}

(function() {
  let s = "()[]{}";
  const raw = (require("fs").readFileSync(0, "utf8") || "${safeJs}").trim();
  if (raw) {
    try {
      let v = raw.replace('s = ', '').trim();
      if (v.startsWith('"') || v.startsWith("'")) v = JSON.parse(v.replace(/'/g, '"'));
      s = v;
    } catch(e) {}
  }
  const sol = typeof Solution !== "undefined" ? new Solution() : null;
  const res = sol ? sol.isValid(s) : (typeof isValid === "function" ? isValid(s) : false);
  console.log(res.toString());
})();
`;
  }

  if (isCpp(lang)) {
    return `#include <bits/stdc++.h>
using namespace std;

${code}

int main() {
    string s;
    cin >> s;
    Solution sol;
    cout << (sol.isValid(s) ? "true" : "false") << endl;
    return 0;
}
`;
  }

  if (isJava(lang)) {
    return `import java.util.*;

${code}

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        Solution sol = new Solution();
        System.out.println(sol.isValid(s));
    }
}
`;
  }

  return null;
}

// ─── Problem 3: Palindrome Number ────────────────────────────────────────────

function palindromeNumberHarness(code, lang, stdin) {
  const safe = escapePyStr(stdin);
  const safeJs = escapeStr(stdin);

  if (isPython(lang)) {
    return `${code}

def _harness():
    raw = (__import__('sys').stdin.read() or '${safe}').strip()
    x = 121
    if raw:
        try: x = int(raw.replace('x = ', '').strip())
        except Exception: pass
    sol = Solution()
    print(str(sol.isPalindrome(x)).lower())

if __name__ == '__main__':
    _harness()
`;
  }

  if (isJavaScript(lang)) {
    return `${code}

(function() {
  let x = 121;
  const raw = (require("fs").readFileSync(0, "utf8") || "${safeJs}").trim();
  if (raw) { try { x = parseInt(raw.replace('x = ', '').trim(), 10); } catch(e) {} }
  const sol = typeof Solution !== "undefined" ? new Solution() : null;
  const res = sol ? sol.isPalindrome(x) : (typeof isPalindrome === "function" ? isPalindrome(x) : false);
  console.log(res.toString());
})();
`;
  }

  if (isCpp(lang)) {
    return `#include <bits/stdc++.h>
using namespace std;

${code}

int main() {
    int x;
    cin >> x;
    Solution sol;
    cout << (sol.isPalindrome(x) ? "true" : "false") << endl;
    return 0;
}
`;
  }

  if (isJava(lang)) {
    return `import java.util.*;

${code}

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.isPalindrome(x));
    }
}
`;
  }

  return null;
}

// ─── Problem 4: Reverse String ───────────────────────────────────────────────

function reverseStringHarness(code, lang, stdin) {
  const safe = escapePyStr(stdin);
  const safeJs = escapeStr(stdin);

  if (isPython(lang)) {
    return `${code}

import json

def _harness():
    raw = (__import__('sys').stdin.read() or '${safe}').strip()
    s = ["h","e","l","l","o"]
    if raw:
        try: s = json.loads(raw.replace('s = ', '').strip())
        except Exception: pass
    sol = Solution()
    sol.reverseString(s)
    print(json.dumps(s))

if __name__ == '__main__':
    _harness()
`;
  }

  if (isJavaScript(lang)) {
    return `${code}

(function() {
  let s = ["h","e","l","l","o"];
  const raw = (require("fs").readFileSync(0, "utf8") || "${safeJs}").trim();
  if (raw) { try { s = JSON.parse(raw.replace('s = ', '').trim()); } catch(e) {} }
  const sol = typeof Solution !== "undefined" ? new Solution() : null;
  if (sol) { sol.reverseString(s); } else if (typeof reverseString === "function") { reverseString(s); }
  console.log(JSON.stringify(s));
})();
`;
  }

  if (isCpp(lang)) {
    return `#include <bits/stdc++.h>
using namespace std;

${code}

int main() {
    int n; cin >> n;
    vector<char> s(n);
    for (int i = 0; i < n; i++) cin >> s[i];
    Solution sol;
    sol.reverseString(s);
    cout << "[";
    for (int i = 0; i < n; i++) { if (i) cout << ","; cout << "\\"" << s[i] << "\\""; }
    cout << "]" << endl;
    return 0;
}
`;
  }

  if (isJava(lang)) {
    return `import java.util.*;

${code}

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        char[] s = new char[n];
        for (int i = 0; i < n; i++) s[i] = sc.next().charAt(0);
        new Solution().reverseString(s);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < n; i++) { if (i > 0) sb.append(","); sb.append("\\"").append(s[i]).append("\\""); }
        sb.append("]");
        System.out.println(sb);
    }
}
`;
  }

  return null;
}

// ─── Problem 5: Best Time to Buy and Sell Stock ──────────────────────────────

function bestTimeHarness(code, lang, stdin) {
  const safe = escapePyStr(stdin);
  const safeJs = escapeStr(stdin);

  if (isPython(lang)) {
    return `${code}

import json

def _harness():
    raw = (__import__('sys').stdin.read() or '${safe}').strip()
    prices = [7,1,5,3,6,4]
    if raw:
        try: prices = json.loads(raw.replace('prices = ', '').strip())
        except Exception: pass
    sol = Solution()
    print(sol.maxProfit(prices))

if __name__ == '__main__':
    _harness()
`;
  }

  if (isJavaScript(lang)) {
    return `${code}

(function() {
  let prices = [7,1,5,3,6,4];
  const raw = (require("fs").readFileSync(0, "utf8") || "${safeJs}").trim();
  if (raw) { try { prices = JSON.parse(raw.replace('prices = ', '').trim()); } catch(e) {} }
  const sol = typeof Solution !== "undefined" ? new Solution() : null;
  const res = sol ? sol.maxProfit(prices) : (typeof maxProfit === "function" ? maxProfit(prices) : 0);
  console.log(res);
})();
`;
  }

  if (isCpp(lang)) {
    return `#include <bits/stdc++.h>
using namespace std;

${code}

int main() {
    int n; cin >> n;
    vector<int> prices(n);
    for (int i = 0; i < n; i++) cin >> prices[i];
    Solution sol;
    cout << sol.maxProfit(prices) << endl;
    return 0;
}
`;
  }

  if (isJava(lang)) {
    return `import java.util.*;

${code}

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] prices = new int[n];
        for (int i = 0; i < n; i++) prices[i] = sc.nextInt();
        System.out.println(new Solution().maxProfit(prices));
    }
}
`;
  }

  return null;
}

// ─── Problem 6: Single Number ────────────────────────────────────────────────

function singleNumberHarness(code, lang, stdin) {
  const safe = escapePyStr(stdin);
  const safeJs = escapeStr(stdin);

  if (isPython(lang)) {
    return `${code}

import json

def _harness():
    raw = (__import__('sys').stdin.read() or '${safe}').strip()
    nums = [2,2,1]
    if raw:
        try: nums = json.loads(raw.replace('nums = ', '').strip())
        except Exception: pass
    sol = Solution()
    print(sol.singleNumber(nums))

if __name__ == '__main__':
    _harness()
`;
  }

  if (isJavaScript(lang)) {
    return `${code}

(function() {
  let nums = [2,2,1];
  const raw = (require("fs").readFileSync(0, "utf8") || "${safeJs}").trim();
  if (raw) { try { nums = JSON.parse(raw.replace('nums = ', '').trim()); } catch(e) {} }
  const sol = typeof Solution !== "undefined" ? new Solution() : null;
  const res = sol ? sol.singleNumber(nums) : (typeof singleNumber === "function" ? singleNumber(nums) : 0);
  console.log(res);
})();
`;
  }

  if (isCpp(lang)) {
    return `#include <bits/stdc++.h>
using namespace std;

${code}

int main() {
    int n; cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    Solution sol;
    cout << sol.singleNumber(nums) << endl;
    return 0;
}
`;
  }

  if (isJava(lang)) {
    return `import java.util.*;

${code}

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        System.out.println(new Solution().singleNumber(nums));
    }
}
`;
  }

  return null;
}

// ─── Problem 7: Climbing Stairs ──────────────────────────────────────────────

function climbingStairsHarness(code, lang, stdin) {
  const safe = escapePyStr(stdin);
  const safeJs = escapeStr(stdin);

  if (isPython(lang)) {
    return `${code}

def _harness():
    raw = (__import__('sys').stdin.read() or '${safe}').strip()
    n = 2
    if raw:
        try: n = int(raw.replace('n = ', '').strip())
        except Exception: pass
    sol = Solution()
    print(sol.climbStairs(n))

if __name__ == '__main__':
    _harness()
`;
  }

  if (isJavaScript(lang)) {
    return `${code}

(function() {
  let n = 2;
  const raw = (require("fs").readFileSync(0, "utf8") || "${safeJs}").trim();
  if (raw) { try { n = parseInt(raw.replace('n = ', '').trim(), 10); } catch(e) {} }
  const sol = typeof Solution !== "undefined" ? new Solution() : null;
  const res = sol ? sol.climbStairs(n) : (typeof climbStairs === "function" ? climbStairs(n) : 0);
  console.log(res);
})();
`;
  }

  if (isCpp(lang)) {
    return `#include <bits/stdc++.h>
using namespace std;

${code}

int main() {
    int n; cin >> n;
    Solution sol;
    cout << sol.climbStairs(n) << endl;
    return 0;
}
`;
  }

  if (isJava(lang)) {
    return `import java.util.*;

${code}

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(new Solution().climbStairs(n));
    }
}
`;
  }

  return null;
}

// ─── Problem 8: Cache Stampede ───────────────────────────────────────────────

function cacheStampedeHarness(code, lang, stdin) {
  const safe = escapePyStr(stdin);
  const safeJs = escapeStr(stdin);

  if (isPython(lang)) {
    return `${code}

def _harness():
    raw = (__import__('sys').stdin.read() or '${safe}').strip()
    keys = ["a", "b", "a", "c"]
    if raw and "keys = " in raw:
        try:
            import json
            keys = json.loads(raw.replace("keys = ", "").strip())
        except Exception:
            pass
    fetches = []
    def dummy_fetch(k):
        msg = f"fetch({k})"
        if msg not in fetches: fetches.append(msg)
        return msg
    if 'prevent_cache_stampede' in globals():
        prevent_cache_stampede(keys, dummy_fetch)
    elif 'Solution' in globals():
        Solution().preventCacheStampede(keys)
    print(", ".join(fetches))

if __name__ == '__main__':
    _harness()
`;
  }

  if (isJavaScript(lang)) {
    return `${code}

(async function() {
  let keys = ["a","b","a","c"];
  const raw = (require("fs").readFileSync(0, "utf8") || "${safeJs}").trim();
  if (raw && raw.includes("keys = ")) {
    try { keys = JSON.parse(raw.replace("keys = ", "").trim()); } catch(e) {}
  }
  const fetches = [];
  const dummyFetch = async (k) => {
    const msg = "fetch(" + k + ")";
    if (!fetches.includes(msg)) fetches.push(msg);
    return msg;
  };
  if (typeof preventCacheStampede === "function") await preventCacheStampede(keys, dummyFetch);
  else if (typeof Solution !== "undefined") await new Solution().preventCacheStampede(keys, dummyFetch);
  console.log(fetches.join(", "));
})();
`;
  }

  return null;
}

// ─── Problem 9: Merge Islands ────────────────────────────────────────────────

function mergeIslandsHarness(code, lang, stdin) {
  const safe = escapePyStr(stdin);
  const safeJs = escapeStr(stdin);

  if (isPython(lang)) {
    return `${code}

import json

def _harness():
    raw = (__import__('sys').stdin.read() or '${safe}').strip()
    m, n = 3, 3
    positions = [[0,0],[0,1],[1,2]]
    if raw:
        try:
            if 'm = ' in raw:
                m = int(raw.split('m = ')[1].split(',')[0].strip())
            if 'n = ' in raw:
                n = int(raw.split('n = ')[1].split(',')[0].strip())
            if 'positions = ' in raw:
                positions = json.loads(raw.split('positions = ')[1].strip())
        except Exception: pass
    sol = Solution()
    print(json.dumps(sol.numIslands2(m, n, positions)))

if __name__ == '__main__':
    _harness()
`;
  }

  if (isJavaScript(lang)) {
    return `${code}

(function() {
  let m = 3, n = 3, positions = [[0,0],[0,1],[1,2]];
  const raw = (require("fs").readFileSync(0, "utf8") || "${safeJs}").trim();
  if (raw) {
    try {
      if (raw.includes("m = ")) m = parseInt(raw.split("m = ")[1].split(",")[0].trim(), 10);
      if (raw.includes("n = ")) n = parseInt(raw.split("n = ")[1].split(",")[0].trim(), 10);
      if (raw.includes("positions = ")) positions = JSON.parse(raw.split("positions = ")[1].trim());
    } catch(e) {}
  }
  const sol = typeof Solution !== "undefined" ? new Solution() : null;
  const res = sol ? sol.numIslands2(m, n, positions) : [];
  console.log(JSON.stringify(res));
})();
`;
  }

  return null;
}

// ─── Problem 10: Binary Lift ─────────────────────────────────────────────────

function binaryLiftHarness(code, lang, stdin) {
  const safe = escapePyStr(stdin);
  const safeJs = escapeStr(stdin);

  if (isPython(lang)) {
    return `${code}

import json

def _harness():
    raw = (__import__('sys').stdin.read() or '${safe}').strip()
    parent = [-1,0,0,1,1]
    node, k = 4, 2
    if raw:
        try:
            if 'parent = ' in raw:
                parent = json.loads(raw.split('parent = ')[1].split(', query')[0].strip())
            if 'query = ' in raw:
                q = json.loads(raw.split('query = ')[1].strip().replace('(','[').replace(')',']'))
                node, k = q[0], q[1]
        except Exception: pass
    n = len(parent)
    obj = TreeAncestor(n, parent)
    print(obj.getKthAncestor(node, k))

if __name__ == '__main__':
    _harness()
`;
  }

  if (isJavaScript(lang)) {
    return `${code}

(function() {
  let parent = [-1,0,0,1,1], node = 4, k = 2;
  const raw = (require("fs").readFileSync(0, "utf8") || "${safeJs}").trim();
  if (raw) {
    try {
      if (raw.includes("parent = ")) parent = JSON.parse(raw.split("parent = ")[1].split(", query")[0].trim());
      if (raw.includes("query = ")) { const q = JSON.parse(raw.split("query = ")[1].trim().replace("(","[").replace(")","]")); node=q[0]; k=q[1]; }
    } catch(e) {}
  }
  const obj = new TreeAncestor(parent.length, parent);
  console.log(obj.getKthAncestor(node, k));
})();
`;
  }

  return null;
}

// ─── Generic Fallback ────────────────────────────────────────────────────────

function genericHarness(code, lang, stdin) {
  if (isJavaScript(lang)) {
    return `${code}

(function _auto() {
  if (typeof Solution === 'function') {
    try {
      const sol = new Solution();
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(sol)).filter(m => m !== 'constructor');
      if (methods.length > 0) console.log(JSON.stringify(sol[methods[0]]()));
    } catch(e) { console.error(e.message); }
  }
})();
`;
  }

  if (isPython(lang)) {
    return `${code}

if __name__ == '__main__':
    if 'Solution' in globals():
        try:
            import inspect
            sol = Solution()
            methods = [m for m in dir(sol) if not m.startswith('_')]
            if methods:
                fn = getattr(sol, methods[0])
                sig = inspect.signature(fn)
                if len(sig.parameters) == 0:
                    res = fn()
                    if res is not None: print(res)
        except Exception as e:
            print(e)
`;
  }

  return null;
}

// ─── Language Helpers ─────────────────────────────────────────────────────────

function isPython(lang) {
  return lang === "python" || lang === "python3" || lang === "py";
}

function isJavaScript(lang) {
  return lang === "javascript" || lang === "js";
}

function isCpp(lang) {
  return lang === "cpp" || lang === "c++";
}

function isJava(lang) {
  return lang === "java";
}

function isC(lang) {
  return lang === "c";
}
