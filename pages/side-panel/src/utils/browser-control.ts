/**
 * Browser Control Utilities using Chrome DevTools Protocol (CDP)
 * This module provides low-level browser automation capabilities through CDP
 */

import type { MessageContent } from '@extension/shared';

interface ElementInfo {
  nodeId: number;
  selector: string;
  tagName: string;
  attributes: Record<string, string>;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  text?: string;
  value?: string;
}

/**
 * Attaches CDP debugger to a tab
 */
async function attachDebugger(tabId: number): Promise<void> {
  try {
    await chrome.debugger.attach({ tabId }, '1.3');
  } catch (error) {
    if (error instanceof Error && error.message.includes('already attached')) {
      // Already attached, continue
      return;
    }
    throw error;
  }
}

/**
 * Detaches CDP debugger from a tab
 */
async function detachDebugger(tabId: number): Promise<void> {
  try {
    await chrome.debugger.detach({ tabId });
  } catch (error) {
    // Ignore detach errors as they're usually harmless
    console.warn('Failed to detach debugger:', error);
  }
}

/**
 * Sends a CDP command to a tab
 */
async function sendCDPCommand<T = unknown>(tabId: number, method: string, params?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.debugger.sendCommand({ tabId }, method, params, result => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * Finds elements using CDP DOM methods
 */
async function findElement(tabId: number, selector: string): Promise<ElementInfo | null> {
  try {
    await attachDebugger(tabId);

    // Enable DOM domain
    await sendCDPCommand(tabId, 'DOM.enable');

    // Get document root
    await sendCDPCommand(tabId, 'DOM.getDocument');

    // Search for element
    const { searchId, resultCount } = await sendCDPCommand(tabId, 'DOM.performSearch', {
      query: selector,
      includeUserAgentShadowDOM: true,
    });

    if (resultCount === 0) {
      await sendCDPCommand(tabId, 'DOM.discardSearchResults', { searchId });
      return null;
    }

    // Get the first result
    const { nodeIds } = await sendCDPCommand(tabId, 'DOM.getSearchResults', {
      searchId,
      fromIndex: 0,
      toIndex: 1,
    });

    await sendCDPCommand(tabId, 'DOM.discardSearchResults', { searchId });

    if (nodeIds.length === 0) {
      return null;
    }

    const nodeId = nodeIds[0];

    // Get node details
    const { node } = await sendCDPCommand(tabId, 'DOM.describeNode', { nodeId });

    // Get bounding box
    let boundingBox;
    try {
      const boxModel = await sendCDPCommand(tabId, 'DOM.getBoxModel', { nodeId });
      if (boxModel && boxModel.model && boxModel.model.content) {
        const [x1, y1, x2, y2] = boxModel.model.content;
        boundingBox = {
          x: x1,
          y: y1,
          width: x2 - x1,
          height: y2 - y1,
        };
      }
    } catch {
      // Bounding box not available for this element
    }

    // Get element attributes
    const attributes: Record<string, string> = {};
    if (node.attributes) {
      for (let i = 0; i < node.attributes.length; i += 2) {
        attributes[node.attributes[i]] = node.attributes[i + 1];
      }
    }

    return {
      nodeId,
      selector,
      tagName: node.nodeName.toLowerCase(),
      attributes,
      boundingBox,
    };
  } catch (error) {
    console.error('Error finding element:', error);
    return null;
  }
}

/**
 * Clicks an element using CDP
 */
export async function clickElement(tabId: number, selector: string): Promise<MessageContent> {
  try {
    await attachDebugger(tabId);

    // Find the element first
    const element = await findElement(tabId, selector);
    if (!element || !element.boundingBox) {
      return [{ type: 'text', text: `Error: Element not found or not visible: ${selector}` }];
    }

    // Input domain is enabled by default in CDP

    // Calculate click coordinates (center of element)
    const x = element.boundingBox.x + element.boundingBox.width / 2;
    const y = element.boundingBox.y + element.boundingBox.height / 2;

    // Dispatch mouse pressed event
    await sendCDPCommand(tabId, 'Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x,
      y,
      button: 'left',
      clickCount: 1,
    });

    // Dispatch mouse released event
    await sendCDPCommand(tabId, 'Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x,
      y,
      button: 'left',
      clickCount: 1,
    });

    return [{ type: 'text', text: `Successfully clicked element: ${selector}` }];
  } catch (error) {
    console.error('Error clicking element:', error);
    return [
      { type: 'text', text: `Error clicking element: ${error instanceof Error ? error.message : String(error)}` },
    ];
  } finally {
    await detachDebugger(tabId);
  }
}

