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

type ImageDetail = 'auto' | 'low' | 'high';
type MessageContentImageUrl = {
  type: 'image_url';
  image_url:
    | string
    | {
        url: string;
        detail?: ImageDetail | undefined;
      };
};
type MessageContentText = {
  type: 'text';
  text: string;
};
type MessageContentComplex = MessageContentText | MessageContentImageUrl;

export type MessageContent = string | MessageContentComplex[];
