/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { Router, createCors, error, json } from "itty-router";
const { preflight, corsify } = createCors();
const router = Router();

const API_URL = "https://www.builder.io/blog/stream-ai-javascript#constants-for-open-ai-api-endpoint-and-api-key"; // Replace with your OpenAI API URL
const API_KEY = "Bearer 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"; // Replace with your OpenAI API key

router
  .all("*", preflight)
  .option("*", corsify)
  .all("/api/ping", (request, env, ctx) => {
    return json({
      message: "AI Service is running!",
    });
  })
  .all("/api/chatgptstream", async (request, env, ctx) => {
    try {
      // Fetch the response from the OpenAI API with the signal from AbortController
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "what is the future of nocode?" }],
        }),
      });

      const data = await response.json();
      
      // Return the data with an appropriate status code
      return json(data, { status: response.status });
    } catch (err) {
      // Handle errors and return a 500 status code
      return error(500, err.stack);
    }
  });

export default {
  fetch: (request, ...args) =>
    router
      .handle(request, ...args)
      .catch((err) => error(500, err.stack))
      .then(corsify),
};
