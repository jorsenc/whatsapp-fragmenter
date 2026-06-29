# **Análisis Comparativo y Selección de Modelos de Ollama Cloud para el Análisis Literario de Novelas**

El procesamiento y análisis computacional de obras literarias de larga extensión, como las novelas, constituye uno de los campos más exigentes de las humanidades digitales y la lingüística computacional. A diferencia de tareas más breves de extracción de información, el análisis literario profundo requiere la retención simultánea de estructuras narrativas complejas, la evolución de personajes a través de múltiples capítulos, el rastreo de simbolismos interconectados y la consistencia en el procesamiento de estilos de prosa complejos1. Una novela típica puede variar entre las 60,000 y las 150,000 palabras, lo que equivale aproximadamente a un rango de entre 80,000 y 200,000 tokens en los codificadores modernos2. Sostener esta volumetría en la memoria activa del modelo sin fragmentar el texto ha sido históricamente el mayor obstáculo para las arquitecturas de procesamiento del lenguaje natural2.  
La llegada de los modelos en la nube de Ollama (Ollama Cloud) transforma radicalmente este panorama al permitir delegar la inferencia a servidores de alto rendimiento equipados con hardware de escala de centro de datos5. De este modo, los investigadores pueden mantener sus flujos de trabajo e integraciones locales mediante la API de Ollama, mientras ejecutan modelos masivos de cientos de miles de millones de parámetros cuya carga sería inviable en equipos personales debido a las severas exigencias de memoria de acceso aleatorio de video (VRAM)5. A continuación, se presenta una evaluación exhaustiva de los mejores modelos de Ollama Cloud para el análisis de novelas, considerando su capacidad de contexto, rendimiento en el idioma español y las mejores prácticas de implementación2.

## **Infraestructura y Modelo de Operación de Ollama Cloud**

La ejecución de modelos en Ollama Cloud opera bajo un esquema de proxy híbrido11. El cliente local de Ollama actúa como pasarela de control, gestionando las peticiones y enrutándolas hacia la infraestructura centralizada de Ollama5. Este entorno destaca por su velocidad de procesamiento y por ofrecer una garantía de privacidad crítica para el entorno académico y editorial: la plataforma procesa los datos de manera transitoria y bajo estrictas directivas de cero retención de datos, asegurando que las obras sujetas a derechos de autor o manuscritos inéditos nunca sean almacenados ni utilizados para el entrenamiento de futuros modelos13.  
El acceso a estos modelos está regulado por tres niveles de servicio dentro del esquema de suscripción de Ollama, los cuales determinan la concurrencia de modelos activos y los límites de consumo basados en tiempo de cómputo en unidades de procesamiento gráfico (GPU)13.

### **Tabla 1: Niveles de Suscripción y Límites de Concurrencia en Ollama Cloud**

| Nivel de Plan | Tarifa Mensual | Modelos Concurrentes | Perfil de Uso y Capacidad Operativa |
| :---- | :---- | :---- | :---- |
| **Free (Gratuito)** | $013 | 1 modelo activo13 | Uso ligero, evaluación inicial de modelos y pruebas cortas de análisis capitular13. |
| **Pro** | $2013 | 3 modelos activos13 | Trabajo diario, investigación literaria continua, análisis paralelo y carga de múltiples novelas13. |
| **Max** | $10013 | 10 modelos activos13 | Tareas masivas sostenidas, orquestación de agentes paralelos y análisis sistemático de colecciones enteras13. |

La medición del consumo se calcula principalmente por el tiempo de ocupación de las GPU de Ollama Cloud, variando según la complejidad del modelo utilizado13. Las consultas que involucran ventanas de contexto muy amplias (como la ingesta de una novela completa) y modelos pesados con un alto nivel de exigencia de cómputo (nivel de consumo 4, como deepseek-v4-pro) agotarán las cuotas mensuales de manera significativamente más rápida que el uso de modelos más pequeños y eficientes13.

## **Evaluación de Modelos de Ollama Cloud para el Análisis Literario**

