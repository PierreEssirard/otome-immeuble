import { characters } from '../characters.js'
import { portraitSVG } from '../art/portrait.js'

const CHAR_DELAY = 20 // ms par caractère (effet machine à écrire)

/** Boîte de dialogue avec avatar, effet machine à écrire et choix. */
export class Dialogue {
  constructor(resolve, exprOf) {
    this.resolve = resolve
    this.exprOf = exprOf
    this.box = document.getElementById('dialogue')
    this.avatarEl = document.getElementById('speaker-avatar')
    this.speakerEl = document.getElementById('speaker')
    this.textEl = document.getElementById('text')
    this.choicesEl = document.getElementById('choices')
    this.timer = null
    this.fullText = ''
  }

  get typing() {
    return this.timer !== null
  }

  show(rawSpeaker, text) {
    const id = rawSpeaker ? this.resolve(rawSpeaker) : null
    const info = id ? characters[id] : null
    this.box.classList.remove('hidden')
    this.box.classList.toggle('narration', !info)
    this.box.style.setProperty('--c', info?.color || '#c9a8d8')

    this.speakerEl.textContent = info ? info.name + (rawSpeaker === 'moi' ? ' (toi)' : '') : ''
    this.speakerEl.classList.toggle('hidden', !info)
    this.avatarEl.classList.toggle('hidden', !info)
    if (info) this.avatarEl.innerHTML = portraitSVG(id, info.look, this.exprOf(id), { crop: true })

    this.fullText = text
    this.textEl.textContent = ''
    let i = 0
    clearInterval(this.timer)
    this.timer = setInterval(() => {
      this.textEl.textContent = text.slice(0, ++i)
      if (i >= text.length) this.finish()
    }, CHAR_DELAY)
  }

  finish() {
    clearInterval(this.timer)
    this.timer = null
    this.textEl.textContent = this.fullText
  }

  hide() {
    this.finish()
    this.box.classList.add('hidden')
    this.choicesEl.innerHTML = ''
  }

  showChoices(choices, onPick) {
    this.choicesEl.innerHTML = ''
    choices.forEach((c, n) => {
      const btn = document.createElement('button')
      btn.innerHTML = `<span class="choice-key">${n + 1}</span>${escapeHTML(c.text)}`
      btn.style.animationDelay = `${n * 70}ms`
      btn.onclick = (e) => {
        e.stopPropagation()
        this.choicesEl.innerHTML = ''
        onPick(c.index)
      }
      this.choicesEl.appendChild(btn)
    })
  }

  pickByNumber(n) {
    this.choicesEl.querySelectorAll('button')[n - 1]?.click()
  }
}

function escapeHTML(s) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}
