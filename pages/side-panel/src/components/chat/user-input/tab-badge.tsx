import { cn } from '@src/lib/utils';
import { XIcon } from 'lucide-react';
import { Img } from 'react-image';
export default function TabBadge({
  tabTitle,
  tabFaviconUrl,
  tabId,
  onRemove,
}: {
  tabTitle: string;
  tabFaviconUrl: string;
  tabId: number;
  onRemove: (tabId: number) => void;
}) {
  return (
    <button
      key={tabId}
      className="h-5 py-[1px] px-1 text-[10px] border rounded-sm flex flex-row justify-center items-center gap-1 cursor-pointer group hover:bg-accent"
      onClick={() => onRemove(tabId)}>
      <div className="flex flex-row items-center justify-center">
        <Img src={[tabFaviconUrl ?? '', '/earth.png']} alt="favicon" className={cn('w-3 h-3 group-hover:hidden')} />

        <div className="group-hover:block hidden">
          <XIcon className="w-3 h-3" />
        </div>
      </div>
      <span>{tabTitle?.length && tabTitle.length > 20 ? tabTitle?.slice(0, 20) + '...' : tabTitle}</span>
    </button>
  );
}
