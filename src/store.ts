import { create } from 'zustand';
import type { Measure } from './data/schema';

type Filters = {
  sourceTypes: Measure['source_type'][];
  precisions: Measure['precision'][];
  chiffreesOnly: boolean;
};

type State = {
  dark: boolean;
  toggleDark: () => void;
  filters: Filters;
  setFilters: (f: Partial<Filters>) => void;
  resetFilters: () => void;
};

const NO_FILTERS: Filters = { sourceTypes: [], precisions: [], chiffreesOnly: false };

export const useStore = create<State>((set) => ({
  dark: document.documentElement.classList.contains('dark'),
  toggleDark: () =>
    set((s) => {
      const dark = !s.dark;
      document.documentElement.classList.toggle('dark', dark);
      try {
        localStorage.setItem('theme', dark ? 'dark' : 'light');
      } catch {
        /* stockage indisponible : le choix vaut pour la session */
      }
      return { dark };
    }),
  filters: NO_FILTERS,
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  resetFilters: () => set({ filters: NO_FILTERS }),
}));

export function applyFilters(measures: Measure[], f: Filters): Measure[] {
  return measures.filter(
    (m) =>
      (!f.sourceTypes.length || f.sourceTypes.includes(m.source_type)) &&
      (!f.precisions.length || f.precisions.includes(m.precision)) &&
      (!f.chiffreesOnly || m.precision === 'chiffre' || !!m.cost),
  );
}

export const hasActiveFilters = (f: Filters) => f.sourceTypes.length > 0 || f.precisions.length > 0 || f.chiffreesOnly;
