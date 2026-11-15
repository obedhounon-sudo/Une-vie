const ts=require('typescript'),fs=require('fs');
const D='/home/claude/une-vie/recus/serveur/functions/';
const load=f=>{const src=fs.readFileSync(D+f+'/index.ts','utf8').replace(/^import .*$/m,'');return ts.transpileModule(src,{compilerOptions:{target:'ES2022',module:'ESNext'}}).outputText};
const env={FEDAPAY_WEBHOOK_KEY:'k1',FEDAPAY_SECRET_KEY:'sk',FEDAPAY_ENV:'sandbox',SUPABASE_URL:'u',SUPABASE_SERVICE_ROLE_KEY:'s',SUPABASE_ANON_KEY:'a'};
const tables={licences:[],licence_commandes:[]};
let handler;globalThis.Deno={env:{get:k=>env[k]},serve:h=>{handler=h}};
globalThis.createClient=()=>({auth:{getUser:async()=>({data:{user:{id:'11111111-2222-3333-4444-555555555555',email:'e@x.tg'}},error:null})},
 from:(name)=>{let f={};const q={select(){return q},eq(c,v){f[c]=v;return q},order(){return q},limit(){return q},
 async maybeSingle(){const m=tables[name].filter(r=>Object.entries(f).every(([k,v])=>r[k]===v));f={};m.sort((a,b)=>(b.valid_until||'').localeCompare(a.valid_until||''));return{data:m[0]||null}},
 async insert(r){if(name==='licences'&&tables.licences.some(x=>x.tx_ref===r.tx_ref))return{error:{code:'23505'}};tables[name].push(r);return{error:null}}};return q}});
const calls=[];let fedaTx={id:77,status:'pending',amount:50000};
globalThis.fetch=async(u,o)=>{calls.push((o&&o.method||'GET')+' '+u);
 if(u.endsWith('/transactions')&&o.method==='POST'){const b=JSON.parse(o.body);fedaTx={id:77,status:'pending',amount:b.amount};return{ok:true,json:async()=>({'v1/transaction':{id:77,amount:b.amount}})}}
 if(u.endsWith('/token'))return{ok:true,json:async()=>({token:'t',url:'https://pay.fedapay.com/t'})};
 return{ok:true,json:async()=>({'v1/transaction':fedaTx})}};
(async()=>{
 eval(load('create-payment'));const create=handler;
 const R=await create({method:'POST',headers:{get:()=>'Bearer x'},json:async()=>({currency:'EUR'})});console.log('create',R.status,await R.json(),tables.licence_commandes);
 eval(load('fedapay-webhook'));const hook=handler;
 const call=async(q,ev)=>(await hook({url:'https://x/f?k='+q,json:async()=>ev})).status;
 console.log('bad key',await call('zz',{entity:{id:77}}));
 console.log('pending',await call('k1',{name:'transaction.approved',entity:{id:77}}),tables.licences.length);
 fedaTx.status='approved';
 console.log('approved',await call('k1',{name:'transaction.approved',entity:{id:77}}),tables.licences.length,tables.licences[0]&&tables.licences[0].valid_until);
 console.log('dup',await call('k1',{entity:{id:77}}),tables.licences.length);
 console.log('unknown id',await call('k1',{entity:{id:99}}),tables.licences.length);
 console.log('junk',await call('k1',{foo:1}),tables.licences.length);
 tables.licence_commandes.push({fedapay_id:78,user_id:'11111111-2222-3333-4444-555555555555',amount:50000});fedaTx={id:78,status:'approved',amount:1000};
 console.log('underpaid',await call('k1',{data:{id:78}}),tables.licences.length);
 fedaTx={id:78,status:'approved',amount:50000};
 console.log('2nd extends',await call('k1',{data:{id:78}}),tables.licences.length,tables.licences[1]&&tables.licences[1].valid_until);
})();
