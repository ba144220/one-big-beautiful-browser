import { useStream } from '@langchain/langgraph-sdk/react';
import type { Message } from '@langchain/langgraph-sdk';
import { MessageContainer } from '../components/chat/message-container';
export default function Chatroom() {
  const thread = useStream<{ messages: Message[] }>({
    apiUrl: 'http://localhost:2024',
    assistantId: 'agent',
    messagesKey: 'messages',
  });

  return (
    <div className="h-full flex flex-col">
      <nav className="p-4">Chatroom</nav>

      <div className="pb-40 px-4 flex flex-col gap-2">
        {thread.messages.map(message => (
          <MessageContainer key={message.id} message={message} />
        ))}
      </div>
      <form
        className="fixed bottom-0 left-0 right-0 p-4 flex flex-row gap-2"
        onSubmit={e => {
          e.preventDefault();

          const form = e.target as HTMLFormElement;
          const message = new FormData(form).get('message') as string;

          form.reset();
          thread.submit({ messages: [{ type: 'human', content: message }] });
        }}>
        <input type="text" name="message" className="flex-1 bg-muted" />

        {thread.isLoading ? (
          <button key="stop" type="button" onClick={() => thread.stop()}>
            Stop
          </button>
        ) : (
          <button key="submit" type="submit">
            Send
          </button>
        )}
      </form>
    </div>
  );
}
