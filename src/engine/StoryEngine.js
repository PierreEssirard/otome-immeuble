import { Compiler, Story } from 'inkjs/full'

const SAVE_KEY = 'otome-immeuble:save:v3'

/**
 * Enveloppe autour d'inkjs : compile le script, avance ligne par ligne,
 * parse les tags et gère la sauvegarde.
 *
 * Convention de script (voir story/main.ink) :
 *   romane: Bonjour !         -> réplique de Romane
 *   moi: ...  / coloc: ...    -> le perso joué / l'autre coloc
 *   Texte sans préfixe        -> narration
 *   # bg: toit                -> change le décor
 *   # show: romane happy      -> affiche Romane avec l'expression "happy"
 *   # hide: romane  /  # clear
 */
export class StoryEngine {
  constructor(inkSource) {
    const compiler = new Compiler(inkSource)
    const compiled = compiler.Compile()
    if (compiler.errors.length) {
      throw new Error('Erreurs ink :\n' + compiler.errors.join('\n'))
    }
    compiler.warnings.forEach((w) => console.warn('[ink]', w))
    this.storyJson = compiled.ToJson()
    this.story = new Story(this.storyJson)
  }

  restart() {
    this.story = new Story(this.storyJson)
  }

  /** Saute à un knot (ex. "talk_romane"). */
  goTo(path) {
    this.story.ChoosePathString(path)
  }

  /** Renvoie la prochaine "étape" : une ligne de texte, des choix, ou la fin. */
  next() {
    if (this.story.canContinue) {
      const raw = this.story.Continue().trim()
      const commands = this.story.currentTags.map(parseTag)
      if (!raw) return { type: 'commands', commands }
      return { type: 'line', commands, ...parseLine(raw) }
    }
    if (this.story.currentChoices.length) {
      return {
        type: 'choices',
        choices: this.story.currentChoices.map((c) => ({ index: c.index, text: c.text })),
      }
    }
    return { type: 'end' }
  }

  choose(index) {
    this.story.ChooseChoiceIndex(index)
  }

  getVar(name) {
    return this.story.variablesState.$(name)
  }

  setVar(name, value) {
    this.story.variablesState.$(name, value)
  }

  save(extra = {}) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ state: this.story.state.ToJson(), extra, date: Date.now() }))
      return true
    } catch {
      return false
    }
  }

  saveInfo() {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  saveExtra() {
    return this.saveInfo()?.extra
  }

  load() {
    const data = this.saveInfo()
    if (!data) return false
    this.restart()
    this.story.state.LoadJson(data.state)
    return true
  }
}

function parseLine(raw) {
  const m = raw.match(/^([a-zA-Z0-9_]+)\s*:\s*(.+)$/)
  if (m) return { speaker: m[1].toLowerCase(), text: m[2] }
  return { speaker: null, text: raw }
}

function parseTag(tag) {
  const [cmd, ...rest] = tag.split(':')
  const args = rest.join(':').trim().split(/\s+/).filter(Boolean)
  return { cmd: cmd.trim().toLowerCase(), args }
}
