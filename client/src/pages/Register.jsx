import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api.js';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slowRequestMessage, setSlowRequestMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSlowRequestMessage('');

    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Name, valid email, and password must be provided.');
      return;
    }

    setLoading(true);
    const slowRequestTimer = window.setTimeout(() => {
      setSlowRequestMessage('Waking up backend… this may take a few seconds on first request.');
    }, 3000);

    try {
      await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      const successMessage = 'Registration successful. Please sign in to continue.';
      window.confirm(successMessage);
      navigate('/login', {
        state: { successMessage },
      });
    } catch (err) {
      const message = err?.response?.data?.message || 'Registration failed. Please try again.';
      window.confirm(message);
    } finally {
      window.clearTimeout(slowRequestTimer);
      setSlowRequestMessage('');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto mt-14 max-w-md rounded-4xl border border-slate-200 bg-white p-8 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Create Your Account</h1>
        <p className="mt-3 text-slate-600">Register to manage tasks with a secure dashboard.</p>

        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          )}
          {slowRequestMessage && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {slowRequestMessage}
            </div>
          )}
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Full name</span>
            <input
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <div className="relative">
              <input
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create password"
                required
                minLength={6}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>
          <button
            className="inline-flex w-full items-center justify-center rounded-[0.8rem] bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(79,70,229,0.18)] transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between gap-3 text-sm text-slate-600">
          <span>Already have an account?</span>
          <Link className="font-semibold text-slate-900" to="/login">
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
