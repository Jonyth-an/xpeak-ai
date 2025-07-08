'use client';

import React from 'react';
import { Button } from '@/app/components/ui/Button';
import Link from 'next/link';

export default function AsChildDemo() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">asChild Pattern Demo</h1>
        
        <div className="space-y-8">
          {/* Basic Button */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">1. Regular Button</h2>
            <Button variant="primary" onClick={() => alert('Button clicked!')}>
              Regular Button
            </Button>
          </section>

          {/* Button as Link */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">2. Button as Link (asChild)</h2>
            <Button asChild variant="secondary">
              <Link href="/dashboard">
                Navigate to Dashboard
              </Link>
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              This renders as an &lt;a&gt; tag but maintains button styling and behavior
            </p>
          </section>

          {/* Button as External Link */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">3. Button as External Link</h2>
            <Button asChild variant="outline">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                Visit GitHub
              </a>
            </Button>
          </section>

          {/* Button as Form Submit */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">4. Button as Form Submit</h2>
            <form onSubmit={(e) => { e.preventDefault(); alert('Form submitted!'); }}>
              <Button asChild type="submit" variant="success">
                <button type="submit">
                  Submit Form
                </button>
              </Button>
            </form>
          </section>

          {/* Button as Label */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">5. Button as Label</h2>
            <div className="space-y-2">
              <Button asChild variant="tertiary">
                <label htmlFor="file-input">
                  Choose File
                </label>
              </Button>
              <input 
                id="file-input" 
                type="file" 
                className="hidden"
                onChange={(e) => console.log('File selected:', e.target.files?.[0])}
              />
            </div>
          </section>

          {/* Feature Variants with asChild */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">6. Feature Variants with asChild</h2>
            <div className="space-y-4">
              <Button asChild variant="feature" feature="sagea">
                <Link href="/meet-sagea">
                  Meet Sagea
                </Link>
              </Button>
              
              <Button asChild variant="feature" feature="word-maze">
                <Link href="/word-maze">
                  Word Maze
                </Link>
              </Button>
              
              <Button asChild variant="feature" feature="topic-sparks">
                <Link href="/topic-spark">
                  Topic Sparks
                </Link>
              </Button>
            </div>
          </section>

          {/* Complex Example: Card with Button */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">7. Complex Example: Card with Button</h2>
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2">Interactive Card</h3>
              <p className="text-gray-600 mb-4">
                This entire card is clickable because the Button renders as a div
              </p>
              <Button asChild variant="primary" size="sm">
                <div role="button" tabIndex={0} onClick={() => alert('Card clicked!')}>
                  View Details
                </div>
              </Button>
            </div>
          </section>

          {/* Accessibility Example */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">8. Accessibility Example</h2>
            <Button asChild variant="warning">
              <div 
                role="button" 
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alert('Accessible button activated!');
                  }
                }}
                onClick={() => alert('Accessible button clicked!')}
              >
                Accessible Button
              </div>
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              This div has proper ARIA attributes and keyboard navigation
            </p>
          </section>
        </div>

        {/* Code Examples */}
        <section className="bg-white p-6 rounded-lg shadow mt-8">
          <h2 className="text-xl font-semibold mb-4">Code Examples</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Button as Link:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<Button asChild variant="secondary">
  <Link href="/dashboard">
    Navigate to Dashboard
  </Link>
</Button>`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Button as External Link:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<Button asChild variant="outline">
  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
    Visit GitHub
  </a>
</Button>`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Button as Accessible Div:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<Button asChild variant="primary">
  <div 
    role="button" 
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    }}
    onClick={handleClick}
  >
    Custom Element
  </div>
</Button>`}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 