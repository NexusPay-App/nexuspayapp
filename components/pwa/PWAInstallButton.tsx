"use client";

import { useState } from 'react';
import { Download } from 'lucide-react';
import { usePWA } from '@/context/PWAContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function PWAInstallButton() {
  const { isInstalled, installationChecked, showInstallPrompt, setShowInstallPrompt, triggerInstall } = usePWA();
  const [isPrompting, setIsPrompting] = useState(false);

  if (!installationChecked || isInstalled) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const install = async () => {
    if (isPrompting) return;
    setIsPrompting(true);
    try { await triggerInstall(); } finally { setIsPrompting(false); }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Install NexusPay"
        title="Install NexusPay"
        onClick={install}
        disabled={isPrompting}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0795B0] disabled:opacity-50"
      >
        <Download className="h-6 w-6" aria-hidden="true" />
      </button>
      <Dialog open={showInstallPrompt} onOpenChange={setShowInstallPrompt}>
        <DialogContent className="sm:max-w-md bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle>Install NexusPay</DialogTitle>
            <DialogDescription>Keep your wallet one tap away on your home screen.</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-gray-700">
            {isIOS
              ? 'Open NexusPay in Safari, tap Share, then Add to Home Screen.'
              : 'Open your browser menu and look for Install app or Add to Home Screen. If neither is available, try Chrome or Edge.'}
          </p>
          <Button onClick={() => setShowInstallPrompt(false)}>Got it</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
