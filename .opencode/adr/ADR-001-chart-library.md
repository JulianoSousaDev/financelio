# ADR-001: Biblioteca de Gráficos para o Financélio

**Data:** 2026-05-01  
**Status:** Decidida  
**Contexto:** Seleção da biblioteca de gráficos para o dashboard e visualizações do Financélio

## Decisão

Utilizar **react-native-chart-kit** combinada com **react-native-svg** para renderização de gráficos no aplicativo Financélio.

## Justificativa

A decisão foi tomada com base nos seguintes fatores:

1. **Dependência já instalada**: As bibliotecas `react-native-chart-kit` (^6.12.0) e `react-native-svg` (^15.9.0) já estão presente no `package.json` do projeto, evitando增量 de bundle e tempo de instalação.

2. **Suporte a múltiplos tipos de gráficos**: A biblioteca oferece suporte a:
   - Line Chart (gráficos de linha)
   - Bar Chart (gráficos de barras)
   - Pie Chart (gráficos de pizza)
   - Progress Chart (gráficos de progresso)
   - Contribution Graph (gráfico de contribuição)

3. **SVG nativo**: A renderização via SVG nativo oferece:
   - Performance superior em dispositivos móveis
   - Alta qualidade em diferentes resoluções de tela
   - Flexibilidade para personalização via CSS-like properties

4. **Ecossistema Expo compatível**: A biblioteca é compatível com Expo SDK 54 e React Native 0.81.5.

5. **TypeScript disponível**: Definições de tipos bem estruturadas.

## Alternativas Consideradas

### 1. victory-native

- **Descripción:** Biblioteca de gráficos completa com foco em visualizações de dados complexas.
- **Motivo da rejeição:** Bundle size significativamente maior (~500KB vs ~50KB do react-native-chart-kit), o que impacta diretamente o tempo de carregamento do aplicativo e a experiência do usuário, especialmente em dispositivos mais lentos ou conexões limitadas.

### 2. apexcharts

- **Descripción:** Biblioteca popular com suporte a diversos tipos de gráficos.
- **Motivo da rejeição:** Não possui suporte oficial para React Native 0.81.5. A última atualização do wrapper React Native foi há mais de 12 meses, gerando risco de incompatibilidade com versões futuras do RN e problemas de manutenção.

### 3. react-native-svg-charts

- **Descrição:** Biblioteca leve baseada em react-native-svg para gráficos simples.
- **Motivo da rejeição:** Projeto abandonado pelo mantenedor original desde 2021. Issues e PRs não são respondidos, e não há updates de segurança ou compatibilidade com versões recentes do React Native. Risco elevado de vulnerabilidades e incompatibilidades.

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Descontinuação da biblioteca | Baixa | Alto | Monitorar activity do repositório; manter alternativa em vista (victory-native como fallback) |
| Problemas de performance com grandes datasets | Média | Médio | Implementar data aggregation antes da renderização; lazy loading para gráficos |
| Limitação de personalização | Baixa | Baixo | react-native-svg permite custom drawing quando necessário |
| Incompatibilidade com futuras versões do RN | Baixa | Médio | Testes de regressão em cada upgrade do RN; manter библиотека atualizada |

## Resultado da Decisão

A escolha por **react-native-chart-kit + react-native-svg** representa o melhor balance entre:

- ✅ Redução de bundle size
- ✅ Funcionalidades suficientes para o dashboard financeiro
- ✅ Performance adequada em dispositivos móveis
- ✅ Manutenibilidade (biblioteca ativa e bem documentada)
- ✅ Compatibilidade com a stack atual do projeto (Expo SDK 54, RN 0.81.5)

A implementação será utilizada nos seguintes componentes:
- `useChartData` - Hook para agregação e processamento de dados
- Dashboard de receitas/despesas (line chart)
- Gráfico de categorias (pie chart)
- Tendências mensais (bar chart)

---

**Decisor:** Equipe de Desenvolvimento Financélio  
**Revisão:** Disponível em `.opencode/adr/`