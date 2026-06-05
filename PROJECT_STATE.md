# BT Project State

## 1. Objectif du projet

BT est une web app mobile-first de blindtest musical. Le mode principal vise une experience de soiree entre amis : choix de categories, lecture d extraits, timer, reveal automatique, puis passage au morceau suivant.

## 2. Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- ESLint
- Pas de backend
- Pas de base de donnees
- Pas de fichier `.env`
- Pas de dependance UI externe

## 3. Routes existantes

- `/` : accueil neon cyberpunk.
- `/playlists` : ancien ecran de selection playlists.
- `/playlists/[playlistId]` : pre-jeu playlist.
- `/game` : mini-jeu secondaire avec 4 reponses cliquables.
- `/party/setup` : setup du mode soiree.
- `/party` : mode principal soiree.

## 4. Mode principal `/party`

Le flow principal est :

1. `/party/setup` : selection multiple de categories.
2. Reglages : nombre d extraits `10/25/50`, duree pour deviner `10/15/20s`, duree reveal `3/5s`.
3. `/party?categories=...&count=...&guess=...&reveal=...`
4. Ecran de partie :
   - etat initial `Demarrer la soiree`
   - timer de devinette
   - audio local/API
   - pause globale
   - reveal automatique
   - passage automatique au round suivant
   - bouton `Extrait suivant` en secours
   - ecran final simple

Le mode `/party` ne gere pas de score pour l instant.

## 5. Mode secondaire `/game`

`/game` est conserve comme mini-jeu secondaire :

- session creee depuis les mocks
- 4 propositions de reponse
- selection d une reponse
- feedback correct/incorrect
- progression round par round
- score final
- bouton rejouer
- audio local via `audioPreviewUrl`

Ne pas supprimer ce mode pour l instant.

## 6. Donnees mockees

Fichiers principaux :

- `src/data/mockTracks.ts`
- `src/data/mockPlaylists.ts`
- `src/types/music.ts`
- `src/types/game.ts`

Les tracks ont notamment :

- `id`
- `title`
- `artist`
- `audioPreviewUrl`
- `category`
- `sourceTitle`
- `artworkUrl`
- `revealImageUrl`

Des fichiers audio WAV de test existent dans :

- `public/audio/previews/track-01.wav` a `track-06.wav`

Les autres chemins audio peuvent encore etre fictifs.

## 7. API iTunes test

Une integration progressive existe via :

- `src/features/music/musicProvider.ts`

Provider actuel :

- iTunes Search API
- sans cle API
- client-side
- categorie experimentale `API Test`
- fallback sur les mocks locaux si l API echoue, si CORS bloque, ou si aucun resultat n est disponible

Ne pas remplacer toute l app par l API pour l instant.

## 8. Fichiers importants

- `src/app/page.tsx`
- `src/app/party/setup/page.tsx`
- `src/app/party/page.tsx`
- `src/features/party/PartySetupClient.tsx`
- `src/features/party/PartyGameClient.tsx`
- `src/features/game/GameRoundClient.tsx`
- `src/features/game/useAudioPreview.ts`
- `src/features/game/game.logic.ts`
- `src/features/music/musicProvider.ts`
- `src/components/ui/Button.tsx`
- `src/components/ui/Badge.tsx`
- `src/components/ui/Card.tsx`
- `src/components/layout/PageShell.tsx`

## 9. Regles de travail

- Ne pas ajouter de backend sans demande explicite.
- Ne pas creer de `.env` ni de secret.
- Ne pas ajouter de dependance sans justification forte.
- Ne pas supprimer `/game`.
- Ne pas casser le fallback local.
- Garder la DA neon cyberpunk.
- Garder une approche mobile-first.
- Lancer seulement les commandes demandees par l utilisateur.
- Preferer des changements petits, reversibles et bien scopes.

## 10. Prochaines etapes recommandees

1. Tester le flow `/party/setup -> /party` sur mobile reel.
2. Verifier autoplay/pause/reprise audio sur iOS et Android.
3. Stabiliser le passage auto reveal -> round suivant.
4. Ajouter plus d extraits mockes par categorie.
5. Ajouter une vraie gestion des sources API par categorie.
6. Clarifier les droits d usage des previews avant toute publication.
7. Ajouter un mode offline/local propre pour les tests.
