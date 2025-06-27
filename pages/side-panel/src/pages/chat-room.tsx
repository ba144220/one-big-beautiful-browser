import { useStream } from '@langchain/langgraph-sdk/react';
import type { Message } from '@langchain/langgraph-sdk';
import type { InterruptType } from '@extension/shared';
import { useState } from 'react';

import type { Model, Mode } from '@extension/shared';

export default function Chatroom() {
  const [model, setModel] = useState<Model>('claude-3-5-sonnet-latest');
  const [mode, setMode] = useState<Mode>('ask');

  const [darkMode, setDarkMode] = useState(false);
  const thread = useStream<
    { messages: Message[] },
    {
      InterruptType: InterruptType;
      ConfigurableType: {
        model: Model;
        mode: Mode;
      };
    }
  >({
    apiUrl: 'http://localhost:2024',
    assistantId: 'agent',
    messagesKey: 'messages',
  });
  return (
    <div className={`h-screen flex flex-col overflow-hidden ${darkMode ? 'dark' : ''} bg-background text-foreground`}>
      <div className="px-2 pb-2 flex items-center gap-2">
        <input
          type="checkbox"
          name="darkMode"
          id="darkMode"
          checked={darkMode}
          onChange={e => setDarkMode(e.target.checked)}
        />
        <label htmlFor="darkMode">Dark Mode</label>
      </div>
      <div className="overflow-y-auto py-4 px-4 flex flex-col gap-2 flex-1">
        {thread.messages.map(message => (
          <div key={message.id}>
            <div>{JSON.stringify(message.content, null, 2)}</div>
          </div>
        ))}
      </div>
      <div className="px-2 pb-2">
        <form
          onSubmit={e => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const message = new FormData(form).get('message') as string;
            form.reset();
            thread.submit(
              {
                messages: [{ type: 'human', content: [{ type: 'text', text: message }] }],
              },
              { config: { configurable: { mode, model } } },
            );
          }}>
          <input type="text" name="message" className="w-full" />
          <button type="submit">Send</button>
        </form>
      </div>
      {/* Select model */}
      <div className="px-2 pb-2">
        <select name="model" className="w-full" value={model} onChange={e => setModel(e.target.value as Model)}>
          <option value="claude-3-5-sonnet-latest">Claude 3.5 Sonnet</option>
          <option value="claude-3-7-sonnet-latest">Claude 3.7 Sonnet</option>
          <option value="claude-3-5-haiku-latest">Claude 3.5 Haiku</option>
          <option value="gpt-4.1-mini">GPT-4.1-mini</option>
          <option value="gpt-4.1-nano">GPT-4.1-nano</option>
        </select>
      </div>
      <div className="px-2 pb-2">
        <select name="mode" className="w-full" value={mode} onChange={e => setMode(e.target.value as Mode)}>
          <option value="agent">Agent</option>
          <option value="ask">Ask</option>
        </select>
      </div>
    </div>
  );
}
