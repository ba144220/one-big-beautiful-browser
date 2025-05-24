/**
 * Enhanced HTML snapshot that adds unique identifiers to interactive elements
 * This ensures the LLM can identify and interact with all clickable/interactive elements
 */

export function createEnhancedHtmlSnapshot() {
  return function script(characterLimit = 15000) {
    // Helper functions to identify important elements
    function isTextNode(node: Node): boolean {
      return node.nodeType === Node.TEXT_NODE && !!node.textContent && node.textContent.trim().length > 0;
    }

    function hasTextContent(element: Element): boolean {
      return Array.from(element.childNodes).some(node => isTextNode(node));
    }

    function isInteractiveElement(element: Element): boolean {
      if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;

      const tagName = element.tagName.toLowerCase();
      const style = window.getComputedStyle(element);

      // Common interactive elements
      const interactiveElements = new Set([
        'a',
        'button',
        'input',
        'select',
        'textarea',
        'details',
        'summary',
        'label',
        'option',
        'fieldset',
        'legend',
      ]);

      // Interactive cursors
      const interactiveCursors = new Set(['pointer', 'grab', 'grabbing', 'text', 'copy', 'zoom-in', 'zoom-out']);

      // Check for interactive cursor
      if (interactiveCursors.has(style.cursor)) return true;

      // Check for common interactive elements
      if (interactiveElements.has(tagName)) {
        // Filter out hidden input elements
        if (tagName === 'input' && (element as HTMLInputElement).type === 'hidden') {
          return false;
        }
        // Ensure it's not disabled
        if (element.hasAttribute('disabled') || (element as HTMLButtonElement | HTMLInputElement).disabled) {
          return false;
        }
        return true;
      }

      // Check for role attribute
      const role = element.getAttribute('role');
      if (
        role &&
        ['button', 'link', 'checkbox', 'radio', 'tab', 'menuitem', 'slider', 'switch', 'textbox', 'combobox'].includes(
          role,
        )
      ) {
        return true;
      }

      // Check for event handlers
      if (element.hasAttribute('onclick') || element.hasAttribute('onkeydown') || element.hasAttribute('onmousedown')) {
        return true;
      }

      // Check for contenteditable
      if (element.getAttribute('contenteditable') === 'true') {
        return true;
      }

      // Check for elements with click handlers (more comprehensive)
      try {
        const events =
          (element as unknown as { getEventListeners?: () => Record<string, unknown> }).getEventListeners?.() || {};
        if (events.click || events.mousedown || events.keydown) {
          return true;
        }
      } catch {
        // getEventListeners might not be available
      }

      return false;
    }

    // Helper function to check if an element is empty
    function isEmptyElement(element: Element): boolean {
      // Element has no children
      if (element.children.length === 0 && (!element.textContent || element.textContent.trim() === '')) {
        return true;
      }
      return false;
    }

    // Helper function to generate unique selector for an element
    function generateUniqueSelector(element: Element, index: number): string {
      // Try to use existing id
      if (element.id) {
        return `#${element.id}`;
      }

      // Try to use existing class with tag
      if (element.className && typeof element.className === 'string') {
        const classes = element.className.trim().split(/\s+/).slice(0, 2); // Use first 2 classes
        if (classes.length > 0) {
          const classSelector = `.${classes.join('.')}`;
          const tagSelector = `${element.tagName.toLowerCase()}${classSelector}`;

          // Check if this selector is unique
          try {
            const matches = document.querySelectorAll(tagSelector);
            if (matches.length === 1) {
              return tagSelector;
            }
          } catch {
            // Invalid selector, continue
          }
        }
      }

      // Generate a unique data attribute
      const uniqueId = `ai-interactive-${index}`;
      element.setAttribute('data-ai-id', uniqueId);
      return `[data-ai-id="${uniqueId}"]`;
    }

    // Helper function to get element description
    function getElementDescription(element: Element): string {
      const tagName = element.tagName.toLowerCase();
      let description = tagName;

      // Add type for inputs
      if (tagName === 'input') {
        const type = element.getAttribute('type') || 'text';
        description += `[type="${type}"]`;
      }

      // Add text content or value
      const textContent = element.textContent?.trim();
      const value = (element as HTMLInputElement).value;
      const placeholder = element.getAttribute('placeholder');
      const alt = element.getAttribute('alt');
      const title = element.getAttribute('title');
      const ariaLabel = element.getAttribute('aria-label');

      if (textContent && textContent.length > 0 && textContent.length < 50) {
        description += ` "${textContent}"`;
      } else if (value && value.length < 50) {
        description += ` value="${value}"`;
      } else if (placeholder) {
        description += ` placeholder="${placeholder}"`;
      } else if (alt) {
        description += ` alt="${alt}"`;
      } else if (title) {
        description += ` title="${title}"`;
      } else if (ariaLabel) {
        description += ` aria-label="${ariaLabel}"`;
      }

      return description;
    }

    // Elements to skip entirely
    const SKIP_TAGS = new Set([
      'script',
      'style',
      'link',
      'meta',
      'noscript',
      'svg',
      'path',
      'rect',
      'circle',
      'polygon',
      'iframe',
      'canvas',
      'video',
      'audio',
    ]);

    // Main processing function
    function processDocument() {
      const body = document.body;
      const processedBody = body.cloneNode(true) as HTMLElement;

      // Step 1: Identify important elements
      const textElements = new Set<Element>();
      const interactiveElements = new Set<Element>();
      const interactiveElementsInfo: Array<{ element: Element; selector: string; description: string }> = [];

      // Find text elements and interactive elements
      const allElements = Array.from(processedBody.querySelectorAll('*'));
      const originalElements = Array.from(body.querySelectorAll('*'));
      let interactiveIndex = 0;

      allElements.forEach((el, index) => {
        if (!SKIP_TAGS.has(el.tagName.toLowerCase())) {
          if (hasTextContent(el)) {
            textElements.add(el);
          }
          if (isInteractiveElement(el)) {
            interactiveElements.add(el);
            const selector = generateUniqueSelector(el, interactiveIndex++);
            const description = getElementDescription(el);
            interactiveElementsInfo.push({ element: el, selector, description });

            // Also add data-ai-id to the original DOM element if it was generated
            if (selector.includes('data-ai-id')) {
              const originalEl = originalElements[index];
              if (originalEl && originalEl.tagName === el.tagName) {
                const uniqueId = selector.match(/data-ai-id="([^"]+)"/)?.[1];
                if (uniqueId) {
                  originalEl.setAttribute('data-ai-id', uniqueId);
                }
              }
            }
          }
        }
      });

      // Step 2: Remove unnecessary elements
      const elementsToRemove: Element[] = [];

      function shouldKeepElement(element: Element): boolean {
        // Skip processing if already marked for removal
        if (elementsToRemove.includes(element)) return false;

        // Keep if it's a text or interactive element
        if (textElements.has(element) || interactiveElements.has(element)) return true;

        // Keep if it has descendants that are text or interactive
        for (const child of Array.from(element.children)) {
          if (shouldKeepElement(child)) return true;
        }

        return false;
      }

      // Mark elements for removal
      allElements.forEach(el => {
        if (!shouldKeepElement(el) || SKIP_TAGS.has(el.tagName.toLowerCase())) {
          elementsToRemove.push(el);
        }
      });

      // Remove elements (in reverse order to avoid affecting traversal)
      for (let i = elementsToRemove.length - 1; i >= 0; i--) {
        const el = elementsToRemove[i];
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }

      // Step 3: Simplify remaining elements and preserve important attributes
      const remainingElements = Array.from(processedBody.querySelectorAll('*'));
      remainingElements.forEach(el => {
        // Keep essential attributes for interactive elements
        const attributesToKeep = [
          'value',
          'placeholder',
          'type',
          'src',
          'alt',
          'title',
          'aria-label',
          'role',
          'data-ai-id',
        ];

        // Also keep id and class for better identification
        if (el.id) attributesToKeep.push('id');
        if (el.className) attributesToKeep.push('class');

        Array.from(el.attributes).forEach(attr => {
          if (!attributesToKeep.includes(attr.name)) {
            el.removeAttribute(attr.name);
          }
        });
      });

      // Step 4: Remove empty elements
      const emptyElements: Element[] = [];
      Array.from(processedBody.querySelectorAll('*')).forEach(el => {
        if (isEmptyElement(el) && !interactiveElements.has(el)) {
          emptyElements.push(el);
        }
      });

      // Remove empty elements (in reverse order to avoid affecting traversal)
      for (let i = emptyElements.length - 1; i >= 0; i--) {
        const el = emptyElements[i];
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }

      // Step 5: Add interactive elements summary at the top
      let interactiveSummary = '';
      if (interactiveElementsInfo.length > 0) {
        interactiveSummary = '<!-- INTERACTIVE ELEMENTS SUMMARY\n';
        interactiveSummary += 'The following interactive elements are available on this page:\n';
        interactiveElementsInfo.forEach(({ selector, description }, index) => {
          interactiveSummary += `${index + 1}. ${selector} - ${description}\n`;
        });
        interactiveSummary += 'Use these selectors to interact with elements via browser control tools.\n';
        interactiveSummary += '-->';
      }

      // Step 6: Minify the HTML output
      function minifyHtml(html: string): string {
        return (
          html
            // Remove comments (except our interactive summary)
            .replace(/<!--(?!\s*INTERACTIVE ELEMENTS SUMMARY)[\s\S]*?-->/g, '')
            // Remove whitespace between tags
            .replace(/>\s+</g, '><')
            // Remove leading and trailing whitespace
            .replace(/^\s+|\s+$/g, '')
            // Collapse multiple whitespace characters to a single space within text nodes
            .replace(/\s{2,}/g, ' ')
        );
      }

      const finalHtml = interactiveSummary + '\n' + processedBody.innerHTML;
      return minifyHtml(finalHtml).substring(0, characterLimit);
    }

    return processDocument();
  };
}
