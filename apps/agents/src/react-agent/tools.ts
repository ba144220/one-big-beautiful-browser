import { tool } from '@langchain/core/tools';
import { interrupt } from '@langchain/langgraph';
import {
  type GetActiveTabMarkdownContent,
  type GetAllTabsInfo,
  type GetTabMarkdownContentById,
  GetTabMarkdownContentByIdSchema,
  type GetTabMarkdownContentsByIds,
  GetTabMarkdownContentsByIdsSchema,
  type MessageContent,
} from '@extension/shared';

const getAllTabsInfo = tool(
  async () => {
    const response = await interrupt<GetAllTabsInfo, MessageContent>({
      name: 'getAllTabsInfo',
    });

    return response;
  },
  {
    name: 'getAllTabsInfo',
    description: "Get all tabs' metadata in the browser. Return a list of tabs with their title, url, and ID",
  },
);

const getActiveTabMarkdownContent = tool(
  async () => {
    const response = await interrupt<GetActiveTabMarkdownContent, MessageContent>({
      name: 'getActiveTabMarkdownContent',
    });

    return response;
  },
  {
    name: 'getActiveTabMarkdownContent',
    description: 'Get the content of the active tab in the browser, converted to markdown format',
  },
);

const getTabMarkdownContentById = tool(
  async ({ id }) => {
    const response = await interrupt<GetTabMarkdownContentById, MessageContent>({
      name: 'getTabMarkdownContentById',
      input: { id },
    });

    return response;
  },
  {
    name: 'getTabMarkdownContentById',
    description: 'Get the content of a tab by ID, converted to markdown format.',
    schema: GetTabMarkdownContentByIdSchema,
  },
);

const getTabMarkdownContentsByIds = tool(
  async ({ ids }) => {
    const response = await interrupt<GetTabMarkdownContentsByIds, MessageContent>({
      name: 'getTabMarkdownContentsByIds',
      input: { ids },
    });

    return response;
  },
  {
    name: 'getTabMarkdownContentsByIds',
    description: 'Simultaneously get views of multiple tabs by IDs, converted to markdown format.',
    schema: GetTabMarkdownContentsByIdsSchema,
  },
);

export const tools = [
  getActiveTabMarkdownContent,
  getAllTabsInfo,
  getTabMarkdownContentById,
  getTabMarkdownContentsByIds,
];
