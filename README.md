# BT - Blindtest

BT est une web app Next.js mobile-first pour lancer des blindtests musicaux :
mode soiree avec categories et previews iTunes, plus mini-jeux rapides.

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
```

Pour une validation complete avant production, lancer aussi un build local ou
Vercel. Cette verification n'est pas incluse dans le mode economie.

## Supabase multijoueur

Le multijoueur V1 pose seulement une fondation de lobby :

- creation de room
- code de session
- rejoindre avec un pseudo
- liste des joueurs
- bouton de rafraichissement manuel

La synchronisation de partie, les scores live et les reponses temps reel seront
branches dans un lot suivant.

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

Le schema active RLS avec des policies permissives pour cette V1 privee/test.
Elles devront etre durcies avant une ouverture publique.
