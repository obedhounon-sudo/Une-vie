/* ===== Interface ===== */
var app = document.getElementById("app");
var modal = null, pending = null, simming = false, AC = null;
var TABS = [["day", "🏠", "Jour", "Day"], ["stock", "📦", "Stock", "Stock"], ["prix", "🏷️", "Prix", "Prices"], ["shop", "🏪", "Boutique", "Shop"], ["bilan", "📊", "Bilan", "Stats"]];

function pname(p) { return LANG === "en" ? p.en : p.fr; }
function toast(msg) {
  var d = document.createElement("div"); d.className = "toast"; d.textContent = msg; document.body.appendChild(d);
  setTimeout(function () { d.remove(); }, 1500);
}
function snd(k) {
  if (!S || !S.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === "suspended") AC.resume();
    var seq = { ding: [[880, 0.09], [1320, 0.16]], err: [[220, 0.18]], up: [[520, 0.09], [780, 0.09], [1040, 0.16]], win: [[660, 0.12], [880, 0.12], [1320, 0.3]], tap: [[600, 0.04]] }[k] || [[600, 0.05]];
    var t0 = AC.currentTime;
    seq.forEach(function (n) {
      var o = AC.createOscillator(), g = AC.createGain();
      o.type = "sine"; o.frequency.value = n[0]; o.connect(g); g.connect(AC.destination);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + n[1]);
      o.start(t0); o.stop(t0 + n[1] + 0.02); t0 += n[1];
    });
  } catch (e) {}
}
function vib(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }

/* ----- scène dessinée ----- */
function sceneSvg() {
  var wx = S.wx, sky = { sun: "#bfe6fb", hot: "#ffe0a0", rain: "#a9b8c4", harm: "#e3d2ae" }[wx];
  var h = '<svg viewBox="0 0 360 140" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="140" fill="' + sky + '"/>';
  if (wx === "sun" || wx === "hot") h += '<circle cx="320" cy="26" r="16" fill="#ffd54a"/>';
  if (wx === "rain") h += '<ellipse cx="70" cy="24" rx="42" ry="14" fill="#8a97a3"/><ellipse cx="115" cy="30" rx="34" ry="12" fill="#9aa6b1"/><ellipse cx="290" cy="22" rx="38" ry="12" fill="#8a97a3"/>';
  if (wx === "harm") h += '<rect width="360" height="140" fill="#c9a96a" opacity=".22"/>';
  h += '<rect y="112" width="360" height="28" fill="#c9a66b"/><rect y="112" width="360" height="3" fill="#b38f55"/>';
  var items = PRODUCTS.filter(function (p) { return unlocked(p) && S.stock[p.id] > 0; }).slice(0, 9);
  var nm = esc(S.name || "Ma Boutique");
  function stripes(x, y, w, hgt, n) {
    var o = "", sw = w / n;
    for (var i = 0; i < n; i++) o += '<rect x="' + (x + i * sw) + '" y="' + y + '" width="' + sw + '" height="' + hgt + '" fill="' + (i % 2 ? "#fff" : "#c8432f") + '"/>';
    return o;
  }
  if (S.lvl === 0) {
    h += '<rect x="108" y="58" width="4" height="54" fill="#7a5a36"/><rect x="248" y="58" width="4" height="54" fill="#7a5a36"/>';
    h += stripes(100, 52, 160, 16, 8);
    h += '<rect x="122" y="30" width="116" height="18" rx="6" fill="#1f6f4a"/><text x="180" y="43" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" font-family="system-ui">' + nm.slice(0, 18) + '</text>';
    h += '<rect x="112" y="92" width="136" height="20" fill="#8b5e34"/>';
    items.forEach(function (p, i) { h += '<text x="' + (122 + i * 15) + '" y="90" font-size="14">' + p.ico + "</text>"; });
    h += '<text x="258" y="108" font-size="20">🪑</text>';
  } else if (S.lvl === 1) {
    h += '<rect x="64" y="38" width="232" height="74" fill="#f4e2b5"/><rect x="58" y="30" width="244" height="12" fill="#8b3a2b"/>';
    h += stripes(70, 56, 220, 12, 11);
    h += '<rect x="118" y="38" width="124" height="16" rx="5" fill="#1f6f4a"/><text x="180" y="50" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" font-family="system-ui">' + nm.slice(0, 20) + '</text>';
    h += '<rect x="166" y="74" width="28" height="38" fill="#6b4a2b"/><rect x="80" y="74" width="72" height="26" fill="#cfe9f5" stroke="#8aa" /><rect x="208" y="74" width="72" height="26" fill="#cfe9f5" stroke="#8aa"/>';
    items.slice(0, 5).forEach(function (p, i) { h += '<text x="' + (84 + i * 14) + '" y="94" font-size="13">' + p.ico + "</text>"; });
    items.slice(5).forEach(function (p, i) { h += '<text x="' + (212 + i * 14) + '" y="94" font-size="13">' + p.ico + "</text>"; });
    if (S.up.sign) h += '<text x="300" y="60" font-size="16">💡</text>';
  } else {
    h += '<rect x="24" y="30" width="312" height="82" fill="#e9edf0"/><rect x="18" y="22" width="324" height="12" fill="#37474f"/>';
    h += '<rect x="88" y="34" width="184" height="26" rx="6" fill="#1f6f4a"/><text x="180" y="52" text-anchor="middle" font-size="14" font-weight="700" fill="#fff" font-family="system-ui">' + nm.slice(0, 20) + '</text>';
    h += '<rect x="150" y="70" width="60" height="42" fill="#cfe9f5" stroke="#789"/><line x1="180" y1="70" x2="180" y2="112" stroke="#789"/>';
    h += '<rect x="36" y="70" width="100" height="30" fill="#cfe9f5" stroke="#789"/><rect x="224" y="70" width="100" height="30" fill="#cfe9f5" stroke="#789"/>';
    items.slice(0, 6).forEach(function (p, i) { h += '<text x="' + (42 + i * 15) + '" y="92" font-size="13">' + p.ico + "</text>"; });
    items.slice(6).forEach(function (p, i) { h += '<text x="' + (230 + i * 15) + '" y="92" font-size="13">' + p.ico + "</text>"; });
    h += '<text x="300" y="108" font-size="18">🛒</text>';
  }
  if (S.up.moto) h += '<text x="14" y="130" font-size="18">🛵</text>';
  if (S.staff.length) h += '<text x="' + (S.lvl === 0 ? 268 : 306) + '" y="108" font-size="18">🧑🏾‍💼</text>';
  return h + "</svg>";
}
function layHtml() {
  var h = "";
  if (S.wx === "rain") for (var i = 0; i < 18; i++) h += '<i class="drop" style="left:' + ri(2, 98) + "%;animation-delay:-" + (Math.random() * 0.7).toFixed(2) + 's"></i>';
  return h;
}
function playSim(served, cb) {
  var lay = document.getElementById("lay");
  if (!lay || window.__fast) { cb(); return; }
  var n = clamp(Math.round(served / 6), 3, 14), faces = ["🚶🏾‍♀️", "🚶🏾", "👩🏾‍🦱", "🧑🏾", "👧🏾", "👦🏾", "🧓🏾"], h = lay.innerHTML;
  for (var i = 0; i < n; i++) {
    var x = ri(26, 66), d = (i * 0.13).toFixed(2);
    h += '<span class="cust" style="--x:' + x + "%;--d:" + d + 's">' + pick(faces) + '</span><span class="coin" style="left:' + x + "%;bottom:44px;--d:" + (parseFloat(d) + 1.1).toFixed(2) + 's">🪙</span>';
  }
  lay.innerHTML = h;
  snd("ding"); setTimeout(function () { snd("ding"); }, 900);
  setTimeout(cb, 2500);
}

