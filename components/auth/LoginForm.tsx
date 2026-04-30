'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginInput } from '@/lib/validations'
import { cn } from '@/lib/utils'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

const SUPABASE_ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'Incorrect email or password.',
  'Email not confirmed': 'Please confirm your email before signing in.',
  'Too many requests': 'Too many attempts. Please wait a moment and try again.',
}

function mapSupabaseError(message: string): string {
  return SUPABASE_ERROR_MAP[message] ?? message
}

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function handleGoogleLogin() {
    setIsGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
    if (error) {
      toast.error('Google sign-in failed. Please try again.')
      setIsGoogleLoading(false)
    }
    // On success the page navigates away; no need to reset loading
  }

  async function onSubmit(data: LoginInput) {
    setIsEmailLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (error) {
        toast.error(mapSupabaseError(error.message))
        return
      }
      router.push('/dashboard')
      router.refresh()
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
          Welcome back
        </h2>
        <p className="text-sm text-text-secondary">
          Sign in to your ResumeIQ account.
        </p>
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className={cn(
          'w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium',
          'bg-surface-hover border border-border text-text-primary',
          'hover:bg-[#222228] transition-colors duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isGoogleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-surface px-3 text-xs text-text-muted uppercase tracking-widest">
            or
          </span>
        </div>
      </div>

      {/* Email / password form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
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
          {errors.email && (
            <p className="mt-1.5 text-xs text-danger">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
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
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2.5">
          <input
            id="remember"
            type="checkbox"
            className="w-4 h-4 rounded border-border bg-surface-hover accent-accent cursor-pointer"
          />
          <label
            htmlFor="remember"
            className="text-sm text-text-secondary cursor-pointer select-none"
          >
            Remember me
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-1 rounded-lg',
            'bg-accent hover:bg-accent-hover text-white text-sm font-semibold',
            'transition-colors duration-150',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isEmailLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="text-accent hover:text-accent-hover font-medium transition-colors"
        >
          Create one free
        </Link>
      </p>
    </div>
  )
}
