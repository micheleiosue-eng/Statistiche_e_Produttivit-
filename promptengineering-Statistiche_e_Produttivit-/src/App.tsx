import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AppProvider } from './store/AppContext'
import { AuthProvider } from './store/AuthContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'

import { Dashboard } from './pages/Dashboard'
import { Board } from './pages/Board'
import { Team } from './pages/Team'
import { GestioneStato } from './pages/GestioneStato'
import { GestioneCategorie } from './pages/GestioneCategorie'
import { GestioneProgetti } from './pages/GestioneProgetti'
import { CalendarPage } from './pages/CalendarPage'
import { Archive } from './pages/Archive'

import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { ResetPassword } from './pages/auth/ResetPassword'

const GOOGLE_CLIENT_ID = 'inserisci-qui-il-tuo-google-client-id.apps.googleusercontent.com'

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AppProvider>
          <Router>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/board" element={<Board />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/team" element={<Team />} />
                <Route path="/gestione_stato" element={<GestioneStato />} />
                <Route path="/categorie" element={<GestioneCategorie />} />
                <Route path="/progetti" element={<GestioneProgetti />} />
                <Route path="/archivio" element={<Archive />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Router>
        </AppProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App