/* ----- rendu principal ----- */
function chip(c, txt) { return '<span class="chip ' + c + '">' + txt + "</span>"; }
function render() {
  var h = '<div class="top"><div><b>🏪 ' + esc(S.name) + "</b><small>" + esc(dateStr(S.day)) + " · " + esc(LANG === "en" ? SHOPS[S.lvl].en : SHOPS[S.lvl].fr) + '</small></div><div style="display:flex;align-items:center;gap:8px"><div style="text-align:right"><span class="pill">💰 ' + money(S.cash) + "</span><small>⭐ " + Math.round(S.rep) + '/100</small></div><button class="ibtn" data-a="settings">⚙️</button></div></div>';
  h += '<div class="tabs">' + TABS.map(function (x) {
    return '<button class="tab' + (S.tab === x[0] ? " on" : "") + '" data-a="tab:' + x[0] + '"><span>' + x[1] + "</span>" + t(x[2], x[3]) + "</button>";
  }).join("") + "</div>";
  if (S.tab === "day") h += vDay(); else if (S.tab === "stock") h += vStock(); else if (S.tab === "prix") h += vPrix(); else if (S.tab === "shop") h += vShop(); else h += vBilan();
  h += '<div class="dock"><div><button class="btn y big" data-a="open"' + (simming ? " disabled" : "") + ">" + t("Ouvrir la boutique ▶", "Open the shop ▶") + "</button></div></div>";
  app.innerHTML = h;
  if (modal) showModal(modal);
}
function vDay() {
  var sp = specialOf(S.day), wx = WX[S.wx], fc = WX[S.fc];
  var h = '<div class="scene">' + sceneSvg() + '<div class="lay" id="lay">' + layHtml() + "</div></div>";
  h += '<div class="card"><div class="chips">' + chip("y", wx.ico + " " + (LANG === "en" ? wx.en : wx.fr)) + (sp ? chip("g", "🎉 " + (LANG === "en" ? sp.en : sp.fr)) : "") +
    (calOf(S.day).wd === 5 ? chip("g", t("🛍️ Jour de marché", "🛍️ Market day")) : "") + (calOf(S.day).dom <= 5 ? chip("g", t("💵 Début de mois", "💵 Start of month")) : "") +
    (S.comp > 0 ? chip("r", t("🏪 Concurrent (", "🏪 Competitor (") + S.comp + t(" j)", " d)")) : "") +
    (S.boosts.length ? chip("g", t("📣 Coup de pouce", "📣 Boost")) : "") + (S.loan > 0 ? chip("r", t("🏦 Prêt : ", "🏦 Loan: ") + money(S.loan)) : "") + "</div>" +
    '<div class="mut" style="margin-top:8px">' + t("Demain : ", "Tomorrow: ") + fc.ico + " " + (LANG === "en" ? fc.en : fc.fr) + t(" (prévision)", " (forecast)") + "</div></div>";
  h += '<div class="card"><div class="mut">📻 ' + esc(LANG === "en" ? S.news[1] : S.news[0]) + "</div></div>";
  if (S.mission) h += '<div class="card"><h3>🎯 ' + t("Mission du jour", "Today's mission") + "</h3><div>" + esc(missionText(S.mission)) + '</div><div class="mut">' + t("Récompense : ", "Reward: ") + money(S.mission.rew) + "</div></div>";
  var low = PRODUCTS.filter(function (p) { return unlocked(p) && S.stock[p.id] === 0; });
  h += '<div class="card"><h3>📋 ' + t("À faire avant d'ouvrir", "Before opening") + '</h3><div class="mut">' + t("1) Achetez du stock (📦). 2) Vérifiez vos prix (🏷️). 3) Ouvrez la boutique.", "1) Buy stock (📦). 2) Check your prices (🏷️). 3) Open the shop.") + "</div>" +
    (low.length ? '<div class="chips" style="margin-top:8px">' + low.map(function (p) { return chip("r", p.ico + " " + t("vide", "empty")); }).join("") + "</div>" : "") + "</div>";
  return h;
}
function relText(i) { var r = S.rel[i], d = relDisc(i); return d ? t("Fidélité : -", "Loyalty: -") + Math.round(d * 100) + " %" : t("Fidélité : ", "Loyalty: ") + Math.round(r) + "/20"; }
function vStock() {
  var sp = SUPS[S.sup], h = '<div class="card"><h3>🚚 ' + t("Fournisseur", "Supplier") + '</h3><div class="sup">' + SUPS.map(function (x) {
    var lock = x.lvl && S.lvl < x.lvl;
    return '<button class="' + (S.sup === x.id ? "on" : "") + '" data-a="sup:' + x.id + '"' + (lock ? " disabled" : "") + ">" + x.ico + "<br>" + esc(LANG === "en" ? x.en : x.fr) + "</button>";
  }).join("") + '</div><div class="mut" style="margin-top:6px">' + esc(LANG === "en" ? sp.den : sp.dfr) + '</div><div class="row" style="margin-top:6px"><span class="mut">' + relText(S.sup) + '</span><button class="btn sm sec" data-a="nego"' + (S.negoLeft > 0 ? "" : " disabled") + ">🤝 " + t("Marchander", "Haggle") + "</button></div>" +
    (S.negoMod[S.sup] < 1 ? '<div class="good">' + t("Remise négociée : -6 % aujourd'hui", "Negotiated: -6% today") + "</div>" : S.negoMod[S.sup] > 1 ? '<div class="bad">' + t("Vexé : +3 % aujourd'hui", "Offended: +3% today") + "</div>" : "") + "</div>";
  if (S.shock.all && S.shock.all.d > 0) h += '<div class="card"><span class="' + (S.shock.all.m > 1 ? "bad" : "good") + '">' + (S.shock.all.m > 1 ? t("Prix élevés chez les grossistes", "High wholesale prices") : t("Promo chez les grossistes", "Wholesale sale")) + "</span></div>";
  h += '<div class="card"><div class="mut" style="margin-bottom:4px">' + t("Capacité : environ " + capacity() + " ventes par jour.", "Capacity: about " + capacity() + " sales per day.") + "</div>";
  var packs = sp.pack > 1 ? [10, 50, 100] : [1, 5, 10, 25];
  PRODUCTS.forEach(function (p) {
    if (p.lvl > S.lvl) { h += '<div class="pr mut">🔒 ' + esc(pname(p)) + t(" — avec une boutique plus grande", " — with a bigger shop") + "</div>"; return; }
    if (p.fridge && !S.up.fridge) { h += '<div class="pr mut">🔒 ' + esc(pname(p)) + t(" — il faut un frigo", " — needs a fridge") + "</div>"; return; }
    var c = costOf(p), ok = inStock(p);
    h += '<div class="pr"><div><span class="n">' + p.ico + " " + esc(pname(p)) + '</span><div class="mut">' + t("Achat ", "Cost ") + money(c) + t(" · en stock : ", " · in stock: ") + S.stock[p.id] + (p.perish ? " · " + t("frais", "fresh") : "") + "</div></div>";
    if (!ok) h += '<div class="bad" style="font-size:13px">' + t("En rupture chez ce fournisseur", "Out of stock at this supplier") + "</div>";
    else h += '<div class="qty">' + packs.map(function (q) { return '<button class="btn sm sec" data-a="buy:' + p.id + ":" + q + '"' + (S.cash < c * q ? " disabled" : "") + ">+" + q + "</button>"; }).join("") + '<button class="btn sm sec" data-a="buymax:' + p.id + '">Max</button></div>';
    h += "</div>";
  });
  return h + "</div>";
}
function estDemand(p) {
  var cal = calOf(S.day), sp = specialOf(S.day), wx = WX[S.wx], mult = SHOPS[S.lvl].mult;
  var repF = 0.6 + clamp(S.rep, 0, 100) / 100 * 0.8;
  var dem = (S.up.sign ? 1.12 : 1) * (S.up.moto ? 1.15 : 1) * (cal.wd === 5 ? 1.2 : cal.wd === 6 ? 0.9 : 1) * (cal.dom <= 5 ? 1.15 : 1);
  var wxF = wx[p.id] != null ? wx[p.id] : wx.dem, spF = sp ? (sp[p.id] != null ? sp[p.id] : (sp.all || 1)) : 1;
  var el = clamp(Math.pow(p.price / S.price[p.id], 2.2), 0.05, 2.2);
  return Math.round(p.demand * mult * repF * dem * wxF * spF * el);
}
function vPrix() {
  var h = '<div class="card"><div class="mut">' + t("Vos prix de vente. Trop cher : moins de clients. Trop bas : moins de bénéfice.", "Your selling prices. Too high: fewer customers. Too low: less profit.") + (S.up.book ? "" : t(" (Le cahier de comptes affiche la prévision.)", " (The account book shows a forecast.)")) + '</div></div><div class="card">';
  PRODUCTS.forEach(function (p) {
    if (!unlocked(p)) return;
    var pr = S.price[p.id], m = pr - S.avgc[p.id], est = estDemand(p);
    h += '<div class="pr"><div class="row"><div><span class="n">' + p.ico + " " + esc(pname(p)) + '</span><div class="mut">' + t("Marge ", "Margin ") + '<span class="' + (m > 0 ? "good" : "bad") + '">' + money(m) + "</span> / " + t("unité", "unit") + "</div>" +
      (S.up.book ? '<div class="mut">' + t("Prévision : ~", "Forecast: ~") + est + t(" ventes · ~", " sales · ~") + money(Math.min(est, S.stock[p.id]) * m) + "</div>" : "") + "</div>" +
      '<div class="row" style="gap:6px"><button class="btn sm sec" data-a="pr:' + p.id + ':-' + (p.price >= 500 ? 50 : 25) + '">−</button><b style="min-width:72px;text-align:center">' + money(pr) + '</b><button class="btn sm sec" data-a="pr:' + p.id + ":" + (p.price >= 500 ? 50 : 25) + '">+</button></div></div></div>';
  });
  return h + "</div>";
}
function vShop() {
  var h = "";
  if (S.lvl < 2) {
    var c = SHOP_COST[S.lvl + 1], nx = SHOPS[S.lvl + 1];
    h += '<div class="card"><h3>🏗️ ' + t("Agrandir : ", "Expand: ") + esc(LANG === "en" ? nx.en : nx.fr) + '</h3><div class="mut">' + t("Plus de clients, plus de produits. Loyer " + money(nx.rent) + "/jour.", "More customers, more products. Rent " + money(nx.rent) + "/day.") + '</div><button class="btn" style="margin-top:8px" data-a="up:lvl"' + (S.cash < c ? " disabled" : "") + ">" + money(c) + "</button></div>";
  }
  h += '<div class="card"><h3>🛠️ ' + t("Équipement", "Equipment") + "</h3>";
  if (S.shelf < 3) { var sc = 20000 + S.shelf * 10000; h += '<div class="pr"><div class="row"><div><span class="n">🗄️ ' + t("Étagères (" + S.shelf + "/3)", "Shelves (" + S.shelf + "/3)") + '</span><div class="mut">' + t("+20 ventes servies par jour.", "+20 sales served per day.") + '</div></div><button class="btn sm" data-a="up:shelf"' + (S.cash < sc ? " disabled" : "") + ">" + money(sc) + "</button></div></div>"; }
  UPS.forEach(function (u) {
    if (S.up[u.id]) return;
    var lock = u.lvl && S.lvl < u.lvl;
    h += '<div class="pr"><div class="row"><div><span class="n">' + u.ico + " " + esc(LANG === "en" ? u.en : u.fr) + '</span><div class="mut">' + esc(LANG === "en" ? u.den : u.dfr) + (lock ? " 🔒" : "") + '</div></div><button class="btn sm" data-a="up:' + u.id + '"' + (S.cash < u.c || lock ? " disabled" : "") + ">" + money(u.c) + "</button></div></div>";
  });
  var owned = UPS.filter(function (u) { return S.up[u.id]; });
  if (owned.length) h += '<div class="chips" style="margin-top:8px">' + owned.map(function (u) { return chip("g", u.ico + " " + esc(LANG === "en" ? u.en.split(" (")[0] : u.fr.split(" (")[0])); }).join("") + "</div>";
  h += "</div>";
  // équipe
  h += '<div class="card"><h3>👥 ' + t("Équipe", "Team") + " (" + S.staff.length + "/5)</h3>";
  S.staff.forEach(function (w, i) {
    var tr = TRAITS[w.trait];
    h += '<div class="pr"><div class="row"><div><span class="n">' + tr.ico + " " + esc(w.name) + " · " + esc(LANG === "en" ? tr.en : tr.fr) + '</span><div class="mut">' + esc(LANG === "en" ? tr.den : tr.dfr) + " · " + money(w.wage) + t("/jour", "/day") + '</div></div><button class="btn sm sec" data-a="fire:' + i + '">' + t("Renvoyer", "Fire") + "</button></div></div>";
  });
  if (S.staff.length < 5) {
    var fee = 10000 + S.staff.length * 6000;
    h += '<div class="mut" style="margin:8px 0 4px">' + t("Candidats du jour (frais d'embauche " + money(fee) + ") :", "Today's candidates (hiring fee " + money(fee) + "):") + "</div>";
    S.cands.forEach(function (w, i) {
      var tr = TRAITS[w.trait];
      h += '<div class="pr"><div class="row"><div><span class="n">' + tr.ico + " " + esc(w.name) + " · " + esc(LANG === "en" ? tr.en : tr.fr) + '</span><div class="mut">' + esc(LANG === "en" ? tr.den : tr.dfr) + " · " + money(w.wage) + t("/jour", "/day") + '</div></div><button class="btn sm" data-a="hire:' + i + '"' + (S.cash < fee ? " disabled" : "") + ">" + t("Embaucher", "Hire") + "</button></div></div>";
    });
  }
  h += "</div>";
  // mobile money
  if (S.up.mmk) h += '<div class="card"><h3>📲 Mobile Money</h3><div class="mut">' + t("Float en réserve : ", "Float in reserve: ") + "<b>" + money(S.mmFloat) + "</b> · " + t("commission ~1,2 % des transferts (jusqu'à 5 × le float par jour).", "commission ~1.2% of transfers (up to 5 × float per day).") + '</div><div class="qty"><button class="btn sm sec" data-a="mm:-10000"' + (S.mmFloat < 10000 ? " disabled" : "") + '>−10 000</button><button class="btn sm" data-a="mm:10000"' + (S.cash < 10000 ? " disabled" : "") + ">+10 000</button></div></div>";
  // prêt
  h += '<div class="card"><h3>🏦 ' + t("Micro-crédit", "Micro-loan") + '</h3><div class="mut">' + t("Empruntez 20 000 F, remboursés 2 200 F par jour pendant 10 jours.", "Borrow 20,000 F, repaid 2,200 F a day for 10 days.") + "</div>" +
    (S.loan > 0 ? '<div class="mut">' + t("Reste à rembourser : ", "Left to repay: ") + money(S.loan) + "</div>" : '<button class="btn sm" style="margin-top:8px" data-a="loan">' + t("Emprunter 20 000 F", "Borrow 20,000 F") + "</button>") + "</div>";
  // succursales
  if (S.won || S.branches > 0) {
    var bc = 6000000 + S.branches * 2000000;
    h += '<div class="card"><h3>👑 ' + t("Succursales", "Branches") + " (" + S.branches + "/5)</h3><div class=\"mut\">" + t("Chaque succursale rapporte un bénéfice quotidien grâce à votre réputation.", "Each branch earns a daily profit thanks to your reputation.") + "</div>" + (S.branches < 5 ? '<button class="btn" style="margin-top:8px" data-a="branch"' + (S.cash < bc ? " disabled" : "") + ">" + money(bc) + "</button>" : "") + "</div>";
  }
  return h;
}
function spark() {
  var a = S.hist.slice(-40);
  if (a.length < 2) return '<div class="mut">' + t("Jouez quelques jours pour voir la courbe.", "Play a few days to see the curve.") + "</div>";
  var mx = Math.max.apply(null, a.map(function (x) { return x.cash; })), mn = Math.min.apply(null, a.map(function (x) { return x.cash; })), rg = Math.max(1, mx - mn);
  var pts = a.map(function (x, i) { return (i / (a.length - 1) * 340 + 5).toFixed(1) + "," + (62 - (x.cash - mn) / rg * 54).toFixed(1); }).join(" ");
  return '<svg class="spark" viewBox="0 0 350 70" preserveAspectRatio="none"><polyline points="' + pts + '" fill="none" stroke="#2e8f63" stroke-width="2.5" stroke-linejoin="round"/></svg><div class="mut">' + t("Trésorerie des derniers jours", "Cash over recent days") + "</div>";
}
function vBilan() {
  var h = '<div class="card"><h3>🎯 ' + t("Objectif", "Goal") + '</h3><div class="mut">' + t("Devenir un Supermarché avec " + money(GOAL) + " en caisse.", "Become a Supermarket with " + money(GOAL) + " in cash.") + '</div><div class="bar" style="margin-top:8px"><i style="width:' + clamp(S.cash / GOAL * 100, 0, 100) + '%"></i></div>' + (S.won ? '<div class="good" style="margin-top:6px">🏆 ' + t("Objectif atteint au jour " + S.winDay + ". Continuez avec les succursales !", "Goal reached on day " + S.winDay + ". Keep going with branches!") + "</div>" : "") + "</div>";
  h += '<div class="card">' + spark() + "</div>";
  h += '<div class="card"><table><tr><td>' + t("Jours joués", "Days played") + "</td><td>" + (S.day - 1) + "</td></tr><tr><td>" + t("Ventes totales (articles)", "Total items sold") + "</td><td>" + S.sold + "</td></tr><tr><td>" + t("Chiffre d'affaires total", "Total revenue") + "</td><td>" + money(S.total) + "</td></tr><tr><td>" + t("Meilleure trésorerie", "Best cash") + "</td><td>" + money(S.best) + "</td></tr><tr><td>" + t("Charges fixes par jour", "Fixed costs per day") + "</td><td>" + money(dailyFixed()) + "</td></tr><tr><td>" + t("Missions réussies", "Missions done") + "</td><td>" + S.missDone + "</td></tr></table></div>";
  if (S.last) h += '<div class="card"><h3>' + t("Dernière journée", "Last day") + " (" + S.last.day + ")</h3>" + summaryTable(S.last) + "</div>";
  var sc = scores();
  if (sc.length) h += '<div class="card"><h3>🏅 ' + t("Meilleurs scores", "Best scores") + "</h3><table>" + sc.map(function (x, i) { return "<tr><td>" + (i + 1) + ". " + esc(x.name) + (x.win ? " 🏆" : "") + "</td><td>" + t("Jour ", "Day ") + x.day + " · " + x.score + "</td></tr>"; }).join("") + "</table></div>";
  h += '<div class="card"><h3>🏆 ' + t("Succès", "Achievements") + " (" + Object.keys(S.ach).length + "/" + ACHS.length + ")</h3>";
  ACHS.forEach(function (a) {
    var got = !!S.ach[a.id];
    h += '<div class="ach' + (got ? "" : " lock") + '"><div class="i">' + a.ico + '</div><div><div class="n">' + esc(LANG === "en" ? a.en : a.fr) + '</div><div class="mut">' + esc(LANG === "en" ? a.den : a.dfr) + (got ? "" : " · " + money(a.rew)) + "</div></div></div>";
  });
  return h + "</div>";
}
function summaryTable(r) {
  var h = "<table>";
  r.sale.rows.forEach(function (x) {
    h += "<tr><td>" + x.p.ico + " " + esc(pname(x.p)) + ' <span class="mut">' + x.sold + "/" + x.want + (x.spoiled ? " · 🗑️" + x.spoiled : "") + "</span></td><td>" + money(x.rev) + "</td></tr>";
  });
  h += "<tr><td><b>" + t("Ventes", "Sales") + "</b></td><td><b>" + money(r.sale.rev) + "</b></td></tr>";
  if (r.sale.mm) h += "<tr><td>📲 Mobile Money</td><td class=\"good\">" + money(r.sale.mm) + "</td></tr>";
  if (r.sale.branch) h += "<tr><td>👑 " + t("Succursales", "Branches") + '</td><td class="good">' + money(r.sale.branch) + "</td></tr>";
  h += "<tr><td>" + t("Coût d'achat des ventes", "Cost of goods sold") + '</td><td class="bad">' + money(-r.sale.cogs) + "</td></tr>";
  if (r.sale.spoil > 0) h += "<tr><td>" + t("Produits gâtés", "Spoiled goods") + '</td><td class="bad">' + money(-r.sale.spoil) + "</td></tr>";
  h += "<tr><td>" + t("Loyer, salaires, charges", "Rent, wages, costs") + '</td><td class="bad">' + money(-r.costs) + "</td></tr>";
  r.extra.forEach(function (e) { h += "<tr><td>" + esc(e[0]) + '</td><td class="' + (e[1] >= 0 ? "good" : "bad") + '">' + money(e[1]) + "</td></tr>"; });
  h += "<tr><td><b>" + t("Résultat du jour", "Day result") + '</b></td><td class="' + (r.profit >= 0 ? "good" : "bad") + '"><b>' + money(r.profit) + "</b></td></tr></table>";
  return h;
}

