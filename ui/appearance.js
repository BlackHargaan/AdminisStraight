// Load before styles so a saved dark preference is applied before first paint.
(() => {
  const key = 'administraight.appearance.v1';
  const modes = ['light', 'dark', 'system'];
  const palettes = ['forest', 'ocean', 'plum', 'terracotta', 'slate'];
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const normalize = value => ({
    mode: modes.includes(value?.mode) ? value.mode : 'system',
    palette: palettes.includes(value?.palette) ? value.palette : 'forest'
  });
  let preference;
  let persisted = true;
  try { preference = normalize(JSON.parse(localStorage.getItem(key))); }
  catch { preference = normalize(null); }

  function apply() {
    const resolved = preference.mode === 'system' ? (media.matches ? 'dark' : 'light') : preference.mode;
    document.documentElement.dataset.mode = resolved;
    document.documentElement.dataset.palette = preference.palette;
    document.documentElement.style.colorScheme = resolved;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#171b20' : '#f6f8f6');
    window.dispatchEvent(new CustomEvent('appearancechange', { detail: { ...preference, resolved, persisted } }));
  }

  window.AdminAppearance = Object.freeze({
    get: () => ({ ...preference, resolved: document.documentElement.dataset.mode, persisted }),
    set(value) {
      preference = normalize({ ...preference, ...value });
      try { localStorage.setItem(key, JSON.stringify(preference)); persisted = true; }
      catch { persisted = false; }
      apply();
    }
  });
  media.addEventListener('change', () => { if (preference.mode === 'system') apply(); });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    try { preference = normalize(JSON.parse(event.newValue)); persisted = true; apply(); }
    catch { /* Ignore malformed preferences from another tab. */ }
  });
  apply();
})();
