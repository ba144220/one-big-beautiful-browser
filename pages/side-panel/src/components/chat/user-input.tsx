export type UserInputProps = {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onStop: () => void;
};

export default function UserInput({ onSubmit, isLoading, onStop }: UserInputProps) {
  return (
    <div className="border-2 bg-white rounded-md py-2">
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
          <div>
            <button key="upload Image" type="button" onClick={() => {}}>
              <svg
                xmlns="URL_ADDRESS.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-upload">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </button>
          </div>

          <div>
            {isLoading ? (
              <button key="stop" type="button" onClick={onStop}>
                {/* svg stop icon */}
                <svg
                  xmlns="URL_ADDRESS.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-square">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                </svg>
              </button>
            ) : (
              <button key="submit" type="submit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-send">
                  <path d="M22 2L11 13"></path>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
