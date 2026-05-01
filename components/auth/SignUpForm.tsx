'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { signUpSchema, type SignUpInput } from '@/lib/validations'
import { cn } from '@/lib/utils'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export function SignUpForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) })

  async function handleGoogleSignUp() {
    setIsGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
    if (error) {
      toast.error('Google sign-up failed. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  async function onSubmit(data: SignUpInput) {
    setIsEmailLoading(true)
    try {
      const supabase = createClient()

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.fullName },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          toast.error('An account with this email already exists. Try signing in.')
        } else {
          toast.error(error.message)
        }
        return
      }

      // Session returned directly — email confirmation is disabled in Supabase
      if (authData.session) {
        router.push('/dashboard')
        router.refresh()
        return
      }

      // Email confirmation is still enabled — try signing in immediately anyway.
      // Works once you disable "Confirm email" in Supabase → Auth → Providers → Email.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (!signInError) {
        router.push('/dashboard')
        router.refresh()
      } else {
        toast.error(
          'Account created but email confirmation is required. Disable it in Supabase → Auth → Providers → Email → uncheck "Confirm email".'
        )
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsEmailLoading(false)
    }
  }

  const isLoading = isGoogleLoading || isEmailLoading

  return (
    <div className="flex flex-col justify-center w-full max-w-md px-8 py-12 lg:px-10">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-text-primary mb-1.5">
          Create your account
        </h2>
        <p className="text-sm text-text-secondary">Free forever. No credit card required.</p>
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={isLoading}
        className={cn(
          'w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium',
          'bg-surface-hover border border-border text-text-primary',
          'hover:bg-[#222228] transition-colors duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isGoogleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-surface px-3 text-xs text-text-muted uppercase tracking-widest">or</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary mb-1.5">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            {...register('fullName')}
            className={cn(
              'w-full px-3.5 py-2.5 rounded-lg text-sm text-text-primary placeholder:text-text-muted',
              'bg-surface-hover border focus:outline-none focus:ring-2 transition-colors duration-150',
              errors.fullName
                ? 'border-danger focus:ring-danger/20'
                : 'border-border focus:ring-accent/25 focus:border-accent'
            )}
          />
          {errors.fullName && <p className="mt-1.5 text-xs text-danger">{errors.fullName.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            className={cn(
              'w-full px-3.5 py-2.5 rounded-lg text-sm text-text-primary placeholder:text-text-muted',
              'bg-surface-hover border focus:outline-none focus:ring-2 transition-colors duration-150',
              errors.email
                ? 'border-danger focus:ring-danger/20'
                : 'border-border focus:ring-accent/25 focus:border-accent'
            )}
          />
          {errors.email && <p className="mt-1.5 text-xs text-danger">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              {...register('password')}
              className={cn(
                'w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm text-text-primary placeholder:text-text-muted',
                'bg-surface-hover border focus:outline-none focus:ring-2 transition-colors duration-150',
                errors.password
                  ? 'border-danger focus:ring-danger/20'
                  : 'border-border focus:ring-accent/25 focus:border-accent'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-danger">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-1 rounded-lg',
            'bg-accent hover:bg-accent-hover text-white text-sm font-semibold',
            'transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isEmailLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-accent hover:text-accent-hover font-medium transition-colors">
          Sign in
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-text-muted leading-relaxed max-w-xs mx-auto">
        By creating an account you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}
