import { useSelectedTabs } from '@src/hooks/use-selected-tabs';

export type UserInputProps = {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onStop: () => void;
};

export default function UserInput({ onSubmit, isLoading, onStop }: UserInputProps) {
  const { selectedTabs } = useSelectedTabs();
  return (
    <div className="bg-muted rounded-md py-2">
      <form onSubmit={onSubmit}>
        <div className="px-2 flex flex-wrap gap-1">
          {selectedTabs.map(tab => {
            return (
              <div
                key={tab.id}
                className="py-[1px] px-[4px] text-[10px] border rounded-sm flex flex-row justify-center items-center gap-1">
                <img src={tab.favIconUrl} alt="" className="w-3 h-3" />
                <span>{tab.title?.length && tab.title.length > 20 ? tab.title?.slice(0, 20) + '...' : tab.title}</span>
              </div>
            );
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
