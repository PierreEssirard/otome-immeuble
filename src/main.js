import './style.css'
import inkSource from '../story/main.ink?raw'
import { StoryEngine } from './engine/StoryEngine.js'
import { Stage } from './ui/Stage.js'
import { Dialogue } from './ui/Dialogue.js'
import { MapView } from './ui/MapView.js'
import { World } from './iso/World.js'
import { characters, playable, colocOf, affinityKeys } from './characters.js'
import { locations, schedule, dayNames } from './world.js'
import { portraitSVG } from './art/portrait.js'
import { backgroundURL } from './art/backgrounds.js'
import { buildSystemPrompt } from './ai/personas.js'
import { askCharacter } from './ai/chat.js'

const $ = (id) => document.getElementById(id)
const engine = new StoryEngine(inkSource)

// --- Qui est qui ---------------------------------------------------------
const player = () => engine.getVar('player')
const resolveId = (id) => (id === 'moi' ? player() : id === 'coloc' ? colocOf(player()) : id)
const keyOf = (id) => (id === colocOf(player()) ? 'coloc' : id)

const stage = new Stage(resolveId, player)
const dialogue = new Dialogue(resolveId, (id) => stage.exprOf(id))
const map = new MapView((room) => enterRoom(room, null))
const world = new World($('world'), {
  onNPC: (npc) => interact(npc),
  onDoor: (to) => enterRoom(to, world.roomId),
  onFurni: (f) => f.action && runKnot(f.action),
  onMoveAway: () => closeChat(),
})

const isTouch = matchMedia('(pointer: coarse)').matches
const portrait = () => matchMedia('(orientation: portrait)').matches

/** Le chat occupe le bas de l'écran en portrait, la droite en paysage. */
function applyChatInset() {
  if (!chatWith) return
  const narrow = $('game').clientWidth < 1000
  world.bottomInset = portrait() ? 0.5 : 0
  world.rightInset = portrait() ? 0 : narrow ? 0.44 : 0.3
}
addEventListener('resize', applyChatInset)

/** mode : title | select | story | room | ending */
let mode = 'title'
let waitingChoice = false
let afterStory = null // action à lancer quand la scène ink se termine
let loaded = { room: null, day: null }

// Mémoire des conversations libres : { clé: [{role, content}] } + gains d'affinité via IA par jour
let chats = {}
let aiGains = {}

// --- Écrans --------------------------------------------------------------
function showScreen(name) {
  for (const id of ['title-screen', 'select-screen', 'ending-screen']) $(id).classList.toggle('hidden', id !== name)
}

function setMode(m) {
  mode = m
  const inGame = m === 'story' || m === 'room'
  $('hud').classList.toggle('hidden', !inGame)
  $('room-ui').classList.toggle('hidden', m !== 'room')
  $('world').classList.toggle('hidden', !inGame)
  $('world').classList.toggle('dim', m === 'story')
  world.frozen = m !== 'room'
  if (m !== 'story') dialogue.hide()
  if (m !== 'room') closeChat()
  if (!inGame) $('affinity-panel').classList.add('hidden')
  document.body.dataset.mode = m
  updateHUD()
}

function updateHUD() {
  if (mode !== 'story' && mode !== 'room') return
  const day = engine.getVar('day')
  const loc = locations[engine.getVar('location')]
  const p = characters[player()]
  $('hud-info').innerHTML = `
    <span class="hud-avatar" style="--c:${p.color}">${portraitSVG(player(), p.look, 'neutral', { crop: true })}</span>
    <span><b>${p.name}</b><br><small>Jour ${day} · ${dayNames[day] ?? ''} — ${loc.name}</small></span>`
  if (!$('affinity-panel').classList.contains('hidden')) renderAffinity()
}

// --- Histoire (ink) ------------------------------------------------------
function runKnot(path, then = null, showId = null) {
  afterStory = then
  closeChat()
  engine.goTo(path)
  stage.clear()
  if (showId) stage.show(showId, 'neutral')
  $('background').style.backgroundImage = 'none'
  setMode('story')
  advance()
}

