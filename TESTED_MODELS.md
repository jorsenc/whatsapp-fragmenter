# Tested Models

Registro de modelos LLM probados para uso con goose y proyectos relacionados.

> **Convención de columnas**:
> - **Servicio / Backend** → proveedor de infraestructura que sirve el modelo (ej. Ollama, Ollama Cloud, OpenAI, Anthropic, etc.).
> - **Modelo** → el identificador del modelo tal y como se invoca desde ese servicio.

## 🤖 Modelos Probados

| Servicio / Backend | Modelo | Estado | Notas |
| :--- | :--- | :--- | :--- |
| Ollama | [`minimax-m3:cloud`](https://ollama.com/library/minimax-m3:cloud) | ⏳ Pendiente | Modelo MiniMax-M3 servido vía Ollama (knowledge cutoff: Jan 2026). |

## 📝 Notas de servicio

### Ollama
- **Rol**: runtime local / bridge hacia modelos (incluye modelos `:cloud` que delegan en la nube de Ollama).
- **Comando típico**: `ollama run <modelo>` o integración vía provider de goose.
- **Tag `:cloud`**: indica que el modelo se ejecuta en la infraestructura cloud de Ollama, no en local, pero el servicio de entrada sigue siendo Ollama.