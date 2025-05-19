import '@src/SidePanel.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/chrome-extension';
import { Button } from '@src/components/ui/button';

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
      <Button>Click me</Button>
    </div>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);
