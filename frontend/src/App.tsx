import ErrorBoundary from './components/ui/ErrorBoundary'
import AuthInitializer from './features/auth/AuthInitializer'
import AppRouter from './routes'

export default function App() {
  return (
    <ErrorBoundary>
      <AuthInitializer>
        <AppRouter />
      </AuthInitializer>
    </ErrorBoundary>
  )
}
