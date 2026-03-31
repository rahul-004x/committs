## What it does

1. Detects staged git changes
2. Sends the diff to your configured AI provider
3. Generates a pristine, semantic commit message
4. Lets you review and confirm before committing

## Installation

### Quick Start (No Installation)

````sh
# 1. Setup your AI provider
npx @rahul-004x/committs setup

# 2. Stage your changes
git add .

# 3. Generate commit message
npx @rahul-004x/committs
```

### Global Installation

```sh
npm install -g @rahul-004x/committs
# or
bun install -g @rahul-004x/committs
```

## Setup & Usage

**1. Configure your AI Provider (Required)**

```sh
committs setup
````

_You will be prompted to choose between OpenAI, Google AI, or OpenRouter, provide your API key, and select a model._

**2. Generate Commit Messages**
Stage your changes:

```sh
git add .
```

Then run the CLI:

```sh
committs
```

_Review the AI-generated commit message and confirm (Y/n) to commit it directly._
