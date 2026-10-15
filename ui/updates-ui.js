const desktop = window.adminisDesktop;
let state = {status:'loading', version:'…', method:'source', latestVersion:null, progress:0};
let includePrerelease = false;
try {includePrerelease = localStorage.getItem('administraight.preview-updates') === 'on';} catch {}
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));

function content() {
  const messages = {
    loading:'Loading update information…',
    source:'You’re running from source. Download and install a desktop build to use app updates.',
    idle:'Check for a newer version when you’re ready.',
    manual:state.message,
    checking:'Checking for updates…',
    current:'You’re up to date on the selected channel.',
    available:`Version ${state.latestVersion} is available.${state.method === 'manual' ? ' Download it, quit the app, and replace your installed copy. Your planner stays on this computer.' : ''}`,
    downloading:`Downloading update · ${Math.round(state.progress)}%`,
    downloaded:'The update is downloaded. Restart when you’re ready to install it.',
    installing:'Restarting to install the update…',
    error:state.message
  };
  const busy = ['loading','checking','downloading','downloaded','installing'].includes(state.status);
  return `<h3>Update app</h3><p>Installed version: <strong>${esc(state.version)}</strong></p>
    <p id="update-status" role="status" aria-live="polite">${esc(messages[state.status] || 'Check for updates.')}</p>
    ${state.status === 'downloading' ? `<progress max="100" value="${state.progress}" aria-label="Update download progress">${Math.round(state.progress)}%</progress>` : ''}
    <label><input id="preview-updates" type="checkbox" ${includePrerelease ? 'checked' : ''} ${busy ? 'disabled' : ''}> Include preview / test releases</label>
    <p class="subtitle">Preview releases let you try new features sooner. Updates are downloaded only when you choose. Your planner records and schedule times stay intact.</p>
    <div class="jot-actions">
      <button type="button" class="button" data-update-action="check" ${busy || state.method === 'source' || state.status === 'manual' ? 'disabled' : ''}>Check for updates</button>
      ${state.status === 'available' ? `<button type="button" class="button primary" data-update-action="${state.method === 'automatic' ? 'download' : 'releases'}">${state.method === 'automatic' ? 'Download update' : 'Download new version'}</button>` : ''}
      ${state.status === 'downloaded' ? '<button type="button" class="button primary" data-update-action="install">Restart to update</button>' : ''}
      <button type="button" class="button" data-update-action="releases">Downloads</button>
      <button type="button" class="button" data-update-action="test-builds">Test builds</button>
    </div><p class="subtitle">Unsigned Mac test builds are installed manually. Test builds opens GitHub Actions; sign in there to download a completed build.</p>`;
}

export const updatesPanel = () => `<div class="settings-section" id="app-updates">${content()}</div>`;
function sync(value) {
  state = value;
  const panel = document.getElementById('app-updates');
  if (panel) panel.innerHTML = content();
}
desktop.onUpdateStatus(sync);
desktop.updateStatus().then(sync).catch(() => sync({...state, status:'error', message:'Update information is unavailable. Restart the app and try again.'}));
desktop.onShowUpdates(() => {
  location.hash = 'settings';
  requestAnimationFrame(() => document.getElementById('app-updates')?.scrollIntoView({block:'center'}));
  desktop.checkUpdates(includePrerelease).then(sync).catch(showFailure);
});
document.addEventListener('change', event => {
  if (event.target.id !== 'preview-updates') return;
  includePrerelease = event.target.checked;
  try {localStorage.setItem('administraight.preview-updates', includePrerelease ? 'on' : 'off');} catch {}
  // Recheck before presenting an update from a different channel.
  desktop.checkUpdates(includePrerelease).then(sync).catch(showFailure);
});
function showFailure() {sync({...state, status:'error', message:'The update action could not finish. Try again.'});}
document.addEventListener('click', async event => {
  const action = event.target.closest('[data-update-action]')?.dataset.updateAction;
  if (!action) return;
  try {
    if (action === 'check') sync(await desktop.checkUpdates(includePrerelease));
    if (action === 'download') sync(await desktop.downloadUpdate());
    if (action === 'install') sync(await desktop.installUpdate());
    if (['releases','test-builds'].includes(action)) {
      const result = await desktop.openUpdateDownloads(action === 'test-builds');
      if (!result.ok) showFailure();
    }
  } catch {showFailure();}
});
