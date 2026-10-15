import { useState, type RefObject } from 'react';
import { Icon } from './Icon';

/** Partage (copie de l'URL), export PNG (html-to-image) et impression/PDF (dialogue natif). */
export function ExportMenu({ target, filename }: { target: RefObject<HTMLElement | null>; filename: string }) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copiez ce lien :', window.location.href);
    }
  };

  const png = async () => {
    if (!target.current) return;
    setBusy(true);
    try {
      const { toPng } = await import('html-to-image');
      const bg = getComputedStyle(document.body).backgroundColor;
      const url = await toPng(target.current, { backgroundColor: bg, pixelRatio: 2, cacheBust: true });
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn btn-secondary !py-1.5 !text-xs" onClick={share} aria-live="polite">
        <Icon name={copied ? 'check' : 'share'} className="size-3.5" />
        {copied ? 'Lien copié' : 'Partager'}
      </button>
      <button type="button" className="btn btn-secondary !py-1.5 !text-xs" onClick={png} disabled={busy}>
        <Icon name="image" className="size-3.5" />
        {busy ? 'Export…' : 'Image'}
      </button>
      <button type="button" className="btn btn-secondary !py-1.5 !text-xs" onClick={() => window.print()}>
        <Icon name="printer" className="size-3.5" /> PDF
      </button>
    </div>
  );
}
