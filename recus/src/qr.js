/* Générateur de QR code (octets, niveaux L/M, versions 1 à 10). */
var QR=(function(){
var ECC={L:{fmt:1,per:[7,10,15,20,26,18,20,24,30,18],blk:[1,1,1,1,1,2,2,2,2,4]},M:{fmt:0,per:[10,16,26,18,24,16,18,22,22,26],blk:[1,1,1,2,2,4,4,4,5,5]}};
function raw(v){var r=(16*v+128)*v+64;if(v>=2){var n=Math.floor(v/7)+2;r-=(25*n-10)*n-55;if(v>=7)r-=36}return r}
function mul(x,y){var z=0;for(var i=7;i>=0;i--){z=(z<<1)^((z>>7)*0x11D);z^=((y>>i)&1)*x}return z}
function divisor(d){var r=[];for(var i=0;i<d;i++)r.push(0);r[d-1]=1;var root=1;for(i=0;i<d;i++){for(var j=0;j<d;j++){r[j]=mul(r[j],root);if(j+1<d)r[j]^=r[j+1]}root=mul(root,2)}return r}
function remainder(data,div){var r=div.map(function(){return 0});data.forEach(function(b){var f=b^r.shift();r.push(0);div.forEach(function(c,i){r[i]^=mul(c,f)})});return r}
function utf8(s){var o=[],e=unescape(encodeURIComponent(s));for(var i=0;i<e.length;i++)o.push(e.charCodeAt(i));return o}
function bit(x,i){return((x>>>i)&1)!==0}
function make(text){
  var bytes=utf8(text),lv=null,ver=0,e;
  outer:for(var L=["M","L"],k=0;k<2;k++){e=ECC[L[k]];for(var v=1;v<=10;v++){var cap=Math.floor(raw(v)/8)-e.per[v-1]*e.blk[v-1];if(4+(v<10?8:16)+bytes.length*8<=cap*8){lv=L[k];ver=v;break outer}}}
  if(!ver)throw new Error("Texte trop long pour le QR");
  e=ECC[lv];var size=ver*4+17,nb=e.blk[ver-1],eccLen=e.per[ver-1],rawCw=Math.floor(raw(ver)/8),dataCw=rawCw-eccLen*nb;
  var bits=[];function put(v,n){for(var i=n-1;i>=0;i--)bits.push((v>>>i)&1)}
  put(4,4);put(bytes.length,ver<10?8:16);bytes.forEach(function(b){put(b,8)});
  var capBits=dataCw*8;put(0,Math.min(4,capBits-bits.length));while(bits.length%8)bits.push(0);
  for(var pad=0xEC;bits.length<capBits;pad^=0xEC^0x11)put(pad,8);
  var data=[];for(var i=0;i<bits.length;i+=8){var b=0;for(var j=0;j<8;j++)b=(b<<1)|bits[i+j];data.push(b)}
  var shortLen=Math.floor(rawCw/nb),nShort=nb-rawCw%nb,div=divisor(eccLen),blocks=[],off=0;
  for(i=0;i<nb;i++){var dl=shortLen-eccLen+(i<nShort?0:1),d=data.slice(off,off+dl);off+=dl;var ecc=remainder(d,div);if(i<nShort)d.push(0);blocks.push(d.concat(ecc))}
  var all=[];for(i=0;i<blocks[0].length;i++)blocks.forEach(function(bl,j){if(i!==shortLen-eccLen||j>=nShort)all.push(bl[i])});
  var M=[],F=[];for(i=0;i<size;i++){M.push(new Array(size).fill(false));F.push(new Array(size).fill(false))}
  function setF(x,y,c){M[y][x]=c;F[y][x]=true}
  for(i=0;i<size;i++){setF(6,i,i%2===0);setF(i,6,i%2===0)}
  function finder(x,y){for(var dy=-4;dy<=4;dy++)for(var dx=-4;dx<=4;dx++){var dist=Math.max(Math.abs(dx),Math.abs(dy)),xx=x+dx,yy=y+dy;if(xx>=0&&xx<size&&yy>=0&&yy<size)setF(xx,yy,dist!==2&&dist!==4)}}
  finder(3,3);finder(size-4,3);finder(3,size-4);
  var pos=[];if(ver>1){var na=Math.floor(ver/7)+2,step=Math.ceil((ver*4+4)/(na*2-2))*2;pos=[6];for(var p=size-7;pos.length<na;p-=step)pos.splice(1,0,p)}
  pos.forEach(function(a,ia){pos.forEach(function(b,ib){if((ia===0&&ib===0)||(ia===0&&ib===pos.length-1)||(ia===pos.length-1&&ib===0))return;for(var dy=-2;dy<=2;dy++)for(var dx=-2;dx<=2;dx++)setF(a+dx,b+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)})});
  function fmt(mask){var d=(e.fmt<<3)|mask,r=d;for(var i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);var bs=((d<<10)|r)^0x5412;
    for(i=0;i<=5;i++)setF(8,i,bit(bs,i));setF(8,7,bit(bs,6));setF(8,8,bit(bs,7));setF(7,8,bit(bs,8));for(i=9;i<15;i++)setF(14-i,8,bit(bs,i));
    for(i=0;i<8;i++)setF(size-1-i,8,bit(bs,i));for(i=8;i<15;i++)setF(8,size-15+i,bit(bs,i));setF(8,size-8,true)}
  fmt(0);
  if(ver>=7){var r=ver;for(i=0;i<12;i++)r=(r<<1)^((r>>>11)*0x1F25);var vb=(ver<<12)|r;for(i=0;i<18;i++){var c=bit(vb,i),a=size-11+i%3,b2=Math.floor(i/3);setF(a,b2,c);setF(b2,a,c)}}
  var n=0;for(var right=size-1;right>=1;right-=2){if(right===6)right=5;for(var vert=0;vert<size;vert++)for(j=0;j<2;j++){var x=right-j,up=((right+1)&2)===0,y=up?size-1-vert:vert;if(!F[y][x]&&n<all.length*8){M[y][x]=bit(all[n>>>3],7-(n&7));n++}}}
  function mask(m){for(var y=0;y<size;y++)for(var x=0;x<size;x++){var inv;switch(m){case 0:inv=(x+y)%2===0;break;case 1:inv=y%2===0;break;case 2:inv=x%3===0;break;case 3:inv=(x+y)%3===0;break;case 4:inv=(Math.floor(x/3)+Math.floor(y/2))%2===0;break;case 5:inv=x*y%2+x*y%3===0;break;case 6:inv=(x*y%2+x*y%3)%2===0;break;default:inv=((x+y)%2+x*y%3)%2===0}if(!F[y][x]&&inv)M[y][x]=!M[y][x]}}
  function penalty(){var s=0,y,x,run,dark=0;
    for(y=0;y<size;y++){run=1;for(x=1;x<size;x++){if(M[y][x]===M[y][x-1]){run++;if(run===5)s+=3;else if(run>5)s++}else run=1}}
    for(x=0;x<size;x++){run=1;for(y=1;y<size;y++){if(M[y][x]===M[y-1][x]){run++;if(run===5)s+=3;else if(run>5)s++}else run=1}}
    for(y=0;y<size-1;y++)for(x=0;x<size-1;x++){var c=M[y][x];if(c===M[y][x+1]&&c===M[y+1][x]&&c===M[y+1][x+1])s+=3}
    for(y=0;y<size;y++)for(x=0;x<size;x++)if(M[y][x])dark++;
    return s+(Math.ceil(Math.abs(dark*20-size*size*10)/(size*size))-1)*10}
  var best=0,bp=1e9;for(var m=0;m<8;m++){mask(m);fmt(m);var pe=penalty();if(pe<bp){bp=pe;best=m}mask(m)}
  mask(best);fmt(best);
  return {size:size,modules:M};
}
function svg(text,px){var q=make(text),s=q.size,z=4,t=s+z*2,d="";
  for(var y=0;y<s;y++)for(var x=0;x<s;x++)if(q.modules[y][x])d+="M"+(x+z)+","+(y+z)+"h1v1h-1z";
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+t+' '+t+'" width="'+(px||120)+'" height="'+(px||120)+'" shape-rendering="crispEdges" role="img" aria-label="QR code du reçu"><rect width="'+t+'" height="'+t+'" fill="#ffffff"/><path d="'+d+'" fill="#000000"/></svg>'}
return {make:make,svg:svg};
})();
