import { useEffect, useId, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import './system.css';

export function Button({ variant = 'primary', size = 'md', loading = false, className = '', children, disabled, ...props }) {
  return (
    <button className={`ui-button ui-button--${variant} ui-button--${size} ${className}`} disabled={disabled || loading} {...props}>
      {loading && <span className="ui-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}

function FormField({ label, hint, error, id, className = '', children }) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`ui-field ${className}`}>
      {label && <label className="ui-label" htmlFor={fieldId}>{label}</label>}
      {children({ id: fieldId, describedBy, invalid: Boolean(error) })}
      {hint && <small className="ui-hint" id={hintId}>{hint}</small>}
      {error && <small className="ui-error" id={errorId}>{error}</small>}
    </div>
  );
}

export function Input({ label, hint, error, id, className = '', ...props }) {
  return <FormField {...{ label, hint, error, id, className }}>{(field) => <input className="ui-control" {...field} {...props} />}</FormField>;
}

export function Select({ label, hint, error, id, options = [], placeholder, className = '', children, ...props }) {
  return (
    <FormField {...{ label, hint, error, id, className }}>
      {(field) => <select className="ui-control" {...field} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {children || options.map(({ value, label: optionLabel }) => <option key={value} value={value}>{optionLabel}</option>)}
      </select>}
    </FormField>
  );
}

export function Textarea({ label, hint, error, id, className = '', ...props }) {
  return <FormField {...{ label, hint, error, id, className }}>{(field) => <textarea className="ui-control ui-textarea" {...field} {...props} />}</FormField>;
}

export function Badge({ tone = 'neutral', children, className = '' }) {
  return <span className={`ui-badge ui-badge--${tone} ${className}`}>{children}</span>;
}

export function Card({ as: Component = 'section', className = '', children, ...props }) {
  return <Component className={`ui-card ${className}`} {...props}>{children}</Component>;
}

export function StatCard({ label, value, icon, detail, className = '' }) {
  return (
    <Card className={`ui-stat-card ${className}`}>
      <div className="ui-stat-card__heading"><span>{label}</span>{icon && <span className="ui-stat-card__icon" aria-hidden="true">{icon}</span>}</div>
      <strong className="ui-stat-card__value">{value}</strong>
      {detail && <p className="ui-stat-card__detail">{detail}</p>}
    </Card>
  );
}

export function Modal({ open, onClose, title, children, footer, className = '' }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    const focusable = () => [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')];
    focusable()[0]?.focus();
    function handleKeyDown(event) {
      if (event.key === 'Escape') onCloseRef.current?.();
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) { event.preventDefault(); dialog.focus(); return; }
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('keydown', handleKeyDown); previous?.focus?.(); };
  }, [open]);
  if (!open) return null;
  return (
    <div className="ui-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
      <section ref={dialogRef} className={`ui-modal ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <header className="ui-modal__header"><h2 id={titleId}>{title}</h2><Button variant="ghost" size="icon" aria-label="Tutup dialog" onClick={onClose}><X size={20} /></Button></header>
        <div className="ui-modal__body">{children}</div>
        {footer && <footer className="ui-modal__footer">{footer}</footer>}
      </section>
    </div>
  );
}

export function Table({ columns, rows, rowKey = 'id', emptyMessage = 'Belum ada data', caption }) {
  return (
    <div className="ui-table-scroll" role="region" aria-label={caption || 'Tabel data'} tabIndex={0}>
      <table className="ui-table">
        {caption && <caption className="ui-visually-hidden">{caption}</caption>}
        <thead><tr>{columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}</tr></thead>
        <tbody>{rows.length ? rows.map((row, index) => <tr key={row[rowKey] ?? index}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}</tr>) : <tr><td colSpan={columns.length}><EmptyState title={emptyMessage} /></td></tr>}</tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, pageCount, onPageChange, label = 'Halaman' }) {
  return (
    <nav className="ui-pagination" aria-label="Navigasi halaman">
      <Button variant="outline" size="sm" aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={16} /> Sebelumnya</Button>
      <span aria-live="polite">{label} {page} dari {pageCount}</span>
      <Button variant="outline" size="sm" aria-label="Halaman berikutnya" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>Berikutnya <ChevronRight size={16} /></Button>
    </nav>
  );
}

export function SearchInput({ value, onChange, label = 'Cari', placeholder = 'Cari…', ...props }) {
  const id = useId();
  return <div className="ui-search"><label className="ui-visually-hidden" htmlFor={id}>{label}</label><input id={id} className="ui-control" type="search" value={value} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} {...props} /></div>;
}

export function Filter({ label, children, className = '' }) {
  return <div className={`ui-filter ${className}`}><span className="ui-filter__label">{label}</span>{children}</div>;
}

export function Dropdown({ label = 'Aksi', ariaLabel, children }) {
  return <details className="ui-dropdown"><summary aria-label={ariaLabel}>{label}</summary><div className="ui-dropdown__menu">{children}</div></details>;
}

export function Toast({ message, tone = 'info', onDismiss }) {
  if (!message) return null;
  return <div className={`ui-toast ui-toast--${tone}`} role={tone === 'danger' ? 'alert' : 'status'}><span>{message}</span>{onDismiss && <Button variant="ghost" size="icon" aria-label="Tutup notifikasi" onClick={onDismiss}><X size={16} /></Button>}</div>;
}

export function EmptyState({ title = 'Belum ada data', description, action }) {
  return <div className="ui-empty"><strong>{title}</strong>{description && <p>{description}</p>}{action}</div>;
}

export function Skeleton({ width, height = 16, className = '' }) {
  return <span className={`ui-skeleton ${className}`} aria-hidden="true" style={{ width, height }} />;
}

export function Avatar({ name = '', src, size = 'md', className = '' }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return src ? <img className={`ui-avatar ui-avatar--${size} ${className}`} src={src} alt={name} /> : <span className={`ui-avatar ui-avatar--${size} ${className}`} aria-label={name || 'Avatar'}>{initials || '?'}</span>;
}
