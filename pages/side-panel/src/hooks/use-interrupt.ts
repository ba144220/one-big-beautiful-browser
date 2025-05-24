import { type UseStream } from '@langchain/langgraph-sdk/react';
import { type Message } from '@langchain/langgraph-sdk';
import { useEffect } from 'react';
import { type InterruptType } from '@extension/shared';
import { handleInterrupt as handleInterruptUtil } from '@src/utils/handle-interrupt';

export default function useInterrupt(thread: UseStream<{ messages: Message[] }, { InterruptType: InterruptType }>) {
  const { interrupt, submit } = thread;
  useEffect(() => {
    const handleInterrupt = async () => {
      if (!interrupt?.value) return;
      try {
        // Validate the interrupt value at runtime
        // const validatedInterrupt = InterruptSchema.parse(interrupt.value);

        // Submit with proper typing - no stringification needed
        const messages = await handleInterruptUtil(interrupt.value);
        submit(undefined, {
          command: {
            resume: messages,
          },
        });
      } catch (error) {
        console.error('Invalid interrupt value:', error);
        // Handle validation error appropriately
        submit(undefined, {
          command: {
            resume: 'Error',
          },
        });
      }
    };

    handleInterrupt();
  }, [interrupt, submit]);
}
