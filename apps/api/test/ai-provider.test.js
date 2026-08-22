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

test("Gemini uses the Interactions API and retries the supported model after 404", async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];

  globalThis.fetch = async (url, options) => {
    const body = JSON.parse(options.body);
    requests.push({ url: String(url), options, body });
    if (body.model === "gemini-2.5-flash") {
      return new Response(JSON.stringify({ error: { message: "Model not found" } }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(
      JSON.stringify({
        steps: [{ type: "model_output", content: [{ type: "text", text: "Gemini response" }] }]
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  };

  try {
    const provider = new GeminiProvider("test-gemini-key", "gemini-2.5-flash");
    const reply = await provider.generateCompletion({
      systemPrompt: "Be concise.",
      messages: [{ role: "user", content: "Explain binary search." }]
    });

    assert.equal(reply, "Gemini response");
    assert.equal(requests.length, 2);
    assert.equal(requests[0].url, "https://generativelanguage.googleapis.com/v1beta/interactions");
    assert.equal(requests[0].body.model, "gemini-2.5-flash");
    assert.equal(requests[1].body.model, "gemini-3.6-flash");
    assert.equal(requests[1].body.system_instruction, "Be concise.");
    assert.match(requests[1].body.input, /USER:\nExplain binary search\./);
    assert.equal(requests[1].options.headers["x-goog-api-key"], "test-gemini-key");
    assert.doesNotMatch(requests[1].url, /test-gemini-key/);
  } finally {
    globalThis.fetch = originalFetch;
  }
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

test("retired Gemini model configuration is normalized before making a request", () => {
  withAIEnvironment(
    { GEMINI_API_KEY: "test-gemini-key", GEMINI_MODEL: "gemini-2.5-flash" },
    () => {
      const provider = getAIProvider();
      assert.ok(provider instanceof GeminiProvider);
      assert.equal(provider.model, "gemini-3.6-flash");
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
