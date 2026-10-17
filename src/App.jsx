import { useEffect, useRef, useState } from 'react'
import { profile, experience, projects, skills, education, interests } from './data.js'

function useScrollState(ids) {
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0)
      let cur = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) cur = id
      }
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [ids])
  return { progress, active }
}

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.1 },
    )
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

const NAV = [
  ['about', 'ABOUT'],
  ['experience', 'EXPERIENCE'],
  ['projects', 'PROJECTS'],
  ['skills', 'SKILLS'],
  ['education', 'EDUCATION'],
  ['interests', 'INTERESTS'],
  ['playground', 'PLAYGROUND'],
]

const SECRET_SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a', 'Enter']

function BugHunt() {
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(15)
  const [target, setTarget] = useState(4)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [message, setMessage] = useState('Start a round and catch as many bugs as you can.')

  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setTimeout(() => {
      if (time <= 1) {
        setTime(0)
        setPlaying(false)
        setMessage('Time is up. Try again to beat your best score.')
      } else {
        setTime(time - 1)
      }
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [playing, time])

  useEffect(() => {
    if (!playing) return undefined
    const moveTarget = window.setInterval(() => setTarget(Math.floor(Math.random() * 9)), 900)
    return () => window.clearInterval(moveTarget)
  }, [playing])

  const start = () => {
    setScore(0)
    setTime(15)
    setTarget(Math.floor(Math.random() * 9))
    setMessage('Find the highlighted bug!')
    setPlaying(true)
  }

  const hitCell = (cell) => {
    if (!playing) return
    if (cell === target) {
      const nextScore = score + 1
      setScore(nextScore)
      setBest((record) => Math.max(record, nextScore))
      setMessage('Bug fixed. Keep going!')
      setTarget((current) => (current + 1 + Math.floor(Math.random() * 8)) % 9)
    } else {
      setMessage('No bug there. Keep looking.')
    }
  }

  return (
    <article className="arcade-card">
      <span className="project-index">01 / QUICK GAME</span>
      <h3>BUG HUNT</h3>
      <p>Click the highlighted tile before it jumps to a new spot.</p>
      <div className="game-stats">
        <span>TIME <strong>{time}s</strong></span>
        <span>SCORE <strong>{score}</strong></span>
        <span>BEST <strong>{best}</strong></span>
      </div>
      <div className="bug-grid" role="group" aria-label="Bug Hunt game board">
        {Array.from({ length: 9 }, (_, cell) => (
          <button
            key={cell}
            className={`bug-cell ${playing && target === cell ? 'target' : ''}`}
            aria-label={playing && target === cell ? `Bug at tile ${cell + 1}` : `Empty tile ${cell + 1}`}
            onClick={() => hitCell(cell)}
            disabled={!playing}
          >
            {playing && target === cell ? 'BUG' : '·'}
          </button>
        ))}
      </div>
      <p className="game-message" role="status">{message}</p>
      <button className="btn" onClick={start}>{playing ? 'RESTART ROUND' : 'START 15-SECOND ROUND'}</button>
    </article>
  )
}

function makeMemoryDeck() {
  const values = ['{ }', '</>', 'SQL', 'API']
  const deck = [...values, ...values].map((value, index) => ({ id: `${value}-${index}`, value }))
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const card = deck[i]
    deck[i] = deck[j]
    deck[j] = card
  }
  return deck
}

function MemoryMatch() {
  const [deck, setDeck] = useState(makeMemoryDeck)
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const mismatchTimeout = useRef(null)

  useEffect(() => () => window.clearTimeout(mismatchTimeout.current), [])

  const reset = () => {
    window.clearTimeout(mismatchTimeout.current)
    setDeck(makeMemoryDeck())
    setFlipped([])
    setMatched([])
    setAttempts(0)
    setLocked(false)
  }

  const reveal = (index) => {
    if (locked || flipped.includes(index) || matched.includes(index)) return
    const next = [...flipped, index]
    setFlipped(next)
    if (next.length < 2) return

    setAttempts((count) => count + 1)
    if (deck[next[0]].value === deck[next[1]].value) {
      setMatched((cards) => [...cards, ...next])
      setFlipped([])
      return
    }

    setLocked(true)
    mismatchTimeout.current = window.setTimeout(() => {
      setFlipped([])
      setLocked(false)
    }, 650)
  }

  const complete = matched.length === deck.length

  return (
    <article className="arcade-card">
      <span className="project-index">02 / QUICK GAME</span>
      <h3>CODE MEMORY</h3>
      <p>Match the pairs of familiar code symbols.</p>
      <div className="game-stats">
        <span>TRIES <strong>{attempts}</strong></span>
        <span>PAIRS <strong>{matched.length / 2}/4</strong></span>
      </div>
      <div className="memory-grid">
        {deck.map((card, index) => {
          const faceUp = flipped.includes(index) || matched.includes(index)
          return (
            <button
              key={card.id}
              className={`memory-card ${faceUp ? 'face-up' : ''} ${matched.includes(index) ? 'matched' : ''}`}
              aria-label={faceUp ? `Card ${index + 1}: ${card.value}` : `Reveal card ${index + 1}`}
              aria-pressed={faceUp}
              onClick={() => reveal(index)}
              disabled={locked || matched.includes(index)}
            >
              {faceUp ? card.value : '?'}
            </button>
          )
        })}
      </div>
      <p className="game-message" role="status">{complete ? `All pairs matched in ${attempts} tries. Nice work!` : 'Find all four pairs to complete the board.'}</p>
      <button className="btn" onClick={reset}>{complete ? 'PLAY AGAIN' : 'SHUFFLE & RESET'}</button>
    </article>
  )
}

