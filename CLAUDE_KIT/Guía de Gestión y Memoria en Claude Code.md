Este informe detalla los sistemas de memoria para **Claude Code**, centrándose en la optimización del contexto, la jerarquía de archivos y las herramientas de automatización disponibles para mejorar la persistencia de datos entre sesiones.

### 1\. El Sistema de Memoria Nativo: CLAUDE.md y MEMORY.md

Claude Code utiliza dos mecanismos principales para retener información: archivos de instrucciones escritos por el usuario y una memoria automática generada por el propio agente 1, 2\.

* **CLAUDE.md (Memoria del Proyecto):** Es el archivo de configuración nativo que Claude lee al inicio de cada sesión 3-5. En él se deben incluir directrices operativas como el stack tecnológico, comandos de compilación/testeo y convenciones de arquitectura 3, 6, 7\. Para mantener un alto rendimiento, se recomienda que no supere las **100-200 líneas**, ya que archivos más largos diluyen la atención del modelo y consumen tokens innecesarios 8-11.  
* **MEMORY.md (Auto-memoria):** Este archivo registra aprendizajes orgánicos, como correcciones de errores pasados, comandos de depuración exitosos y preferencias descubiertas durante la charla 2, 12-14.  
* **Limitación Crítica:** La auto-memoria tiene un **límite estricto de 200 líneas (o 25KB)** 15-17. El contenido que exceda este límite se trunca de forma silenciosa al iniciar una sesión, lo que puede provocar que Claude repita errores que el usuario ya había corregido en el pasado 16, 18-20.

### 2\. Jerarquía y Precedencia de Memoria

Claude Code implementa un sistema jerárquico donde las instrucciones más específicas tienen prioridad sobre las generales 21, 22\. El orden de carga (de menor a mayor prioridad) es el siguiente:

1. **Managed Policy:** Políticas corporativas globales (/etc/claude-code/CLAUDE.md) 12, 22, 23\.  
2. **User Memory:** Preferencias personales globales (\~/.claude/CLAUDE.md) 5, 12, 22, 23\.  
3. **Project Memory:** Instrucciones del repositorio raíz (./CLAUDE.md) 12, 23, 24\.  
4. **Local Memory:** Notas personales no versionadas (./CLAUDE.local.md), útiles para URLs de sandbox o credenciales locales 8, 23-25.  
5. **Path-Scoped Rules:** Reglas modulares en .claude/rules/\*.md que solo se cargan cuando Claude interactúa con archivos que coinciden con un patrón específico (ej. reglas de test solo para archivos \*.test.ts) 12, 24, 26, 27\.

### 3\. Interoperabilidad con AGENTS.md

**AGENTS.md** es un estándar abierto para agentes de IA (como Cursor, Windsurf y Codex) que permite compartir reglas entre plataformas 28-31.

* **Integración:** Aunque Claude Code prefiere CLAUDE.md, puede leer AGENTS.md como respaldo si el primero no existe 31, 32\.  
* **Estrategia del Enlace Simbólico (Symlink):** Para evitar mantener dos archivos idénticos, se recomienda crear un enlace simbólico: ln \-s CLAUDE.md AGENTS.md 33-36. Esto permite que todas las herramientas lean la misma fuente de verdad sin duplicar información 35-37.  
* **Puente de Importación:** Alternativamente, se puede incluir la línea @AGENTS.md dentro de un archivo CLAUDE.md para importar su contenido de forma dinámica 33, 38-40.

### 4\. Proceso de Instalación y Automatización

Para proyectos nuevos, el comando /init en Claude Code analiza el repositorio y genera una estructura básica de archivos de memoria 41-43.  
Para una gestión avanzada, la herramienta **Claudekit** automatiza este proceso 44, 45\.

* **Instalación:** Se instala globalmente mediante npm install \-g claudekit 44, 45\.  
* **Configuración:** Al ejecutar claudekit setup, la herramienta inicializa el directorio .claude/, crea subdirectorios de reglas y genera los enlaces simbólicos multiplataforma necesarios para unificar AGENTS.md y CLAUDE.md 44, 45\.  
* **Funcionalidades:** Claudekit añade comandos adicionales como /checkpoint:create para guardar estados de Git, /spec:create para generar especificaciones técnicas y /dev:cleanup para eliminar archivos temporales que ensucian el contexto 46, 47\.

### Lista Completa de Fuentes y Enlaces

