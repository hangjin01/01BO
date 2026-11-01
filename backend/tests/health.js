const assert=require('node:assert/strict');
const db=require('../db');
const original=db.executeQuery;
let calls=0;
db.executeQuery=async()=>{calls++;throw new Error('Simulated database outage');};
const server=require('../server').createApp().listen(0,'127.0.0.1',async()=>{
 try {
  const base='http://127.0.0.1:'+server.address().port;
  const health=await fetch(base+'/health');
  assert.equal(health.status,200);
  assert.deepEqual(await health.json(),{success:true,message:'OK'});
  assert.equal(calls,0,'Liveness must not query the database');
  const ready=await fetch(base+'/api/health');
  assert.equal(ready.status,503);
  assert.equal(calls,1);
  console.log('PASS: unauthenticated /health is 200 without DB queries; /api/health still reports DB failure as 503.');
 } catch(error) {console.error(error);process.exitCode=1;}
 finally {db.executeQuery=original;server.close();}
});
