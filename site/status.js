import { publicStatusState } from './status-state.mjs';
let snapshot;
const labels = { operational: 'Available', unavailable: 'Service unavailable', unknown: 'Status unavailable' };
function render() {
  const rows = publicStatusState(snapshot);
  const host = document.querySelector('#services');
  host.replaceChildren(...rows.map(row => {
    const card = document.createElement('section'); card.className = `service ${row.state}`;
    const title = document.createElement('h2'); title.textContent = row.name;
    const status = document.createElement('strong'); status.textContent = labels[row.state];
    const time = document.createElement('p');
    time.textContent = row.checked_at ? `Last checked ${new Date(row.checked_at).toLocaleString()}.`
      : `No recent verification is available.${row.last_success_at ? ` Last successful check: ${new Date(row.last_success_at).toLocaleString()}.` : ''}`;
    card.append(title, status, time); return card;
  }));
  document.querySelector('#overall').textContent = rows.some(row => row.state === 'unknown') ? 'We cannot currently confirm all service states.'
    : rows.some(row => row.state === 'unavailable') ? 'Some services are unavailable.' : 'Public services responded to the latest checks.';
}
async function refresh() {
  try {
    const response = await fetch(`./status.json?t=${Math.floor(Date.now() / 60000)}`, { cache: 'no-store', credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('status unavailable');
    const text = await response.text(); if (text.length > 16000) throw new Error('status unavailable');
    snapshot = JSON.parse(text);
  } catch { snapshot = undefined; }
  render();
}
render(); refresh();
setInterval(() => { render(); refresh(); }, 60000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh(); });
