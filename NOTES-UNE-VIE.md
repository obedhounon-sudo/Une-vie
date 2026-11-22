# Une Vie — notes de projet (à lire en début de nouvelle conversation)

Utilisateur francophone (Togo, téléphone uniquement). Répondre en français, concis, honnête sur les limites.
Habitude : après une mise à jour → push GitHub (obedhounon-sudo/Une-vie), republier si besoin, envoyer l'APK.

## Liens
- Web : https://obedhounon-sudo.github.io/Une-vie/
- itch.io (page du jeu) : https://obedklein.itch.io/une-vie  (profil : https://obedklein.itch.io/)
- Uptodown : https://une-vie.en.uptodown.com/android
- APK courant : release test-35 (une-vie-1.0.35.apk), construit par .github/workflows/build.yml à chaque push sur main.
- Un push sur main déclenche un build ; mettre « [skip ci] » dans le message pour l'éviter.

## Jeu (index.html, fichier unique ~9500 lignes)
- Langues : français (source), anglais, espagnol, portugais (Brésil). Dictionnaires EN/ES/PT = blocs `Object.assign(EN|ES|PT, {...})` ; clés = textes français. `T(s)` : langue → dictionnaire, repli EN, sinon français. `pickLang`, `setLang`, onglet Réglages > Langue (Auto/Français/English/Español/Português).
- Manquant : ~3 700 textes français (surtout événements récents, ex. enfance « ec_* ») ne sont traduits dans aucune langue.
- Pubs : Unity Ads (gameId 800433452, placements Rewarded_Android / Interstitial_Android) + AdMob ajouté (plugin android-plugin/AdmobPlugin.java, nom « AdmobBridge »).
  - ID application AdMob : ca-app-pub-8084516023976901~7245883743 (injecté dans le manifeste par le workflow).
  - À FAIRE : l'utilisateur doit créer dans AdMob un bloc Récompensée et un bloc Interstitielle et donner leurs IDs (avec « / »). Les mettre dans `ADS.admob = { rewarded: "", inter: "" }` (index.html, section PUBLICITÉS). Tant que vides → Unity seul. Application AdMob en « Examen requis ».
- Version « jam/ » : copie avec graphismes en images (emoji PNG), HTML.

## Reprise de la traduction (dossier traduction/)
- lots/p_001…p_062.json : petits lots de 60 textes {français: ""}.
- resultats/resultat_p_001…036.json : déjà traduits (en/es/pt) et validés (2 160 textes) ; resultat_partiel_5_7.json (239 textes valides récupérés).
- resultats/resultat_lot_01…04.json : 4 anciens lots (≈990 textes) déjà traduits, même format.
- À traduire : p_037…p_062 (non faits). Rien n'est encore fusionné dans index.html : lancer merge.py sur tout le dossier resultats/ (total prêt ≈3 400 textes sur ≈4 900).
- Format de résultat : {"texte français": {"en":"…","es":"…","pt":"…"}} ; règles dans traduction/LISEZ-MOI.md.
- Fusion : `python3 traduction/merge.py index.html traduction/resultats` (valide les marqueurs {…}, ajoute des blocs Object.assign EN/ES/PT). Puis tester (Playwright, locale es-ES/pt-BR), pousser, envoyer l'APK.
- Une autre IA peut traiter les lots (limite : fichiers de résultat < 20 000 caractères à renvoyer en pièce jointe).

## Autre projet
- Reçus Scolaires : voir recus/NOTES-PROJET.md.
