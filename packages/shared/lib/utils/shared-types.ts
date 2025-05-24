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
