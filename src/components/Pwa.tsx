import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Icon } from './Icon';

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
/** iOS / iPadOS : pas d'invite d'installation, il faut passer par le menu Partager de Safari. */
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/** Bouton « Installer l'app » : invite native (Chrome, Edge, Android) ou mode d'emploi (iOS). */
export function InstallButton() {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed || (!deferred && !isIos())) return null;

  const install = async () => {
    if (!deferred) return setIosHelp((v) => !v);
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferred(null);
  };

  return (
    <div className="relative">
      <button type="button" onClick={install} className="btn btn-secondary !px-3 !py-1.5 !text-xs" aria-expanded={deferred ? undefined : iosHelp}>
        <Icon name="download" className="size-3.5" />
        <span>Installer</span>
      </button>
      <AnimatePresence>
        {iosHelp && (
          <motion.div
            role="dialog"
            aria-label="Installer l'application sur iPhone ou iPad"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="card absolute right-0 z-50 mt-2 w-72 p-4 text-sm"
          >
            <p className="text-ink font-medium">Installer sur iPhone ou iPad</p>
            <ol className="text-ink-2 mt-2 list-decimal space-y-1 pl-5">
              <li>Ouvrez cette page dans Safari.</li>
              <li>
                Touchez <strong>Partager</strong> <Icon name="share" className="inline size-3.5 align-[-2px]" />.
              </li>
              <li>
                Choisissez <strong>Sur l'écran d'accueil</strong>.
              </li>
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Notifications du service worker : app prête hors ligne, nouvelle version des données disponible. */
export function PwaToast() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Vérifie toutes les heures si une nouvelle version (données mises à jour) a été publiée.
      if (registration) setInterval(() => registration.update(), 60 * 60 * 1000);
    },
  });
  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };
  useEffect(() => {
    if (!offlineReady) return;
    const t = setTimeout(() => setOfflineReady(false), 5000);
    return () => clearTimeout(t);
  }, [offlineReady, setOfflineReady]);

  return (
    <AnimatePresence>
      {(offlineReady || needRefresh) && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="card no-print fixed right-4 bottom-4 left-4 z-50 flex items-center gap-3 p-4 text-sm sm:left-auto sm:max-w-sm"
        >
          <Icon name={needRefresh ? 'download' : 'check'} className="text-ink-2 size-5 shrink-0" />
          <p className="text-ink-2 flex-1">
            {needRefresh ? 'Une nouvelle version des données est disponible.' : "L'application est disponible hors ligne."}
          </p>
          {needRefresh && (
            <button type="button" className="btn btn-primary !py-1.5 !text-xs" onClick={() => updateServiceWorker(true)}>
              Mettre à jour
            </button>
          )}
          <button type="button" className="btn btn-ghost !p-1.5" onClick={close} aria-label="Fermer">
            <Icon name="close" className="size-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
