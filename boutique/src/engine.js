/* ===== Moteur du jeu ===== */
var S = null;
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
function loadSave() {
  try { var j = localStorage.getItem(KEY); if (j) { var s = JSON.parse(j); if (s && s.v === 2 && s.stock) return s; } } catch (e) {}
  return null;
}
function scores() { try { return JSON.parse(localStorage.getItem("maboutique_scores") || "[]"); } catch (e) { return []; } }
function addScore(sc) {
  try {
    var a = scores(); a.push(sc); a.sort(function (x, y) { return y.score - x.score; });
    localStorage.setItem("maboutique_scores", JSON.stringify(a.slice(0, 5)));
  } catch (e) {}
}
function calOf(day) {
  var d0 = day - 1, y = Math.floor(d0 / 360) + 1, doy = d0 % 360, m = Math.floor(doy / 30);
  return { y: y, m: m, dom: doy % 30 + 1, wd: d0 % 7 };
}
function dateStr(day) {
  var c = calOf(day);
  return (LANG === "en" ? WD_EN[c.wd] : WD_FR[c.wd]) + " " + c.dom + " " + (LANG === "en" ? MONTHS_EN[c.m] : MONTHS_FR[c.m]) + (c.y > 1 ? " · " + t("An ", "Year ") + c.y : "");
}
function specialOf(day) {
  var c = calOf(day);
  for (var i = 0; i < SPECIALS.length; i++) { var s = SPECIALS[i]; if (s.m === c.m && c.dom >= s.a && c.dom <= s.b) return s; }
  return null;
}

function fresh(name, diff) {
  var d = DIFF[diff] || DIFF.normal;
  var s = {
    v: 2, name: name || "Chez Ama", diff: diff || "normal", day: 1, cash: d.cash, rep: 40, lvl: 0,
    stock: {}, price: {}, cost: {}, avgc: {}, sup: 1, rel: [0, 0, 0], negoMod: [1, 1, 1], negoLeft: 1, avail: [{}, {}, {}],
    staff: [], cands: [], up: {}, shelf: 0, mmFloat: 0, branches: 0, loan: 0, owed: [], shock: {}, boosts: [], comp: 0, compMode: "",
    wx: "sun", nextWx: "sun", fc: "sun", mission: null, missDone: 0, ach: {}, hist: [], total: 0, sold: 0, best: d.cash,
    won: false, over: false, life: false, tut: 0, sound: true, lang: "", tab: "day", last: null, news: "", winDay: 0
  };
  PRODUCTS.forEach(function (p) { s.stock[p.id] = 0; s.price[p.id] = p.price; s.cost[p.id] = p.cost; s.avgc[p.id] = p.cost; });
  s.nextWx = rollWeather(0);
  return s;
}

/* ---------- Nouveau jour : marché, météo, mission, fournisseurs ---------- */
function rollMarket() {
  PRODUCTS.forEach(function (p) {
    var drift = S.cost[p.id] ? S.cost[p.id] / p.cost : 1;
    var target = rnd(0.9, 1.12);
    var v = clamp(drift * 0.5 + target * 0.5, 0.82, 1.4);
    S.cost[p.id] = Math.round(p.cost * v / 5) * 5;
  });
}
function shockMult(id) {
  var m = 1;
  if (S.shock.all && S.shock.all.d > 0) m *= S.shock.all.m;
  if (S.shock[id] && S.shock[id].d > 0) m *= S.shock[id].m;
  return m;
}
function relDisc(i) { var r = S.rel[i]; return r >= 150 ? 0.06 : r >= 60 ? 0.04 : r >= 20 ? 0.02 : 0; }
function costOf(p) {
  var base = S.cost[p.id] * shockMult(p.id) * SUPS[S.sup].m * (1 - relDisc(S.sup)) * S.negoMod[S.sup];
  return p.cost < 50 ? Math.max(5, Math.round(base)) : r5(base);
}
function unlocked(p) { return p.lvl <= S.lvl && (!p.fridge || S.up.fridge); }
function inStock(p) { return S.avail[S.sup][p.id] !== false; }
function capacity() {
  var c = SHOPS[S.lvl].cap + S.shelf * 20;
  S.staff.forEach(function (w) { c += TRAITS[w.trait].cap; });
  return c;
}
function wages() { var w = 0; S.staff.forEach(function (x) { w += x.wage; }); return w; }
function dailyFixed() {
  var rent = Math.round(SHOPS[S.lvl].rent * (DIFF[S.diff] || DIFF.normal).rent);
  return rent + wages() + (S.up.fridge && !S.up.solar ? 300 : 0) + (S.up.moto ? 800 : 0);
}

