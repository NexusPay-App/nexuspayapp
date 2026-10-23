"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const INSTALL_STORAGE_KEY = 'nexuspay-pwa-installed';

interface PWAContextType {
  isInstalled: boolean;
  installationChecked: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  showInstallPrompt: boolean;
  showUpdatePrompt: boolean;
  setShowInstallPrompt: (show: boolean) => void;
  setShowUpdatePrompt: (show: boolean) => void;
  triggerInstall: () => Promise<void>;
  triggerUpdate: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};

interface PWAProviderProps {
  children: ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [installationChecked, setInstallationChecked] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)');
    const isStandalone = () => standalone.matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const rememberInstallation = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setInstallPrompt(null);
      try { localStorage.setItem(INSTALL_STORAGE_KEY, 'true'); } catch { /* Storage may be blocked. */ }
    };
    const checkInstallation = () => {
      if (isStandalone()) {
        rememberInstallation();
      } else {
        try { setIsInstalled(localStorage.getItem(INSTALL_STORAGE_KEY) === 'true'); } catch { /* Use browser events instead. */ }
      }
      setInstallationChecked(true);
    };
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    // Keep the native prompt for an explicit click, never open it on page load.
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (isStandalone()) return;
      // A fresh install offer also lets a user reinstall after uninstalling.
      try { localStorage.removeItem(INSTALL_STORAGE_KEY); } catch { /* Storage may be blocked. */ }
      setIsInstalled(false);
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === INSTALL_STORAGE_KEY || event.key === null) checkInstallation();
    };

    // Listen for service worker updates
    const handleServiceWorkerUpdate = async () => {
      if ('serviceWorker' in navigator) {
        const registration = process.env.NODE_ENV === 'production'
          ? await navigator.serviceWorker.register('/sw.js')
          : await navigator.serviceWorker.getRegistration();
        
        if (registration) {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setIsUpdateAvailable(true);
                  setShowUpdatePrompt(true);
                }
              });
            }
          });
        }
      }
    };

    // Initialize
    checkInstallation();
    updateOnlineStatus();
    handleServiceWorkerUpdate().catch(() => { /* App remains usable without offline support. */ });

    // Event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', rememberInstallation);
    window.addEventListener('storage', handleStorage);
    standalone.addEventListener('change', checkInstallation);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', rememberInstallation);
      window.removeEventListener('storage', handleStorage);
      standalone.removeEventListener('change', checkInstallation);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const triggerInstall = async () => {
    if (isInstalled) return;
    if (!installPrompt) {
      setShowInstallPrompt(true);
      return;
    }
    const prompt = installPrompt;
    setInstallPrompt(null); // Native prompts are single-use.
    try {
      await prompt.prompt();
      await prompt.userChoice;
      // Only appinstalled / standalone confirms a completed installation.
      setShowInstallPrompt(false);
    } catch {
      setShowInstallPrompt(true);
    }
  };

  const triggerUpdate = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
      }
    }
  };

  const value: PWAContextType = {
    isInstalled,
    installationChecked,
    isOnline,
    isUpdateAvailable,
    installPrompt,
    showInstallPrompt,
    showUpdatePrompt,
    setShowInstallPrompt,
    setShowUpdatePrompt,
    triggerInstall,
    triggerUpdate,
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
};
