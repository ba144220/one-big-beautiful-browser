import { useStream } from '@langchain/langgraph-sdk/react';
import type { Message } from '@langchain/langgraph-sdk';
import { MessageContainer } from '../components/chat/message-container';
import useInterrupt from '../hooks/useInterrupt';
import type { InterruptType } from '@extension/shared';
import UserInput from '@src/components/chat/user-input';

export default function Chatroom() {
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

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="pb-40 px-4 flex flex-col gap-2 flex-1 overflow-y-scroll pt-4">
        {thread.messages.map(message => (
          <MessageContainer key={message.id} message={message} />
        ))}
      </div>
      <div className="px-2 pb-2">
        <UserInput
          onSubmit={e => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const message = new FormData(form).get('message') as string;
            form.reset();
            thread.submit({ messages: [{ type: 'human', content: message }] });
          }}
          isLoading={thread.isLoading}
          onStop={() => thread.stop()}
        />
      </div>
    </div>
  );
}