1. **AGENTS.MD standard : r/ClaudeCode \- Reddit**[https://www.reddit.com/r/ClaudeCode/comments/1rlc8zi/agentsmd\_standard/](https://www.reddit.com/r/ClaudeCode/comments/1rlc8zi/agentsmd_standard/) 28, 48  
2. **AGENTS.md (Sitio Oficial)**[https://agents.md/](https://agents.md/) 29, 49, 50  
3. **AGENTS.md vs CLAUDE.md Explained | Build This Now \- BuildThisNow**[https://www.buildthisnow.com/blog/guide/mechanics/agents-md-vs-claude-md](https://www.buildthisnow.com/blog/guide/mechanics/agents-md-vs-claude-md) 50-53  
4. **Arquitectura de Memoria y Optimización de Contexto para AGENTS.md y CLAUDE.md en Claude Code (Informe Técnico)** 33, 54  
5. **Best practices for Claude Code \- Claude Code Docs**[https://code.claude.com/docs/en/best-practices](https://code.claude.com/docs/en/best-practices) 50, 55, 56  
6. **CLAUDE.md for .NET \- The Perfect Setup with Copy-Paste Templates \- codewithmukesh**[https://codewithmukesh.com/blog/claude-md-mastery-dotnet/](https://codewithmukesh.com/blog/claude-md-mastery-dotnet/) 57-59  
7. **CLAUDE.md, AGENTS.md & Copilot Instructions: Configure Every AI Coding Assistant**[https://www.deployhq.com/blog/ai-coding-config-files-guide](https://www.deployhq.com/blog/ai-coding-config-files-guide) 52, 60, 61  
8. **Claude Code Context Window: Optimize Your Token Usage**[https://claudefa.st/blog/guide/mechanics/context-management](https://claudefa.st/blog/guide/mechanics/context-management) 33, 62, 63  
9. **Claude Code agents surfacing unverified MEMORY.md content — Reddit**[https://www.reddit.com/r/ClaudeAI/comments/1tcuiql/claude\_code\_agents\_surfacing\_unverified\_memorymd/](https://www.reddit.com/r/ClaudeAI/comments/1tcuiql/claude_code_agents_surfacing_unverified_memorymd/) 64-66  
10. **Codex agents.md vs. Claude Code CLAUDE.md — MindStudio**[https://www.mindstudio.ai/blog/codex-agents-md-vs-claude-code-claude-md-comparison](https://www.mindstudio.ai/blog/codex-agents-md-vs-claude-code-claude-md-comparison) 51, 58, 67  
11. **How Claude remembers your project \- Claude Code Docs**[https://code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory) 57, 68, 69  
12. **How to Build Your AGENTS.md (2026): Augment Code**[https://www.augmentcode.com/guides/how-to-build-agents-md](https://www.augmentcode.com/guides/how-to-build-agents-md) 68, 70, 71  
13. **Lesson 16: AGENTS.md \- giving agents project context \- Addy Osmani**[https://addyosmani.com/agents/15-agents-md/](https://addyosmani.com/agents/15-agents-md/) 48, 70, 72  
14. **Overview \- Claude Code Docs**[https://code.claude.com/docs/en/overview](https://code.claude.com/docs/en/overview) 49, 73, 74  
15. **SKILL.md vs CLAUDE.md vs AGENTS.md Compared | Termdock**[https://www.termdock.com/blog/skill-md-vs-claude-md-vs-agents-md](https://www.termdock.com/blog/skill-md-vs-claude-md-vs-agents-md) 55, 60, 75  
16. **The CLAUDE.md Memory System \- Common Mistakes | SFEIR Institute**[https://institute.sfeir.com/en/claude-code/claude-code-memory-system-claude-md/errors/](https://institute.sfeir.com/en/claude-code/claude-code-memory-system-claude-md/errors/) 76-78  
17. **The CLAUDE.md Memory System \- Optimization Guide | SFEIR Institute**[https://institute.sfeir.com/en/claude-code/claude-code-memory-system-claude-md/optimization/](https://institute.sfeir.com/en/claude-code/claude-code-memory-system-claude-md/optimization/) 62, 77, 79  
18. **The CLAUDE.md Memory System \- Tips \- SFEIR Institute**[https://institute.sfeir.com/en/claude-code/claude-code-memory-system-claude-md/tips/](https://institute.sfeir.com/en/claude-code/claude-code-memory-system-claude-md/tips/) 73, 80, 81  
19. **The CLAUDE.md Memory System \- Tutorial \- SFEIR Institute**[https://institute.sfeir.com/en/claude-code/claude-code-memory-system-claude-md/tutorial/](https://institute.sfeir.com/en/claude-code/claude-code-memory-system-claude-md/tutorial/) 64, 65, 82  
20. **Bug Claude ignores CLAUDE.md rules \#62812 \- GitHub**[https://github.com/anthropics/claude-code/issues/62812](https://github.com/anthropics/claude-code/issues/62812) 80, 83, 84  
21. **DOCS/FEATURE MEMORY.md 200-line hard limit \#25006 \- GitHub**[https://github.com/anthropics/claude-code/issues/25006](https://github.com/anthropics/claude-code/issues/25006) 76, 85, 86  
22. **claudekit/AGENTS.md at main \- GitHub**[https://github.com/carlrannaberg/claudekit/blob/main/AGENTS.md](https://github.com/carlrannaberg/claudekit/blob/main/AGENTS.md) 83, 87, 88

