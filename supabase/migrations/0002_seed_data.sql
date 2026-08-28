-- ============================================================
-- Seed : migration des données existantes + amorçage des catégories
-- Générée à partir de vanya-backup-28-08-2026.json + décisions prises en discussion
-- À exécuter après 0001_dog_app_schema.sql
-- ============================================================

-- 1) Les 103 tours existants (sans étapes — l'ancien template générique n'est pas repris,
--    tu pourras ajouter des étapes personnalisées au fur et à mesure, comme pour l'autocontrôle)
insert into dog_tricks (nom, categorie, tags) values
  ('Assis', 'tour', '[]'::jsonb),
  ('Couché', 'tour', '[]'::jsonb),
  ('Rappel', 'tour', '[]'::jsonb),
  ('Attrape', 'tour', '[]'::jsonb),
  ('Tourne', 'tour', '[]'::jsonb),
  ('Donne la patte', 'tour', '[]'::jsonb),
  ('Pas bouger', 'tour', '[]'::jsonb),
  ('Boîte', 'tour', '[]'::jsonb),
  ('Câlin', 'tour', '[]'::jsonb),
  ('Saute la jambe', 'tour', '[]'::jsonb),
  ('Aboie', 'tour', '[]'::jsonb),
  ('Fais la belle', 'tour', '[]'::jsonb),
  ('8', 'tour', '[]'::jsonb),
  ('Marche enfantine', 'tour', '[]'::jsonb),
  ('Marche militaire', 'tour', '[]'::jsonb),
  ('Roule', 'tour', '[]'::jsonb),
  ('Pan t’es mort', 'tour', '[]'::jsonb),
  ('Range', 'tour', '[]'::jsonb),
  ('Ouvre', 'tour', '[]'::jsonb),
  ('Bisous', 'tour', '[]'::jsonb),
  ('Cache toi', 'tour', '[]'::jsonb),
  ('Debout', 'tour', '[]'::jsonb),
  ('Apporte', 'tour', '[]'::jsonb),
  ('Au pied', 'tour', '[]'::jsonb),
  ('Enleve les chaussettes', 'tour', '[]'::jsonb),
  ('Lâche', 'tour', '[]'::jsonb),
  ('Incline toi', 'tour', '[]'::jsonb),
  ('Lentement', 'tour', '[]'::jsonb),
  ('Tire la langue', 'tour', '[]'::jsonb),
  ('Salut', 'tour', '[]'::jsonb),
  ('Passe', 'tour', '[]'::jsonb),
  ('Recule', 'tour', '[]'::jsonb),
  ('Cible', 'tour', '[]'::jsonb),
  ('Harnais', 'tour', '[]'::jsonb),
  ('Saute', 'tour', '[]'::jsonb),
  ('Baisse la tête', 'tour', '[]'::jsonb),
  ('Pousse le nez', 'tour', '[]'::jsonb),
  ('Stop', 'tour', '[]'::jsonb),
  ('Tope là', 'tour', '[]'::jsonb),
  ('À ta place', 'tour', '[]'::jsonb),
  ('L’autre patte', 'tour', '[]'::jsonb),
  ('Regarde/focus', 'tour', '[]'::jsonb),
  ('Laisse sans tirer', 'tour', '["education_base"]'::jsonb),
  ('Marche sur le trottoir', 'tour', '[]'::jsonb),
  ('Traverse', 'tour', '[]'::jsonb),
  ('Rampe', 'tour', '[]'::jsonb),
  ('Marche au pied', 'tour', '[]'::jsonb),
  ('Éteins la lumiere', 'tour', '[]'::jsonb),
  ('Ferme la porte', 'tour', '[]'::jsonb),
  ('Apporte une bière', 'tour', '[]'::jsonb),
  ('Saute entre les bras cerceau', 'tour', '[]'::jsonb),
  ('Danse', 'tour', '[]'::jsonb),
  ('Shake', 'tour', '[]'::jsonb),
  ('Tourne autour', 'tour', '[]'::jsonb),
  ('Révérence', 'tour', '[]'::jsonb),
  ('High five', 'tour', '[]'::jsonb),
  ('Cache un objet', 'tour', '[]'::jsonb),
  ('Souris', 'tour', '[]'::jsonb),
  ('Cherche', 'tour', '[]'::jsonb),
  ('Choisis', 'tour', '[]'::jsonb),
  ('Laisse', 'tour', '[]'::jsonb),
  ('Compte', 'tour', '[]'::jsonb),
  ('Va au pointage du doigt', 'tour', '[]'::jsonb),
  ('Enroule toi dans une couverture', 'tour', '[]'::jsonb),
  ('Marche arrière entre les jambes', 'tour', '[]'::jsonb),
  ('Fais la prière', 'tour', '[]'::jsonb),
  ('Patte arrière sur un objet', 'tour', '[]'::jsonb),
  ('Marche en crabe', 'tour', '[]'::jsonb),
  ('À gauche', 'tour', '[]'::jsonb),
  ('À droite', 'tour', '[]'::jsonb),
  ('Accélère', 'tour', '[]'::jsonb),
  ('Ralentis', 'tour', '[]'::jsonb),
  ('Cours', 'tour', '[]'::jsonb),
  ('Montre ton ventre', 'tour', '[]'::jsonb),
  ('Croise les pattes', 'tour', '[]'::jsonb),
  ('Fais un coeur', 'tour', '[]'::jsonb),
  ('Reconnais les couleurs', 'tour', '[]'::jsonb),
  ('Reconnais les images', 'tour', '[]'::jsonb),
  ('Sur le côté', 'tour', '[]'::jsonb),
  ('Ta tête dans ma main', 'tour', '[]'::jsonb),
  ('Gemis', 'tour', '[]'::jsonb),
  ('Marque un but', 'tour', '[]'::jsonb),
  ('Fais non de la tête', 'tour', '[]'::jsonb),
  ('Fais oui de la tête', 'tour', '[]'::jsonb),
  ('Tousse', 'tour', '[]'::jsonb),
  ('Baille', 'tour', '[]'::jsonb),
  ('Silence', 'tour', '[]'::jsonb),
  ('Suis la ligne', 'tour', '[]'::jsonb),
  ('Creuse', 'tour', '[]'::jsonb),
  ('Statue', 'tour', '[]'::jsonb),
  ('Couvre moi', 'tour', '[]'::jsonb),
  ('Cache cache', 'tour', '[]'::jsonb),
  ('Répondre à des questions', 'tour', '[]'::jsonb),
  ('Apporte la gamelle', 'tour', '[]'::jsonb),
  ('Touche', 'tour', '[]'::jsonb),
  ('Reste à proximité', 'tour', '[]'::jsonb),
  ('Slalom', 'tour', '[]'::jsonb),
  ('Tire', 'tour', '[]'::jsonb),
  ('Sèche', 'tour', '[]'::jsonb),
  ('Grogne', 'tour', '[]'::jsonb),
  ('Tiens', 'tour', '[]'::jsonb),
  ('Chuchote', 'tour', '[]'::jsonb),
  ('Camera', 'tour', '[]'::jsonb);

-- 2) Exercices d'autocontrôle existants, avec leurs étapes personnalisées reprises telles quelles
insert into dog_tricks (nom, categorie) values ('Ne pas prendre la friandise', 'autocontrole');
insert into dog_trick_steps (trick_id, ordre, description, completed)
select id, v.ordre, v.description, v.completed
from dog_tricks, (values
  (1, 'Dans ma main, elle recule', true),
  (2, 'Dans ma main, elle recule et attend 1 seconde', true),
  (3, 'Dans ma main, elle recule et attend 2 secondes', true),
  (4, 'Dans ma main, elle recule et attend 3 secondes', true),
  (5, 'Dans ma main ouverte, et nourriture cachée par mon pouce', true),
  (6, 'Main ouverte, nourriture visible', true),
  (7, 'Posée au sol, mais cachée par la main', false),
  (8, 'Au sol, main à 1 cm', false),
  (9, 'Au sol, main à 5cm', false),
  (10, 'Au sol, main retirée', false),
  (11, 'Au sol sans rien 3 secondes', false),
  (12, 'Au sol sans rien 5 secondes', false),
  (13, 'Au sol sans rien 10 secondes', false),
  (14, 'Moi debout, nourriture au sol', false),
  (15, 'Au sol, moi debout, un pas en arriere', false),
  (16, 'Au sol, moi debout, je tourne le dos 1 seconde', false),
  (17, 'Au sol, moi debout, je tourne le dos 3 secondes', false),
  (18, 'Je fais volontairement tomber une croquette', false),
  (19, 'Je fais tomber volontairement plusieurs croquettes', false),
  (20, 'Nourriture au sol et jouet a cote', false),
  (21, 'Dans le jardin au calme, nourriture au sol, 1 seconde', false),
  (22, 'Jardin calme, au sol 3 secondes', false),
  (23, 'Jardin calme, au sol 5 secondes', false),
  (24, 'Jardin calme, je fais tomber des friandises', false),
  (25, 'Jardin forêt, friandise au sol 1 seconde', false),
  (26, 'Jardin forêt, au sol 3 secondes', false),
  (27, 'Jardin forêt, au sol 5 secondes', false),
  (28, 'Jardin forêt, je fais tomber des friandises', false),
  (29, 'Friandises +++', false),
  (30, 'Friandise lancee à 50 cm', false),
  (31, 'Friandise lancee à 1m', false),
  (32, 'Je trottine en tenant la friandise', false),
  (33, 'Je fais semblant de manger et j’en laisse tomber', false),
  (34, 'Quelqu’un d’autre lui tend de la nourriture', false),
  (35, 'Nourriture inconnue en extérieur, focus', false)
) as v(ordre, description, completed)
where dog_tricks.nom = 'Ne pas prendre la friandise' and dog_tricks.categorie = 'autocontrole';

