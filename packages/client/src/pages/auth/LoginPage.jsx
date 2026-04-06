import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, Eye, EyeOff, Loader } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../lib/api.js';
import { useAuthStore } from '../../stores/authStore.js';
import { toast } from '../../stores/uiStore.js';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => authApi.login(form),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.tokens.accessToken);
      toast.success(`Welcome back, ${data.user.displayName}!`);
      navigate('/dashboard');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error?.message ?? 'Login failed');
    },
  });

  const handleSubmit = (e) => { e.preventDefault(); mutate(); };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: 440, padding: '40px 36px', position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, background: 'var(--clr-primary-dim)', border: '1px solid var(--clr-border-hover)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-primary)' }}>
            <Cpu size={20} />
          </div>
          <span style={{ fontWeight: 700, background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>OS Simulator</span>
        </div>

        <h2 style={{ marginBottom: 4 }}>Welcome back</h2>
        <p style={{ marginBottom: 28 }}>Sign in to continue your learning journey.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" type="email" className="form-input" placeholder="you@university.edu" value={form.email} onChange={set('email')} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                required
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPass((v) => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--clr-text-muted)', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="form-error">{error.response?.data?.error?.message ?? 'Login failed'}</p>}

          <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={isPending}>
            {isPending ? <><Loader size={16} className="spin" /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--clr-text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--clr-primary)', fontWeight: 500 }}>Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
