import { type Message } from '@langchain/langgraph-sdk';
import { cn } from '@src/lib/utils';
import React from 'react';
import { Img } from 'react-image';
import UserInput from './user-input';

export const StringMessage = ({ content }: { content: string }) => {
  return (
    <React.Fragment>
      {content.split('\n').map((line, index) => (
        <p key={index}>{line}</p>
      ))}
    </React.Fragment>
  );
};

export const ImageMessage = ({ content }: { content: string }) => {
  return <Img src={content} alt="" />;
};

export const MessageContainer = ({ message }: { message: Message }) => {
  if (message.type === 'human') {
    if (typeof message.content === 'string') {
      return <UserInput isActive={false} initialValue={message.content} />;
    }
    // Get all the tab metadata from the message.content
    const tabMetadata = message.content
      .map(content => content.tabMetadata)
      .filter(tabMetadata => tabMetadata !== undefined);
    const text = message.content
      .filter(content => !content.tabMetadata)
      .filter(content => content.type === 'text')
      .flatMap(content => content.text)
      .join('\n');

    return <UserInput isActive={false} initialValue={text} tabMetadata={tabMetadata} />;
  }
  return (
    <div key={message.id} className={cn('flex flex-row gap-2 justify-start')}>
      <div className={cn('flex flex-col gap-2', message.type === 'tool' ? 'text-xs text-muted-foreground' : '')}>
        {/* Check message.content is string or MessageContentComplex[]*/}
        {typeof message.content === 'string' ? (
          <StringMessage content={message.content} />
        ) : (
          message.content.map(content => {
            switch (content.type) {
              case 'text':
                return <StringMessage content={content.text} />;
              case 'image_url':
                return (
                  <ImageMessage
                    content={typeof content.image_url === 'string' ? content.image_url : content.image_url.url}
                  />
                );
              default:
                return null;
            }
          })
        )}

        {/* {(message.content as string).split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line} {index < (message.content as string).split('\n').length - 1 && <br />}{' '}
                </React.Fragment>
              ))} */}
      </div>
    </div>
  );
};
