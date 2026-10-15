const {spawnSync} = require('node:child_process');

const releasesURL = 'https://github.com/BlackHargaan/AdminisStraight/releases';
const testBuildsURL = 'https://github.com/BlackHargaan/AdminisStraight/actions/workflows/build-desktop.yml';

function installationMethod({packaged, platform, appPath, appImage, run = spawnSync}) {
  if (!packaged) return 'source';
  if (platform === 'darwin') {
    try {
      // Squirrel.Mac requires a signed application; ad-hoc test builds are manual.
      const options = {encoding:'utf8', timeout:5000};
      const details = run('codesign', ['-dv', '--verbose=4', appPath], options);
      const verified = run('codesign', ['--verify', '--deep', '--strict', appPath], options);
      return details.status === 0 && verified.status === 0 && String(details.stderr).includes('Authority=') ? 'automatic' : 'manual';
    } catch {
      return 'manual';
    }
  }
  return platform === 'win32' || (platform === 'linux' && appImage) ? 'automatic' : 'manual';
}

function createUpdateManager({updater, version, method, notify = () => {}, confirmInstall, openExternal}) {
  let state = {status:method === 'source' ? 'source' : 'idle', version, method, includePrerelease:false, latestVersion:null, progress:0, message:''};
  let busy = false;
  const snapshot = () => ({...state});
  const set = value => {state = {...state, ...value}; notify(snapshot()); return snapshot();};
  const fail = error => set({status:'error', message:['ERR_UPDATER_LATEST_VERSION_NOT_FOUND','ERR_UPDATER_CHANNEL_FILE_NOT_FOUND','ERR_UPDATER_NO_PUBLISHED_VERSIONS'].includes(error?.code)
    ? 'No published update was found for this channel. Open Downloads or Test builds, or try again after a release is published.'
    : 'Could not reach or verify the update. Check your connection and try again, or open Downloads. GitHub Releases must be accessible to this app.'});
  updater.autoDownload = false;
  updater.autoInstallOnAppQuit = false;
  updater.allowDowngrade = false;
  updater.on('error', fail);
  updater.on('update-available', info => set({status:'available', latestVersion:info.version, message:''}));
  updater.on('update-not-available', () => set({status:'current', latestVersion:null, message:''}));
  updater.on('download-progress', info => set({status:'downloading', progress:Math.max(0, Math.min(100, Number(info.percent) || 0))}));
  updater.on('update-downloaded', () => set({status:'downloaded', progress:100, message:''}));
  return {
    snapshot,
    async check(includePrerelease = false) {
      if (typeof includePrerelease !== 'boolean') throw Error('Invalid update channel.');
      if (busy || ['downloading','downloaded','installing'].includes(state.status)) return snapshot();
      if (method === 'source') return snapshot();
      busy = true;
      set({status:'checking', includePrerelease, latestVersion:null, progress:0, message:''});
      updater.allowPrerelease = includePrerelease;
      try {await updater.checkForUpdates(); if (state.status === 'checking') set({status:'manual', message:'This package uses manual updates. Open Downloads to get a newer version.'});} catch (error) {fail(error);} finally {busy = false;}
      return snapshot();
    },
    async download() {
      if (busy || state.status !== 'available' || method !== 'automatic') return snapshot();
      busy = true;
      set({status:'downloading', progress:0, message:''});
      try {await updater.downloadUpdate();} catch (error) {fail(error);} finally {busy = false;}
      return snapshot();
    },
    async install() {
      if (busy || state.status !== 'downloaded' || method !== 'automatic') return snapshot();
      busy = true;
      try {
        if (await confirmInstall()) {set({status:'installing'}); updater.quitAndInstall(false, true);}
      } catch {fail();} finally {busy = false;}
      return snapshot();
    },
    async openDownloads(testBuilds = false) {
      if (typeof testBuilds !== 'boolean') throw Error('Invalid download destination.');
      try {await openExternal(testBuilds ? testBuildsURL : releasesURL); return {ok:true};}
      catch {return {ok:false, error:'Could not open your browser. Try again.'};}
    }
  };
}

module.exports = {createUpdateManager, installationMethod, releasesURL, testBuildsURL};
