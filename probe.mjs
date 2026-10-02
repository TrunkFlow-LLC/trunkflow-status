import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export async function checkPublicServices(previous, request = fetch, now = Date.now()) {
  const checked_at = new Date(now).toISOString();
  const services = await Promise.all([
    ['web', 'https://app.trunkflowtech.com/'], ['cloud', 'https://app.trunkflowtech.com/api/readiness'],
  ].map(async ([id, url]) => {
    let ok = false;
    try {
      const response = await request(url, { credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(10000) });
      if (response.status !== 200) throw new Error('unavailable');
      const reader = response.body?.getReader(); if (!reader) throw new Error('unavailable');
      let bytes = 0; const chunks = [];
      try { while (true) { const next = await reader.read(); if (next.done) break; bytes += next.value.length; if (bytes > 65536) throw new Error('unavailable'); chunks.push(next.value); } }
      finally { await reader.cancel().catch(() => {}); }
      const body = Buffer.concat(chunks).toString('utf8');
      if (id === 'web') ok = /<div\s+id="root"\s*>/.test(body);
      else { const data = JSON.parse(body); ok = data.ready === true && Array.isArray(data.contract_versions) && data.contract_versions.includes(2); }
    } catch { /* Response text and internal errors must never enter a public artifact. */ }
    const prior = previous?.services?.find?.(service => service.id === id)?.last_success_at;
    const validPrior = typeof prior === 'string' && Number.isFinite(Date.parse(prior)) && Date.parse(prior) <= now;
    return { id, state: ok ? 'operational' : 'unavailable', checked_at, last_success_at: ok ? checked_at : validPrior ? new Date(prior).toISOString() : null };
  }));
  return { version: 1, checked_at, services };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  let previous; try { previous = JSON.parse(await readFile('site/status.json', 'utf8')); } catch { /* First run. */ }
  await writeFile('site/status.json', JSON.stringify(await checkPublicServices(previous), null, 2));
}
