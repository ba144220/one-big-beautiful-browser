import { z } from 'zod';

// Schema definitions for browser control actions
export const ClickElementSchema = z.object({
  selector: z.string().describe('CSS selector or unique identifier for the element to click'),
  tabId: z.number().optional().describe('Tab ID to perform action on. If not provided, uses active tab'),
});

export const TypeTextSchema = z.object({
  selector: z.string().describe('CSS selector or unique identifier for the input element'),
  text: z.string().describe('Text to type into the element'),
  tabId: z.number().optional().describe('Tab ID to perform action on. If not provided, uses active tab'),
  clear: z.boolean().optional().default(false).describe('Whether to clear existing text before typing'),
});

export const ScrollPageSchema = z.object({
  direction: z.enum(['up', 'down', 'left', 'right']).describe('Direction to scroll'),
  amount: z.number().optional().default(500).describe('Amount to scroll in pixels'),
  tabId: z.number().optional().describe('Tab ID to perform action on. If not provided, uses active tab'),
});

export const ScrollToElementSchema = z.object({
  selector: z.string().describe('CSS selector or unique identifier for the element to scroll to'),
  tabId: z.number().optional().describe('Tab ID to perform action on. If not provided, uses active tab'),
});

export const HoverElementSchema = z.object({
  selector: z.string().describe('CSS selector or unique identifier for the element to hover over'),
  tabId: z.number().optional().describe('Tab ID to perform action on. If not provided, uses active tab'),
});

export const PressKeySchema = z.object({
  key: z.string().describe('Key to press (e.g., "Enter", "Tab", "Escape", "ArrowDown")'),
  modifiers: z
    .array(z.enum(['Alt', 'Control', 'Meta', 'Shift']))
    .optional()
    .describe('Modifier keys to hold while pressing'),
  tabId: z.number().optional().describe('Tab ID to perform action on. If not provided, uses active tab'),
});

export const WaitForElementSchema = z.object({
  selector: z.string().describe('CSS selector or unique identifier for the element to wait for'),
  timeout: z.number().optional().default(5000).describe('Maximum time to wait in milliseconds'),
  tabId: z.number().optional().describe('Tab ID to perform action on. If not provided, uses active tab'),
});

export const GetElementInfoSchema = z.object({
  selector: z.string().describe('CSS selector or unique identifier for the element'),
  tabId: z.number().optional().describe('Tab ID to perform action on. If not provided, uses active tab'),
});

export const NavigateToUrlSchema = z.object({
  url: z.string().describe('URL to navigate to'),
  tabId: z.number().optional().describe('Tab ID to navigate. If not provided, uses active tab'),
});

export const TakeScreenshotSchema = z.object({
  tabId: z.number().optional().describe('Tab ID to take screenshot of. If not provided, uses active tab'),
  fullPage: z.boolean().optional().default(false).describe('Whether to capture the full page or just the viewport'),
});

// Type definitions for browser control actions
export type ClickElement = {
  name: 'clickElement';
  input: z.infer<typeof ClickElementSchema>;
};

export type TypeText = {
  name: 'typeText';
  input: z.infer<typeof TypeTextSchema>;
};

export type ScrollPage = {
  name: 'scrollPage';
  input: z.infer<typeof ScrollPageSchema>;
};

export type ScrollToElement = {
  name: 'scrollToElement';
  input: z.infer<typeof ScrollToElementSchema>;
};

export type HoverElement = {
  name: 'hoverElement';
  input: z.infer<typeof HoverElementSchema>;
};

export type PressKey = {
  name: 'pressKey';
  input: z.infer<typeof PressKeySchema>;
};

export type WaitForElement = {
  name: 'waitForElement';
  input: z.infer<typeof WaitForElementSchema>;
};

export type GetElementInfo = {
  name: 'getElementInfo';
  input: z.infer<typeof GetElementInfoSchema>;
};

export type NavigateToUrl = {
  name: 'navigateToUrl';
  input: z.infer<typeof NavigateToUrlSchema>;
};

export type TakeScreenshot = {
  name: 'takeScreenshot';
  input: z.infer<typeof TakeScreenshotSchema>;
};

// Union type for all browser control actions
export type BrowserControlType =
  | ClickElement
  | TypeText
  | ScrollPage
  | ScrollToElement
  | HoverElement
  | PressKey
  | WaitForElement
  | GetElementInfo
  | NavigateToUrl
  | TakeScreenshot;
