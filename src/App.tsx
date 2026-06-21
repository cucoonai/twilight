import { useEffect, useRef } from 'react'
import logo from './assets/logo.png'

// WebGL Shader Background Component
function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function syncSize() {
      if (!canvas) return
      const w = canvas.clientWidth || 1280
      const h = canvas.clientHeight || 720
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
    }

    const resizeObserver = new ResizeObserver(syncSize)
    resizeObserver.observe(canvas)
    syncSize()

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    const fsSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      varying vec2 v_texCoord;

      float grid(vec2 uv, float res) {
        vec2 g = fract(uv * res);
        return 1.0 - smoothstep(0.0, 0.05, min(g.x, g.y));
      }

      void main() {
        vec2 uv = v_texCoord;
        vec2 mouse = u_mouse / u_resolution;

        vec2 movingUV = uv + (mouse - 0.5) * 0.05;
        float g1 = grid(movingUV, 20.0) * 0.1;
        float g2 = grid(movingUV + 0.1, 5.0) * 0.05;

        float noise = fract(sin(dot(uv + u_time * 0.01, vec2(12.9898, 78.233))) * 43758.5453);
        float artifacts = step(0.999, noise) * 0.5;

        float final_color = g1 + g2 + artifacts;

        float dist = distance(uv, mouse);
        float glow = smoothstep(0.2, 0.0, dist) * 0.2;
        final_color += glow;

        gl_FragColor = vec4(vec3(final_color), 1.0);
      }
    `

    function createShader(glCtx: WebGLRenderingContext, type: number, source: string) {
      const shader = glCtx.createShader(type)
      if (!shader) return null
      glCtx.shaderSource(shader, source)
      glCtx.compileShader(shader)
      return shader
    }

    const program = gl.createProgram()
    if (!program) return

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource)
    if (!vs || !fs) return

    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    const posAttr = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(posAttr)
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, 'u_time')
    const uRes = gl.getUniformLocation(program, 'u_resolution')
    const uMouse = gl.getUniformLocation(program, 'u_mouse')

    const mouse = { x: canvas.width / 2, y: canvas.height / 2 }

    function handleMouseMove(event: MouseEvent) {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width
        const ny = 1.0 - (event.clientY - rect.top) / rect.height
        mouse.x = nx * canvas.width
        mouse.y = ny * canvas.height
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    let animationId: number

    function render(t: number) {
      if (!canvas || !gl) return
      syncSize()
      gl.viewport(0, 0, canvas.width, canvas.height)
      if (uTime) gl.uniform1f(uTime, t * 0.001)
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height)
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animationId = requestAnimationFrame(render)
    }

    animationId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      resizeObserver.disconnect()
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="shader-bg">
      <canvas ref={canvasRef} />
    </div>
  )
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="feature-card">
      <div className="feature-card__icon-wrap">
        <span className="material-symbols-outlined feature-card__icon">{icon}</span>
      </div>
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__description">{description}</p>
    </div>
  )
}

// Timeline Step Component
function TimelineStep({
  icon,
  number,
  title,
  description,
  side,
}: {
  icon: string
  number: string
  title: string
  description: string
  side: 'left' | 'right'
}) {
  return (
    <div className={`timeline-step ${side === 'right' ? 'timeline-step--right' : ''}`}>
      {side === 'left' ? (
        <>
          <div className="timeline-step__text">
            <h3 className="timeline-step__title">{title}</h3>
            <p className="timeline-step__description">{description}</p>
          </div>
          <div className="timeline-step__node">
            <span className="material-symbols-outlined timeline-step__node-icon">{icon}</span>
            <span className="timeline-step__number">{number}</span>
          </div>
          <div className="timeline-step__spacer timeline-step__spacer--right" />
        </>
      ) : (
        <>
          <div className="timeline-step__spacer timeline-step__spacer--left" />
          <div className="timeline-step__node">
            <span className="material-symbols-outlined timeline-step__node-icon">{icon}</span>
            <span className="timeline-step__number">{number}</span>
          </div>
          <div className="timeline-step__text">
            <h3 className="timeline-step__title">{title}</h3>
            <p className="timeline-step__description">{description}</p>
          </div>
        </>
      )}
    </div>
  )
}

// Features data
const features = [
  { icon: 'security', title: 'Sandboxed Agents', description: 'Run untrusted code in secure, isolated environments.' },
  { icon: 'terminal', title: 'Custom SDK', description: 'Build and deploy your own proprietary agents with ease.' },
  { icon: 'history', title: 'Session Management', description: 'Persistent memory and state across all agent interactions.' },
  { icon: 'account_tree', title: 'MCP Support', description: 'Native support for Model Context Protocol to bridge data and agents.' },
  { icon: 'cloud_sync', title: 'Flexible Deployment', description: 'Deploy on AWS or your own in-house K8s clusters.' },
  { icon: 'key', title: 'Secret Management', description: 'Securely handle API keys and credentials with enterprise-grade encryption.' },
  { icon: 'storefront', title: 'Extensive Marketplace', description: 'Access a library of pre-trained agents for every use case.' },
]

function App() {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Intersection observer for fade-in animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).style.animationPlayState = 'running'
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('.fade-in-up').forEach((el) => {
      ;(el as HTMLElement).style.animationPlayState = 'paused'
      observer.observe(el)
    })

    // Clone carousel items for infinite scroll
    const track = trackRef.current
    if (track) {
      const items = Array.from(track.children)
      items.forEach((item) => {
        const clone = item.cloneNode(true) as HTMLElement
        track.appendChild(clone)
      })
    }

    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Background Layers */}
      <ShaderBackground />
      <div className="bg-grid" aria-hidden="true" />

      {/* Top Left Logo */}
      <header className="header-logo">
        <img src="/nests-logo.png" alt="Nest Logo" className="header-logo__img" />
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero fade-in-up">
          <div className="hero__logo">
            <img src={logo} alt="CUCOON Logo" />
          </div>
          <h1 className="hero__title">
            Your AI Workforce,<br />on Slack.
          </h1>
          <p className="hero__description">
            Host your own custom agents or hire industry-leading experts from our
            marketplace. Seamlessly integrated into your Slack workspace.
          </p>
          <div className="hero__actions">
            <a
              href="https://x.com/daksh__verma"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Connect
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </section>

        {/* Features Carousel */}
        <section className="features fade-in-up" id="features">
          <div className="features__header">
            <h2 className="features__title">Features</h2>
          </div>
          <div className="carousel-container">
            <div className="carousel-track" ref={trackRef}>
              {features.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Setup and Start Timeline */}
        <section className="timeline fade-in-up delay-200" id="how-it-works">
          <div className="timeline__header">
            <h2 className="timeline__title">Setup and Start</h2>
          </div>
          <div className="timeline__content">
            <div className="timeline__steps">
              <TimelineStep
                icon="hub"
                number="01"
                title="Select or Create"
                description="Choose a pre-trained agent from our marketplace or define a custom prompt for your specific needs."
                side="left"
              />
              <TimelineStep
                icon="settings_ethernet"
                number="02"
                title="Configure"
                description="Set permissions, data access levels, and operational hours. Fine-tune the agent's parameters."
                side="right"
              />
              <TimelineStep
                icon="cable"
                number="03"
                title="Connect to Slack"
                description="Deploy instantly. Your agent joins relevant channels and is ready to execute commands."
                side="left"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <img src={logo} alt="cucoon logo" />
            <span className="footer__badge">Coming Soon</span>
          </div>
          <nav className="footer__links">
            <a href="https://x.com/daksh__verma" target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              Discord
            </a>
          </nav>
        </div>
      </footer>
    </>
  )
}

export default App
