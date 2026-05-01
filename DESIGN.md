---
version: alpha
name: Financelio
description: Gestão financeira pessoal com confiança e clareza. Design focado em legibilidade de valores monetários, hierarquia visual nítida e acessibilidade em ambos os modos (light/dark).

colors:
  # ── Light Mode ──
  light:
    background: "#FAFAFA"
    surface: "#FFFFFF"
    surfaceSecondary: "#F3F4F6"
    primary: "#2563EB"
    primaryHover: "#1D4ED8"
    success: "#10B981"
    successBackground: "#ECFDF5"
    danger: "#EF4444"
    dangerBackground: "#FEF2F2"
    warning: "#F59E0B"
    warningBackground: "#FFFBEB"
    text: "#111827"
    textSecondary: "#6B7280"
    textDisabled: "#9CA3AF"
    border: "#E5E7EB"
    borderFocused: "#2563EB"
    overlay: "rgba(0,0,0,0.5)"
    income: "#059669"
    expense: "#DC2626"

  # ── Dark Mode ──
  dark:
    background: "#0B0D13"
    surface: "#151821"
    surfaceSecondary: "#1E2130"
    primary: "#3B82F6"
    primaryHover: "#60A5FA"
    success: "#34D399"
    successBackground: "#0F2F21"
    danger: "#F87171"
    dangerBackground: "#3B1515"
    warning: "#FBBF24"
    warningBackground: "#3B2F15"
    text: "#F1F5F9"
    textSecondary: "#94A3B8"
    textDisabled: "#64748B"
    border: "#2A2D3A"
    borderFocused: "#3B82F6"
    overlay: "rgba(0,0,0,0.7)"
    income: "#34D399"
    expense: "#F87171"

typography:
  fontFamily: "Inter"
  display:
    fontFamily: "Inter"
    fontSize: 32px
    fontWeight: "700"
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  h1:
    fontFamily: "Inter"
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  h2:
    fontFamily: "Inter"
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 1.3
    letterSpacing: "normal"
  h3:
    fontFamily: "Inter"
    fontSize: 18px
    fontWeight: "600"
    lineHeight: 1.35
    letterSpacing: "normal"
  body:
    fontFamily: "Inter"
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 1.5
    letterSpacing: "normal"
  bodyBold:
    fontFamily: "Inter"
    fontSize: 16px
    fontWeight: "600"
    lineHeight: 1.5
    letterSpacing: "normal"
  caption:
    fontFamily: "Inter"
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 1.4
    letterSpacing: "normal"
  label:
    fontFamily: "Inter"
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 1.3
    letterSpacing: "0.02em"
    textTransform: "uppercase"
  monetaryValue:
    fontFamily: "Inter"
    fontSize: 32px
    fontWeight: "700"
    lineHeight: 1.15
    letterSpacing: "-0.02em"
    fontVariant: "tabular-nums"

rounded:
  sm: 6px
  md: 10px
  lg: 14px
  xl: 20px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  xxxl: 48px
  screenPadding: 16px

