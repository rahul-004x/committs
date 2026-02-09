import { $ } from "zx";

export type ProviderDef = {
  name: string;
  displayName: string;
  baseUrl: string;
  defautlmodels: string[];
  modelFilter: (model: any[]) => string[];
  apiKeyFormat: string;
  requiresApiKey: string;
};

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
  const result = { models: modelsArray };

  return result;
};

const baseUrl = "https://openrouter.ai/api/v1";

export async function setUpOpenRotuer(): Promise<{
  apiKey: string;
  model: string;
} | null> {
  const { text, isCancel, cancel, select, spinner } = await import(
    "@clack/prompts"
  );

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

  await $`echo "OPENROUTER_API_KEY=${apiKey}" >> ~/.committs`;
  console.log(apiKey, "saved");

  const s = spinner();
  s.start("Fetching available models...");

  try {
    const { models } = await fetchModels(baseUrl, apiKey);
    s.stop("Models fetched successfully!");

    if (!models || models.length === 0) {
      cancel("No models available");
      return null;
    }

    const modelOptions = models.map((model) => ({
      value: model.id || model.name || "unknown",
      label: model.name || model.id || "Unknown Model",
    }));

    const modelChoice = await select({
      message: "Select your model:",
      options: modelOptions,
    });

    await $`echo "AI_MODEL=${modelChoice}" >> ~/.committs`;

    if (isCancel(modelChoice)) {
      cancel("Operation cancelled");
      process.exit(0);
    }

    return {
      apiKey: apiKey as string,
      model: modelChoice as string,
    };
  } catch (error) {
    s.stop("Failed to fetch models");
    cancel(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return null;
  }
}
