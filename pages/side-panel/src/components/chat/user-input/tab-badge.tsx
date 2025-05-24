import { useSelectedTabs } from '@src/hooks/use-selected-tabs';
import { cn } from '@src/lib/utils';
import { XIcon } from 'lucide-react';
import { Img } from 'react-image';
export default function TabBadge({ tab }: { tab: chrome.tabs.Tab }) {
  const { removeSelectedTabById } = useSelectedTabs();

  return (
    <button
      key={tab.id}
      className="h-5 py-[1px] px-1 text-[10px] border rounded-sm flex flex-row justify-center items-center gap-1 cursor-pointer group hover:bg-accent"
      onClick={() => removeSelectedTabById(tab.id ?? 0)}>
      <div className="flex flex-row items-center justify-center">
        <Img src={[tab.favIconUrl ?? '', '/earth.png']} alt="favicon" className={cn('w-3 h-3 group-hover:hidden')} />

        <div className="group-hover:block hidden">
          <XIcon className="w-3 h-3" />
        </div>
      </div>
      <span>{tab.title?.length && tab.title.length > 20 ? tab.title?.slice(0, 20) + '...' : tab.title}</span>
    </button>
  );
}