function newDay(first) {
  var c = calOf(S.day);
  S.wx = S.nextWx || rollWeather(c.m);
  var c2 = calOf(S.day + 1);
  S.nextWx = rollWeather(c2.m);
  S.fc = Math.random() < 0.8 ? S.nextWx : pick(["sun", "rain", "hot", "harm"].filter(function (x) { return x !== S.nextWx; }));
  rollMarket();
  S.avail = SUPS.map(function (sp) { var o = {}; PRODUCTS.forEach(function (p) { o[p.id] = Math.random() < sp.av; }); return o; });
  S.negoMod = [1, 1, 1]; S.negoLeft = 1;
  var names = STAFF_NAMES.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 3), keys = Object.keys(TRAITS);
  S.cands = names.map(function (n, i) { var tr = keys[(i + ri(0, 3)) % keys.length]; return { name: n, trait: tr, wage: TRAITS[tr].wage }; });
  S.news = pick(NEWS);
  S.mission = makeMission();
  S.msnDone = false;
}
function makeMission() {
  var mult = SHOPS[S.lvl].mult, r = Math.random();
  var list = PRODUCTS.filter(function (p) { return unlocked(p) && p.w >= 0.7 && p.id !== "credit"; });
  if (r < 0.5 && list.length) {
    var p = pick(list), n = Math.max(6, Math.round(p.demand * mult * 0.55));
    return { k: "sell", id: p.id, n: n, rew: Math.round(clamp(n * (p.price - p.cost) * 1.6, 1500, 8000) / 50) * 50 };
  }
  if (r < 0.8) return { k: "rev", n: Math.round(22000 * mult * (1 + S.day / 150) / 1000) * 1000, rew: Math.round(2500 * mult / 50) * 50 };
  return { k: "serve", n: Math.round(55 * mult), rew: Math.round(2000 * mult / 50) * 50 };
}
function missionText(m) {
  if (!m) return "";
  if (m.k === "sell") return t("Vendre " + m.n + " × ", "Sell " + m.n + " × ") + (LANG === "en" ? prod(m.id).en : prod(m.id).fr);
  if (m.k === "rev") return t("Réaliser " + money(m.n) + " de ventes", "Make " + money(m.n) + " in sales");
  return t("Servir " + m.n + " ventes", "Serve " + m.n + " sales");
}

/* ---------- Achats ---------- */
function addStock(id, q, unit) {
  var cur = S.stock[id];
  S.avgc[id] = cur + q > 0 ? (S.avgc[id] * cur + unit * q) / (cur + q) : unit;
  S.stock[id] = cur + q;
}
function buy(id, q) {
  var p = prod(id), c = costOf(p), pack = SUPS[S.sup].pack;
  if (pack > 1) q = Math.ceil(q / pack) * pack;
  var total = c * q;
  if (S.cash < total) return false;
  S.cash -= total; addStock(id, q, c); S.rel[S.sup] += total / 1000;
  return true;
}
function negotiate() {
  if (S.negoLeft <= 0) return null;
  S.negoLeft -= 1;
  var p = clamp(0.35 + S.rep / 300 + S.rel[S.sup] / 600, 0.1, 0.8);
  if (Math.random() < p) { S.negoMod[S.sup] = 0.94; return true; }
  S.negoMod[S.sup] = 1.03; return false;
}
function loseStock(frac) { PRODUCTS.forEach(function (p) { S.stock[p.id] = Math.floor(S.stock[p.id] * (1 - frac)); }); }
function hasTrait(tr) { return S.staff.some(function (w) { return w.trait === tr; }); }
function theftProtect() { return hasTrait("honest") ? 1 : S.up.cam ? 0.75 : 0; }

