// npm install @langchain-anthropic
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatAnthropic } from '@langchain/anthropic';
import { agentTools, askTools } from './tools';
import { MemorySaver } from '@langchain/langgraph';

const checkpointer = new MemorySaver();

const model = new ChatAnthropic({
  model: 'claude-3-5-sonnet-latest',
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const agent = createReactAgent({
  llm: model,
  tools: agentTools,
  checkpointer,
});

const ask = createReactAgent({
  llm: model,
  tools: askTools,
  checkpointer,
});

export const agentGraph = agent;
export const askGraph = ask;
