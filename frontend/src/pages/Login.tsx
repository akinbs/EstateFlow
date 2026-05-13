import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Building2, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import { getFirebaseAuthErrorMessage } from '../utils/firebaseError'

type Mode = 'login' | 'register'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth()

  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = () => setError(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password)
      } else {
        await registerWithEmail(email, password)
      }
      navigate(from, { replace: true })
    } catch (err) {
      setError(getFirebaseAuthErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    setIsGoogleLoading(true)
    try {
      await loginWithGoogle()
      navigate(from, { replace: true })
    } catch (err) {
      setError(getFirebaseAuthErrorMessage(err))
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-200">
              <Building2 size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">
              Estate<span className="text-orange-500">Flow</span>
            </span>
          </Link>
          <p className="mt-2 text-sm text-slate-500">
            {mode === 'login' ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          {/* Mode toggle */}
          <div className="mb-6 flex rounded-xl border border-slate-200 p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); clearError() }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); clearError() }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-posta"
              type="email"
              placeholder="ornek@email.com"
              fullWidth
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                label="Şifre"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                fullWidth
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full gap-2"
              isLoading={isSubmitting}
              disabled={isSubmitting || isGoogleLoading}
            >
              <Mail size={16} />
              {mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-xs text-slate-400">veya</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-2"
            onClick={handleGoogle}
            isLoading={isGoogleLoading}
            disabled={isSubmitting || isGoogleLoading}
          >
            <GoogleIcon />
            Google ile {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </Button>

          <p className="mt-4 text-center text-xs text-slate-400">
            Giriş yaparak{' '}
            <span className="text-slate-600">Kullanım Şartları</span>'nı kabul etmiş olursunuz.
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          <Link to="/" className="text-orange-500 hover:text-orange-600 transition-colors">
            ← Ana sayfaya dön
          </Link>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}
