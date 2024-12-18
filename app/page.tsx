'use client'

import { SignInButton, useAuth } from "@clerk/nextjs";
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <Logo />
      <h1 className="mt-8 text-4xl font-bold text-gray-900">Welcome to The Bank</h1>
      <p className="mt-4 text-xl text-gray-600">Secure, simple, and smart banking.</p>
      <div className="mt-8">
        {isSignedIn ? (
          <Link href="/dashboard" className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors">
            Go to Dashboard
          </Link>
        ) : (
          <SignInButton mode="modal">
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors">
              Sign In
            </button>
          </SignInButton>
        )}
      </div>
    </div>
  )
}

