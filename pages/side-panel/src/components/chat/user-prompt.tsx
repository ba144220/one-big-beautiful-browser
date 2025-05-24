import { type FormEvent, useState, useRef } from 'react';
import { Button } from '@src/components/ui/button';
import { Textarea } from '@src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@src/components/ui/select';
import { Badge } from '@src/components/ui/badge';
import { Send, Square, Image } from 'lucide-react';

type Mode = 'agent' | 'ask';
type AIModel = 'claude-4' | 'chatgpt-4o' | 'gemini-2.5-pro';

interface UserPromptProps {
  onSubmit: (message: string, mode: Mode, model: AIModel, image?: File) => void;
  isLoading: boolean;
  onStop: () => void;
  context?: string[];
}

export default function UserPrompt({ onSubmit, isLoading, onStop, context = [] }: UserPromptProps) {
  const [mode, setMode] = useState<Mode>('agent');
  const [selectedModel, setSelectedModel] = useState<AIModel>('claude-4');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [inputValue, setInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const message = new FormData(form).get('message') as string;

    if (message.trim()) {
      form.reset();
      setInputValue('');
      setSelectedImage(null);

      onSubmit(message, mode, selectedModel, selectedImage || undefined);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 shadow-lg">
      {/* Context Display */}
      {context.length > 0 && (
        <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
          <div className="text-xs font-medium text-gray-600 mb-2">Context</div>
          <div className="flex flex-wrap gap-1.5">
            {context.map((item, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected"
                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{selectedImage.name}</p>
              <p className="text-xs text-gray-500">{(selectedImage.size / 1024).toFixed(1)} KB</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeImage}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
              ✕
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4">
        {/* Main Input Area */}
        <div>
          <Textarea
            name="message"
            placeholder="Ask anything..."
            className="resize-none min-h-[48px] max-h-[120px]"
            rows={1}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between mt-3">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            {/* Mode Selection */}
            <Select value={mode} onValueChange={(value: Mode) => setMode(value)}>
              <SelectTrigger size="sm" className="h-8 w-auto text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">agent</SelectItem>
                <SelectItem value="ask">ask</SelectItem>
              </SelectContent>
            </Select>

            {/* AI Model Selection */}
            <Select value={selectedModel} onValueChange={(value: AIModel) => setSelectedModel(value)}>
              <SelectTrigger size="sm" className="h-8 w-auto text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-4">Claude 4</SelectItem>
                <SelectItem value="chatgpt-4o">ChatGPT 4o</SelectItem>
                <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Status Info */}
            {isLoading && <div className="text-xs text-gray-400 font-medium mr-2">Generating...</div>}

            {/* Image Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg"
              title="Upload screenshot or image">
              <Image className="h-4 w-4" />
            </Button>

            {/* Send/Stop Button */}
            {isLoading ? (
              <Button type="button" onClick={onStop} size="sm" variant="destructive" className="h-8 w-8 p-0 rounded-lg">
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg bg-blue-600 hover:bg-blue-700"
                disabled={!inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