components:
  button-primary:
    backgroundColor: "{colors.light.primary}"
    textColor: "#FFFFFF"
    typography: "{typography.bodyBold}"
    rounded: "{rounded.full}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.light.primaryHover}"
  button-secondary:
    backgroundColor: "{colors.light.surfaceSecondary}"
    textColor: "{colors.light.text}"
    typography: "{typography.bodyBold}"
    rounded: "{rounded.full}"
    padding: "14px 24px"
    borderWidth: 1
    borderColor: "{colors.light.border}"
  button-secondary-hover:
    backgroundColor: "{colors.light.border}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.light.primary}"
    typography: "{typography.bodyBold}"
    rounded: "{rounded.full}"
    padding: "12px 20px"
  button-danger:
    backgroundColor: "{colors.light.danger}"
    textColor: "#FFFFFF"
    typography: "{typography.bodyBold}"
    rounded: "{rounded.full}"
    padding: "14px 24px"

  input-default:
    backgroundColor: "{colors.light.surface}"
    textColor: "{colors.light.text}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "14px 16px"
    borderWidth: 1
    borderColor: "{colors.light.border}"
    placeholderColor: "{colors.light.textDisabled}"
  input-focus:
    borderColor: "{colors.light.primary}"
    borderWidth: 2
  input-error:
    borderColor: "{colors.light.danger}"
    borderWidth: 1
    backgroundColor: "{colors.light.dangerBackground}"

  card-default:
    backgroundColor: "{colors.light.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    borderWidth: 1
    borderColor: "{colors.light.border}"
  card-elevated:
    backgroundColor: "{colors.light.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    shadow: "0 1px 3px rgba(0,0,0,0.08)"

  modal-overlay:
    backgroundColor: "{colors.light.overlay}"
  modal-content:
    backgroundColor: "{colors.light.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"

  fab:
    backgroundColor: "{colors.light.primary}"
    rounded: "{rounded.full}"
    size: 56px
    shadow: "0 4px 12px rgba(37,99,235,0.4)"
    iconColor: "#FFFFFF"
  fab-hover:
    backgroundColor: "{colors.light.primaryHover}"

  transaction-list-item:
    backgroundColor: "{colors.light.surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
    borderBottomWidth: 1
    borderBottomColor: "{colors.light.border}"

  tab-bar:
    backgroundColor: "{colors.light.surface}"
    borderTopWidth: 1
    borderTopColor: "{colors.light.border}"
    height: 56px
  tab-bar-active:
    color: "{colors.light.primary}"
  tab-bar-inactive:
    color: "{colors.light.textDisabled}"

  badge-income:
    backgroundColor: "{colors.light.successBackground}"
    textColor: "{colors.light.income}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
    typography: "{typography.label}"
  badge-expense:
    backgroundColor: "{colors.light.dangerBackground}"
    textColor: "{colors.light.expense}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
    typography: "{typography.label}"

  empty-state:
    backgroundColor: "transparent"
    textColor: "{colors.light.textSecondary}"
    typography: "{typography.body}"
    padding: "{spacing.xxxl} {spacing.screenPadding}"

  loading-state:
    backgroundColor: "transparent"
    padding: "{spacing.xxxl} {spacing.screenPadding}"

  error-state:
    backgroundColor: "{colors.light.dangerBackground}"
    textColor: "{colors.light.danger}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
---

## 1. Overview

**Financelio** é o copiloto financeiro pessoal — claro, direto e confiável. A identidade visual
segue os princípios de design dos apps financeiros modernos (Revolut, Nubank, Stripe, Coinbase):
minimalismo funcional, tipografia nítida para valores monetários e cores semânticas que guiam
a ação sem distrair.

**Personalidade visual:** Confiança azul + clareza tipográfica + toques de cor só quando necessário.

**Stack técnica:** React Native com `StyleSheet.create()`. Zero dependência de bibliotecas de
componentes UI (sem NativeBase, React Native Paper, etc.). Todos os componentes são construídos
com os tokens definidos neste DESIGN.md.

## 2. Colors

### Filosofia de cor

- **Azul (`primary`):** A cor universal da confiança em finanças. Usada em ações primárias (salvar, confirmar),
links e indicadores de seleção. Tons: `#2563EB` (light) / `#3B82F6` (dark).
- **Verde (`success`, `income`):** Receitas e saldo positivo. Verde esmeralda (`#059669` / `#34D399`)
transmite crescimento e segurança — padrão em apps como Revolut e Coinbase.
- **Vermelho (`danger`, `expense`):** Despesas e ações destrutivas. Tom quente mas não agressivo
(`#DC2626` / `#F87171`) — sinaliza atenção sem alarmismo.
- **Âmbar (`warning`):** Alertas, limites próximos, confirmações de exclusão. Laranja-dourado
(`#F59E0B` / `#FBBF24`) é visível sem competir com danger.
- **Neutros (`background`, `surface`, `text`, `border`):** Tons cinza-azulados que criam
hierarquia sem interferir nas cores semânticas.

