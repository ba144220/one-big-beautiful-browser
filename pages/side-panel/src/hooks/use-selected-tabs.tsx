import { useState, useEffect, createContext, useContext, useMemo } from 'react';

export const useSelectedTabs_ = () => {
  const [selectedTabs, setSelectedTabs] = useState<chrome.tabs.Tab[]>([]);
  const [allTabs, setAllTabs] = useState<chrome.tabs.Tab[]>([]);

  const sortedAllTabs = useMemo(() => {
    return (
      allTabs
        // Filter out selected tabs
        .filter(tab => !selectedTabs.some(t => t.id === tab.id))
        .sort((a, b) => (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0))
    );
  }, [allTabs, selectedTabs]);

  useEffect(() => {
    const fetchTabs = async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0].id) {
        setSelectedTabs([tabs[0]]);
      }
    };
    const fetchAllTabs = async () => {
      const tabs = await chrome.tabs.query({});
      setAllTabs(tabs);
    };
    fetchAllTabs();
    fetchTabs();
  }, []);

  // Handle tab change
  useEffect(() => {
    if (!chrome.tabs?.onActivated) return;
    const handleTabChange = async (activeInfo: chrome.tabs.TabActiveInfo) => {
      // If more than one tab is active, don't do anything.
      if (selectedTabs.length > 1) return;
      // If only one tab is active, replace it.
      const tab = await chrome.tabs.get(activeInfo.tabId);
      setSelectedTabs([tab]);

      const allTabs = await chrome.tabs.query({});
      setAllTabs(allTabs);
    };

    const handleUrlUpdate = async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      // changeInfo.url is only defined when the URL actually changes
      // Find the tab in the selectedTabs array and update it
      setSelectedTabs(selectedTabs => selectedTabs.map(t => (t.id === tabId ? tab : t)));
      setAllTabs(allTabs => allTabs.map(t => (t.id === tabId ? tab : t)));
    };

    chrome.tabs.onActivated.addListener(handleTabChange);
    chrome.tabs.onUpdated.addListener(handleUrlUpdate);

    // Clean up
    return () => {
      chrome.tabs.onActivated.removeListener(handleTabChange);
      chrome.tabs.onUpdated.removeListener(handleUrlUpdate);
    };
  }, [selectedTabs.length]);

  const removeSelectedTabById = (id: number) => {
    setSelectedTabs(selectedTabs => selectedTabs.filter(tab => tab.id !== id));
  };
  const appendTabId = async (id: number) => {
    const tab = await chrome.tabs.get(id);
    setSelectedTabs(selectedTabs => [...selectedTabs, tab]);
  };

  return { selectedTabs, removeSelectedTabById, appendTabId, sortedAllTabs };
};

// Create context for selected tabs
const SelectedTabsContext = createContext<{
  selectedTabs: chrome.tabs.Tab[];
  removeSelectedTabById: (id: number) => void;
  appendTabId: (id: number) => void;
  sortedAllTabs: chrome.tabs.Tab[];
}>({ selectedTabs: [], removeSelectedTabById: () => {}, appendTabId: () => {}, sortedAllTabs: [] });

// Provider for selected tabs
export const SelectedTabsProvider = ({ children }: { children: React.ReactNode }) => {
  const { selectedTabs, removeSelectedTabById, appendTabId, sortedAllTabs } = useSelectedTabs_();
  return (
    <SelectedTabsContext.Provider value={{ selectedTabs, removeSelectedTabById, appendTabId, sortedAllTabs }}>
      {children}
    </SelectedTabsContext.Provider>
  );
};

export const useSelectedTabs = () => {
  const { selectedTabs, removeSelectedTabById, appendTabId, sortedAllTabs } = useContext(SelectedTabsContext);
  return { selectedTabs, removeSelectedTabById, appendTabId, sortedAllTabs };
};
