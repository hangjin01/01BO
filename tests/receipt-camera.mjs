import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const dir = await mkdtemp(join(tmpdir(), 'o1bo-camera-'));
const originalFetch = globalThis.fetch;
try {
  await writeFile(join(dir, 'camera.mjs'), 'export const Camera = {};');
  await writeFile(join(dir, 'core.mjs'), 'export const Capacitor = {convertFileSrc: uri => "local:" + uri};');
  const source = (await readFile(new URL('../services/receiptCamera.ts', import.meta.url), 'utf8'))
    .replace('@capacitor/camera', './camera.mjs').replace('@capacitor/core', './core.mjs');
  await writeFile(join(dir, 'receipt.mjs'), ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText);
  const { Camera } = await import(pathToFileURL(join(dir, 'camera.mjs')));
  const { pickReceiptPhoto } = await import(pathToFileURL(join(dir, 'receipt.mjs')));
  let fetched = [];
  globalThis.fetch = async path => { fetched.push(path); return new Response(new Blob(['receipt'], {type:'image/jpeg'})); };
  Camera.takePhoto = async options => {
    assert.equal(options.saveToGallery, false);
    assert.equal(options.includeMetadata, false);
    return {webPath:'local:camera'};
  };
  const file = await pickReceiptPhoto('camera');
  assert.equal(file.type, 'image/jpeg');
  assert.equal(await file.text(), 'receipt');
  assert.deepEqual(fetched, ['local:camera']);
  Camera.chooseFromGallery = async options => {
    assert.equal(options.allowMultipleSelection, false);
    return {results:[{uri:'gallery'}]};
  };
  await pickReceiptPhoto('gallery');
  assert.equal(fetched.at(-1), 'local:gallery');
  Camera.chooseFromGallery = async () => ({results:[]});
  assert.equal(await pickReceiptPhoto('gallery'), null);
  Camera.takePhoto = async () => { throw new Error('cancelled'); };
  await assert.rejects(pickReceiptPhoto('camera'), /cancelled/);
  Camera.takePhoto = async () => ({});
  await assert.rejects(pickReceiptPhoto('camera'), /열지 못/);
  Camera.takePhoto = async () => ({webPath:'local:empty'});
  globalThis.fetch = async () => new Response(new Blob([]));
  await assert.rejects(pickReceiptPhoto('camera'), /비어/);
  globalThis.fetch = async () => new Response('', {status:404});
  await assert.rejects(pickReceiptPhoto('camera'), /읽지 못/);
  console.log('PASS: camera/gallery routing, private capture options, file bytes/MIME, cancellation, empty selection, missing file, empty file, read failure. Native calls mocked; device testing remains.');
} finally {
  globalThis.fetch = originalFetch;
  await rm(dir, {recursive:true, force:true});
}
