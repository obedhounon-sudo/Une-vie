# Serveur de Reçus Scolaires (5 minutes)

On réutilise ton projet Supabase déjà créé pour le jeu. Les données des écoles sont dans une table à part (`ecole_saves`), séparée des parties du jeu.

1. Ouvre https://supabase.com/dashboard et choisis ton projet.
2. Menu de gauche : **SQL Editor** > **New query**.
3. Colle tout le contenu de `recus-serveur.sql`, puis appuie sur **Run**. Le message « Success » doit apparaître.
4. Dans l'application : **Réglages > Compte en ligne**, crée le compte de l'école (e-mail + mot de passe).
5. Sur un autre téléphone ou sur le PC : installe l'application, va dans **Réglages > Compte en ligne** et connecte-toi avec le même e-mail. Les élèves, paiements et réglages arrivent tout seuls.

Bon à savoir
- Un compte = une école. Chaque école doit avoir son propre compte (son propre e-mail).
- Si tu as activé « Confirm email » dans Supabase (Authentication > Providers > Email), chaque compte doit confirmer son e-mail avant de se connecter. Pour tester vite, tu peux désactiver cette option.
- Les données sont isolées par compte : une école ne peut jamais lire les données d'une autre.
- Les codes Direction et Caisse sont synchronisés : après connexion, l'appareil de la caissière demande directement son code.
