import { cn } from '@src/lib/utils';
import { XIcon } from 'lucide-react';
import { Img } from 'react-image';
export default function TabBadge({
  tabTitle,
  tabFaviconUrl,
  tabId,
  onRemove,
  isActive = true,
}: {
  tabTitle: string;
  tabFaviconUrl: string;
  tabId: number;
  onRemove: (tabId: number) => void;
  isActive?: boolean;
}) {
  return (
    <button
      key={tabId}
      className={cn(
        'h-5 py-[1px] px-1 text-[10px] border rounded-sm flex flex-row justify-center items-center gap-1  ',
        isActive && 'group hover:bg-accent cursor-pointer',
      )}
      onClick={() => {
        if (isActive) {
          onRemove(tabId);
        }
      }}
      disabled={!isActive}>
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
