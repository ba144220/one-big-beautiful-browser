/**
 * Creates a simplified HTML snapshot of a webpage by removing unnecessary elements
 * and preserving only the essential content for LLM processing.
 * The output is minified by default to reduce size.
 */
export function createHtmlSnapshot() {
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

      return false;
    }

    // Helper function to check if an element is a container
    function isContainerElement(element: Element): boolean {
      const containerTags = new Set(['div', 'section', 'article', 'main', 'aside', 'header', 'footer', 'nav', 'span']);
      return containerTags.has(element.tagName.toLowerCase());
    }

    // Helper function to check if an element is empty
    function isEmptyElement(element: Element): boolean {
      // Element has no children
      if (element.children.length === 0 && (!element.textContent || element.textContent.trim() === '')) {
        return true;
      }
      return false;
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

      // Find text elements
      const allElements = Array.from(processedBody.querySelectorAll('*'));
      allElements.forEach(el => {
        if (!SKIP_TAGS.has(el.tagName.toLowerCase()) && hasTextContent(el)) {
          textElements.add(el);
        }
        if (isInteractiveElement(el)) {
          interactiveElements.add(el);
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

      // Step 3: Simplify remaining elements
      const remainingElements = Array.from(processedBody.querySelectorAll('*'));
      remainingElements.forEach(el => {
        // Keep only essential attributes
        const attributesToKeep = ['value', 'placeholder', 'type'];
        Array.from(el.attributes).forEach(attr => {
          if (!attributesToKeep.includes(attr.name)) {
            el.removeAttribute(attr.name);
          }
        });
      });

      // Step 4: Remove empty elements
      const emptyElements: Element[] = [];
      Array.from(processedBody.querySelectorAll('*')).forEach(el => {
        if (isEmptyElement(el)) {
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

      // Step 5: Flatten nested container elements
      function flattenContainers(element: Element) {
        const children = Array.from(element.children);

        // Process children first (depth-first)
        children.forEach(child => flattenContainers(child));

        // Check if this is a container with exactly one child that is also a container
        if (isContainerElement(element) && element.children.length === 1) {
          const child = element.firstElementChild!;

          // If the child is also a container, we can flatten
          if (isContainerElement(child) && element.parentNode) {
            // Move all of child's children to the parent
            while (child.firstChild) {
              element.insertBefore(child.firstChild, child);
            }
            // Remove the now-empty child
            element.removeChild(child);
          }
        }
      }

      // Apply container flattening
      flattenContainers(processedBody);

      // Step 6: Minify the HTML output
      function minifyHtml(html: string): string {
        return (
          html
            // Remove comments
            .replace(/<!--[\s\S]*?-->/g, '')
            // Remove whitespace between tags
            .replace(/>\s+</g, '><')
            // Remove leading and trailing whitespace
            .replace(/^\s+|\s+$/g, '')
            // Collapse multiple whitespace characters to a single space within text nodes
            .replace(/\s{2,}/g, ' ')
        );
      }

      return minifyHtml(processedBody.innerHTML).substring(0, characterLimit);
    }

    return processDocument();
  };
}