La selección del modelo óptimo depende de la longitud de la novela, el nivel de complejidad estructural de la narrativa y la necesidad de una interpretación lingüística precisa en español2. Ollama Cloud aloja una selección diversa de arquitecturas de pesos abiertos con soporte para contextos de gran tamaño7.

### **Tabla 2: Comparativa de Modelos de Ollama Cloud Optimizados para Contexto Largo**

| Identificador del Modelo | Ventana de Contexto (Tokens) | Parámetros Totales / Activos | Arquitectura del Mecanismo de Atención | Especialización e Idoneidad Literaria |
| :---- | :---- | :---- | :---- | :---- |
| minimax-m3:cloud | 1,000,000 (Mínimo de 512K garantizados)14 | 229.9B / 9.8B por token17 | Atención Dispersa MiniMax (MSA)14 | **La opción más recomendada.** Máxima ventana de contexto, ideal para novelas masivas enteras en un solo turno18. |
| deepseek-v4-pro | 1,000,00020 | 1.6T / 49B por token21 | Compressed Sparse Attention \+ HCA21 | Razonamiento estructural sobresaliente y excelente memoria de personajes de largo alcance21. |
| qwen3.5:397b-cloud | 262,144 (Extensible a 1M con YaRN)23 | 397B / 17B por token23 | Mixture-of-Experts con atención dinámica23 | Calidad y fluidez estilística en idioma español del más alto nivel académico9. |
| kimi-k2.6:cloud | 262,14426 | 1.04T / Densidad variable26 | Híbrida con compresión de contexto integrada28 | Excelente estabilidad temática en análisis de trama intermedia y mimetismo de estilo28. |
| gpt-oss:120b-cloud | 131,07210 | 116.8B / 5.1B por token31 | Mixture-of-Experts cuantizado a MXFP431 | Desglose estructural riguroso gracias a su esfuerzo de razonamiento configurable32. |
| gemma4:31b-cloud | 262,14410 | 30.7B Densos34 | Atención densa de alta fidelidad34 | Excelente para segmentación capitular detallada y análisis formalista riguroso34. |

## **Análisis Narratológico y Modelos Recomendados**

### **MiniMax M3: El Estándar de Oro para Novelas Extensas y Monolitos Literarios**

Para el análisis holístico de una novela en una sola sesión de procesamiento, minimax-m3:cloud es la opción más sólida disponible en Ollama Cloud18. Su arquitectura Mixture-of-Experts (MoE) activa únicamente 9.8 mil millones de parámetros de un total de 229.9 mil millones17, ofreciendo la sofisticación interpretativa de un modelo masivo con la latencia y eficiencia de costo de una versión significativamente más pequeña17.  
El elemento diferenciador de MiniMax M3 es su arquitectura de Atención Dispersa (MSA, MiniMax Sparse Attention)14. A diferencia de los modelos tradicionales cuyo costo de procesamiento de atención escala de manera cuadrática con la longitud del prompt, MSA reduce el cómputo de atención a una vigésima parte de lo habitual en contextos que alcanzan un millón de tokens17. Esto permite ingerir manuscritos completos de hasta 750,000 palabras en una única ventana activa sin sufrir el fenómeno de "pérdida en el medio" (lost in the middle), donde los modelos tienden a ignorar los sucesos ocurridos a mitad del libro2. MiniMax M3 demuestra un comportamiento proactivo muy similar al de modelos cerrados avanzados de largo contexto, lo que facilita el mapeo de relaciones entre personajes distantes y la reconstrucción temporal de tramas no lineales18.

### **DeepSeek V4 Pro: Análisis Estructural Complejo y Memoria de Personajes**

