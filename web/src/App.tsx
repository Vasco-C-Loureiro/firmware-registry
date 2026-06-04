import { useState, useEffect, useCallback } from 'react';
import {
  fetchProducts,
  fetchFirmware,
  uploadFirmware,
  transitionState,
  fetchAudit,
  downloadUrl,
} from './api';

const STATES = ['DRAFT', 'TESTING', 'RELEASED', 'DEPRECATED'];

const NEXT_STATES: Record<string, string[]> = {
  DRAFT: ['TESTING'],
  TESTING: ['RELEASED', 'DRAFT'],
  RELEASED: ['DEPRECATED'],
  DEPRECATED: [],
};

function StateBadge({ state }: { state: string }) {
  const colours: Record<string, string> = {
    DRAFT: '#666',
    TESTING: '#b8860b',
    RELEASED: '#2a7a2a',
    DEPRECATED: '#8b0000',
  };
  return (
    <span style={{
      background: colours[state] ?? '#333',
      color: '#fff',
      borderRadius: 4,
      padding: '2px 8px',
      fontSize: 12,
      fontWeight: 600,
    }}>
      {state}
    </span>
  );
}

export default function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [firmware, setFirmware] = useState<any[]>([]);
  const [filterVariant, setFilterVariant] = useState('');
  const [filterState, setFilterState] = useState('');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [audit, setAudit] = useState<any[]>([]);
  const [uploadVariant, setUploadVariant] = useState('');
  const [uploadVersion, setUploadVersion] = useState('');
  const [uploadBy, setUploadBy] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadMsg, setUploadMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const allVariants = products.flatMap((p: any) =>
    p.variants.map((v: any) => ({ ...v, productName: p.name }))
  );

  const loadFirmware = useCallback(async () => {
    const data = await fetchFirmware(filterVariant || undefined, filterState || undefined);
    setFirmware(data);
  }, [filterVariant, filterState]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  useEffect(() => {
    loadFirmware();
  }, [loadFirmware]);

  async function handleUpload() {
    if (!uploadVariant || !uploadVersion || !uploadBy || !uploadFile) {
      setUploadMsg('All fields required.');
      return;
    }
    setLoading(true);
    const result = await uploadFirmware(uploadVariant, uploadFile, uploadVersion, uploadBy);
    setLoading(false);
    if (result.id) {
      setUploadMsg(`Uploaded successfully. ID: ${result.id}`);
      setUploadVersion('');
      setUploadFile(null);
      loadFirmware();
    } else {
      setUploadMsg(`Error: ${JSON.stringify(result.message ?? result)}`);
    }
  }

  async function handleTransition(image: any, toState: string) {
    const actor = prompt(`Your name (for audit log):`);
    if (!actor) return;
    await transitionState(image.id, toState, actor);
    loadFirmware();
    if (selectedImage?.id === image.id) {
      const updated = await fetchAudit(image.id);
      setAudit(updated);
    }
  }

  async function handleSelectImage(image: any) {
    setSelectedImage(image);
    const events = await fetchAudit(image.id);
    setAudit(events);
  }

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <h1 style={{ borderBottom: '2px solid #ccc', paddingBottom: 8 }}>
        PCL Firmware Registry
      </h1>
      <p style={{ color: '#666', marginTop: 0 }}>
        Firmware image management — upload, track release state, verify integrity, audit history.
      </p>

      {/* Upload */}
      <section style={{ marginBottom: 32 }}>
        <h2>Upload Firmware</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label>Variant<br />
              <select value={uploadVariant} onChange={e => setUploadVariant(e.target.value)}
                style={{ padding: 6, minWidth: 180 }}>
                <option value=''>— select —</option>
                {allVariants.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.productName} / {v.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label>Version<br />
              <input value={uploadVersion} onChange={e => setUploadVersion(e.target.value)}
                placeholder='e.g. 2.3.0' style={{ padding: 6 }} />
            </label>
          </div>
          <div>
            <label>Your name<br />
              <input value={uploadBy} onChange={e => setUploadBy(e.target.value)}
                placeholder='e.g. michael.crookes' style={{ padding: 6 }} />
            </label>
          </div>
          <div>
            <label>File<br />
              <input type='file' onChange={e => setUploadFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <button onClick={handleUpload} disabled={loading}
            style={{ padding: '6px 16px', cursor: 'pointer' }}>
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        {uploadMsg && <p style={{ color: uploadMsg.startsWith('Error') ? 'red' : 'green' }}>{uploadMsg}</p>}
      </section>

      {/* Filters */}
      <section style={{ marginBottom: 16 }}>
        <h2 style={{ marginBottom: 8 }}>Firmware Images</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <select value={filterVariant} onChange={e => setFilterVariant(e.target.value)}
            style={{ padding: 6, minWidth: 180 }}>
            <option value=''>All variants</option>
            {allVariants.map((v: any) => (
              <option key={v.id} value={v.id}>{v.productName} / {v.name}</option>
            ))}
          </select>
          <select value={filterState} onChange={e => setFilterState(e.target.value)}
            style={{ padding: 6 }}>
            <option value=''>All states</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={loadFirmware} style={{ padding: '6px 12px', cursor: 'pointer' }}>
            Refresh
          </button>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
              <th style={{ padding: '8px 6px' }}>Variant</th>
              <th style={{ padding: '8px 6px' }}>Version</th>
              <th style={{ padding: '8px 6px' }}>State</th>
              <th style={{ padding: '8px 6px' }}>Size</th>
              <th style={{ padding: '8px 6px' }}>Checksum</th>
              <th style={{ padding: '8px 6px' }}>Uploaded</th>
              <th style={{ padding: '8px 6px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {firmware.map((fw: any, i: number) => (
              <tr key={fw.id}
                onClick={() => handleSelectImage(fw)}
                style={{
                  background: selectedImage?.id === fw.id ? '#e8f0fe' : i % 2 === 0 ? '#fff' : '#fafafa',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                }}>
                <td style={{ padding: '7px 6px' }}>
                  {fw.variant?.product?.name} / {fw.variant?.name}
                </td>
                <td style={{ padding: '7px 6px' }}>{fw.version}</td>
                <td style={{ padding: '7px 6px' }}><StateBadge state={fw.state} /></td>
                <td style={{ padding: '7px 6px' }}>{(fw.fileSizeBytes / 1024).toFixed(1)} KB</td>
                <td style={{ padding: '7px 6px', fontFamily: 'monospace', fontSize: 11 }}>
                  {fw.checksumSha256.slice(0, 12)}…
                </td>
                <td style={{ padding: '7px 6px' }}>
                  {new Date(fw.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '7px 6px' }} onClick={e => e.stopPropagation()}>
                  <a href={downloadUrl(fw.id)} style={{ marginRight: 8 }}>⬇ Download</a>
                  {NEXT_STATES[fw.state]?.map(s => (
                    <button key={s} onClick={() => handleTransition(fw, s)}
                      style={{ marginRight: 4, padding: '2px 8px', fontSize: 12, cursor: 'pointer' }}>
                      → {s}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Audit history */}
      {selectedImage && (
        <section>
          <h2>
            History — {selectedImage.variant?.product?.name} / {selectedImage.variant?.name} v{selectedImage.version}
          </h2>
          {audit.length === 0
            ? <p style={{ color: '#888' }}>No audit events for this image.</p>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px 6px' }}>Timestamp</th>
                    <th style={{ padding: '8px 6px' }}>Action</th>
                    <th style={{ padding: '8px 6px' }}>Actor</th>
                    <th style={{ padding: '8px 6px' }}>From</th>
                    <th style={{ padding: '8px 6px' }}>To</th>
                    <th style={{ padding: '8px 6px' }}>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.map((e: any, i: number) => (
                    <tr key={e.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '7px 6px' }}>{new Date(e.timestamp).toLocaleString()}</td>
                      <td style={{ padding: '7px 6px', fontWeight: 600 }}>{e.action}</td>
                      <td style={{ padding: '7px 6px' }}>{e.actor}</td>
                      <td style={{ padding: '7px 6px' }}>{e.fromState ?? '—'}</td>
                      <td style={{ padding: '7px 6px' }}>{e.toState ?? '—'}</td>
                      <td style={{ padding: '7px 6px', fontSize: 11 }}>{e.detail ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </section>
      )}
    </div>
  );
}
