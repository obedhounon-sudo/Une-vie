#!/usr/bin/env python3
import os
d=os.path.dirname(os.path.abspath(__file__))
r=lambda f:open(os.path.join(d,f),encoding='utf8').read()
html=r('shell.html').replace('/*CSS*/',r('style.css')).replace('/*JS*/','\n'.join(r(f) for f in ('data.js','engine.js','ui.js')))
open(os.path.join(d,'..','index.html'),'w',encoding='utf8').write(html)
print(len(html))
