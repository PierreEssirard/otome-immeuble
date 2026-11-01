import { defineConfig, loadEnv } from 'vite'
import { handleChat } from './server/chatHandler.js'

/** Petite API /api/chat servie par Vite (npm run dev / npm run preview). */
function chatApi(env) {
  const middleware = async (req, res, next) => {
    if (!req.url?.endsWith('/api/chat') || req.method !== 'POST') return next()
    let body = ''
    for await (const chunk of req) body += chunk
    res.setHeader('content-type', 'application/json')
    try {
      const text = await handleChat(JSON.parse(body || '{}'), env)
      res.end(JSON.stringify({ text }))
    } catch (e) {
      res.statusCode = 500
      res.end(JSON.stringify({ error: e.message }))
    }
  }
  return {
    name: 'chat-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

// base: './' => le build fonctionne aussi bien sur GitHub Pages que sur Firebase Hosting
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // lit .env (la clé reste côté serveur)
  return {
    base: './',
    server: { open: true },
    plugins: [chatApi(env)],
  }
})
