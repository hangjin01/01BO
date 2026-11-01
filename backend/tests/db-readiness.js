const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../db'),'utf8');
function setup({startupFailures=0,stale=false,writeFails=false}={}) {
 const state={pools:0,drops:0,writes:0,probes:0};
 const driver={OUT_FORMAT_OBJECT:1,CLOB:2,createPool:async()=>{
  const generation=++state.pools;let issued=0;
  return {close:async()=>{},getConnection:async()=>{const number=++issued;return {
   execute:async sql=>{if(sql.includes('WHERE 1=0')){state.probes++;if(generation<=startupFailures||(stale&&number===2))throw Object.assign(new Error('not open'),{errorNum:1109});return {rows:[]};}
    state.writes++;if(writeFails)throw Object.assign(new Error('write failed'),{errorNum:1109});return {rowsAffected:1};},
   close:async options=>{if(options?.drop)state.drops++;},commit:async()=>{},rollback:async()=>{}
  };}};
 }};
 const context={require:()=>driver,module:{exports:{}},process:{env:{DB_PASSWORD:'test'}},setTimeout:fn=>{fn();}};
 vm.runInNewContext(source,context);return {db:context.module.exports,state};
}
(async()=>{
 let x=setup({startupFailures:1});await x.db.initializePool();assert.equal(x.state.pools,2);assert.equal(x.state.drops,1);
 x=setup({stale:true});await x.db.executeQuery('INSERT');assert.equal(x.state.drops,1);assert.equal(x.state.writes,1);
 x=setup({writeFails:true});await assert.rejects(x.db.executeQuery('INSERT'));assert.equal(x.state.writes,1);
 x=setup({writeFails:true});let callbacks=0;await assert.rejects(x.db.transaction(async q=>{callbacks++;await q('INSERT');}));assert.equal(callbacks,1);assert.equal(x.state.writes,1);
 x=setup({startupFailures:50});await assert.rejects(x.db.initializePool());assert.equal(x.state.pools,30);
 console.log('PASS: startup readiness, bounded retries, stale connection dropped, writes and transactions never replayed');
})().catch(e=>{console.error(e);process.exit(1)});