function advance() {
  if (mode !== 'story' || waitingChoice) return
  if (dialogue.typing) return dialogue.finish()

  while (true) {
    const step = engine.next()
    step.commands?.forEach((c) => stage.apply(c))
    if (step.type === 'commands') continue

    if (step.type === 'line') {
      stage.highlight(step.speaker ? resolveId(step.speaker) : null)
      dialogue.show(step.speaker, step.text)
      updateHUD()
      return
    }
    if (step.type === 'choices') {
      waitingChoice = true
      $('next-hint').classList.add('hidden')
      dialogue.showChoices(step.choices, (i) => {
        waitingChoice = false
        $('next-hint').classList.remove('hidden')
        engine.choose(i)
        advance()
      })
      return
    }
    // fin du knot
    if (engine.getVar('game_over')) return showEnding()
    stage.clear()
    $('background').style.backgroundImage = 'none'
    showRoom()
    const then = afterStory
    afterStory = null
    then?.()
    return
  }
}

// --- Exploration (vue Habbo) ---------------------------------------------
function npcsIn(room) {
  const day = engine.getVar('day')
  return Object.entries(schedule[day] || {})
    .filter(([, r]) => r === room)
    .map(([key]) => {
      const id = key === 'coloc' ? colocOf(player()) : key
      const c = characters[id]
      return { id, key, name: c.name, color: c.color, look: c.look, fresh: engine.getVar(`talked_${key}`) !== day }
    })
}

function occupants() {
  const out = {}
  for (const room of Object.keys(locations)) out[room] = npcsIn(room).map((n) => n.id)
  return out
}

function loadWorldRoom(room, fromRoom) {
  const p = characters[player()]
  world.loadRoom(room, {
    fromRoom,
    player: { id: player(), name: p.name, color: p.color, look: p.look },
    npcs: npcsIn(room),
  })
  loaded = { room, day: engine.getVar('day') }
}

function enterRoom(room, fromRoom) {
  closeChat()
  engine.setVar('location', room)
  loadWorldRoom(room, fromRoom)
  runKnot('on_enter') // événements déclenchés en entrant (voir main.ink)
}

function showRoom() {
  const room = engine.getVar('location')
  if (loaded.room !== room || loaded.day !== engine.getVar('day')) loadWorldRoom(room, null)
  // met à jour les « ! » (pas encore parlé aujourd'hui)
  const day = engine.getVar('day')
  for (const e of world.entities) if (!e.isPlayer) e.fresh = engine.getVar(`talked_${e.key}`) !== day
  setMode('room')
  const loc = locations[room]
  $('room-title').innerHTML = `${loc.icon} ${loc.name}${loc.sub ? ` <small>${loc.sub}</small>` : ''}`
  const n = npcsIn(room).length
  $('room-hint').textContent = n ? 'Clique sur quelqu’un pour lui parler · clique au sol pour marcher' : 'Personne ici… Passe une porte ou ouvre le plan 🗺️'
  $('room-actions').innerHTML = ''
  if (room === 'appart_gars') {
    const b = document.createElement('button')
    b.className = 'btn-primary'
    b.textContent = '🌙 Finir la journée'
    b.onclick = () => runKnot('day_end')
    $('room-actions').appendChild(b)
  }
  updateHUD()
}

/** Clic sur un perso : petite scène du jour (une fois), puis discussion libre. */
function interact(npc) {
  const day = engine.getVar('day')
  if (engine.getVar(`talked_${npc.key}`) !== day) {
    runKnot(`talk_${npc.key}`, () => {
      const e = world.entities.find((x) => x.id === npc.id)
      if (e) {
        world.startTalk(e)
        openChat(e)
      }
    }, npc.id)
  } else openChat(npc)
}

function openMap() {
  if (mode !== 'room') return toast('Termine la scène d’abord !')
  map.open(engine.getVar('location'), occupants())
}

// --- Chat libre avec l'IA ------------------------------------------------
let chatWith = null
let chatBusy = false

function openChat(npc) {
  chatWith = npc
  const c = characters[npc.id]
  $('chat').classList.remove('hidden')
  $('chat').style.setProperty('--c', c.color)
  $('chat-name').textContent = c.name
  setChatFace(npc.id, 'neutral')
  renderChatLog()
  $('chat-input').placeholder = `Écris à ${c.name}…`
  applyChatInset()
  if (!isTouch) $('chat-input').focus()
}

function closeChat() {
  if (!chatWith) return
  chatWith = null
  world.rightInset = 0
  world.bottomInset = 0
  $('chat').classList.add('hidden')
  $('chat-input').blur()
  world.endTalk()
}

