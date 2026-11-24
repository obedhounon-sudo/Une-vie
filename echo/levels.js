var ECHO_LEVELS=[
/* ===== Secteur 1 : Portes ===== */
{w:0,par:0,n:["Premier pas","First step"],T:16,max:1,
 t:["Glisse le doigt ou utilise les flèches pour bouger. Atteins la sortie ⭐.","Swipe or use the arrows to move. Reach the exit ⭐."],
 g:["#########","#S..#...#","#.#.#.#.#","#.#...#E#","#########"]},
{w:0,par:1,n:["Le premier écho","First echo"],T:16,max:1,
 t:["La porte reste ouverte tant que quelqu'un est sur la plaque. Termine une boucle sur la plaque, puis ⏪ : ton écho la tiendra pour toi.","The door stays open while someone stands on the plate. End a loop on the plate, then ⏪: your echo will hold it for you."],
 g:["#######","#S.A.E#","#.#####","#a#####","#######"]},
{w:0,par:2,n:["Deux verrous","Two locks"],T:22,max:2,
 t:["Un écho peut passer une porte ouverte par un autre écho.","An echo can pass a door opened by another echo."],
 g:["##########","#S.A..B.E#","#.###.####","#a###b####","##########"]},
{w:0,par:2,n:["Triple clé","Triple key"],T:24,max:3,
 g:["##############","#S.....ABC..E#","##a#b#c#######","##############"]},
{w:0,par:3,n:["Chaîne de verrous","Lock chain"],T:36,max:3,
 t:["Les plaques peuvent être derrière des portes.","Plates can be behind doors."],
 g:["#############","#S.A..B..C.E#","#.###.##.####","#a###b##c####","#############"]},
/* ===== Secteur 2 : Impulsions ===== */
{w:1,par:1,n:["Étincelle","Spark"],T:30,max:1,
 t:["Les plaques jaunes ne se déclenchent qu'à l'ARRIVÉE et ouvrent la porte pendant 6 tours seulement.","Yellow plates only trigger on ARRIVAL and open the door for just 6 turns."],
 g:["############","#S.P.....E##","#.##########","#.........p#","############"]},
{w:1,par:1,n:["Course contre la montre","Race the clock"],T:34,max:2,
 g:["############","#S.P..Q...E#","#.##########","#........p##","#.##########","#.........q#","############"]},
{w:1,par:1,n:["Relais","Relay"],T:40,max:3,
 g:["#############","#S.A.P..Q.E##","#.###.######.","#a...p......#","#######q#####","#############"]},
/* ===== Secteur 3 : Drones ===== */
{w:2,par:0,n:["Sentinelle","Sentinel"],T:24,max:0,
 t:["Les drones 🔴 te détruisent au contact. Observe leur patrouille et traverse au bon moment.","Drones 🔴 destroy you on contact. Watch their patrol and cross at the right time."],
 g:["#########","#.......#","#S.....E#","#.......#","#########"],guards:[{p:[[4,1],[4,2],[4,3]]}]},
{w:2,par:1,n:["Garde du couloir","Hall guard"],T:34,max:1,
 g:["############","#....#.....#","#S.a.A....E#","#....#.....#","############"],guards:[{p:[[8,1],[8,2],[8,3]]},{p:[[10,3],[10,2],[10,1]]}]},
{w:2,par:1,n:["Double ronde","Double patrol"],T:40,max:2,
 g:["#############","#.....#.....#","#S.a..A..b.E#","#.....#.....#","#############"],guards:[{p:[[9,1],[9,2],[9,3]]},{p:[[3,3],[3,2],[3,1]]}]},
/* ===== Secteur 4 : Paradoxe ===== */
{w:3,par:1,n:["Chaîne temporelle","Time chain"],T:36,max:3,
 g:["###############","#S.A..B..P...E#","#.#####.#######","#a.....b....p..","###############"]},
{w:3,par:1,n:["Le noyau","The core"],T:44,max:3,
 t:["Dernière salle : tout ce que tu sais, en même temps.","Last room: everything you know, at once."],
 g:["##############","#S.A....P...E#","#.####.##...##","#a####p##...##","##############"],guards:[{p:[[10,1],[10,2],[10,3]]}]}
];
if(typeof module!=="undefined")module.exports=ECHO_LEVELS;
