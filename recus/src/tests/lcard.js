const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file:///home/claude/recus/index.html');await p.click('[data-act=pick-country][data-id=TG]');
await p.click('.main [data-act=open-class] >> nth=0');await p.click('[data-act=open-student] >> nth=3');
console.log(await p.$$eval('#pm option',o=>o.map(x=>x.textContent)));
await p.selectOption('#pm','Carte bancaire');await p.fill('#pa','5000');await p.click('button:has-text("Valider")');
console.log((await p.textContent('.receipt')).includes('Carte bancaire'),errs);await b.close()})();
