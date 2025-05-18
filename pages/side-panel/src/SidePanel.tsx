import '@src/SidePanel.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/chrome-extension';

const SidePanel = () => {
  return (
    <div className="p-12">
      <nav className="">
        <SignedOut>
          <SignInButton mode="modal" />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </nav>
    </div>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);
