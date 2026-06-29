#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = __dirname;
const OUTPUT_FILE = path.join(WORKSPACE_ROOT, 'workspace-data.json');

// Proyectos a ignorar
const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '.astro',
  'graphify-out',
  '.specify',
  '.claude',
  'credentials',
  '.github'
]);

function getProjectType(dirPath) {
  const files = fs.readdirSync(dirPath);

  if (files.includes('package.json')) {
    try {
      const content = fs.readFileSync(path.join(dirPath, 'package.json'), 'utf-8').replace(/^﻿/, '');
      const pkgJson = JSON.parse(content);
      if (pkgJson.name?.includes('mcp') || files.includes('index.ts')) return 'MCP Server';
      if (files.includes('astro.config.mjs')) return 'Astro Site';
      if (pkgJson.scripts?.start || pkgJson.scripts?.dev) return 'Web App';
      return 'Node.js Project';
    } catch (e) {
      return 'Node.js Project';
    }
  }

  if (files.includes('astro.config.mjs')) return 'Astro Site';
  if (files.includes('index.md') || files.some(f => f.endsWith('.md'))) return 'Documentation';
  if (files.some(f => f.endsWith('.py'))) return 'Python Project';
  if (files.includes('.git')) return 'Git Repository';

  return 'Mixed Project';
}

function getTechStack(dirPath) {
  const stack = [];
  const files = fs.readdirSync(dirPath);

  if (files.includes('package.json')) {
    try {
      const content = fs.readFileSync(path.join(dirPath, 'package.json'), 'utf-8').replace(/^﻿/, '');
      const pkgJson = JSON.parse(content);
      const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };

      if (deps.express) stack.push('Express.js');
      if (deps.astro) stack.push('Astro');
      if (deps.react) stack.push('React');
      if (deps.vue) stack.push('Vue');
      if (deps.next) stack.push('Next.js');
      if (deps.typescript) stack.push('TypeScript');
      if (deps.axios) stack.push('Axios');
      if (deps.ollama) stack.push('Ollama');
      if (deps.cors) stack.push('CORS');
    } catch (e) {}
  }

  if (files.includes('astro.config.mjs')) stack.push('Astro');
  if (files.some(f => f.endsWith('.ts'))) stack.push('TypeScript');
  if (files.some(f => f.endsWith('.py'))) stack.push('Python');
  if (files.includes('requirements.txt')) stack.push('Python');

  return stack.length > 0 ? stack : ['Static/Mixed'];
}

function getProjectDescription(dirPath) {
  const files = fs.readdirSync(dirPath);

  // Buscar en README.md
  if (files.includes('README.md')) {
    try {
      const content = fs.readFileSync(path.join(dirPath, 'README.md'), 'utf-8');
      const lines = content.split('\n').slice(0, 5);
      const desc = lines.find(l => l.trim() && !l.startsWith('#'));
      if (desc) return desc.trim().substring(0, 150);
    } catch (e) {}
  }

  // Buscar en CLAUDE.md
  if (files.includes('CLAUDE.md')) {
    try {
      const content = fs.readFileSync(path.join(dirPath, 'CLAUDE.md'), 'utf-8');
      const match = content.match(/## Project Overview\n\n(.*?)(?:\n\n|\n##)/s);
      if (match) return match[1].trim().substring(0, 150);
    } catch (e) {}
  }

  // Buscar en package.json
  try {
    if (files.includes('package.json')) {
      const content = fs.readFileSync(path.join(dirPath, 'package.json'), 'utf-8').replace(/^﻿/, '');
      const pkgJson = JSON.parse(content);
      if (pkgJson.description) return pkgJson.description.substring(0, 150);
    }
  } catch (e) {}

  return 'No description available';
}

function getDirectorySize(dirPath) {
  let size = 0;

  function walkDir(dir) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (IGNORE_DIRS.has(file)) continue;

        const filePath = path.join(dir, file);
        try {
          const stats = fs.statSync(filePath);
          if (stats.isDirectory()) {
            walkDir(filePath);
          } else {
            size += stats.size;
          }
        } catch (e) {}
      }
    } catch (e) {}
  }

  walkDir(dirPath);

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTree(dirPath, maxDepth = 3, currentDepth = 0, maxFiles = 50) {
  if (currentDepth >= maxDepth) return [];

  const tree = [];
  let fileCount = 0;

  try {
    const files = fs.readdirSync(dirPath).sort();

    for (const file of files) {
      if (fileCount >= maxFiles) break;
      if (IGNORE_DIRS.has(file)) continue;

      const filePath = path.join(dirPath, file);

      try {
        const stats = fs.statSync(filePath);
        const isDir = stats.isDirectory();

        const item = {
          name: file,
          type: isDir ? 'dir' : 'file',
          size: isDir ? null : stats.size
        };

        if (isDir && currentDepth < maxDepth - 1) {
          item.children = getFileTree(filePath, maxDepth, currentDepth + 1, 20);
        }

        tree.push(item);
        fileCount++;
      } catch (e) {}
    }
  } catch (e) {}

  return tree;
}