function setChatFace(id, emotion) {
  const c = characters[id]
  $('chat-avatar').innerHTML = portraitSVG(id, c.look, emotion, { crop: true })
  const v = engine.getVar(`aff_${keyOf(id)}`) ?? 0
  const hearts = Math.max(0, Math.min(5, Math.round(v / 2)))
  $('chat-status').innerHTML = `<span class="aff-hearts">${'♥'.repeat(hearts)}<i>${'♥'.repeat(5 - hearts)}</i></span>`
}

function renderChatLog(extra = '') {
  const key = keyOf(chatWith.id)
  const log = chats[key] || []
  const name = characters[chatWith.id].name
  $('chat-log').innerHTML =
    (log.length ? '' : `<p class="chat-empty">Dis quelque chose à ${name} ! Ton message et sa réponse s'afficheront aussi en bulles dans la pièce.</p>`) +
    log
      .map((m) => {
        const text = m.role === 'user' ? m.content : (safeJSON(m.content)?.reply ?? m.content)
        return `<div class="msg ${m.role === 'user' ? 'me' : 'them'}">${escapeHTML(text)}</div>`
      })
      .join('') +
    extra
  $('chat-log').scrollTop = $('chat-log').scrollHeight
}

async function sendChat(text) {
  if (!chatWith || chatBusy || !text.trim()) return
  const npc = chatWith
  const key = keyOf(npc.id)
  const day = engine.getVar('day')
  chats[key] = chats[key] || []
  chats[key].push({ role: 'user', content: text })
  world.say(player(), text)
  world.say(npc.id, '…', { typing: true, ms: 60000 })
  renderChatLog('<div class="msg them typing">…</div>')
  chatBusy = true

  const room = engine.getVar('location')
  const others = npcsIn(room).filter((n) => n.id !== npc.id).map((n) => n.name).join(', ')
  const system = buildSystemPrompt(npc.id, {
    player: player(),
    playerName: characters[player()].name,
    day,
    dayName: dayNames[day],
    roomName: locations[room].name,
    others,
    affinity: engine.getVar(`aff_${key}`),
    flags: {
      respect_anna: engine.getVar('respect_anna'),
      insiste_anna: engine.getVar('insiste_anna'),
      respect_mathilde: engine.getVar('respect_mathilde'),
    },
  })
  const r = await askCharacter(npc.id, system, chats[key], { player: characters[player()].name, npc: characters[npc.id].name })
  chatBusy = false
  chats[key].push({ role: 'assistant', content: JSON.stringify({ reply: r.reply, emotion: r.emotion }) })

  // effets sur le jeu : affinité (plafonnée par jour) et insistance
  const gk = `${key}:${day}`
  const gained = aiGains[gk] || 0
  let delta = r.affinity
  if (delta > 0) delta = Math.max(0, Math.min(delta, 4 - gained)) // max +4 par perso et par jour via le chat
  aiGains[gk] = gained + Math.max(0, delta)
  if (delta) engine.setVar(`aff_${key}`, engine.getVar(`aff_${key}`) + delta)
  if (r.pushy && key === 'anna' && player() === 'pierre') engine.setVar('insiste_anna', engine.getVar('insiste_anna') + 1)

  world.say(npc.id, r.reply)
  if (chatWith?.id === npc.id) {
    setChatFace(npc.id, r.emotion)
    const notes = []
    if (r.offline) notes.push(`<p class="chat-note">⚠️ IA non connectée (${escapeHTML(r.offline)}). Réponse de secours. Voir le README pour brancher Claude ou Ollama.</p>`)
    if (delta > 0) notes.push(`<p class="chat-note love">${'💗'.repeat(delta)} ${characters[npc.id].name} a apprécié</p>`)
    if (delta < 0) notes.push(`<p class="chat-note cold">💔 ${characters[npc.id].name} a moins apprécié</p>`)
    renderChatLog(notes.join(''))
    if (!isTouch) $('chat-input').focus()
  }
  updateHUD()
}

$('chat-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const v = $('chat-input').value
  $('chat-input').value = ''
  sendChat(v)
})
$('chat-close').onclick = closeChat

// --- Affinités -----------------------------------------------------------
function renderAffinity() {
  $('affinity-panel').innerHTML =
    '<h3>💗 Affinités</h3>' +
    affinityKeys(player())
      .map(({ key, id }) => {
        const v = engine.getVar(`aff_${key}`) ?? 0
        const c = characters[id]
        const hearts = Math.max(0, Math.min(5, Math.round(v / 2)))
        return `<div class="aff-row">
          <span class="aff-avatar" style="--c:${c.color}">${portraitSVG(id, c.look, v < 0 ? 'sad' : v >= 6 ? 'blush' : 'neutral', { crop: true })}</span>
          <span class="aff-name">${c.name}<small>${c.tagline}</small></span>
          <span class="aff-hearts">${'♥'.repeat(hearts)}<i>${'♥'.repeat(5 - hearts)}</i></span>
        </div>`
      })
      .join('')
}

