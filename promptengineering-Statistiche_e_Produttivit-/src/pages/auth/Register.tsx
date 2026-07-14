import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { useAuth } from '../../store/AuthContext';

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Semplice controllo robustezza
  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length > 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = calculatePasswordStrength(password);
  const strengthLabels = ['Molto debole', 'Debole', 'Discreta', 'Buona', 'Forte'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError('Le password non coincidono');
    }
    
    if (!acceptedTerms || !acceptedPrivacy) {
      return setError('Devi accettare Termini e Privacy per continuare');
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante la registrazione');
      }

      login(data.token, data.user, true);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch('http://localhost:3001/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user, true);
        navigate('/');
      } else {
        setError(data.error || 'Errore Google Login');
      }
    } catch (err) {
      setError('Errore di connessione al server');
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Crea Account</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Unisciti a noi e inizia a gestire i tuoi task
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800/50">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Nome
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="Mario"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Cognome
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="Rossi"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400"
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1 h-1.5">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full ${
                      i < strength ? strengthColors[strength] : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                Robustezza: {strengthLabels[strength]}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Conferma Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
              Accetto i <a href="#" className="text-indigo-600 hover:underline">Termini e Condizioni</a>
            </span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
              Accetto l'<a href="#" className="text-indigo-600 hover:underline">Informativa Privacy</a>
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crea Account'}
        </button>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white dark:bg-slate-800 text-slate-500">oppure registrati con</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Errore di autenticazione con Google')}
              useOneTap
              theme="outline"
              size="large"
              shape="rectangular"
              text="signup_with"
            />
          </div>
          <button onClick={() => alert('Accesso con Apple prossimamente disponibile')} className="w-full inline-flex justify-center items-center py-2 px-4 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
             <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M16.365 21.43c-1.396.953-2.732.99-4.145.02-1.378-.93-2.618-.95-3.868.04-1.25.99-2.51 1.05-3.528.02-3.14-3.19-5.18-8.77-3.41-11.83 1.1-1.9 2.97-2.9 4.79-2.9 1.54 0 2.89.89 3.65.89.77 0 2.36-1.12 4.19-1.12 1.6 0 3.3.69 4.41 1.96-3.81 2.22-3.23 7.39.46 8.91-.77 2.15-1.74 4.01-2.57 5.01zM11.96 5.86c-.16-2.07 1.48-3.9 3.42-4.22.42 2.15-1.57 4.16-3.42 4.22z"/></svg>
            Continua con Apple
          </button>
          <button onClick={() => alert('Accesso con Microsoft prossimamente disponibile')} className="w-full inline-flex justify-center items-center py-2 px-4 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 23 23" fill="none"><path d="M10.77 10.77H0V0h10.77v10.77zM23 10.77H12.23V0H23v10.77zM10.77 23H0V12.23h10.77V23zM23 23H12.23V12.23H23V23z" fill="#00a4ef"/><path d="M10.77 10.77H0V0h10.77v10.77z" fill="#f25022"/><path d="M23 10.77H12.23V0H23v10.77z" fill="#7fba00"/><path d="M10.77 23H0V12.23h10.77V23z" fill="#00a4ef"/><path d="M23 23H12.23V12.23H23V23z" fill="#ffb900"/></svg>
            Continua con Microsoft
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-sm">
        <span className="text-slate-500 dark:text-slate-400">Hai già un account? </span>
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
          Accedi
        </Link>
      </div>
    </AuthLayout>
  );
}
