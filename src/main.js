import './style.css'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { GRUPO, EMPRESAS } from './empresas.js'

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
const N = EMPRESAS.length
const SEPARACION = 80 // distancia entre universos
const dosDigitos = (n) => String(n).padStart(2, '0')

// ---------------------------------------------------------------- Interfaz

const app = document.querySelector('#app')
document.title = GRUPO.nombre
app.innerHTML = `
  <button type="button" class="sonido" aria-pressed="false">
    Sonido <span class="barras" aria-hidden="true"><i></i><i></i><i></i></span>
  </button>

  <header class="marca"><img src="${GRUPO.logo}" alt="${GRUPO.nombre}" /></header>

  <h1 class="titulo" aria-live="polite">
    <span class="linea"><span></span></span>
    <span class="linea"><span></span></span>
  </h1>

  <nav class="puntos" aria-label="Empresas"></nav>

  <p class="contador"><span class="contador-num"></span><span class="contador-nombre"></span></p>

  <div class="explorar-zona">
    <button type="button" class="hotspot" aria-label="Explorar servicios"><span></span></button>
    <button type="button" class="explorar">Explorar</button>
  </div>

  <aside class="detalle" aria-hidden="true">
    <button type="button" class="detalle-cerrar" aria-label="Cerrar">Cerrar <span>×</span></button>
    <div class="detalle-cuerpo">
      <div class="detalle-intro">
        <img class="detalle-logo" alt="" />
        <p class="detalle-kicker">Servicios</p>
        <h2 class="detalle-nombre"></h2>
        <p class="detalle-desc"></p>
        <a class="detalle-cta" href="#">Contactar</a>
      </div>
      <ol class="detalle-lista"></ol>
    </div>
  </aside>

  <div class="intro" role="presentation">
    <img src="${GRUPO.logo}" alt="${GRUPO.nombre}" class="intro-logo" />
    <button type="button" class="intro-saltar">Saltar</button>
  </div>
`

const $ = (s) => app.querySelector(s)
const ui = {
  lineas: [...app.querySelectorAll('.titulo .linea > span')],
  titulo: $('.titulo'),
  puntos: $('.puntos'),
  num: $('.contador-num'),
  nombre: $('.contador-nombre'),
  detalle: $('.detalle'),
  intro: $('.intro'),
  sonido: $('.sonido'),
}

const botonesPuntos = EMPRESAS.map((e, i) => {
  const b = document.createElement('button')
  b.type = 'button'
  b.setAttribute('aria-label', e.nombre)
  b.dataset.nombre = e.nombre
  b.addEventListener('click', () => irA(i))
  ui.puntos.append(b)
  return b
})

// ---------------------------------------------------------------- Render

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.setSize(innerWidth, innerHeight)
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.05
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
app.prepend(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x050404)
scene.fog = new THREE.FogExp2(0x050404, 0.017)

const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
scene.environmentIntensity = 0.55

const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 300)

scene.add(new THREE.HemisphereLight(0xffffff, 0x100c0a, 0.25))

const suelo = new THREE.Mesh(
  new THREE.PlaneGeometry(SEPARACION * N + 200, 200),
  new THREE.MeshStandardMaterial({ color: 0x14110f, roughness: 0.5, metalness: 0.35 }),
)
suelo.rotation.x = -Math.PI / 2
suelo.position.x = ((N - 1) * SEPARACION) / 2
suelo.receiveShadow = true
scene.add(suelo)

// ---------------------------------------------------------------- Texturas

