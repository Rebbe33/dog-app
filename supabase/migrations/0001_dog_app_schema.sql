-- ============================================================
-- App Vanya — schéma initial
-- Tables préfixées dog_ dans le même projet Supabase que gite-app
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Profil
-- ------------------------------------------------------------
create table dog_profile (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  date_naissance date,
  race text,
  poids_actuel numeric(5,2),
  photo_url text,
  notes_generales text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tours / autocontrôle / éducation de base (modèle unifié)
-- ------------------------------------------------------------
create table dog_tricks (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  categorie text not null check (categorie in ('tour', 'autocontrole', 'education_base', 'activite')),
  prioritaire boolean not null default false,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table dog_trick_steps (
  id uuid primary key default gen_random_uuid(),
  trick_id uuid not null references dog_tricks(id) on delete cascade,
  ordre integer not null,
  description text not null,
  completed boolean not null default false,
  date_completion date,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_dog_trick_steps_trick_id on dog_trick_steps(trick_id);

-- ------------------------------------------------------------
-- Anxiété
-- ------------------------------------------------------------
create table dog_anxiety_triggers (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  categorie text check (categorie in ('separation', 'bruit', 'social', 'environnement')),
  severite_de_base integer check (severite_de_base between 1 and 5),
  intensite_defaut integer check (intensite_defaut between 1 and 5),
  duree_defaut interval,
  protocole_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table dog_anxiety_log (
  id uuid primary key default gen_random_uuid(),
  trigger_id uuid references dog_anxiety_triggers(id) on delete set null,
  date timestamptz not null default now(),
  intensite integer check (intensite between 1 and 5),
  duree_crise interval,
  reactions jsonb not null default '[]'::jsonb,
  contexte text,
  technique_utilisee text,
  notes text
);

create index idx_dog_anxiety_log_trigger_id on dog_anxiety_log(trigger_id);

create table dog_anxiety_protocols (
  id uuid primary key default gen_random_uuid(),
  trigger_id uuid not null references dog_anxiety_triggers(id) on delete cascade,
  palier text not null,
  ordre integer not null,
  date_validation date,
  niveau_stress_observe integer check (niveau_stress_observe between 1 and 5),
  reussite boolean,
  notes text
);

create index idx_dog_anxiety_protocols_trigger_id on dog_anxiety_protocols(trigger_id);

create table dog_anxiety_techniques (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  trigger_id uuid references dog_anxiety_triggers(id) on delete set null,
  efficacite_ressentie integer check (efficacite_ressentie between 1 and 5),
  notes text
);

-- ------------------------------------------------------------
-- Éducation de base — journal libre
-- ------------------------------------------------------------
create table dog_education_log (
  id uuid primary key default gen_random_uuid(),
  date timestamptz not null default now(),
  contexte text check (contexte in ('humains', 'autres_chiens', 'promenade', 'maison', 'autre')),
  observation text not null,
  resultat text,
  notes text
);

-- ------------------------------------------------------------
-- Activités sportives
-- ------------------------------------------------------------
create table dog_activities (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  materiel_requis jsonb not null default '[]'::jsonb,
  niveau_actuel text,
  temperature_max_recommandee numeric(4,1),
  objectif_progressif_active boolean not null default false,
  trick_id uuid references dog_tricks(id) on delete set null, -- lien vers dog_tricks si objectif progressif activé (categorie = 'activite')
  created_at timestamptz not null default now()
);

create table dog_activity_sessions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references dog_activities(id) on delete cascade,
  date timestamptz not null default now(),
  duree interval,
  distance numeric(6,2),
  meteo_temperature numeric(4,1),
  meteo_condition text,
  etat_avant jsonb not null default '[]'::jsonb,
  etat_apres jsonb not null default '[]'::jsonb,
  notes text
);

create index idx_dog_activity_sessions_activity_id on dog_activity_sessions(activity_id);

-- ------------------------------------------------------------
-- Santé & entretien
-- ------------------------------------------------------------
create table dog_health_events (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in (
    'vaccin', 'vermifuge', 'antiparasitaire', 'visite_veterinaire',
    'toilettage_bain', 'toilettage_griffes', 'toilettage_brossage', 'autre'
  )),
  date date not null default current_date,
  notes text,
  piece_jointe_url text,
  created_at timestamptz not null default now()
);

create table dog_health_reminders (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  frequence_jours integer,
  date_prochain_rappel date,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create table dog_weight_log (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  poids_kg numeric(5,2) not null,
  notes text
);

-- ------------------------------------------------------------
-- Mode rapide / gamification
-- ------------------------------------------------------------
create table dog_quick_logs (
  id uuid primary key default gen_random_uuid(),
  date timestamptz not null default now(),
  type_rapide text,
  texte_libre text,
  reclasse boolean not null default false
);

create table dog_streaks (
  id uuid primary key default gen_random_uuid(),
  categorie text not null check (categorie in ('tours', 'autocontrole', 'activites', 'anxiete', 'global')),
  streak_actuel integer not null default 0,
  meilleur_streak integer not null default 0,
  dernier_jour_actif date
);

create table dog_badges (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  condition_obtention text,
  trick_id uuid references dog_tricks(id) on delete cascade,
  date_obtention date
);

-- ============================================================
-- Row Level Security — à adapter selon ton modèle d'accès
-- (par défaut : accès complet pour les utilisateurs authentifiés,
-- comme sur gite-app)
-- ============================================================
alter table dog_profile enable row level security;
alter table dog_tricks enable row level security;
alter table dog_trick_steps enable row level security;
alter table dog_anxiety_triggers enable row level security;
alter table dog_anxiety_log enable row level security;
alter table dog_anxiety_protocols enable row level security;
alter table dog_anxiety_techniques enable row level security;
alter table dog_education_log enable row level security;
alter table dog_activities enable row level security;
alter table dog_activity_sessions enable row level security;
alter table dog_health_events enable row level security;
alter table dog_health_reminders enable row level security;
alter table dog_weight_log enable row level security;
alter table dog_quick_logs enable row level security;
alter table dog_streaks enable row level security;
alter table dog_badges enable row level security;

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'dog_profile','dog_tricks','dog_trick_steps','dog_anxiety_triggers','dog_anxiety_log',
      'dog_anxiety_protocols','dog_anxiety_techniques','dog_education_log','dog_activities',
      'dog_activity_sessions','dog_health_events','dog_health_reminders','dog_weight_log',
      'dog_quick_logs','dog_streaks','dog_badges'
    ])
  loop
    execute format(
      'create policy "Authenticated full access" on %I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'');',
      t
    );
  end loop;
end $$;