/* ----- fenêtres ----- */
function showModal(m) {
  var old = document.querySelector(".ov"); if (old) old.remove();
  var d = document.createElement("div"); d.className = "ov"; d.innerHTML = '<div class="md">' + m.html + "</div>";
  document.body.appendChild(d);
}
function closeModal() { modal = null; var o = document.querySelector(".ov"); if (o) o.remove(); }
function shareText() {
  var url = ""; try { url = location.href.split("#")[0]; } catch (e) {}
  return t("🏪 « " + S.name + " » : jour " + (S.day - 1) + ", " + money(S.cash) + " en caisse sur Ma Boutique ! Peux-tu faire mieux ? ", "🏪 \"" + S.name + "\": day " + (S.day - 1) + ", " + money(S.cash) + " in cash on My Shop! Can you do better? ") + url;
}
function share() {
  var txt = shareText();
  try { if (navigator.share) { navigator.share({ text: txt }).catch(function () {}); return; } } catch (e) {}
  try { window.open("https://wa.me/?text=" + encodeURIComponent(txt), "_blank"); } catch (e) {}
}
function howTo() {
  return "<h2>📖 " + t("Comment jouer", "How to play") + "</h2>" +
    "<p><b>1. " + t("Achetez", "Buy") + "</b> " + t("du stock dans l'onglet 📦 chez l'un des 3 fournisseurs. Marchandez, les prix changent chaque jour.", "stock in the 📦 tab from one of 3 suppliers. Haggle, prices change daily.") + "</p>" +
    "<p><b>2. " + t("Fixez vos prix", "Set your prices") + "</b> " + t("dans 🏷️ : trop cher, les clients partent ; trop bas, vous gagnez peu.", "in 🏷️: too high and customers leave; too low and you earn little.") + "</p>" +
    "<p><b>3. " + t("Ouvrez la boutique", "Open the shop") + "</b> " + t("et regardez la journée. Un stock vide fait baisser votre réputation ⭐.", "and watch the day. Empty shelves lower your reputation ⭐.") + "</p>" +
    "<p>🌦️ " + t("Météo, saisons, jours de marché, fêtes : adaptez votre stock. Les produits frais (tomates, pain) se gâtent sans frigo.", "Weather, seasons, market days, feasts: adapt your stock. Fresh goods (tomatoes, bread) spoil without a fridge.") + "</p>" +
    "<p>🎯 " + t("Chaque jour, une mission rapporte un bonus. Débloquez des succès, embauchez, agrandissez, et devenez un supermarché !", "Each day a mission gives a bonus. Unlock achievements, hire, expand, and become a supermarket!") + "</p>" +
    '<button class="btn" data-a="close">' + t("C'est parti !", "Let's go!") + "</button>";
}
function welcomeHtml(w) {
  return "<h2>🏪 " + t("Bienvenue à Lomé !", "Welcome to Lomé!") + "</h2><p>" + t("Vous ouvrez un petit stand au marché. Comment s'appelle votre boutique ?", "You are opening a small stall at the market. What is your shop called?") + "</p>" +
    '<input type="text" id="nm" maxlength="20" value="' + esc(w.name) + '">' +
    '<div class="mut">' + t("Difficulté", "Difficulty") + '</div><div class="qty">' + ["easy", "normal", "hard"].map(function (k) { return '<button class="btn sm ' + (w.diff === k ? "" : "sec") + '" data-a="wdiff:' + k + '">' + (LANG === "en" ? DIFF[k].en : DIFF[k].fr) + " · " + money(DIFF[k].cash) + "</button>"; }).join("") + "</div>" +
    '<div class="mut" style="margin-top:8px">' + t("Langue", "Language") + '</div><div class="qty"><button class="btn sm ' + (LANG === "fr" ? "" : "sec") + '" data-a="wlang:fr">Français</button><button class="btn sm ' + (LANG === "en" ? "" : "sec") + '" data-a="wlang:en">English</button></div>' +
    '<button class="btn y" data-a="wstart">' + t("Commencer", "Start") + "</button>";
}
var W = { name: "Chez Ama", diff: "normal" };
function settingsHtml() {
  return "<h2>⚙️ " + t("Réglages", "Settings") + '</h2><div class="qty"><button class="btn sm ' + (LANG === "fr" ? "" : "sec") + '" data-a="lang:fr">Français</button><button class="btn sm ' + (LANG === "en" ? "" : "sec") + '" data-a="lang:en">English</button></div>' +
    '<button class="btn sec" data-a="sound">' + (S.sound ? "🔊 " + t("Son activé", "Sound on") : "🔇 " + t("Son coupé", "Sound off")) + "</button>" +
    '<button class="btn b" data-a="share">📤 ' + t("Partager mon score (WhatsApp)", "Share my score (WhatsApp)") + "</button>" +
    '<button class="btn sec" data-a="how">📖 ' + t("Comment jouer", "How to play") + "</button>" +
    '<button class="btn r" data-a="reset">' + t("Nouvelle partie", "New game") + "</button>" +
    '<button class="btn sec" data-a="close">' + t("Fermer", "Close") + "</button>";
}