function aleatorio(semilla) {
  return () => {
    semilla = (semilla + 0x6d2b79f5) | 0
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Paisaje de montañas para la pantalla panorámica de cada universo
function paisaje({ cielo, montes }, semilla) {
  const W = 2048
  const H = 720
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  const rnd = aleatorio(semilla * 977 + 13)

  const g = ctx.createLinearGradient(0, 0, 0, H * 0.8)
  g.addColorStop(0, cielo[0])
  g.addColorStop(1, cielo[1])
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  const sol = ctx.createRadialGradient(W * 0.55, H * 0.5, 0, W * 0.55, H * 0.5, W * 0.35)
  sol.addColorStop(0, 'rgba(255,255,255,0.35)')
  sol.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = sol
  ctx.fillRect(0, 0, W, H)

  montes.forEach((color, capa) => {
    const base = H * (0.5 + capa * 0.1)
    const amp = 150 - capa * 22
    const f = [rnd() * 6, rnd() * 6, rnd() * 6]
    const pico = 0.3 + rnd() * 0.4
    ctx.beginPath()
    ctx.moveTo(0, H)
    for (let x = 0; x <= W; x += 6) {
      const t = x / W
      const y =
        base -
        amp * (0.5 * Math.sin(t * 6 + f[0]) + 0.3 * Math.sin(t * 13 + f[1]) + 0.15 * Math.sin(t * 31 + f[2])) -
        amp * 1.3 * Math.exp(-(((t - pico) * 5) ** 2)) * (capa === 1 ? 1 : 0.45)
      ctx.lineTo(x, y)
    }
    ctx.lineTo(W, H)
    ctx.fillStyle = color
    ctx.fill()

    // Neblina entre capas para dar profundidad
    if (capa < montes.length - 1) {
      const n = ctx.createLinearGradient(0, base - amp, 0, H)
      n.addColorStop(0, 'rgba(255,255,255,0)')
      n.addColorStop(1, 'rgba(255,255,255,0.12)')
      ctx.fillStyle = n
      ctx.fillRect(0, base - amp, W, H)
    }
  })

  // Grano fino
  const img = ctx.getImageData(0, 0, W, H)
  for (let i = 0; i < img.data.length; i += 4) {
    const r = (rnd() - 0.5) * 14
    img.data[i] += r
    img.data[i + 1] += r
    img.data[i + 2] += r
  }
  ctx.putImageData(img, 0, 0)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  // La pantalla se ve desde adentro del cilindro: se invierte para no verla en espejo
  tex.wrapS = THREE.RepeatWrapping
  tex.repeat.x = -1
  return tex
}

function texturaResplandor() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.25)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(c)
}
const resplandor = texturaResplandor()

// Dibuja el logo (SVG o PNG) en un canvas grande para que se vea nítido en 3D
function cargarLogo(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const w = img.naturalWidth || 512
      const h = img.naturalHeight || 512
      const escala = 1400 / Math.max(w, h)
      const c = document.createElement('canvas')
      c.width = Math.round(w * escala)
      c.height = Math.round(h * escala)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      const tex = new THREE.CanvasTexture(c)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
      resolve({ tex, aspecto: w / h })
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

// ---------------------------------------------------------------- Universos

const CILINDROS = [
  // [x, z, radio, alto]
  [-12, -10, 2.0, 10], [-9.5, -5.5, 1.6, 7.5], [-14, -4, 1.3, 4], [-7, -11, 1.3, 5.5],
  [-16, -9, 1.1, 2.2], [-8, -1.5, 1.4, 0.8], [-11.5, 0.5, 1.1, 0.5],
  [12.5, -10, 1.8, 9], [9, -6.5, 1.6, 6.5], [14.5, -4.5, 1.4, 3.5], [7.5, -12, 1.2, 4.5],
  [11, -1, 1.5, 1], [16, -8, 1.0, 6], [8, 0.5, 0.9, 2.8],
]

const universos = EMPRESAS.map((empresa, i) => {
  const g = new THREE.Group()
  g.position.x = i * SEPARACION
  scene.add(g)
  const { paleta } = empresa

  const pantalla = new THREE.Mesh(
    new THREE.CylinderGeometry(24, 24, 13, 128, 1, true, Math.PI - 1.0, 2.0),
    new THREE.MeshBasicMaterial({ map: paisaje(paleta, i), side: THREE.BackSide, toneMapped: false }),
  )
  pantalla.position.set(0, 6.5, 4)
  g.add(pantalla)

  const metal = new THREE.MeshStandardMaterial({ color: paleta.metal, metalness: 1, roughness: 0.3 })
  for (const [x, z, r, h] of CILINDROS) {
    const cil = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 64), metal)
    cil.position.set(x, h / 2, z)
    cil.castShadow = cil.receiveShadow = true
    g.add(cil)
  }

  // Luz de la pantalla sobre el piso y los cilindros
  for (const x of [-12, 0, 12]) {
    const l = new THREE.PointLight(paleta.luz, 70, 34, 1.6)
    l.position.set(x, 3, -14)
    g.add(l)
  }

  const foco = new THREE.SpotLight(paleta.luz, 500, 40, 0.42, 1, 1.6)
  foco.position.set(0, 18, 8)
  foco.target.position.set(0, 0, -2)
  foco.castShadow = true
  foco.shadow.mapSize.set(1024, 1024)
  foco.shadow.bias = -0.0004
  g.add(foco, foco.target)

  // Logo flotante (en lugar del reloj de la referencia)
  const logo = new THREE.Group()
  logo.position.set(0, 6.2, 0)
  g.add(logo)

  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: resplandor, color: paleta.luz, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
  )
  halo.scale.setScalar(13)
  halo.position.z = -0.6
  logo.add(halo)

  const plano = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, toneMapped: false }),
  )
  plano.visible = false
  logo.add(plano)

  cargarLogo(empresa.logo).then((r) => {
    if (!r) return
    const alto = r.aspecto > 1.4 ? 4.2 : 5.2
    plano.material.map = r.tex
    plano.material.needsUpdate = true
    plano.scale.set(alto * r.aspecto, alto, 1)
    plano.visible = true
  })

  return { logo, fase: i * 1.7 }
})

