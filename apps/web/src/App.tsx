import { UserButton, SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <SignedIn>
        <UserButton />
        <div>
          <p>You are signed in. Please open the side panel to continue.</p>
        </div>
      </SignedIn>
      <SignedOut>
        <SignIn />
      </SignedOut>
    </div>
  );
}

export default App;
