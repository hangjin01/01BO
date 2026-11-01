import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../services/routeService.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { fetchRoadRoute } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
const realFetch = globalThis.fetch, realNow = Date.now;
let now = 10000, calls = 0;
const points = [{latitude:35.68,longitude:139.76},{latitude:35.66,longitude:139.75}];
try {
  Date.now = () => now;
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.match(url, /139.76,35.68;139.75,35.66/);
    assert.equal(options.credentials, 'omit');
    return Response.json({code:'Ok', routes:[{distance:2400,duration:600,geometry:{coordinates:[[139.76,35.68],[139.75,35.66]]}}]});
  };
  const route = await fetchRoadRoute(points);
  assert.deepEqual(route.coordinates, [[35.68,139.76],[35.66,139.75]]);
  assert.equal(await fetchRoadRoute(points), route);
  assert.equal(calls, 1, 'Repeat preview uses cache');
  await assert.rejects(fetchRoadRoute([points[1],points[0]]), /RETRY_LATER/);
  await assert.rejects(fetchRoadRoute([{latitude:NaN,longitude:0},points[0]]), /INVALID_POINTS/);
  await assert.rejects(fetchRoadRoute(Array(26).fill(points[0])), /INVALID_POINTS/);
  now += 1200;
  globalThis.fetch = async () => Response.json({code:'NoRoute',routes:[]});
  await assert.rejects(fetchRoadRoute([...points].reverse()), /NO_ROUTE/);
  now += 1200;
  globalThis.fetch = async () => new Response('', {status:503});
  await assert.rejects(fetchRoadRoute([...points].reverse()), /ROUTE_UNAVAILABLE/);
  console.log('Road route validation, coordinate order, cache, rate limit and failures passed.');
} finally { globalThis.fetch = realFetch; Date.now = realNow; }
