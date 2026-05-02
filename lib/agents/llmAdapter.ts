import { APP_CONFIG } from "@/lib/utils/config";

export interface LlmAdapter {
  mode: "rule_based_only" | "manual_composer_assisted" | "future_api_llm";
  available: boolean;
  complete(prompt: string): Promise<string | null>;
}

export const llm: LlmAdapter = {
  mode: APP_CONFIG.llmProvider,
  available: APP_CONFIG.llmProvider === "future_api_llm",
  async complete(_prompt: string) {
    if (APP_CONFIG.llmProvider !== "future_api_llm") return null;
    return null;
  },
};
