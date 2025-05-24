import { type InterruptType, type MessageContent } from '@extension/shared';
import { getTabView, getAllTabsInfo } from './tools';

export async function handleInterrupt(interruptValue: InterruptType): Promise<MessageContent> {
  switch (interruptValue.name) {
    case 'getActiveTabView':
      return getTabView();
    case 'getAllTabsInfo':
      return getAllTabsInfo();
    case 'getTabViewById':
      return getTabView(interruptValue.input.id);
    default:
      return [];
  }
}
