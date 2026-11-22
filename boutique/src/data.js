/* ===== Données du jeu Ma Boutique (marché de Lomé) ===== */
var KEY = "maboutique_v2";
var LANG = "fr";
function t(fr, en) { return LANG === "en" ? en : fr; }
function rnd(a, b) { return a + Math.random() * (b - a); }
function ri(a, b) { return Math.floor(rnd(a, b + 1)); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function r5(x) { return Math.max(5, Math.round(x / 5) * 5); }
function money(n) {
  n = Math.round(n);
  var s = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, LANG === "en" ? "," : " ");
  return (n < 0 ? "-" : "") + s + " F";
}
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

/* Produits : lvl = niveau de boutique requis (0 stand, 1 boutique, 2 supermarché), w = place prise par vente */
var PRODUCTS = [
  { id: "riz", ico: "🍚", fr: "Riz (1 kg)", en: "Rice (1 kg)", cost: 480, price: 600, demand: 30, lvl: 0, w: 1 },
  { id: "huile", ico: "🛢️", fr: "Huile (1 L)", en: "Oil (1 L)", cost: 960, price: 1200, demand: 15, lvl: 0, w: 1 },
  { id: "tomate", ico: "🍅", fr: "Tomates (panier)", en: "Tomatoes (basket)", cost: 650, price: 900, demand: 20, lvl: 0, w: 1, perish: true },
  { id: "pates", ico: "🍝", fr: "Spaghetti", en: "Spaghetti", cost: 270, price: 350, demand: 22, lvl: 0, w: 1 },
  { id: "sucre", ico: "🍬", fr: "Sucre (1 kg)", en: "Sugar (1 kg)", cost: 630, price: 750, demand: 14, lvl: 0, w: 1 },
  { id: "savon", ico: "🧼", fr: "Savon", en: "Soap", cost: 165, price: 250, demand: 25, lvl: 0, w: 1 },
  { id: "credit", ico: "📱", fr: "Crédit téléphone (1000)", en: "Phone credit (1000)", cost: 960, price: 1000, demand: 20, lvl: 0, w: 0.5 },
  { id: "eau", ico: "💧", fr: "Eau en sachet", en: "Water sachet", cost: 28, price: 50, demand: 70, lvl: 1, w: 0.3 },
  { id: "pain", ico: "🥖", fr: "Pain frais", en: "Fresh bread", cost: 130, price: 200, demand: 40, lvl: 1, w: 1, perish: true },
  { id: "piles", ico: "🔋", fr: "Piles et lampes", en: "Batteries & lamps", cost: 110, price: 175, demand: 16, lvl: 1, w: 0.7 },
  { id: "cahier", ico: "📓", fr: "Cahiers et stylos", en: "Notebooks & pens", cost: 100, price: 175, demand: 12, lvl: 1, w: 0.7 },
  { id: "lait", ico: "🥛", fr: "Lait en poudre", en: "Powdered milk", cost: 740, price: 900, demand: 10, lvl: 1, w: 1 },
  { id: "jus", ico: "🥤", fr: "Boissons fraîches", en: "Cold drinks", cost: 330, price: 500, demand: 24, lvl: 1, w: 1, fridge: true }
];
function prod(id) { for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i]; return null; }

var SHOPS = [
  { fr: "Petit stand", en: "Small stall", mult: 1, rent: 1800, cap: 80 },
  { fr: "Boutique", en: "Shop", mult: 1.25, rent: 6000, cap: 140 },
  { fr: "Supermarché", en: "Supermarket", mult: 1.6, rent: 20000, cap: 220 }
];
var SHOP_COST = [0, 120000, 600000];
var GOAL = 4000000;

