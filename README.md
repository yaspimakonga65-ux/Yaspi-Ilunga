# Yaspi-Ilunga — SubTrack

Application multipage de gestion des abonnements, avec authentification Supabase et sauvegarde personnelle dans PostgreSQL.

## Pages
- `connexion.html` : connexion et création de compte par e-mail/mot de passe ; démonstration sans compte.
- `index.html` : budget par devise, répartition et échéances.
- `abonnements.html` : gestion, filtres, statuts, export et restauration CSV.
- `import.html` : détection locale des paiements récurrents dans les CSV, OFX/QFX et PDF texte.

## Développement et déploiement
```sh
npm ci
npm test
npm run dev
npm run build
```
Vercel : framework Vite, commande `npm run build`, sortie `dist`, Node.js 24. Les dépendances sont épinglées et le lockfile est inclus.

## Supabase
Projet : `jlolfcfdmrmxrbhcuker`. `assets/config.js` contient uniquement l’URL et une clé **publiable** destinée au navigateur. Aucune clé service-role ni aucun secret serveur ne se trouve dans le dépôt.

Le schéma est documenté dans `sql/schema.sql`. Les règles RLS limitent chaque espace à son propriétaire. Une version serveur empêche d’écraser une sauvegarde modifiée entre-temps sur un autre appareil. Les échecs de sauvegarde ne sont pas présentés comme des succès. Le test SQL `sql/verify_rls.sql` vérifie les lectures/écritures du propriétaire, l’isolation, le refus des accès anonymes et la gestion des versions, puis annule ses données techniques.

Les abonnements et le résumé des imports validés sont synchronisés. Les relevés bancaires et les opérations brutes sont traités sur l’appareil et ne sont pas envoyés à Supabase. Les PDF scannés ne sont pas pris en charge.

Pour transférer les données d’une ancienne adresse, exporter un CSV depuis l’ancienne application puis le restaurer dans Mes abonnements après connexion. Les espaces de démonstration ne sont jamais migrés automatiquement vers un compte.

## Authentification en production
Configurer l’URL du site et les redirections autorisées dans Supabase Auth pour le domaine Vercel. L’inscription conserve la confirmation de l’adresse e-mail. L’envoi aux destinataires externes nécessite un SMTP configuré dans Supabase si la restriction du service d’envoi par défaut s’applique.
