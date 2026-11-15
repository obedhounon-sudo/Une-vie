# Guide : activer le paiement en ligne (FedaPay)

Quand tout est en place : l'école se connecte à son compte en ligne, appuie sur
« Payer par carte bancaire », paie sur la page FedaPay (Mobile Money ou carte selon ce que
votre compte FedaPay active), revient dans l'application et **elle se débloque seule pour 1 an**.

Prix encaissés en FCFA (modifiables dans `create-payment`, fonction `priceXof`) :
50 000 FCFA (zone FCFA) · 65 600 FCFA (= 100 €) · 60 000 FCFA (≈ 100 $ et autres pays).

Sur téléphone, ouvrez les sites en « version ordinateur ».

## 1. FedaPay
1. Dans votre tableau de bord FedaPay, restez d'abord en **mode Test (sandbox)**.
2. **Développeurs / API** : copiez votre **clé secrète** (`sk_sandbox_...` en test, `sk_live_...` en réel).
3. Pour le mode réel, finissez la vérification (KYC) de votre compte FedaPay et regardez
   dans les réglages quels moyens de paiement sont activés (Mobile Money, carte).

## 2. Base de données (Supabase › SQL Editor)
Copiez tout le fichier `paiement.sql` › New query › collez › **Run**
(« Success. No rows returned »). Il crée deux tables : `licences` et `licence_commandes`.

## 3. Les deux fonctions (Supabase › Edge Functions › Deploy a new function › Via Editor)
- Nom `create-payment` : collez `functions/create-payment/index.ts` › Deploy.
- Nom `fedapay-webhook` : collez `functions/fedapay-webhook/index.ts`. **Désactivez
  « Verify JWT »** (c'est FedaPay qui l'appelle, pas un utilisateur) › Deploy.

## 4. Les secrets (Supabase › Edge Functions › Secrets)
| Nom | Valeur |
|---|---|
| `FEDAPAY_SECRET_KEY` | votre clé secrète FedaPay (étape 1) |
| `FEDAPAY_ENV` | `sandbox` pour tester, puis `live` |
| `FEDAPAY_WEBHOOK_KEY` | un mot de passe long inventé par vous (lettres et chiffres, sans espace) |

(`SUPABASE_URL`, `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` existent déjà.)
Ne communiquez ces valeurs à personne.

## 5. Le webhook (FedaPay › Webhooks, appelé « Workbench » dans leur documentation)
Ajoutez un endpoint :
- **URL** : `https://lspyggjdspnsuvljrrav.supabase.co/functions/v1/fedapay-webhook?k=VOTRE_FEDAPAY_WEBHOOK_KEY`
  (remplacez la fin par la valeur exacte de `FEDAPAY_WEBHOOK_KEY`)
- **Événements** : au minimum `transaction.approved`
- Enregistrez. (Le webhook du mode Test et celui du mode Réel se configurent séparément.)

## 6. Test (en mode sandbox)
1. Installez l'application 1.0.15 ou plus récente et connectez-vous à un compte en ligne
   (Réglages › Compte en ligne).
2. Réglages › **Débloquer** › Payer par carte bancaire.
3. Payez avec les moyens de TEST indiqués par FedaPay (voir leur documentation « test »).
4. Revenez dans l'application : « Licence active jusqu'au … ». Sinon appuyez sur
   « J'ai payé : vérifier mon paiement ».
5. Dans Supabase › Table Editor › `licences`, la ligne du paiement apparaît.
6. Quand tout marche : `FEDAPAY_ENV` = `live`, clé secrète live, webhook live.

## En cas de problème
- « Paiement indisponible » : clé secrète absente/fausse ou `FEDAPAY_ENV` incorrect
  (Supabase › Edge Functions › Logs de `create-payment`).
- Payé mais pas débloqué : Logs de `fedapay-webhook` ; vérifiez l'URL (avec `?k=...` exact) et
  que l'événement `transaction.approved` est coché ; puis « J'ai payé : vérifier mon paiement ».
- L'école doit être **connectée** (compte en ligne) pour le déblocage automatique. Sans compte :
  virement / Mobile Money, puis code de licence envoyé à la main.
