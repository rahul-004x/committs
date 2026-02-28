import { BaseProvider } from "./base.js";
import { saveConfig, ConfigType } from "../../util.js";
import { text, isCancel, cancel, select, spinner } from "@clack/prompts";

interface ModelObject {
  id?: string;
  name?: string;
  type?: string;
}

const fetchModels = async (
  baseUrl: string,
  apiKey: string,
): Promise<{ models: ModelObject[]; error?: string }> => {
  const response = await fetch(`${baseUrl}/models`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response?.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data: any = await response.json();
  const modelsArray: ModelObject[] = (data.data ? data.data : data) || [];
  return { models: modelsArray };
};

const baseUrl = "https://openrouter.ai/api/v1";

export class OpenRouterProvider extends BaseProvider {
  id = "openrouter";
  displayName = "OpenRouter";

  async setup(): Promise<void> {
    const apiKey = await text({
      message: "Enter your OpenRouter API key:",
      placeholder: "sk-or-v1-...",
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

    const s = spinner();
    s.start("Fetching available models...");

    try {
      const { models } = await fetchModels(baseUrl, apiKey as string);
      s.stop("Models fetched successfully!");

      if (!models || models.length === 0) {
        cancel("No models available");
        process.exit(1);
      }

      const modelOptions = models.map((model) => ({
        value: model.id || model.name || "unknown",
        label: model.name || model.id || "Unknown Model",
      }));

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
        OPENROUTER_API_KEY: apiKey as string,
        AI_MODEL: modelChoice as string,
      });

    } catch (error) {
      s.stop("Failed to fetch models");
      cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    }
  }

  async generateCommit(diff: string, prompt: string, config: ConfigType): Promise<string> {
    const apiKey = config.OPENROUTER_API_KEY;
    const model = config.AI_MODEL;

    if (!apiKey) {
      throw new Error("OpenRouter API key is missing. Please run setup first.");
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