var SUPS = [
  { id: 0, ico: "👵🏾", fr: "Mama Akouvi", en: "Mama Akouvi", dfr: "Grand Marché : prix doux, mais parfois en rupture", den: "Grand Market: gentle prices, sometimes out of stock", m: 0.97, av: 0.85, pack: 1 },
  { id: 1, ico: "🧔🏾", fr: "Kossi & Fils", en: "Kossi & Sons", dfr: "Fiable, toujours en stock, prix normaux", den: "Reliable, always in stock, normal prices", m: 1.0, av: 0.98, pack: 1 },
  { id: 2, ico: "🚢", fr: "Port de Lomé", en: "Port of Lomé", dfr: "Import en gros : -8 %, par lots de 10 (boutique requise)", den: "Bulk import: -8%, lots of 10 (shop required)", m: 0.92, av: 0.8, pack: 10, lvl: 1 }
];

var MONTHS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
var MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var WD_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
var WD_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/* Jours spéciaux (mois 0-11, jours du mois) */
var SPECIALS = [
  { m: 0, a: 1, b: 1, fr: "Nouvel An", en: "New Year", all: 1.3, jus: 1.6 },
  { m: 3, a: 27, b: 27, fr: "Fête de l'Indépendance", en: "Independence Day", all: 1.25, jus: 1.5 },
  { m: 5, a: 14, b: 16, fr: "Fête de Tabaski", en: "Tabaski feast", all: 1.3, riz: 1.6, huile: 1.6 },
  { m: 8, a: 1, b: 14, fr: "Rentrée des classes", en: "Back to school", cahier: 4, pain: 1.2, jus: 1.2 },
  { m: 11, a: 24, b: 25, fr: "Noël", en: "Christmas", all: 1.4, riz: 1.7, huile: 1.7, jus: 1.8 },
  { m: 11, a: 31, b: 31, fr: "Réveillon", en: "New Year's Eve", all: 1.35, jus: 1.8 }
];

var NEWS = [
  ["Radio Lomé : « Le marché d'Adawlato sera très animé ce week-end. »", "Radio Lomé: \"Adawlato market will be very busy this weekend.\""],
  ["À la radio : une chanson de Lomé passe en boucle. Les clients fredonnent.", "On the radio: a Lomé hit plays on a loop. Customers hum along."],
  ["Un zémidjan klaxonne devant la boutique et vous salue.", "A zémidjan taxi honks in front of the shop and waves."],
  ["Une voisine vous apporte des beignets chauds : « Pour porter bonheur ! »", "A neighbor brings you hot beignets: \"For good luck!\""],
  ["Les enfants du quartier jouent au foot juste devant votre étal.", "Neighborhood kids play football right in front of your stall."],
  ["Radio : « Le prix du riz reste stable cette semaine. »", "Radio: \"Rice prices stay stable this week.\""],
  ["Un vieux client vous raconte comment le quartier a changé.", "An old customer tells you how the neighborhood has changed."],
  ["Le muezzin et les cloches se répondent : il est déjà l'heure d'ouvrir.", "The call to prayer and the church bells answer each other: time to open."],
  ["Un camion klaxonne dans l'embouteillage de Bè. Vous souriez.", "A truck honks in the Bè traffic jam. You smile."],
  ["Vous préparez votre étal en écoutant le ronronnement des motos.", "You set up your stall listening to the hum of motorbikes."],
  ["Mama Akouvi vous fait signe : « Passe me voir, j'ai du bon riz ! »", "Mama Akouvi waves: \"Come see me, I have good rice!\""],
  ["Un client plaisante : « Chez toi, c'est mieux que le supermarché ! »", "A customer jokes: \"Your place beats the supermarket!\""]
];

/* Météo */
var WX = {
  sun: { ico: "☀️", fr: "Ensoleillé", en: "Sunny", dem: 1, jus: 1.1 },
  hot: { ico: "🔥", fr: "Grosse chaleur", en: "Very hot", dem: 0.97, jus: 1.35, eau: 1.3 },
  rain: { ico: "🌧️", fr: "Pluie", en: "Rain", dem: 0.72, jus: 0.7, eau: 0.7 },
  harm: { ico: "🌫️", fr: "Harmattan (poussière)", en: "Harmattan (dust)", dem: 0.95, savon: 1.15, jus: 0.7, eau: 0.9 }
};
function seasonOf(m) {
  if (m === 11 || m === 0 || m === 1) return "harm";
  if (m === 2 || m === 3) return "hot";
  if (m >= 4 && m <= 6 || m === 8 || m === 9) return "rainy";
  return "dry";
}
function rollWeather(m) {
  var s = seasonOf(m), x = Math.random();
  if (s === "harm") return x < 0.8 ? "harm" : "sun";
  if (s === "hot") return x < 0.55 ? "hot" : x < 0.9 ? "sun" : "rain";
  if (s === "rainy") return x < 0.45 ? "rain" : x < 0.8 ? "sun" : "hot";
  return x < 0.1 ? "rain" : x < 0.7 ? "sun" : "hot";
}

