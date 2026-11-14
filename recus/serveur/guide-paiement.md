# Guide : activer le paiement en ligne (Flutterwave)

Quand tout est en place : l'école se connecte à son compte en ligne, appuie sur
« Payer par carte bancaire », paie sur la page Flutterwave, revient dans l'application
et **elle se débloque seule pour 1 an**. Vous n'avez plus rien à envoyer.

Prix fixés côté serveur (l'application ne peut pas les changer) :
50 000 FCFA (XOF / XAF) · 100 € · 100 $ (tous les autres pays).

Vous aurez besoin de : votre projet Supabase (déjà utilisé pour la synchronisation)
et un compte Flutterwave. Sur téléphone, ouvrez les sites en « version ordinateur ».

## 1. Compte Flutterwave
1. Créez un compte sur https://dashboard.flutterwave.com (choisissez le Togo).
2. Complétez la vérification de votre activité (pièce d'identité, compte bancaire ou
   Mobile Money pour recevoir l'argent). Tant qu'elle n'est pas terminée, restez en
   **mode test** (interrupteur « Test mode » en haut) : rien n'est débité.
3. Menu **Settings › API** : copiez la **Secret key** (commence par `FLWSECK_`).

## 2. Base de données (Supabase › SQL Editor)
1. Ouvrez le fichier `paiement.sql`, copiez tout le texte.
2. Supabase › **SQL Editor** › New query › collez › **Run**.
   Message attendu : « Success. No rows returned ».

## 3. Les deux fonctions (Supabase › Edge Functions)
Pour chacune : **Deploy a new function › Via Editor**, puis collez le code du fichier.
- Nom `create-payment` : collez `functions/create-payment/index.ts` › Deploy.
- Nom `flw-webhook` : collez `functions/flw-webhook/index.ts`. **Désactivez
  « Verify JWT »** (c'est Flutterwave qui l'appelle, pas un utilisateur) › Deploy.

## 4. Les secrets (Supabase › Edge Functions › Secrets)
Ajoutez :
| Nom | Valeur |
|---|---|
| `FLW_SECRET_KEY` | la Secret key de Flutterwave (étape 1) |
| `FLW_WEBHOOK_HASH` | un mot de passe long inventé par vous (ex. 30 lettres et chiffres) |

(`SUPABASE_URL`, `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` existent déjà.)
Ne communiquez ces valeurs à personne, ne les mettez jamais dans l'application.

## 5. Le webhook (Flutterwave › Settings › Webhooks)
- **URL** : `https://lspyggjdspnsuvljrrav.supabase.co/functions/v1/flw-webhook`
- **Secret hash** : exactement la même valeur que `FLW_WEBHOOK_HASH`
- Cochez les notifications de paiement (charge completed) › Save.

## 6. Test
1. Installez la dernière version de l'application, connectez-vous à un compte en ligne
   (Réglages › Compte en ligne).
2. Ajoutez 301 élèves (ou appuyez sur Réglages › Débloquer) › **Payer par carte bancaire**.
3. En mode test, utilisez la carte de test Flutterwave : `5531 8866 5214 2950`,
   expiration `09/32`, CVV `564`, code PIN `3310`, OTP `12345`.
4. Revenez dans l'application : « Licence active jusqu'au … ».
5. Dans Supabase › Table Editor › `licences`, la ligne du paiement apparaît.
6. Quand tout marche : passez Flutterwave en **mode live** et remplacez `FLW_SECRET_KEY`
   par la clé live.

## En cas de problème
- « Paiement indisponible » : `FLW_SECRET_KEY` absente ou fausse, ou `create-payment`
  non déployée (Supabase › Edge Functions › Logs).
- Payé mais pas débloqué : regardez les Logs de `flw-webhook` ; vérifiez que l'URL et le
  secret hash du webhook sont exacts, puis appuyez sur « J'ai payé : vérifier mon paiement ».
- L'école doit être **connectée** (compte en ligne) pour que le déblocage soit automatique.
  Sans compte : virement / Mobile Money, puis envoi d'un code de licence à la main.
