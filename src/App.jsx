import { useEffect, useState } from 'react'
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
]

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
  useReveal()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

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
              <li><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></li>
              <li><a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a></li>
            </ul>
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
                  <span key={it} className="chip">
                    {it}
                  </span>
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
      </main>

      <button className="btn totop" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
        BACK TO TOP
      </button>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Evannoah R. Pratama <span aria-hidden="true">·</span> BUILT WITH REACT</p>
      </footer>
    </>
  )
}