/* Personnel */
var STAFF_NAMES = ["Ama", "Koffi", "Yawa", "Kodjo", "Afi", "Komla", "Essi", "Mawuli", "Abla", "Sena", "Kwami", "Dédé"];
var TRAITS = {
  fast: { ico: "⚡", fr: "Rapide", en: "Fast", dfr: "+50 ventes servies par jour", den: "+50 sales served per day", cap: 50, wage: 2200 },
  honest: { ico: "🤝", fr: "Honnête", en: "Honest", dfr: "Protège du vol, +30 ventes", den: "Prevents theft, +30 sales", cap: 30, wage: 2000 },
  charm: { ico: "😊", fr: "Charmeuse", en: "Charming", dfr: "Gagne de la réputation chaque jour", den: "Earns reputation every day", cap: 30, wage: 2200 },
  manager: { ico: "📋", fr: "Gestionnaire", en: "Manager", dfr: "Réduit les pertes de produits frais", den: "Cuts fresh-goods losses", cap: 25, wage: 2500 }
};

/* Améliorations uniques */
var UPS = [
  { id: "sign", ico: "🪧", fr: "Enseigne lumineuse", en: "Bright sign", dfr: "+12 % de clients.", den: "+12% customers.", c: 15000 },
  { id: "fridge", ico: "🧊", fr: "Frigo", en: "Fridge", dfr: "Les produits frais se gâtent peu. Débloque les boissons. 300 F/jour d'électricité.", den: "Fresh goods rarely spoil. Unlocks cold drinks. 300 F/day electricity.", c: 40000 },
  { id: "gen", ico: "⚙️", fr: "Groupe électrogène", en: "Generator", dfr: "Protège des coupures de courant (carburant 500 F les jours de coupure).", den: "Protects against power cuts (fuel 500 F on cut days).", c: 25000 },
  { id: "solar", ico: "🔆", fr: "Panneau solaire", en: "Solar panel", dfr: "Plus de coupures, électricité du frigo gratuite.", den: "No more power cuts, free fridge electricity.", c: 80000, lvl: 1 },
  { id: "moto", ico: "🛵", fr: "Moto de livraison", en: "Delivery moto", dfr: "+15 % de clients. 800 F/jour de carburant.", den: "+15% customers. 800 F/day fuel.", c: 35000, lvl: 1 },
  { id: "cam", ico: "📹", fr: "Caméra de surveillance", en: "Security camera", dfr: "Réduit fortement les vols.", den: "Greatly reduces theft.", c: 12000 },
  { id: "card", ico: "💳", fr: "Cartes de fidélité", en: "Loyalty cards", dfr: "La réputation monte plus vite.", den: "Reputation grows faster.", c: 10000 },
  { id: "book", ico: "📒", fr: "Cahier de comptes", en: "Account book", dfr: "Affiche la prévision de demande et le bénéfice estimé par produit.", den: "Shows demand forecast and estimated profit per product.", c: 5000 },
  { id: "mmk", ico: "📲", fr: "Kiosque Mobile Money (T-Money / Flooz)", en: "Mobile Money kiosk (T-Money / Flooz)", dfr: "Gagnez une commission sur les transferts. Il faut une réserve de float.", den: "Earn commission on transfers. You need a float reserve.", c: 30000, lvl: 1 }
];
function upDef(id) { for (var i = 0; i < UPS.length; i++) if (UPS[i].id === id) return UPS[i]; return null; }

