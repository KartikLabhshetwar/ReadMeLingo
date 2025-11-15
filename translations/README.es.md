# ReadMeLingo

Traduce la documentación de repositorios de GitHub a múltiples idiomas usando Lingo.dev CLI

ReadMeLingo es una herramienta CLI que traduce archivos de documentación de repositorios localmente, asegurando traducciones rápidas y confiables que funcionan en todas partes

## Características

- **Traducción rápida**: Se ejecuta localmente sin límites de tiempo de espera
- **Más de 8 idiomas**: Soporte para español, francés, alemán, italiano, portugués, japonés, coreano y chino
- **Salida flexible**: Guarda traducciones en cualquier directorio
- **Funciona en todas partes**: Ejecútalo en tu máquina, CI/CD, o donde sea que Node.js funcione
- **Modo interactivo**: Indicaciones amigables para una configuración fácil
- **Procesamiento por lotes**: Traduce múltiples archivos incluyendo README, CONTRIBUTING y la carpeta docs

## Requisitos previos

- Node.js 18+ instalado
- Una clave API de Lingo.dev (obtén una en [lingo.dev](https://lingo.dev))
- (Opcional) Token de acceso personal de GitHub para repositorios privados

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/yourusername/readmelingo.git
cd readmelingo
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura tu clave API de Lingo.dev:

```bash
export LINGODOTDEV_API_KEY=tu_clave_api_aquí
```

O crea un archivo `.env`:

```bash
LINGODOTDEV_API_KEY=tu_clave_api_aquí
GITHUB_TOKEN=tu_token_github_aquí  # Opcional
```

## Uso de CLI

### Inicio rápido

La forma más rápida de comenzar:

```bash
export LINGODOTDEV_API_KEY=tu_clave_api_aquí
npm run cli translate -- --repo propietario/repo
```

Los archivos traducidos se guardarán en `./translations/` por defecto.

### Traducción básica

Traduce el README de un repositorio a los idiomas predeterminados (español, francés, alemán):

```bash
npm run cli translate -- --repo propietario/repo
```

O con URL completa:

```bash
npm run cli translate -- --repo https://github.com/propietario/repo
```

### Idiomas personalizados

Especifica los idiomas de destino como una lista separada por comas:

```bash
npm run cli translate -- --repo propietario/repo --languages es,fr,de,pt,ja
```

### Incluir archivos adicionales

Incluye CONTRIBUTING.md y la carpeta /docs:

```bash
npm run cli translate -- --repo propietario/repo --include-contributing --include-docs
```

### Directorio de salida personalizado

Guarda las traducciones en un directorio específico:

```bash
npm run cli translate -- --repo propietario/repo --output ./mis-traducciones
```

### Repositorios privados

Usa un token de GitHub para repositorios privados:

```bash
npm run cli translate -- --repo propietario/repo --token ghp_tu_token_aquí
```

O configúralo como variable de entorno:

```bash
export GITHUB_TOKEN=ghp_tu_token_aquí
npm run cli translate -- --repo propietario/repo
```

### Opciones de CLI

| Opción | Descripción | Predeterminado |
|--------|-------------|---------|
| `-r, --repo <repo>` | URL del repositorio GitHub o propietario/repo (requerido) | - |
| `-t, --token <token>` | Token de acceso personal de GitHub | - |
| `-l, --languages <languages>` | Idiomas de destino separados por comas | `es,fr,de` |
| `-o, --output <dir>` | Directorio de salida para archivos traducidos | `./translations` |
| `--include-contributing` | Incluir CONTRIBUTING.md | `false` |
| `--include-docs` | Incluir carpeta /docs | `false` |

### Ejemplos de CLI

Traducir el README de Next.js:

```bash
npm run cli translate -- --repo vercel/next.js --languages es,fr,de,pt
```

Traducir con todos los archivos:

```bash
npm run cli translate -- \
  --repo propietario/repo \
  --include-contributing \
  --include-docs \
  --languages es,fr,de,ja,zh \
  --output ./output
```

Traducir repositorio privado:

```bash
npm run cli translate -- \
  --repo private-org/private-repo \
  --token ghp_tu_token \
  --languages es,fr
```

### Estructura de salida de CLI

Los archivos traducidos se guardan en el directorio de salida (predeterminado: `./translations`) con la siguiente estructura:

```text
translations/
├── README.es.md
├── README.fr.md
├── README.de.md
├── CONTRIBUTING.es.md (si se incluye)
└── docs/
    └── guide.es.md (si se incluye)
```

## Instalación como CLI global

Instala ReadMeLingo globalmente para usarlo desde cualquier lugar:

```bash
npm install -g readmelingo
```

Luego úsalo directamente:

```bash
readmelingo translate --repo propietario/repo
```

## Idiomas soportados

- `es` - Español
- `fr` - Francés
- `de` - Alemán
- `it` - Italiano
- `pt` - Portugués
- `ja` - Japonés
- `ko` - Coreano
- `zh` - Chino

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|----------|-------------|
| `LINGODOTDEV_API_KEY` | Sí | Tu clave API de Lingo.dev para traducciones |
| `GITHUB_TOKEN` | No | Token de acceso personal de GitHub (para repositorios privados) |

## Solución de problemas

### "LINGODOTDEV_API_KEY no encontrada"

Asegúrate de haber configurado la variable de entorno:

```bash
export LINGODOTDEV_API_KEY=tu_clave_aquí
```

### "URL de repositorio inválida"

Usa uno de estos formatos:

- `propietario/repo`
- `https://github.com/propietario/repo`

### Tiempo de espera de traducción

Los archivos grandes pueden tardar más. El CLI tiene un tiempo de espera de 2 minutos. Para repositorios muy grandes, considera traducir archivos individualmente.

### No se encontraron archivos

Asegúrate de que el repositorio tenga un archivo README.md. Usa `--include-contributing` y `--include-docs` para incluir archivos adicionales.

## Arquitectura

- **Lenguaje**: TypeScript
- **Framework CLI**: Commander.js
- **Traducción**: Lingo.dev CLI (se ejecuta localmente)
- **Integración GitHub**: GitHub REST API
- **Salida**: Archivos guardados en disco
- **Indicaciones interactivas**: @clack/prompts para una experiencia CLI amigable

## Estructura del proyecto

```text
readmelingo/
├── cli/                  # Herramienta CLI
│   ├── index.ts         # Punto de entrada CLI
│   └── commands/
│       └── translate.ts # Comando de traducción
├── lib/                 # Utilidades
│   ├── github.ts        # Ayudantes de API GitHub
│   ├── lingo.ts         # Integración Lingo CLI
│   ├── markdown.ts      # Utilidades Markdown
│   ├── utils.ts         # Utilidades generales
│   └── zip.ts           # Generación ZIP
├── bin/                 # Script ejecutable
│   └── readmelingo      # Punto de entrada CLI global
└── dist/                # JavaScript compilado (para paquete npm)
```

## Desarrollo

### Ejecutando el CLI

```bash
# Desarrollo (con tsx)
npm run cli translate -- --repo propietario/repo

# Construir y ejecutar
npm run cli:build
npm run cli:run translate -- --repo propietario/repo

# Probar instalación global
npm run cli:test
```

### Calidad del código

El proyecto usa:

- TypeScript para seguridad de tipos
- ESLint para linting de código
- Prettier para formateo de código

## Contribuir

¡Las contribuciones son bienvenidas! No dudes en enviar un Pull Request.

1. Haz un fork del repositorio
2. Crea tu rama de características (`git checkout -b feature/CaracterísticaIncreíble`)
3. Haz commit de tus cambios (`git commit -m 'Añadir alguna CaracterísticaIncreíble'`)
4. Haz push a la rama (`git push origin feature/CaracterísticaIncreíble`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - consulta el archivo [LICENSE](LICENSE) para más detalles.

## Agradecimientos

- [Lingo.dev](https://lingo.dev) por la API de traducción
- [Commander.js](https://github.com/tj/commander.js) por el framework CLI
- [@clack/prompts](https://github.com/natemoo-re/clack) por las indicaciones interactivas

## Contacto

Para preguntas o soporte, por favor abre un issue en GitHub.