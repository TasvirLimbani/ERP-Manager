'use client'

import { useEffect, useState } from 'react'

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert('Please open in Chrome & wait few seconds')
      return
    }

    deferredPrompt.prompt()
    await deferredPrompt.userChoice
  }

  if (isInstalled) return null

 return (
  <button
    onClick={handleInstall}
    className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-md bg-black/40 text-white shadow-xl active:scale-95 transition"
  >
    <img
      src="/logo.png"
      alt="Install"
      className="w-8 h-8 object-contain"
    />

    <span className="text-sm font-medium">
      Install App
    </span>
  </button>
)
  
}