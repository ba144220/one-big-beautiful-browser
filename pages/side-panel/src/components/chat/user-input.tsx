export type UserInputProps = {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onStop: () => void;
};

export default function UserInput({ onSubmit, isLoading, onStop }: UserInputProps) {
  return (
    <div className="bg-muted rounded-md py-2">
      <form onSubmit={onSubmit}>
        <div className="px-2 flex flex-wrap gap-1">
          <div className="py-[1px] px-[4px] text-[10px] border rounded-sm">test</div>
          <div className="py-[1px] px-[4px] text-[10px] border rounded-sm">test</div>
          <div className="py-[1px] px-[4px] text-[10px] border rounded-sm">test</div>
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
