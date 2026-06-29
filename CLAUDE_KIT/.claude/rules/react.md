---
name: react-rules
description: Estándares React
applies_to: "**/*.tsx,**/*.jsx"
---

# Reglas React

## Componentes
- Functional components (hooks)
- `PascalCase` para nombres
- Props como interface separada
- JSX solo en `.tsx` / `.jsx`

## Hooks
- Custom hooks comienzan con `use`
- Reglas de hooks: dependencies correctas
- No hooks condicionales
- Extraer lógica a custom hooks si se repite

## Props
- Props interface explícita
- Destructuring en parámetros
- Default values claros
- No spread `{...props}` (mantén explícito)

## Performance
- `React.memo` si props estables
- `useCallback` para callbacks a children
- `useMemo` para objetos/arrays complejos
- `React.lazy` para rutas

## Accesibilidad
- HTML semántico (button, a, input)
- `aria-*` attributes si necesario
- Keyboard navigation (tabindex, focus)
- Color contrast 4.5:1 mínimo

## Styling
- CSS Modules o styled-components
- BEM si CSS vanilla
- Mobile-first responsive
