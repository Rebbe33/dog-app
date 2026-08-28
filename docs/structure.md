# Structure de l'app Vanya (refonte)

Convention : tables préfixées `dog_` dans le même projet Supabase que `gite-app`, pour rester cohérent avec ton architecture existante.

## 1. Modèles de données

### `dog_profile`
- id, nom, date_naissance, race, poids_actuel, photo_url, notes_generales

### `dog_tricks`
Catalogue unique pour les tours **et** les exercices d'autocontrôle (les 103 tours + les exercices d'autocontrôle existants).
- id, nom, categorie (tour / autocontrôle), prioritaire (bool — déclenche un badge dédié), tags (json — ex. ["éducation_base"] pour ce qui recoupe l'éducation quotidienne, comme "ne pas tirer en laisse")

### `dog_trick_steps`
Liste d'étapes ordonnées propre à chaque tour/exercice — **ce format existe déjà chez toi et fonctionne bien**, on le généralise à tout.
- id, trick_id, ordre, description (texte libre — une étape peut mélanger distance/durée/distraction/contexte comme dans tes listes actuelles), completed, date_completion, notes

> **Ce que j'ai trouvé en regardant tes données de plus près** : ton fichier contient en fait deux catégories bien distinctes. Les 103 "tricks" utilisent le template générique 51 étapes (peu exploité), mais tu as aussi une catégorie séparée `selfControlExercises` avec 3 exercices ("Ne pas prendre la friandise", "Ne pas prendre la balle", "Simulation prédation") dont **deux ont des listes d'étapes entièrement personnalisées et bien avancées** (35 et 31 étapes, avec 6 et 9 déjà validées). C'est exactement le format qu'on garde pour la refonte — une seule liste d'étapes sur-mesure par tour/exercice, pas un arbre générique. On migre ces 2 exercices tels quels, et "Simulation prédation" (vide) sera à construire.

**Proposition d'étapes pour "Simulation prédation"** (vide dans ton fichier — à valider/ajuster) :
1. Jouet immobile posé à distance, elle reste calme
2. Jouet légèrement bougé au sol, à distance
3. Jouet tiré lentement au sol (type canne à pêche), à distance
4. Jouet tiré plus rapidement
5. Balle qui roule devant elle
6. Objet lancé rapidement à quelques mètres
7. Oiseau qui s'envole à distance
8. Petit animal aperçu au loin (écureuil, chat)
9. Personne qui court doucement au loin
10. Personne qui court plus vite au loin
11. Jogger qui passe en environnement calme
12. Jogger qui passe en environnement plus stimulant (forêt, parc)
13. Vélo qui passe au loin, lentement
14. Vélo qui passe plus près
15. Trottinette qui passe au loin
16. Enfant qui court à proximité
17. Deux stimuli combinés (ex. vélo + jogger)
18. Sortie en laisse avec plusieurs déclencheurs successifs
19. Environnement extérieur non familier avec stimuli inconnus

### `dog_anxiety_triggers`
Catalogue des déclencheurs (réutilisable, pas ressaisi à chaque fois).
- id, nom (ex. "départ de la maison", "orage", "feu d'artifice", "chien inconnu"), categorie (séparation / bruit / social / environnement), severite_de_base, intensite_defaut, duree_defaut (préremplissent le log, modifiables à chaque saisie), protocole_active (bool — active ou non le suivi par paliers pour ce déclencheur)

### `dog_anxiety_log`
Chaque épisode observé.
- id, trigger_id, date, intensite (1-5, préremplie depuis intensite_defaut), duree_crise (préremplie depuis duree_defaut), reactions (json tags — hurle / tremble / halète / se cache / destructeur...), contexte (lieu, seule/accompagnée), technique_utilisee, notes

### `dog_anxiety_protocols`
Désensibilisation progressive par déclencheur — activable au cas par cas (`protocole_active`). Même logique que la progression des tours (paliers), mais orientée réduction du stress plutôt que réussite d'un tour.
- id, trigger_id, palier (ex. "porte qui claque au loin" → "porte à 5m" → "sortie 30 secondes" → "sortie 5 minutes"), ordre, date_validation, niveau_stress_observe (1-5), reussite, notes

### `dog_anxiety_techniques`
Boîte à outils des techniques essayées, pour savoir ce qui marche vraiment.
- id, nom (ex. musique, jouet occupation, contre-conditionnement friandise, sortie avant départ, phéromones), trigger_id (optionnel si spécifique), efficacite_ressentie, notes

### `dog_education_log`
Journal libre pour les observations du quotidien qui ne correspondent pas à une compétence formelle (ex. "bien géré le croisement avec un chien inconnu ce matin").
- id, date, contexte (humains / autres chiens / promenade / maison), observation, resultat, notes

> Pour les comportements qui se travaillent avec une vraie progression (comme un tour), on réutilise `dog_tricks` / `dog_trick_steps` avec `categorie = éducation_base` — même logique que pour l'autocontrôle. Ça évite un troisième système différent, et ça permet d'avoir des badges/streaks dessus aussi.

**Proposition de compétences de base à créer** (en plus de "Laisse sans tirer", déjà dans tes 103 tours et à retaguer `éducation_base`) :
- Ne pas sauter sur les gens
- Marcher au pied en zone passante / en ville
- Croiser un chien inconnu calmement
- Se laisser manipuler (pattes, oreilles, gueule) pour le véto/toilettage
- Accueillir calmement les invités
- Comportement en voiture (monter/descendre sans excitation)
- Ne pas voler la nourriture sur la table/le comptoir
- Rester calme en présence d'enfants

### `dog_activities`
Catalogue des activités sportives.
- id, nom (rando, canoë, camping, canicross, vélo, trottinette...), materiel_requis (json liste), niveau_actuel, temperature_max_recommandee (valeur par défaut selon le type d'activité, modifiable), objectif_progressif_active (bool — quand activé, réutilise `dog_tricks` / `dog_trick_steps` avec `categorie = activité` pour des paliers comme "2km → 5km → 10km"; sinon simple suivi de séances)

### `dog_activity_sessions`
- id, activity_id, date, duree, distance, meteo (temperature + condition), etat_avant (json tags — en forme / fatiguée / excitée...), etat_apres (json tags — fatiguée / enthousiaste / boiterie...), notes

### `dog_health_events`
Chaque événement santé/entretien.
- id, type (vaccin / vermifuge / antiparasitaire / visite_veterinaire / toilettage_bain / toilettage_griffes / toilettage_brossage / autre), date, notes, piece_jointe_url

### `dog_health_reminders`
Rappels, ponctuels ou récurrents.
- id, type (lié à `dog_health_events`), frequence_jours (optionnel — pour les rappels qui reviennent, ex. vermifuge tous les 90 jours), date_prochain_rappel (recalculée automatiquement à `date_evenement + frequence_jours` à chaque nouvelle saisie du type correspondant), actif (bool)

> Réutilise le même mécanisme de notifications push que sur [[gite-app]] (Supabase pg_net/pg_cron), pas besoin d'en reconstruire un.

### `dog_weight_log`
Suivi régulier, affiché en courbe sur l'écran santé.
- id, date, poids_kg, notes

### `dog_quick_logs`
Table "fourre-tout" pour le mode rapide (2-3 taps), reclassée ensuite si besoin.
- id, date, type_rapide, texte_libre

### `dog_streaks`
- id, categorie (tours / autocontrôle / activités / global), streak_actuel, meilleur_streak, dernier_jour_actif

### `dog_badges`
- id, nom, condition_obtention, date_obtention (null si pas encore obtenu)

## 2. Écrans

1. **Accueil / Dashboard** — vue du jour : rappels santé à venir, dernière session par catégorie, accès direct au mode rapide
2. **Mode rapide** — 2-3 taps pour logger une sortie/exercice sans ouvrir de menu, catégorisation possible plus tard
3. **Tours** — liste des tours, fiche détail avec liste d'étapes personnalisées et historique de validation
4. **Autocontrôle** — même écran type que les tours (filtré sur `categorie = autocontrôle`), avec tes 2 exercices déjà bien avancés repris tels quels. Nouveaux exercices à créer au lancement :
   - Attendre à la porte avant de sortir (ne pas se précipiter)
   - Attendre son repas (ne pas se jeter sur la gamelle)
   - Rester calme quand on prend la laisse/le harnais (ne pas sauter partout)
   - Ignorer un congénère excité qui passe
   - Rester calme à la sonnette / quand quelqu'un frappe
5. **Anxiété** (priorité n°1) :
   - Vue d'ensemble : graphique fréquence/intensité récente, liste des déclencheurs actifs avec leur protocole en cours
   - Fiche déclencheur : protocole de désensibilisation par paliers activable au cas par cas (comme les tours, mais orienté baisse du stress), historique
   - Log rapide d'un épisode (accessible aussi depuis le mode rapide) : déclencheur, intensité/durée préremplies (modifiables), réactions, technique utilisée
   - Boîte à techniques : ce qui a été essayé et ce qui marche vraiment
6. **Éducation de base** — compétences avec progression par étapes (même écran type que tours/autocontrôle, filtré `categorie = éducation_base`) + un journal libre pour les observations ponctuelles du quotidien
7. **Activités sportives** — catalogue + historique de séances + check-list matériel par activité + alerte automatique si la météo dépasse le seuil recommandé pour l'activité
8. **Santé & entretien** — timeline des événements + courbe de poids + rappels automatiques (vaccins, vermifuge, toilettage) avec notification push
9. **Réglages** — gestion du profil du chien, personnalisation des tours/activités

## 3. Points d'attention UX (usage multi-contexte)

- PWA installable, accès direct sans passer par un menu
- Mode rapide toujours accessible en 1 tap depuis l'accueil
- Filtre "matériel disponible" sur l'écran activités
- Météo intégrée à l'écran activités : alerte/adaptation automatique (ex. déconseiller le canicross au-delà d'un certain seuil de température)
- Badges/streaks visibles sur l'accueil pour la motivation (un streak "jours sans crise" est particulièrement pertinent pour l'anxiété)
- Hors-ligne : utile mais pas prioritaire, à prévoir en V2 si besoin

## 4. Priorités et prochaines étapes
1. **Anxiété en premier** — c'est le point de départ du projet, avant même les tours
2. Réimporter les 103 tours + les exercices d'autocontrôle dans le modèle unifié `dog_tricks` / `dog_trick_steps`, en reprenant tels quels les 2 exercices d'autocontrôle déjà personnalisés
3. Marquer les tours prioritaires (→ badges dédiés) et taguer ceux qui recoupent l'éducation de base (ex. "ne pas tirer en laisse")
4. Démarrer le projet (repo, Supabase, structure de base)