/* ----- déroulement ----- */
function startDay() {
  if (simming) return;
  var ev = pickEvent(), res = {};
  if (ev && ev.ch) {
    pending = { ev: ev, res: res };
    modal = { html: "<h2>📣 " + esc(LANG === "en" ? ev.en[0] : ev.fr[0]) + "</h2><p>" + esc(LANG === "en" ? ev.en[1] : ev.fr[1]) + "</p>" + ev.ch.map(function (c, i) { return '<button class="btn' + (i ? " sec" : "") + '" data-a="choice:' + i + '">' + esc(LANG === "en" ? c.en : c.fr) + "</button>"; }).join("") };
    showModal(modal); vib(30); return;
  }
  if (ev && ev.apply) ev.apply(res);
  go(ev, res, null);
}
function go(ev, res, msg) {
  S.tab = "day";
  simming = true; render();
  var snapshot = JSON.stringify(S.stock);
  var r = runDay(ev, res);
  r.msg = msg; r.evNoChoice = ev && !ev.ch;
  playSim(r.sale.served, function () { simming = false; finish(r); });
}
function finish(r) {
  var head = "";
  if (r.ev) head = "<p><b>📣 " + esc(LANG === "en" ? r.ev.en[0] : r.ev.fr[0]) + "</b><br>" + esc(r.msg || (LANG === "en" ? r.ev.en[1] : r.ev.fr[1])) + "</p>";
  var tail = "";
  var wx = WX[r.wx], sp = r.sp;
  var ctx = '<div class="chips" style="margin-bottom:8px">' + chip("y", wx.ico + " " + (LANG === "en" ? wx.en : wx.fr)) + (sp ? chip("g", "🎉 " + (LANG === "en" ? sp.en : sp.fr)) : "") + chip(r.dRep >= 0 ? "g" : "r", "⭐ " + (r.dRep >= 0 ? "+" : "") + r.dRep.toFixed(1)) + "</div>";
  if (r.msn) tail += "<p>🎯 " + esc(r.msn.text) + " : <b class=\"" + (r.msn.ok ? "good" : "bad") + '">' + (r.msn.ok ? t("réussie ! +", "done! +") + money(r.msn.rew) : t("manquée", "missed")) + "</b></p>";
  r.achs.forEach(function (a) { tail += "<p>🏆 <b>" + esc(LANG === "en" ? a.en : a.fr) + "</b> +" + money(a.rew) + "</p>"; });
  if (r.win) tail += "<p><b>🎉 " + t("Bravo ! Vous êtes devenu un Supermarché ! Vous pouvez continuer et ouvrir des succursales.", "Congratulations! You became a Supermarket! You can keep going and open branches.") + "</b></p>";
  var btns = "";
  if (S.over) { tail += '<p class="bad"><b>💥 ' + t("Faillite ! Trop de dettes. Votre boutique ferme.", "Bankruptcy! Too much debt. Your shop closes.") + "</b></p>"; btns = '<button class="btn b" data-a="share">📤 ' + t("Partager", "Share") + '</button><button class="btn r" data-a="reset2">' + t("Recommencer", "Start over") + "</button>"; snd("err"); }
  else if (r.needLife) { tail += "<p class=\"bad\"><b>⚠️ " + t("Vous êtes à court d'argent. Votre famille propose de vous prêter 15 000 F (une seule fois).", "You're out of cash. Your family offers to lend you 15,000 F (once only).") + "</b></p>"; btns = '<button class="btn" data-a="life">' + t("Accepter l'aide de la famille", "Accept the family's help") + "</button>"; snd("err"); }
  else btns = '<button class="btn" data-a="next">' + t("Jour suivant", "Next day") + "</button>";
  if (r.win || r.achs.length) snd(r.win ? "win" : "up");
  modal = { html: "<h2>🌇 " + t("Fin du jour ", "End of day ") + r.day + '</h2><div class="mut">' + esc(r.date) + "</div>" + ctx + head + summaryTable(r) + tail + btns };
  render();
}