/**
 * Types text into an element using CDP
 */
export async function typeText(tabId: number, selector: string, text: string, clear = false): Promise<MessageContent> {
  try {
    await attachDebugger(tabId);

    // Find and click the element first to focus it
    const element = await findElement(tabId, selector);
    if (!element || !element.boundingBox) {
      return [{ type: 'text', text: `Error: Element not found or not visible: ${selector}` }];
    }

    // Input domain is enabled by default in CDP

    // Click to focus the element
    const x = element.boundingBox.x + element.boundingBox.width / 2;
    const y = element.boundingBox.y + element.boundingBox.height / 2;

    await sendCDPCommand(tabId, 'Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x,
      y,
      button: 'left',
      clickCount: 1,
    });

    await sendCDPCommand(tabId, 'Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x,
      y,
      button: 'left',
      clickCount: 1,
    });

    // Clear existing text if requested
    if (clear) {
      // Select all text (Ctrl+A or Cmd+A)
      const selectAllModifier = process.platform === 'darwin' ? 4 : 2; // Meta on Mac, Ctrl on others

      await sendCDPCommand(tabId, 'Input.dispatchKeyEvent', {
        type: 'keyDown',
        modifiers: selectAllModifier,
        key: 'a',
        code: 'KeyA',
        windowsVirtualKeyCode: 65,
      });

      await sendCDPCommand(tabId, 'Input.dispatchKeyEvent', {
        type: 'keyUp',
        modifiers: selectAllModifier,
        key: 'a',
        code: 'KeyA',
        windowsVirtualKeyCode: 65,
      });
    }

    // Type each character
    for (const char of text) {
      await sendCDPCommand(tabId, 'Input.dispatchKeyEvent', {
        type: 'char',
        text: char,
      });
    }

    return [{ type: 'text', text: `Successfully typed text into element: ${selector}` }];
  } catch (error) {
    console.error('Error typing text:', error);
    return [{ type: 'text', text: `Error typing text: ${error instanceof Error ? error.message : String(error)}` }];
  } finally {
    await detachDebugger(tabId);
  }
}

/**
 * Scrolls the page using CDP
 */
export async function scrollPage(
  tabId: number,
  direction: 'up' | 'down' | 'left' | 'right',
  amount = 500,
): Promise<MessageContent> {
  try {
    await attachDebugger(tabId);

    // Input domain is enabled by default in CDP

    // Get viewport center for scroll position
    await sendCDPCommand(tabId, 'Page.enable');
    const { layoutViewport } = await sendCDPCommand(tabId, 'Page.getLayoutMetrics');
    const x = layoutViewport.clientWidth / 2;
    const y = layoutViewport.clientHeight / 2;

    let deltaX = 0;
    let deltaY = 0;

    // Convert scroll direction to wheel delta (negative values scroll in positive direction)
    switch (direction) {
      case 'up':
        deltaY = -amount;
        break;
      case 'down':
        deltaY = amount;
        break;
      case 'left':
        deltaX = -amount;
        break;
      case 'right':
        deltaX = amount;
        break;
    }

    // Dispatch mouse wheel event
    await sendCDPCommand(tabId, 'Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x,
      y,
      deltaX,
      deltaY,
    });

    return [{ type: 'text', text: `Successfully scrolled ${direction} by ${amount}px` }];
  } catch (error) {
    console.error('Error scrolling page:', error);
    return [{ type: 'text', text: `Error scrolling page: ${error instanceof Error ? error.message : String(error)}` }];
  } finally {
    await detachDebugger(tabId);
  }
}

/**
 * Scrolls to a specific element using CDP
 */
export async function scrollToElement(tabId: number, selector: string): Promise<MessageContent> {
  try {
    await attachDebugger(tabId);

    const element = await findElement(tabId, selector);
    if (!element || !element.boundingBox) {
      return [{ type: 'text', text: `Error: Element not found or not visible: ${selector}` }];
    }

    // Enable DOM domain
    await sendCDPCommand(tabId, 'DOM.enable');

    // Use DOM.scrollIntoViewIfNeeded to scroll the element into view
    await sendCDPCommand(tabId, 'DOM.scrollIntoViewIfNeeded', {
      nodeId: element.nodeId,
      centerIfNeeded: true,
    });

    return [{ type: 'text', text: `Successfully scrolled to element: ${selector}` }];
  } catch (error) {
    console.error('Error scrolling to element:', error);
    return [
      { type: 'text', text: `Error scrolling to element: ${error instanceof Error ? error.message : String(error)}` },
    ];
  } finally {
    await detachDebugger(tabId);
  }
}

