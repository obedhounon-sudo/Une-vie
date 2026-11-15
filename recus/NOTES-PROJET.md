# Reçus Scolaires : notes de projet (pour reprendre dans une nouvelle discussion)

Auteur : Obed Hounon (@obedklein). Dépôt : https://github.com/obedhounon-sudo/Une-vie
(ce fichier ne contient AUCUN secret : clés, mots de passe et codes de licence sont dans le dossier privé de l'auteur).

## Liens
- Version web : https://obedhounon-sudo.github.io/Une-vie/recus/
- Téléchargements (APK signé, Windows) : https://github.com/obedhounon-sudo/Une-vie/releases
  (APK : tags `recus-N`, fichier `recus-scolaires-1.0.N.apk` ; Windows : tags `recus-win-N`)
- Dernière version au moment de ces notes : APK 1.0.18 (`recus-18`), Windows `recus-win-12`.
- Jeu « Une Vie » : https://obedhounon-sudo.github.io/Une-vie/ ; version « images » (HTML5, graphismes en PNG) : /jam/
- Autres : itch.io https://obedklein.itch.io/ · Instagram https://www.instagram.com/obedklein/ · Buy Me a Coffee https://buymeacoffee.com/obedhounonl
- Uptodown : « Une Vie » est publiée (https://une-vie.en.uptodown.com/android). Reçus Scolaires : fiche en brouillon, paquet `com.ecolerecus.paiements`,
  fichier 1.0.13 « en attente d'examen », bouton « Soumettre pour examen » grisé (image en vedette 1024×500 fournie : `docs/image-en-vedette-1024x500.png`).
  Compte Uptodown = e-mail obedhounon@gmail.com (pas obiklein07@gmail.com).

## L'application
Application d'une seule page HTML/JS (aucune dépendance). Données dans le téléphone (localStorage), synchronisation facultative.
Fonctions : classes et élèves (import Excel/CSV), paiements par tranches, reçus (A4/A5/ticket 58 mm) avec logo, QR code, code de contrôle,
PDF fait maison, rapport de caisse, liste des impayés imprimable, annulation de reçu, vérification de reçu, codes Direction/Caisse,
sauvegarde/restauration, compte en ligne (Supabase) multi-appareils, pays/devises (60 pays, Mobile Money par pays),
modes Espèces / Mobile Money / Carte bancaire / Virement / Chèque, interface Français + English, mise en page PC,
licence : gratuit jusqu'à 300 élèves, au-delà licence d'1 an (code EC-XXXXXX-XXX ou paiement en ligne).

## Code source (dans `recus/src/`)
- `app.js` (logique), `qr.js` (encodeur QR), `index.v2.html` (page/CSS de base), `build.py` (assemble tout en `index.html`).
- Construire : `cd recus/src && python3 build.py && cp index.html ../index.html`.
- `i18n-en.py` : dictionnaire français → anglais (W = texte exact, S = fragments). Le bloc `var I18N=` d'app.js est généré depuis ce fichier
  (json.dumps de {"en":{"w":W,"s":S}}). Autre langue = un second dictionnaire.
- `tests/` : scripts Playwright (lcard, lowed, lexp, lunl, lpay, len, lreg) et `whtest2.js` (test des fonctions serveur avec faux FedaPay).
  Lancer avec `NODE_PATH=$(npm root -g) node tests/xxx.js` ; ils pointent vers /home/claude/recus/index.html (à adapter).
- Pièges connus : tout le code est dans une fonction fermée (pour tester, injecter `window.__t`) ; `T` est déjà une variable, la
  fonction de traduction s'appelle `TT` ; apostrophes à échapper dans les chaînes JS entre quotes simples.
- Données : db{school,classes,students,payments,pins,license,licDate,licUsed,licOnline,salt,seq,…}.
- Packaging : Capacitor (Android, `.github/workflows/build-recus.yml`, signé avec les secrets GitHub KEYSTORE_BASE64 / KEYSTORE_PASSWORD / KEY_ALIAS)
  et Electron (Windows, `build-recus-windows.yml`). Un `git push` touchant `recus/` déclenche les builds et crée une release.
  Pour pousser sans compiler : mettre `[skip ci]` dans le message de commit.

## Paiement en ligne (FedaPay) : état
Flutterwave n'est pas disponible au Togo → FedaPay choisi (l'auteur a un compte, inscription en cours).
- Code serveur prêt dans `recus/serveur/` : `paiement.sql`, `functions/create-payment`, `functions/fedapay-webhook`, `guide-paiement.md` (pas à pas).
- Côté application (déjà livrée) : bouton « Payer par carte bancaire » (compte en ligne requis) → lien FedaPay → retour → licence débloquée 1 an ;
  « J'ai payé : vérifier mon paiement » ; la licence en ligne est relue depuis la table `licences` à chaque synchronisation.
- Prix encaissés en FCFA : 50 000 (zone FCFA), 65 600 (=100 €), 60 000 (≈100 $ / autres).
- Rien n'est encore installé côté Supabase/FedaPay : à faire = exécuter le SQL, déployer les 2 fonctions (Verify JWT désactivé pour le webhook),
  3 secrets (FEDAPAY_SECRET_KEY, FEDAPAY_ENV, FEDAPAY_WEBHOOK_KEY), webhook FedaPay `…/functions/v1/fedapay-webhook?k=<clé>` (événement transaction.approved), test en sandbox puis live.
- Points non confirmés par la doc FedaPay : cartes bancaires activées sur le compte ? forme exacte des réponses API (le code accepte 2 formes).
- Formulaire FedaPay : site = lien de la version web ci-dessus ; téléphone = 8 chiffres sans +228.
- Supabase du projet : https://lspyggjdspnsuvljrrav.supabase.co (table ecole_saves + licences) ; guide de synchronisation : `serveur/guide-serveur.md`.

## À faire / idées (par priorité conseillée)
1. Terminer FedaPay (ci-dessus) et tester un vrai paiement en sandbox.
2. Plusieurs frais par élève (inscription, cantine, transport…), remises/bourses, passage à l'année suivante avec reports.
3. Rappel WhatsApp/SMS aux parents en retard (message prérempli).
4. Espagnol et portugais (même méthode que l'anglais), centimes pour EUR/USD/GBP.
5. Journal des actions, statistiques, page de vérification publique des reçus, serveur de licences (les codes manuels restent falsifiables).
6. Uptodown : débloquer la soumission (ou écrire au support via le formulaire, message préparé), puis version 1.0.18 (bilingue + FedaPay).
7. Politique de confidentialité propre à Reçus Scolaires (celle du jeu : https://obedhounon-sudo.github.io/Une-vie/confidentialite.html).
8. Page itch.io pour l'appli : zip HTML5 (index.html seul), classification « Tools », puis post forum (texte préparé : voir `docs/` et l'historique).

## Textes et visuels prêts
- `docs/captures/` : 6 captures 1079×1918 ; `docs/couverture-*.png` : couvertures (1024×500 Play Store/Uptodown, 1280×720 réseaux).
  Générateur : `docs/c.html` + `docs/shot.js`.
- Slogan : « Les frais de scolarité, sans papier. » Description courte : « Gérez les frais de scolarité et éditez des reçus avec QR code. Gratuit jusqu'à 300 élèves. »
- Signature obligatoire sur les reçus/PDF : « Reçus Scolaires · @obedklein » (masquable dans les Réglages).

## Environnement (limites rencontrées)
- Le shell n'atteint que GitHub et les registres de paquets ; `gh` ne peut pas créer de dépôt ni de secrets ; SendUserFile limité à 30 Mo
  (l'installateur Windows de 81 Mo se télécharge depuis les Releases).
- Dossier privé de l'auteur (hors dépôt) : clé de signature `une-vie.jks` + mot de passe + `keystore-base64.txt`, codes de licence (30), fiche Uptodown.