function SecretFound({ onClose }) {
  const dialogRef = useRef(null)
  useEffect(() => dialogRef.current?.focus(), [])

  return (
    <div className="secret-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        ref={dialogRef}
        className="secret-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="secret-title"
        tabIndex="-1"
        onKeyDown={(event) => event.key === 'Escape' && onClose()}
      >
        <span className="project-index">SECRET UNLOCKED</span>
        <h2 id="secret-title">NICE INPUT.</h2>
        <p>You found the hidden developer easter egg. Consider this a tiny reward for exploring.</p>
        <div className="secret-pixels" aria-hidden="true">■ ▪ ■ ▪ ■</div>
        <button className="btn" onClick={onClose}>BACK TO PROFILE</button>
      </section>
    </div>
  )
}

function Typewriter({ words }) {
  const [i, setI] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[i]
    const delay = !deleting && text === word ? 1400 : deleting ? 40 : 80
    const t = setTimeout(() => {
      if (!deleting && text === word) setDeleting(true)
      else if (deleting && text === '') {
        setDeleting(false)
        setI((i + 1) % words.length)
      } else setText(word.slice(0, text.length + (deleting ? -1 : 1)))
    }, delay)
    return () => clearTimeout(t)
  }, [text, deleting, i, words])

  return (
    <span>
      {text}
      <span className="cursor">_</span>
    </span>
  )
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="section reveal">
      <h2 className="section-title">
        <span className="section-mark" aria-hidden="true">/</span> {title}
      </h2>
      <div className="panel">{children}</div>
    </section>
  )
}

function CommandPalette({ commands, onClose }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef(null)
  const matches = commands.filter((command) =>
    `${command.label} ${command.description}`.toLowerCase().includes(query.toLowerCase()),
  )

  useEffect(() => inputRef.current?.focus(), [])

  useEffect(() => setSelected(0), [query])

  return (
    <div className="command-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose()
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setSelected((current) => (current + 1) % Math.max(matches.length, 1))
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            setSelected((current) => (current - 1 + matches.length) % Math.max(matches.length, 1))
          }
          if (event.key === 'Enter' && matches[selected]) {
            event.preventDefault()
            matches[selected].run()
            onClose()
          }
        }}
      >
        <label className="sr-only" htmlFor="command-search">Search actions</label>
        <input
          ref={inputRef}
          id="command-search"
          className="command-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search sections and actions..."
        />
        <div className="command-list" role="listbox" aria-label="Actions">
          {matches.length ? matches.map((command, index) => (
            <button
              key={command.label}
              className={`command-option ${selected === index ? 'selected' : ''}`}
              role="option"
              aria-selected={selected === index}
              onMouseEnter={() => setSelected(index)}
              onClick={() => {
                command.run()
                onClose()
              }}
            >
              <span>{command.label}</span>
              <small>{command.description}</small>
            </button>
          )) : <p className="command-empty">No matching actions.</p>}
        </div>
        <footer className="command-hint"><kbd>↑</kbd><kbd>↓</kbd> navigate <kbd>Enter</kbd> select <kbd>Esc</kbd> close</footer>
      </section>
    </div>
  )
}

function Project({ pr, n }) {
  const [open, setOpen] = useState(false)
  return (
    <article className={`card ${open ? 'open' : ''}`}>
      <span className="project-index">0{n + 1} / PROJECT</span>
      <h3>{pr.title}</h3>
      <ul className="list">
        {(open ? pr.points : pr.points.slice(0, 1)).map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <button
        className="btn"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? 'SHOW LESS −' : 'READ MORE +'}
      </button>
    </article>
  )
}

function Avatar() {
  const map = [
    '..hhhh..',
    '.hhhhhh.',
    '.ssssss.',
    '.sesses.',
    '.ssssss.',
    '..bbbb..',
    '.bbbbbb.',
    '..l..l..',
  ]
  const colors = { h: '#253d3a', s: '#d2aa87', e: '#20312f', b: '#65d6c4', l: '#447d78' }
  return (
    <div className="avatar-wrap">
      <svg className="avatar" viewBox="0 0 8 8" shapeRendering="crispEdges" role="img" aria-label="Pixel portrait">
        {map.flatMap((row, y) =>
          [...row].map((c, x) => (c === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={colors[c]} />)),
        )}
      </svg>
    </div>
  )
}

