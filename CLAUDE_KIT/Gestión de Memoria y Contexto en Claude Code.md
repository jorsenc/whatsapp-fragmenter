El mejor sistema para añadir memoria a Claude (específicamente en su entorno **Claude Code**) no es una herramienta única, sino un **enfoque por capas** que equilibra las instrucciones persistentes con el ahorro de tokens 1-3.  
A continuación, se detallan los componentes esenciales del sistema de memoria y cómo configurarlos de manera óptima:

### 1\. El Núcleo: CLAUDE.md

Es el archivo nativo de Claude Code y se carga al inicio de cada sesión 4, 5\.

* **Propósito:** Define el stack tecnológico, convenciones de código y comandos de construcción/testeo 6, 7\.  
* **Mejor práctica:** Debe mantenerse **conciso (menos de 100-200 líneas)** para evitar que Claude ignore instrucciones críticas debido a la saturación del contexto 8-10.  
* **Estructura WHAT-WHY-HOW:** Úsalo para explicar qué es el proyecto, por qué se tomaron ciertas decisiones arquitectónicas y cómo ejecutar tareas 11\.

### 2\. Memoria Automática: MEMORY.md

Este sistema permite que Claude aprenda orgánicamente de tus correcciones sin que tengas que editar archivos manualmente 12-14.

* **Funcionamiento:** Claude registra notas sobre errores previos, comandos exitosos y preferencias descubiertas 12, 15, 16\.  
* **Limitación crítica:** Existe un **límite estricto de 200 líneas** (o 25KB). El contenido que exceda este límite se trunca silenciosamente al iniciar la sesión, lo que puede causar que Claude repita errores del pasado 13, 17, 18\. Se recomienda auditar este archivo cada dos semanas 19\.

### 3\. Escalabilidad: Reglas Modulares (.claude/rules/)

Para proyectos grandes, meter todo en el CLAUDE.md es un error que degrada el rendimiento 9, 20\.

* **Ventaja:** Permite crear archivos Markdown que **solo se cargan cuando son relevantes**, basándose en patrones de archivos (glob patterns) definidos en un encabezado YAML 21-23.  
* **Ejemplo:** Una regla para tests solo se activará cuando Claude trabaje en archivos \*.test.ts, ahorrando tokens en otras tareas 21, 24, 25\.

### 4\. Capacidades Bajo Demanda: SKILL.md

A diferencia del contexto persistente, las "habilidades" son flujos de trabajo especializados que se cargan solo cuando la tarea coincide con la descripción de la habilidad 26, 27\.

* **Diferenciador:** Pueden incluir **scripts ejecutables** (como un checklist de despliegue), algo que los archivos de contexto estándar no permiten 28\.

### 5\. Interoperabilidad: El estándar AGENTS.md

Si tu equipo utiliza otras herramientas (como Cursor o Windsurf), el mejor sistema es utilizar **AGENTS.md** como "fuente única de verdad" 29, 30\.

* **Sincronización:** Dado que Claude Code no lee AGENTS.md de forma nativa (aunque lo usa como fallback), la técnica recomendada es crear un **enlace simbólico (symlink)**: ln \-s CLAUDE.md AGENTS.md 31-33. Así, todas las herramientas leen los mismos bytes sin duplicar información 31, 34, 35\.

### Resumen del sistema ideal (Estrategia 80/20)

Para maximizar la precisión de Claude, los expertos sugieren esta jerarquía de memoria 36, 37:

1. **CLAUDE.md (\<100 líneas):** Solo reglas críticas del proyecto que siempre deben aplicarse 10, 38\.  
2. **MEMORY.md:** Dejar que Claude gestione sus propios aprendizajes, pero limpiándolo periódicamente 19, 39\.  
3. **.claude/rules/:** Mover instrucciones específicas (frontend, backend, API) a este directorio para un carga condicional 25, 40\.  
4. **/compact:** Utilizar este comando para resumir el historial cuando la sesión se vuelve muy larga, preservando las reglas del CLAUDE.md 41-43.

