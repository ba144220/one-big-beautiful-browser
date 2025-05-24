import { useStream } from '@langchain/langgraph-sdk/react';
import type { Message } from '@langchain/langgraph-sdk';
import { MessageContainer } from '../components/chat/message-container';
import UserPrompt from '../components/chat/user-prompt';
import useInterrupt from '../hooks/useInterrupt';
import type { InterruptType } from '@extension/shared';

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
    <div className="h-full flex flex-col">
      <div className="pb-50 px-4 flex flex-col gap-2">
        {thread.messages.map(message => (
          <MessageContainer key={message.id} message={message} />
        ))}
      </div>

      <UserPrompt
        onSubmit={message => thread.submit({ messages: [{ type: 'human', content: message }] })}
        isLoading={thread.isLoading}
        onStop={() => thread.stop()}
        context={['Current file', 'Project context']}
      />
    </div>
  );
}