/* ---------- Événements ---------- */
var EVENTS = [
  { id: "cut", w: 8, fr: ["Coupure de courant", "La CEET coupe le courant dans tout le quartier."], en: ["Power cut", "The power company cuts electricity in the whole neighborhood."], apply: function (r) { r.cut = true; } },
  { id: "bapteme", w: 6, fr: ["Baptême chez la voisine", "La voisine fête le baptême de son bébé et passe quêter pour la fête."], en: ["Neighbor's christening", "The neighbor celebrates her baby's christening and collects for the party."],
    ch: [{ fr: "Donner 2 000 F", en: "Give 2,000 F", fn: function (r) { if (S.cash < 2000) return t("Vous n'avez pas assez d'argent.", "You don't have enough cash."); S.cash -= 2000; S.rep += 4; r.dem = 1.1; return t("Tout le quartier en parle : la fête passe aussi chez vous.", "The whole neighborhood talks about it: the party flows your way too."); } },
      { fr: "S'excuser poliment", en: "Politely excuse yourself", fn: function () { S.rep -= 1; return t("La voisine comprend, mais note votre refus.", "The neighbor understands but notes your refusal."); } }] },
  { id: "controle", w: 6, fr: ["Contrôle d'hygiène", "Un inspecteur entre dans la boutique avec son carnet."], en: ["Hygiene inspection", "An inspector walks in with his notebook."],
    ch: [{ fr: "Présenter vos papiers en règle", en: "Show your papers", fn: function () { if (S.rep >= 50) { S.rep += 3; return t("Tout est en ordre. L'inspecteur vous félicite !", "All in order. The inspector congratulates you!"); } S.cash -= 4000; return t("Il relève des manques : amende de 4 000 F.", "He finds shortcomings: a 4,000 F fine."); } },
      { fr: "Fermer discrètement", en: "Quietly close", fn: function (r) { r.closed = true; S.rep -= 3; return t("Vous restez fermé. Les clients s'étonnent.", "You stay closed. Customers wonder why."); } }] },
  { id: "vol", w: 6, fr: ["Vol à l'étalage", "Un groupe de jeunes rôde autour de l'étal."], en: ["Shoplifting", "A group of youths lurks around the stall."],
    ch: [{ fr: "Surveiller de près", en: "Watch closely", fn: function () { if (Math.random() < 0.6 + theftProtect() * 0.4) return t("Vous les repérez à temps. Rien de perdu.", "You spot them in time. Nothing lost."); loseStock(0.1); return t("Quelques articles disparaissent.", "A few items disappear."); } },
      { fr: "Ne rien faire", en: "Do nothing", fn: function () { if (Math.random() < theftProtect()) return t("Votre équipement protège la boutique. Rien de perdu.", "Your setup protects the shop. Nothing lost."); loseStock(0.2); return t("Vous perdez une partie du stock.", "You lose part of your stock."); } }] },
  { id: "hausse", w: 6, fr: ["Hausse des prix", "Les grossistes augmentent leurs prix pour quelques jours."], en: ["Price hike", "Wholesalers raise their prices for a few days."], apply: function () { S.shock.all = { m: 1.2, d: 3 }; rollMarket(); } },
  { id: "baisse", w: 4, fr: ["Promo chez les grossistes", "Les grossistes baissent leurs prix pour quelques jours."], en: ["Wholesaler sale", "Wholesalers lower their prices for a few days."], apply: function () { S.shock.all = { m: 0.87, d: 3 }; } },
  { id: "penurie", w: 5, fr: ["Pénurie de riz au port", "Un bateau est retardé : le riz devient cher."], en: ["Rice shortage at the port", "A ship is delayed: rice gets expensive."], apply: function () { S.shock.riz = { m: 1.35, d: 5 }; } },
  { id: "credit", w: 6, fr: ["Un voisin demande à crédit", "« Je te rembourse dans trois jours », promet un voisin qui veut 5 000 F de marchandises."], en: ["A neighbor asks for credit", "\"I'll pay you back in three days,\" promises a neighbor who wants 5,000 F of goods."],
    ch: [{ fr: "Accepter", en: "Accept", fn: function () { S.owed.push({ d: 3, a: 5000, ok: Math.random() < 0.75 }); S.rep += 2; return t("Il emporte la marchandise. Réponse dans 3 jours.", "He takes the goods. Answer in 3 days."); } },
      { fr: "Refuser poliment", en: "Politely decline", fn: function () { S.rep -= 1; return t("Il repart un peu vexé.", "He leaves slightly offended."); } }] },
  { id: "lot", w: 6, cond: function () { return S.cash >= 12000; }, fr: ["Un lot de riz à prix cassé", "Un camionneur propose 30 kg de riz à 380 F le kilo (11 400 F)."], en: ["A cheap lot of rice", "A trucker offers 30 kg of rice at 380 F per kg (11,400 F)."],
    ch: [{ fr: "Acheter le lot", en: "Buy the lot", fn: function () { S.cash -= 11400; addStock("riz", 30, 380); return t("Bonne affaire : 30 kg de riz en stock.", "Great deal: 30 kg of rice in stock."); } },
      { fr: "Refuser", en: "Decline", fn: function () { return t("Vous préférez rester prudent.", "You prefer to stay careful."); } }] },
  { id: "concurrent", w: 5, cond: function () { return S.comp <= 0 && S.day > 15; }, fr: ["Un concurrent s'installe", "Une nouvelle boutique ouvre à deux rues de la vôtre."], en: ["A competitor opens", "A new shop opens two streets away."],
    ch: [{ fr: "Baisser vos prix de 5 % pendant 10 jours", en: "Cut prices by 5% for 10 days", fn: function () { S.comp = 10; S.compMode = "cut"; return t("Vous gardez vos clients, mais vos marges fondent un peu.", "You keep your customers, but margins shrink a bit."); } },
      { fr: "Miser sur le service (3 000 F)", en: "Focus on service (3,000 F)", fn: function () { if (S.cash < 3000) { S.comp = 10; S.compMode = "ign"; return t("Pas assez d'argent : le concurrent vous prend des clients.", "Not enough cash: the competitor takes customers."); } S.cash -= 3000; S.rep += 3; S.comp = 10; S.compMode = "svc"; return t("Vous accueillez chacun avec le sourire. Les fidèles restent.", "You greet everyone with a smile. Loyal customers stay."); } },
      { fr: "Ne rien changer", en: "Change nothing", fn: function () { S.comp = 10; S.compMode = "ign"; return t("Quelques clients essaient le nouveau.", "Some customers try the new one."); } }] },
  { id: "buzz", w: 4, cond: function () { return S.rep >= 60; }, fr: ["Une vidéo fait le buzz", "Un jeune a filmé votre boutique : « La plus sympa du quartier ! » La vidéo circule sur WhatsApp."], en: ["A video goes viral", "A young man filmed your shop: \"The nicest in the neighborhood!\" The video spreads on WhatsApp."], apply: function () { S.boosts.push({ m: 1.3, d: 3 }); S.rep += 2; } },
  { id: "radio", w: 5, cond: function () { return S.cash >= 8000; }, fr: ["Annonce à la radio", "La radio de quartier propose de citer votre boutique pour 5 000 F."], en: ["Radio ad", "The neighborhood radio offers to mention your shop for 5,000 F."],
    ch: [{ fr: "Payer 5 000 F", en: "Pay 5,000 F", fn: function () { S.cash -= 5000; S.boosts.push({ m: 1.15, d: 5 }); return t("L'annonce passe toute la semaine.", "The ad runs all week."); } },
      { fr: "Refuser", en: "Decline", fn: function () { return t("Vous gardez votre argent.", "You keep your money."); } }] },
  { id: "mariage", w: 5, cond: function () { return S.stock.riz >= 40; }, fr: ["Commande pour un mariage", "Une famille commande 40 kg de riz pour un mariage, à 640 F le kilo."], en: ["Wedding order", "A family orders 40 kg of rice for a wedding, at 640 F per kg."],
    ch: [{ fr: "Accepter (25 600 F)", en: "Accept (25,600 F)", fn: function () { S.stock.riz -= 40; S.cash += 25600; S.rep += 2; return t("Livraison faite, la famille est ravie.", "Delivered, the family is delighted."); } },
      { fr: "Refuser", en: "Decline", fn: function () { return t("Vous gardez le riz pour vos clients.", "You keep the rice for your customers."); } }] },
  { id: "absent", w: 5, cond: function () { return S.staff.length > 0; }, fr: ["Un employé est absent", "Un de vos employés a un problème de famille."], en: ["An employee is absent", "One of your employees has a family problem."],
    ch: [{ fr: "Lui donner 2 000 F d'aide", en: "Give 2,000 F help", fn: function () { if (S.cash >= 2000) { S.cash -= 2000; S.rep += 1; return t("Il est touché et reviendra demain, plus motivé.", "He is moved and will return tomorrow, more motivated."); } return t("Pas assez d'argent.", "Not enough cash."); } },
      { fr: "Se débrouiller sans lui", en: "Manage without him", fn: function (r) { r.capMinus = 50; return t("La journée sera plus chargée.", "The day will be busier."); } }] },
  { id: "fraude", w: 4, cond: function () { return S.mmFloat > 0; }, fr: ["Fraude Mobile Money", "Un faux message de transfert piège votre kiosque."], en: ["Mobile Money fraud", "A fake transfer message tricks your kiosk."],
    ch: [{ fr: "Signaler à l'opérateur", en: "Report to the operator", fn: function () { var l = Math.round(S.mmFloat * 0.1); S.mmFloat -= l; return t("Vous perdez " + money(l) + " de float seulement.", "You lose only " + money(l) + " of float."); } },
      { fr: "Laisser passer", en: "Let it go", fn: function () { var l = Math.round(S.mmFloat * 0.3); S.mmFloat -= l; return t("Vous perdez " + money(l) + " de float.", "You lose " + money(l) + " of float."); } }] },
  { id: "billet", w: 5, fr: ["Billet suspect", "Un client paie 10 000 F avec un billet qui a l'air bizarre."], en: ["Suspicious banknote", "A customer pays 10,000 F with an odd-looking banknote."],
    ch: [{ fr: "Le refuser poliment", en: "Politely refuse it", fn: function () { S.rep -= 0.5; return t("Le client râle mais paie autrement.", "The customer grumbles but pays another way."); } },
      { fr: "L'accepter quand même", en: "Accept it anyway", fn: function () { if (Math.random() < 0.5) { S.cash -= 5000; return t("C'était un faux : vous perdez 5 000 F.", "It was fake: you lose 5,000 F."); } return t("Le billet était bon, ouf.", "The note was real, phew."); } }] },
  { id: "amende", w: 4, cond: function () { return S.lvl === 0; }, fr: ["Étalage sur le trottoir", "Les agents municipaux demandent de dégager le trottoir."], en: ["Stall on the sidewalk", "Municipal agents ask you to clear the sidewalk."],
    ch: [{ fr: "Payer 2 500 F de taxe", en: "Pay a 2,500 F fee", fn: function () { S.cash -= 2500; return t("Vous restez à votre place.", "You keep your spot."); } },
      { fr: "Déplacer l'étal (moins de clients)", en: "Move the stall (fewer customers)", fn: function (r) { r.dem = 0.75; return t("L'étal est moins visible aujourd'hui.", "The stall is less visible today."); } }] },
  { id: "plainte", w: 5, fr: ["Une cliente trouve vos prix élevés", "« C'est cher chez toi ! » dit-elle devant les autres clients."], en: ["A customer finds prices high", "\"It's expensive here!\" she says in front of other customers."],
    ch: [{ fr: "Faire un geste (1 500 F)", en: "Make a gesture (1,500 F)", fn: function () { S.cash -= 1500; S.rep += 2; return t("Elle repart avec le sourire et le dira autour d'elle.", "She leaves smiling and will tell others."); } },
      { fr: "Expliquer vos prix", en: "Explain your prices", fn: function () { if (S.rep >= 50) { S.rep += 0.5; return t("Elle comprend la qualité et revient.", "She understands the quality and comes back."); } S.rep -= 2; return t("Elle n'est pas convaincue.", "She isn't convinced."); } }] },
  { id: "zemi", w: 5, fr: ["Un zémidjan tombe en panne", "Un conducteur de moto-taxi s'arrête devant la boutique, en sueur."], en: ["A taxi-moto breaks down", "A moto-taxi driver stops in front of the shop, sweating."],
    ch: [{ fr: "Lui offrir de l'eau", en: "Offer him water", fn: function () { S.cash -= 500; S.rep += 3; return t("Il remercie, et ses collègues passeront vous voir.", "He thanks you, and his colleagues will drop by."); } },
      { fr: "Continuer votre travail", en: "Carry on working", fn: function () { return t("Il se débrouille tout seul.", "He manages on his own."); } }] },
  { id: "greve", w: 3, fr: ["Grève des transports", "Moins de gens circulent aujourd'hui."], en: ["Transport strike", "Fewer people are out and about today."], apply: function (r) { r.dem = 0.8; } }
];
function pickEvent() {
  var p = (DIFF[S.diff] || DIFF.normal).ev;
  if (S.day <= 2 || Math.random() > p) return null;
  var pool = EVENTS.filter(function (e) { return !e.cond || e.cond(); });
  var tot = pool.reduce(function (a, e) { return a + e.w; }, 0), x = Math.random() * tot;
  for (var i = 0; i < pool.length; i++) { x -= pool[i].w; if (x <= 0) return pool[i]; }
  return pool[0];
}

