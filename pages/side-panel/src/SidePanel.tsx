import '@src/SidePanel.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { SignedIn, SignedOut, UserButton } from '@clerk/chrome-extension';
import { Button } from '@src/components/ui/button';

const SidePanel = () => {
  const handleSignIn = async () => {
    // Create a new tab
    chrome.tabs.create({ url: process.env.CEB_WEB_URL as string });
    // Close the side panel
    window.close();
  };
  return (
    <div className="p-12">
      <nav className="">
        <SignedOut>
          <Button size="sm" onClick={handleSignIn}>
            Sign in
          </Button>
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
