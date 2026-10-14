const appearance = window.AdminAppearance;
const palettes = [
  ['forest', 'Forest', 'Grounded & green'],
  ['ocean', 'Ocean', 'Clear & blue'],
  ['plum', 'Plum', 'Soft & expressive'],
  ['terracotta', 'Terracotta', 'Warm & earthy'],
  ['slate', 'Slate', 'Quiet & neutral']
];
const trigger = document.createElement('button');
trigger.className = 'button appearance-trigger';
trigger.type = 'button';
trigger.setAttribute('aria-haspopup', 'dialog');
trigger.setAttribute('aria-controls', 'appearance-dialog');
trigger.innerHTML = '<span aria-hidden="true">◐</span> Appearance';
document.querySelector('.topbar').append(trigger);

const dialog = document.createElement('dialog');
dialog.id = 'appearance-dialog';
dialog.className = 'appearance-dialog';
dialog.setAttribute('aria-labelledby', 'appearance-title');
dialog.innerHTML = `
  <div class="appearance-content">
    <div class="dialog-heading">
      <div><span class="eyebrow">MAKE YOURSELF AT HOME</span><h2 id="appearance-title">A planner that feels like you.</h2></div>
      <button type="button" class="icon-button" data-close-appearance aria-label="Close appearance settings">×</button>
    </div>
    <fieldset class="appearance-fieldset">
      <legend>Display mode</legend>
      <div class="mode-options">
        ${[['light','☀','Light'],['dark','☾','Dark'],['system','◐','Match device']].map(([value,icon,label]) => `
          <label class="mode-option"><input type="radio" name="appearance-mode" value="${value}"><span class="mode-symbol" aria-hidden="true">${icon}</span><span>${label}</span></label>
        `).join('')}
      </div>
    </fieldset>
    <fieldset class="appearance-fieldset">
      <legend>Color palette</legend>
      <p class="appearance-hint">A new feel, with the same familiar planner.</p>
      <div class="palette-options">
        ${palettes.map(([value,name,description]) => `
          <label class="palette-option" data-swatch="${value}">
            <input type="radio" name="appearance-palette" value="${value}">
            <span class="palette-swatches" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="palette-label"><strong>${name}</strong><small>${description}</small></span>
            <span class="palette-check" aria-hidden="true">✓</span>
          </label>
        `).join('')}
      </div>
    </fieldset>
    <div class="appearance-footer"><p id="appearance-status" role="status"></p><button type="button" class="button primary" data-close-appearance>Done</button></div>
  </div>`;
document.body.append(dialog);

function syncControls() {
  const value = appearance.get();
  dialog.querySelectorAll('[name="appearance-mode"]').forEach(input => input.checked = input.value === value.mode);
  dialog.querySelectorAll('[name="appearance-palette"]').forEach(input => input.checked = input.value === value.palette);
  document.getElementById('appearance-status').textContent = value.persisted
    ? `Saved on this browser${value.mode === 'system' ? ` · Device is using ${value.resolved} mode` : ''}.`
    : 'Applied for now. Browser storage is unavailable.';
}
trigger.addEventListener('click', () => { syncControls(); dialog.showModal(); });
dialog.querySelectorAll('[data-close-appearance]').forEach(button => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('change', event => {
  if (event.target.name === 'appearance-mode') appearance.set({ mode: event.target.value });
  if (event.target.name === 'appearance-palette') appearance.set({ palette: event.target.value });
});
window.addEventListener('appearancechange', syncControls);
syncControls();
