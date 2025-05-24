declare module '@langchain/langgraph-sdk' {
  type ImageDetail = 'auto' | 'low' | 'high';
  type TabMetadata = {
    tabId: number;
    tabTitle: string;
    tabFaviconUrl: string;
    tabUrl: string;
  };
  type MessageContentImageUrl = {
    type: 'image_url';
    image_url:
      | string
      | {
          url: string;
          detail?: ImageDetail;
        };
    hidden?: boolean;
    tabMetadata?: TabMetadata;
  };
  type MessageContentText = {
    type: 'text';
    text: string;
    hidden?: boolean;
    tabMetadata?: TabMetadata;
  };

  type MessageContentComplex = MessageContentText | MessageContentImageUrl;
  type MessageContent = string | MessageContentComplex[];

  type Message = HumanMessage | AIMessage | ToolMessage | SystemMessage | FunctionMessage | RemoveMessage;
  type HumanMessage = {
    type: 'human';
    id?: string | undefined;
    content: MessageContent;
  };
  type AIMessage = {
    type: 'ai';
    id?: string | undefined;
    content: MessageContent;
    tool_calls?:
      | {
          name: string;
          args: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [x: string]: any;
          };
          id?: string | undefined;
          type?: 'tool_call' | undefined;
        }[]
      | undefined;
    invalid_tool_calls?:
      | {
          name?: string | undefined;
          args?: string | undefined;
          id?: string | undefined;
          error?: string | undefined;
          type?: 'invalid_tool_call' | undefined;
        }[]
      | undefined;
    usage_metadata?:
      | {
          input_tokens: number;
          output_tokens: number;
          total_tokens: number;
          input_token_details?:
            | {
                audio?: number | undefined;
                cache_read?: number | undefined;
                cache_creation?: number | undefined;
              }
            | undefined;
          output_token_details?:
            | {
                audio?: number | undefined;
                reasoning?: number | undefined;
              }
            | undefined;
        }
      | undefined;
    additional_kwargs?: MessageAdditionalKwargs | undefined;
    response_metadata?: Record<string, unknown> | undefined;
  };
  type ToolMessage = {
    type: 'tool';
    name?: string | undefined;
    id?: string | undefined;
    content: MessageContent;
    status?: 'error' | 'success' | undefined;
    tool_call_id: string;
    additional_kwargs?: MessageAdditionalKwargs | undefined;
    response_metadata?: Record<string, unknown> | undefined;
  };
  type SystemMessage = {
    type: 'system';
    id?: string | undefined;
    content: MessageContent;
  };
  type FunctionMessage = {
    type: 'function';
    id?: string | undefined;
    content: MessageContent;
  };
  type RemoveMessage = {
    type: 'remove';
    id: string;
    content: MessageContent;
  };
}
