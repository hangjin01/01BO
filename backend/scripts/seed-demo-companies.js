// Additive, repeatable fixtures requested by the user. Never changes existing business records.
const crypto=require('node:crypto'),db=require('../db'),{hash}=require('../lib/validation');
(async()=>{
 const output=[];
 await db.transaction(async q=>{
  for(const [code,name]of [['DEMO_A','테스트 A회사'],['DEMO_B','테스트 B회사']]){
   const existing=(await q('SELECT COMPANY_NAME FROM COMPANIES WHERE COMPANY_CODE=:code',{code})).rows[0];
   if(existing&&existing.COMPANY_NAME!==name)throw new Error('Company code already used');
   if(!existing)await q("INSERT INTO COMPANIES(COMPANY_CODE,COMPANY_NAME,STATUS) VALUES(:code,:name,'active')",{code,name});
   const users=[];
   for(const [index,title,role]of [[0,'사장','admin'],[1,'부장','manager'],[2,'과장','employee'],[3,'대리','employee']]){
    const id=code+'_'+['PRESIDENT','DIRECTOR','MANAGER','ASSOCIATE'][index];
    if(!(await q('SELECT UID_VAL FROM USERS WHERE UID_VAL=:id',{id})).rows[0])await q('INSERT INTO USERS(UID_VAL,EMAIL,NAME,ROLE,COMPANY_CODE,TEAM_CODE) VALUES(:id,:email,:name,:role,:company,:team)',{id,email:id.toLowerCase()+'@example.invalid',name:name+' '+title,role,company:code,team:code+'_TEAM'});
    users.push({uid:id,title});
    if(index){
     const trip=code+'_TRIP_'+index;
     if(!(await q('SELECT ID FROM TRIPS WHERE ID=:id',{id:trip})).rows[0])await q('INSERT INTO TRIPS(ID,USER_ID,TITLE,STATUS,START_DATE,END_DATE,DESTINATION,ITINERARY_JSON,PURPOSE,COMPANY_CODE,TEAM_CODE,IS_SHARED_WITH_TEAM) VALUES(:id,:userId,:title,:status,:startDate,:endDate,:destination,:items,:purpose,:company,:team,1)',{id:trip,userId:id,title:'[테스트] '+title+' '+['','도쿄 고객 미팅','오사카 현장 점검','후쿠오카 협력사 방문'][index],status:['','ongoing','upcoming','completed'][index],startDate:['','2026-09-27','2026-09-29','2026-09-24'][index],endDate:['','2026-09-28','2026-09-30','2026-09-25'][index],destination:['','Tokyo, Japan','Osaka, Japan','Fukuoka, Japan'][index],items:'[]',purpose:'권한 및 출장 현황 확인용 테스트 일정',company:code,team:code+'_TEAM'});
    }
   }
   const invite=crypto.randomBytes(32).toString('base64url'),expiresAt=Date.now()+86400000;
   await q('INSERT INTO COMPANY_INVITES(TOKEN_HASH,COMPANY_CODE,EXPIRES_AT) VALUES(:hash,:company,:expires)',{hash:hash(invite),company:code,expires:expiresAt});
   output.push({companyCode:code,name,users,invite,expiresAt});
  }
 });
 console.log(JSON.stringify(output));await(await db.initializePool()).close(0);
})().catch(error=>{console.error(error.message);process.exit(1)});
