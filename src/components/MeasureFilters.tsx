import type { Measure } from '../data/schema';
import { PRECISION_HELP, PRECISION_LABEL, SOURCE_HELP, SOURCE_LABEL } from '../lib/labels';
import { hasActiveFilters, useStore } from '../store';

const SOURCES = Object.keys(SOURCE_LABEL) as Measure['source_type'][];
const PRECISIONS = Object.keys(PRECISION_LABEL) as Measure['precision'][];

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

/** Filtres des mesures (type de source, précision, chiffrées). État partagé entre les pages. */
export function MeasureFilters() {
  const { filters, setFilters, resetFilters } = useStore();
  return (
    <div className="flex flex-col gap-3 text-sm" role="group" aria-label="Filtrer les mesures">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="eyebrow mr-1 w-full sm:w-auto">Source</span>
        {SOURCES.map((s) => {
          const on = filters.sourceTypes.includes(s);
          return (
            <button
              key={s}
              type="button"
              aria-pressed={on}
              title={SOURCE_HELP[s]}
              className={`chip !py-1 !text-xs ${on ? 'chip-on' : 'chip-off'}`}
              onClick={() => setFilters({ sourceTypes: toggle(filters.sourceTypes, s) })}
            >
              {SOURCE_LABEL[s]}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="eyebrow mr-1 w-full sm:w-auto">Précision</span>
        {PRECISIONS.map((p) => {
          const on = filters.precisions.includes(p);
          return (
            <button
              key={p}
              type="button"
              aria-pressed={on}
              title={PRECISION_HELP[p]}
              className={`chip !py-1 !text-xs ${on ? 'chip-on' : 'chip-off'}`}
              onClick={() => setFilters({ precisions: toggle(filters.precisions, p) })}
            >
              {PRECISION_LABEL[p]}
            </button>
          );
        })}
        <label className="text-ink-2 ml-1 inline-flex cursor-pointer items-center gap-2 text-xs font-medium">
          <input
            type="checkbox"
            className="accent-ink size-4"
            checked={filters.chiffreesOnly}
            onChange={(e) => setFilters({ chiffreesOnly: e.target.checked })}
          />
          Chiffrées uniquement
        </label>
        {hasActiveFilters(filters) && (
          <button type="button" className="text-ink-3 hover:text-ink ml-auto text-xs underline" onClick={resetFilters}>
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
