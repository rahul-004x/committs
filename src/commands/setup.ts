import { command } from "cleye";
import { intro, isCancel, outro, select } from "@clack/prompts";
import { providers } from "../features/providers/index.js";

export default command(
  {
    name: "setup",
    description: "configure your AI provider",
  },
  async (argv) => {
    intro("committs");

    const providerOptions = Object.values(providers).map((provider) => ({
      value: provider.id,
      label: provider.displayName,
    }));

    const availableProvider = await select({
      message: "Choose your ai provider",
      options: providerOptions,
    });

    if (isCancel(availableProvider)) {
      outro("setup cancelled");
      return process.exit(0);
    }

    const selectedProvider = providers[availableProvider as string];
    if (selectedProvider) {
      await selectedProvider.setup();
      console.log(`${selectedProvider.displayName} configured successfully!`);
    } else {
      outro("Selected provider is not implemented yet");
      return process.exit(1);
    }

    outro("Setup complete!");
  },
);
