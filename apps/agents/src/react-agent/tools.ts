import { tool } from '@langchain/core/tools';
import { interrupt } from '@langchain/langgraph';
import {
  type GetActiveTabView,
  type GetAllTabsInfo,
  type GetTabViewById,
  GetTabViewByIdSchema,
} from '@extension/shared';
import { z } from 'zod';

export const search = tool(
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

export const getActiveTabView = tool(
  async () => {
    const response = interrupt<GetActiveTabView['Input'], GetActiveTabView['Return']>({
      name: 'getActiveTabView',
    });
    return response;
  },
  {
    name: 'getActiveTabView',
    description: 'Get the view of the active tab in the browser',
  },
);

export const getAllTabsInfo = tool(
  async () => {
    const response = interrupt<GetAllTabsInfo['Input'], GetAllTabsInfo['Return']>({
      name: 'getAllTabsInfo',
    });
    return response;
  },
  {
    name: 'getAllTabsInfo',
    description: "Get all tabs' info in the browser. Return a list of tabs with their title, url, and ID",
  },
);

export const getTabViewById = tool(
  async ({ id }) => {
    const response = interrupt<GetTabViewById['Input'], GetTabViewById['Return']>({
      name: 'getTabViewById',
      input: { id },
    });
    return response;
  },
  {
    name: 'getTabViewById',
    description: 'Get a view of a tab by ID (from getAllTabs).',
    schema: GetTabViewByIdSchema,
  },
);
