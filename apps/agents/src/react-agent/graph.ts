// npm install @langchain-anthropic
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatAnthropic } from '@langchain/anthropic';
import { tool } from '@langchain/core/tools';

import { z } from 'zod';

const search = tool(
  async ({ query }) => {
    if (query.toLowerCase().includes('sf') || query.toLowerCase().includes('san francisco')) {
      return "It's 60 degrees and foggy.";
    }
    return "It's 90 degrees and sunny.";
  },
  {
    name: 'search',
    description: 'Call to surf the web.',
    schema: z.object({
      query: z.string().describe('The query to use in your search.'),
    }),
  },
);

console.log(process.env.ANTHROPIC_API_KEY);
const model = new ChatAnthropic({
  model: 'claude-3-5-sonnet-latest',
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const agent = createReactAgent({
  llm: model,
  tools: [search],
});

export const graph = agent;
