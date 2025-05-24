import TabBadge from './tab-badge';
import { TabSelection } from './tab-selection';
import { ArrowUpIcon, ImageIcon, SquareIcon } from 'lucide-react';
import { type TabMetadata } from '@langchain/langgraph-sdk';
import { cn } from '@src/lib/utils';
import { useState } from 'react';
export type UserInputProps = {
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
  onStop?: () => void;
  tabMetadata?: TabMetadata[];
  onBadgeRemove?: (tabId: number) => void;
  isActive?: boolean;
  initialValue?: string;
};

export default function UserInput({
  onSubmit,
  isLoading,
  onStop,
  tabMetadata = [],
  onBadgeRemove = () => {},
  isActive = true,
  initialValue = '',
}: UserInputProps) {
  const [inputValue, setInputValue] = useState<string>(initialValue);
  return (
    <div className={cn('bg-background rounded-md pt-2 pb-1', !isActive && 'pb-2')}>
      <form
        onSubmit={
          isActive
            ? e => {
                e.preventDefault();
                onSubmit?.(e);
                setInputValue('');
              }
            : undefined
        }>
        <div className="px-2 flex flex-wrap gap-1">
          {isActive && <TabSelection />}
          {tabMetadata.map(tab => {
            return (
              <TabBadge
                key={tab.tabId}
                tabTitle={tab.tabTitle ?? ''}
                tabFaviconUrl={tab.tabFaviconUrl ?? ''}
                tabId={tab.tabId ?? 0}
                onRemove={onBadgeRemove}
                isActive={isActive}
              />
            );
          })}
        </div>
        <div className="w-full flex flex-row pt-1">
          <textarea
            name="message"
            className="placeholder:text-muted-foreground px-2 outline-none field-sizing-content grow resize-none"
            placeholder={isActive ? 'Type a message...' : ''}
            disabled={!isActive}
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value);
            }}
          />
        </div>
        {isActive && (
          <div className="flex gap-2 px-2 justify-end pt-1 w-full">
            <button
              type="button"
              className="w-5 h-5 p-0 cursor-pointer flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200">
              <ImageIcon strokeWidth={2} className="size-3" />
            </button>

            {isLoading ? (
              <button
                type="button"
                key="stop"
                onClick={onStop}
                className="w-5 h-5 p-0 rounded-full cursor-pointer flex items-center justify-center text-primary-foreground bg-primary/80 hover:bg-primary hover:scale-110 transition-all duration-200">
                <SquareIcon strokeWidth={2} className="size-2.5" />
              </button>
            ) : (
              <button
                type="submit"
                key="submit"
                className="w-5 h-5 p-0 rounded-full cursor-pointer flex items-center justify-center text-primary-foreground bg-primary/80 hover:bg-primary hover:scale-110 transition-all duration-200">
                <ArrowUpIcon strokeWidth={2} className="size-3" />
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
