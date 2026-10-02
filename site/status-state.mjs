export const SERVICE_NAMES = { web: 'TrunkFlow web app', cloud: 'Cloud connection' };
export const MAX_STATUS_AGE_MS = 20 * 60_000;
export function publicStatusState(value, now = Date.now()) {
  const checked = typeof value?.checked_at === 'string' ? Date.parse(value.checked_at) : NaN;
  const stale = value?.version !== 1 || !Number.isFinite(checked) || checked > now + 60_000 || now - checked > MAX_STATUS_AGE_MS;
  return Object.entries(SERVICE_NAMES).map(([id, name]) => {
    const found = Array.isArray(value?.services) ? value.services.filter(item => item?.id === id) : [];
    const entry = found[0];
    const measured = typeof entry?.checked_at === 'string' ? Date.parse(entry.checked_at) : NaN;
    const success = typeof entry?.last_success_at === 'string' ? Date.parse(entry.last_success_at) : NaN;
    const fresh = !stale && found.length === 1 && Number.isFinite(measured) && measured <= now + 60_000 && now - measured <= MAX_STATUS_AGE_MS;
    const state = fresh && ['operational', 'unavailable'].includes(entry?.state) ? entry.state : 'unknown';
    return { id, name, state, checked_at: fresh ? new Date(measured).toISOString() : null,
      last_success_at: Number.isFinite(success) && success <= now + 60_000 ? new Date(success).toISOString() : null };
  });
}