// Polvo en suspensión, iluminado por los focos
const NUM_POLVO = reduceMotion ? 300 : 1400
const polvo = new Float32Array(NUM_POLVO * 3)
for (let i = 0; i < NUM_POLVO; i++) {
  polvo[i * 3] = Math.random() * (SEPARACION * (N - 1) + 60) - 30
  polvo[i * 3 + 1] = Math.random() * 14
  polvo[i * 3 + 2] = Math.random() * 30 - 16
}
const geoPolvo = new THREE.BufferGeometry()
geoPolvo.setAttribute('position', new THREE.BufferAttribute(polvo, 3))
const puntosPolvo = new THREE.Points(
  geoPolvo,
  new THREE.PointsMaterial({ color: 0xfff1dc, size: 0.05, transparent: true, opacity: 0.55, depthWrite: false }),
)
scene.add(puntosPolvo)

// ---------------------------------------------------------------- Sonido ambiente (sin archivos)

const NOTAS = [110, 98, 130.81, 87.31, 123.47]
let audio = null

function crearAudio() {
  const ctx = new AudioContext()
  const master = ctx.createGain()
  master.gain.value = 0
  const filtro = ctx.createBiquadFilter()
  filtro.type = 'lowpass'
  filtro.frequency.value = 600
  filtro.Q.value = 0.7
  filtro.connect(master).connect(ctx.destination)

  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 0.07
  lfoGain.gain.value = 260
  lfo.connect(lfoGain).connect(filtro.frequency)
  lfo.start()

  const voces = [
    ['sawtooth', 1, -6, 0.18],
    ['sawtooth', 1, 7, 0.18],
    ['triangle', 1.5, 0, 0.12],
    ['sine', 0.5, 0, 0.35],
  ].map(([type, multiplo, detune, vol]) => {
    const o = ctx.createOscillator()
    const v = ctx.createGain()
    o.type = type
    o.detune.value = detune
    v.gain.value = vol
    o.connect(v).connect(filtro)
    o.start()
    return { o, multiplo }
  })
  return { ctx, master, voces }
}

function afinar(i) {
  if (!audio) return
  const f = NOTAS[i % NOTAS.length]
  const t = audio.ctx.currentTime
  audio.voces.forEach(({ o, multiplo }) => o.frequency.setTargetAtTime(f * multiplo, t, 0.9))
}

ui.sonido.addEventListener('click', async () => {
  const activar = ui.sonido.getAttribute('aria-pressed') !== 'true'
  ui.sonido.setAttribute('aria-pressed', activar)
  if (activar && !audio) {
    audio = crearAudio()
    afinar(actual)
  }
  if (!audio) return
  if (activar) await audio.ctx.resume()
  audio.master.gain.setTargetAtTime(activar ? 0.07 : 0, audio.ctx.currentTime, 0.6)
})

// ---------------------------------------------------------------- Navegación entre empresas

