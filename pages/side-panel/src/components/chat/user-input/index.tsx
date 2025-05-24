import { useSelectedTabs } from '@src/hooks/use-selected-tabs';
import TabBadge from './tab-badge';
import { TabSelection } from './tab-selection';
import { ArrowUpIcon, ImageIcon, SquareIcon } from 'lucide-react';
export type UserInputProps = {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onStop: () => void;
};

export default function UserInput({ onSubmit, isLoading, onStop }: UserInputProps) {
  const { selectedTabs } = useSelectedTabs();
  return (
    <div className="bg-background rounded-md pt-2 pb-1">
      <form onSubmit={onSubmit}>
        <div className="px-2 flex flex-wrap gap-1">
          <TabSelection />
          {selectedTabs.map(tab => {
            return <TabBadge key={tab.id} tab={tab} />;
          })}
        </div>
        <div className="w-full flex flex-row pt-1">
          <textarea
            name="message"
            className="placeholder:text-muted-foreground px-2 outline-none field-sizing-content grow resize-none"
            placeholder="Type a message..."
          />
        </div>
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
      </form>
    </div>
  );
}
