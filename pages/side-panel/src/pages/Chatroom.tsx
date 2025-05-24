import { useStream } from '@langchain/langgraph-sdk/react';
import type { Message } from '@langchain/langgraph-sdk';
import { MessageContainer } from '../components/chat/message-container';
import useInterrupt from '../hooks/use-interrupt';
import type { InterruptType } from '@extension/shared';
import UserInput from '@src/components/chat/user-input';
import { handleSubmit } from '@src/utils/handle-submit';
import { useSelectedTabs } from '@src/hooks/use-selected-tabs';

import { useRef, useEffect, useState } from 'react';
import { scrollDownByHeight } from '@src/utils/scroll';

export default function Chatroom() {
  const thread = useStream<
    { messages: Message[] },
    {
      InterruptType: InterruptType;
      ConfigurableType: {
        model: 'claude-3-5-sonnet-latest' | 'claude-3-7-sonnet-latest' | 'claude-3-5-haiku-latest';
        mode: 'agent' | 'ask';
      };
    }
  >({
    apiUrl: 'http://localhost:2024',
    assistantId: 'agent',
    messagesKey: 'messages',
  });

  useInterrupt(thread);

  const { selectedTabs, removeSelectedTabById } = useSelectedTabs();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new messages are added or content changes
  useEffect(() => {
    if (thread.messages.length > 0) {
      scrollDownByHeight(scrollRef);
    }
  }, [thread.messages.length, thread.messages]);

  const [model, setModel] = useState<
    'claude-3-5-haiku-latest' | 'claude-3-5-sonnet-latest' | 'claude-3-7-sonnet-latest'
  >('claude-3-5-haiku-latest');
  const [mode, setMode] = useState<'agent' | 'ask'>('ask');

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-muted">
      <div ref={scrollRef} className="overflow-y-auto py-4 px-4 flex flex-col gap-2 flex-1">
        {thread.messages.map(message => (
          <MessageContainer key={message.id} message={message} />
        ))}
      </div>
      <div className="px-2 pb-2">
        <UserInput
          onSubmit={async e => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const message = new FormData(form).get('message') as string;
            form.reset();
            const messages = await handleSubmit(message, thread.messages, selectedTabs);
            thread.submit({ messages }, { config: { configurable: { mode, model } } });
          }}
          isLoading={thread.isLoading}
          onStop={() => thread.stop()}
          tabMetadata={selectedTabs.map(tab => ({
            tabId: tab.id!,
            tabTitle: tab.title!,
            tabFaviconUrl: tab.favIconUrl!,
            tabUrl: tab.url!,
          }))}
          onBadgeRemove={tabId => {
            removeSelectedTabById(tabId);
          }}
          model={model}
          setModel={setModel}
          mode={mode}
          setMode={setMode}
        />
      </div>
    </div>
  );
}