En análisis críticos que exigen una rigurosa deconstrucción estructural de la trama y un rastreo de continuidades psicológicas de los personajes, deepseek-v4-pro sobresale por encima de sus competidores21. Al activar 49 mil millones de parámetros por consulta sobre una arquitectura MoE de 1.6 billones21, este modelo incorpora dos características clave para la investigación literaria: la Atención Escasa Comprimida (Compressed Sparse Attention) y la Memoria Condicional de Engramas21.  
La memoria de engramas funciona de manera selectiva, identificando y reteniendo la información semántica crítica de las fases iniciales del contexto (por ejemplo, la presentación de motivos temáticos o los rasgos sutiles de un protagonista en los primeros capítulos) mientras procesa activamente los capítulos intermedios o finales21. Esto reduce drásticamente los requerimientos de potencia de cálculo de la ventana de contexto a tan solo un 27% de lo demandado por arquitecturas previas21. Su capacidad de "pensamiento deliberativo" a través de tres niveles de razonamiento configurables (Non-Think, Think High, Think Max) faculta al investigador para alternar entre la toma rápida de notas estructurales y la redacción de análisis literarios profundos con justificación lógica paso a paso21.

### **Qwen 3.5: El Referente en Español y Sensibilidad Estilística**

Cuando el análisis de la novela está centrado primordialmente en el estudio estilístico, los matices retóricos, el análisis del ritmo de la prosa, los arcaísmos o las variaciones lingüísticas del español regional, qwen3.5:397b-cloud es el modelo más adecuado9. Esta versión cuenta con una ventana de contexto nativa de 262,144 tokens, la cual puede ampliarse eficazmente hasta un millón de tokens mediante técnicas locales de escalado posicional YaRN soportadas de forma directa por Ollama Cloud23.  
Qwen 3.5 cuenta con un vocabulario de 250,000 tokens optimizado para más de 201 idiomas, demostrando un dominio sobresaliente de la sintaxis española y un entendimiento profundo del patrimonio cultural hispanohablante9. Al procesar textos densos, su enrutamiento MoE activa únicamente 17 mil millones de parámetros23, garantizando una inferencia veloz y fluida25. Su sensibilidad lingüística le permite discernir tonos de voz implícitos, dobles sentidos y la evolución del registro conversacional de los diálogos dentro de una novela de manera mucho más natural que los modelos optimizados de manera exclusiva para código9.

## **Directrices Técnicas para la Configuración e Implementación**

Para asegurar que Ollama Cloud procese una novela de manera óptima sin truncar los datos ni degradar el rendimiento, el investigador debe configurar detalladamente los parámetros del sistema3.

### **Gestión de la Ventana de Contexto (num\_ctx)**

De manera predeterminada, los servidores locales de Ollama inicializan las instancias con una ventana de contexto conservadora de 2,048 o 4,096 tokens para proteger la memoria física del equipo del usuario3. Cuando un usuario realiza peticiones de análisis literario que superan esta longitud a través de clientes locales o integraciones (como extensiones de editores de texto o entornos de desarrollo), el software tiende a limitar el contexto a rangos predefinidos (frecuentemente a 33,000 tokens en extensiones de IDEs o 200,000 tokens en plataformas de agentes)40.  
Para evitar la truncación silenciosa de la novela y aprovechar la capacidad extendida del modelo en la nube de Ollama (donde la infraestructura de Ollama Cloud ejecuta los modelos a su máxima ventana de manera nativa), se debe declarar explícitamente el parámetro num\_ctx39.

#### **Método 1: Creación de un Modelo Derivado Permanente (Modelfile)**

Se aconseja crear un archivo de definición de modelo denominado Modelfile para consolidar de forma permanente los parámetros del análisis literario4:

Dockerfile  
\# Se importa el modelo base de la nube  
FROM minimax-m3:cloud

\# Se asigna un contexto amplio para dar cabida a la novela completa (ej. 512,000 tokens)  
PARAMETER num\_ctx 512000

\# Se incrementa el límite de tokens de salida para resúmenes o desgloses extensos  
PARAMETER num\_predict 16384

\# Parámetros de moderación de aleatoriedad  
PARAMETER temperature 0.65  
PARAMETER top\_p 0.95  
PARAMETER repeat\_penalty 1.1

\# Mensaje de sistema para instruir el rol crítico de análisis literario  
SYSTEM """  
Eres un especialista en filología hispánica y teoría narrativa. Tu tarea es analizar de forma rigurosa el texto literario provisto, identificando temas principales, evolución dramática de los personajes y el uso de recursos estilísticos en la obra. Tus respuestas deben ser sumamente estructuradas y precisas.  
"""