/**
 * Hovers over an element using CDP
 */
export async function hoverElement(tabId: number, selector: string): Promise<MessageContent> {
  try {
    await attachDebugger(tabId);

    // Find the element first
    const element = await findElement(tabId, selector);
    if (!element || !element.boundingBox) {
      return [{ type: 'text', text: `Error: Element not found or not visible: ${selector}` }];
    }

    // Input domain is enabled by default in CDP

    // Calculate hover coordinates (center of element)
    const x = element.boundingBox.x + element.boundingBox.width / 2;
    const y = element.boundingBox.y + element.boundingBox.height / 2;

    // Dispatch mouse moved event to hover over the element
    await sendCDPCommand(tabId, 'Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x,
      y,
    });

    return [{ type: 'text', text: `Successfully hovered over element: ${selector}` }];
  } catch (error) {
    console.error('Error hovering element:', error);
    return [
      { type: 'text', text: `Error hovering element: ${error instanceof Error ? error.message : String(error)}` },
    ];
  } finally {
    await detachDebugger(tabId);
  }
}

/**
 * Presses a key using CDP
 */
export async function pressKey(tabId: number, key: string, modifiers: string[] = []): Promise<MessageContent> {
  try {
    await attachDebugger(tabId);

    // Input domain is enabled by default in CDP

    // Calculate modifier flags
    let modifierFlags = 0;
    if (modifiers.includes('Alt')) modifierFlags |= 1;
    if (modifiers.includes('Control')) modifierFlags |= 2;
    if (modifiers.includes('Meta')) modifierFlags |= 4;
    if (modifiers.includes('Shift')) modifierFlags |= 8;

    // Get key code for common keys
    const getKeyCode = (key: string): number => {
      const keyCodes: Record<string, number> = {
        Enter: 13,
        Escape: 27,
        Space: 32,
        ArrowLeft: 37,
        ArrowUp: 38,
        ArrowRight: 39,
        ArrowDown: 40,
        Tab: 9,
        Backspace: 8,
        Delete: 46,
      };

      if (keyCodes[key]) return keyCodes[key];
      if (key.length === 1) return key.toUpperCase().charCodeAt(0);
      return 0;
    };

    const keyCode = getKeyCode(key);
    const code = key.length === 1 ? `Key${key.toUpperCase()}` : key;

    // Dispatch key down event
    await sendCDPCommand(tabId, 'Input.dispatchKeyEvent', {
      type: 'keyDown',
      modifiers: modifierFlags,
      key,
      code,
      windowsVirtualKeyCode: keyCode,
    });

    // For printable characters, also send a char event
    if (key.length === 1 && !modifiers.includes('Control') && !modifiers.includes('Meta')) {
      await sendCDPCommand(tabId, 'Input.dispatchKeyEvent', {
        type: 'char',
        text: key,
      });
    }

    // Dispatch key up event
    await sendCDPCommand(tabId, 'Input.dispatchKeyEvent', {
      type: 'keyUp',
      modifiers: modifierFlags,
      key,
      code,
      windowsVirtualKeyCode: keyCode,
    });

    const modifierText = modifiers.length > 0 ? ` with modifiers: ${modifiers.join(', ')}` : '';
    return [{ type: 'text', text: `Successfully pressed key: ${key}${modifierText}` }];
  } catch (error) {
    console.error('Error pressing key:', error);
    return [{ type: 'text', text: `Error pressing key: ${error instanceof Error ? error.message : String(error)}` }];
  } finally {
    await detachDebugger(tabId);
  }
}

/**
 * Waits for an element to appear using CDP
 */
export async function waitForElement(tabId: number, selector: string, timeout = 5000): Promise<MessageContent> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      await attachDebugger(tabId);
      const element = await findElement(tabId, selector);
      await detachDebugger(tabId);

      if (element) {
        return [{ type: 'text', text: `Element found: ${selector}` }];
      }

      // Wait 100ms before trying again
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      await detachDebugger(tabId);
      console.error('Error waiting for element:', error);
    }
  }

  return [{ type: 'text', text: `Timeout: Element not found within ${timeout}ms: ${selector}` }];
}

/**
 * Gets information about an element using CDP
 */
