import type { Metadata } from 'next'
import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-[480px_1fr]">
      <AuthBrandPanel />
      <div className="flex items-center justify-center bg-surface">
        <LoginForm />
      </div>
    </main>
  )
}
