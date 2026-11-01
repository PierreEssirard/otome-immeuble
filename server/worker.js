// ============================================================
//  Cloudflare Worker : l'API de chat pour la version EN LIGNE du jeu.
//  Déploiement (gratuit) :
//    npm i -g wrangler
//    wrangler login
//    wrangler secret put ANTHROPIC_API_KEY
//    wrangler deploy
//  Puis dans .env :  VITE_CHAT_URL=https://otome-chat.<ton-compte>.workers.dev/api/chat
//  et rebuild le jeu (npm run build).
// ============================================================
import { handleChat } from './chatHandler.js'

export default {
  async fetch(request, env) {
    const origin = request.headers.get('origin') || ''
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean)
    const cors = {
      'access-control-allow-origin': allowed.length === 0 || allowed.includes(origin) ? origin || '*' : allowed[0],
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
    }
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors })
    if (request.method !== 'POST') return new Response('Not found', { status: 404, headers: cors })
    if (allowed.length && !allowed.includes(origin)) return new Response('Forbidden', { status: 403, headers: cors })
    try {
      const text = await handleChat(await request.json(), env)
      return Response.json({ text }, { headers: cors })
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500, headers: cors })
    }
  },
}
