import TabBadge from './tab-badge';
import { TabSelection } from './tab-selection';
import { ArrowUpIcon, ImageIcon, InfinityIcon, MessageCircleIcon, SquareIcon } from 'lucide-react';
import { type TabMetadata } from '@langchain/langgraph-sdk';
import { cn } from '@src/lib/utils';
import { useState } from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@src/components/ui/select';
export type UserInputProps = {
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
  onStop?: () => void;
  tabMetadata?: TabMetadata[];
  onBadgeRemove?: (tabId: number) => void;
  isActive?: boolean;
  initialValue?: string;
  model?: 'claude-3-5-haiku-latest' | 'claude-3-5-sonnet-latest' | 'claude-3-7-sonnet-latest';
  setModel?: (model: 'claude-3-5-haiku-latest' | 'claude-3-5-sonnet-latest' | 'claude-3-7-sonnet-latest') => void;
  mode?: 'agent' | 'ask';
  setMode?: (mode: 'agent' | 'ask') => void;
};

export default function UserInput({
  onSubmit,
  isLoading,
  onStop,
  tabMetadata = [],
  onBadgeRemove = () => {},
  isActive = true,
  initialValue = '',
  model = 'claude-3-5-haiku-latest',
  setModel = () => {},
  mode = 'ask',
  setMode = () => {},
}: UserInputProps) {
  const [inputValue, setInputValue] = useState<string>(initialValue);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && isActive && inputValue.trim()) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }
  };

  const hasText = inputValue.trim().length > 0;

  return (
    <div
      className={cn(
        'bg-background rounded-md pt-2 pb-2 flex flex-row items-center justify-center',
        // !isActive && 'pb-2',
      )}>
      <form
        className="flex flex-col items-start justify-center w-full"
        onSubmit={
          isActive
            ? e => {
                e.preventDefault();
                onSubmit?.(e);
                setInputValue('');
              }
            : undefined
        }>
        {(isActive || tabMetadata.length > 0) && (
          <div className="px-2 flex flex-wrap gap-1 pb-1">
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
        )}
        <div className="w-full flex flex-row">
          <textarea
            name="message"
            className={cn(
              'placeholder:text-muted-foreground px-2 outline-none field-sizing-content grow resize-none',
              isActive && 'min-h-8',
            )}
            placeholder={isActive ? 'Type a message...' : ''}
            disabled={!isActive}
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value);
            }}
            onKeyDown={handleKeyDown}
          />
        </div>
        {isActive && (
          <div className="flex gap-2 px-2 justify-end w-full pt-2">
            <Select defaultValue="agent" value={mode} onValueChange={setMode}>
              <SelectTrigger className="w-[80px] h-5 cursor-pointer bg-muted/50 hover:bg-muted transition-all border-none text-muted-foreground">
                <SelectValue placeholder="." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">
                  <InfinityIcon className="size-3" />
                  <span className="text-[10px]">Agent</span>
                </SelectItem>
                <SelectItem value="ask">
                  <MessageCircleIcon className="size-3" />
                  <span className="text-[10px]">Ask</span>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="claude-3.5-haiku" value={model} onValueChange={setModel}>
              <SelectTrigger className="w-[120px] h-5 cursor-pointer bg-transparent hover:bg-muted transition-all border-none text-muted-foreground font-normal outline-none">
                <SelectValue placeholder="." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-3-5-haiku-latest">
                  <span className="text-[10px]">claude-3.5-haiku</span>
                </SelectItem>
                <SelectItem value="claude-3-5-sonnet-latest">
                  <span className="text-[10px]">claude-3.5-sonnet</span>
                </SelectItem>
                <SelectItem value="claude-3-7-sonnet-latest">
                  <span className="text-[10px]">claude-3.7-sonnet</span>
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1"></div>
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
                className={cn(
                  'w-5 h-5 p-0 rounded-full cursor-pointer flex items-center justify-center text-primary-foreground hover:scale-110 transition-all duration-200',
                  hasText ? 'bg-primary/80 hover:bg-primary' : 'bg-primary/20 hover:bg-primary/40',
                )}>
                <ArrowUpIcon strokeWidth={2} className="size-3" />
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
