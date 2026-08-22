import assert from "node:assert/strict";
import test from "node:test";
import {
  GeminiProvider,
  LocalMentorProvider,
  OpenAIProvider,
  getAIProvider
} from "../src/services/aiProvider.service.js";

const AI_ENV_KEYS = ["GEMINI_API_KEY", "GOOGLE_API_KEY", "GEMINI_MODEL", "OPENAI_API_KEY"];

function withAIEnvironment(values, callback) {
  const previous = Object.fromEntries(AI_ENV_KEYS.map((key) => [key, process.env[key]]));

  for (const key of AI_ENV_KEYS) {
    delete process.env[key];
  }
  Object.assign(process.env, values);

  try {
    callback();
  } finally {
    for (const key of AI_ENV_KEYS) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}

test("Gemini is selected with the supported production default model", () => {
  withAIEnvironment({ GEMINI_API_KEY: "test-gemini-key" }, () => {
    const provider = getAIProvider();
    assert.ok(provider instanceof GeminiProvider);
    assert.equal(provider.model, "gemini-3.6-flash");
  });
});

test("GEMINI_MODEL overrides the default model", () => {
  withAIEnvironment(
    { GEMINI_API_KEY: "test-gemini-key", GEMINI_MODEL: "gemini-custom-model" },
    () => {
      const provider = getAIProvider();
      assert.ok(provider instanceof GeminiProvider);
      assert.equal(provider.model, "gemini-custom-model");
    }
  );
});

test("OpenAI is selected only when Gemini credentials are absent", () => {
  withAIEnvironment({ OPENAI_API_KEY: "test-openai-key" }, () => {
    assert.ok(getAIProvider() instanceof OpenAIProvider);
  });
});

test("local mentor remains the no-credential fallback", () => {
  withAIEnvironment({}, () => {
    assert.ok(getAIProvider() instanceof LocalMentorProvider);
  });
});
