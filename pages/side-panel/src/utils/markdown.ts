import TurndownService from 'turndown';

// Initialize turndown service for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
});

// Helper function to convert HTML to Markdown
export const htmlToMarkdown = (html: string): string => {
  return turndownService.turndown(html);
};
