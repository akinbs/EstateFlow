import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[EstateFlow] Uncaught render error:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    const isDev = import.meta.env.DEV

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <RefreshCw size={32} className="text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Bir şeyler yanlış gitti</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Beklenmeyen bir hata oluştu. Sayfayı yenileyebilir veya ana sayfaya dönebilirsiniz.
        </p>

        {isDev && this.state.error && (
          <pre className="mt-4 max-h-48 max-w-lg overflow-auto rounded-xl bg-slate-900 p-4 text-left text-xs text-green-400">
            {this.state.error.stack}
          </pre>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            <RefreshCw size={14} />
            Yenile
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Home size={14} />
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    )
  }
}