/* ---------- Simulation d'une journée ---------- */
function runDay(ev, res) {
  var cal = calOf(S.day), sp = specialOf(S.day), wx = WX[S.wx];
  var sale = { rows: [], rev: 0, cogs: 0, spoil: 0, served: 0, mm: 0, branch: 0, fuel: 0 };
  var mult = SHOPS[S.lvl].mult;
  var repF = 0.6 + clamp(S.rep, 0, 100) / 100 * 0.8;
  var dem = (res.dem || 1) * (S.up.sign ? 1.12 : 1) * (S.up.moto ? 1.15 : 1) * rnd(0.88, 1.12);
  dem *= cal.wd === 5 ? 1.2 : cal.wd === 6 ? 0.9 : 1;
  dem *= cal.dom <= 5 ? 1.15 : 1;
  var boostF = 1; S.boosts.forEach(function (b) { if (b.d > 0) boostF *= b.m; });
  var compF = S.comp > 0 ? (S.compMode === "ign" ? 0.85 : S.compMode === "svc" ? 0.95 : 1) : 1;
  var compRev = S.comp > 0 && S.compMode === "cut" ? 0.95 : 1;
  var capLeft = capacity() - (res.capMinus || 0);
  if (res.closed) { capLeft = 0; dem = 0; }
  var happy = 0, totWant = 0;
  PRODUCTS.forEach(function (p) {
    if (!unlocked(p)) return;
    var pr = S.price[p.id];
    var el = clamp(Math.pow(p.price / pr, 2.2), 0.05, 2.2);
    var wxF = wx[p.id] != null ? wx[p.id] : wx.dem;
    var spF = sp ? (sp[p.id] != null ? sp[p.id] : (sp.all || 1)) : 1;
    var extra = (p.id === "piles" && res.cut) ? 3 : 1;
    var want = Math.round(p.demand * mult * repF * dem * boostF * compF * wxF * spF * extra * el * rnd(0.9, 1.1));
    var can = Math.max(0, Math.min(want, S.stock[p.id], Math.floor(capLeft / p.w)));
    capLeft -= can * p.w;
    S.stock[p.id] -= can;
    var rev = can * pr * compRev;
    sale.rev += rev; sale.cogs += can * S.avgc[p.id]; sale.served += can;
    sale.rows.push({ p: p, sold: can, want: want, rev: rev, left: S.stock[p.id] });
    totWant += want; happy += can;
  });
  // pertes des produits frais
  var mg = hasTrait("manager") ? 0.7 : 1, powered = !(res.cut && !S.up.gen && !S.up.solar);
  PRODUCTS.forEach(function (p) {
    if (!p.perish || !unlocked(p)) return;
    var rate = S.up.fridge ? (powered ? 0.05 : 0.3) : (res.cut ? 0.7 : 0.5);
    var lost = Math.floor(S.stock[p.id] * rate * mg);
    if (lost > 0) { S.stock[p.id] -= lost; sale.spoil += lost * S.avgc[p.id]; sale.rows.forEach(function (r) { if (r.p === p) r.spoiled = lost; }); }
  });
  // réputation
  var fill = totWant > 0 ? happy / totWant : 1;
  var dRep = res.closed ? -2 : (fill >= 0.9 ? 1.2 : fill >= 0.7 ? 0.2 : -(0.7 - fill) * 3);
  if (dRep > 0 && S.up.card) dRep *= 1.3;
  S.staff.forEach(function (w) { if (w.trait === "charm") dRep += 0.4; });
  var tooHigh = sale.rows.some(function (r) { return S.price[r.p.id] > r.p.price * 1.35; });
  S.rep = clamp(S.rep + dRep - (tooHigh ? 1 : 0), 0, 100);
  // services et succursales
  if (S.up.mmk && S.mmFloat > 0) {
    var vol = Math.min(S.mmFloat * 5, 150000 * mult * repF * (res.closed ? 0 : 1));
    sale.mm = Math.round(vol * 0.012);
  }
  for (var b = 0; b < S.branches; b++) sale.branch += Math.round(40000 * (0.5 + S.rep / 200) * rnd(0.9, 1.1)) - 12000;
  // frais
  var costs = dailyFixed(), extra = [];
  if (res.cut && S.up.gen && !S.up.solar) { costs += 500; }
  S.cash += sale.rev + sale.mm + sale.branch;
  S.cash -= costs;
  if (S.loan > 0) { var pay = Math.min(2200, S.loan); S.cash -= pay; S.loan -= pay; extra.push([t("Remboursement du prêt", "Loan repayment"), -pay]); }
  S.owed = S.owed.filter(function (o) {
    o.d -= 1;
    if (o.d <= 0) {
      if (o.ok) { S.cash += o.a; extra.push([t("Le voisin vous rembourse", "The neighbor pays you back"), o.a]); S.rep = clamp(S.rep + 1, 0, 100); }
      else extra.push([t("Le voisin ne rembourse pas…", "The neighbor doesn't pay back…"), 0]);
      return false;
    }
    return true;
  });
  var profit = sale.rev + sale.mm + sale.branch - sale.cogs - costs - sale.spoil;
  S.total += sale.rev; S.sold += sale.served; S.best = Math.max(S.best, S.cash);
  // mission
  var msn = null;
  if (S.mission) {
    var m = S.mission, ok = false;
    if (m.k === "sell") sale.rows.forEach(function (r) { if (r.p.id === m.id && r.sold >= m.n) ok = true; });
    else if (m.k === "rev") ok = sale.rev >= m.n;
    else ok = sale.served >= m.n;
    msn = { text: missionText(m), ok: ok, rew: m.rew };
    if (ok) { S.cash += m.rew; S.missDone += 1; }
  }
  var summary = { day: S.day, date: dateStr(S.day), sale: sale, costs: costs, extra: extra, profit: profit, ev: ev, res: res, fill: fill, dRep: dRep, msn: msn, wx: S.wx, sp: sp, achs: [] };
  S.hist.push({ d: S.day, cash: Math.round(S.cash), rev: Math.round(sale.rev) });
  if (S.hist.length > 60) S.hist.shift();
  // succès
  ACHS.forEach(function (a) {
    if (!S.ach[a.id] && a.test(S)) { S.ach[a.id] = S.day; S.cash += a.rew; summary.achs.push(a); }
  });
  if (!S.won && S.lvl >= 2 && S.cash >= GOAL) { S.won = true; S.winDay = S.day; summary.win = true; addScore({ score: S.best + S.sold * 10, day: S.day, name: S.name, cash: Math.round(S.cash), win: true }); }
  // lendemain
  for (var k in S.shock) { S.shock[k].d -= 1; if (S.shock[k].d <= 0) delete S.shock[k]; }
  S.boosts = S.boosts.filter(function (x) { x.d -= 1; return x.d > 0; });
  if (S.comp > 0) S.comp -= 1;
  summary.fc = null;
  S.day += 1;
  S.last = summary;
  newDay();
  if (S.cash < -15000) { if (!S.life) summary.needLife = true; else { S.over = true; addScore({ score: S.best + S.sold * 10, day: S.day - 1, name: S.name, cash: Math.round(S.cash), win: false }); } }
  save();
  return summary;
}
