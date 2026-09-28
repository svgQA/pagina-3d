// Contenido editable del entorno 3D.
// Cada empresa es un "universo": pantalla panorámica, cilindros metálicos y su
// logo flotando al centro. El orden del arreglo es el orden del recorrido.
//
// Logos: reemplazar los archivos en public/logos/ (SVG o PNG) y ajustar `logo`.
// Paleta: `cielo` y `montes` pintan el paisaje de la pantalla; `metal` los cilindros.

export const GRUPO = {
  nombre: 'Grupo SVG',
  logo: '/logos/grupo-svg.svg',
  contacto: 'contacto@ejemplo.com',
}

export const EMPRESAS = [
  {
    nombre: 'Echeverry Pérez',
    logo: '/logos/echeverry-perez.svg',
    titulo: ['Respaldo que', 'sostiene su empresa'],
    descripcion:
      'Acompañamiento integral para que cada decisión de la empresa tenga orden, respaldo y dirección.',
    servicios: [
      { nombre: 'Consultoría empresarial', detalle: 'Diagnóstico, estrategia e indicadores de gestión.' },
      { nombre: 'Asesoría legal', detalle: 'Contratos, cumplimiento normativo y derecho laboral.' },
      { nombre: 'Contabilidad y finanzas', detalle: 'Contabilidad mensual, impuestos e informes.' },
      { nombre: 'Gestión humana', detalle: 'Selección, nómina y bienestar del equipo.' },
    ],
    paleta: {
      cielo: ['#cfd6cf', '#f2efe6'],
      montes: ['#a9b3a4', '#7d8c72', '#56674c', '#34432f'],
      metal: 0xd9b56e,
      luz: 0xffe2b0,
    },
  },
  {
    nombre: 'Espartanos',
    logo: '/logos/espartanos.svg',
    titulo: ['Disciplina', 'que protege'],
    descripcion:
      'Seguridad privada con la formación y el carácter de un escudo espartano: presencia, control y reacción.',
    servicios: [
      { nombre: 'Vigilancia física', detalle: 'Guardas capacitados para instalaciones y eventos.' },
      { nombre: 'Escoltas', detalle: 'Protección de personas y traslado de valores.' },
      { nombre: 'Monitoreo 24/7', detalle: 'Central de monitoreo y reacción inmediata.' },
      { nombre: 'Seguridad electrónica', detalle: 'Cámaras, alarmas y control de acceso.' },
    ],
    paleta: {
      cielo: ['#3a1512', '#c9774a'],
      montes: ['#9c5a3f', '#6e3527', '#48201a', '#261010'],
      metal: 0xb87333,
      luz: 0xffb07a,
    },
  },
  {
    nombre: 'Solo por Servicios',
    logo: '/logos/solo-por-servicios.svg',
    titulo: ['Un solo aliado', 'para cada servicio'],
    descripcion:
      'Servicios generales para que la operación de la empresa funcione todos los días, sin interrupciones.',
    servicios: [
      { nombre: 'Aseo y cafetería', detalle: 'Personal y suministros para oficinas y plantas.' },
      { nombre: 'Mantenimiento', detalle: 'Locativo, eléctrico y preventivo.' },
      { nombre: 'Personal temporal', detalle: 'Talento listo para picos de operación.' },
      { nombre: 'Logística', detalle: 'Mensajería, recepción y apoyo administrativo.' },
    ],
    paleta: {
      cielo: ['#1c2a3a', '#b9c8d6'],
      montes: ['#8397aa', '#5d7288', '#3d5064', '#1f2d3b'],
      metal: 0xc9ced6,
      luz: 0xd8e8ff,
    },
  },
]