function getProjectStats(dirPath) {
  const files = fs.readdirSync(dirPath);
  const stats = {
    hasGit: false,
    hasTests: false,
    hasEnv: false,
    hasReadme: false,
    hasClaude: false,
    testFiles: []
  };

  stats.hasGit = files.includes('.git');
  stats.hasEnv = fs.existsSync(path.join(dirPath, '.env')) || fs.existsSync(path.join(dirPath, '.env.example'));
  stats.hasReadme = files.includes('README.md');
  stats.hasClaude = files.includes('CLAUDE.md');

  // Buscar tests
  const testPatterns = ['test', 'spec', '__tests__', '.test.js', '.spec.js'];
  for (const file of files) {
    if (testPatterns.some(p => file.includes(p))) {
      stats.testFiles.push(file);
      stats.hasTests = true;
    }
  }

  return stats;
}

function getLastModified(dirPath) {
  try {
    const stats = fs.statSync(dirPath);
    return new Date(stats.mtime).toISOString().split('T')[0];
  } catch (e) {
    return 'Unknown';
  }
}

function getProjectContent(fullPath) {
  let content = '';

  try {
    if (fs.existsSync(path.join(fullPath, 'README.md'))) {
      content += fs.readFileSync(path.join(fullPath, 'README.md'), 'utf-8').toLowerCase();
    }
  } catch (e) {}

  try {
    if (fs.existsSync(path.join(fullPath, 'CLAUDE.md'))) {
      content += ' ' + fs.readFileSync(path.join(fullPath, 'CLAUDE.md'), 'utf-8').toLowerCase();
    }
  } catch (e) {}

  return content;
}

