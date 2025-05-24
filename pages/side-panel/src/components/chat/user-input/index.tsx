import { useSelectedTabs } from '@src/hooks/use-selected-tabs';
import TabBadge from './tab-badge';
export type UserInputProps = {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onStop: () => void;
};

export default function UserInput({ onSubmit, isLoading, onStop }: UserInputProps) {
  const { selectedTabs } = useSelectedTabs();
  return (
    <div className="bg-background rounded-md py-2">
      <form onSubmit={onSubmit}>
        <div className="px-2 flex flex-wrap gap-1">
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
          {isLoading ? (
            <button key="stop" type="button" onClick={onStop}>
              Stop
            </button>
          ) : (
            <button key="submit" type="submit">
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
