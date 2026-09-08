# 🎨 Design System, 20 Temas Dinâmicos e i18n

## 1. Objetivo
Descrever o motor de temas visuais (`src/context/theme-context.tsx`), a arquitetura de tokens com Tailwind CSS e Radix UI e o subsistema de internacionalização (`src/i18n/translations.ts`).

---

## 2. Visão Geral
O sistema de design do MarketFlow foi projetado com alta flexibilidade estética e usabilidade para ambientes de varejo iluminados ou escuros. Ele oferece:
- **20 Temas Dinâmicos Prontos:** 10 temas claros e 10 temas escuros.
- **Comutação em Tempo Real:** Sem necessidade de recarregar a página ou rebuild.
- **Persistência de Preferência:** Salvo na chave `marketflow-theme-key` no `localStorage`.
- **Internacionalização Multi-idioma:** Dicionários com suporte a Português (`pt-BR`), Inglês (`en`) e Espanhol (`es`).

---

## 3. Responsabilidades do Módulo
- Manipular dinamicamente as classes CSS injetadas no elemento `<html>` do DOM.
- Fornecer tokens padronizados de cor (`bg-background`, `text-foreground`, `text-primary`, `border-border`).
- Resolver strings de tradução utilizando interpolação segura com fallback para o português.

---

## 4. Catálogo dos 20 Temas Disponíveis

### 10 Temas Claros (Light)
1. **Corporate Blue (Padrão)** (`#2563eb`) — Azul clássico corporativo.
2. **Emerald Green** (`#10b981`) — Verde esmeralda para mercados e hortifrúti.
3. **Indigo Purple** (`#6366f1`) — Roxo moderno para lojas de presentes.
4. **Sunset Amber** (`#f59e0b`) — Âmbar acolhedor para padarias e confeitarias.
5. **Rose Crimson** (`#f43f5e`) — Rosa suave para floriculturas e cestas.
6. **Slate Cool** (`#475569`) — Cinza ardósia neutro e profissional.
7. **Teal Ocean** (`#14b8a6`) — Verde-azulado refrescante.
8. **Warm Paper** (`#d97706`) — Tons de papel aquecido e artesanato.
9. **Alto Contraste Claro** (`#000000`) — Acessibilidade para operadores com baixa visão.
10. **Fresh Mint** (`#059669`) — Verde menta suave.

### 10 Temas Escuros (Dark)
11. **MarketFlow Dark (Padrão)** (`#3b82f6`) — Azul noturno com contraste equilibrado.
12. **Midnight Blue** (`#1e3a8a`) — Azul meia-noite profundo.
13. **Dracula Purple** (`#a855f7`) — Tema inspirado no clássico padrão Dracula.
14. **Cyberpunk Neon** (`#ec4899`) — Rosa e azul neon de alto impacto.
15. **Nord Frost** (`#38bdf8`) — Azul gélido da paleta nórdica.
16. **Forest Dark** (`#22c55e`) — Verde floresta noturno.
17. **Alto Contraste Escuro** (`#eab308`) — Fundo preto total com destaque amarelo de alto contraste.
18. **Slate Dark** (`#64748b`) — Grafite escuro moderno.
19. **Obsidian Black** (`#8b5cf6`) — Preto obsidiana com detalhes em violeta.
20. **Sunset Dark** (`#f97316`) — Fundo escuro com realces em laranja pôr do sol.

---

## 5. Fluxo Interno: Comutação Reativa de Temas

```mermaid
flowchart TD
    User([Usuário seleciona tema no seletor]) --> CallTheme[Chama setTheme(newTheme)]
    CallTheme --> SaveLocal[Grava no localStorage: marketflow-theme-key]
    SaveLocal --> CleanDOM[Remove todas as classes antigas do html]
    CleanDOM --> AddTheme[Adiciona classe do novo tema ex: theme-emerald]
    AddTheme --> DarkCheck{Tema é do tipo dark?}
    DarkCheck -- Sim --> AddDark[Adiciona classe 'dark' no html]
    DarkCheck -- Não --> RemoveDark[Garante remoção da classe 'dark']
    AddDark --> ApplyCSS[Navegador recalcula variáveis CSS imediatamente]
    RemoveDark --> ApplyCSS
```

---

## 6. Relação com Outros Módulos
- **[Visão Geral da Arquitetura](../architecture/01-visao-geral.md):** O `ThemeProvider` envolve toda a árvore de componentes no `src/main.tsx`.
- **Todas as Telas Administrativas e Loja Pública:** Consomem as variáveis CSS de cor e as classes utilitárias do Tailwind.

---

## 7. Exemplos Práticos

### Snippet do `ThemeProvider` (`src/context/theme-context.tsx`)
```tsx
useEffect(() => {
  const root = window.document.documentElement;
  themeOptionsList.forEach(t => root.classList.remove(t.key));
  root.classList.remove('light', 'dark');

  root.classList.add(activeTheme);

  const currentOpt = themeOptionsList.find(t => t.key === activeTheme);
  if (currentOpt?.type === 'dark') {
    root.classList.add('dark');
  }
}, [activeTheme]);
```

---

## 8. Referências para Outros Documentos
- [Visão Geral da Arquitetura](../architecture/01-visao-geral.md)
- [Motor de Etiquetas Térmicas](../modules/04-etiquetas-termicas.md)
