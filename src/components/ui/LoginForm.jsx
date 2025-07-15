import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const result = login(username, password);
    
    if (!result.success) {
      setMessage(result.message);
      setPassword(''); // Pulisci password se errore
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 Boostami</h1>
          <p className="text-gray-600">Accedi al pannello di controllo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Inserisci username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Inserisci password"
              required
            />
          </div>

          {message && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {isLoading ? 'Accesso...' : 'Accedi'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Credenziali di default: admin / boostami2024
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
