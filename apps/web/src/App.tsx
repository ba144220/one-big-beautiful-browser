import { useState } from 'react';
import { Test } from '@/components/test';
import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <header>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Extension Web App</h1>
        <p className="mb-4">This is a separate web app that shares code with the extension.</p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600"
          onClick={() => setCount(count + 1)}>
          Count: {count}
        </button>
        <Test />
      </div>
    </div>
  );
}

export default App;
