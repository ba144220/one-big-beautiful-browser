import '@src/SidePanel.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { SignedIn, SignedOut } from '@clerk/chrome-extension';
import Chatroom from './pages/chatroom';
import Signin from './pages/signin';
const SidePanel = () => {
  return (
    <>
      <SignedOut>
        <Signin />
      </SignedOut>
      <SignedIn>
        <Chatroom />
      </SignedIn>
    </>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);
