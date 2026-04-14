import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FlaskConical, History, TrendingUp,
  ChevronLeft, ChevronRight, LogOut, Cpu, Menu
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { authApi } from '../lib/api.js';
import { toast } from '../stores/uiStore.js';
import styles from './AppLayout.module.css';

const NAV_ITEMS = [
  { path: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/simulations', icon: FlaskConical,    label: 'Simulations' },
  { path: '/history',     icon: History,         label: 'History' },
  { path: '/progress',    icon: TrendingUp,      label: 'Progress' },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  async function handleLogout() {
    try { await authApi.logout(); } catch (_) {}
    logout();
    navigate('/login');
    toast.info('Logged out successfully');
  }

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <motion.aside
        className={styles.sidebar}
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}><Cpu size={22} /></div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className={styles.logoText}
              >
                OS Simulator
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <NavLink key={path} to={path} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <Icon size={20} className={styles.navIcon} />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={styles.navLabel}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userRow}>
            <div className={styles.avatar}>{user?.displayName?.[0]?.toUpperCase() ?? 'U'}</div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <div className={styles.userName}>{user?.displayName}</div>
                  <div className={styles.userRole}>{user?.role}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>

        {/* Toggle */}
        <button className={styles.toggleBtn} onClick={toggleSidebar}>
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </motion.aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
