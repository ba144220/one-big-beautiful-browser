import { type UseStream } from '@langchain/langgraph-sdk/react';
import { type Message } from '@langchain/langgraph-sdk';
import { useEffect } from 'react';
import { type InterruptType } from '@extension/shared';

export default function useInterrupt(thread: UseStream<{ messages: Message[] }, { InterruptType: InterruptType }>) {
  const { interrupt, submit } = thread;
  useEffect(() => {
    if (!interrupt || !interrupt.value) return;
    const interruptValue = interrupt.value;
    submit(undefined, { command: { resume: JSON.stringify(interruptValue) } });
    return;
  }, [interrupt, submit]);
}
