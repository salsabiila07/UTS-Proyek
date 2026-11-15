import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Avatar, Button } from '../components/ui/index.jsx';
import { Sidebar, Topbar } from '../components/layout/index.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { roleNames, roleNavigation } from './navigation.js';
import './application-shell.css';

const SIDEBAR_ID = 'application-sidebar';

export default function ApplicationShell({ role }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileViewport, setMobileViewport] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const [expanded, setExpanded] = useState(() => !window.matchMedia('(min-width: 768px) and (max-width: 1199px)').matches);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const navItems = useMemo(() => roleNavigation[role].map(({ path, label, icon: Icon }) => ({
    to: `/${role}/${path}`,
    label,
    icon: <Icon size={19} strokeWidth={1.8} />,
  })), [role]);
  const currentItem = [...navItems].sort((a, b) => b.to.length - a.to.length).find(({ to }) => location.pathname === to || location.pathname.startsWith(`${to}/`));

  useEffect(() => {
    const tablet = window.matchMedia('(min-width: 768px) and (max-width: 1199px)');
    const mobile = window.matchMedia('(max-width: 767px)');
    function handleResize() {
      setExpanded(!tablet.matches);
      setMobileViewport(mobile.matches);
      if (!mobile.matches) setDrawerOpen(false);
    }
    tablet.addEventListener('change', handleResize);
    mobile.addEventListener('change', handleResize);
    return () => {
      tablet.removeEventListener('change', handleResize);
      mobile.removeEventListener('change', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const sidebar = sidebarRef.current;
    const trigger = document.querySelector(`[aria-controls="${SIDEBAR_ID}"]`);
    const focusable = () => [...sidebar.querySelectorAll('a[href], button:not([disabled])')];
    document.body.style.overflow = 'hidden';
    focusable()[0]?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') closeDrawer();
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) {
        event.preventDefault();
        items.at(-1).focus();
      } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
        event.preventDefault();
        items[0].focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      trigger?.focus();
    };
  }, [closeDrawer, drawerOpen]);

  function toggleNavigation() {
    if (window.matchMedia('(max-width: 767px)').matches) setDrawerOpen((open) => !open);
    else setExpanded((open) => !open);
  }

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className={`application-shell${expanded ? '' : ' is-compact'}${drawerOpen ? ' is-drawer-open' : ''}`}>
      {drawerOpen && <button className="application-shell__backdrop" type="button" tabIndex={-1} aria-hidden="true" onClick={closeDrawer} />}
      <Sidebar
        ref={sidebarRef}
        id={SIDEBAR_ID}
        className="application-shell__sidebar"
        title="SIM Ekskul"
        items={navItems}
        profile={{ name: user?.name || roleNames[role], caption: roleNames[role] }}
        footer={<Button className="application-shell__logout" variant="ghost" onClick={handleLogout}><LogOut size={18} /> <span>Keluar</span></Button>}
        onNavigate={closeDrawer}
        drawerMode={mobileViewport}
        isDrawerOpen={drawerOpen}
      />
      <div className="application-shell__main">
        <Topbar
          title={currentItem?.label || roleNames[role]}
          profile={{ name: user?.name || roleNames[role] }}
          onMenuClick={toggleNavigation}
          menuExpanded={mobileViewport ? drawerOpen : expanded}
          menuControls={SIDEBAR_ID}
        />
        <main className="application-shell__content"><Outlet /></main>
      </div>
    </div>
  );
}
