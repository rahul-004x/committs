import { command } from "cleye";
import { intro, isCancel, outro, select } from "@clack/prompts";
import { setUpOpenRotuer } from "../features/providers/openrouter.js";

export default command(
  {
    name: "setup",
    description: "configure your AI provider",
  },
  async (argv) => {
    intro("committs");

    const availableProvider = await select({
      message: "Choose your ai provider",
      options: [
        { value: "openrouter", label: "OpenRouter" },
        { value: "openai", label: "OpenAI" },
      ],
    });
    if (isCancel(availableProvider)) {
      outro("setup cancelled");
      return process.exit(0);
    }

    switch (availableProvider) {
      case "openrouter":
        const openRouterConfig = await setUpOpenRotuer();
        if (openRouterConfig) {
          console.log("OpenRouter configured successfully!");
          console.log("Selected model:", openRouterConfig.model);
          // TODO: Save the configuration to a config file or environment
        } else {
          outro("OpenRouter setup failed");
          return process.exit(1);
        }
        break;
      case "openai":
        // TODO: implement openai setup
        console.log("OpenAI setup not implemented yet");
        break;
      default:
        break;
    }

    console.log("Selected provider:", availableProvider);
    outro("Setup complete!");
  },
);
