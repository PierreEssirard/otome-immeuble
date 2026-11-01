import { characters } from '../characters.js'
import { portraitSVG } from '../art/portrait.js'
import { floors, locations } from '../world.js'

/** Plan de l'immeuble en coupe : on clique sur une pièce pour s'y rendre. */
export class MapView {
  constructor(onMove) {
    this.onMove = onMove
    this.el = document.getElementById('map')
    this.buildingEl = document.getElementById('building')
    document.getElementById('btn-map-close').onclick = () => this.close()
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.close()
    })
  }

  get isOpen() {
    return !this.el.classList.contains('hidden')
  }

  /** @param {string} current pièce actuelle  @param {Record<string,string[]>} occupants pièce -> ids */
  open(current, occupants) {
    this.buildingEl.innerHTML = floors
      .map(
        (f) => `<div class="floor">
          <div class="floor-name">${f.name}</div>
          <div class="floor-rooms">${f.rooms.map((r) => this.roomHTML(r, r === current, occupants[r] || [])).join('')}</div>
        </div>`,
      )
      .join('')
    this.buildingEl.querySelectorAll('.room').forEach((btn) => {
      btn.onclick = () => {
        this.close()
        if (btn.dataset.room !== current) this.onMove(btn.dataset.room)
      }
    })
    this.el.classList.remove('hidden')
  }

  roomHTML(id, here, people) {
    const loc = locations[id]
    const heads = people
      .map((p) => `<span class="mini-head" title="${characters[p].name}" style="--c:${characters[p].color}">${portraitSVG(p, characters[p].look, 'neutral', { crop: true })}</span>`)
      .join('')
    return `<button class="room ${here ? 'here' : ''}" data-room="${id}">
      <span class="room-icon">${loc.icon}</span>
      <span class="room-name">${loc.name}</span>
      ${loc.sub ? `<span class="room-sub">${loc.sub}</span>` : ''}
      <span class="room-heads">${heads || '<i>personne</i>'}</span>
      ${here ? '<span class="here-tag">📍 Tu es ici</span>' : ''}
    </button>`
  }

  close() {
    this.el.classList.add('hidden')
  }
}
