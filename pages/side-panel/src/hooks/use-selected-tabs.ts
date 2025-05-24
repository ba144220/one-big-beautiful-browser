import { useState, useEffect } from 'react';

export const useSelectedTabs = () => {
  const [selectedTabs, setSelectedTabs] = useState<chrome.tabs.Tab[]>([]);
  useEffect(() => {
    const fetchTabs = async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0].id) {
        setSelectedTabs([tabs[0]]);
      }
    };
    fetchTabs();
  }, []);
  // Handle tab change
  useEffect(() => {
    if (!chrome.tabs?.onActivated) return;
    const handler = async (activeInfo: chrome.tabs.TabActiveInfo) => {
      // If more than one tab is active, don't do anything.
      if (selectedTabs.length > 1) return;
      // If only one tab is active, replace it.
      const tab = await chrome.tabs.get(activeInfo.tabId);
      setSelectedTabs([tab]);
    };

    chrome.tabs.onActivated.addListener(handler);

    // Clean up
    return () => {
      chrome.tabs.onActivated.removeListener(handler);
    };
  }, [selectedTabs.length]);

  const removeSelectedTabById = (id: number) => {
    setSelectedTabs(selectedTabs => selectedTabs.filter(tab => tab.id !== id));
  };
  const appendTabId = async (id: number) => {
    const tab = await chrome.tabs.get(id);
    setSelectedTabs(selectedTabs => [...selectedTabs, tab]);
  };

  return { selectedTabs, removeSelectedTabById, appendTabId };
};
