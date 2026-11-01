// ============================================================
//  Appel à l'IA côté serveur (la clé API ne va JAMAIS dans le navigateur).
//  Utilisé par :
//   - vite.config.js (en local : npm run dev)
//   - server/worker.js (en ligne : Cloudflare Worker)
//
//  Fournisseurs, dans l'ordre :
//   1. ANTHROPIC_API_KEY défini  -> Claude (modèle ANTHROPIC_MODEL, défaut claude-haiku-5-5)
//   2. sinon                     -> Ollama en local (OLLAMA_URL, OLLAMA_MODEL)
// ============================================================

const MAX_MESSAGES = 30
const MAX_LEN = 600

export async function handleChat(body, env = {}) {
  const system = String(body?.system || '').slice(0, 12000)
  let messages = Array.isArray(body?.messages) ? body.messages : []
  messages = messages
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_LEN) }))
  while (messages.length && messages[0].role !== 'user') messages.shift()
  if (!messages.length) throw new Error('Aucun message.')

  if (env.ANTHROPIC_API_KEY) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: env.ANTHROPIC_MODEL || 'claude-haiku-5-5',
        max_tokens: 300,
        system,
        messages,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || `Anthropic HTTP ${res.status}`)
    return (data.content || []).map((c) => c.text || '').join('')
  }

  const url = (env.OLLAMA_URL || 'http://127.0.0.1:11434') + '/api/chat'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: env.OLLAMA_MODEL || 'llama3.2',
      stream: false,
      format: 'json',
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  }).catch(() => {
    throw new Error("Aucune IA configurée : ajoute ANTHROPIC_API_KEY dans .env, ou lance Ollama.")
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || `Ollama HTTP ${res.status}`)
  return data?.message?.content || ''
}