Una vez definido el archivo, se ejecuta la compilación del modelo analítico personalizado en la terminal local4:

Bash  
ollama create analista-minimax \-f ./Modelfile

#### **Método 2: Control del Ciclo de Vida del Caché (keep\_alive)**

El preprocesamiento de la novela completa para la construcción del KV Cache del prompt inicial representa una alta inversión de recursos de GPU2. Por defecto, Ollama descarga los modelos de la memoria tras 5 minutos de inactividad, lo que obligaría a recomputar todo el texto de la novela si el investigador realiza consultas consecutivas espaciadas en el tiempo15.  
Para proteger el caché del prompt pesado y evitar tiempos muertos, se debe definir el parámetro keep\_alive a un valor prolongado (por ejemplo, 60 minutos o de forma infinita con un valor de \-1) en la llamada de la API o en la configuración global del servidor15:

Python  
import ollama

\# Carga del archivo de la novela  
with open("novela\_manuscrito.txt", "r", encoding="utf-8") as file:  
    contenido\_novela \= file.read()

\# Petición a la API con persistencia de caché  
response \= ollama.chat(  
    model='minimax-m3:cloud',  
    messages=\[  
        {  
            'role': 'user',  
            'content': f"Genera un desglose detallado de los motivos simbólicos recurrentes en el siguiente texto:\\n\\n{contenido\_novela}"  
        }  
    \],  
    options={  
        'num\_ctx': 512000,  
        'temperature': 0.4  
    },  
    keep\_alive='60m' \# Sostiene el modelo cargado para consultas subsiguientes sin reevaluar la novela  
)

print(response\['message'\]\['content'\])

## **Resolución de Cuellos de Botella Técnicos en Ollama Cloud**

Durante la ejecución de tareas de procesamiento masivo en Ollama Cloud, se pueden manifestar fricciones del sistema que el investigador debe prever y mitigar.

### **El Error del Buffer de Retorno (HTTP 502 Bad Gateway)**

Un comportamiento anómalo documentado en los servidores de Ollama Cloud ocurre cuando el modelo genera respuestas estructuradas sumamente largas (por ejemplo, al solicitar un JSON altamente anidado con la catalogación de cientos de pasajes de la novela) o cuando se ejecutan agentes que devuelven salidas voluminosas vía llamadas a herramientas (tool calling)46. Esto suele provocar errores del tipo HTTP 502 Bad Gateway u omisiones inesperadas por desbordamiento de búfer del proxy del servidor de Ollama Cloud46.

* **Mitigación Práctica:** Evite solicitar desgloses masivos en una única respuesta estructurada46. Se recomienda programar el análisis literario en fases progresivas utilizando salidas en prosa regular, o bien estructurar peticiones capitulares de tamaño moderado en hilos conversacionales secuenciales, dado que las peticiones basadas puramente en texto libre no presentan esta vulnerabilidad de búfer en el servidor remoto46.

### **Control de Latencia y Autenticación**

Toda interacción con los modelos en la nube de Ollama exige una autenticación previa mediante la creación de una cuenta en la plataforma y la posterior ejecución local de ollama signin, o mediante la configuración de la clave de acceso a través de la variable de entorno OLLAMA\_API\_KEY para clientes remotos y scripts automatizados5. Para flujos de análisis de gran escala, se debe tener en cuenta que el tiempo hasta el primer token generado (TTFT, Time To First Token) puede incrementarse ligeramente durante la ingesta de contextos cercanos al millón de tokens debido a la fase inicial de cómputo del texto masivo, estabilizándose la velocidad de decodificación una vez iniciada la generación de la respuesta13.

## **Directrices de Decisión para la Investigación Literaria**

Para seleccionar el modelo de Ollama Cloud más apropiado para el análisis de una novela, se recomienda seguir los siguientes lineamientos prácticos basados en las necesidades específicas de la investigación:

* **¿La novela es extremadamente larga (monolito narrativo) y requiere un análisis holístico unificado sin fragmentar los capítulos?**  
  Se recomienda utilizar **minimax-m3:cloud**18. Su ventana de contexto de un millón de tokens y su arquitectura de atención dispersa (MSA) garantizan la lectura de la obra completa, minimizando los costos de cómputo y evitando la pérdida de información intermedia14.  