### Uso dos modos

| Propósito | Light Mode | Dark Mode |
|-----------|-----------|-----------|
| Fundo da tela | `#FAFAFA` | `#0B0D13` |
| Cartões / containers | `#FFFFFF` | `#151821` |
| Superfície secundária | `#F3F4F6` | `#1E2130` |
| Texto principal | `#111827` | `#F1F5F9` |
| Texto secundário | `#6B7280` | `#94A3B8` |
| Bordas | `#E5E7EB` | `#2A2D3A` |
| Overlay modal | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.7)` |

### Contraste WCAG

Todos os pares `textColor`/`backgroundColor` nos componentes atendem WCAG AA (4.5:1 para texto normal,
3:1 para texto grande). Validar com `npx @google/design.md lint DESIGN.md` a cada alteração.

## 3. Typography

### Escolha da fonte: Inter

**Inter** (Rasmus Andersson, 2017–presente) é a escolha ideal para apps financeiros:

1. **tabular-nums:** Todos os dígitos ocupam a mesma largura. Essencial para alinhar valores
   monetários em listas e tabelas — `R$12.345,67` alinha perfeitamente com `R$8,90`.
2. **Legibilidade em telas:** Desenhada especificamente para UIs digitais com altura-x elevada,
   aberturas amplas e espaçamento generoso.
3. **Família completa:** 9 pesos (100–900) + itálico, permitindo hierarquia sem trocar de fonte.
4. **Open source (SIL OFL):** Sem custos de licenciamento.

**Carga em React Native:**
```tsx
// app/_layout.tsx
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
```

### Hierarquia tipográfica

| Função | Peso | Tamanho | Line-height | Uso |
|--------|------|---------|-------------|-----|
| **Display** (valor grande) | 700 | 32px | 1.15 | Saldo total, valor destacado em cards |
| **H1** | 700 | 24px | 1.25 | Título de tela (Dashboard, Transações) |
| **H2** | 600 | 20px | 1.30 | Títulos de seção, cabeçalhos de card |
| **H3** | 600 | 18px | 1.35 | Subtítulos, títulos de modal |
| **Body** | 400 | 16px | 1.50 | Texto corrido, descrições |
| **Body Bold** | 600 | 16px | 1.50 | Labels de input, botões, ênfase |
| **Caption** | 400 | 14px | 1.40 | Data/hora, metadados |
| **Label** | 600 | 12px | 1.30 | Categorias, badges, tabs inativas |

### Regras para valores monetários

- **Sempre usar `fontVariant: ['tabular-nums']`** em qualquer componente que exiba valores (R$).
- **Valores positivos:** `colors.income` (verde), sinal de `+` opcional.
- **Valores negativos:** `colors.expense` (vermelho), prefixo `-` obrigatório.
- **Alinhamento:** valores em lista alinhados à direita com tabular-nums.

## 4. Layout & Spacing

### Sistema de espaçamento (base 4px)

| Token | Valor | Uso principal |
|-------|-------|---------------|
| `xs` | 4px | Gap entre ícone e texto dentro de um chip/badge |
| `sm` | 8px | Gap entre itens em lista, padding interno de badges |
| `md` | 12px | Gap entre seções dentro de card, padding de inputs |
| `lg` | 16px | Padding de cards, gap entre cards na tela, screen padding |
| `xl` | 24px | Margem entre seções, padding de modal |
| `xxl` | 32px | Espaçamento entre grupos de cards |
| `xxxl` | 48px | Espaçamento de empty states, cabeçalhos de tela |
| `screenPadding` | 16px | Padding horizontal das bordas da tela |

### Regras de layout

- **Screen padding:** Todo conteúdo rolável usa `paddingHorizontal: spacing.screenPadding` (16px).
  Cards e listas ocupam a largura total menos o screen padding.
- **Cards:** Gap vertical entre cards = `spacing.md` (12px). Padding interno = `spacing.lg` (16px).
- **Formulários:** Gap entre campos = `spacing.md` (12px). Label → input = `spacing.xs` (4px).
- **Modal:** Padding interno = `spacing.xl` (24px). Botões separados por `spacing.md` (12px).
- **Touch targets:** Todos os elementos interativos têm altura mínima de 44px (WCAG 2.1).

## 5. Elevation & Depth

Financelio usa elevação sutil — inspirado no Revolut (flat) mas com camadas de profundidade
para destacar ações flutuantes e modais.

| Nível | Sombra | Uso |
|-------|--------|-----|
| 0 (Flat) | Nenhuma | Telas, listas, inputs, tabs |
| 1 (Card) | `0 1px 3px rgba(0,0,0,0.08)` | Cards elevados, seções destacadas |
| 2 (FAB) | `0 4px 12px rgba(37,99,235,0.4)` | Floating Action Button com sombra colorida |
| 3 (Modal) | Overlay + `0 8px 24px rgba(0,0,0,0.12)` | Modal content sobre overlay escuro |

**Shadow em React Native:**
```ts
// Nível 1 (Card)
shadowColor: '#000',
shadowOffset: { width: 0, height: 1 },
shadowOpacity: 0.08,
shadowRadius: 3,
elevation: 2, // Android
```

## 6. Shapes

### Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `sm` | 6px | Chips de categoria, badges, tooltips |
| `md` | 10px | Inputs, small cards, dropdowns |
| `lg` | 14px | Cards padrão, list items, bottom sheets |
| `xl` | 20px | Modal containers, gráficos simples |
| `full` | 9999px | Botões (pill), FAB, avatares, ícones em círculo |

### Filosofia de arredondamento

- **Botões = `full` (pill):** Padrão fintech universal. Revolut, Coinbase, Nubank — todos
  usam botões totalmente arredondados. Transmite modernidade e é ergonomicamente amigável.
- **Cards = `lg` (14px):** Arredondamento perceptível sem ser "bolha". Distingue cards
  do fundo sem chamar atenção para a forma.
- **Inputs = `md` (10px):** Sutil o suficiente para não confundir com botões.
- **Nunca usar `0px`** (cantos vivos) — mesmo bordas sutis devem ter ao menos 2px.

## 7. Components

Todos os componentes são construídos com `StyleSheet.create()` e consomem os tokens via
um hook `useColors()` que detecta o tema atual (light/dark).

### 7.1 Button

**Variantes:** primary, secondary, ghost, danger
**Tamanho único:** 14px 24px padding (generoso, como Revolut)

| Variante | Background | Texto | Borda | Uso |
|----------|-----------|-------|-------|-----|
| Primary | `colors.primary` | Branco | Nenhuma | Ação principal (Salvar, Confirmar) |
| Secondary | `colors.surfaceSecondary` | `colors.text` | `colors.border` | Ação secundária (Cancelar) |
| Ghost | Transparente | `colors.primary` | Nenhuma | Ação terciária (Ver mais, Editar) |
| Danger | `colors.danger` | Branco | Nenhuma | Excluir, Sair |

**Estados:** default, pressed (opacity 0.8), disabled (opacity 0.4).

### 7.2 Input

- **Default:** `backgroundColor: surface`, borda `border`, placeholder `textDisabled`.
- **Focus:** borda `primary`, largura 2px.
- **Error:** borda `danger`, fundo `dangerBackground`, texto de erro abaixo em `caption` + `danger`.
- **Label:** acima do input, `bodyBold`, gap de 4px.
- **Ícones:** opcionais à esquerda (categoria) ou direita (clear, visibility toggle).

### 7.3 Card

- **Default:** fundo `surface`, borda `border` (1px), padding `lg`, radius `lg`.
- **Elevated:** mesmo que default + shadow nível 1.
- Card de transação: header com ícone de categoria + valor, body com descrição, footer com data.

### 7.4 Modal

- **Overlay:** `overlay` (50% preto), cobre a tela inteira, fecha ao tocar fora.
- **Content:** fundo `surface`, radius `xl`, padding `xl`. Header com título (H3) + botão fechar,
  body com conteúdo scrollável, footer com botões (Cancelar | Salvar).

### 7.5 FAB (Floating Action Button)

- **Tamanho:** 56px × 56px (touch target amplo).
- **Formato:** Circle (`full` radius).
- **Cor:** `primary` com sombra colorida (nível 2).
- **Ícone:** `+` branco, 24px.
- **Posição:** bottom-right, 16px das bordas. `position: absolute`.
- **Uso:** Adicionar transação (tela principal).

### 7.6 Transaction List Item

- **Layout:** Row com [ícone categoria | título + categoria | valor].
- **Ícone:** 40px círculo com ícone da categoria, fundo `surfaceSecondary`.
- **Valor:** `monetaryValue` + cor semântica (`income`/`expense`).
- **Swipe actions:** Deslizar para esquerda revela "Excluir" (danger). Direita revela "Editar".

### 7.7 Tab Bar

- **Altura:** 56px (com iOS safe area: 56px + paddingBottom).
- **Background:** `surface` com borda superior `border`.
- **Ícones ativos:** `primary`, 24px.
- **Ícones inativos:** `textDisabled`, 24px.
- **Labels:** `label` (12px, 600), ativo = `primary`, inativo = `textDisabled`.

### 7.8 Badges (Income / Expense)

- **Income:** fundo `successBackground`, texto `income`, radius `full`.
- **Expense:** fundo `dangerBackground`, texto `expense`, radius `full`.
- **Tamanho:** padding 4px 10px, `label` typography (12px, 600, uppercase).

### 7.9 States (Empty, Loading, Error)

- **Empty State:** Ícone centralizado (48px, `textDisabled`), texto `textSecondary`, padding generoso.
- **Loading State:** ActivityIndicator (cor `primary`) centralizado.
- **Error State:** Card com fundo `dangerBackground`, ícone + texto `danger`, botão "Tentar novamente".

## 8. Do's and Don'ts

### ✅ Do

- **Use `tabular-nums`** em TODOS os valores monetários — alinhamento é crítico.
- **Use cores semânticas** — verde = receita, vermelho = despesa. Nunca troque.
- **Prefira botões pill** (`full` radius) para ações — padrão fintech.
- **Use `useColors()` hook** — nunca hardcode cores. Isso garante light/dark mode automático.
- **Mantenha touch targets ≥ 44px** — acessibilidade é requisito, não opcional.
- **Use tons neutros para superfícies** — reserve cores vibrantes para ações e dados.
- **Valide contraste** com `@google/design.md lint` antes de shipping.
- **Mantenha um tom otimista** — verde para crescimento, azul para confiança. Evite vermelho
  decorativo (só para despesas e ações destrutivas).

### ❌ Don't

- **NÃO use bibliotecas de componentes** (NativeBase, Paper, UI Kitten, etc.) — todos os
  componentes são `StyleSheet.create()` puro.
- **NÃO use cantos vivos (0px)** — mínimo 2px de arredondamento.
- **NÃO hardcode strings de cor** (`#2563EB`) nos componentes — use o hook `useColors()`.
- **NÃO use sombras fortes** — máximo nível 3. Finanças pedem leveza, não brutalismo.
- **NÃO use vermelho para saldo positivo** — mas NUNCA. Vermelho = despesa/danger, sempre.
- **NÃO use texto pequeno para valores** — mínimo `body` (16px) para qualquer cifra.
- **NÃO abuse de animações** — micro-interações sutis (200ms ease-out) são bem-vindas;
  animações longas ou complexas distraem do dado financeiro.
- **NÃO desabilite a transição light/dark** — o app deve responder à preferência do sistema
  (`Appearance` API do React Native).

---

> **Referências:** Revolut (pill buttons, flat design, teal success), Coinbase (blue primary, DM Sans clarity),
> Stripe (neutral surfaces, semantic colors), Nubank (purple brand, clean typography).
>
> **Validação:** Execute `npx @google/design.md lint DESIGN.md` para checar estrutura e contraste.