function classifyProject(fullPath, basicType, techStack, description) {
  const classifications = [];
  const files = fs.readdirSync(fullPath);
  const projectContent = getProjectContent(fullPath);
  const allText = (description + ' ' + projectContent).toLowerCase();

  // Lenguajes detectados
  const languages = new Set();
  if (files.some(f => f.endsWith('.js') || f.endsWith('.jsx'))) languages.add('JavaScript');
  if (files.some(f => f.endsWith('.ts') || f.endsWith('.tsx'))) languages.add('TypeScript');
  if (files.some(f => f.endsWith('.py'))) languages.add('Python');
  if (files.some(f => f.endsWith('.go'))) languages.add('Go');
  if (files.some(f => f.endsWith('.rs'))) languages.add('Rust');
  if (files.some(f => f.endsWith('.java'))) languages.add('Java');
  if (files.some(f => f.endsWith('.cpp') || f.endsWith('.cc') || f.endsWith('.cxx'))) languages.add('C++');
  if (files.some(f => f.endsWith('.rb'))) languages.add('Ruby');
  if (files.some(f => f.endsWith('.php'))) languages.add('PHP');
  if (files.some(f => f.endsWith('.swift'))) languages.add('Swift');
  if (files.some(f => f.endsWith('.kt'))) languages.add('Kotlin');

  // Frameworks y librerías
  const hasExpress = techStack.includes('Express.js');
  const hasAstro = techStack.includes('Astro');
  const hasReact = techStack.includes('React');
  const hasVue = techStack.includes('Vue');
  const hasNext = techStack.includes('Next.js');
  const hasTypeScript = techStack.includes('TypeScript');
  const hasOllama = techStack.includes('Ollama');
  const hasDjango = files.includes('manage.py') || description.includes('Django');
  const hasFastAPI = files.includes('main.py') && description.includes('FastAPI');
  const hasDocker = files.includes('Dockerfile');

  // Detectar MCP
  if (description.includes('MCP') || description.includes('Model Context Protocol') || files.includes('index.ts')) {
    classifications.push('MCP Server');
  }

  // Detectar APIs y Backends
  if (hasExpress || hasDjango || hasFastAPI || (languages.has('Python') && files.some(f => f.includes('api')))) {
    classifications.push('Backend API');
    if (hasExpress) classifications.push('Express Server');
    if (hasDjango) classifications.push('Django Backend');
    if (hasFastAPI) classifications.push('FastAPI Service');
  }

  // Detectar Frontends
  if (hasReact || hasVue || hasAstro || hasNext) {
    classifications.push('Frontend');
    if (hasAstro) classifications.push('Static Site Generator');
    if (hasReact) classifications.push('React App');
    if (hasVue) classifications.push('Vue App');
    if (hasNext) classifications.push('Next.js App');
  }

  // Detectar Full-Stack
  if ((hasExpress || hasDjango) && (hasReact || hasVue || hasNext)) {
    classifications.push('Full-Stack App');
  }

  // Detectar CLIs
  if (files.some(f => f === 'cli.js' || f === 'bin') || description.includes('CLI') || description.includes('command')) {
    classifications.push('CLI Tool');
  }

  // Detectar librerías
  if ((languages.has('JavaScript') || languages.has('TypeScript')) &&
      fs.existsSync(path.join(fullPath, 'package.json'))) {
    try {
      const content = fs.readFileSync(path.join(fullPath, 'package.json'), 'utf-8').replace(/^﻿/, '');
      const pkg = JSON.parse(content);
      if (pkg.name && !pkg.scripts?.start && !pkg.scripts?.dev) {
        classifications.push('JavaScript Library');
      }
    } catch (e) {}
  }

  // Detectar herramientas de desarrollo
  if (files.includes('webpack.config.js') || files.includes('vite.config.js') || files.includes('rollup.config.js')) {
    classifications.push('Build Tool');
  }

  // Detectar testing
  if (files.some(f => f.includes('test') || f.includes('spec')) || description.includes('test')) {
    classifications.push('Testing Tool');
  }

  // Detectar documentación
  if (files.some(f => f.endsWith('.md')) && !files.includes('package.json') && !files.includes('index.ts')) {
    classifications.push('Documentation');
  }

  // Detectar datos/análisis
  if (languages.has('Python') && (description.includes('data') || description.includes('analysis'))) {
    classifications.push('Data Science');
  }

  // Detectar scrapers
  if (description.includes('scraper') || description.includes('crawl')) {
    classifications.push('Web Scraper');
  }

  // Detectar DevOps
  if (hasDocker || files.includes('docker-compose.yml') || files.includes('Kubernetes.yaml')) {
    classifications.push('DevOps');
  }

  // Detectar modelos/IA
  if (hasOllama || description.includes('model') || description.includes('AI') || description.includes('ML')) {
    classifications.push('AI/ML Model');
  }

  // Detectar extensiones/plugins
  if (description.includes('extension') || description.includes('plugin') || description.includes('addon')) {
    classifications.push('Browser Extension');
  }

  // Agregar lenguajes a clasificaciones
  Array.from(languages).forEach(lang => classifications.push(lang));

  // Deteccion dinamica de palabras clave
  const keywordMap = {
    'game|juego|engine|unity|unreal': 'Game Engine',
    'blockchain|crypto|ethereum|solidity|web3': 'Blockchain',
    'mobile|android|ios|flutter|react native': 'Mobile App',
    'desktop|electron|tauri': 'Desktop App',
    'email|smtp|mail': 'Email Service',
    'chat|messaging|websocket': 'Chat App',
    'video|streaming|ffmpeg': 'Video Processing',
    'audio|music|spotify': 'Audio Processing',
    'database|postgres|mongodb|mysql': 'Database',
    'cache|redis|memcached': 'Cache System',
    'queue|kafka|rabbitmq': 'Message Queue',
    'search|elasticsearch|algolia': 'Search Engine',
    'analytics|tracking|metrics': 'Analytics',
    'payment|stripe|paypal': 'Payment Gateway',
    'auth|oauth|jwt|authentication': 'Authentication',
    'security|encryption|crypto': 'Security',
    'monitoring|logging|observability': 'Monitoring',
    'infrastructure|kubernetes|docker compose': 'Infrastructure',
    'ci/cd|pipeline|github actions': 'CI/CD Pipeline',
    'template|starter|boilerplate': 'Template/Starter',
    'ui|component|design system': 'UI Component',
    'demo|example|sample': 'Demo/Example',
    'plugin|addon|extension': 'Plugin/Addon',
    'utility|helper|tool': 'Utility Tool'
  };

  // Buscar palabras clave en el contenido
  for (const [keywords, category] of Object.entries(keywordMap)) {
    const keywordList = keywords.split('|');
    if (keywordList.some(kw => allText.includes(kw))) {
      classifications.push(category);
    }
  }

  // Remover duplicados y devolver
  return [...new Set(classifications)];
}