* **¿La novela presenta una trama compleja de misterio o múltiples líneas temporales donde los personajes cambian de rol y requiere un seguimiento de relaciones lógicas estrictas?**  
  Se recomienda utilizar **deepseek-v4-pro**21. Su memoria condicional de engramas y sus modos de pensamiento deliberativo (Think Max) permiten mantener la fidelidad de los detalles clave esparcidos a lo largo de toda la extensión del libro de forma coherente21.  
* **¿El objeto de estudio se centra en el estilo literario, la riqueza lingüística de la prosa y las sutilezas de la sintaxis en idioma español?**  
  Se recomienda utilizar **qwen3.5:397b-cloud**9. Este modelo destaca por su alto nivel de fluidez semántica, vocabulario expandido en español y capacidad de análisis adaptativo para identificar matices retóricos con precisión académica9.

#### **Obras citadas**

1. Largest Context Window LLMs in 2026: Full Comparison Table | WhatLLM.org, [https://whatllm.org/largest-context-window-llm](https://whatllm.org/largest-context-window-llm)  
2. Long Context Local LLMs (2026): 128K Models You Can Run Now \- PromptQuorum, [https://www.promptquorum.com/local-llms/long-context-local-llms](https://www.promptquorum.com/local-llms/long-context-local-llms)  
3. Ollama Context Window: How to Set num\_ctx \- Serverman | Tech Reviews | How-To Guides, [https://www.serverman.co.uk/ai/ollama/ollama-context-window/](https://www.serverman.co.uk/ai/ollama/ollama-context-window/)  
4. Fixing Context Limits in OpenCode \+ Ollama | by stouf \- Medium, [https://stouf.medium.com/fixing-context-limits-in-opencode-ollama-1d820b332b41](https://stouf.medium.com/fixing-context-limits-in-opencode-ollama-1d820b332b41)  
5. Cloud \- Ollama documentation, [https://docs.ollama.com/cloud](https://docs.ollama.com/cloud)  
6. Ollama, [https://ollama.com/](https://ollama.com/)  
7. Cloud models · Ollama Blog, [https://ollama.com/blog/cloud-models](https://ollama.com/blog/cloud-models)  
8. Ollama: The easiest way to run local and cloud LLM models \- Alberto Ruibal, [https://www.alonsoruibal.com/ollama-the-easiest-way-to-run-local-and-cloud-llm-models/](https://www.alonsoruibal.com/ollama-the-easiest-way-to-run-local-and-cloud-llm-models/)  
9. Ultimate Guide \- The Best Open Source LLM For Spanish In 2026 \- SiliconFlow, [https://www.siliconflow.com/articles/en/best-open-source-llm-for-spanish](https://www.siliconflow.com/articles/en/best-open-source-llm-for-spanish)  
10. Ollama Cloud | Models | Mastra Docs, [https://mastra.ai/models/providers/ollama-cloud](https://mastra.ai/models/providers/ollama-cloud)  
11. Ollama \- OpenClaw Docs, [https://docs.openclaw.ai/providers/ollama](https://docs.openclaw.ai/providers/ollama)  
12. Ollama in 2026: From Local Runner to AI Platform \- Angelo Lima, [https://angelo-lima.fr/en/ollama-2026-state-of-the-art-en/](https://angelo-lima.fr/en/ollama-2026-state-of-the-art-en/)  
13. Pricing \- Ollama, [https://ollama.com/pricing](https://ollama.com/pricing)  
14. minimax-m3 \- Ollama, [https://ollama.com/library/minimax-m3](https://ollama.com/library/minimax-m3)  
15. FAQ \- Ollama documentation, [https://docs.ollama.com/faq](https://docs.ollama.com/faq)  
16. Cloud models \- Ollama, [https://ollama.com/search?c=cloud](https://ollama.com/search?c=cloud)  
17. MiniMax M3: el open-weight que se atreve a mirar a Opus a los ojos \- Web Reactiva, [https://www.webreactiva.com/blog/minimax-m3](https://www.webreactiva.com/blog/minimax-m3)  
18. MiniMax M3 with Ollama Cloud: The Open Work Model You Can Run from Your Local Python App \- Medium, [https://medium.com/data-science-in-your-pocket/minimax-m3-with-ollama-cloud-the-open-work-model-you-can-run-from-your-local-python-app-f62417365530](https://medium.com/data-science-in-your-pocket/minimax-m3-with-ollama-cloud-the-open-work-model-you-can-run-from-your-local-python-app-f62417365530)  
19. MiniMax M3 lanzado: agentes de código, contexto de 1M y multimodalidad nativa, [https://knightli.com/es/2026/06/01/minimax-m3-coding-agent-1m-context/](https://knightli.com/es/2026/06/01/minimax-m3-coding-agent-1m-context/)  
20. Análisis de la API de DeepSeek V4 2026: Guía Flash vs Pro \- EvoLink, [https://evolink.ai/es/blog/deepseek-v4-api-review-2026-flash-vs-pro-guide](https://evolink.ai/es/blog/deepseek-v4-api-review-2026-flash-vs-pro-guide)  
21. DeepSeek V4 gratuito ya está disponible en Felo Search — Pruébalo gratis, [https://felo.ai/es/blog/free-deepseek-v4-now-available-on-felo-search/](https://felo.ai/es/blog/free-deepseek-v4-now-available-on-felo-search/)  
22. DeepSeek V4 (1.6T MoE, multimodal) | Guides \- Clore.ai, [https://docs.clore.ai/guides/guides\_v2-es/modelos-de-lenguaje/deepseek-v4](https://docs.clore.ai/guides/guides_v2-es/modelos-de-lenguaje/deepseek-v4)  
23. Guía para desarrolladores de Qwen 3.5: Modelo MoE de 397B con agentes visuales, API y autohospedaje (2026) | NxCode, [https://www.nxcode.io/es/resources/news/qwen-3-5-developer-guide-api-visual-agents-2026](https://www.nxcode.io/es/resources/news/qwen-3-5-developer-guide-api-visual-agents-2026)  
24. Qwen3.5 \- How to Run Locally | Unsloth Documentation, [https://unsloth.ai/docs/models/qwen3.5](https://unsloth.ai/docs/models/qwen3.5)  
25. Qwen3.5: características, acceso y benchmarks \- DataCamp, [https://www.datacamp.com/es/blog/qwen3-5](https://www.datacamp.com/es/blog/qwen3-5)  
26. kimi-k2.6:cloud \- Ollama, [https://ollama.com/library/kimi-k2.6:cloud](https://ollama.com/library/kimi-k2.6:cloud)  
27. kimi-k2.6 \- Ollama, [https://ollama.com/library/kimi-k2.6](https://ollama.com/library/kimi-k2.6)  
28. Kimi K2.6 Tech Blog: Advancing Open-Source Coding, [https://www.kimi.com/blog/kimi-k2-6](https://www.kimi.com/blog/kimi-k2-6)  
29. Kimi K2.6 Lanzado Oficialmente: La Era del Código Agéntico Entra en Producción, [https://kimi-k2.org/es/blog/24-kimi-k2-6-release](https://kimi-k2.org/es/blog/24-kimi-k2-6-release)  
30. Presentación de gpt-oss \- OpenAI, [https://openai.com/es-419/index/introducing-gpt-oss/](https://openai.com/es-419/index/introducing-gpt-oss/)  
31. Best Ollama Models 2026: 15 Ranked (Coding, Reasoning, Chat) | Local AI Master, [https://localaimaster.com/blog/best-ollama-models](https://localaimaster.com/blog/best-ollama-models)  
32. gpt-oss:120b-cloud \- Ollama, [https://ollama.com/library/gpt-oss:120b-cloud](https://ollama.com/library/gpt-oss:120b-cloud)  
33. Cómo configurar y ejecutar GPT-OSS localmente con Ollama \- DataCamp, [https://www.datacamp.com/es/tutorial/gpt-oss-ollama](https://www.datacamp.com/es/tutorial/gpt-oss-ollama)  
34. gemma4:31b-cloud \- Ollama, [https://ollama.com/library/gemma4:31b-cloud](https://ollama.com/library/gemma4:31b-cloud)  
35. Probando MiniMax M3 sin perderse en la teoría: una guía práctica para llamar a su API, [https://medium.com/@roobia/probando-minimax-m3-sin-perderse-en-la-teor%C3%ADa-una-gu%C3%ADa-pr%C3%A1ctica-para-llamar-a-su-api-43f4352f8a76](https://medium.com/@roobia/probando-minimax-m3-sin-perderse-en-la-teor%C3%ADa-una-gu%C3%ADa-pr%C3%A1ctica-para-llamar-a-su-api-43f4352f8a76)  
36. MiniMax M3: Frontier Coding at a Tenth of the Price \- Emergent Minds | paddo.dev, [https://paddo.dev/blog/minimax-m3-launch/](https://paddo.dev/blog/minimax-m3-launch/)  
37. Tres razones por las que el nuevo modelo V4 de DeepSeek importa, [https://technologyreview.es/article/tres-razones-por-las-que-el-nuevo-modelo-v4-de-deepseek-importa](https://technologyreview.es/article/tres-razones-por-las-que-el-nuevo-modelo-v4-de-deepseek-importa)  
38. Qwen3.5-397B up to 1 million context length : r/LocalLLaMA \- Reddit, [https://www.reddit.com/r/LocalLLaMA/comments/1r6qy55/qwen35397b\_up\_to\_1\_million\_context\_length/](https://www.reddit.com/r/LocalLLaMA/comments/1r6qy55/qwen35397b_up_to_1_million_context_length/)  
39. How does num\_ctx and model's context length work (together)? : r/ollama \- Reddit, [https://www.reddit.com/r/ollama/comments/1j4egbh/how\_does\_num\_ctx\_and\_models\_context\_length\_work/](https://www.reddit.com/r/ollama/comments/1j4egbh/how_does_num_ctx_and_models_context_length_work/)  
40. Limited context size (33k) for Ollama Models · Issue \#299907 · microsoft/vscode \- GitHub, [https://github.com/microsoft/vscode/issues/299907](https://github.com/microsoft/vscode/issues/299907)  
41. Ollama Cloud Models in Claude Code \- Lower Context Windows? \- Reddit, [https://www.reddit.com/r/ollama/comments/1uee6v6/ollama\_cloud\_models\_in\_claude\_code\_lower\_context/](https://www.reddit.com/r/ollama/comments/1uee6v6/ollama_cloud_models_in_claude_code_lower_context/)  
42. Context length \- Ollama documentation, [https://docs.ollama.com/context-length](https://docs.ollama.com/context-length)  
43. igovet/gemma4 \- Ollama, [https://ollama.com/igovet/gemma4](https://ollama.com/igovet/gemma4)  
44. Modelfile Reference \- Ollama documentation, [https://docs.ollama.com/modelfile](https://docs.ollama.com/modelfile)  
45. Prompt Caching \- Ollama in Action \- Leanpub, [https://leanpub.com/read/ollama/prompt-caching](https://leanpub.com/read/ollama/prompt-caching)  
46. Cloud models: tool\_call.function.arguments truncated or 502 Bad Gateway when outputting large content · Issue \#16066 \- GitHub, [https://github.com/ollama/ollama/issues/16066](https://github.com/ollama/ollama/issues/16066)  
47. pi-ollama-cloud · Packages \- Pi Coding Agent, [https://pi.dev/packages/pi-ollama-cloud](https://pi.dev/packages/pi-ollama-cloud)  
48. I have been running minimax-m3:cloud through ollama on their free tier, finally got around to testing the raw API \- Reddit, [https://www.reddit.com/r/ollama/comments/1u3ne09/i\_have\_been\_running\_minimaxm3cloud\_through\_ollama/](https://www.reddit.com/r/ollama/comments/1u3ne09/i_have_been_running_minimaxm3cloud_through_ollama/)