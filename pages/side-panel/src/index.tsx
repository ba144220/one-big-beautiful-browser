import { createRoot } from 'react-dom/client';
import '@src/index.css';
import SidePanel from '@src/SidePanel';
import { ClerkProvider } from '@clerk/chrome-extension';

const PUBLISHABLE_KEY = process.env.CEB_CLERK_PUBLISHABLE_KEY;
const EXTENSION_URL = chrome.runtime.getURL('.');
console.log(EXTENSION_URL);

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);
  root.render(
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY as string}
      afterSignOutUrl={`${EXTENSION_URL}side-panel/index.html`}
      signInFallbackRedirectUrl={`${EXTENSION_URL}side-panel/index.html`}
      signUpFallbackRedirectUrl={`${EXTENSION_URL}side-panel/index.html`}>
      <SidePanel />
    </ClerkProvider>,
  );
}

init();
