const BASE = 'http://localhost:3001';

export async function fetchProducts() {
  const res = await fetch(`${BASE}/products`);
  return res.json();
}

export async function fetchFirmware(variantId?: string, state?: string) {
  const params = new URLSearchParams();
  if (variantId) params.set('variantId', variantId);
  if (state) params.set('state', state);
  const res = await fetch(`${BASE}/firmware?${params}`);
  return res.json();
}

export async function uploadFirmware(variantId: string, file: File, version: string, uploadedBy: string) {
  const form = new FormData();
  form.append('file', file);
  form.append('version', version);
  form.append('uploadedBy', uploadedBy);
  const res = await fetch(`${BASE}/variants/${variantId}/firmware`, {
    method: 'POST',
    body: form,
  });
  return res.json();
}

export async function transitionState(id: string, state: string, actor: string) {
  const res = await fetch(`${BASE}/firmware/${id}/state`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state, actor }),
  });
  return res.json();
}

export async function fetchAudit(firmwareImageId: string) {
  const res = await fetch(`${BASE}/audit/firmware/${firmwareImageId}`);
  return res.json();
}

export function downloadUrl(id: string) {
  return `${BASE}/firmware/${id}/download?actor=dashboard-user`;
}
