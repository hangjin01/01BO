import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';

const dir = await mkdtemp(join(tmpdir(), 'o1bo-tests-'));
try {
  await symlink(new URL('../node_modules', import.meta.url).pathname, join(dir, 'node_modules'), 'dir');
  for (const name of ['apiService', 'locationService', 'geminiService', 'reportExport', 'tripValidation', 'nativeSession']) {
    const source = (await readFile(new URL(`../services/${name}.ts`, import.meta.url), 'utf8')).replaceAll('import.meta.env', '({})');
    const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText.replace("'./apiService'", "'./apiService.mjs'").replace("'./nativeSession'", "'./nativeSession.mjs'");
    await writeFile(join(dir, `${name}.mjs`), js);
  }
  const api = await import(pathToFileURL(join(dir, 'apiService.mjs')));
  const gps = await import(pathToFileURL(join(dir, 'locationService.mjs')));
  const ai = await import(pathToFileURL(join(dir, 'geminiService.mjs')));
  const docx = await import(pathToFileURL(join(dir, 'reportExport.mjs')));
  assert.deepEqual(api.validateCoordinates(0, 0), { latitude: 0, longitude: 0 });
  assert.throws(() => api.validateCoordinates(null, undefined));
  assert.throws(() => api.validateCoordinates(91, 181));
  assert.equal(gps.calculateDistance({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0 }), 0);
  assert.ok(Math.abs(gps.calculateDistance({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 1 }) - 111195) < 1);
  assert.ok(!api.sanitizeString('<img src=x onerror=alert(1)>').includes('<'));

  const validation = await import(pathToFileURL(join(dir, 'tripValidation.mjs')));
  assert.throws(() => validation.assertTripDates('2026-02-30', '2026-03-01'));
  assert.throws(() => validation.assertTripDates('2026-09-26', '2026-09-25'));
  const geocoded = [];
  const normalized = await validation.normalizeItinerary([
    { id: 'same', title: 'B', locationName: 'B', date: '2026-09-26', scheduledTime: '14:00', coords: { latitude: 35, longitude: 139 } },
    { id: 'same', title: 'A', locationName: 'A', address: 'Tokyo A', date: '2026-09-25', scheduledTime: '09:00', coords: { latitude: 999, longitude: 139 } }
  ], '2026-09-25', '2026-09-26', async address => { geocoded.push(address); return { latitude: 36, longitude: 140 }; });
  assert.equal(normalized[0].date, '2026-09-25');
  assert.equal(normalized[1].coords.latitude, 35);
  assert.equal(new Set(normalized.map(item => item.id)).size, 2);
  assert.deepEqual(geocoded, ['Tokyo A']);
  await assert.rejects(() => validation.normalizeItinerary([{ locationName: 'A', date: '2026-10-01', scheduledTime: '09:00' }], '2026-09-25', '2026-09-26', async () => ({})));
  await assert.rejects(() => validation.normalizeItinerary([{ locationName: 'A', scheduledTime: '25:00' }], '2026-09-25', '2026-09-26', async () => ({})));

  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ success: true, data: { ID: 'trip1', USER_ID: 'u1', TITLE: 'updated', ITINERARY_JSON: '[]' } }));
  };
  const saved = await api.updateTrip({ id: 'trip1', itinerary: [], title: 'updated' });
  assert.equal(request.options.method, 'PUT');
  assert.equal(saved.title, 'updated');
  assert.equal(request.options.credentials, 'include');
  globalThis.fetch = async () => new Response(null, { status: 204 });
  await api.deleteTrip('trip1');
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false, message: 'save rejected' }));
  await assert.rejects(() => api.updateTrip({ id: 'trip1', itinerary: [] }), /save rejected/);
  globalThis.fetch = async () => new Response(JSON.stringify({ success: true }));
  await assert.rejects(() => api.createTrip({ userId: 'u1', title: 'trip', itineraryJson: [] }), /서버에서 저장된/);
  await assert.rejects(() => api.createCheckIn({ userId: 'u1', tripId: 'trip1', lat: 35, lng: 139 }), /서버에서 저장된/);
  await assert.rejects(() => api.createExpense({ userId: 'u1', tripId: 'trip1', amount: 100 }), /서버에서 저장된/);
  globalThis.fetch = async () => new Response(JSON.stringify({ message: 'Login required' }), { status: 401 });
  await assert.rejects(() => api.fetchSessionUser(), error => error instanceof api.ApiError && error.status === 401);
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ success: true, data: [{ ID: 'db-trip', USER_ID: 'u1', TITLE: 'Oracle trip', ITINERARY_JSON: '[]' }] }));
  };
  const loadedTrips = await api.fetchTrips();
  assert.equal(request.url, '/api/trips');
  assert.equal(request.options.credentials, 'include');
  assert.equal(loadedTrips[0].id, 'db-trip');
  assert.equal(loadedTrips[0].title, 'Oracle trip');
  globalThis.fetch = async () => new Response('unavailable', { status: 503 });
  await assert.rejects(() => ai.analyzeReceiptImage('fake-image'));
  await assert.rejects(() => ai.generateTripFromChat('내일 서울 출장'));
  await assert.rejects(() => ai.generateTripReport([], [], 'ko'));
  globalThis.fetch = async () => new Response('[]');
  await assert.rejects(() => gps.geocodeAddress('unknown address'));
  const file = join(dir, 'report.docx');
  await writeFile(file, docx.createReportDocx('한글 日本語 <script> & 내용\n둘째 줄'));
  execFileSync('python3', ['-c', `import zipfile,sys,xml.etree.ElementTree as E
with zipfile.ZipFile(sys.argv[1]) as z:
 assert z.testzip() is None
 for name in z.namelist(): E.fromstring(z.read(name))
 root=E.fromstring(z.read('word/document.xml'))
 text=''.join(root.itertext())
 assert '한글 日本語 <script> & 내용' in text
`, file]);
  console.log('PASS: coordinates, distance, dates, multi-day itinerary/coordinates/IDs, HTML escaping, update/delete contracts, failure propagation, AI failure without sample data, geocoding failure, DOCX ZIP/XML/Unicode');
} finally { await rm(dir, { recursive: true, force: true }); }
