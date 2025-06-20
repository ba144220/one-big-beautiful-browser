import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import type { RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from '@langchain/langgraph';
import type { Mode, Model } from '@extension/shared';

// export const SYSTEM_PROMPT_TEMPLATE = `You are **BrowserGPT**, an AI-powered browser assistant embedded in a Chrome/Firefox extension. You have full access to the browser's tabs.

// Notes:
// - If you're asked to draft something that's not code, you should wrap the draft in \`\`\`markdown\`\`\` tags.
// - If you're asked to draft code, you should wrap the code in \`\`\`<language>\`\`\` tags.
// - **IMPORTANT**: If you feel like you're not provided with enough information, try to read the tabs information and content first before responding.

// System time: {system_time}`;

export const SYSTEM_PROMPT_TEMPLATE = `You are a helpful assistant.
System time: {system_time}`;

export const ConfigurationSchema = Annotation.Root({
  /**
   * The system prompt to be used by the agent.
   */
  systemPromptTemplate: Annotation<string>,

  /**
   * The name of the language model to be used by the agent.
   */
  model: Annotation<Model>,

  /**
   * The mode of the agent.
   */
  mode: Annotation<Mode>,
});

export function ensureConfiguration(config: RunnableConfig): typeof ConfigurationSchema.State {
  /**
   * Ensure the defaults are populated.
   */
  const configurable = config.configurable ?? {};
  return {
    systemPromptTemplate: configurable.systemPromptTemplate ?? SYSTEM_PROMPT_TEMPLATE,
    // model: configurable.model ?? "openai/gpt-4o-mini",
    model: configurable.model ?? 'claude-3-5-haiku-latest',
    mode: configurable.mode ?? 'ask',
  };
}

export function loadChatModel(fullySpecifiedName: Model) {
  switch (fullySpecifiedName) {
    case 'claude-3-5-sonnet-latest':
      return new ChatAnthropic({
        model: 'claude-3-5-sonnet-latest',
        apiKey: process.env.ANTHROPIC_API_KEY,
        temperature: 0.0,
      });
    case 'claude-3-7-sonnet-latest':
      return new ChatAnthropic({
        model: 'claude-3-7-sonnet-latest',
        apiKey: process.env.ANTHROPIC_API_KEY,
        temperature: 0.0,
      });
    case 'claude-3-5-haiku-latest':
      return new ChatAnthropic({
        model: 'claude-3-5-haiku-latest',
        apiKey: process.env.ANTHROPIC_API_KEY,
        temperature: 0.0,
      });

    case 'gpt-4.1-mini':
      return new ChatOpenAI({
        model: 'gpt-4.1-mini-2025-04-14',
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.0,
      });

    case 'gpt-4.1-nano':
      return new ChatOpenAI({
        model: 'gpt-4.1-nano-2025-04-14',
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.0,
      });
    default:
      return new ChatAnthropic({
        model: 'claude-3-5-haiku-latest',
        apiKey: process.env.ANTHROPIC_API_KEY,
        temperature: 0.0,
      });
  }
}