insert into dog_tricks (nom, categorie) values ('Ne pas prendre la balle', 'autocontrole');
insert into dog_trick_steps (trick_id, ordre, description, completed)
select id, v.ordre, v.description, v.completed
from dog_tricks, (values
  (1, 'Jouet posé a 2m', true),
  (2, 'Jouet posé à 1m', true),
  (3, 'Jouet posé a 50cm', true),
  (4, 'Je pose le jouet devant elle', true),
  (5, 'Je pose et enleve le jouet', true),
  (6, 'Je pose le jouet et j’attends 2 secondes', true),
  (7, 'Pose et attente 5 secondes', true),
  (8, 'Pose et attente 10 secondes', true),
  (9, 'Je bouge légèrement le jouet', true),
  (10, 'Je fais glisser lentement le jouet', false),
  (11, 'Je secoue doucement le jouet', false),
  (12, 'Je fais rebondir le jouet', false),
  (13, 'Je lance et je bloque du pied', false),
  (14, 'Je le lance à 1m', false),
  (15, 'Je le lance à 2m', false),
  (16, 'Je cours avec le jouet', false),
  (17, 'Je fais semblant de le perdre', false),
  (18, 'Je le cache sous un tissu', false),
  (19, 'Je fais tomber le jouet de la table', false),
  (20, 'Je mets plein de jouets au sol', false),
  (21, 'Une autre personne joue avec', false),
  (22, 'Un enfant court avec', false),
  (23, 'Je crie "regarde" et je l’agite', false),
  (24, 'Le jouet est attaché a une corde', false),
  (25, 'Jouet qui passe rapidement devant elle', false),
  (26, 'Jouet lancé derriere elle', false),
  (27, 'Jouet lancé pendant qu’elle est deja excitee', false),
  (28, 'Jouet + nourriture presente', false),
  (29, 'Jouet + autre chien visible', false),
  (30, 'Meme chose en extérieur calme', false),
  (31, 'Meme chose en foret', false)
) as v(ordre, description, completed)
where dog_tricks.nom = 'Ne pas prendre la balle' and dog_tricks.categorie = 'autocontrole';

