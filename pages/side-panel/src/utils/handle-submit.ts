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
  const allTabMetadata = allComplexMessages
    .flatMap(message => message?.tabMetadata)
    .filter(tabMetadata => tabMetadata !== undefined);

  const filteredSelectedTabs = selectedTabs.filter(tab => {
    // If the tab id is not in the messages, add it to the LLM input
    const tabId = tab.id || 0;
    // Find tab metadata with the tab id
    const tabMetadata = allTabMetadata.find(tabMetadata => tabMetadata.tabId === tabId);
    if (!tabMetadata) {
      return true;
    }
    // Check if the title is the same and the url
    if (tabMetadata.tabTitle !== tab.title || tabMetadata.tabUrl !== tab.url) {
      return true;
    }

    return false;
  });

  // Get all selected tabs
  const tabSnapshots: MessageContentComplex[] = [];

  for (const tab of filteredSelectedTabs) {
    const tabSnapshot = await getTabSnapshot(tab.id?.toString() ?? '');
    if (typeof tabSnapshot === 'string') {
      tabSnapshots.push({ type: 'text', text: tabSnapshot });
    } else {
      tabSnapshot.forEach(snapshot => {
        if (!tab.id || !tab.title || !tab.url) {
          return;
        }
        tabSnapshots.push({
          ...snapshot,
          hidden: true,
          tabMetadata: { tabId: tab.id, tabTitle: tab.title, tabFaviconUrl: tab.favIconUrl!, tabUrl: tab.url },
        });
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
