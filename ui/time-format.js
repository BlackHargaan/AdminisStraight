const key = 'administraight.time-format.v1';
let preference = '24';
try { if (globalThis.localStorage?.getItem(key) === '12') preference = '12'; } catch {}

export const getTimeFormat = () => preference;

export function setTimeFormat(value) {
  if (!['12', '24'].includes(value)) return false;
  preference = value;
  try { globalThis.localStorage.setItem(key, value); return true; }
  catch { return false; }
}

// Format labels only; inputs, exports, and saved records retain HH:mm.
export function formatTime(value, format = preference) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return value;
  if (format === '24') return value;
  const [hour, minute] = value.split(':');
  return `${Number(hour) % 12 || 12}:${minute} ${Number(hour) < 12 ? 'AM' : 'PM'}`;
}

export const formatTimeRange = value => value.split('–').map(part => formatTime(part)).join('–');

export function formatClock(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: preference === '12', timeZoneName: 'short' });
}

globalThis.addEventListener?.('storage', event => {
  if (event.key !== key && event.key !== null) return;
  preference = event.newValue === '12' ? '12' : '24';
  globalThis.dispatchEvent(new Event('timeformatchange'));
});
