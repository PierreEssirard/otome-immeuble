import { characters } from '../characters.js'
import { portraitSVG } from '../art/portrait.js'
import { backgroundURL } from '../art/backgrounds.js'

/**
 * Gère le décor et les personnages à l'écran.
 * `resolve` traduit "moi"/"coloc" en vrai id de perso.
 * Le perso joué n'est jamais affiché sur scène : son expression
 * sert seulement à l'avatar de la boîte de dialogue.
 */
export class Stage {
  constructor(resolve, getPlayer) {
    this.resolve = resolve
    this.getPlayer = getPlayer
    this.bgEl = document.getElementById('background')
    this.charsEl = document.getElementById('characters')
    this.shown = {}
    this.playerExpr = 'neutral'
  }

  apply(cmd) {
    switch (cmd.cmd) {
      case 'bg':
        return this.setBackground(cmd.args[0])
      case 'show':
        return this.show(cmd.args[0], cmd.args[1] || 'neutral')
      case 'hide':
        return this.hide(cmd.args[0])
      case 'clear':
        return this.clear()
      default:
        console.warn('Tag inconnu :', cmd)
    }
  }

  setBackground(name) {
    this.bgEl.style.backgroundImage = backgroundURL(name)
  }

  show(rawId, expr = 'neutral') {
    const id = this.resolve(rawId)
    if (id === this.getPlayer()) {
      this.playerExpr = expr
      return
    }
    const info = characters[id]
    if (!info) return console.warn('Perso inconnu :', rawId)
    this.shown[id] = expr
    let el = this.charsEl.querySelector(`[data-id="${id}"]`)
    if (!el) {
      el = document.createElement('div')
      el.className = 'character enter'
      el.dataset.id = id
      this.charsEl.appendChild(el)
    }
    el.innerHTML = portraitSVG(id, info.look, expr)
  }

  exprOf(id) {
    if (id === this.getPlayer()) return this.playerExpr
    return this.shown[id] || 'neutral'
  }

  hide(rawId) {
    const id = this.resolve(rawId)
    delete this.shown[id]
    this.charsEl.querySelector(`[data-id="${id}"]`)?.remove()
  }

  clear() {
    this.shown = {}
    this.charsEl.innerHTML = ''
    this.playerExpr = 'neutral'
  }

  highlight(speakerId) {
    this.charsEl.querySelectorAll('.character').forEach((el) => {
      el.classList.toggle('dim', !!speakerId && el.dataset.id !== speakerId && speakerId in characters)
      el.classList.toggle('speaking', el.dataset.id === speakerId)
    })
  }

  /** Mode exploration : persos cliquables avec étiquette. */
  showRoomNPCs(npcs, onClick) {
    this.clear()
    npcs.forEach(({ id, fresh }) => {
      const info = characters[id]
      const el = document.createElement('button')
      el.className = 'character npc enter'
      el.dataset.id = id
      el.style.setProperty('--c', info.color)
      el.innerHTML = `${portraitSVG(id, info.look, 'neutral')}
        <span class="npc-label">${fresh ? '<b class="badge">!</b>' : ''}💬 ${info.name}</span>`
      el.onclick = () => onClick(id)
      this.charsEl.appendChild(el)
    })
  }
}
