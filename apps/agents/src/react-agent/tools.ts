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
  type GetActiveTabSnapshot,
  type GetTabSnapshotById,
  GetTabSnapshotByIdSchema,
  type GetTabSnapshotsByIds,
  GetTabSnapshotsByIdsSchema,
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

const getActiveTabSnapshot = tool(
  async () => {
    const response = await interrupt<GetActiveTabSnapshot, MessageContent>({
      name: 'getActiveTabSnapshot',
    });

    return response;
  },
  {
    name: 'getActiveTabSnapshot',
    description: 'Get a simplified HTML snapshot of the active tab in the browser',
  },
);

const getTabSnapshotById = tool(
  async ({ id }) => {
    const response = await interrupt<GetTabSnapshotById, MessageContent>({
      name: 'getTabSnapshotById',
      input: { id },
    });

    return response;
  },
  {
    name: 'getTabSnapshotById',
    description: 'Get a simplified HTML snapshot of a tab by ID.',
    schema: GetTabSnapshotByIdSchema,
  },
);

const getTabSnapshotsByIds = tool(
  async ({ ids }) => {
    const response = await interrupt<GetTabSnapshotsByIds, MessageContent>({
      name: 'getTabSnapshotsByIds',
      input: { ids },
    });

    return response;
  },
  {
    name: 'getTabSnapshotsByIds',
    description: 'Simultaneously get simplified HTML snapshots of multiple tabs by IDs.',
    schema: GetTabSnapshotsByIdsSchema,
  },
);

export const tools = [
  getActiveTabMarkdownContent,
  getAllTabsInfo,
  getTabMarkdownContentById,
  getTabMarkdownContentsByIds,
  getActiveTabSnapshot,
  getTabSnapshotById,
  getTabSnapshotsByIds,
];