let actual = 0
let viaje = null // { desde, hasta, t }
let finBloqueo = 0
let introTerminada = false
let entrada = 0

function irA(i) {
  i = THREE.MathUtils.clamp(i, 0, N - 1)
  if (!introTerminada || i === actual || detalleAbierto()) return
  const desde = viaje ? posicionViaje() : actual
  actual = i
  viaje = { desde, hasta: i, t: 0, duracion: reduceMotion ? 0.001 : 2 }
  finBloqueo = performance.now() + 2000
  mostrarEmpresa(i, true)
  afinar(i)
}

function posicionViaje() {
  return THREE.MathUtils.lerp(viaje.desde, viaje.hasta, suavizar(viaje.t))
}

const suavizar = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

let acumulado = 0
let temporizadorRueda
addEventListener(
  'wheel',
  (e) => {
    if (detalleAbierto()) return
    e.preventDefault()
    const ahora = performance.now()
    clearTimeout(temporizadorRueda)
    temporizadorRueda = setTimeout(() => (acumulado = 0), 220)
    // Mientras viaja, la inercia del trackpad no cuenta como un nuevo gesto
    if (ahora < finBloqueo) {
      finBloqueo = Math.max(finBloqueo, ahora + 200)
      acumulado = 0
      return
    }
    acumulado += e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
    if (Math.abs(acumulado) > 50) {
      irA(actual + Math.sign(acumulado))
      acumulado = 0
    }
  },
  { passive: false },
)

let toqueY = null
addEventListener('touchstart', (e) => (toqueY = e.touches[0].clientY), { passive: true })
addEventListener('touchend', (e) => {
  if (toqueY === null || detalleAbierto()) return
  const dy = toqueY - e.changedTouches[0].clientY
  if (Math.abs(dy) > 50) irA(actual + Math.sign(dy))
  toqueY = null
})

addEventListener('keydown', (e) => {
  if (!introTerminada) {
    if (['Escape', 'Enter', ' '].includes(e.key)) terminarIntro()
    return
  }
  if (e.key === 'Escape') return cerrarDetalle()
  if (detalleAbierto()) return
  if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) irA(actual + 1)
  else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) irA(actual - 1)
  else if (e.key === 'Enter') abrirDetalle()
  else return
  e.preventDefault()
})

// ---------------------------------------------------------------- Texto de cada empresa

let cambioTitulo

function mostrarEmpresa(i, animar) {
  const e = EMPRESAS[i]
  botonesPuntos.forEach((b, j) => b.setAttribute('aria-current', j === i))
  ui.num.textContent = `${dosDigitos(i + 1)} — ${dosDigitos(N)}`
  ui.nombre.textContent = e.nombre

  const escribir = () => ui.lineas.forEach((l, j) => (l.textContent = e.titulo[j] ?? ''))
  clearTimeout(cambioTitulo)
  if (!animar || reduceMotion) {
    escribir()
    return
  }
  ui.titulo.classList.add('sale')
  cambioTitulo = setTimeout(() => {
    escribir()
    ui.titulo.classList.remove('sale')
    ui.titulo.classList.add('espera')
    void ui.titulo.offsetWidth
    ui.titulo.classList.remove('espera')
  }, 900)
}

// ---------------------------------------------------------------- Panel "Explorar"

const detalleAbierto = () => ui.detalle.classList.contains('abierto')

function abrirDetalle() {
  if (!introTerminada) return
  const e = EMPRESAS[actual]
  $('.detalle-logo').src = e.logo
  $('.detalle-nombre').textContent = e.nombre
  $('.detalle-desc').textContent = e.descripcion
  $('.detalle-cta').href = `mailto:${GRUPO.contacto}?subject=${encodeURIComponent(`Información: ${e.nombre}`)}`
  $('.detalle-lista').replaceChildren(
    ...e.servicios.map((s, j) => {
      const li = document.createElement('li')
      li.style.setProperty('--i', j)
      li.innerHTML = `<span class="detalle-num">${dosDigitos(j + 1)}</span><div><h3></h3><p></p></div>`
      li.querySelector('h3').textContent = s.nombre
      li.querySelector('p').textContent = s.detalle
      return li
    }),
  )
  ui.detalle.classList.add('abierto')
  ui.detalle.setAttribute('aria-hidden', 'false')
  document.body.classList.add('con-detalle')
  $('.detalle-cerrar').focus()
}

