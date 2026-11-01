import { fallbackLines } from './personas.js'

// En local : le serveur Vite répond sur /api/chat (voir vite.config.js).
// En ligne : mets l'URL de ton worker dans .env -> VITE_CHAT_URL=https://...
const ENDPOINT = import.meta.env.VITE_CHAT_URL || './api/chat'

const EMOTIONS = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'blush', 'awkward']

// Quand le jeu est publié comme page Claude (claude.ai / app iOS), l'IA passe
// par la capacité « sample » de la page : pas de clé API ni de serveur.
const samplePromise =
  typeof window !== 'undefined' && window.claude?.use ? window.claude.use('sample').catch(() => null) : Promise.resolve(null)

function readReply(content) {
  try {
    return JSON.parse(content).reply ?? content
  } catch {
    return content
  }
}

/**
 * Envoie la conversation à l'IA et renvoie { reply, emotion, affinity, pushy, offline }.
 * messages : [{ role: 'user'|'assistant', content }]
 */
export async function askCharacter(npc, system, messages, names = {}) {
  const sample = await Promise.race([samplePromise, new Promise((r) => setTimeout(() => r(null), 1500))])
  if (sample) {
    try {
      const transcript = messages
        .slice(-20)
        .map((m) => `${m.role === 'user' ? names.player : names.npc} : ${m.role === 'user' ? m.content : readReply(m.content)}`)
        .join('\n')
      const prompt = `${system}\n\n## Conversation jusqu'ici\n${transcript}\n\nRéponds maintenant au dernier message de ${names.player}, uniquement avec l'objet JSON demandé.`
      const r = await sample(prompt, { modelTier: 'quick', cache: false })
      return parseReply(r.text)
    } catch (err) {
      const why = err?.code === 'rate_limited' ? 'trop de messages, attends un peu' : err?.code === 'not_granted' ? 'autorisation refusée' : err?.message || 'erreur'
      const lines = fallbackLines[npc] || ['...']
      return { reply: lines[Math.floor(Math.random() * lines.length)], emotion: 'neutral', affinity: 0, pushy: false, offline: why }
    }
  }
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ system, messages }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
    return parseReply(data.text)
  } catch (err) {
    console.warn('[IA] indisponible :', err.message)
    const lines = fallbackLines[npc] || ['...']
    return { reply: lines[Math.floor(Math.random() * lines.length)], emotion: 'neutral', affinity: 0, pushy: false, offline: err.message }
  }
}

export function parseReply(text = '') {
  const m = text.match(/\{[\s\S]*\}/)
  if (m) {
    try {
      const j = JSON.parse(m[0])
      return {
        reply: String(j.reply || '').trim() || '...',
        emotion: EMOTIONS.includes(j.emotion) ? j.emotion : 'neutral',
        affinity: Math.max(-2, Math.min(2, Math.round(Number(j.affinity) || 0))),
        pushy: !!j.pushy,
      }
    } catch {
      /* texte libre */
    }
  }
  return { reply: text.trim().slice(0, 400) || '...', emotion: 'neutral', affinity: 0, pushy: false }
}
