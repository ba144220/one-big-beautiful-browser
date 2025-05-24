export const scrollDownByHeight = (scrollRef?: React.RefObject<HTMLDivElement | null>) => {
  if (scrollRef?.current) {
    setTimeout(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;

        // Simple: just scroll down by container height
        const containerHeight = container.clientHeight;
        container.scrollTop = container.scrollTop + containerHeight;
      }
    }, 150); // Increased timeout to ensure DOM is updated
  }
};

export const scrollToMessage = (messageId: string) => {
  const element = document.getElementById(`message-${messageId}`);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
};

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

export const scrollToBottom = () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth',
  });
};
