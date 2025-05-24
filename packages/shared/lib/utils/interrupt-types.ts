import { z } from 'zod';

// Get All Tabs Info
export type GetAllTabsInfo = {
  name: 'getAllTabsInfo';
};

// Get Active Tab View
export type GetActiveTabMarkdownContent = {
  name: 'getActiveTabMarkdownContent';
};

// Get Tab By Id
export const GetTabMarkdownContentByIdSchema = z.object({
  id: z.string().describe('The ID of the tab to get the view of.'),
});
export type GetTabMarkdownContentById = {
  name: 'getTabMarkdownContentById';
  input: z.infer<typeof GetTabMarkdownContentByIdSchema>;
};

export const GetTabMarkdownContentsByIdsSchema = z.object({
  ids: z.array(z.string()).describe('The IDs of the tabs to get the views of.'),
});
export type GetTabMarkdownContentsByIds = {
  name: 'getTabMarkdownContentsByIds';
  input: z.infer<typeof GetTabMarkdownContentsByIdsSchema>;
};

export type InterruptType =
  | GetAllTabsInfo
  | GetActiveTabMarkdownContent
  | GetTabMarkdownContentById
  | GetTabMarkdownContentsByIds;
