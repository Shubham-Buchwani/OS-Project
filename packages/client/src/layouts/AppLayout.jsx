import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FlaskConical, History, TrendingUp,
  ChevronLeft, ChevronRight, LogOut, Cpu, Menu, X
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
      {/* ── Mobile Header ───────────────────────────────────── */}
      <header className={styles.mobileHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Cpu size={20} color="var(--clr-primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>OS Sim</span>
        </div>
        <button className={styles.hamburgerBtn} onClick={toggleSidebar}>
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* ── Sidebar Backdrop (Mobile Only) ──────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.sidebarOverlay}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}><Cpu size={22} /></div>
          <span className={styles.logoText}>OS Simulator</span>
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <NavLink 
              key={path} 
              to={path} 
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
            >
              <Icon size={20} className={styles.navIcon} />
              <span className={styles.navLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userRow}>
            <div className={styles.avatar}>{user?.displayName?.[0]?.toUpperCase() ?? 'U'}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.displayName}</div>
              <div className={styles.userRole}>{user?.role}</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>

        {/* Desktop Toggle */}
        <button className={styles.toggleBtn} onClick={toggleSidebar}>
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className={`${styles.main} ${sidebarOpen ? styles.mainPushed : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
