import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {createUpdateManager, installationMethod, releasesURL, testBuildsURL} = require('../desktop/updates.cjs');

function fixture(method = 'automatic') {
  const updater = new EventEmitter();
  const notifications = [], opened = [];
  let checks = 0, downloads = 0, installs = 0, confirmation = false;
  updater.checkForUpdates = async () => {checks++; updater.emit('update-available', {version:'0.2.0'}); return {};};
  updater.downloadUpdate = async () => {downloads++; updater.emit('download-progress', {percent:42.5}); updater.emit('update-downloaded');};
  updater.quitAndInstall = () => {installs++;};
  const manager = createUpdateManager({updater, version:'0.1.1', method, notify:state=>notifications.push(state), confirmInstall:async()=>confirmation, openExternal:async url=>opened.push(url)});
  return {manager, updater, notifications, opened, counts:()=>({checks, downloads, installs}), confirm:value=>confirmation=value};
}

test('updates download only on request and install only after confirmation', async () => {
  const f = fixture();
  assert.equal(f.updater.autoDownload, false);
  assert.equal(f.updater.autoInstallOnAppQuit, false);
  assert.equal(f.updater.allowDowngrade, false);
  await f.manager.download(); await f.manager.install();
  assert.deepEqual(f.counts(), {checks:0, downloads:0, installs:0});
  assert.equal((await f.manager.check(true)).status, 'available');
  assert.equal(f.updater.allowPrerelease, true);
  assert.equal(f.counts().downloads, 0);
  assert.equal((await f.manager.download()).status, 'downloaded');
  assert.ok(f.notifications.some(s=>s.status==='downloading' && s.progress===42.5));
  await f.manager.check(false); // Do not invalidate an already downloaded update.
  assert.equal(f.counts().checks, 1);
  await f.manager.install();
  assert.equal(f.counts().installs, 0);
  assert.equal(f.manager.snapshot().status, 'downloaded');
  f.confirm(true); await f.manager.install();
  assert.equal(f.counts().installs, 1);
});

test('failed checks and failed verification remain retryable without revealing error details', async () => {
  const f = fixture();
  f.updater.checkForUpdates = async () => {throw Error('secret diagnostic');};
  assert.equal((await f.manager.check()).status, 'error');
  assert.ok(!f.manager.snapshot().message.includes('secret'));
  f.updater.checkForUpdates = async () => {f.updater.emit('update-available',{version:'0.2.0'}); return {};};
  assert.equal((await f.manager.check()).status, 'available');
  f.updater.downloadUpdate = async () => {throw Object.assign(Error('checksum mismatch'), {code:'ERR_UPDATER_CHECKSUM_MISMATCH'});};
  assert.equal((await f.manager.download()).status, 'error');
  f.confirm(true); await f.manager.install();
  assert.equal(f.counts().installs, 0);
});

test('missing releases and current versions have distinct outcomes', async () => {
  const f = fixture();
  f.updater.checkForUpdates = async () => {throw Object.assign(Error(),{code:'ERR_UPDATER_LATEST_VERSION_NOT_FOUND'});};
  assert.match((await f.manager.check()).message, /No published update/);
  f.updater.checkForUpdates = async () => {f.updater.emit('update-not-available'); return {};};
  assert.equal((await f.manager.check()).status, 'current');
  assert.equal(f.manager.snapshot().latestVersion, null);
  f.updater.checkForUpdates = async () => null;
  assert.equal((await f.manager.check()).status, 'manual');
});

test('source and manual builds never download or install automatically', async () => {
  const source = fixture('source');
  assert.equal((await source.manager.check()).status, 'source');
  assert.equal(source.counts().checks, 0);
  const manual = fixture('manual');
  await manual.manager.check(); await manual.manager.download();
  manual.confirm(true); await manual.manager.install();
  assert.equal(manual.counts().downloads, 0); assert.equal(manual.counts().installs, 0);
  await manual.manager.openDownloads(); await manual.manager.openDownloads(true);
  assert.deepEqual(manual.opened, [releasesURL, testBuildsURL]);
  await assert.rejects(manual.manager.openDownloads('https://evil.example'), /Invalid/);
  await assert.rejects(manual.manager.check('preview'), /Invalid/);
});

test('concurrent checks and downloads do not duplicate work', async () => {
  const f = fixture(); let finish;
  f.updater.checkForUpdates = () => new Promise(resolve=>finish=()=>{f.updater.emit('update-available',{version:'0.2.0'});resolve({});});
  const checking = f.manager.check();
  assert.equal((await f.manager.check()).status, 'checking');
  finish(); await checking;
  f.updater.downloadUpdate = () => new Promise(resolve=>finish=()=>{f.updater.emit('update-downloaded');resolve();});
  const downloading = f.manager.download();
  assert.equal((await f.manager.download()).status, 'downloading');
  finish(); await downloading;
  assert.equal(f.manager.snapshot().status, 'downloaded');
});

test('Mac automatic installation requires a verified non-ad-hoc signature', () => {
  assert.equal(installationMethod({packaged:false, platform:'win32'}), 'source');
  assert.equal(installationMethod({packaged:true, platform:'win32'}), 'automatic');
  assert.equal(installationMethod({packaged:true, platform:'linux'}), 'manual');
  assert.equal(installationMethod({packaged:true, platform:'linux', appImage:'/app.AppImage'}), 'automatic');
  const mac = {packaged:true, platform:'darwin', appPath:'/Applications/AdminisStraight.app'};
  assert.equal(installationMethod({...mac,run:()=>({status:0,stderr:'Signature=adhoc'})}), 'manual');
  assert.equal(installationMethod({...mac,run:(_cmd,args)=>({status:args[0]==='--verify'?1:0,stderr:'Authority=Developer ID Application'})}), 'manual');
  assert.equal(installationMethod({...mac,run:()=>({status:0,stderr:'Authority=Developer ID Application'})}), 'automatic');
});
