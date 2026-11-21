# Traduction du jeu « Une Vie » — consignes pour l'IA

## Contexte
« Une Vie » est un jeu de simulation de vie (sobre, réaliste, vouvoiement, ton littéraire sans excès).
Il manque la traduction de ~4 000 textes français vers **3 langues** : anglais (`en`), espagnol (`es`, neutre latino-américain) et portugais (`pt`, Brésil).

## Ce que tu reçois
- Le dossier `lots/` : N petits fichiers `p_001.json` … (60 textes chacun).
  Chaque fichier est un objet JSON : `{ "texte français": "" }`.

## Ce que tu dois produire
Pour **chaque** petit fichier, un fichier `resultat_p_XXX.json` (même numéro) :
```json
{
  "texte français EXACT (clé inchangée)": { "en": "…", "es": "…", "pt": "…" }
}
```
- Mêmes clés que le lot, aucune omission, aucun ajout.
- JSON valide, UTF-8, caractères accentués non échappés.

## Règles de traduction
1. Garde **identiques** les marqueurs entre accolades : `{0}`, `{1}`, `{ami}`, `{pe}`, `{m}`, etc. (mêmes noms, même nombre). Ils sont remplacés par le jeu (prénoms, pronoms, accords).
2. Garde les emojis, les chiffres, les `€` (ex. « 60 € » reste « 60 € » : le jeu convertit la monnaie tout seul).
3. Les formes inclusives françaises « (e) », « sain(e) et sauf(ve) » : utilise la forme naturelle de la langue cible (ex. en : forme neutre ; es : « sano(a) y salvo(a) » ; pt : « são(ã) e salvo(a) »).
4. Les textes de boutons / choix doivent rester courts (même longueur approximative).
5. Le joueur est tutoyé nulle part : en `es` utilise « usted » ou un neutre impersonnel ; en `pt` utilise « você ».
6. Si une entrée n'est pas un vrai texte du jeu (code, identifiant), recopie-la telle quelle dans les 3 langues.
7. Ne mets aucun commentaire, aucune explication dans les fichiers.

## Méthode conseillée
Traite un lot à la fois ; après chaque lot, vérifie avec un petit script que les clés sont identiques à celles du lot et que les marqueurs `{…}` de chaque traduction sont identiques à ceux de la clé.

## Retour
Renvoie les fichiers `resultat_p_001.json`, `resultat_p_002.json`, etc. (même numéro que le lot) (ou un zip). Je les fusionnerai avec `merge.py` (qui rejette automatiquement toute entrée invalide).

## IMPORTANT : taille des réponses
Chaque fichier de résultat doit rester **sous 20 000 caractères** (c'est pourquoi les lots sont petits : 60 textes). Si l'IA a une limite de réponse, qu'elle traite **un petit fichier par message**, et qu'elle livre chaque résultat **comme un fichier .json téléchargeable** (à envoyer comme pièce jointe, pas collé en texte), sinon il est coupé.
