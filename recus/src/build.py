s=open('index.v2.html',encoding='utf8').read()
head=s[:s.index('<div class="app"')]
def rep(a,b):
    global head
    assert head.count(a)==1,a
    head=head.replace(a,b)
rep('--ok:#1b7a4a;','--late-bg:#fbe3e1;--ok:#1b7a4a;')
rep('--ok:#5fcf93; --ok-bg:#16301f; --warn:#f0a56a; --warn-bg:#3a2515; --bad:#ff8a80; color-scheme:dark}}','--ok:#5fcf93; --ok-bg:#16301f; --warn:#f0a56a; --warn-bg:#3a2515; --bad:#ff8a80; --late-bg:#3d1c19; color-scheme:dark}}')
rep('--ok:#5fcf93; --ok-bg:#16301f; --warn:#f0a56a; --warn-bg:#3a2515; --bad:#ff8a80; color-scheme:dark}\n*{','--ok:#5fcf93; --ok-bg:#16301f; --warn:#f0a56a; --warn-bg:#3a2515; --bad:#ff8a80; --late-bg:#3d1c19; color-scheme:dark}\n*{')
extra='''.pill.late{background:var(--late-bg);color:var(--bad)}
.lock{max-width:380px;margin:12vh auto 0}
.lock h1{font-size:1.4rem}
.receipt.fmt-a4{max-width:none}
.receipt.fmt-ticket{max-width:290px;margin:0 auto;padding:12px;font-size:.78rem}
.receipt.fmt-ticket .head .logo{max-height:36px;max-width:56px}
.receipt.fmt-ticket .head h2{font-size:1rem}
.receipt.fmt-ticket .amount b{font-size:1rem}
.receipt.fmt-ticket .foot{flex-direction:column;text-align:center}
.receipt.void{position:relative;overflow:hidden}
.receipt.void::after{content:"ANNULÉ";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:700 3.6rem var(--f-display);color:rgba(179,38,30,.26);transform:rotate(-18deg);pointer-events:none}
.voidbar{background:#fbe3e1;color:#b3261e;font-weight:700;font-size:.85rem;padding:8px 10px;border-radius:4px;margin-bottom:12px}
.back{display:block;text-align:left}
.side{display:none}
.sidebtn{display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;text-align:left;border:0;background:none;padding:10px 12px;border-radius:8px;cursor:pointer;font-weight:600;color:var(--fg);min-height:42px}
.sidebtn:hover{background:var(--soft)}
.sidebtn[aria-current="true"]{background:var(--accent);color:var(--accent-ink)}
.sidebtn[aria-current="true"] .muted{color:inherit}
.side h3{margin:18px 12px 6px;font-size:.8rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
@media (min-width:960px){
  .app{max-width:1180px}
  .split{display:grid;grid-template-columns:240px minmax(0,1fr);gap:24px;align-items:start}
  .side{display:block;position:sticky;top:12px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:8px;max-height:calc(100vh - 24px);overflow:auto}
  .tabs{display:none}
  .stats{grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}
  .form{grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
}
.signature{margin-top:28px;text-align:center;color:var(--muted);font-size:.85rem}
.signature a{color:var(--accent);font-weight:700;text-decoration:none}
.receipt .credit{margin-top:12px;text-align:center;font-size:.72rem;color:#7a8794}
.receipt.report h3{margin:14px 0 6px;font-size:1rem}
.receipt.report table{width:100%;border-collapse:collapse;font-size:.88rem}
.receipt.report td{padding:5px 4px;border-bottom:1px solid var(--paper-line);overflow-wrap:anywhere}
.receipt.report td.r{text-align:right}
'''
rep('</style>',extra+'</style>')
qr=open('qr.js',encoding='utf8').read();app=open('app.js',encoding='utf8').read()
out=head+'<div class="app" id="app"></div>\n<div id="layer"></div>\n\n<script>\n'+qr+'\n'+app+'</script>\n'
open('index.html','w',encoding='utf8').write(out)
print(len(out))
