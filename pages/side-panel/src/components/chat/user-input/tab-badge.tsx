import { useSelectedTabs } from '@src/hooks/use-selected-tabs';
import { cn } from '@src/lib/utils';
import { LoaderCircleIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
export default function TabBadge({ tab }: { tab: chrome.tabs.Tab }) {
  const { removeSelectedTabById } = useSelectedTabs();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  return (
    <button
      key={tab.id}
      className="py-[1px] px-[4px] text-[10px] border rounded-sm flex flex-row justify-center items-center gap-1 cursor-pointer group hover:bg-accent"
      onClick={() => removeSelectedTabById(tab.id ?? 0)}>
      <div className="flex flex-row items-center justify-center">
        <img
          src={tab.favIconUrl}
          alt="favicon"
          className={cn('w-3 h-3 group-hover:hidden', (!imageLoaded || imageError) && 'hidden')}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />

        <LoaderCircleIcon
          className={cn('w-3 h-3 group-hover:hidden animate-spin opacity-70', imageLoaded && !imageError && 'hidden')}
          strokeWidth={2}
        />

        <div className="group-hover:block hidden">
          <XIcon className="w-3 h-3" />
        </div>
      </div>
      <span>{tab.title?.length && tab.title.length > 20 ? tab.title?.slice(0, 20) + '...' : tab.title}</span>
    </button>
  );
}
