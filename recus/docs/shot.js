const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [n,w,h] of [['couverture-1024x500',1024,500],['couverture-1280x720',1280,720]]){
const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:2});
let html=require('fs').readFileSync('c.html','utf8').replace('<style>',`<style>:root{--w:${w}px;--h:${h}px;--s:${h<600?0.8:1}}`);
require('fs').writeFileSync('c_'+n+'.html',html);await p.goto('file:///tmp/cover/c_'+n+'.html');await p.waitForTimeout(500);
await p.screenshot({path:'/tmp/cover/'+n+'.png'});await p.close()}
await b.close()})();
