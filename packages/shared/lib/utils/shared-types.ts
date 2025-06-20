export type ValueOf<T> = T[keyof T];

type ImageDetail = 'auto' | 'low' | 'high';
type MessageContentImageUrl = {
  type: 'image_url';
  image_url:
    | string
    | {
        url: string;
        detail?: ImageDetail | undefined;
      };
  hidden?: boolean;
  tabId?: string;
};
type MessageContentText = {
  type: 'text';
  text: string;
  hidden?: boolean;
  tabId?: string;
};

type MessageContentComplex = MessageContentText | MessageContentImageUrl;
export type MessageContent = string | MessageContentComplex[];

export type Model =
  | 'claude-3-5-sonnet-latest'
  | 'claude-3-7-sonnet-latest'
  | 'claude-3-5-haiku-latest'
  | 'gpt-4.1-mini'
  | 'gpt-4.1-nano';

export type Mode = 'agent' | 'ask';
