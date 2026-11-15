const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const lang of ['fr','en']){
const p=await b.newPage({viewport:{width:412,height:800}});p.setDefaultTimeout(3000);
const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.addInitScript(l=>{try{localStorage.setItem('recus_lang',l)}catch(e){}},lang);
await p.goto('file:///home/claude/recus/index.html');await p.click('[data-act=pick-country][data-id=TG]');await p.waitForTimeout(300);
await p.click('.main [data-act=open-class] >> nth=0');await p.click('[data-act=open-student] >> nth=3');
await p.selectOption('#pm','Carte bancaire').catch(()=>{});await p.fill('#pa','25000');await p.click('form[data-form=pay] button[type=submit], button:has-text("Valider"), button:has-text("Confirm and")');await p.waitForTimeout(500);
await p.screenshot({path:'reg-'+lang+'.png'});
// PDF
const pdf=await p.evaluate(async()=>{try{const b=await Promise.resolve(document.querySelector('[data-act=pdf]')?1:0);return b}catch(e){return String(e)}});
console.log(lang,'pdfbtn',pdf,errs);await p.close()}
await b.close()})();
