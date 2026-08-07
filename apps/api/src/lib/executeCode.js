import { executeCpp } from "./executeCpp.js";
import { executeJava } from "./executeJava.js";
import { executeJavaScript } from "./executeJavaScript.js";
import { executePython } from "./executePython.js";

export async function executeCode({ language, code, stdin = "", timeoutMs }) {
  const normalizedLang = (language || "").toLowerCase().trim();

  switch (normalizedLang) {
    case "js":
    case "javascript":
      return executeJavaScript({ code, stdin, timeoutMs });

    case "py":
    case "python":
    case "python3":
      return executePython({ code, stdin, timeoutMs });

    case "c":
    case "cpp":
    case "c++":
      return executeCpp({ code, stdin, timeoutMs });

    case "java":
      return executeJava({ code, stdin, timeoutMs });

    default:
      return {
        ok: false,
        exitCode: null,
        stdout: "",
        stderr: `Unsupported language: '${language}'. Supported languages: javascript, python, cpp, java.`,
        verdict: "SYSTEM_ERROR",
        runtimeMs: 0
      };
  }
}
