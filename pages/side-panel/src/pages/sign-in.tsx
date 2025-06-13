import { Button } from '@src/components/ui/button';

export default function Signin() {
  const handleSignIn = async () => {
    // Create a new tab
    chrome.tabs.create({ url: process.env.CEB_WEB_URL as string });
    // Close the side panel
    window.close();
  };
  return (
    <div className="flex justify-center items-center h-screen">
      <Button size="sm" onClick={handleSignIn}>
        Sign in
      </Button>
    </div>
  );
}
