# Página 3D · Grupo SVG

Documento de trabajo: la idea del proyecto, lo que se construyó y lo que falta.

## La idea

Una página web inmersiva en 3D para presentar las empresas de **Grupo SVG**. En lugar de una página tradicional con secciones, el visitante recorre "universos", uno por empresa, moviendo la rueda del mouse.

La referencia es la experiencia de **Cartier Watches & Wonders** ([cartier.com/watchesandwonders](https://www.cartier.com/en-fr/watchesandwonders)), hecha por el estudio Immersive Garden. Cada reloj de Cartier tiene su propia sala 3D. Aquí se aplica la misma idea: **en lugar del reloj, flota el logo de cada empresa**.

Empresas incluidas (en orden de recorrido):

1. **Echeverry Pérez**
2. **Espartanos**
3. **Solo por Servicios**

## Cómo se ve y cómo funciona

**Intro.** Pantalla negra en la que aparece solo el logo de Grupo SVG. Se desvanece y la cámara entra al primer universo. Se puede saltar con el botón "Saltar", Enter, Espacio o Esc.

**Cada universo** (uno por empresa) tiene:

- una pantalla panorámica curva al fondo con un paisaje de montañas, con colores propios de cada empresa;
- cilindros metálicos a los lados, de distintas alturas (dorado, bronce o plateado según la empresa);
- el logo de la empresa flotando al centro, con un resplandor detrás y un leve movimiento;
- polvo suspendido en el aire, niebla y focos de luz.

**Interfaz** (la misma distribución que en Cartier):

| Posición | Elemento |
|---|---|
| Arriba a la izquierda | **Sonido**: activa o silencia un ambiente sonoro. Cada empresa tiene su propia nota. |
| Arriba al centro | Logo de Grupo SVG y título grande de la empresa. |
| Derecha | Puntos verticales, uno por empresa. Al pasar el mouse muestran el nombre y al hacer clic llevan a esa empresa. |
| Abajo a la izquierda | Contador (`01 — 03`) y nombre de la empresa actual. |
| Abajo al centro | Punto pulsante y botón **Explorar**, que abren el panel de servicios. |

**Navegación:**

- **Rueda del mouse o trackpad:** avanza o retrocede una empresa por gesto. La cámara se aleja, se desliza al siguiente universo y vuelve a entrar.
- **Celular:** deslizar hacia arriba o hacia abajo.
- **Teclado:** flechas o AvPág/RePág para cambiar de empresa, Enter para abrir el panel y Esc para cerrarlo.
- **Mouse:** mover el puntero inclina un poco la cámara y el logo (efecto de profundidad).
- **Enlace directo:** `/#/2` abre directamente la empresa 2 sin la intro. Sirve para compartir una empresa puntual.

**Panel "Explorar".** Pantalla superpuesta con el logo, el nombre y la descripción de la empresa, la lista numerada de servicios y un botón **Contactar** que abre un correo.

## Cómo se llegó aquí

El proyecto pasó por tres versiones, siguiendo las indicaciones del equipo:

1. **Templo espartano.** Una plataforma circular con columnas dóricas, una por servicio, y en el centro un escudo de bronce con la lambda (Λ) sobre un brasero. Al hacer clic en una columna, la cámara volaba hacia ella.
2. **Recorrido por capítulos.** Se agregó la intro (logos → "Seguridad" → "Solo por servicios") y se cambió a navegación por scroll, un capítulo por servicio, con iluminación tipo museo.
3. **Universos por empresa (versión actual).** A partir de la captura de Cartier se rediseñó por completo: un universo por empresa, el logo en lugar del reloj y una intro solo con el logo de Grupo SVG.

## Tecnología

- **Vite**: servidor de desarrollo y compilación.
- **three.js**: todo el 3D, generado por código. No hay modelos 3D ni imágenes externas, salvo los logos.
- Los paisajes de las pantallas se dibujan con código, a partir de los colores de cada empresa.
- El sonido se genera en el navegador (Web Audio), sin archivos de audio.
- Tipografías de Google Fonts: Cormorant Garamond para títulos e Inter para la interfaz.
- Se respeta la preferencia de "reducir movimiento" del sistema operativo.

## Estructura de archivos

```
index.html                  Página base (título, tipografías)
src/empresas.js             ← CONTENIDO EDITABLE: empresas, textos, servicios, colores
src/main.js                 Escena 3D, navegación, sonido, intro
src/style.css               Estilos de la interfaz
public/logos/               ← LOGOS (reemplazar por los reales)
  grupo-svg.svg
  echeverry-perez.svg
  espartanos.svg
  solo-por-servicios.svg
```

## Cómo editar

**Cambiar un logo:** reemplazar el archivo en `public/logos/` con el mismo nombre. Si el logo real es PNG, guardarlo en la misma carpeta y cambiar la ruta `logo` de esa empresa en `src/empresas.js`.

**Cambiar textos, servicios o colores:** todo está en `src/empresas.js`. Cada empresa tiene:

```js
{
  nombre: 'Echeverry Pérez',
  logo: '/logos/echeverry-perez.svg',
  titulo: ['Respaldo que', 'sostiene su empresa'],   // título grande, dos líneas
  descripcion: '...',                                 // texto del panel Explorar
  servicios: [{ nombre: '...', detalle: '...' }],     // lista del panel
  paleta: {
    cielo: ['#arriba', '#horizonte'],                 // cielo de la pantalla
    montes: ['#lejano', '...', '#cercano'],           // capas de montañas
    metal: 0xd9b56e,                                  // color de los cilindros
    luz: 0xffe2b0,                                    // color de la luz
  },
}
```

**Agregar o quitar una empresa:** agregar o quitar un bloque en `EMPRESAS`. Los puntos, el contador y los universos se ajustan solos.

**Correo de contacto:** `GRUPO.contacto` en `src/empresas.js`.

## Correr el proyecto

```
npm install
npm run dev        # desarrollo en http://localhost:5173
npm run build      # versión final en la carpeta dist/
```

## Pendiente

- [ ] **Logos reales** de Grupo SVG, Echeverry Pérez, Espartanos y Solo por Servicios. Los actuales son provisionales.
- [ ] **Confirmar las empresas**: se asumió que son tres (Echeverry Pérez, Espartanos, Solo por Servicios).
- [ ] **Textos reales**: los títulos, descripciones y servicios actuales son de ejemplo.
- [ ] **Correo de contacto real**: hoy es `contacto@ejemplo.com`.
- [ ] Revisar la versión actual en navegador de escritorio y en celular. Compila sin errores, pero todavía no se ha revisado visualmente.
- [ ] Opcional: música o ambiente sonoro grabado en lugar del generado, y fotos o video en las pantallas panorámicas en lugar del paisaje dibujado.
- [ ] Publicar la página (por ejemplo en GitHub Pages, Netlify o Vercel).

## Repositorio

https://github.com/svgQA/pagina-3d
