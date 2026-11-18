import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HeriTogo — Pitch Deck · Novembre 2026',
  description:
    'Le patrimoine togolais, dans votre poche. Guide touristique et plateforme de valorisation du patrimoine culturel du Togo.',
  robots: { index: false, follow: false },
}

export default function PitchPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=Manrope:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --terracotta: #B5502E;
          --terracotta-light: #D97A52;
          --gold: #D9A441;
          --forest: #3E5C45;
          --ivory: #FBF6EF;
          --cream: #F4EAD4;
          --ink: #2A1E16;
          --muted: #7A6A5C;
          --border: #E8DCCF;
          --white: #FFFFFF;
        }

        body {
          font-family: 'Manrope', system-ui, sans-serif;
          background: var(--ivory);
          color: var(--ink);
          line-height: 1.6;
        }

        .pitch-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(251,246,239,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          padding: 0.75rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pitch-nav .logo {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--terracotta);
          text-decoration: none;
        }

        .pitch-nav .badge {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .pitch-nav .cta-nav {
          background: var(--terracotta);
          color: white;
          padding: 0.5rem 1.25rem;
          border-radius: 2rem;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 600;
          transition: background 0.2s;
        }

        .pitch-nav .cta-nav:hover { background: #8A3A20; }

        main { padding-top: 4rem; }

        /* ── SLIDE ── */
        .slide {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 5rem 2rem 4rem;
          position: relative;
          overflow: hidden;
        }

        .slide + .slide { border-top: 1px solid var(--border); }

        .slide-inner {
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
        }

        .slide-number {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--terracotta);
          margin-bottom: 0.5rem;
        }

        .slide-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 0.75rem;
        }

        h1, h2, h3 {
          font-family: 'Fraunces', Georgia, serif;
        }

        /* ── SLIDE 1: HERO ── */
        .slide-hero {
          background: var(--ink);
          color: var(--ivory);
          position: relative;
        }

        .slide-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url('/Sites/koutamakou.jpg') center/cover no-repeat;
          opacity: 0.18;
        }

        .slide-hero .slide-inner {
          position: relative;
          z-index: 1;
        }

        .hero-pretitle {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 1.25rem;
        }

        .hero-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(2.5rem, 7vw, 5.5rem);
          font-weight: 700;
          line-height: 1.1;
          color: var(--ivory);
          margin-bottom: 1.5rem;
        }

        .hero-title span { color: var(--gold); }

        .hero-sub {
          font-size: clamp(1rem, 2.5vw, 1.3rem);
          color: rgba(251,246,239,0.75);
          max-width: 600px;
          margin-bottom: 2.5rem;
        }

        .hero-meta {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .hero-meta a {
          color: var(--gold);
          font-weight: 600;
          text-decoration: none;
          font-size: 0.95rem;
        }

        .hero-meta span { color: rgba(251,246,239,0.4); }

        .cta-primary {
          display: inline-block;
          background: var(--terracotta);
          color: white;
          padding: 0.875rem 2rem;
          border-radius: 2.5rem;
          text-decoration: none;
          font-weight: 700;
          font-size: 1rem;
          transition: background 0.2s, transform 0.15s;
        }

        .cta-primary:hover { background: var(--terracotta-light); transform: translateY(-2px); }

        /* ── CARDS GRID ── */
        .cards-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
          margin-top: 2.5rem;
        }

        .card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 1.25rem;
          padding: 1.75rem;
        }

        .card-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 0.875rem;
          background: var(--cream);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .card h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--ink);
        }

        .card p {
          font-size: 0.9rem;
          color: var(--muted);
          line-height: 1.6;
        }

        /* ── STAT GRID ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
          margin-top: 2.5rem;
        }

        .stat-box {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 1.25rem;
          padding: 1.5rem;
          text-align: center;
        }

        .stat-value {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 2.25rem;
          font-weight: 700;
          color: var(--terracotta);
          line-height: 1.1;
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--muted);
          margin-top: 0.4rem;
          line-height: 1.4;
        }

        /* ── SECTION TITLES ── */
        .section-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(1.75rem, 4vw, 2.75rem);
          font-weight: 700;
          line-height: 1.2;
          color: var(--ink);
          margin-bottom: 0.75rem;
        }

        .section-sub {
          font-size: clamp(0.95rem, 2vw, 1.1rem);
          color: var(--muted);
          max-width: 640px;
          margin-bottom: 0.5rem;
        }

        /* ── SLIDE BG VARIANTS ── */
        .slide-cream { background: var(--cream); }
        .slide-dark { background: var(--ink); color: var(--ivory); }
        .slide-dark .section-title { color: var(--ivory); }
        .slide-dark .section-sub { color: rgba(251,246,239,0.7); }
        .slide-dark .card { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.12); }
        .slide-dark .card h3 { color: var(--ivory); }
        .slide-dark .card p { color: rgba(251,246,239,0.65); }
        .slide-dark .card-icon { background: rgba(255,255,255,0.1); }
        .slide-dark .stat-box { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.12); }
        .slide-dark .stat-label { color: rgba(251,246,239,0.6); }

        /* ── FEATURES ROW ── */
        .feature-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
          margin-top: 2.5rem;
        }

        .feature-item {
          border-left: 3px solid var(--terracotta);
          padding: 0.75rem 1rem;
        }

        .feature-item .fi-icon { font-size: 1.75rem; margin-bottom: 0.5rem; }
        .feature-item h4 { font-weight: 700; margin-bottom: 0.3rem; font-size: 0.95rem; }
        .feature-item p { font-size: 0.85rem; color: var(--muted); }

        /* ── STEPS ── */
        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-top: 2.5rem;
        }

        .step {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .step-num {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: var(--terracotta);
          color: white;
          font-weight: 700;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Fraunces', Georgia, serif;
          flex-shrink: 0;
        }

        .step h4 { font-weight: 700; font-size: 1rem; }
        .step p { font-size: 0.875rem; color: var(--muted); }

        /* ── BIG NUMBERS ── */
        .catalog-numbers {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 2.5rem;
        }

        .catalog-num {
          flex: 1;
          min-width: 140px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 1.25rem;
          padding: 1.5rem 1.25rem;
          text-align: center;
        }

        .catalog-num .num {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 3rem;
          font-weight: 700;
          color: var(--terracotta);
          line-height: 1;
        }

        .catalog-num .lbl {
          font-size: 0.8rem;
          color: var(--muted);
          margin-top: 0.4rem;
        }

        /* ── COMPETITION TABLE ── */
        .comp-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 2rem;
          font-size: 0.9rem;
        }

        .comp-table th {
          background: var(--cream);
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 700;
          border-bottom: 2px solid var(--border);
          font-size: 0.8rem;
          letter-spacing: 0.05em;
        }

        .comp-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }

        .comp-table tr:last-child { background: var(--cream); font-weight: 700; }
        .comp-table tr:last-child td { color: var(--terracotta); }

        .check { color: var(--forest); font-size: 1.1rem; }
        .cross { color: var(--muted); font-size: 1rem; }
        .partial { color: var(--gold); font-size: 1rem; }

        /* ── ROADMAP ── */
        .roadmap {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-top: 2.5rem;
        }

        .roadmap-col {
          border-radius: 1.25rem;
          padding: 1.75rem;
        }

        .roadmap-col.now { background: var(--terracotta); color: white; }
        .roadmap-col.next { background: var(--white); border: 1px solid var(--border); }
        .roadmap-col.later { background: var(--white); border: 1px solid var(--border); }

        .roadmap-col h3 {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .roadmap-col.now h3 { color: rgba(255,255,255,0.8); }
        .roadmap-col.next h3, .roadmap-col.later h3 { color: var(--muted); }

        .roadmap-col .rw-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .roadmap-col.now .rw-title { color: white; }
        .roadmap-col.next .rw-title, .roadmap-col.later .rw-title { color: var(--ink); }

        .roadmap-col ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .roadmap-col.now li { color: rgba(255,255,255,0.9); font-size: 0.9rem; }
        .roadmap-col.next li, .roadmap-col.later li { color: var(--muted); font-size: 0.9rem; }

        .roadmap-col li::before { content: '→ '; font-weight: 700; opacity: 0.7; }

        /* ── TEAM ── */
        .team-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 1.5rem;
          padding: 2rem;
          display: flex;
          gap: 2rem;
          align-items: flex-start;
          flex-wrap: wrap;
          margin-top: 2.5rem;
        }

        .team-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--terracotta), var(--gold));
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Fraunces', Georgia, serif;
          font-size: 2rem;
          color: white;
          flex-shrink: 0;
        }

        .team-info h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .team-info .role {
          color: var(--terracotta);
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .team-pillars {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .team-pillar {
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 0.5rem 0.875rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--muted);
        }

        .program-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--cream);
          border: 1px solid var(--border);
          border-radius: 2rem;
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--ink);
          margin-top: 0.75rem;
        }

        /* ── CTA FINALE ── */
        .slide-final {
          background: var(--ink);
          color: var(--ivory);
          text-align: center;
        }

        .slide-final .section-title { color: var(--ivory); font-size: clamp(2rem, 5vw, 3.5rem); }
        .slide-final .section-sub { color: rgba(251,246,239,0.65); margin: 0 auto 2.5rem; }

        .final-links {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .final-links a {
          color: var(--gold);
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
        }

        .divider {
          width: 3rem;
          height: 3px;
          background: var(--terracotta);
          border-radius: 2px;
          margin: 1rem 0 1.5rem;
        }

        .slide-final .divider { margin: 1rem auto 1.5rem; }

        /* ── RISK GRID ── */
        .risk-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 1.25rem;
          margin-top: 2.5rem;
        }

        .risk-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 1.25rem;
          padding: 1.5rem;
        }

        .risk-icon { font-size: 1.75rem; margin-bottom: 0.75rem; }
        .risk-card h4 { font-weight: 700; margin-bottom: 0.4rem; font-size: 0.95rem; }
        .risk-card .risk-text { font-size: 0.85rem; color: var(--muted); margin-bottom: 0.75rem; }
        .risk-response {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--forest);
          background: rgba(62,92,69,0.1);
          border-radius: 0.5rem;
          padding: 0.4rem 0.75rem;
        }

        /* ── REVENUE GRID ── */
        .revenue-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-top: 2.5rem;
        }

        .revenue-card {
          border-radius: 1.25rem;
          padding: 1.75rem;
          border: 1px solid var(--border);
          background: var(--white);
        }

        .revenue-card.highlight {
          background: var(--terracotta);
          border-color: var(--terracotta);
          color: white;
        }

        .revenue-card .rev-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .revenue-card.highlight .rev-label { color: rgba(255,255,255,0.75); }
        .revenue-card:not(.highlight) .rev-label { color: var(--muted); }

        .revenue-card h3 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .revenue-card.highlight h3 { color: white; }

        .revenue-card p { font-size: 0.875rem; color: var(--muted); }
        .revenue-card.highlight p { color: rgba(255,255,255,0.8); }

        .revenue-card .rev-note {
          font-size: 0.75rem;
          font-style: italic;
          margin-top: 0.75rem;
          color: var(--muted);
        }
        .revenue-card.highlight .rev-note { color: rgba(255,255,255,0.65); }

        /* ── FOOTER ── */
        .pitch-footer {
          border-top: 1px solid var(--border);
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--muted);
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .pitch-footer a { color: var(--terracotta); text-decoration: none; }

        /* ── RESPONSIVE ── */
        @media (max-width: 640px) {
          .slide { padding: 4rem 1.25rem 3rem; }
          .pitch-nav { padding: 0.75rem 1.25rem; }
          .comp-table { font-size: 0.78rem; }
          .comp-table th, .comp-table td { padding: 0.5rem 0.6rem; }
        }

        /* ── SCAN FEATURE ── */
        .scan-feature {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
          margin-top: 2rem;
        }

        @media (max-width: 768px) { .scan-feature { grid-template-columns: 1fr; } }

        .scan-steps { display: flex; flex-direction: column; gap: 1.25rem; }

        .scan-step {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .scan-step-num {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: var(--terracotta);
          color: white;
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .scan-step p { font-size: 0.95rem; }

        .scan-mockup {
          background: var(--ink);
          border-radius: 2rem;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .scan-mockup-screen {
          width: 100%;
          background: rgba(255,255,255,0.08);
          border-radius: 1.25rem;
          padding: 1.5rem;
          text-align: center;
          color: var(--ivory);
        }

        .scan-mockup-screen .scan-icon { font-size: 3rem; margin-bottom: 0.5rem; }
        .scan-mockup-screen .scan-title { font-family: 'Fraunces', Georgia, serif; font-size: 1rem; color: var(--gold); margin-bottom: 0.25rem; }
        .scan-mockup-screen .scan-desc { font-size: 0.75rem; color: rgba(251,246,239,0.65); }
      `}</style>

      {/* NAV */}
      <nav className="pitch-nav">
        <a href="https://heritogo.codorah.com" className="logo">HeriTogo</a>
        <span className="badge">Pitch Deck · Novembre 2026</span>
        <a href="https://heritogo.codorah.com" className="cta-nav">Visiter le site →</a>
      </nav>

      <main>

        {/* ── SLIDE 1: HERO ── */}
        <section className="slide slide-hero">
          <div className="slide-inner">
            <p className="hero-pretitle">Pitch Deck · Novembre 2026</p>
            <h1 className="hero-title">
              Le patrimoine togolais,<br />
              <span>dans votre poche.</span>
            </h1>
            <p className="hero-sub">
              Guide touristique et plateforme de valorisation<br />
              du patrimoine culturel du Togo.
            </p>
            <div className="hero-meta">
              <a href="https://heritogo.codorah.com" target="_blank" rel="noreferrer">
                heritogo.codorah.com
              </a>
              <span>·</span>
              <span style={{color:'rgba(251,246,239,0.55)', fontSize:'0.9rem'}}>Codorah · Lomé, Togo</span>
            </div>
          </div>
        </section>

        {/* ── SLIDE 2: LE CONSTAT ── */}
        <section className="slide">
          <div className="slide-inner">
            <p className="slide-label">Le Constat</p>
            <h2 className="section-title">Un patrimoine riche,<br />encore difficile à découvrir</h2>
            <div className="divider" />
            <div className="cards-3">
              <div className="card">
                <div className="card-icon">📍</div>
                <h3>Une information dispersée</h3>
                <p>Sites, régions, plats et lieux de loisirs ne sont pas réunis au même endroit.</p>
              </div>
              <div className="card">
                <div className="card-icon">🤝</div>
                <h3>Peu de repères de confiance</h3>
                <p>Trouver un guide local fiable, avec un prix clair, reste une démarche incertaine.</p>
              </div>
              <div className="card">
                <div className="card-icon">🌐</div>
                <h3>Des visiteurs de partout</h3>
                <p>Les voyageurs parlent français, anglais, espagnol ou chinois : l'histoire des lieux doit les suivre.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SLIDE 3: LE MARCHÉ AFRIQUE ── */}
        <section className="slide slide-cream">
          <div className="slide-inner">
            <p className="slide-label">Le Marché · Afrique</p>
            <h2 className="section-title">L'Afrique est la région du monde<br />où le tourisme progresse le plus vite</h2>
            <div className="divider" />
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-value">+8%</div>
                <div className="stat-label">d'arrivées en Afrique en 2025, la hausse régionale la plus forte</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">81,3M</div>
                <div className="stat-label">arrivées internationales en Afrique en 2025</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">1,52Md</div>
                <div className="stat-label">arrivées internationales dans le monde en 2025 (+4%)</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">1 200$</div>
                <div className="stat-label">dépensés en moyenne par voyage international en 2025</div>
              </div>
            </div>
            <p style={{marginTop:'1.5rem', fontSize:'0.75rem', color:'var(--muted)'}}>
              Source : UN Tourism, World Tourism Barometer (janv. et mai 2026)
            </p>
          </div>
        </section>

        {/* ── SLIDE 4: LE MARCHÉ TOGO ── */}
        <section className="slide">
          <div className="slide-inner">
            <p className="slide-label">Le Marché · Togo</p>
            <h2 className="section-title">Au Togo, le tourisme pèse<br />déjà environ 4% du PIB</h2>
            <div className="divider" />
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-value">4,0%</div>
                <div className="stat-label">du PIB : contribution du tourisme (2023)</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">3,0%</div>
                <div className="stat-label">de l'emploi : contribution du tourisme (2023)</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">500K+</div>
                <div className="stat-label">arrivées en 2024, au-delà de l'objectif national</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">25Md</div>
                <div className="stat-label">FCFA de recettes touristiques en 2021</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">685</div>
                <div className="stat-label">établissements touristiques agréés dont 213 hôtels (mai 2024)</div>
              </div>
            </div>
            <p style={{marginTop:'1.5rem', fontSize:'0.75rem', color:'var(--muted)'}}>
              Sources : WTTC via Banque mondiale ; Togo First (ministère du Tourisme)
            </p>
          </div>
        </section>

        {/* ── SLIDE 5: POURQUOI MAINTENANT ── */}
        <section className="slide slide-cream">
          <div className="slide-inner">
            <p className="slide-label">Pourquoi Maintenant</p>
            <h2 className="section-title">Quatre vents porteurs<br />pour une plateforme locale</h2>
            <div className="divider" />
            <div className="feature-row">
              <div className="feature-item">
                <div className="fi-icon">✈️</div>
                <h4>Visa levé pour les Africains</h4>
                <p>Annoncé en mai 2026 : Lomé vise le statut de hub régional. Préinscription en ligne requise.</p>
              </div>
              <div className="feature-item">
                <div className="fi-icon">📱</div>
                <h4>Un pays mobile</h4>
                <p>8,69M d'abonnements mobiles fin sept. 2025, dont 4,93M en data 3G/4G.</p>
              </div>
              <div className="feature-item">
                <div className="fi-icon">🏛️</div>
                <h4>Un marché du patrimoine</h4>
                <p>Estimé à 639Md USD en 2025 et 954Md USD en 2034, selon un cabinet d'analyse.</p>
              </div>
              <div className="feature-item">
                <div className="fi-icon">🏛</div>
                <h4>Un État mobilisé</h4>
                <p>Réhabilitation de sites, événements culturels et plateforme Togotourisme lancée en 2022.</p>
              </div>
            </div>
            <p style={{marginTop:'1.5rem', fontSize:'0.75rem', color:'var(--muted)'}}>
              Sources : AllAfrica, Visasnews ; Togo First ; Fortune Business Insights ; OSIRIS
            </p>
          </div>
        </section>

        {/* ── SLIDE 6: LA RÉPONSE ── */}
        <section className="slide slide-dark">
          <div className="slide-inner">
            <p className="slide-label" style={{color:'rgba(251,246,239,0.5)'}}>La Réponse</p>
            <h2 className="section-title">Une seule plateforme pour explorer,<br />comprendre et visiter</h2>
            <div className="divider" />
            <div className="cards-3">
              <div className="card">
                <div className="card-icon">🗺️</div>
                <h3>Explorer</h3>
                <p>Lieux, régions et géolocalisation des sites les plus proches.</p>
              </div>
              <div className="card">
                <div className="card-icon">📸</div>
                <h3>Comprendre</h3>
                <p>Scanner IA et audio-guide multilingue pour raconter chaque monument.</p>
              </div>
              <div className="card">
                <div className="card-icon">🍽️</div>
                <h3>Savourer</h3>
                <p>Cuisine togolaise, parcs et loisirs à découvrir.</p>
              </div>
              <div className="card">
                <div className="card-icon">🧑‍🤝‍🧑</div>
                <h3>Visiter</h3>
                <p>Guides locaux vérifiés, devis fermes et avis après visite.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SLIDE 7: LE PRODUIT ── */}
        <section className="slide">
          <div className="slide-inner">
            <p className="slide-label">Le Produit</p>
            <h2 className="section-title">Explorer par lieux et par régions</h2>
            <div className="divider" />
            <div className="cards-3">
              <div className="card">
                <div className="card-icon">📍</div>
                <h3>Lieux</h3>
                <p>Recherche, filtres par région, vue grille ou carte. 29 sites patrimoniaux référencés, dont Koutammakou (UNESCO).</p>
              </div>
              <div className="card">
                <div className="card-icon">🌍</div>
                <h3>Régions</h3>
                <p>Cinq régions, cinq univers : du Littoral aux Savanes, en passant par la Kara, les Plateaux et la Centrale.</p>
              </div>
              <div className="card">
                <div className="card-icon">🌳</div>
                <h3>Loisirs & Parcs</h3>
                <p>16 espaces de loisirs et parcs pour compléter votre itinéraire touristique au Togo.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SLIDE 8: FONCTIONNALITÉ SIGNATURE ── */}
        <section className="slide slide-cream">
          <div className="slide-inner">
            <p className="slide-label">Fonctionnalité Signature</p>
            <h2 className="section-title">Photographiez un monument,<br />l'IA raconte son histoire</h2>
            <div className="divider" />
            <div className="scan-feature">
              <div className="scan-steps">
                <div className="scan-step">
                  <div className="scan-step-num">1</div>
                  <p>Pointez l'appareil ou importez une photo.</p>
                </div>
                <div className="scan-step">
                  <div className="scan-step-num">2</div>
                  <p>L'IA identifie l'édifice en quelques secondes.</p>
                </div>
                <div className="scan-step">
                  <div className="scan-step-num">3</div>
                  <p>Une synthèse vocale lance l'audio-guide multilingue dans votre langue.</p>
                </div>
                <div style={{marginTop:'1rem'}}>
                  <a href="https://heritogo.codorah.com/fr/scan" className="cta-primary" target="_blank" rel="noreferrer">
                    Essayer le scanner →
                  </a>
                </div>
              </div>
              <div className="scan-mockup">
                <div className="scan-mockup-screen">
                  <div className="scan-icon">📷</div>
                  <div className="scan-title">🏛 Koutammakou</div>
                  <div className="scan-desc">Site du patrimoine mondial UNESCO · Région Kara</div>
                </div>
                <div className="scan-mockup-screen" style={{background:'rgba(217,164,65,0.15)'}}>
                  <div style={{color:'var(--gold)', fontWeight:700, fontSize:'0.85rem', marginBottom:'0.4rem'}}>🔊 Audio-guide</div>
                  <div style={{color:'rgba(251,246,239,0.7)', fontSize:'0.75rem'}}>
                    &ldquo;Le pays Batammariba est un remarquable exemple d'architecture vernaculaire…&rdquo;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SLIDE 9: GUIDES LOCAUX ── */}
        <section className="slide">
          <div className="slide-inner">
            <p className="slide-label">Guides Locaux Vérifiés</p>
            <h2 className="section-title">Visiter avec un guide de confiance</h2>
            <div className="divider" />
            <div className="steps">
              <div className="step">
                <div className="step-num">01</div>
                <div>
                  <h4>Choisir un guide vérifié</h4>
                  <p>Comparez langues, zones couvertes, tarifs indicatifs et avis. Chaque guide est vérifié par l'équipe avant publication.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">02</div>
                <div>
                  <h4>Recevoir un devis ferme</h4>
                  <p>Demande gratuite et sans engagement, réponse en XOF. Les coordonnées ne sont partagées qu'après acceptation.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">03</div>
                <div>
                  <h4>Visiter, puis évaluer</h4>
                  <p>Après la visite, votre avis vérifié aide les prochains voyageurs à choisir en confiance.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SLIDE 10: LE CATALOGUE ── */}
        <section className="slide slide-cream">
          <div className="slide-inner">
            <p className="slide-label">Le Catalogue en Ligne</p>
            <h2 className="section-title">Un contenu déjà riche et multilingue</h2>
            <div className="divider" />
            <div className="catalog-numbers">
              <div className="catalog-num">
                <div className="num">29</div>
                <div className="lbl">sites patrimoniaux</div>
              </div>
              <div className="catalog-num">
                <div className="num">5</div>
                <div className="lbl">régions touristiques</div>
              </div>
              <div className="catalog-num">
                <div className="num">31</div>
                <div className="lbl">plats de la gastronomie</div>
              </div>
              <div className="catalog-num">
                <div className="num">16</div>
                <div className="lbl">espaces parcs &amp; loisirs</div>
              </div>
              <div className="catalog-num">
                <div className="num">4</div>
                <div className="lbl">langues : FR · EN · ES · ZH</div>
              </div>
            </div>
            <p style={{marginTop:'1.5rem', fontSize:'0.75rem', color:'var(--muted)'}}>
              Chiffres affichés par les catégories du site au 18 novembre 2026.
            </p>
          </div>
        </section>

        {/* ── SLIDE 11: MODÈLE ÉCONOMIQUE ── */}
        <section className="slide">
          <div className="slide-inner">
            <p className="slide-label">Modèle Économique</p>
            <h2 className="section-title">Trois leviers de revenus</h2>
            <div className="divider" />
            <div className="revenue-grid">
              <div className="revenue-card highlight">
                <div className="rev-label">Offre Premium</div>
                <h3>Abonnement voyageur</h3>
                <p>Une offre Premium existe déjà sur le site, supprimant les publicités et offrant des fonctionnalités avancées.</p>
                <div className="rev-note">Tarif à préciser en XOF/mois</div>
              </div>
              <div className="revenue-card">
                <div className="rev-label">Guides</div>
                <h3>Mise en relation</h3>
                <p>Devis fermes en XOF entre voyageurs et guides vérifiés. Commission ou abonnement guide à préciser.</p>
                <div className="rev-note" style={{color:'var(--muted)'}}>Modèle à finaliser</div>
              </div>
              <div className="revenue-card">
                <div className="rev-label">Partenaires</div>
                <h3>Partenariats</h3>
                <p>Pistes : offices du tourisme, hôtels, sites patrimoniaux, institutions culturelles togolaises.</p>
                <div className="rev-note" style={{color:'var(--muted)'}}>À définir avec les partenaires</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SLIDE 12: CONCURRENCE ── */}
        <section className="slide slide-cream">
          <div className="slide-inner">
            <p className="slide-label">Concurrence</p>
            <h2 className="section-title">Personne ne réunit patrimoine,<br />IA et guides locaux pour le Togo</h2>
            <div className="divider" />
            <div style={{overflowX:'auto'}}>
              <table className="comp-table">
                <thead>
                  <tr>
                    <th>Alternative</th>
                    <th>Contenu Togo</th>
                    <th>Multilingue</th>
                    <th>Guides vérifiés</th>
                    <th>Devis en XOF</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Plateformes mondiales de visites</td>
                    <td><span className="cross">Faible</span></td>
                    <td><span className="check">✓ Oui</span></td>
                    <td><span className="partial">Partiel</span></td>
                    <td><span className="cross">✗ Non</span></td>
                  </tr>
                  <tr>
                    <td>Portail officiel du tourisme</td>
                    <td><span className="check">✓ Oui</span></td>
                    <td><span className="partial">Partiel</span></td>
                    <td><span className="cross">✗ Non</span></td>
                    <td><span className="cross">✗ Non</span></td>
                  </tr>
                  <tr>
                    <td>Agences &amp; bouche-à-oreille</td>
                    <td><span className="check">✓ Oui</span></td>
                    <td><span className="partial">Variable</span></td>
                    <td><span className="partial">Informel</span></td>
                    <td><span className="partial">Variable</span></td>
                  </tr>
                  <tr>
                    <td><strong>HeriTogo</strong></td>
                    <td><span className="check">✓ Oui</span></td>
                    <td><span className="check">✓ 4 langues</span></td>
                    <td><span className="check">✓ Oui</span></td>
                    <td><span className="check">✓ Oui</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{marginTop:'1rem', fontSize:'0.75rem', color:'var(--muted)', fontStyle:'italic'}}>
              Lecture qualitative, à confirmer par une veille concurrentielle chiffrée avant la présentation.
            </p>
          </div>
        </section>

        {/* ── SLIDE 13: RISQUES ── */}
        <section className="slide">
          <div className="slide-inner">
            <p className="slide-label">Risques &amp; Réponses</p>
            <h2 className="section-title">Ce qui peut freiner le marché,<br />et comment on y répond</h2>
            <div className="divider" />
            <div className="risk-grid">
              <div className="risk-card">
                <div className="risk-icon">⚠️</div>
                <h4>Sécurité au nord</h4>
                <p className="risk-text">Des avis de voyage déconseillent certaines zones des Savanes.</p>
                <div className="risk-response">→ Alertes de sécurité par lieu, mises à jour avec les sources officielles.</div>
              </div>
              <div className="risk-card">
                <div className="risk-icon">✈️</div>
                <h4>Billets d'avion chers</h4>
                <p className="risk-text">La liaison Europe–Lomé reste chère et limite les arrivées.</p>
                <div className="risk-response">→ Marché régional et diaspora, favorisés par le visa levé pour les Africains.</div>
              </div>
              <div className="risk-card">
                <div className="risk-icon">📶</div>
                <h4>Internet encore limité</h4>
                <p className="risk-text">Environ 37% de la population utilise internet.</p>
                <div className="risk-response">→ Site léger, mobile d'abord, contenus consultables hors ligne à l'étude.</div>
              </div>
              <div className="risk-card">
                <div className="risk-icon">📊</div>
                <h4>Données de marché fragiles</h4>
                <p className="risk-text">Les séries d'arrivées varient selon les sources.</p>
                <div className="risk-response">→ Valider les chiffres avec le ministère avant toute levée.</div>
              </div>
            </div>
            <p style={{marginTop:'1.5rem', fontSize:'0.75rem', color:'var(--muted)'}}>
              Sources : avis de voyage officiels ; Togo First ; données télécoms
            </p>
          </div>
        </section>

        {/* ── SLIDE 14: FEUILLE DE ROUTE ── */}
        <section className="slide slide-cream">
          <div className="slide-inner">
            <p className="slide-label">Feuille de Route</p>
            <h2 className="section-title">De la plateforme en ligne vers l'échelle</h2>
            <div className="divider" />
            <div className="roadmap">
              <div className="roadmap-col now">
                <h3>Aujourd'hui</h3>
                <div className="rw-title">En ligne</div>
                <ul>
                  <li>Catalogue de sites, régions, cuisine et parcs</li>
                  <li>Scanner IA et audio-guide multilingue</li>
                  <li>Guides vérifiés et devis en XOF</li>
                </ul>
              </div>
              <div className="roadmap-col next">
                <h3>Prochaine étape</h3>
                <div className="rw-title">Élargir</div>
                <ul>
                  <li>Enrichir le catalogue et le réseau de guides</li>
                  <li>Nouveaux objectifs : sites &amp; guides à définir</li>
                </ul>
              </div>
              <div className="roadmap-col later">
                <h3>Ensuite</h3>
                <div className="rw-title">Étendre</div>
                <ul>
                  <li>Nouveaux partenaires et nouveaux marchés</li>
                  <li>Échéance et pays cibles à définir</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── SLIDE 15: L'ÉQUIPE ── */}
        <section className="slide">
          <div className="slide-inner">
            <p className="slide-label">L&apos;Équipe</p>
            <h2 className="section-title">Codorah, studio tech<br />ancré à Lomé</h2>
            <div className="divider" />
            <div className="team-card">
              <div className="team-avatar">EA</div>
              <div className="team-info">
                <h3>Elodie Atana</h3>
                <div className="role">Fondatrice de Codorah · Full Stack Engineer &amp; AI Solutions Architect</div>
                <p style={{fontSize:'0.9rem', color:'var(--muted)', maxWidth:'520px'}}>
                  Basée à Lomé, au Togo. 15+ produits livrés dans les secteurs EdTech, HealthTech, FinTech et SaaS pour les entreprises.
                </p>
                <div className="team-pillars">
                  <div className="team-pillar">🤖 Conseil &amp; formation en IA</div>
                  <div className="team-pillar">⚙️ Plateformes développées sur mesure</div>
                  <div className="team-pillar">🏢 2 piliers Codorah</div>
                </div>
                <div className="program-badge">
                  🤖 Codorah participe au programme <strong>Claude for Startups</strong> d&apos;Anthropic
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SLIDE 16: FINALE ── */}
        <section className="slide slide-final">
          <div className="slide-inner" style={{textAlign:'center'}}>
            <p className="slide-label" style={{color:'rgba(251,246,239,0.45)', textAlign:'center'}}>Prochaine Étape</p>
            <h2 className="section-title">
              Construisons ensemble<br />le guide numérique<br />du patrimoine togolais
            </h2>
            <div className="divider" style={{margin:'1rem auto 1.5rem'}} />
            <p className="section-sub" style={{textAlign:'center', marginInline:'auto', color:'rgba(251,246,239,0.65)', marginBottom:'2.5rem'}}>
              Soutien recherché : financement, partenariat ou pilote
            </p>
            <a
              href="https://heritogo.codorah.com"
              className="cta-primary"
              target="_blank"
              rel="noreferrer"
            >
              Visiter heritogo.codorah.com →
            </a>
            <div className="final-links">
              <a href="https://heritogo.codorah.com" target="_blank" rel="noreferrer">heritogo.codorah.com</a>
              <span style={{color:'rgba(251,246,239,0.3)'}}>·</span>
              <a href="https://codorah.com" target="_blank" rel="noreferrer">codorah.com</a>
              <span style={{color:'rgba(251,246,239,0.3)'}}>·</span>
              <span style={{color:'rgba(251,246,239,0.45)', fontSize:'0.9rem'}}>Elodie Atana · Codorah</span>
            </div>
          </div>
        </section>

      </main>

      <footer className="pitch-footer">
        <span>HeriTogo · Pitch Deck · Novembre 2026</span>
        <span>Codorah · <a href="https://codorah.com" target="_blank" rel="noreferrer">codorah.com</a></span>
        <a href="https://heritogo.codorah.com" target="_blank" rel="noreferrer">heritogo.codorah.com</a>
      </footer>
    </>
  )
}
