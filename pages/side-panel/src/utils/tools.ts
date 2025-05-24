import { type MessageContent } from '@extension/shared';
import { createHtmlSnapshot } from './snapshot';
import { htmlToMarkdown } from './markdown';

export {
  getTabMarkdownContentExt as getTabMarkdownContent,
  getTabMarkdownContentsExt as getTabMarkdownContents,
  getAllTabsInfo,
  getTabSnapshotExt as getTabSnapshot,
  getTabSnapshotsExt as getTabSnapshots,
};

/**
 * Gets the content of a tab and returns it as a MessageContent array with Markdown formatting
 * If id is not provided, gets the active tab
 * If id is provided, gets the tab with the specified ID
 */
async function getTabMarkdownContentExt(id?: string): Promise<MessageContent> {
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
    const content = await getTabMarkdownContent(tab.id!);

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
 * Gets the content of multiple tabs and returns it as a MessageContent array with Markdown formatting
 * If ids are not provided, gets the active tab
 * If ids are provided, gets the content of all specified tabs
 */
export async function getTabMarkdownContentsExt(ids?: string[]): Promise<MessageContent> {
  try {
    // If no ids provided, default to active tab
    if (!ids || ids.length === 0) {
      return getTabMarkdownContentExt(); // Reuse existing function for active tab
    }

    // Process each tab ID
    const tabPromises = ids.map(async id => {
      try {
        const tabId = parseInt(id, 10);
        if (isNaN(tabId)) {
          return `Tab ID ${id}: Error - Invalid tab ID format`;
        }

        // Get tab info
        const tab = await chrome.tabs.get(tabId);

        // Get tab content
        const content = await getTabMarkdownContent(tab.id!);

        return `Tab ID ${id}: ${tab.title || 'Untitled'} (${tab.url || 'No URL'})\n\n${content}`;
      } catch (error) {
        console.error(`Error processing tab ID ${id}:`, error);
        return `Tab ID ${id}: Error - ${error instanceof Error ? error.message : String(error)}`;
      }
    });

    // Wait for all tab content to be fetched
    const tabContents = await Promise.all(tabPromises);

    // Format the response with clear tab ID associations
    return [
      {
        type: 'text',
        text: `Content from ${tabContents.length} tabs:\n\n${tabContents.join('\n\n---\n\n')}`,
      },
    ];
  } catch (error) {
    console.error('Error getting multiple tab views:', error);
    return [
      {
        type: 'text',
        text: `Error retrieving content from multiple tabs: ${error instanceof Error ? error.message : String(error)}`,
      },
    ];
  }
}

/**
 * Gets information about all open tabs and returns it as a MessageContent array
 */
async function getAllTabsInfo(): Promise<MessageContent> {
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
 * Helper function to get the Markdown content of a tab using executeScript and htmlToMarkdown
 */
async function getTabMarkdownContent(tabId: number): Promise<string> {
  return htmlToMarkdown(await getTabHtmlContent(tabId));
}

/**
 * Helper function to get the HTML content of a tab using executeScript
 */
async function getTabHtmlContent(tabId: number): Promise<string> {
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

/**
 * Helper function to get the snapshot of a tab using executeScript
 */
async function getTabSnapshot(tabId: number): Promise<string> {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: createHtmlSnapshot(),
    });

    return (results[0]?.result as string) || 'No snapshot created';
  } catch (error) {
    console.error('Error executing script:', error);
    throw new Error(`Failed to get tab snapshot: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets the snapshot of a tab and returns it as a MessageContent array
 * If id is not provided, gets the active tab
 * If id is provided, gets the tab with the specified ID
 */
async function getTabSnapshotExt(id?: string): Promise<MessageContent> {
  try {
    let tab;

    if (id === undefined) {
      // Get active tab
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!activeTab || !activeTab.id) {
        return [{ type: 'text', text: 'Error: No active tab found' }];
      }

      tab = activeTab;
    } else {
      // Get tab by ID
      const tabId = parseInt(id, 10);
      if (isNaN(tabId)) {
        return [{ type: 'text', text: `Error: Invalid tab ID: ${id}` }];
      }
      tab = await chrome.tabs.get(tabId);
    }
    // Get the tab snapshot
    const content = await getTabSnapshot(tab.id!);

    return [
      {
        type: 'text',
        text: `Snapshot from tab: ${tab.title || 'Untitled'} (${tab.url || 'No URL'})\n\n${content}`,
      },
    ];
  } catch (error) {
    console.error('Error getting tab snapshot:', error);
    return [
      {
        type: 'text',
        text: `Error retrieving tab snapshot${id ? ` for ID ${id}` : ''}: ${error instanceof Error ? error.message : String(error)}`,
      },
    ];
  }
}

/**
 * Gets the snapshot of multiple tabs and returns it as a MessageContent array
 * If ids are not provided, gets the active tab
 * If ids are provided, gets the snapshot of all specified tabs
 */
export async function getTabSnapshotsExt(ids?: string[]): Promise<MessageContent> {
  try {
    // If no ids provided, default to active tab
    if (!ids || ids.length === 0) {
      return getTabSnapshotExt(); // Reuse existing function for active tab
    }

    // Process each tab ID
    const tabPromises = ids.map(async id => {
      try {
        const tabId = parseInt(id, 10);
        if (isNaN(tabId)) {
          return `Tab ID ${id}: Error - Invalid tab ID format`;
        }

        // Get tab info
        const tab = await chrome.tabs.get(tabId);

        // Get tab snapshot
        const content = await getTabSnapshot(tab.id!);

        return `Tab ID ${id}: ${tab.title || 'Untitled'} (${tab.url || 'No URL'})\n\n${content}`;
      } catch (error) {
        console.error(`Error processing tab ID ${id}:`, error);
        return `Tab ID ${id}: Error - ${error instanceof Error ? error.message : String(error)}`;
      }
    });

    // Wait for all tab content to be fetched
    const tabContents = await Promise.all(tabPromises);

    // Format the response with clear tab ID associations
    return [
      {
        type: 'text',
        text: `Snapshots from ${tabContents.length} tabs:\n\n${tabContents.join('\n\n---\n\n')}`,
      },
    ];
  } catch (error) {
    console.error('Error getting multiple tab snapshots:', error);
    return [
      {
        type: 'text',
        text: `Error retrieving snapshots from multiple tabs: ${error instanceof Error ? error.message : String(error)}`,
      },
    ];
  }
}
