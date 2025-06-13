import '@src/side-panel.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { SignedIn, SignedOut } from '@clerk/chrome-extension';
import Chatroom from './pages/chatroom';
import Signin from './pages/signin';
import { SelectedTabsProvider } from './hooks/use-selected-tabs';
const SidePanel = () => {
  return (
    <>
      <SignedOut>
        <Signin />
      </SignedOut>
      <SignedIn>
        <SelectedTabsProvider>
          <Chatroom />
        </SelectedTabsProvider>
      </SignedIn>
    </>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);
