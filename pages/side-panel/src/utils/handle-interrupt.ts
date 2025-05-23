import { type InterruptType } from '@extension/shared';
import type { MessageContent } from '@langchain/langgraph-sdk';

export async function handleInterrupt(interruptValue: InterruptType): Promise<MessageContent> {
  switch (interruptValue.name) {
    case 'getActiveTabView':
      return [
        {
          type: 'text',
          text: 'This is an image of Iwo Jima',
        },
        {
          type: 'image_url',
          image_url: {
            url: `https://upload.wikimedia.org/wikipedia/commons/1/16/Raising_the_Flag_on_Iwo_Jima%2C_by_Joe_Rosenthal.jpg`,
          },
        },
      ];
    case 'getAllTabsInfo':
      return [
        {
          type: 'text',
          text: 'This is a list of all tabs',
        },
      ];
    case 'getTabViewById':
      return [
        {
          type: 'text',
          text: 'This is a list of all tabs',
        },
      ];
    default:
      return [];
  }
}
