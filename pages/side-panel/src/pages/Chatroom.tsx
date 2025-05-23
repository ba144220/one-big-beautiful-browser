import { useStream } from '@langchain/langgraph-sdk/react';
import type { Message } from '@langchain/langgraph-sdk';
import { MessageContainer } from '../components/chat/messageContainer';
import UserPrompt from '../components/chat/userPrompt';
export default function Chatroom() {
  const thread = useStream<{ messages: Message[] }>({
    apiUrl: 'http://localhost:2024',
    assistantId: 'agent',
    messagesKey: 'messages',
  });

  return (
    <div className="h-full flex flex-col">
      <div className="pb-40 px-4 flex flex-col gap-2">
        {thread.messages.map(message => (
          <MessageContainer key={message.id} message={message} />
        ))}
      </div>
      <UserPrompt
        onSubmit={(message, mode, model, image) => thread.submit({ messages: [{ type: 'human', content: message }] })}
        isLoading={thread.isLoading}
        onStop={() => thread.stop()}
        context={['Current file', 'Project context']}
      />
    </div>
  );
}
