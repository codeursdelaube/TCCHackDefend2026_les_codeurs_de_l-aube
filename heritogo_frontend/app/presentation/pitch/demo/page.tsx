import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HeriTogo — Démo Vidéo · Présentation',
  description:
    'Démonstration vidéo complète de la plateforme HeriTogo (Guide touristique et patrimoine culturel du Togo).',
  robots: { index: false, follow: false },
}

export default function DemoPage() {
  const videoUrl = '/heritogo.mp4'
  const pdfUrl = '/HeriTogo_Pitch_Deck.pdf'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :root {
          --terracotta: #B5502E;
          --terracotta-hover: #983e20;
          --gold: #D9A441;
          --gold-hover: #e5b352;
          --ink: #14100c;
          --card-bg: #1c1611;
          --border: rgba(232, 220, 207, 0.14);
          --ivory: #FBF6EF;
          --muted: #a39587;
        }

        html, body {
          min-height: 100%;
          background: var(--ink);
          font-family: 'Manrope', system-ui, -apple-system, sans-serif;
          color: #f5efe6;
          line-height: 1.5;
        }

        .demo-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: radial-gradient(circle at 50% 20%, rgba(181, 80, 46, 0.12) 0%, rgba(20, 16, 12, 1) 70%);
        }

        /* ── HEADER ── */
        .demo-header {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.9rem 2rem;
          background: rgba(28, 22, 17, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 50;
          gap: 1rem;
        }

        .brand-link {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          text-decoration: none;
          color: inherit;
        }

        .brand-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--gold);
          letter-spacing: -0.02em;
        }

        .brand-badge {
          background: rgba(217, 164, 65, 0.15);
          color: var(--gold);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
          border: 1px solid rgba(217, 164, 65, 0.3);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.6rem 1.15rem;
          border-radius: 9999px;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
          white-space: nowrap;
        }

        .btn-pitch {
          background: rgba(217, 164, 65, 0.15);
          color: var(--gold);
          border: 1px solid rgba(217, 164, 65, 0.35);
        }

        .btn-pitch:hover {
          background: rgba(217, 164, 65, 0.25);
          border-color: var(--gold);
          transform: translateY(-1px);
        }

        .btn-home {
          background: rgba(255, 255, 255, 0.08);
          color: #f5efe6;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .btn-home:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        /* ── MAIN CONTENT ── */
        .demo-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2.5rem 1.5rem 4rem;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
        }

        .demo-title-block {
          text-align: center;
          margin-bottom: 2rem;
          max-width: 700px;
        }

        .demo-tag {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 0.5rem;
        }

        .demo-heading {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(1.8rem, 4vw, 2.75rem);
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
          margin-bottom: 0.75rem;
        }

        .demo-desc {
          font-size: 1rem;
          color: var(--muted);
          line-height: 1.6;
        }

        /* ── VIDEO CONTAINER ── */
        .video-wrapper {
          width: 100%;
          background: #000000;
          border-radius: 1.25rem;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(217, 164, 65, 0.25);
          position: relative;
        }

        .video-player {
          width: 100%;
          max-height: 75vh;
          display: block;
          outline: none;
          background: #000;
        }

        /* ── BOTTOM ACTIONS ── */
        .demo-footer-actions {
          margin-top: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn-download-video {
          background: var(--terracotta);
          color: #ffffff;
          padding: 0.75rem 1.6rem;
          box-shadow: 0 4px 15px rgba(181, 80, 46, 0.4);
        }

        .btn-download-video:hover {
          background: var(--terracotta-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(181, 80, 46, 0.6);
        }

        .btn-view-pitch {
          background: rgba(255, 255, 255, 0.08);
          color: #f5efe6;
          border: 1px solid var(--border);
          padding: 0.75rem 1.5rem;
        }

        .btn-view-pitch:hover {
          background: rgba(255, 255, 255, 0.16);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        @media (max-width: 640px) {
          .demo-header {
            padding: 0.75rem 1rem;
          }
          .brand-badge {
            display: none;
          }
          .demo-main {
            padding: 1.5rem 1rem 3rem;
          }
          .demo-heading {
            font-size: 1.5rem;
          }
          .btn-download-video, .btn-view-pitch {
            width: 100%;
          }
        }
      `}</style>

      <div className="demo-page">
        <header className="demo-header">
          <a href="https://heritogo.codorah.com" className="brand-link">
            <span className="brand-title">HeriTogo</span>
            <span className="brand-badge">Démo Vidéo</span>
          </a>

          <div className="header-actions">
            <a href="/presentation/pitch" className="btn btn-pitch">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Voir le Pitch Deck</span>
            </a>

            <a href="https://heritogo.codorah.com" className="btn btn-home">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span>Site HeriTogo</span>
            </a>
          </div>
        </header>

        <main className="demo-main">
          <div className="demo-title-block">
            <span className="demo-tag">Plateforme &amp; Vision IA</span>
            <h1 className="demo-heading">Démonstration de HeriTogo</h1>
            <p className="demo-desc">
              Découvrez la plateforme en action : valorisation du patrimoine togolais, exploration des monuments, scanner IA et réservation de guides locaux.
            </p>
          </div>

          <div className="video-wrapper">
            <video
              className="video-player"
              controls
              playsInline
              preload="metadata"
              poster="/Hero2.webp"
              src={videoUrl}
            >
              Votre navigateur ne supporte pas la lecture de vidéos HTML5.
            </video>
          </div>

          <div className="demo-footer-actions">
            <a
              href="/presentation/pitch"
              className="btn btn-view-pitch"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <span>Consulter le Pitch Deck PDF</span>
            </a>

            <a
              href={videoUrl}
              download="HeriTogo_Demo.mp4"
              className="btn btn-download-video"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Télécharger la vidéo</span>
            </a>
          </div>
        </main>
      </div>
    </>
  )
}
