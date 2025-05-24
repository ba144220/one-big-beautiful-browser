import { z } from 'zod';

// Get Active Tab View
export type GetActiveTabView = {
  name: 'getActiveTabView';
};

// Get All Tabs Info
export type GetAllTabsInfo = {
  name: 'getAllTabsInfo';
};

// Get Tab By Id
export const GetTabViewByIdSchema = z.object({
  id: z.string().describe('The ID of the tab to get the view of.'),
});
export type GetTabViewById = {
  name: 'getTabViewById';
  input: z.infer<typeof GetTabViewByIdSchema>;
};

export type InterruptType = GetTabViewById | GetAllTabsInfo | GetActiveTabView;
