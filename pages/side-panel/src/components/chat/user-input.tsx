import { useState, useRef } from 'react';
import { ImageIcon, StopIcon, SendIcon } from '../ui/icons';

export type UserInputProps = {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onStop: () => void;
  onUpload: (files: FileList) => void;
};

export default function UserInput({ onSubmit, isLoading, onStop, onUpload }: UserInputProps) {
  const [message, setMessage] = useState('');
  const hasText = message.trim().length > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (hasText && !isLoading) {
        const form = e.currentTarget.form;
        if (form) {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          Object.defineProperty(submitEvent, 'target', { value: form });
          onSubmit(submitEvent as any);
        }
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files);
    }
  };
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
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="placeholder:text-muted-foreground px-2 outline-none field-sizing-content grow resize-none"
            placeholder="Type a message..."
          />
        </div>
        <div className="flex gap-2 px-2 justify-end pt-0.5 w-full items-start -mt-1">
          <button key="upload Image" type="button" onClick={handleUploadClick}>
            <ImageIcon />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <div className="w-6 h-3 flex justify-center items-center">
            {isLoading ? (
              <button key="stop" type="button" onClick={onStop} className="bg-black rounded-full p-0.5">
                <StopIcon stroke="white" />
              </button>
            ) : (
              <button key="submit" type="submit" className={hasText ? 'bg-black rounded-full p-0.5' : ''}>
                <SendIcon stroke={hasText ? 'white' : 'currentColor'} />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
