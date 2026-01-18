# committs

AI-powered git commit message generator. Automatically generates semantic commit messages for your staged changes. 

## What it does

1. Detects staged git changes
2. Sends the diff to AI (via OpenRouter)
3. Generates a semantic commit message
4. Lets you review and confirm before committing

## Setup API Key (Required First)

1. Get your API key from [OpenRouter](https://openrouter.ai/settings/keys)
2. Set the API key:

```sh
echo "OPENROUTER_API_KEY=<your-token>" >> ~/.committs
```

## Installation

### Quick Start (No Installation)

```sh
npx @rahul-004x/committs
# or
bunx @rahul-004x/committs
```

### Global Installation

```sh
npm install -g @rahul-004x/committs
# or
bun install -g @rahul-004x/committs
```

Then run with:

```sh
committs
```
