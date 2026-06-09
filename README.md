# BT - Blindtest V1

BT est une web app Next.js mobile-first pour lancer des blindtests musicaux :
landing, mode soiree solo, mini-jeux rapides, PWA et multijoueur Supabase.

## Developpement

```bash
npm run dev
```

Ouvrir ensuite `http://localhost:3000`.

## PWA

BT inclut une PWA simple pour la V1 :

- manifest App Router avec mode `standalone`
- icones locales 192, 512, maskable et Apple touch
- service worker minimal
- page `/offline`

Le service worker reste volontairement prudent : il ne met pas en cache
agressivement `/api/music/search`, les previews iTunes, ni les medias audio.
Les extraits musicaux necessitent donc une connexion internet.

Pour tester l'installation mobile de facon fiable, deployer sur HTTPS, par
exemple via Vercel. En local, le manifest et la page offline peuvent etre
verifies, mais l'experience installable complete depend du navigateur.

## Verification

```bash
npm run lint
npm run build
```

Tester aussi les flows principaux en local ou sur Vercel :

- `/party/setup` puis `/party`
- `/mini-games` puis `/playlists?mode=track` et `mode=artist`
- `/multiplayer/create`, `/multiplayer/join`, lobby et partie

## Supabase multijoueur

Le multijoueur V1 permet :

- creation de room
- code de session visible, copie du code et lien d'invitation
- rejoindre avec un pseudo
- lobby avec liste des joueurs et configuration lisible
- configuration host : mode, themes, difficulte, questions
- mini-jeux jouables `Devine le morceau` et `Devine l'artiste`
- feedback de reponse, score compact et classement final
- avance manuelle par l'hote : reveler puis question suivante

### Configuration

1. Creer un projet Supabase.
2. Copier `.env.example` vers `.env.local` en local.
3. Renseigner :

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

4. Dans Supabase SQL Editor, executer `supabase/schema.sql`.
5. Dans Vercel, ajouter les memes variables d'environnement.

Si le schema lobby a deja ete execute, relancer `supabase/schema.sql` pour
ajouter les colonnes de round et les tables `room_tracks` / `room_answers`.

## Limites connues V1

- Synchro multijoueur en polling leger, avec realtime a durcir plus tard.
- RLS Supabase volontairement permissive pour test prive V1.
- Qualite iTunes perfectible selon les themes et extraits disponibles.
- Filtres musicaux et anti-doublons a ameliorer dans un futur lot.
- Tester plutot avec 4 ou 5 joueurs max avant ouverture publique.