function scanWorkspace() {
  console.log('Escaneando workspace...');

  const projects = [];
  const entries = fs.readdirSync(WORKSPACE_ROOT);

  for (const entry of entries) {
    const fullPath = path.join(WORKSPACE_ROOT, entry);

    // Solo directorios
    try {
      const stats = fs.statSync(fullPath);
      if (!stats.isDirectory()) continue;
    } catch (e) {
      continue;
    }

    // Ignorar directorios del sistema
    if (entry.startsWith('.') || IGNORE_DIRS.has(entry)) continue;

    console.log(`  OK ${entry}`);

    const basicType = getProjectType(fullPath);
    const description = getProjectDescription(fullPath);
    const techStack = getTechStack(fullPath);

    const project = {
      name: entry,
      path: `./${entry}`,
      type: basicType,
      intelligentType: classifyProject(fullPath, basicType, techStack, description),
      description: description,
      techStack: techStack,
      size: getDirectorySize(fullPath),
      lastModified: getLastModified(fullPath),
      stats: getProjectStats(fullPath),
      fileTree: getFileTree(fullPath),
      files: {
        readme: fs.existsSync(path.join(fullPath, 'README.md')),
        claude: fs.existsSync(path.join(fullPath, 'CLAUDE.md')),
        packageJson: fs.existsSync(path.join(fullPath, 'package.json')),
        setup: fs.existsSync(path.join(fullPath, 'SETUP.md')),
        env: fs.existsSync(path.join(fullPath, '.env.example')) || fs.existsSync(path.join(fullPath, '.env'))
      }
    };

    projects.push(project);
  }

  const data = {
    scannedAt: new Date().toISOString(),
    workspace: WORKSPACE_ROOT,
    projectCount: projects.length,
    projects: projects.sort((a, b) => a.name.localeCompare(b.name))
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  console.log(`\nOK Datos guardados en: ${OUTPUT_FILE}`);
  console.log(`OK Total de proyectos encontrados: ${projects.length}`);
}

scanWorkspace();
