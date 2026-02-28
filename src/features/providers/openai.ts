import { BaseProvider } from "./base.js";
import { saveConfig, ConfigType } from "../../util.js";
import { text, isCancel, cancel, select } from "@clack/prompts";

const baseUrl = "https://api.openai.com/v1";

export class OpenAIProvider extends BaseProvider {
  id = "openai";
  displayName = "OpenAI";

  async setup(): Promise<void> {
    const apiKey = await text({
      message: "Enter your OpenAI API key:",
      placeholder: "sk-...",
      validate: (value) => {
        if (!value || value.trim() === "") {
          return "API key is required";
        }
      },
    });

    if (isCancel(apiKey)) {
      cancel("Operation cancelled");
      process.exit(0);
    }

    const modelOptions = [
      { value: "gpt-5", label: "gpt-5" },
      { value: "gpt-5-turbo", label: "gpt-5-turbo" },
      { value: "gpt-4o", label: "gpt-4o" },
      { value: "gpt-4-turbo", label: "gpt-4-turbo" },
      { value: "gpt-3.5-turbo", label: "gpt-3.5-turbo" },
    ];

    const modelChoice = await select({
      message: "Select your model:",
      options: modelOptions,
    });

    if (isCancel(modelChoice)) {
      cancel("Operation cancelled");
      process.exit(0);
    }

    await saveConfig({
      PROVIDER: this.id,
      OPENAI_API_KEY: apiKey as string,
      AI_MODEL: modelChoice as string,
    });
  }

  async generateCommit(
    diff: string,
    prompt: string,
    config: ConfigType,
  ): Promise<string> {
    const apiKey = config.OPENAI_API_KEY;
    const model = config.AI_MODEL;

    if (!apiKey) {
      throw new Error("API key is missing. Please run `committs setup` to configure your provider.");
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: diff },
        ],
      }),
    });

    const jsonResponse: any = await response.json();

    if (jsonResponse.error) {
      throw new Error(JSON.stringify(jsonResponse.error, null, 2));
    }

    return jsonResponse.choices[0].message.content;
  }
}