-- 3) Simulation prédation (vide dans l'export d'origine) — étapes proposées, à ajuster
insert into dog_tricks (nom, categorie) values ('Simulation prédation', 'autocontrole');
insert into dog_trick_steps (trick_id, ordre, description, completed)
select id, v.ordre, v.description, false
from dog_tricks, (values
  (1, 'Jouet immobile posé à distance, elle reste calme'),
  (2, 'Jouet légèrement bougé au sol, à distance'),
  (3, 'Jouet tiré lentement au sol (type canne à pêche), à distance'),
  (4, 'Jouet tiré plus rapidement'),
  (5, 'Balle qui roule devant elle'),
  (6, 'Objet lancé rapidement à quelques mètres'),
  (7, 'Oiseau qui s''envole à distance'),
  (8, 'Petit animal aperçu au loin (écureuil, chat)'),
  (9, 'Personne qui court doucement au loin'),
  (10, 'Personne qui court plus vite au loin'),
  (11, 'Jogger qui passe en environnement calme'),
  (12, 'Jogger qui passe en environnement plus stimulant (forêt, parc)'),
  (13, 'Vélo qui passe au loin, lentement'),
  (14, 'Vélo qui passe plus près'),
  (15, 'Trottinette qui passe au loin'),
  (16, 'Enfant qui court à proximité'),
  (17, 'Deux stimuli combinés (ex. vélo + jogger)'),
  (18, 'Sortie en laisse avec plusieurs déclencheurs successifs'),
  (19, 'Environnement extérieur non familier avec stimuli inconnus')
) as v(ordre, description)
where dog_tricks.nom = 'Simulation prédation' and dog_tricks.categorie = 'autocontrole';

