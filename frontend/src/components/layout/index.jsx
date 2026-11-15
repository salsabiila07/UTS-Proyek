import { forwardRef } from 'react';
import { Menu } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Avatar, Button } from '../ui/index.jsx';
import '../ui/system.css';

export const Sidebar = forwardRef(function Sidebar({ school = 'SD N 2 Giriharjo', title = 'SIM Ekstrakurikuler', items = [], profile, footer, className = '', id, onNavigate, drawerMode = false, isDrawerOpen = false }, ref) {
  return (
    <aside ref={ref} id={id} className={`ui-sidebar ${className}`} aria-label="Navigasi utama" aria-hidden={drawerMode && !isDrawerOpen ? 'true' : undefined} inert={drawerMode && !isDrawerOpen} role={isDrawerOpen ? 'dialog' : undefined} aria-modal={isDrawerOpen ? 'true' : undefined}>
      <div className="ui-sidebar__brand"><strong>{title}</strong><span>{school}</span></div>
      <nav className="ui-sidebar__nav">{items.map(({ to, label, icon }) => <NavLink key={to} to={to} title={label} aria-label={label} onClick={onNavigate} className={({ isActive }) => `ui-sidebar__link${isActive ? ' is-active' : ''}`}><span className="ui-sidebar__link-icon" aria-hidden="true">{icon}</span><span className="ui-sidebar__link-label">{label}</span></NavLink>)}</nav>
      {profile && <div className="ui-sidebar__profile"><Avatar name={profile.name} src={profile.src} /><span><strong>{profile.name}</strong>{profile.caption && <small>{profile.caption}</small>}</span></div>}
      {footer && <div className="ui-sidebar__footer">{footer}</div>}
    </aside>
  );
});

export function Topbar({ title, profile, onMenuClick, menuExpanded, menuControls, actions }) {
  return (
    <header className="ui-topbar">
      {onMenuClick && <Button variant="ghost" size="icon" className="ui-topbar__menu" aria-label={menuExpanded ? 'Ciutkan navigasi' : 'Buka navigasi'} aria-expanded={menuExpanded} aria-controls={menuControls} onClick={onMenuClick}><Menu size={20} /></Button>}
      {title && <h1>{title}</h1>}
      <div className="ui-topbar__actions">{actions}{profile && <Avatar name={profile.name} src={profile.src} />}</div>
    </header>
  );
}

export function PageHeader({ title, description, actions, eyebrow }) {
  return <div className="ui-page-header">{eyebrow && <p className="ui-page-header__eyebrow">{eyebrow}</p>}<div className="ui-page-header__row"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="ui-page-header__actions">{actions}</div>}</div></div>;
}
