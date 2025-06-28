import React from 'react';
import Link from 'next/link';
import { Button, Input } from '@/app/components/ui';

export default function Footer() {
  return (
    <footer className="bg-background text-text-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo, Motto, Social */}
          <div>
            <div className="flex items-center mb-2">
              <span className="mr-2">
                <svg className="w-7 h-7 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="#6366f1" />
                  <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke="#fff" strokeWidth="1.5" fill="none" />
                </svg>
              </span>
              <span className="text-xl font-bold text-gray-800">Xpeak</span>
            </div>
            <div className="text-sm text-text-secondary mb-4">Help the World Speak as One</div>
            <div className="flex space-x-3 mb-4">
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-indigo-500 transition"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-indigo-500 transition"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 2.25a6.25 6.25 0 1 1 0 12.5 6.25 6.25 0 0 1 0-12.5zm0 1.5a4.75 4.75 0 1 0 0 9.5 4.75 4.75 0 0 0 0-9.5zm6.25 1.25a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg></a>
              <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-indigo-500 transition"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 10.268h-3v-4.604c0-1.099-.021-2.513-1.531-2.513-1.531 0-1.767 1.197-1.767 2.434v4.683h-3v-9h2.881v1.233h.041c.401-.761 1.381-1.563 2.845-1.563 3.043 0 3.604 2.004 3.604 4.609v4.721z"/></svg></a>
            </div>
          </div>

          {/* Product */}
          <div>
            <div className="font-semibold mb-2">Product</div>
            <ul className="space-y-1 text-sm">
              <li><Link href="#" className="hover:text-indigo-500 font-normal">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-indigo-500 font-normal">Pricing</Link></li>
              <li><Link href="#" className="hover:text-indigo-500 font-normal">AI Learning</Link></li>
              <li><Link href="/tutors" className="hover:text-indigo-500 font-normal">Tutors</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="font-semibold mb-2">Company</div>
            <ul className="space-y-1 text-sm">
              <li><Link href="#" className="hover:text-indigo-500 font-normal">About</Link></li>
              <li><Link href="/become-a-tutor" className="hover:text-indigo-500 font-normal">Become a Tutor</Link></li>
              <li><Link href="/community" className="hover:text-indigo-500 font-normal">Community</Link></li>
              <li><Link href="#" className="hover:text-indigo-500 font-normal">Careers</Link></li>
              <li><Link href="#" className="hover:text-indigo-500 font-normal">Contact</Link></li>
            </ul>
          </div>

          {/* Stay Updated */}
          <div>
            <div className="font-semibold mb-2">Stay Updated</div>
            <div className="text-sm text-text-secondary mb-3">Get language tips & product updates<br />— no spam, promise.</div>
            <form className="flex">
              <Input
                type="email"
                placeholder="Enter your email"
                className="rounded-r-none"
              />
              <Button type="submit" variant="primary" size="sm" className="rounded-l-none">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        <hr className="my-8 border-border" />
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-2">
          <div>© 2025 Xpeak Inc. | Help the World Speak as One</div>
          <div className="flex space-x-4">
            <Link href="#" className="hover:text-indigo-500">Terms of Service</Link>
            <Link href="#" className="hover:text-indigo-500">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 