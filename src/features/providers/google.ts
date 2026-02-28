import { BaseProvider } from "./base.js";
import { saveConfig, ConfigType } from "../../util.js";
import { text, isCancel, cancel, select } from "@clack/prompts";

export class GoogleAIProvider extends BaseProvider {
  id = "google";
  displayName = "Google AI";

  async setup(): Promise<void> {
    const apiKey = await text({
      message: "Enter your Google Gemini API key:",
      placeholder: "AIzaSy...",
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
      { value: "gemini-2.5-pro", label: "gemini-2.5-pro" },
      { value: "gemini-2.5-flash", label: "gemini-2.5-flash" },
      { value: "gemini-2.0-flash", label: "gemini-2.0-flash" },
      { value: "gemini-1.5-pro", label: "gemini-1.5-pro" },
      { value: "gemini-1.5-flash", label: "gemini-1.5-flash" },
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
      GOOGLE_API_KEY: apiKey as string,
      AI_MODEL: modelChoice as string,
    });
  }

  async generateCommit(diff: string, prompt: string, config: ConfigType): Promise<string> {
    const apiKey = config.GOOGLE_API_KEY;
    const model = config.AI_MODEL;

    if (!apiKey) {
      throw new Error("Google API key is missing. Please run setup first.");
    }

    // Google Gemini REST API format
    const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: { text: prompt }
        },
        contents: [
          {
            parts: [{ text: diff }]
          }
        ]
      }),
    });

    const jsonResponse: any = await response.json();

    if (jsonResponse.error) {
      throw new Error(JSON.stringify(jsonResponse.error, null, 2));
    }

    if (!jsonResponse.candidates || jsonResponse.candidates.length === 0) {
      throw new Error("Unexpected empty response from Google AI");
    }

    return jsonResponse.candidates[0].content.parts[0].text;
  }
}
