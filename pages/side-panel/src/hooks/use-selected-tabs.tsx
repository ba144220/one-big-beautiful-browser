import { useState, useEffect, createContext, useContext } from 'react';

export const useSelectedTabs_ = () => {
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
    const handleTabChange = async (activeInfo: chrome.tabs.TabActiveInfo) => {
      // If more than one tab is active, don't do anything.
      if (selectedTabs.length > 1) return;
      // If only one tab is active, replace it.
      const tab = await chrome.tabs.get(activeInfo.tabId);
      setSelectedTabs([tab]);
    };

    const handleUrlUpdate = async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      // changeInfo.url is only defined when the URL actually changes
      // Find the tab in the selectedTabs array and update it
      console.log('tabId', tabId);
      setSelectedTabs(selectedTabs => selectedTabs.map(t => (t.id === tabId ? tab : t)));
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

  return { selectedTabs, removeSelectedTabById, appendTabId };
};

// Create context for selected tabs
const SelectedTabsContext = createContext<{
  selectedTabs: chrome.tabs.Tab[];
  removeSelectedTabById: (id: number) => void;
  appendTabId: (id: number) => void;
}>({ selectedTabs: [], removeSelectedTabById: () => {}, appendTabId: () => {} });

// Provider for selected tabs
export const SelectedTabsProvider = ({ children }: { children: React.ReactNode }) => {
  const { selectedTabs, removeSelectedTabById, appendTabId } = useSelectedTabs_();
  return (
    <SelectedTabsContext.Provider value={{ selectedTabs, removeSelectedTabById, appendTabId }}>
      {children}
    </SelectedTabsContext.Provider>
  );
};

export const useSelectedTabs = () => {
  const { selectedTabs, removeSelectedTabById, appendTabId } = useContext(SelectedTabsContext);
  return { selectedTabs, removeSelectedTabById, appendTabId };
};