function cerrarDetalle() {
  if (!detalleAbierto()) return
  ui.detalle.classList.remove('abierto')
  ui.detalle.setAttribute('aria-hidden', 'true')
  document.body.classList.remove('con-detalle')
}

$('.explorar').addEventListener('click', abrirDetalle)
$('.hotspot').addEventListener('click', abrirDetalle)
$('.detalle-cerrar').addEventListener('click', cerrarDetalle)

// ---------------------------------------------------------------- Puntero

const puntero = new THREE.Vector2()
const paralaje = new THREE.Vector2()
addEventListener('pointermove', (e) => {
  puntero.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1)
})

// ---------------------------------------------------------------- Bucle

const DISTANCIA = () => (innerWidth / innerHeight < 1 ? 34 : 22)
const INICIO = new THREE.Vector3(0, 9, 60)
const mirar = new THREE.Vector3()
let anterior = performance.now()
let tiempo = 0

camera.position.copy(INICIO)
camera.lookAt(0, 5, 0)

renderer.setAnimationLoop((ahora) => {
  const dt = Math.min((ahora - anterior) / 1000, 0.05)
  anterior = ahora
  tiempo += dt
  const mov = reduceMotion ? 0.2 : 1

  // Viaje entre universos: se aleja, se desliza y vuelve a entrar
  let pos = actual
  let alejamiento = 0
  if (viaje) {
    viaje.t = Math.min(viaje.t + dt / viaje.duracion, 1)
    pos = posicionViaje()
    alejamiento = Math.sin(Math.PI * viaje.t)
    if (viaje.t >= 1) viaje = null
  }

  paralaje.lerp(puntero, Math.min(dt * 2.5, 1))
  const x = pos * SEPARACION
  camera.position.set(
    x + paralaje.x * 1.2 * mov,
    5 + alejamiento * 3 + paralaje.y * 0.5 * mov,
    DISTANCIA() + alejamiento * 16,
  )
  mirar.set(x, 5.2, 0)

  // Entrada después de la intro
  if (entrada < 1) {
    entrada = introTerminada ? Math.min(entrada + dt / (reduceMotion ? 0.001 : 3.5), 1) : 0
    camera.position.lerpVectors(INICIO, camera.position, suavizar(entrada))
  }
  camera.lookAt(mirar)

  universos.forEach((u, i) => {
    u.logo.position.y = 6.2 + Math.sin(tiempo * 0.8 + u.fase) * 0.2 * mov
    u.logo.rotation.y = Math.sin(tiempo * 0.35 + u.fase) * 0.18 * mov + (i === actual ? paralaje.x * 0.25 * mov : 0)
  })

  for (let i = 0; i < NUM_POLVO; i++) {
    polvo[i * 3 + 1] += Math.sin(tiempo * 0.3 + i) * dt * 0.08 * mov
    polvo[i * 3] += Math.cos(tiempo * 0.2 + i * 0.5) * dt * 0.05 * mov
  }
  geoPolvo.attributes.position.needsUpdate = true

  renderer.render(scene, camera)
})

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
})

// ---------------------------------------------------------------- Intro: solo el logo de Grupo SVG

let temporizadorIntro

function terminarIntro() {
  if (introTerminada) return
  introTerminada = true
  clearTimeout(temporizadorIntro)
  ui.intro.classList.add('fuera')
  document.body.classList.add('listo')
  mostrarEmpresa(actual, false)
}

ui.intro.querySelector('.intro-saltar').addEventListener('click', terminarIntro)

// Un enlace como /#/2 abre directamente esa empresa sin intro
const enlace = location.hash.match(/^#\/(\d+)$/)
if (enlace) {
  actual = THREE.MathUtils.clamp(Number(enlace[1]) - 1, 0, N - 1)
  entrada = 1
  terminarIntro()
} else {
  requestAnimationFrame(() => ui.intro.classList.add('visible'))
  temporizadorIntro = setTimeout(terminarIntro, reduceMotion ? 1500 : 3600)
}
