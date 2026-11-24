/* ECHO-9 : moteur de boucle temporelle (tour par tour) + niveaux + solveur */
(function(root){
var PULSE=6, DIRS=[[0,0],[0,-1],[0,1],[-1,0],[1,0]];
function parse(lv){
 var rows=lv.g,h=rows.length,w=rows[0].length,cells=[],plates=[],start,exit,y,x,ch;
 for(y=0;y<h;y++){cells[y]=[];for(x=0;x<w;x++){ch=rows[y][x];cells[y][x]=ch;
  if(ch==="S"){start=[x,y];cells[y][x]=".";}
  if(ch==="E")exit=[x,y];
  if("abcpq".indexOf(ch)>=0)plates.push({x:x,y:y,ch:ch});}}
 return {w:w,h:h,cells:cells,plates:plates,start:start,exit:exit,guards:lv.guards||[],T:lv.T,max:lv.max,lv:lv};
}
function isDoor(c){return "ABCPQ".indexOf(c)>=0;}
function gpos(g,t){var p=g.p,n=p.length;if(n===1)return p[0];var per=2*(n-1),k=((t%per)+per)%per;return p[k<n?k:per-k];}
function at(a,t){return a[Math.min(t,a.length-1)];}
function eq(a,b){return a[0]===b[0]&&a[1]===b[1];}
/* porte ouverte pendant le tick t (t = indice de la position à produire) */
function doorOpen(L,ghosts,pp,dch,t){
 var pc=dch.toLowerCase(),pulse=(pc==="p"||pc==="q"),i,j,u,pl,e;
 for(i=0;i<L.plates.length;i++){pl=L.plates[i];if(pl.ch!==pc)continue;var c=[pl.x,pl.y];
  if(!pulse){
   if(t>=1){if(pp.length>t-1&&eq(pp[t-1],c))return true;for(j=0;j<ghosts.length;j++)if(eq(at(ghosts[j],t-1),c))return true;}
  }else{
   for(u=Math.max(1,t-PULSE);u<=t-1;u++){
    if(u<pp.length&&eq(pp[u],c)&&!eq(pp[u-1],c))return true;
    for(j=0;j<ghosts.length;j++){e=ghosts[j];if(u<=e.length-1&&eq(e[u],c)&&!eq(e[u-1],c))return true;}
   }
  }
 }
 return false;
}
/* un tick : pp = positions jusqu'ici ; retourne {pos,st} st: ok|dead|win */
function move(L,ghosts,pp,dir){
 var t=pp.length,cur=pp[t-1],d=DIRS[dir],nx=cur[0]+d[0],ny=cur[1]+d[1],np=cur,ch,i,g,gt,gp;
 if(nx>=0&&ny>=0&&nx<L.w&&ny<L.h){ch=L.cells[ny][nx];
  if(ch!=="#"&&(!isDoor(ch)||doorOpen(L,ghosts,pp,ch,t)))np=[nx,ny];}
 ch=L.cells[np[1]][np[0]];
 if(isDoor(ch)&&!doorOpen(L,ghosts,pp,ch,t))return {pos:np,st:"dead",why:"crush"};
 for(i=0;i<L.guards.length;i++){g=L.guards[i];gt=gpos(g,t);gp=gpos(g,t-1);
  if(eq(np,gt)||(eq(np,gp)&&eq(cur,gt)))return {pos:np,st:"dead",why:"drone"};}
 if(L.exit&&eq(np,L.exit))return {pos:np,st:"win"};
 return {pos:np,st:"ok"};
}
/* ---------- solveur ---------- */
function ageKey(L,pp,t){ // dernières arrivées du joueur sur plaques impulsion
 var k="",ty,u,found;
 ["p","q"].forEach(function(c){found=9;for(u=t;u>=Math.max(1,t-PULSE);u--){var ok=false;for(var i=0;i<L.plates.length;i++){var pl=L.plates[i];if(pl.ch===c&&eq(pp[u],[pl.x,pl.y])&&!eq(pp[u-1],[pl.x,pl.y]))ok=true;}if(ok){found=t-u;break;}}k+=found+",";});
 return k;
}
function bfs(L,ghosts,startPP,goal){ // goal(pp,st) -> bool ; retourne pp
 var q=[startPP],seen={},head=0,T=L.T;
 seen[startPP.length+"|"+startPP[startPP.length-1]+"|"+ageKey(L,startPP,startPP.length-1)]=1;
 while(head<q.length){var pp=q[head++];if(pp.length-1>=T)continue;
  for(var dir=0;dir<5;dir++){var r=move(L,ghosts,pp,dir);if(r.st==="dead")continue;
   var np=pp.concat([r.pos]);
   if(goal(np,r.st))return np;
   if(r.st==="win")continue;
   var k=np.length+"|"+r.pos+"|"+ageKey(L,np,np.length-1);if(seen[k])continue;seen[k]=1;q.push(np);}}
 return null;
}
function candidates(L,ghosts){
 var out=[],seen={},P=L.plates,i,j,d,w;
 function add(pp){if(!pp)return;var k=pp.join(";");if(seen[k])return;seen[k]=1;out.push(pp);}
 function waitFrom(pp,n){var r=pp.slice();for(var i=0;i<n;i++){var m=move(L,ghosts,r,0);if(m.st==="dead")return null;r.push(m.pos);}return r;}
 function toPlate(pp,pl){return bfs(L,ghosts,pp,function(a,st){return eq(a[a.length-1],[pl.x,pl.y]);});}
 for(i=0;i<P.length;i++){
  for(d=0;d<=10;d+=2){var s=waitFrom([L.start],d);if(!s)continue;var a=toPlate(s,P[i]);if(!a)continue;add(a);
   for(j=0;j<P.length;j++){if(j===i)continue;
    [0,2,4,6,9].forEach(function(dw){var s2=waitFrom(a,dw);if(!s2)return;add(toPlate(s2,P[j]));});}}
 }
 return out;
}
function solve(L,maxGhosts,budget){
 var t0=Date.now();budget=budget||20000;
 function final(ghosts){return bfs(L,ghosts,[L.start],function(a,st){return st==="win";});}
 function rec(ghosts,depth){
  if(Date.now()-t0>budget)return null;
  var f=final(ghosts);if(f)return {ghosts:ghosts,final:f};
  if(depth===0)return null;
  var c=candidates(L,ghosts);
  for(var i=0;i<c.length;i++){var r=rec(ghosts.concat([c[i]]),depth-1);if(r)return r;}
  return null;
 }
 for(var k=0;k<=maxGhosts;k++){var r=rec([],k);if(r)return r;}
 return null;
}
function pulseLeft(L,ghosts,pp,dch,t){
 var pc=dch.toLowerCase(),i,j,u,e,best=0;
 for(i=0;i<L.plates.length;i++){var pl=L.plates[i];if(pl.ch!==pc)continue;var c=[pl.x,pl.y];
  for(u=Math.max(1,t-PULSE);u<=t-1;u++){var hit=false;
   if(u<pp.length&&eq(pp[u],c)&&!eq(pp[u-1],c))hit=true;
   for(j=0;j<ghosts.length;j++){e=ghosts[j];if(u<=e.length-1&&eq(e[u],c)&&!eq(e[u-1],c))hit=true;}
   if(hit)best=Math.max(best,u+PULSE-t+1);}}
 return best;
}
root.ECHO={pulseLeft:pulseLeft,PULSE:PULSE,DIRS:DIRS,parse:parse,move:move,gpos:gpos,doorOpen:doorOpen,solve:solve,isDoor:isDoor,at:at,eq:eq};
})(typeof module!=="undefined"?module.exports:this);
if(typeof module!=="undefined"){module.exports=module.exports.ECHO?module.exports.ECHO:module.exports;}