/* Succès */
var ACHS = [
  { id: "first", ico: "🎉", fr: "Premier jour", en: "First day", dfr: "Terminez votre premier jour.", den: "Finish your first day.", test: function (S) { return S.day > 1; }, rew: 1000 },
  { id: "week", ico: "📅", fr: "Une semaine !", en: "One week!", dfr: "Tenez 7 jours.", den: "Last 7 days.", test: function (S) { return S.day > 7; }, rew: 2000 },
  { id: "month", ico: "🗓️", fr: "Un mois", en: "One month", dfr: "Tenez 30 jours.", den: "Last 30 days.", test: function (S) { return S.day > 30; }, rew: 5000 },
  { id: "year", ico: "🎂", fr: "Un an de commerce", en: "One year in business", dfr: "Tenez 360 jours.", den: "Last 360 days.", test: function (S) { return S.day > 360; }, rew: 30000 },
  { id: "k100", ico: "💵", fr: "100 000 F en caisse", en: "100,000 F in cash", dfr: "", den: "", test: function (S) { return S.cash >= 100000; }, rew: 3000 },
  { id: "m1", ico: "💰", fr: "Millionnaire", en: "Millionaire", dfr: "1 000 000 F en caisse.", den: "1,000,000 F in cash.", test: function (S) { return S.cash >= 1000000; }, rew: 20000 },
  { id: "shop", ico: "🏪", fr: "Une vraie boutique", en: "A real shop", dfr: "Agrandissez en boutique.", den: "Expand into a shop.", test: function (S) { return S.lvl >= 1; }, rew: 5000 },
  { id: "super", ico: "🏬", fr: "Supermarché !", en: "Supermarket!", dfr: "Devenez un supermarché.", den: "Become a supermarket.", test: function (S) { return S.lvl >= 2; }, rew: 30000 },
  { id: "fr", ico: "🧊", fr: "Au frais", en: "Keeping cool", dfr: "Achetez un frigo.", den: "Buy a fridge.", test: function (S) { return S.up.fridge; }, rew: 2000 },
  { id: "team", ico: "👥", fr: "Chef d'équipe", en: "Team leader", dfr: "Ayez 3 employés.", den: "Have 3 employees.", test: function (S) { return S.staff.length >= 3; }, rew: 5000 },
  { id: "rep", ico: "⭐", fr: "Réputation 90", en: "Reputation 90", dfr: "Atteignez 90 de réputation.", den: "Reach 90 reputation.", test: function (S) { return S.rep >= 90; }, rew: 5000 },
  { id: "k1", ico: "🛒", fr: "1 000 ventes", en: "1,000 sales", dfr: "", den: "", test: function (S) { return S.sold >= 1000; }, rew: 2000 },
  { id: "k10", ico: "🧺", fr: "10 000 ventes", en: "10,000 sales", dfr: "", den: "", test: function (S) { return S.sold >= 10000; }, rew: 15000 },
  { id: "mm", ico: "📲", fr: "Agent Mobile Money", en: "Mobile Money agent", dfr: "Ouvrez un kiosque.", den: "Open a kiosk.", test: function (S) { return S.up.mmk; }, rew: 3000 },
  { id: "miss", ico: "🎯", fr: "Missions réussies ×10", en: "10 missions done", dfr: "Réussissez 10 missions du jour.", den: "Complete 10 daily missions.", test: function (S) { return S.missDone >= 10; }, rew: 8000 },
  { id: "empire", ico: "👑", fr: "Empire", en: "Empire", dfr: "Ouvrez une succursale.", den: "Open a branch.", test: function (S) { return S.branches >= 1; }, rew: 50000 }
];

var DIFF = {
  easy: { fr: "Facile", en: "Easy", cash: 40000, rent: 0.8, ev: 0.3 },
  normal: { fr: "Normal", en: "Normal", cash: 25000, rent: 1, ev: 0.4 },
  hard: { fr: "Difficile", en: "Hard", cash: 15000, rent: 1.25, ev: 0.5 }
};