export default function App() {
  const ids = NAV.map(([id]) => id)
  const { progress, active } = useScrollState(ids)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [query, setQuery] = useState('')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [emailStatus, setEmailStatus] = useState('')
  const [secretFound, setSecretFound] = useState(false)
  useReveal()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    let progress = 0
    const onKeyDown = (event) => {
      if (event.repeat || event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      if (key === SECRET_SEQUENCE[progress]) {
        progress += 1
        if (progress === SECRET_SEQUENCE.length) {
          progress = 0
          setSecretFound(true)
        }
      } else {
        progress = key === SECRET_SEQUENCE[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setEmailStatus('Email copied')
    } catch {
      setEmailStatus('Copy unavailable — use the email link')
    }
    window.setTimeout(() => setEmailStatus(''), 2500)
  }

  const commands = [
    ...NAV.map(([id, label]) => ({
      label: `Go to ${label.toLowerCase()}`,
      description: `Navigate to ${label.toLowerCase()} section`,
      run: () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }),
    })),
    {
      label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`,
      description: 'Change the page color theme',
      run: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
    { label: 'Copy email address', description: profile.email, run: copyEmail },
  ]

  const q = query.trim().toLowerCase()
  const filteredSkills = skills
    .map((s) => ({ ...s, items: s.items.filter((it) => !q || it.toLowerCase().includes(q) || s.group.toLowerCase().includes(q)) }))
    .filter((s) => s.items.length)

  return (
    <>
      <div className="xp" aria-hidden="true">
        <div className="xp-fill" style={{ width: `${progress}%` }} />
      </div>
      <nav className="nav">
        {NAV.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={active === id ? 'active' : ''}>
            {label}
          </a>
        ))}
        <button
          className="btn command-trigger"
          onClick={() => setPaletteOpen(true)}
          aria-label="Open command palette"
          aria-haspopup="dialog"
          aria-expanded={paletteOpen}
        >
          COMMANDS <kbd>CTRL / ⌘ K</kbd>
        </button>
        <button className="btn theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
        </button>
      </nav>

      <header className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot" /> DEVELOPER PROFILE <span className="eyebrow-separator">/</span> INDONESIA</p>
            <h1>{profile.name}</h1>
            <p className="titles"><Typewriter words={profile.titles} /></p>
            <p className="hero-intro">Building and maintaining web applications, backend services, and reliable API integrations for enterprise systems.</p>
            <ul className="contacts">
              <li>{profile.location}</li>
              <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li>
              <li><button className="copy-email" onClick={copyEmail}>COPY EMAIL</button></li>
              <li><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></li>
              <li><a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a></li>
            </ul>
            {emailStatus && <p className="email-status" role="status">{emailStatus}</p>}
          </div>
          <div className="portrait-frame">
            <span className="portrait-label">PIXEL PORTRAIT</span>
            <Avatar />
            <span className="portrait-coordinate">ID / 01</span>
          </div>
        </div>
      </header>

      <main>
        <Section id="about" title="PROFESSIONAL SUMMARY">
          {profile.summary.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Section>

        <Section id="experience" title="PROFESSIONAL EXPERIENCE">
          {experience.map((job) => (
            <div key={job.role} className="job">
              <div className="job-head">
                <h3>{job.role}</h3>
                <span className="badge">{job.period}</span>
              </div>
              <p className="company">{job.company}</p>
              <ul className="list">
                {job.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>

        <Section id="projects" title="SELECTED PROJECTS">
          <div className="grid">
            {projects.map((pr, n) => (
              <Project key={pr.title} pr={pr} n={n} />
            ))}
          </div>
        </Section>

        <Section id="skills" title="TECHNICAL SKILLS">
          <input
            className="search"
            type="search"
            placeholder="Search skills (e.g. PHP, SQL)"
            aria-label="Search skills"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {!filteredSkills.length && <p>No matching skills found. Try another keyword.</p>}
          {filteredSkills.map((s) => (
            <div key={s.group} className="skill-group">
              <h3>{s.group}</h3>
              <div className="chips">
                {s.items.map((it) => (
                  <button key={it} className="chip" onClick={() => setQuery(it)}>
                    {it}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Section>

        <Section id="education" title="EDUCATION">
          <h3>{education.school}</h3>
          <p>{education.degree}</p>
          <span className="badge">Graduated: {education.graduated}</span>
        </Section>

        <Section id="interests" title="PROFESSIONAL INTERESTS">
          <ul className="list">
            {interests.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </Section>

        <Section id="playground" title="DEVELOPER PLAYGROUND">
          <p className="playground-intro">A couple of tiny pixel breaks between deployments.</p>
          <div className="arcade-grid">
            <BugHunt />
            <MemoryMatch />
          </div>
          <p className="easter-hint">There may also be a classic controller combo hidden somewhere on this page.</p>
        </Section>
      </main>

      <button className="btn totop" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
        BACK TO TOP
      </button>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Evannoah R. Pratama <span aria-hidden="true">·</span> BUILT WITH REACT</p>
      </footer>
      {paletteOpen && <CommandPalette commands={commands} onClose={() => setPaletteOpen(false)} />}
      {secretFound && <SecretFound onClose={() => setSecretFound(false)} />}
    </>
  )
}
