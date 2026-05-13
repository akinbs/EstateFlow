import AuthInitializer from './features/auth/AuthInitializer'
import AppRouter from './routes'

export default function App() {
  return (
    <AuthInitializer>
      <AppRouter />
    </AuthInitializer>
  )
}
