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
  type ClickElement,
  ClickElementSchema,
  type TypeText,
  TypeTextSchema,
  type ScrollPage,
  ScrollPageSchema,
  type ScrollToElement,
  ScrollToElementSchema,
  type HoverElement,
  HoverElementSchema,
  type PressKey,
  PressKeySchema,
  type WaitForElement,
  WaitForElementSchema,
  type GetElementInfo,
  GetElementInfoSchema,
  type NavigateToUrl,
  NavigateToUrlSchema,
  type TakeScreenshot,
  TakeScreenshotSchema,
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
    description:
      'Get the content of the active tab in the browser, converted to markdown format. This method is suitable for reading all textual data from the webpage.',
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
    description:
      'Get the content of a tab by ID, converted to markdown format. This method is suitable for reading all textual data from the webpage.',
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
    description:
      'Simultaneously get views of multiple tabs by IDs, converted to markdown format. This method is suitable for reading all textual data from the webpage.',
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
    description:
      'Get a simplified HTML snapshot of the active tab in the browser. This method is suitable for checking all the interactive elements on the page, such as buttons, links, and input fields.',
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
    description:
      'Get a simplified HTML snapshot of a tab by ID. This method is suitable for checking all the interactive elements on the page, such as buttons, links, and input fields.',
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
    description:
      'Simultaneously get simplified HTML snapshots of multiple tabs by IDs. This method is suitable for checking all the interactive elements on the page, such as buttons, links, and input fields.',
    schema: GetTabSnapshotsByIdsSchema,
  },
);

// Browser Control Tools
const clickElement = tool(
  async ({ selector, tabId }) => {
    const response = await interrupt<ClickElement, MessageContent>({
      name: 'clickElement',
      input: { selector, tabId },
    });

    return response;
  },
  {
    name: 'clickElement',
    description:
      'Click on an element in the browser using CSS selector or XPath. Elements are identified by unique selectors from enhanced snapshots.',
    schema: ClickElementSchema,
  },
);

const typeText = tool(
  async ({ selector, text, clear, tabId }) => {
    const response = await interrupt<TypeText, MessageContent>({
      name: 'typeText',
      input: { selector, text, clear, tabId },
    });

    return response;
  },
  {
    name: 'typeText',
    description: 'Type text into an input field or textarea. Can optionally clear existing content first.',
    schema: TypeTextSchema,
  },
);

const scrollPage = tool(
  async ({ direction, amount, tabId }) => {
    const response = await interrupt<ScrollPage, MessageContent>({
      name: 'scrollPage',
      input: { direction, amount, tabId },
    });

    return response;
  },
  {
    name: 'scrollPage',
    description: 'Scroll the page in a specified direction by a certain amount.',
    schema: ScrollPageSchema,
  },
);

const scrollToElement = tool(
  async ({ selector, tabId }) => {
    const response = await interrupt<ScrollToElement, MessageContent>({
      name: 'scrollToElement',
      input: { selector, tabId },
    });

    return response;
  },
  {
    name: 'scrollToElement',
    description: 'Scroll to bring a specific element into view.',
    schema: ScrollToElementSchema,
  },
);

const hoverElement = tool(
  async ({ selector, tabId }) => {
    const response = await interrupt<HoverElement, MessageContent>({
      name: 'hoverElement',
      input: { selector, tabId },
    });

    return response;
  },
  {
    name: 'hoverElement',
    description: 'Hover over an element to trigger hover effects or reveal hidden content.',
    schema: HoverElementSchema,
  },
);

const pressKey = tool(
  async ({ key, modifiers, tabId }) => {
    const response = await interrupt<PressKey, MessageContent>({
      name: 'pressKey',
      input: { key, modifiers, tabId },
    });

    return response;
  },
  {
    name: 'pressKey',
    description: 'Press a key or key combination (e.g., Enter, Escape, Ctrl+A).',
    schema: PressKeySchema,
  },
);

const waitForElement = tool(
  async ({ selector, timeout, tabId }) => {
    const response = await interrupt<WaitForElement, MessageContent>({
      name: 'waitForElement',
      input: { selector, timeout, tabId },
    });

    return response;
  },
  {
    name: 'waitForElement',
    description: 'Wait for an element to appear in the DOM within a specified timeout.',
    schema: WaitForElementSchema,
  },
);

const getElementInfo = tool(
  async ({ selector, tabId }) => {
    const response = await interrupt<GetElementInfo, MessageContent>({
      name: 'getElementInfo',
      input: { selector, tabId },
    });

    return response;
  },
  {
    name: 'getElementInfo',
    description: 'Get detailed information about an element (position, size, attributes, etc.).',
    schema: GetElementInfoSchema,
  },
);

const navigateToUrl = tool(
  async ({ url, tabId }) => {
    const response = await interrupt<NavigateToUrl, MessageContent>({
      name: 'navigateToUrl',
      input: { url, tabId },
    });

    return response;
  },
  {
    name: 'navigateToUrl',
    description: 'Navigate to a specific URL in the browser tab.',
    schema: NavigateToUrlSchema,
  },
);

const takeScreenshot = tool(
  async ({ fullPage, tabId }) => {
    const response = await interrupt<TakeScreenshot, MessageContent>({
      name: 'takeScreenshot',
      input: { fullPage, tabId },
    });

    return response;
  },
  {
    name: 'takeScreenshot',
    description: 'Take a screenshot of the current page or viewport.',
    schema: TakeScreenshotSchema,
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
  // Browser Control Tools
  clickElement,
  typeText,
  scrollPage,
  scrollToElement,
  hoverElement,
  pressKey,
  waitForElement,
  getElementInfo,
  navigateToUrl,
  takeScreenshot,
];