-- 4) Nouveaux exercices d'autocontrôle validés en discussion (sans étapes pour l'instant)
insert into dog_tricks (nom, categorie) values
  ('Attendre à la porte avant de sortir', 'autocontrole'),
  ('Attendre son repas', 'autocontrole'),
  ('Rester calme quand on prend la laisse/le harnais', 'autocontrole'),
  ('Ignorer un congénère excité qui passe', 'autocontrole'),
  ('Rester calme à la sonnette', 'autocontrole');

-- 5) Compétences d'éducation de base validées en discussion
insert into dog_tricks (nom, categorie) values
  ('Ne pas sauter sur les gens', 'education_base'),
  ('Marcher au pied en zone passante', 'education_base'),
  ('Croiser un chien inconnu calmement', 'education_base'),
  ('Se laisser manipuler (pattes, oreilles, gueule)', 'education_base'),
  ('Accueillir calmement les invités', 'education_base'),
  ('Comportement en voiture', 'education_base'),
  ('Ne pas voler la nourriture sur la table', 'education_base'),
  ('Rester calme en présence d''enfants', 'education_base');

-- 6) Déclencheur d'anxiété connu (à compléter avec les autres si besoin)
insert into dog_anxiety_triggers (nom, categorie, protocole_active) values
  ('Départ de la maison', 'separation', true);

-- 7) Catalogue d'activités de départ (matériel à compléter dans l'app)
insert into dog_activities (nom, materiel_requis, temperature_max_recommandee) values
  ('Randonnée', '[]'::jsonb, NULL),
  ('Canoë', '[]'::jsonb, NULL),
  ('Camping', '[]'::jsonb, NULL),
  ('Canicross', '[]'::jsonb, 15.0),
  ('Vélo', '[]'::jsonb, 25.0),
  ('Trottinette électrique', '[]'::jsonb, 25.0);

-- 8) Compteurs de streak initialisés à zéro
insert into dog_streaks (categorie) values
  ('tours'), ('autocontrole'), ('activites'), ('anxiete'), ('global');
