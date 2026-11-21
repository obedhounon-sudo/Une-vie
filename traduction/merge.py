#!/usr/bin/env python3
"""Fusionne les traductions dans index.html du jeu Une Vie.
Usage : python3 merge.py chemin/index.html dossier_des_resultats
Chaque fichier resultat_XX.json : {"texte français": {"en": "...", "es": "...", "pt": "..."}}
Vérifie : marqueurs {..} identiques, aucune valeur vide ; ignore (et signale) les entrées invalides."""
import sys,json,glob,re
html,folder=sys.argv[1],sys.argv[2]
mk=lambda t:sorted(re.findall(r'\{[^}]*\}',t))
new={'en':{},'es':{},'pt':{}};bad=[]
for f in sorted(glob.glob(folder+'/*.json')):
    for k,v in json.load(open(f,encoding='utf8')).items():
        if not isinstance(v,dict): bad.append((f,k));continue
        ok=all(isinstance(v.get(l),str) and v[l].strip() and mk(v[l])==mk(k) for l in new)
        if not ok: bad.append((f,k));continue
        for l in new: new[l][k]=v[l]
s=open(html,encoding='utf8').read()
for l in new:
    line='  Object.assign(%s, %s);\n'%(l.upper(),json.dumps(new[l],ensure_ascii=False))
    key='  Object.assign(%s, '%l.upper()
    i=s.index(key); j=s.index('\n',i)+1
    s=s[:j]+line+s[j:]
open(html,'w',encoding='utf8').write(s)
print('ajoutés:',len(new['en']),'invalides:',len(bad))
for b in bad[:20]: print(' -',b[0],b[1][:70])