// --- Fin ------------------------------------------------------------------
function showEnding() {
  setMode('ending')
  $('ending-title').textContent = engine.getVar('ending_title') || 'Fin'
  $('ending-stats').innerHTML = affinityKeys(player())
    .map(({ key, id }) => {
      const c = characters[id]
      const v = engine.getVar(`aff_${key}`) ?? 0
      return `<div class="end-card" style="--c:${c.color}">${portraitSVG(id, c.look, v >= 4 ? 'happy' : 'neutral', { crop: true })}<b>${c.name}</b><span>${v} pts</span></div>`
    })
    .join('')
  showScreen('ending-screen')
}

// --- Menus ---------------------------------------------------------------
function buildTitle() {
  $('title-screen').style.backgroundImage = backgroundURL('titre')
  $('title-lineup').innerHTML = ['romane', 'pl', 'sofia', 'pierre', 'anna', 'mathilde']
    .map((id, i) => `<div class="lineup-char" style="--i:${i}">${portraitSVG(id, characters[id].look, i % 2 ? 'happy' : 'blush')}</div>`)
    .join('')
  $('btn-continue').disabled = !engine.saveInfo()
}

function buildSelect() {
  $('select-cards').innerHTML = playable
    .map((id) => {
      const c = characters[id]
      return `<button class="select-card" data-id="${id}" style="--c:${c.color}">
        <div class="select-portrait">${portraitSVG(id, c.look, 'happy')}</div>
        <div class="select-info"><h3>${c.name}</h3><p class="tag">${c.tagline}</p><p>${c.bio}</p>
        <span class="btn-primary">Incarner ${c.name}</span></div>
      </button>`
    })
    .join('')
  $('select-cards').querySelectorAll('.select-card').forEach((card) => {
    card.onclick = () => startGame(card.dataset.id)
  })
}

function startGame(id) {
  engine.restart()
  engine.setVar('player', id)
  chats = {}
  aiGains = {}
  loaded = { room: null, day: null }
  showScreen(null)
  loadWorldRoom('appart_gars', null)
  runKnot('intro')
}

function backToTitle() {
  stage.clear()
  setMode('title')
  buildTitle()
  showScreen('title-screen')
}

function toast(msg) {
  const t = $('toast')
  t.textContent = msg
  t.classList.add('show')
  clearTimeout(t._h)
  t._h = setTimeout(() => t.classList.remove('show'), 1800)
}

function loadGame() {
  if (!engine.load()) return toast('Aucune sauvegarde.')
  const extra = engine.saveExtra() || {}
  chats = extra.chats || {}
  aiGains = extra.aiGains || {}
  waitingChoice = false
  loaded = { room: null, day: null }
  showScreen(null)
  showRoom()
  toast('Partie chargée 📂')
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}
function safeJSON(s) {
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}

// --- Événements ----------------------------------------------------------
$('dialogue').addEventListener('click', advance)
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') {
    if (e.code === 'Escape') closeChat()
    return
  }
  if (map.isOpen && e.code === 'Escape') return map.close()
  if (mode === 'story') {
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault()
      advance()
    }
    if (/^Digit[1-9]$/.test(e.code)) dialogue.pickByNumber(+e.code.slice(5))
  }
  if (mode === 'room' && e.code === 'KeyM') openMap()
})

$('btn-new').onclick = () => {
  buildSelect()
  showScreen('select-screen')
}
$('btn-select-back').onclick = () => showScreen('title-screen')
$('btn-continue').onclick = loadGame
$('btn-ending-menu').onclick = backToTitle
$('btn-menu').onclick = backToTitle
$('btn-map').onclick = openMap
$('btn-save').onclick = () => {
  if (mode !== 'room') return toast('Sauvegarde possible seulement hors scène.')
  toast(engine.save({ chats, aiGains }) ? 'Partie sauvegardée 💾' : 'Impossible de sauvegarder.')
}
$('btn-load').onclick = loadGame
$('btn-affinity').onclick = () => {
  renderAffinity()
  $('affinity-panel').classList.toggle('hidden')
}

buildTitle()

// accès debug depuis la console du navigateur
Object.assign(window, { __world: world, __engine: engine })