export async function getElementInfo(tabId: number, selector: string): Promise<MessageContent> {
  try {
    await attachDebugger(tabId);

    const element = await findElement(tabId, selector);
    if (!element) {
      return [{ type: 'text', text: `Error: Element not found: ${selector}` }];
    }

    // Get element attributes using DOM.getAttributes
    const attributes = await sendCDPCommand(tabId, 'DOM.getAttributes', {
      nodeId: element.nodeId,
    });

    // Convert attributes array to object
    const attributeMap: Record<string, string> = {};
    for (let i = 0; i < attributes.attributes.length; i += 2) {
      attributeMap[attributes.attributes[i]] = attributes.attributes[i + 1] || '';
    }

    // Get element properties from DOM
    const elementData = {
      tagName: element.nodeName.toLowerCase(),
      id: attributeMap.id || '',
      className: attributeMap.class || '',
      textContent: '', // Will be empty as we can't get text content without JS
      value: attributeMap.value || '',
      href: attributeMap.href || '',
      src: attributeMap.src || '',
      alt: attributeMap.alt || '',
      title: attributeMap.title || '',
      placeholder: attributeMap.placeholder || '',
      disabled: attributeMap.disabled !== undefined,
      checked: attributeMap.checked !== undefined,
      selected: attributeMap.selected !== undefined,
      visible: element.boundingBox !== null,
      rect: element.boundingBox || { x: 0, y: 0, width: 0, height: 0 },
    };

    const info = [
      `Element Information for: ${selector}`,
      `Tag: ${elementData.tagName}`,
      `ID: ${elementData.id || 'none'}`,
      `Class: ${elementData.className || 'none'}`,
      `Text: ${elementData.textContent || 'none'}`,
      `Value: ${elementData.value || 'none'}`,
      `Visible: ${elementData.visible}`,
      `Position: x=${Math.round(elementData.rect.x)}, y=${Math.round(elementData.rect.y)}`,
      `Size: ${Math.round(elementData.rect.width)}x${Math.round(elementData.rect.height)}`,
    ];

    if (elementData.href) info.push(`Link: ${elementData.href}`);
    if (elementData.src) info.push(`Source: ${elementData.src}`);
    if (elementData.alt) info.push(`Alt text: ${elementData.alt}`);
    if (elementData.title) info.push(`Title: ${elementData.title}`);
    if (elementData.placeholder) info.push(`Placeholder: ${elementData.placeholder}`);
    if (elementData.disabled) info.push('Status: disabled');
    if (elementData.checked) info.push('Status: checked');
    if (elementData.selected) info.push('Status: selected');

    return [{ type: 'text', text: info.join('\n') }];
  } catch (error) {
    console.error('Error getting element info:', error);
    return [
      { type: 'text', text: `Error getting element info: ${error instanceof Error ? error.message : String(error)}` },
    ];
  } finally {
    await detachDebugger(tabId);
  }
}

/**
 * Navigates to a URL using CDP
 */
export async function navigateToUrl(tabId: number, url: string): Promise<MessageContent> {
  try {
    await attachDebugger(tabId);

    // Enable Page domain
    await sendCDPCommand(tabId, 'Page.enable');

    // Navigate to URL
    await sendCDPCommand(tabId, 'Page.navigate', { url });

    return [{ type: 'text', text: `Successfully navigated to: ${url}` }];
  } catch (error) {
    console.error('Error navigating to URL:', error);
    return [
      { type: 'text', text: `Error navigating to URL: ${error instanceof Error ? error.message : String(error)}` },
    ];
  } finally {
    await detachDebugger(tabId);
  }
}

/**
 * Takes a screenshot using CDP
 */
export async function takeScreenshot(tabId: number, fullPage = false): Promise<MessageContent> {
  try {
    await attachDebugger(tabId);

    // Enable Page domain
    await sendCDPCommand(tabId, 'Page.enable');

    // Take screenshot
    const result = await sendCDPCommand(tabId, 'Page.captureScreenshot', {
      format: 'png',
      quality: 80,
      captureBeyondViewport: fullPage,
    });

    // Return base64 image data
    return [
      {
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${result.data}`,
        },
      },
    ];
  } catch (error) {
    console.error('Error taking screenshot:', error);
    return [
      { type: 'text', text: `Error taking screenshot: ${error instanceof Error ? error.message : String(error)}` },
    ];
  } finally {
    await detachDebugger(tabId);
  }
}
