import { z } from 'zod';

// Get Active Tab View
export type GetActiveTabView = {
  Input: {
    name: 'getActiveTabView';
  };
  Return: string;
};

// Get All Tabs Info
export type GetAllTabsInfo = {
  Input: {
    name: 'getAllTabsInfo';
  };
  Return: string;
};

// Get Tab By Id
export const GetTabViewByIdSchema = z.object({
  id: z.string().describe('The ID of the tab to get the view of.'),
});
export type GetTabViewById = {
  Input: {
    name: 'getTabViewById';
    input: z.infer<typeof GetTabViewByIdSchema>;
  };
  Return: string;
};

export type InterruptType = GetTabViewById['Input'] | GetAllTabsInfo['Input'] | GetActiveTabView['Input'];
export type SubmitType = GetTabViewById['Return'] | GetAllTabsInfo['Return'] | GetActiveTabView['Return'];
