#!/usr/bin/env z

import { $, echo, fs, question } from "zx";
import chalk from "chalk";

void (async function() {
  console.log(chalk.gray("Generating ai messages...."));

  let pwd = await $`pwd`;

  const { OPENROUTER_API_KEY } = await fs.readJson(
    `${pwd.stdout.trim()}/.env.json`,
  );

  const diffResult = await $`git diff --cached`;
  const diff = diffResult.stdout.trim();

  if (!diff) {
    console.log(chalk.yellow("No staged changes found."));
    process.exit(0);
  }

  const prompt = `I want you to act like a git commit writer. I will give you a diff and your task is to write a semantic git commit message strictly semantic. Return only the commit message, a complete sentence, and do not repeat yourself.`;

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "z-ai/glm-4.5-air:free",
        messages: [
          { role: "system", content: prompt },
          {
            role: "user",
            content: diff,
          },
        ],
      }),
    },
  );

  const jsonResponse = await response.json();

  if (jsonResponse.error) {
    console.error(
      chalk.red("API Error:"),
      JSON.stringify(jsonResponse.error, null, 2),
    );
    process.exit(1);
  }

  const aiCommit = jsonResponse.choices[0].message.content;
  let cleanedUpAiCommit = aiCommit.replace(/(\r\n|\n|\r)/gm, "").trim();

  console.log(chalk.green("Commit message:"), cleanedUpAiCommit);

  const commitConfimation = await question(
    "\n Would you like to commit" + chalk.yellow("(y/n): "),
    {
      choices: ["Y", "n"],
    },
  );
  echo("\n");

  if (commitConfimation !== "n") {
    `$ git commit -m ${cleanedUpAiCommit}`;
  }
})();
