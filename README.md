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


## Inscription et récupération

Le formulaire gère la création de compte, la confirmation d’adresse, le renvoi du
message, la connexion et la récupération du mot de passe. Une récupération ouvre
le choix d’un nouveau mot de passe avant toute entrée dans l’application.

Supabase doit être actif. Garder Confirm email activé et configurer Custom SMTP
pour envoyer aux utilisateurs extérieurs à l’équipe (le service intégré est limité).
Dans Authentication > URL Configuration, définir Site URL à
https://subtrack-yaspi.vercel.app et autoriser explicitement
https://subtrack-yaspi.vercel.app/connexion.html et
https://subtrack-yaspi.vercel.app/connexion.html?recovery=1. Les confirmations
demandées depuis localhost reviennent sur cette version en ligne.
Ne jamais committer les identifiants SMTP.

## Installation et version locale

Un manifeste et un service worker permettent d’installer l’application via le
navigateur. Seuls les fichiers publics de l’application sont mis en cache, jamais
les réponses API ni les données des comptes. Le mode `?local=1` est séparé de la
démonstration et des comptes synchronisés. Il fonctionne dans le navigateur sans
compte ni Internet une fois les fichiers disponibles. Il ne fusionne pas les données
automatiquement avec un compte. Exporter en CSV avant de changer d’appareil.

`npm run build` produit également `dist/subtrack-local.zip`, téléchargeable depuis
la connexion. Ce paquet précompilé nécessite seulement Node.js LTS, sans installation
de dépendances. Décompresser puis lancer `Demarrer-Windows.cmd` ou
`sh demarrer-mac-linux.sh`. URL : http://localhost:4173/connexion.html.
Le serveur écoute uniquement sur 127.0.0.1.