/* ----- actions ----- */
function act(a) {
  var p = a.split(":"), k = p[0];
  if (k !== "open") snd("tap");
  if (k === "tab") { S.tab = p[1]; save(); render(); window.scrollTo(0, 0); }
  else if (k === "sup") { S.sup = +p[1]; save(); render(); }
  else if (k === "nego") { var r = negotiate(); toast(r === true ? t("Marché conclu : -6 % aujourd'hui !", "Deal: -6% today!") : t("Il se vexe : +3 % aujourd'hui.", "He is offended: +3% today.")); save(); render(); }
  else if (k === "buy" || k === "buymax") {
    var pr = prod(p[1]), c = costOf(pr), pack = SUPS[S.sup].pack, q = k === "buymax" ? Math.floor(S.cash / c) : +p[2];
    if (pack > 1) q = Math.floor(q / pack) * pack;
    if (q > 0 && S.cash >= c * q) { buy(pr.id, q); save(); render(); } else toast(t("Pas assez d'argent", "Not enough cash"));
  }
  else if (k === "pr") { var id = p[1], base = prod(id); S.price[id] = clamp(S.price[id] + (+p[2]), 25, base.price * 3); save(); render(); }
  else if (k === "up") {
    var cost, def;
    if (p[1] === "lvl") cost = SHOP_COST[S.lvl + 1]; else if (p[1] === "shelf") cost = 20000 + S.shelf * 10000; else { def = upDef(p[1]); cost = def.c; }
    if (S.cash < cost) { toast(t("Pas assez d'argent", "Not enough cash")); return; }
    S.cash -= cost;
    if (p[1] === "lvl") S.lvl++; else if (p[1] === "shelf") S.shelf++; else S.up[p[1]] = 1;
    snd("up"); toast(t("Achat effectué", "Purchased")); save(); render();
  }
  else if (k === "hire") { var fee = 10000 + S.staff.length * 6000; if (S.cash < fee || S.staff.length >= 5) return; var w = S.cands[+p[1]]; S.cash -= fee; S.staff.push({ name: w.name, trait: w.trait, wage: w.wage }); S.cands.splice(+p[1], 1); snd("up"); save(); render(); }
  else if (k === "fire") { S.staff.splice(+p[1], 1); save(); render(); }
  else if (k === "mm") { var v = +p[1]; if (v > 0 && S.cash >= v) { S.cash -= v; S.mmFloat += v; } else if (v < 0 && S.mmFloat >= -v) { S.mmFloat += v; S.cash -= v; } save(); render(); }
  else if (k === "loan") { S.loan = 22000; S.cash += 20000; save(); render(); }
  else if (k === "branch") { var bc = 6000000 + S.branches * 2000000; if (S.cash >= bc && S.branches < 5) { S.cash -= bc; S.branches++; snd("win"); save(); render(); } }
  else if (k === "open") startDay();
  else if (k === "choice") { var pe = pending; var ch = pe.ev.ch[+p[1]]; var msg = ch.fn(pe.res); closeModal(); pending = null; go(pe.ev, pe.res, msg); }
  else if (k === "next") { closeModal(); S.tab = "day"; save(); render(); }
  else if (k === "life") { S.cash += 15000; S.life = true; closeModal(); save(); render(); }
  else if (k === "settings") { modal = { html: settingsHtml() }; showModal(modal); }
  else if (k === "close") { closeModal(); }
  else if (k === "how") { modal = { html: howTo() }; showModal(modal); }
  else if (k === "sound") { S.sound = !S.sound; save(); modal = { html: settingsHtml() }; showModal(modal); }
  else if (k === "share") share();
  else if (k === "lang") { setLang(p[1]); modal = { html: settingsHtml() }; render(); }
  else if (k === "reset") { if (confirm(t("Effacer la partie en cours et recommencer ?", "Erase the current game and start over?"))) { closeModal(); newGame(); } }
  else if (k === "reset2") { closeModal(); newGame(); }
  else if (k === "wdiff") { W.diff = p[1]; var el = document.getElementById("nm"); if (el) W.name = el.value; modal = { html: welcomeHtml(W) }; showModal(modal); }
  else if (k === "wlang") { var el2 = document.getElementById("nm"); if (el2) W.name = el2.value; setLang(p[1]); modal = { html: welcomeHtml(W) }; showModal(modal); }
  else if (k === "wstart") {
    var el3 = document.getElementById("nm"); var nm = (el3 && el3.value.trim()) || "Chez Ama";
    var lg = S.lang, snd0 = S.sound; S = fresh(nm, W.diff); S.lang = lg; S.sound = snd0; S.tut = 1; newDay(); save();
    modal = { html: howTo() }; render();
  }
}
function setLang(l) { LANG = l === "en" ? "en" : "fr"; if (S) { S.lang = LANG; save(); } document.documentElement.lang = LANG; if (!modal) render(); }
function newGame() {
  var lg = S ? S.lang : LANG; S = fresh("Chez Ama", "normal"); S.lang = lg; newDay(); W = { name: "Chez Ama", diff: "normal" };
  modal = { html: welcomeHtml(W) }; save(); render();
}
document.addEventListener("click", function (e) {
  var el = e.target.closest("[data-a]"); if (!el || el.disabled) return;
  act(el.getAttribute("data-a"));
});

/* ----- démarrage ----- */
(function () {
  S = loadSave();
  if (!S) {
    S = fresh("Chez Ama", "normal"); newDay();
    try { S.lang = /^fr/i.test(navigator.language || "") ? "fr" : "en"; } catch (e) { S.lang = "fr"; }
    LANG = S.lang === "en" ? "en" : "fr";
    modal = { html: welcomeHtml(W) };
  } else { LANG = S.lang === "en" ? "en" : "fr"; if (!S.tut) modal = { html: welcomeHtml(W) }; }
  document.documentElement.lang = LANG;
  window.__S = function () { return S; };
  render();
  if ("serviceWorker" in navigator && /^https?:/.test(location.protocol)) { try { navigator.serviceWorker.register("sw.js"); } catch (e) {} }
})();
