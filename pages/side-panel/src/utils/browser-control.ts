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

    await sendCDPCommand(tabId, 'Runtime.enable');

    const script = `
      (function() {
        const element = document.querySelector('${selector.replace(/'/g, "\\'")}')
        if (element) {
          element.click();
          return 'success';
        }
        return 'element not found';
      })()
    `;

    const result = await sendCDPCommand(tabId, 'Runtime.evaluate', {
      expression: script,
      returnByValue: true,
    });

    if (result.result.value !== 'success') {
      throw new Error('JavaScript click failed: element not found');
    }

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

    await sendCDPCommand(tabId, 'Runtime.enable');

    const script = `
      (function() {
        const element = document.querySelector('${selector.replace(/'/g, "\\'")}')
        if (element) {
          element.focus();
          ${clear ? 'element.value = "";' : ''}
          element.value += '${text.replace(/'/g, "\\'")}'
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          return 'success';
        }
        return 'element not found';
      })()
    `;

    const result = await sendCDPCommand(tabId, 'Runtime.evaluate', {
      expression: script,
      returnByValue: true,
    });

    if (result.result.value !== 'success') {
      throw new Error('JavaScript typing failed: element not found');
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

    await sendCDPCommand(tabId, 'Runtime.enable');

    let scrollX = 0;
    let scrollY = 0;

    switch (direction) {
      case 'up':
        scrollY = -amount;
        break;
      case 'down':
        scrollY = amount;
        break;
      case 'left':
        scrollX = -amount;
        break;
      case 'right':
        scrollX = amount;
        break;
    }

    const script = `
      (function() {
        window.scrollBy(${scrollX}, ${scrollY});
        return 'success';
      })()
    `;

    await sendCDPCommand(tabId, 'Runtime.evaluate', {
      expression: script,
      returnByValue: true,
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
    if (!element) {
      return [{ type: 'text', text: `Error: Element not found: ${selector}` }];
    }

    // Enable Runtime domain to execute JavaScript
    await sendCDPCommand(tabId, 'Runtime.enable');

    // Scroll element into view using JavaScript
    const script = `
      (function() {
        const element = document.querySelector('${selector.replace(/'/g, "\\'")}')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return 'success';
        }
        return 'element not found';
      })()
    `;

    const result = await sendCDPCommand(tabId, 'Runtime.evaluate', {
      expression: script,
      returnByValue: true,
    });

    if (result.result.value === 'success') {
      return [{ type: 'text', text: `Successfully scrolled to element: ${selector}` }];
    } else {
      return [{ type: 'text', text: `Error: Could not scroll to element: ${selector}` }];
    }
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

    await sendCDPCommand(tabId, 'Runtime.enable');

    const script = `
      (function() {
        const element = document.querySelector('${selector.replace(/'/g, "\\'")}')
        if (element) {
          const event = new MouseEvent('mouseover', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          element.dispatchEvent(event);
          return 'success';
        }
        return 'element not found';
      })()
    `;

    const result = await sendCDPCommand(tabId, 'Runtime.evaluate', {
      expression: script,
      returnByValue: true,
    });

    if (result.result.value !== 'success') {
      throw new Error('JavaScript hover failed: element not found');
    }

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

    await sendCDPCommand(tabId, 'Runtime.enable');

    const script = `
      (function() {
        const event = new KeyboardEvent('keydown', {
          key: '${key.replace(/'/g, "\\'")}'',
          altKey: ${modifiers.includes('Alt')},
          ctrlKey: ${modifiers.includes('Control')},
          metaKey: ${modifiers.includes('Meta')},
          shiftKey: ${modifiers.includes('Shift')},
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(event);
        
        const upEvent = new KeyboardEvent('keyup', {
          key: '${key.replace(/'/g, "\\'")}'',
          altKey: ${modifiers.includes('Alt')},
          ctrlKey: ${modifiers.includes('Control')},
          metaKey: ${modifiers.includes('Meta')},
          shiftKey: ${modifiers.includes('Shift')},
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(upEvent);
        
        return 'success';
      })()
    `;

    await sendCDPCommand(tabId, 'Runtime.evaluate', {
      expression: script,
      returnByValue: true,
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

    // Get additional element properties using JavaScript
    await sendCDPCommand(tabId, 'Runtime.enable');

    const script = `
      (function() {
        const element = document.querySelector('${selector.replace(/'/g, "\\'")}')
        if (!element) return null;
        
        return {
          tagName: element.tagName.toLowerCase(),
          id: element.id || '',
          className: element.className || '',
          textContent: element.textContent?.trim() || '',
          value: element.value || '',
          href: element.href || '',
          src: element.src || '',
          alt: element.alt || '',
          title: element.title || '',
          placeholder: element.placeholder || '',
          disabled: element.disabled || false,
          checked: element.checked || false,
          selected: element.selected || false,
          visible: element.offsetParent !== null,
          rect: element.getBoundingClientRect()
        };
      })()
    `;

    const result = await sendCDPCommand(tabId, 'Runtime.evaluate', {
      expression: script,
      returnByValue: true,
    });

    const elementData = result.result.value;
    if (!elementData) {
      return [{ type: 'text', text: `Error: Could not get element information: ${selector}` }];
    }

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
