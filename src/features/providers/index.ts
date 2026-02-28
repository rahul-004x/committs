import { OpenRouterProvider } from "./openrouter.js";
import { OpenAIProvider } from "./openai.js";
import { GoogleAIProvider } from "./google.js";
import { BaseProvider } from "./base.js";

export const providers: Record<string, BaseProvider> = {
  openrouter: new OpenRouterProvider(),
  openai: new OpenAIProvider(),
  google: new GoogleAIProvider(),
};

export const getProvider = (id: string): BaseProvider | undefined => {
  return providers[id];
};
