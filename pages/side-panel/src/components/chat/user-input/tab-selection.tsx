import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@src/components/ui/dropdown-menu';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@src/components/ui/command';
import { PlusIcon } from 'lucide-react';
import { useSelectedTabs } from '@src/hooks/use-selected-tabs';
import { cn } from '@src/lib/utils';
import { useState } from 'react';
import { Img } from 'react-image';

const TabItem = ({ tab, onSelect }: { tab: chrome.tabs.Tab; onSelect: () => void }) => {
  const { appendTabId } = useSelectedTabs();
  return (
    <CommandItem
      onSelect={() => {
        appendTabId(tab.id ?? 0);
        onSelect();
      }}
      key={tab.id}
      className="flex flex-row items-center gap-1 cursor-pointer w-full overflow-hidden"
      value={tab.title + '|' + tab.url + '|' + tab.id}>
      <div className="shrink-0 h-4 w-4 flex items-center justify-center">
        <Img src={[tab.favIconUrl ?? '', '/earth.png']} alt={tab.title} className={cn('w-3 h-3 rounded-sm')} />
      </div>
      <div className="overflow-hidden text-ellipsis whitespace-nowrap">{tab.title}</div>
    </CommandItem>
  );
};
export const TabSelection = () => {
  // Get all tabs
  const { sortedAllTabs } = useSelectedTabs();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center justify-center shadow-none cursor-pointer h-5 w-5 border rounded-sm hover:bg-accent">
          <PlusIcon className="w-3 h-3" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="text-[10px] rounded-sm w-[250px] p-1 pt-0">
        <Command onSelect={e => console.log('e', e)}>
          <CommandInput placeholder="Type a command or search..." className="text-[10px]" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="">
              {sortedAllTabs.map(tab => (
                <TabItem key={tab.id} tab={tab} onSelect={() => setOpen(false)} />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
