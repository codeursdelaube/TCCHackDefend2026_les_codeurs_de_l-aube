import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HeriTogo — Pitch Deck (Présentation)',
  description:
    'Aperçu et téléchargement de la présentation Pitch Deck de HeriTogo (Novembre 2026).',
  robots: { index: false, follow: false },
}

export default function PitchDeckPage() {
  const pdfUrl = '/HeriTogo_Pitch_Deck.pdf'
  const demoUrl = '/presentation/pitch/demo'

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
          --ink: #1f1510;
          --ivory: #FBF6EF;
          --border: #E8DCCF;
          --muted: #7A6A5C;
        }

        html, body {
          height: 100%;
          background: #14100c;
          font-family: 'Manrope', system-ui, -apple-system, sans-serif;
          color: #f5efe6;
          overflow: hidden;
        }

        .pitch-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          background: #17120e;
          position: relative;
        }

        /* ── HEADER ── */
        .pitch-header {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.5rem;
          background: #201712;
          border-bottom: 1px solid rgba(232, 220, 207, 0.12);
          z-index: 10;
          gap: 1rem;
        }

        .pitch-brand {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          text-decoration: none;
          color: inherit;
        }

        .pitch-logo {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--gold);
          letter-spacing: -0.02em;
        }

        .pitch-badge {
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

        .pitch-actions {
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

        .btn-demo-header {
          background: rgba(217, 164, 65, 0.15);
          color: var(--gold);
          border: 1px solid rgba(217, 164, 65, 0.35);
        }

        .btn-demo-header:hover {
          background: rgba(217, 164, 65, 0.25);
          border-color: var(--gold);
          transform: translateY(-1px);
        }

        .btn-download {
          background: var(--terracotta);
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(181, 80, 46, 0.4);
        }

        .btn-download:hover {
          background: var(--terracotta-hover);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(181, 80, 46, 0.6);
        }

        .btn-ghost {
          background: rgba(255, 255, 255, 0.08);
          color: #f5efe6;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .btn-ghost:hover {
          background: rgba(255, 255, 255, 0.16);
          border-color: rgba(255, 255, 255, 0.3);
        }

        /* ── BOUTON FLOTTANT AU MILIEU DE LA PAGE ── */
        .btn-demo-center {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          background: linear-gradient(135deg, #B5502E 0%, #D9A441 100%);
          color: #ffffff;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 1rem;
          font-weight: 700;
          padding: 0.85rem 1.85rem;
          border-radius: 9999px;
          text-decoration: none;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.65), 0 0 20px rgba(217, 164, 65, 0.35);
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(10px);
        }

        .btn-demo-center:hover {
          transform: translateX(-50%) translateY(-3px) scale(1.03);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.8), 0 0 28px rgba(217, 164, 65, 0.55);
          border-color: rgba(255, 255, 255, 0.45);
        }

        .play-icon-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 50%;
        }

        /* ── PDF VIEWER ── */
        .pdf-viewer-wrap {
          flex: 1;
          width: 100%;
          height: 100%;
          position: relative;
          background: #0f0d0a;
        }

        .pdf-frame {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }

        .fallback-box {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
          background: #17120e;
        }

        .fallback-box h2 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.5rem;
          color: var(--gold);
          margin-bottom: 0.5rem;
        }

        .fallback-box p {
          color: #b5a898;
          max-width: 460px;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .fallback-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        @media (max-width: 640px) {
          .pitch-header {
            padding: 0.65rem 1rem;
          }
          .pitch-badge {
            display: none;
          }
          .btn-ghost span, .btn-demo-header span {
            display: none;
          }
          .btn {
            padding: 0.5rem 0.8rem;
            font-size: 0.8rem;
          }
          .btn-demo-center {
            bottom: 1.25rem;
            padding: 0.75rem 1.5rem;
            font-size: 0.9rem;
          }
        }
      `}</style>

      <div className="pitch-container">
        <header className="pitch-header">
          <a href="https://heritogo.codorah.com" className="pitch-brand">
            <span className="pitch-logo">HeriTogo</span>
            <span className="pitch-badge">Pitch Deck · Nov 2026</span>
          </a>

          <div className="pitch-actions">
            <a
              href={demoUrl}
              className="btn btn-demo-header"
              title="Regarder la démonstration vidéo"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Voir la démo</span>
            </a>

            <a
              href="https://heritogo.codorah.com"
              className="btn btn-ghost"
              title="Retourner au site"
            >
              <span>Accueil</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>

            <a
              href={pdfUrl}
              download="HeriTogo_Pitch_Deck.pdf"
              className="btn btn-download"
              title="Télécharger le fichier PDF sur votre appareil"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Télécharger le PDF</span>
            </a>
          </div>
        </header>

        {/* Bouton au milieu de la page : Voir la démo */}
        <a href={demoUrl} className="btn-demo-center" title="Voir la démonstration vidéo de HeriTogo">
          <span className="play-icon-circle">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          </span>
          <span>Voir la démo</span>
        </a>

        <main className="pdf-viewer-wrap">
          <object
            data={`${pdfUrl}#toolbar=1&navpanes=1`}
            type="application/pdf"
            className="pdf-frame"
          >
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=1`}
              className="pdf-frame"
              title="HeriTogo Pitch Deck PDF"
            >
              <div className="fallback-box">
                <h2>HeriTogo Pitch Deck</h2>
                <p>
                  Votre navigateur n&apos;affiche pas directement l&apos;aperçu PDF. Cliquez ci-dessous pour télécharger ou ouvrir la présentation.
                </p>
                <div className="fallback-actions">
                  <a
                    href={pdfUrl}
                    download="HeriTogo_Pitch_Deck.pdf"
                    className="btn btn-download"
                  >
                    Télécharger le Pitch Deck (PDF)
                  </a>
                  <a
                    href={demoUrl}
                    className="btn btn-demo-header"
                  >
                    Voir la démo
                  </a>
                </div>
              </div>
            </iframe>
          </object>
        </main>
      </div>
    </>
  )
}
