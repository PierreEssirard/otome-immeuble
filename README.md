# 3e étage — Montréal 💗

Otome game web : un échange étudiant à Montréal, deux colocs, des voisines, beaucoup trop de drama.
Tu choisis qui tu incarnes (Pierre ou Pierre-Louis), tu te balades dans l'immeuble en vue isométrique (façon Habbo) et tu écris ce que tu veux à qui tu veux : une IA fait répondre chaque perso avec sa personnalité.

## 🤖 Brancher l'IA (obligatoire pour le chat libre)

1. Copie `.env.example` en `.env` (à la racine du projet).
2. Choisis une option :
   - **Claude** (meilleur résultat) : crée une clé sur https://console.anthropic.com et mets `ANTHROPIC_API_KEY=sk-ant-...`. Le modèle par défaut est `claude-haiku-5-5` (rapide et pas cher).
   - **Ollama** (gratuit, en local) : installe https://ollama.com, puis `ollama pull llama3.2`. Laisse `ANTHROPIC_API_KEY` vide.
3. Relance `npm run dev`.

Sans IA, le jeu marche quand même : les persos répondent avec des phrases de secours.
La clé reste côté serveur (Vite) : elle n'est jamais envoyée au navigateur ni sur GitHub (`.env` est ignoré par git).

```bash
npm install     # une fois
npm run dev     # http://localhost:5173, rechargement auto
```

En jeu : clique au sol pour marcher, sur une porte pour changer de pièce, sur quelqu'un pour lui parler (petite scène du jour, puis chat libre). Va dormir dans ton lit au 3B pour passer à la soirée.
Raccourcis : `Espace`/`Entrée` avance · `1` `2` `3` choisit · `M` ouvre le plan · `Échap` ferme le chat.

## Structure

```
story/main.ink             ← TOUT le scénario (dialogues, choix, soirées, fins)
src/characters.js          ← persos : nom, couleur, bio, apparence (look)
src/world.js               ← pièces, étages, qui est où chaque jour, actions de pièce
src/art/portrait.js        ← générateur de portraits anime (7 expressions)
src/art/backgrounds.js     ← décors illustrés des scènes (3B, 3C, 3D, couloir, hall, buanderie, toit, soirée)
src/iso/                   ← vue Habbo : rooms.js (plans des pièces), World.js (déplacement, PNJ), avatar.js
src/ai/personas.js         ← personnalité de chaque perso pour l'IA (modifie-les !)
src/ai/chat.js             ← envoi des messages à /api/chat
server/chatHandler.js      ← appel Claude / Ollama (côté serveur)
server/worker.js           ← la même API pour la version en ligne (Cloudflare Worker)
src/engine/StoryEngine.js  ← enveloppe inkjs (avance, choix, variables, sauvegarde)
src/ui/                    ← Stage (scène), Dialogue, MapView (plan de l'immeuble)
src/main.js                ← boucle de jeu : titre → choix du perso → histoire ↔ exploration → fin
```

## Comment ça marche

- **Exploration** : tout le monde vit dans l'immeuble (3B les gars, 3C Romane & Sofia, 3D Anna & Mathilde). Qui est où chaque jour : `schedule` dans `src/world.js`. Les PNJ se baladent dans leur pièce. Le `!` jaune = pas encore parlé aujourd'hui.
- **Conversations** : le premier clic du jour sur un perso lance sa petite scène ink `talk_<clé>`, puis le chat libre s'ouvre. Chaque réponse de l'IA peut faire monter ou baisser l'affinité (max +4 par perso et par jour via le chat).
- **Journées** : dors dans ton lit au 3B (ou bouton « Finir la journée ») → `day_end` → la soirée du jour (McGill, soirée jeux, toit). 3 jours au total.
- **Fins** : romance avec Romane, Sofia, Anna ou Mathilde, ou « La bande du 3e ». Anna (pour Pierre) et Mathilde (pour Pierre-Louis) sont plus dures : il faut avoir respecté leur « non » et atteindre 8 d'affinité. L'insistance ne paie jamais.

## Écrire dans main.ink

```ink
=== talk_romane ===
# show: romane happy
romane: Salut !
moi: Salut Romane.            // "moi" = le perso joué
coloc: Et moi alors ?         // "coloc" = l'autre Pierre
* [« Tu viens ce soir ? »]
    ~ aff_romane += 2
    # show: romane blush
    romane: Évidemment.
- -> DONE                     // retour à l'exploration
```

| Syntaxe | Effet |
|---|---|
| `# bg: toit` | Décor (`appart_gars`, `appart_filles`, `couloir`, `hall`, `buanderie`, `toit`, `soiree_mcgill`) |
| `# show: id expression` | Expressions : `neutral happy sad angry surprised blush awkward` |
| `# show: moi blush` | Change l'expression de TON avatar dans la boîte de dialogue |
| `# hide: id` / `# clear` | Retire un perso / tous |
| `{ player == "pierre": ... - else: ... }` | Texte différent selon le perso joué |
| `{coloc_name()}` | Insère le prénom de l'autre coloc |

**Ajouter un jour** : une entrée dans `schedule` (`src/world.js`) + un nom dans `dayNames`, une branche dans `day_end`, et les stitches `= j4` dans les `talk_*`.

**Changer l'apparence d'un perso** : modifie son `look` dans `src/characters.js` (couleurs de peau/cheveux/yeux, coiffure, haut, lunettes, taches de rousseur…).

**Remplacer un décor par une vraie image** : mets `public/assets/bg/toit.png` et ajoute-le dans `IMAGE_OVERRIDES` (`src/art/backgrounds.js`).

## Mettre en ligne

Le site est statique (GitHub Pages ou Firebase), mais l'IA a besoin d'un petit serveur pour cacher la clé :

1. **API de chat** sur Cloudflare Workers (gratuit) :
   ```bash
   npm i -g wrangler
   wrangler login
   wrangler secret put ANTHROPIC_API_KEY
   wrangler deploy
   ```
   Mets ton domaine dans `ALLOWED_ORIGINS` (`wrangler.toml`) pour que personne d'autre n'utilise ta clé.
2. Dans `.env` : `VITE_CHAT_URL=https://otome-chat.<ton-compte>.workers.dev/api/chat`, puis `npm run build`.
3. **Site** : GitHub Pages (workflow `.github/workflows/deploy.yml` prêt, Settings → Pages → Source : GitHub Actions ; ajoute `VITE_CHAT_URL` dans les variables du repo) ou Firebase (`firebase init hosting`, dossier `dist`, `firebase deploy`).

⚠️ Une IA en ligne coûte un peu à chaque message : surveille ta consommation sur console.anthropic.com et fixe une limite de dépense.
