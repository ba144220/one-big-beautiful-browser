import { useStream } from '@langchain/langgraph-sdk/react';
import { useEffect, useRef } from 'react';
import type { Message } from '@langchain/langgraph-sdk';
import { MessageContainer } from '../components/chat/message-container';
import useInterrupt from '../hooks/useInterrupt';
import type { InterruptType } from '@extension/shared';
import UserInput from '@src/components/chat/user-input';

export default function Chatroom() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const thread = useStream<
    { messages: Message[] },
    {
      InterruptType: InterruptType;
    }
  >({
    apiUrl: 'http://localhost:2024',
    assistantId: 'agent',
    messagesKey: 'messages',
  });

  useInterrupt(thread);

  // Auto-scroll based on previous conversation height
  useEffect(() => {
    if (scrollRef.current && thread.messages.length > 1) {
      setTimeout(() => {
        if (scrollRef.current) {
          const container = scrollRef.current;
          const messageElements = container.children;

          // Find the last two messages (previous input frame + response)
          const messageCount = messageElements.length;
          let previousConversationHeight = 0;

          // Calculate height of last conversation (human message + AI response)
          if (messageCount >= 2) {
            const lastMessage = messageElements[messageCount - 1] as HTMLElement;
            const secondLastMessage = messageElements[messageCount - 2] as HTMLElement;

            previousConversationHeight = lastMessage.offsetHeight + secondLastMessage.offsetHeight;

            // Add gap between messages (gap-2 = 8px)
            previousConversationHeight += 8;
          }

          // Scroll to position where newest message appears with space equal to previous conversation
          const scrollHeight = container.scrollHeight;
          const targetScrollTop = scrollHeight - container.clientHeight - previousConversationHeight;

          container.scrollTop = Math.max(0, targetScrollTop);
        }
      }, 100);
    }
  }, [thread.messages.length]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-muted">
      <div ref={scrollRef} className="overflow-y-auto pb-[80vh] px-4 flex flex-col gap-2 flex-1">
        {(() => {
          // Keep messages in normal chronological order (oldest to newest)
          return thread.messages.map((message, index) => {
            // All human messages show as input frames
            if (message.type === 'human') {
              // Show the full-width input frame container for user messages
              return (
                <div key={message.id} className="px-2">
                  <div className="border-2 bg-white rounded-md py-2 w-full">
                    <div className="px-2 flex flex-wrap gap-1">
                      <div className="py-[1px] px-[4px] text-[10px] border rounded-sm">test</div>
                      <div className="py-[1px] px-[4px] text-[10px] border rounded-sm">test</div>
                      <div className="py-[1px] px-[4px] text-[10px] border rounded-sm">test</div>
                    </div>
                    <div className="w-full flex flex-row pt-1">
                      <div className="px-2 py-1 grow">
                        {typeof message.content === 'string'
                          ? message.content
                          : message.content.map(content => (content.type === 'text' ? content.text : '')).join('')}
                      </div>
                    </div>
                    <div className="flex gap-2 px-2 justify-end pt-0.5 w-full items-start -mt-1">
                      <div className="opacity-50">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round">
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      </div>
                      <div className="w-6 h-3 flex justify-center items-center opacity-50">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="bg-black rounded-full p-0.5">
                          <path d="m22 2-7 20-4-9-9-4Z" />
                          <path d="M22 2 11 13" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return <MessageContainer key={message.id} message={message} />;
          });
        })()}
      </div>
      <div className="px-2 pb-2">
        <UserInput
          onSubmit={e => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const message = new FormData(form).get('message') as string;
            if (message.trim()) {
              form.reset();
              thread.submit({ messages: [{ type: 'human', content: message }] });
            }
          }}
          isLoading={thread.isLoading}
          onStop={() => thread.stop()}
          onUpload={files => {
            console.log('Files uploaded:', files);
            // Handle file upload here
          }}
        />
      </div>
    </div>
  );
}
