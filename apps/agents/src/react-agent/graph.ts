// npm install @langchain-anthropic
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatAnthropic } from '@langchain/anthropic';
import { getActiveTabView, getAllTabsInfo, getTabViewById, search } from './tools';
import { MemorySaver } from '@langchain/langgraph';

const checkpointer = new MemorySaver();

const model = new ChatAnthropic({
  model: 'claude-3-5-sonnet-latest',
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const agent = createReactAgent({
  llm: model,
  tools: [search, getActiveTabView, getAllTabsInfo, getTabViewById],
  checkpointer,
});

export const graph = agent;
