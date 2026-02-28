#!/usr/bin/env node

import { $, echo, question } from "zx";
import chalk from "chalk";
import { cli, command } from "cleye";
import { getConfig } from "./util.js";
import setupCommand from "./commands/setup.js";
import { getProvider } from "./features/providers/index.js";

const mainCommand = command(
  {
    name: "committs",
    description: "AI-powered git commit message generator",
  },
  () => {
    void (async function() {
      console.log(chalk.white("Generating ai messages...."));

      const config = await getConfig();
      const providerId = config.PROVIDER || "openrouter";
      const provider = getProvider(providerId);

      if (!provider) {
        console.error(chalk.red(`Unknown provider: ${providerId}. Please run 'committs setup' again.`));
        process.exit(1);
      }

      const diffResult = await $`git diff --cached`;
      const diff = diffResult.stdout.trim();

      if (!diff) {
        console.log(chalk.yellow("No staged changes found."));
        process.exit(0);
      }

      const prompt = `I want you to act like a git commit writer. I will give you a diff and your task is to write a semantic git commit message strictly semantic. Return only the commit message, a complete sentence, and do not repeat yourself.`;

      let aiCommit;
      try {
        aiCommit = await provider.generateCommit(diff, prompt, config);
      } catch (error: any) {
        console.error(chalk.red(`${provider.displayName} API Error:`), error.message);
        process.exit(1);
      }

      let cleanedUpAiCommit = aiCommit.replace(/(\r\n|\n|\r)/gm, "").trim();

      console.log(chalk.green("Commit message:"), cleanedUpAiCommit);

      const commitConfimation = await question(
        "\n Would you like to commit " + chalk.yellow("(y/n): "),
        {
          choices: ["Y", "n"],
        },
      );

      $.verbose = true;
      echo("\n");

      if (commitConfimation !== "n") {
        await $`git commit -m "${cleanedUpAiCommit}"`;
      }
    })();
  },
);

cli({
  name: "committs",
  commands: [setupCommand, mainCommand],
});