import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const source=await readFile(new URL('../services/nfcVerification.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {verifyNfcVisit}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const fix={latitude:35,longitude:139,accuracy:10,timestamp:Date.now()};
async function trial(cancelAt,failAt){
 let active=true,log=[];
 const step=async(name,value)=>{log.push(name);if(name===cancelAt)active=false;if(name===failAt)throw Error(name);return value;};
 const result=verifyNfcVisit({read:()=>step('read','tag'),locate:()=>step('locate',fix),validate:p=>{assert.equal(p,fix);if(failAt==='validate')throw Error('validate');},challenge:()=>step('challenge','nonce'),save:(tag,p,nonce)=>{assert.equal(tag,'tag');assert.equal(p,fix);assert.equal(nonce,'nonce');return step('save','saved');},current:()=>active,stage:()=>{}});
 if(failAt)await assert.rejects(result,new RegExp(failAt));else assert.equal(await result,cancelAt?undefined:'saved');
 return log;
}
assert.deepEqual(await trial(),['read','locate','challenge','save']);
for(const point of ['read','locate','challenge']){
 const log=await trial(point);assert.ok(!log.includes('save'),`Cancellation during ${point} must prevent server write`);
}
for(const point of ['read','locate','validate','challenge'])assert.ok(!(await trial(undefined,point)).includes('save'));
console.log('PASS NFC sequence, fresh challenge after scan/GPS, cancellation at each async boundary, failures never save.');
