#!/usr/bin/env node

import { $, echo, question } from "zx";
import chalk from "chalk";
import { cli } from "cleye";
import { intro, outro, spinner } from "@clack/prompts";
import { getConfig } from "./util.js";
import setupCommand from "./commands/setup.js";
import { getProvider } from "./features/providers/index.js";

const defaultCommand = async () => {
  intro(chalk.inverse(" committs "));

  const s = spinner();
  s.start("Generating AI commit message...");

  const config = await getConfig();
  const providerId = config.PROVIDER || "openrouter";
  const provider = getProvider(providerId);

  if (!provider) {
    s.stop("Failed");
    console.error(
      chalk.red(
        `\n× Unknown provider: ${providerId}. Please run 'committs setup' again.`,
      ),
    );
    process.exit(1);
  }

  const diffResult = await $`git diff --cached`;
  const diff = diffResult.stdout.trim();

  if (!diff) {
    s.stop("No changes");
    outro(
      chalk.yellow("No staged changes found. Did you forget to `git add`?"),
    );
    process.exit(0);
  }

  const prompt = `I want you to act as a git commit message writer. Generate a commit message following:
1. Conventional Commits format: <type>(<scope>): <description>
2. 50/72 rule: Subject line max 50 chars, body wrapped at 72 chars
3. Allowed types: feat, fix, docs, style, refactor, perf, test, chore, build, ci, revert
4. Use imperative mood, lowercase, no period in subject
5. Return ONLY the commit message, no explanations.`;

  let aiCommit;
  try {
    aiCommit = await provider.generateCommit(diff, prompt, config);
  } catch (error: any) {
    s.stop("Error");
    console.error(
      chalk.red(`\n× ${provider.displayName} API Error Maybe rach api limit:`),
      error.message,
    );
    process.exit(1);
  }

  let cleanedUpAiCommit = aiCommit.replace(/(\r\n|\n|\r)/gm, "").trim();

  s.stop("Message generated!");

  console.log(`\n🤖 ${chalk.cyan.bold("Proposed Commit:")}`);
  console.log(`${chalk.gray("│")}  ${chalk.white(cleanedUpAiCommit)}`);
  console.log(`${chalk.gray("└─────────────────────────────────────────")}\n`);

  const commitConfimation = await question(
    chalk.white("Would you like to commit? ") + chalk.gray("(Y/n): "),
    {
      choices: ["Y", "n", "y", "N"],
    },
  );

  if (commitConfimation.toLowerCase() !== "n") {
    $.verbose = true;
    echo("\n");
    await $`git commit -m "${cleanedUpAiCommit}"`;
    outro(chalk.green("√ Successfully committed!"));
  } else {
    outro(chalk.yellow("× Commit cancelled"));
  }
};

cli(
  {
    name: "committs",
    commands: [setupCommand],
  },
  (argv) => {
    void defaultCommand();
  },
);
