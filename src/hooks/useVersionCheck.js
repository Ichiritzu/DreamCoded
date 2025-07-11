import { useEffect } from 'react';

const useVersionCheck = () => {
  useEffect(() => {
    fetch('/version.json', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const stored = localStorage.getItem('cachedVersion');
        if (!stored || stored !== data.version) {
          localStorage.setItem('cachedVersion', data.version);
          if (stored) {
            // 🔔 Trigger custom event to show toast in header
            window.dispatchEvent(new Event('dreamcoded-version-update'));
          }
        }
      })
      .catch(err => {
        console.warn('Version check failed:', err);
      });
  }, []);
};

export default useVersionCheck;
