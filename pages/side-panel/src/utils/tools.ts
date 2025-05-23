import { type MessageContent } from '@extension/shared';

/**
 * Gets the content of a tab and returns it as a MessageContent array
 * If id is not provided, gets the active tab
 * If id is provided, gets the tab with the specified ID
 */
export async function getTabView(id?: string): Promise<MessageContent> {
  try {
    let tab;

    if (id === undefined) {
      // Get active tab (former getActiveTabView functionality)
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!activeTab || !activeTab.id) {
        return [{ type: 'text', text: 'Error: No active tab found' }];
      }

      tab = activeTab;
    } else {
      // Get tab by ID (former getTabViewById functionality)
      const tabId = parseInt(id, 10);
      if (isNaN(tabId)) {
        return [{ type: 'text', text: `Error: Invalid tab ID: ${id}` }];
      }

      tab = await chrome.tabs.get(tabId);
    }

    // Get the tab content
    const content = await getTabContent(tab.id!);

    return [
      {
        type: 'text',
        text: `Content from tab: ${tab.title || 'Untitled'} (${tab.url || 'No URL'})\n\n${content}`,
      },
    ];
  } catch (error) {
    console.error('Error getting tab view:', error);
    return [
      {
        type: 'text',
        text: `Error retrieving tab content${id ? ` for ID ${id}` : ''}: ${error instanceof Error ? error.message : String(error)}`,
      },
    ];
  }
}

/**
 * Gets information about all open tabs and returns it as a MessageContent array
 */
export async function getAllTabsInfo(): Promise<MessageContent> {
  try {
    // Query for all tabs
    const tabs = await chrome.tabs.query({});

    if (!tabs || tabs.length === 0) {
      return [{ type: 'text', text: 'No tabs are currently open' }];
    }

    // Format the tabs information
    const tabsInfo = tabs
      .map(tab => {
        return `Tab ID: ${tab.id}\nTitle: ${tab.title || 'Untitled'}\nURL: ${tab.url || 'No URL'}\n`;
      })
      .join('\n');

    return [
      {
        type: 'text',
        text: `Found ${tabs.length} tabs:\n\n${tabsInfo}`,
      },
    ];
  } catch (error) {
    console.error('Error getting all tabs info:', error);
    return [
      {
        type: 'text',
        text: `Error retrieving tabs information: ${error instanceof Error ? error.message : String(error)}`,
      },
    ];
  }
}

/**
 * Helper function to get the content of a tab using executeScript
 */
async function getTabContent(tabId: number): Promise<string> {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // Get the text content of the page
        const text = document.body.innerText;
        return text;
      },
    });

    return (results[0]?.result as string) || 'No content found';
  } catch (error) {
    console.error('Error executing script:', error);
    throw new Error(`Failed to get tab content: ${error instanceof Error ? error.message : String(error)}`);
  }
}
