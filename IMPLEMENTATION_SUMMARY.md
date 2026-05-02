# Implementação CRUD de Categorias - Financelio

## Arquivos Criados/Modificados

### 1. `src/data/supabase/categories.ts`
- Funções CRUD completas para categorias:
  - `fetchCategories(userId)` - seleciona ordenado por nome
  - `createCategory(userId, name, color, icon)`
  - `updateCategory(id, name, color, icon)`
  - `deleteCategory(id)`
  - `seedDefaultCategories(userId)` - 9 categorias padrão com "Renda extra" (não "Freelance")
- Tratamento de erro para duplicidade na seed (ignora código 23505)

### 2. `src/presentation/hooks/useCategories.ts`
- Hook personalizado com:
  - State: `categories`, `loading`
  - Funções: `create`, `update`, `remove`, `refetch`
  - Efeito que carrega categorias e chama seed se lista vazia
  - Utiliza `useAuth` para obter usuário logado

### 3. `src/presentation/components/ui/CategoryIconSelector.tsx`
- Seletor de ícone com:
  - Botão que abre Modal transparente
  - Grid com 15 ícones (home, egg, car-outline, heart, film, book, credit-card, briefcase, dots-horizontal, shopping, car, medical, flight, gift, star)
  - Seleção visual com highlight na cor primária
  - Fecha modal ao selecionar ícone

### 4. `app/(app)/categories/index.tsx` (substituído completamente)
- Tela de categorias com:
  - FlatList exibindo colorDot + nome + ícone de lixeira
  - FAB (+) que abre modal de criação/edição
  - Modal contendo:
    - Input para nome da categoria
    - Paleta de cores (10 opções: #EF4444, #F97316, #EAB308, #22C55E, #10B981, #06B6D4, #3B82F6, #8B5CF6, #EC4899, #6B7280)
    - CategoryIconSelector para escolha de ícone
    - Botões Cancelar (secundário) e Salvar (primário)
  - Exclusão com Alert.confirm
  - Loading state com ActivityIndicator
  - Empty state exibindo "Nenhuma categoria"
  - Funcionalidade de edição ao clicar no item

## Características Implementadas
✅ Seed usa "Renda extra" (corrigido)
✅ FlatList com colorDot + name + trash icon
✅ FAB (+) abre Modal
✅ Modal serve para criar E editar
✅ Exclusão com Alert.confirm
✅ seedDefaultCategories executa se lista vazia
✅ Paleta de cores conforme especificação
✅ Loading e empty states

## Dependências Assumidas
- Componentes UI existentes: Modal, Input, Button
- Context Auth em `src/presentation/contexts/AuthContext`
- Tema em `src/presentation/theme`
- Ícones do `@expo/vector-icons/Ionicons`
- Supabase client configurado em `src/data/supabase/client`

## Observações
- O modal de ícone usa texto para representar ícones (ex: "home", "egg"). Em produção, esses deveriam ser substituídos por componentes de ícone reais.
- A validação de nome obrigatório está implementada.
- A edição pré-popula os campos com os dados da categoria selecionada.