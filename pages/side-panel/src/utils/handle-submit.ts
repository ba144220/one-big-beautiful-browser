import { type Message, type MessageContentComplex } from '@langchain/langgraph-sdk';
import { getTabSnapshot } from './tools';

export const handleSubmit = async (
  userInput: string,
  messages: Message[],
  selectedTabs: chrome.tabs.Tab[],
): Promise<Message[]> => {
  // Filter selected tabs
  // If the tab id is in the messages, no need to add it to the LLM input
  // Get all the tab ids from the messages
  const allHumanMessages = messages.filter(message => message.type === 'human');
  const allComplexMessages = allHumanMessages
    .filter(message => typeof message.content !== 'string')
    .flatMap(message => message.content as MessageContentComplex[]);
  const allTabIds = allComplexMessages.flatMap(message => message.tabId).filter(tabId => tabId !== undefined);
  const filteredSelectedTabs = selectedTabs.filter(tab => !allTabIds.includes(tab.id!.toString()));

  // Get all selected tabs
  const tabSnapshots: MessageContentComplex[] = [];

  for (const tab of filteredSelectedTabs) {
    const tabSnapshot = await getTabSnapshot(tab.id!.toString());
    if (typeof tabSnapshot === 'string') {
      tabSnapshots.push({ type: 'text', text: tabSnapshot });
    } else {
      tabSnapshot.forEach(snapshot => {
        tabSnapshots.push({ ...snapshot, hidden: true, tabId: tab.id!.toString() });
      });
    }
  }

  return [
    {
      type: 'human',
      content: [
        ...tabSnapshots,
        {
          type: 'text',
          text: userInput,
        },
      ],
    },
  ];
};
