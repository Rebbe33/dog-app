# Vanya App

Refonte complète de l'app de dressage/suivi du chien. React + Vite + Supabase + Vercel, dans le même projet Supabase que `gite-app` (tables préfixées `dog_`).

## Mise en place

1. **Supabase** (projet existant, partagé avec gite-app) :
   ```bash
   supabase link --project-ref <ton-project-ref>
   supabase db push   # applique supabase/migrations/0001_dog_app_schema.sql
   psql <connection-string> -f supabase/migrations/0002_seed_data.sql   # migre les 103 tours + autocontrôle + catégories de départ
   ```
   Adapter d'abord les policies RLS de `0001_dog_app_schema.sql` si ton modèle d'accès diffère de "utilisateur authentifié = accès complet" (regarde comment c'est fait sur gite-app pour rester cohérente).

2. **Projet local** :
   ```bash
   npm install
   cp .env.example .env
   # renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
   npm run dev
   ```

3. **Déploiement** : connecter le repo à Vercel comme pour gite-app, renseigner les mêmes variables d'environnement dans les settings du projet Vercel.

## Où en est la réflexion

Le détail complet des fonctionnalités, écrans et choix de modélisation est dans `docs/structure.md` (copie du document de planification). Résumé :

- **Modèle unifié** `dog_tricks` / `dog_trick_steps` pour tours, autocontrôle, éducation de base et objectifs d'activités — une liste d'étapes personnalisées par élément plutôt qu'un arbre générique.
- **Anxiété en priorité** : déclencheurs réutilisables, journal d'épisodes, protocole de désensibilisation par paliers (activable au cas par cas), boîte à techniques.
- **Activités** : catalogue + séances + alerte météo automatique selon un seuil par activité.
- **Santé** : événements, rappels récurrents auto-recalculés, courbe de poids.
- **Mode rapide** : `dog_quick_logs`, pensé pour logger en 2-3 taps peu importe le contexte (au travail, dehors, avec ou sans matériel).

## Prochaine étape

Construire les écrans un par un en commençant par **Anxiété**, en s'appuyant sur les tables déjà en place.
