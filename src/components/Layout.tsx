import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { lastUpdate } from '../data';
import { formatShortDate } from '../lib/format';
import { useStore } from '../store';
import { Icon } from './Icon';

const NAV = [
  { to: '/', label: 'Candidats', end: true },
  { to: '/comparateur', label: 'Comparateur' },
  { to: '/themes', label: 'Thèmes' },
  { to: '/programmes', label: 'Programmes' },
  { to: '/methodologie', label: 'Méthodologie' },
];

function ThemeToggle() {
  const { dark, toggleDark } = useStore();
  return (
    <button
      type="button"
      onClick={toggleDark}
      className="btn btn-ghost !p-2"
      aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={dark ? 'Mode clair' : 'Mode sombre'}
    >
      <Icon name={dark ? 'sun' : 'moon'} className="size-[18px]" />
    </button>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${isActive ? 'text-ink' : 'text-ink-3 hover:text-ink'}`;

  return (
    <header className="bg-canvas/80 border-line sticky top-0 z-40 border-b backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Accueil – Présidentielle 2027">
          <span className="bg-ink text-canvas font-display flex size-8 items-center justify-center rounded-lg text-sm font-semibold">
            27
          </span>
          <span className="leading-tight">
            <span className="font-display block text-[15px] font-semibold">Présidentielle 2027</span>
            <span className="text-ink-3 block text-[11px]">Comparateur de programmes</span>
          </span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="bg-surface-2 absolute inset-0 -z-10 rounded-full"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                  {n.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <ThemeToggle />
          <button
            type="button"
            className="btn btn-ghost !p-2 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? 'close' : 'menu'} className="size-5" />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Navigation principale"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-line overflow-hidden border-t md:hidden"
          >
            <ul className="flex flex-col p-2">
              {NAV.map((n) => (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    end={n.end}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-3 text-[15px] font-medium ${isActive ? 'bg-surface-2 text-ink' : 'text-ink-2'}`
                    }
                  >
                    {n.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function UpdateBanner() {
  return (
    <div className="bg-surface-2 text-ink-2 border-line border-b px-4 py-1.5 text-center text-xs">
      Données mises à jour le {formatShortDate(lastUpdate)} – Outil indépendant et non officiel
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-line text-ink-3 mt-20 border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          Outil indépendant et non officiel. Aucune recommandation de vote. Données vérifiées au {formatShortDate(lastUpdate)}.
        </p>
        <p className="flex gap-4">
          <Link to="/methodologie" className="hover:text-ink">
            Méthodologie et sources
          </Link>
          <Link to="/methodologie#signaler" className="hover:text-ink">
            Signaler une erreur
          </Link>
        </p>
      </div>
    </footer>
  );
}
