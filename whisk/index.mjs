import { createGateway, streamText } from "ai";

const apiKey = process.env.AI_GATEWAY_API_KEY;
if (!apiKey) {
  console.error(
    "Set AI_GATEWAY_API_KEY (e.g. in .env.local) for AI Gateway API key auth.",
  );
  process.exit(1);
}

const gateway = createGateway({ apiKey });

const result = streamText({
  model: gateway("openai/gpt-5.5"),
  prompt: "Explain quantum computing in simple terms.",
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
