import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, Loader } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../lib/api.js';
import { useAuthStore } from '../../stores/authStore.js';
import { toast } from '../../stores/uiStore.js';

export default function RegisterPage() {
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => authApi.register(form),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.tokens.accessToken);
      toast.success(`Welcome, ${data.user.displayName}! Let's start learning.`);
      navigate('/dashboard');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error?.message ?? 'Registration failed');
    },
  });

  const handleSubmit = (e) => { e.preventDefault(); mutate(); };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validationErrors = error?.response?.data?.error?.details ?? [];

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: 440, padding: '40px 36px', position: 'relative', zIndex: 1 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, background: 'var(--clr-primary-dim)', border: '1px solid var(--clr-border-hover)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-primary)' }}>
            <Cpu size={20} />
          </div>
          <span style={{ fontWeight: 700, background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>OS Simulator</span>
        </div>

        <h2 style={{ marginBottom: 4 }}>Create account</h2>
        <p style={{ marginBottom: 28 }}>Start mastering OS concepts today — it's free.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="displayName">Display Name</label>
            <input id="displayName" type="text" className="form-input" placeholder="Jane Doe" value={form.displayName} onChange={set('displayName')} required />
            {validationErrors.find(e => e.field === 'displayName') && <p className="form-error">{validationErrors.find(e => e.field === 'displayName').message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" type="email" className="form-input" placeholder="you@university.edu" value={form.email} onChange={set('email')} required />
            {validationErrors.find(e => e.field === 'email') && <p className="form-error">{validationErrors.find(e => e.field === 'email').message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" type="password" className="form-input" placeholder="Min 8 chars, number, symbol" value={form.password} onChange={set('password')} required />
            <span className="form-hint">Minimum 8 characters, 1 number, 1 special character</span>
            {validationErrors.find(e => e.field === 'password') && <p className="form-error">{validationErrors.find(e => e.field === 'password').message}</p>}
          </div>

          {error && !validationErrors.length && <p className="form-error">{error.response?.data?.error?.message ?? 'Registration failed'}</p>}

          <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={isPending}>
            {isPending ? <><Loader size={16} className="spin" /> Creating account…</> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--clr-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--clr-primary)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
