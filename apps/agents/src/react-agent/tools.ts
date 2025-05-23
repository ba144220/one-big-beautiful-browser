import { tool } from '@langchain/core/tools';
import { interrupt } from '@langchain/langgraph';
import {
  type GetActiveTabView,
  type GetAllTabsInfo,
  type GetTabViewById,
  GetTabViewByIdSchema,
  type MessageContent,
} from '@extension/shared';

const getActiveTabView = tool(
  async () => {
    const response = interrupt<GetActiveTabView, MessageContent>({
      name: 'getActiveTabView',
    });
    return response;
  },
  {
    name: 'getActiveTabView',
    description: 'Get the view of the active tab in the browser',
  },
);

const getAllTabsInfo = tool(
  async () => {
    const response = interrupt<GetAllTabsInfo, MessageContent>({
      name: 'getAllTabsInfo',
    });
    return response;
  },
  {
    name: 'getAllTabsInfo',
    description: "Get all tabs' info in the browser. Return a list of tabs with their title, url, and ID",
  },
);

const getTabViewById = tool(
  async ({ id }) => {
    const response = interrupt<GetTabViewById, MessageContent>({
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

export const tools = [getActiveTabView, getAllTabsInfo, getTabViewById];
