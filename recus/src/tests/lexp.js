const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.cwd()+'/t.html');await p.click('[data-act=pick-country][data-id=TG]');
const code=(await p.evaluate(()=>{const b="ABC123";return "EC-"+b+"-"+fnvTest}).catch(()=>null));
// derive valid code by brute force via UI: use codes file
const fs=require('fs');const codes=fs.readFileSync('/tmp/keys/codes-licence.txt','utf8').match(/EC-[A-Z0-9]{6}-[A-Z0-9]{3}/g);
console.log(codes.length);
await p.click('.tabs [data-act=tab][data-v=settings]');
await p.fill('#lic',codes[0]);await p.click('form[data-form=license] button[type=submit]');
console.log(await p.evaluate(()=>[__t.licOK(),__t.licDays(),__t.db.licDate]));
console.log((await p.textContent('form[data-form=license]')).slice(0,200));
// expire
await p.evaluate(()=>{__t.db.licDate="2025-01-01"});
console.log(await p.evaluate(()=>[__t.licOK(),__t.licExpired()]));
await p.click('.tabs [data-act=tab][data-v=home]');await p.click('.tabs [data-act=tab][data-v=settings]');
console.log((await p.textContent('form[data-form=license]')).slice(0,330));
await p.fill('#lic',codes[0]);await p.click('form[data-form=license] button[type=submit]');
console.log(await p.evaluate(()=>[__t.licOK(),__t.db.licDate]), await p.textContent('.toast').catch(()=>''));
await p.fill('#lic',codes[1]);await p.click('form[data-form=license] button[type=submit]');
console.log(await p.evaluate(()=>[__t.licOK(),__t.licDays(),__t.db.licUsed]));
console.log(errs);await b.close()})();
