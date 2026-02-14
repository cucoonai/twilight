import logo from './assets/logo.png'

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fillRule="evenodd" />
    </svg>
  )
}

function App() {
  return (
    <>
      <div className="bg-motion" aria-hidden>
        <div className="bg-motion__blob bg-motion__blob--1" />
        <div className="bg-motion__blob bg-motion__blob--2" />
        <div className="bg-motion__blob bg-motion__blob--3" />
      </div>
      <header className="header">
        <a href="/" className="header__brand" aria-label="Cucoon AI home">
          <img src={logo} alt="" className="header__logo" width={28} height={28} />
          <span className="header__title">cucoon</span>
        </a>
        <a
          href="https://x.com/daksh__verma"
          target="_blank"
          rel="noopener noreferrer"
          className="header__connect"
          aria-label="Connect on X (Twitter)"
        >
          <XIcon />
          Connect
        </a>
      </header>
      <div className="root__main">
      <main className="landing" role="main">
        <span className="landing__badge" aria-hidden>Coming soon</span>
        <h1 className="landing__title">
          <span className="landing__title-line">Build your AI Workforce</span>
        </h1>
        <p className="landing__description">
          Transform your project roadmaps into autonomous execution engines. Define
          the mission, Monitor the progress.
        </p>
        <div className="landing__line" aria-hidden />
      </main>
      </div>
    </>
  )
}

export default App
