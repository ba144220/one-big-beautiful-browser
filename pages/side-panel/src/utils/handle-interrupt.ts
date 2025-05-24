import { type InterruptType, type MessageContent } from '@extension/shared';
import {
  getTabMarkdownContent,
  getAllTabsInfo,
  getTabMarkdownContents,
  getTabSnapshot,
  getTabSnapshots,
  handleBrowserControl,
} from './tools';

export async function handleInterrupt(interruptValue: InterruptType): Promise<MessageContent> {
  switch (interruptValue.name) {
    case 'getAllTabsInfo':
      return getAllTabsInfo();
    case 'getActiveTabMarkdownContent':
      return getTabMarkdownContent();
    case 'getTabMarkdownContentById':
      return getTabMarkdownContent(interruptValue.input.id);
    case 'getTabMarkdownContentsByIds':
      return getTabMarkdownContents(interruptValue.input.ids);
    case 'getActiveTabSnapshot':
      return getTabSnapshot();
    case 'getTabSnapshotById':
      return getTabSnapshot(interruptValue.input.id);
    case 'getTabSnapshotsByIds':
      return getTabSnapshots(interruptValue.input.ids);
    // Browser control actions
    case 'clickElement':
    case 'typeText':
    case 'scrollPage':
    case 'scrollToElement':
    case 'hoverElement':
    case 'pressKey':
    case 'waitForElement':
    case 'getElementInfo':
    case 'navigateToUrl':
    case 'takeScreenshot':
      return handleBrowserControl(interruptValue);
    default:
      return [];
  }
}
