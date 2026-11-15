const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[],calls=[];let paid=false;
const ctx=await b.newContext({viewport:{width:412,height:800}});
await ctx.route(/supabase\.co/,async route=>{const req=route.request(),u=new URL(req.url()),path=u.pathname;const j=(o,s=200)=>route.fulfill({status:s,contentType:'application/json',body:JSON.stringify(o)});
 calls.push(req.method()+' '+path+' auth='+(req.headers()['authorization']||'').slice(0,12));
 if(path==='/functions/v1/create-payment'){return j({link:'https://checkout.flutterwave.com/v3/hosted/pay/abc',tx_ref:'rs_x'})}
 if(path==='/auth/v1/signup')return j({access_token:'tok',refresh_token:'rt',expires_in:3600,user:{id:'uid-1',email:'dir@ecole.tg'}});
 if(path==='/rest/v1/licences')return j(paid?[{valid_until:'2027-11-14'}]:[]);
 if(path==='/rest/v1/ecole_saves'){if(req.method()==='GET')return j([]);return route.fulfill({status:201,body:''})}
 return j({},404)});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.addInitScript(()=>{window.__opened=[];window.open=u=>{window.__opened.push(u)}});
await p.goto('file:///home/claude/recus/index.html');await p.click('[data-act=pick-country][data-id=TG]');await p.waitForTimeout(300);
await p.click('[data-act=clear-demo]');await p.fill('#sn','Ecole Test');await p.click('form[data-form=school] button[type=submit]');
await p.click('[data-act=auth-sw]');await p.fill('#aem','dir@ecole.tg');await p.fill('#apw','secret12');await p.click('form[data-form=auth] button[type=submit]');
await p.waitForSelector('[data-act=logout]');await p.click('.tabs [data-act=tab][data-v=home]');
// import 301 students via text
const names=Array.from({length:301},(_,i)=>'Eleve '+i+' ; 9000'+(i%10)).join('\n');
await p.fill('#cn','6A',{timeout:3000});await p.fill('#cf','50000');await p.click('form[data-form=add-class] button[type=submit]');
await p.click('.main [data-act=open-class] >> nth=0');
await p.fill('#names',names);await p.click('form[data-form=add-students] button[type=submit]');
await p.waitForTimeout(500);
console.log('modal open:',await p.locator('.modal').count(), (await p.textContent('.modal')).slice(0,120).replace(/\s+/g,' '));
await p.click('[data-act=pay-card]');await p.waitForTimeout(500);
console.log('opened:',await p.evaluate(()=>window.__opened));
// not paid yet
await p.click('[data-act=check-pay]');await p.waitForTimeout(500);
console.log('toast1:',(await p.textContent('.toast').catch(()=>'')));
paid=true;
await p.click('[data-act=check-pay]');await p.waitForTimeout(700);
console.log('modal after pay:',await p.locator('.modal').count());
console.log((await p.locator('.toast').allTextContents()).join(' | '));
await p.fill('#names',names.split('\n').slice(0,3).join('\n').replace(/Eleve/g,'Nouveau'));await p.click('form[data-form=add-students] button[type=submit]');await p.waitForTimeout(400);
console.log('students after:',(await p.$$('[data-act=open-student]')).length);
console.log(calls.filter(c=>/licences|create-payment/.test(c)).join('\n'));console.log(errs);await b.close()})().catch(e=>{console.log('ERR',e.message);process.exit(0)});
