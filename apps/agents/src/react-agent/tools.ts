import { tool } from '@langchain/core/tools';
import { interrupt } from '@langchain/langgraph';
import {
  type GetActiveTabView,
  type GetAllTabsInfo,
  type GetTabViewById,
  GetTabViewByIdSchema,
  type GetTabViewsByIds,
  GetTabViewsByIdsSchema,
  type MessageContent,
} from '@extension/shared';
import TurndownService from 'turndown';

// Initialize turndown service for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
});

// Helper function to convert HTML to Markdown
const htmlToMarkdown = (html: string): string => {
  return turndownService.turndown(html);
};

// Helper function to process HTML content from interrupt calls
const processHtmlContent = (content: MessageContent): MessageContent => {
  if (typeof content === 'string') {
    return content;
  }

  return content.map(item => {
    if (item.type === 'text' && item.text) {
      // Check if the text appears to be HTML (contains tags)
      if (/<[a-z][\s\S]*>/i.test(item.text)) {
        return {
          type: 'text',
          text: htmlToMarkdown(item.text),
        };
      }
    }
    return item;
  });
};

const getActiveTabView = tool(
  async () => {
    const response = await interrupt<GetActiveTabView, MessageContent>({
      name: 'getActiveTabView',
    });

    return processHtmlContent(response);
  },
  {
    name: 'getActiveTabView',
    description: 'Get the view of the active tab in the browser converted to markdown format',
  },
);

const getAllTabsInfo = tool(
  async () => {
    const response = await interrupt<GetAllTabsInfo, MessageContent>({
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
    const response = await interrupt<GetTabViewById, MessageContent>({
      name: 'getTabViewById',
      input: { id },
    });

    return processHtmlContent(response);
  },
  {
    name: 'getTabViewById',
    description: 'Get a view of a tab by ID (from getAllTabs) converted to markdown format.',
    schema: GetTabViewByIdSchema,
  },
);

const getTabViewsByIds = tool(
  async ({ ids }) => {
    const response = await interrupt<GetTabViewsByIds, MessageContent>({
      name: 'getTabViewsByIds',
      input: { ids },
    });

    return response;
  },
  {
    name: 'getTabViewsByIds',
    description: 'Simultaneously get views of multiple tabs by IDs (from getAllTabs) converted to markdown format.',
    schema: GetTabViewsByIdsSchema,
  },
);

export const tools = [getActiveTabView, getAllTabsInfo, getTabViewById, getTabViewsByIds];
