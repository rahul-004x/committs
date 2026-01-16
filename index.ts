#!/usr/bin/env z

import { $, fs } from "zx";
import chalk from "chalk";


console.log(chalk.gray("Generating ai messages...."));

let pwd = await $`pwd`;

const { OPENROUTER_API_KEY } = await fs.readJson(
  `${pwd.stdout.trim()}/.env.json`,
);

let diff = await $`git diff --cached`;

const prompt = `I want you to act like a git commit writer i will give a diff and your task is to write a semantic git commit ${diff} Return a complete sentence and do not repeat yourself `;

const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
});

const json = await response.json();
const aiCommit = json.choices[0].text;
let cleanedUpAiCommit = aiCommit.replace(/(\r\n|\n|\r)/gm, "");

console.log(cleanedUpAiCommit);


console.log(OPENROUTER_API_KEY);
