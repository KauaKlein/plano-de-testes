const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = "gemini-2.5-flash";

interface GeminiResponse {
  preCondicoes: string;
  dadosTeste: string;
  funcionalidade: string;
  sistemaIntegrado: string;
  tipoTeste: string;
  casFormatados: Array<{
    id: string;
    title: string;
    descricao: string;
  }>;
}

const SRT_CONTEXT = `
# CONTEXTO COMPLETO DO SISTEMA SRT - SISTEMA DE REGISTRO DE TERCEIROS

## 🎯 GLOSSÁRIO - Siglas e Abreviações

### Sistema Principal
- **SRT**: Sistema de Registro de Terceiros (plataforma de gestão empresarial)
- **TR**: Código de identificação do terceiro (ex: TR000666)
- **CPF**: Cadastro de Pessoa Física
- **CNPJ**: Cadastro Nacional da Pessoa Jurídica

### Entidades de Dados Principais
- **TER**: Terceiro (pessoas que prestam serviços)
- **CTT**: Contrato (vínculo entre terceiros, fornecedores e contratantes)
- **EMP**: Empresa/Contratante
- **FRN**: Fornecedor (empresas que prestam serviço)
- **ETT**: Estruturas (hierarquia departamental)
- **FIL**: Filiais (unidades de negócio por UF)
- **SFT**: Situação Funcional do Terceiro
- **USU**: Usuário do sistema
- **PFL**: Perfil de usuário
- **PER**: Permissões

### Tabelas de Domínio
- **ACO**: tb_srt_acao
- **CGO**: tb_srt_cargo
- **CEX**: tb_srt_comunicacao_externa
- **LOG**: tb_srt_logs
- **NOT**: tb_srt_notificacao
- **TAR**: tb_srt_tarefas
- **BAI**: tb_srt_bairro
- **END**: tb_srt_enderecos
- **PRE**: tb_srt_predios
- **MUN**: tb_srt_municipios

### Padrões de Código Backend
- **cls_**: Prefixo para classes concretas
- **int_**: Prefixo para interfaces
- **dto_**: Prefixo para Data Transfer Objects
- **uc_**: Prefixo para Use Cases

## 📋 ENTIDADES E RELACIONAMENTOS

### Terceiro (TER)
**Definição**: Pessoa física ou jurídica que presta serviços

**Tipos**:
- **Nacional**: Possui CPF, é cidadão brasileiro
- **Estrangeiro**: Sem CPF, residente estrangeiro

**Características Obrigatórias**:
- Sempre vinculado a EXATAMENTE UM FORNECEDOR
- Pode ter MÚLTIPLOS CONTRATOS com diferentes contratantes
- TODOS os contratos do mesmo terceiro devem ser do mesmo fornecedor
- Deve ter uma SITUAÇÃO FUNCIONAL ativa
- Relacionamento obrigatório com: Prédio, Cargo, Prestação de Serviço, Tipo de Matrícula

**Validações**:
- CPF/CNPJ válidos e únicos
- Datas em formatos específicos: datetime (YYYYMMDDHHMMSS), date (YYYY-MM-DD)
- Herança: cls_terceiroBase → cls_terceiroNacional/cls_terceiroEstrangeiro
- Criação obrigatória via Factory: cls_factory_terceiros

### Contrato (CTT)
**Definição**: Vínculo entre Terceiro, Fornecedor e Contratante

**Características Obrigatórias**:
- DEVE TER um Contratante (empresa do grupo Oi)
- DEVE TER um Fornecedor (empresa prestadora)
- DEVE TER um ou mais Terceiros
- Estrutura do Terceiro É a Estrutura do Contrato
- Relacionado a Filiais e Estruturas Organizacionais
- Possui aprovações e tipos de acesso

**Estados Possíveis**:
- Em Aprovação: Aguardando validação
- Aprovado: Ativo e operacional
- Prorrogado: Período estendido
- Encerrado: Finalizado

### Situação Funcional (SFT)
**Definição**: Estado temporal do terceiro no sistema

**Tipos**:
- **Atividade Normal**: Terceiro ativo e operacional
- **Inativo**: Terceiro desabilitado
- **Bloqueado**: Terceiro impedido temporariamente
- **Em Licença**: Terceiro em afastamento

**Requisitos**:
- Data/Hora de referência (YYYYMMDDHHMMSS)
- Data de início (YYYY-MM-DD)
- Data de fim (YYYY-MM-DD)
- Motivo da situação
- Histórico temporal obrigatório

### Contratante
**Definição**: Empresa do grupo Oi que contrata serviços

**Responsabilidades**:
- Aprovar terceiros e contratos
- Gerenciar estruturas organizacionais
- Controlar acesso de usuários

### Fornecedor
**Definição**: Empresa que presta serviços aos contratantes

**Responsabilidades**:
- Fornecer terceiros qualificados
- Gerenciar contratos com contratantes
- Responsável pela estrutura dos terceiros

### Estrutura Organizacional (ETT)
**Definição**: Hierarquia departamental da organização

**Características**:
- Representação de hierarquia departamental
- Associada a Filiais para determinar estrutura por UF
- Entidades associadas são visíveis APENAS para usuários do mesmo nível ou inferior
- Aplicável a terceiros e contratos (estrutura do terceiro = estrutura do contrato)

### Filial (FIL)
**Definição**: Unidade de negócio por Estado (UF)

**Características**:
- Uma por UF (Unidade Federativa)
- Relacionada a Estruturas para organização por região
- Determina jurisdição de contratantes e terceiros

## 🔐 SISTEMA DE VISIBILIDADE - Regras de Acesso

### Conceito Fundamental
Determina quais registros um usuário logado pode visualizar baseado em:
- **Tipo de Vinculação**: Contratante (C) vs Fornecedor (F)
- **Estrutura Organizacional**: Nível hierárquico
- **Filial**: Unidade de negócio por UF
- **Contratos**: Específicos (para fornecedores)

### Usuários Contratantes (Vinculação: 'C')
**Características**:
- Associados a UMA Estrutura e ZERO OU UMA Filial
- Filial é OPCIONAL

**Regras de Visibilidade**:
1. **Se tem Estrutura E Filial**: Vê entidades da MESMA estrutura E MESMA filial
2. **Se tem apenas Estrutura**: Vê entidades da MESMA estrutura (qualquer filial)
3. **Se tem apenas Filial**: Vê entidades da MESMA filial (qualquer estrutura)
4. **Se NÃO tem Estrutura nem Filial**: Visualiza TUDO

**Hierarquia**: Usuário vê seu nível e todos os SUBORDINADOS

### Usuários Fornecedores (Vinculação: 'F')
**Características**:
- Estrutura determinada pelos CONTRATOS associados
- Deve estar vinculado a um FORNECEDOR
- Pode estar vinculado a MÚLTIPLOS CONTRATOS do mesmo fornecedor
- Cada usuário tem acesso EXCLUSIVO a contratos específicos

**Regras de Visibilidade**:
1. Vê APENAS terceiros dos contratos na sua hierarquia
2. A estrutura do terceiro = estrutura do contrato
3. Se tem múltiplos contratos, vê terceiros de TODOS eles

**Hierarquia**: Usuário vê estrutura do contrato e TODAS as subordinadas

### Regra de Hierarquia Universal
- Aplica-se a TODAS as entidades associadas a Contratos
- Exemplo: Usuário só acessa terceiros dos contratos na sua hierarquia
- **Para TODOS os efeitos: a estrutura do terceiro É a estrutura do contrato**

## 🔄 INTEGRAÇÕES E BARRAMENTO

### Sistemas Externos
- **AUT**: Sistema de Autenticação/Matrícula (Oi)
- **NDS**: Sistema de Dados (Oi)
- **CURE**: Sistema Complementar (Oi)

### Comunicação
- **Tipo**: Assíncrona via Barramento de Mensagens
- **Retornos Possíveis**:
  - **OK**: Operação realizada com sucesso
  - **ERRO**: Falha na operação (com código parametrizado)
  - **PENDENTE**: Aguardando processamento
  - **RETENTATIVA**: Sistema deve reenviar

### Ações de Erro Configuráveis
- **Reenviar Evento**: Retentativa automática
- **Efetivar Operação**: Forçar aplicação
- **Manual**: Requer intervenção
- **Sem Ação**: Apenas registra

### Códigos de Erro Parametrizados
- **ERR001**: Sistema Indisponível
- **ERR002**: Dados Inválidos
- **ERR003**: Terceiro não encontrado
- **ERR004**: Contrato expirado
- **ERR005**: Acesso negado por visibilidade
- **ERR006**: Limite de tentativas excedido

## 📊 FORMATOS E PADRÕES

### Identificadores
- **UUID**: Identificadores únicos (ex: 2a965b8f-8ead-4536-855a-3440ec2e2ddd)
- **TR Code**: Código do terceiro (ex: TR000666)
- **CPF**: XXX.XXX.XXX-XX (com máscara na exibição)
- **CNPJ**: XX.XXX.XXX/XXXX-XX (com máscara na exibição)

### Datas e Horas
- **DateTime**: YYYYMMDDHHMMSS (ex: 20240101120000)
- **Date**: YYYY-MM-DD (ex: 2024-01-01)
- **Time**: HHMMSS (ex: 120000)
- **Timezone**: UTC (Brasília = UTC-3)

### Tipos de Dados Backend
- **Tipos Numéricos**: Apenas para cálculos
- **DateTime**: Para manipulação de datas
- **String**: Para dados genéricos e valores não calculados
- **Boolean**: Para valores binários (ativo/inativo)

## 🧪 TIPOS DE TESTE APLICÁVEIS

### 1. Teste de Integração
**Escopo**: Comunicação entre SRT e sistemas externos (AUT, NDS, CURE)

**Cenários Típicos**:
- Envio de dados de terceiro para sistema externo
- Recebimento de confirmação via barramento
- Tratamento de erros e retentativas
- Timeout e falhas de conectividade

### 2. Teste de Barramento
**Escopo**: Eventos assíncronos e processamento em background

**Cenários Típicos**:
- Evento de criação de terceiro dispara geração de matrícula
- Retorno de sistema externo é processado corretamente
- Notificações são enviadas ao usuário
- Histórico de eventos é registrado

### 3. Teste CRUD
**Escopo**: Operações de Criar, Ler, Atualizar, Deletar entidades

**Cenários Típicos**:
- Criar terceiro com validações
- Listar terceiros com filtros
- Atualizar dados do terceiro
- Deletar/Arquivar terceiro
- Verificar auditoria (created_by, updated_by)

### 4. Teste de Validação
**Escopo**: Regras de negócio e constraints

**Cenários Típicos**:
- Validação de CPF/CNPJ
- Validação de formatos de data
- Validação de relacionamentos obrigatórios
- Validação de situações funcionais
- Validação de hierarquia de estruturas

### 5. Teste de Visibilidade/Autorização
**Escopo**: Controle de acesso baseado em hierarquia

**Cenários Típicos**:
- Usuário contratante vê apenas terceiros da sua estrutura
- Usuário fornecedor vê apenas contratos vinculados
- Usuário sem estrutura vê tudo
- Usuário subordinado vê estrutura superior

### 6. Teste Unitário
**Escopo**: Classes individuais em isolamento

**Cenários Típicos**:
- Factory cria tipo correto de terceiro
- Validações de negócio funcionam
- Métodos de entidade calculam corretamente
- Transformações de DTO funcionam

## 🏗️ ARQUITETURA E PADRÕES DE DESENVOLVIMENTO

### Padrão: Factory
**Uso**: Criação de entidades polimórficas

**Exemplo**: 
- cls_factory_terceiros decide se cria Nacional ou Estrangeiro
- Factory verifica CPF para tipo Nacional
- Factory valida dados antes de criação

### Padrão: Repository
**Uso**: Abstração de acesso a dados

**Características**:
- Interface no domínio (int_repositorio_terceiro)
- Implementação em infraestrutura (cls_repositorio_Terceiro)
- Métodos: salvar, buscarPorId, listar, deletar
- Retorna entidades do domínio, não Models

### Padrão: Use Case
**Uso**: Encapsulamento de regras de negócio

**Exemplo**: uc_terceiro_store
1. Valida entrada (DTO)
2. Cria entidade via Factory
3. Persiste via Repository
4. Retorna DTO de saída
5. Dispara eventos de negócio

### Padrão: DTO (Data Transfer Object)
**Uso**: Transferência de dados entre camadas

**Convenção**:
- **dto_in_**: Entrada de dados
- **dto_out_**: Saída de dados

### Padrão: Prototype para Visibilidade
**Uso**: Aplicação dinâmica de regras de visibilidade

**Localização**: Core\\VisibilidadeUsuario\\ProtoTypeFactory\\

### Herança Polimórfica
**Exemplo**: 
- cls_terceiroBase (classe abstrata)
- cls_terceiroNacional (herda de Base)
- cls_terceiroEstrangeiro (herda de Base)
- Validação via: parent::validar() + específica

### Models Laravel
**Convenção**:
- Devem herdar de ModelBase quando possível
- ModelBase já implementa created_by e updated_by
- Fillable deve ser redeclarado em modelos filhos
- Garante registro automático do usuário logado

## 📝 VALIDAÇÕES CRÍTICAS POR ENTIDADE

### Validações de Terceiro
✅ CPF/CNPJ válido e único no sistema
✅ Documento correspondente ao tipo (CPF=Nacional, sem CPF=Estrangeiro)
✅ Nome preenchido e tamanho máximo
✅ Sempre vinculado a EXATAMENTE UM fornecedor
✅ Todos contratos do MESMO fornecedor
✅ Relacionamentos obrigatórios preenchidos (prédio, cargo, serviço, matrícula)
✅ Datas em formato correto
✅ Pelo menos UM contrato ativo

### Validações de Contrato
✅ Deve ter Contratante
✅ Deve ter Fornecedor
✅ Data de início ≤ Data de fim
✅ Data dentro da vigência permitida
✅ Estrutura do terceiro = Estrutura do contrato

### Validações de Situação Funcional
✅ Tipo válido (Atividade Normal, Inativo, etc)
✅ Data de início ≤ Data de fim
✅ Não pode ter sobreposição com outra ativa
✅ Motivo preenchido quando inativado

## 🔍 DADOS DE TESTE PADRÃO

### CPFs Fictícios Válidos
- Nacional Ativo: 111.111.111-11
- Nacional Inativo: 222.222.222-22
- Nacional com Contrato: 333.333.333-33
- Nacional com Erro: 999.999.999-99

### CNPJs Fictícios Válidos
- Fornecedor Ativo: 11.222.333/0001-81
- Fornecedor Inativo: 11.222.333/0001-82
- Contratante: 11.222.333/0001-83

### Códigos Parametrizados
- Tipo de Matrícula: 'Movimentação OS-BD'
- Cargo: 'Técnico de Suporte'
- Prestação de Serviço: 'Suporte Técnico'
- Prédio: 'Prédio A - Recepção'

### Datas Padrão
- Data Início: 01/01/2024 (20240101)
- Data Fim: 31/12/2024 (20241231)
- Data Hoje: (data atual do teste)
- Período Válido: 365 dias

### Mensagens Esperadas
- Sucesso: 'Terceiro criado com sucesso'
- Erro CPF: 'CPF inválido ou já cadastrado'
- Erro Contrato: 'Contrato não vigente'
- Erro Visibilidade: 'Você não tem permissão para acessar este registro'
- Erro Sistema: 'Erro ao comunicar com sistema externo'

## ⚠️ REGRAS DE TESTE CRÍTICAS

### Princípios Gerais
1. **Isolamento**: Cada teste independente, com dados próprios
2. **Transações**: Testes rodam em transação, revertida ao final
3. **Ordem**: Não depender de ordem de execução
4. **Limpeza**: Dados de teste sempre removidos

### Dados de Teste
1. **Factory Pattern**: Use builders/factories para criar dados
2. **Massa Base**: Use DataBuild para dados compartilhados
3. **Valores Realistas**: Use dados que simulem produção
4. **Documentação**: Comente valores não óbvios

### Mocks e Stubs
1. **Serviços Externos**: Sempre mock (AUT, NDS, CURE)
2. **Email**: Mock com MailHog em dev
3. **Fila**: Queue deve ser síncrona em testes
4. **Database**: Usar transações ou refresh

### Asserções
1. **Estado Final**: Verificar estado esperado
2. **Efeitos Colaterais**: Verificar logs, eventos, notificações
3. **Mensagens**: Verificar retornos corretos
4. **Auditoria**: Verificar created_by e updated_by

---

## 📌 RESUMO EXECUTIVO PARA TESTES

**Foco Principal**: O SRT é um sistema de VISIBILIDADE HIERÁRQUICA em que cada usuário vê diferentes dados baseado em sua estrutura organizacional.

**Entidades Críticas**: Terceiro ← Contrato ← (Contratante + Fornecedor)

**Regra de Ouro**: "A estrutura do terceiro É a estrutura do contrato"

**Teste Essencial**: Validar visibilidade em cada operação CRUD

**Integração**: Sempre testar comunicação com AUT, NDS e CURE

---
`;

export async function gerarPlanoComIA(titulo: string, caInput: string): Promise<GeminiResponse> {
  const prompt = `${SRT_CONTEXT}

## TAREFA
Você é um analista de testes especialista em documentação técnica do Sistema SRT. 
Analise os critérios de aceite fornecidos e gere um plano de testes EXTREMAMENTE DETALHADO e PROFISSIONAL.

### ENTRADA DO USUÁRIO:
Título: ${titulo}

Critérios de Aceite (texto bruto):
${caInput}

### INSTRUÇÕES PARA ANÁLISE:

1. **Identifique a Funcionalidade Principal**
   - Qual é o processo/funcionalidade sendo testado?
   - Qual o objetivo principal desta funcionalidade?

2. **Mapeie os Sistemas e Integrações**
   - Quais sistemas externos estão envolvidos? (AUT, NDS, CURE, etc)
   - Há comunicação via barramento?
   - Há processos assíncronos?

3. **Determine o Tipo de Teste**
   - Integração: Comunicação entre sistemas
   - Barramento: Eventos e retornos assíncronos
   - CRUD: Operações de cadastro
   - Validação: Regras de negócio
   - Unidade: Componentes isolados

4. **Extraia Pré-Condições Detalhadas**
   - Quais dados devem existir ANTES do teste?
   - Quais configurações/parametrizações são necessárias?
   - Quais permissões o usuário precisa?
   - Quais estados o sistema deve estar?
   
5. **Identifique Dados de Teste Necessários**
   - CPFs, CNPJs, matrículas
   - Códigos de erro e sucesso
   - Contratos, datas, valores
   - Estruturas organizacionais

6. **Organize os Critérios de Aceite**
   - Numere sequencialmente: CA01, CA02, CA03...
   - Para CADA CA, crie:
     * Título curto e descritivo (máximo 10 palavras)
     * Descrição SIMPLES, DIRETA e OBJETIVA do comportamento esperado
     * Máximo de 2-3 frases por descrição
     * Foque apenas no resultado esperado, sem enumerar muitos passos

### FORMATO DE SAÍDA:
Retorne APENAS um objeto JSON válido e completo.

REGRAS CRÍTICAS PARA JSON VÁLIDO:
1. Use APENAS aspas simples (') dentro de descrições, NUNCA aspas duplas (")
2. NUNCA quebre linhas com \\n ou enter - mantenha tudo em uma linha
3. Use ponto-e-vírgula (;) para separar itens em listas
4. SEMPRE complete o JSON - não deixe strings ou arrays abertos
5. Teste mentalmente se o JSON está válido antes de retornar

ESTRUTURA OBRIGATÓRIA:
{
  "funcionalidade": "Nome da funcionalidade SRT (ex: Geração de Matrícula para Terceiros)",
  "sistemaIntegrado": "Sistemas envolvidos separados por vírgula (ex: AUT, NDS, CURE)",
  "tipoTeste": "Integração ou Barramento ou CRUD ou Validação ou Unidade",
  "preCondicoes": "Pré-requisito 1 detalhado; Pré-requisito 2 detalhado; Pré-requisito 3 detalhado",
  "dadosTeste": "Dado de teste 1 com valores; Dado de teste 2 com valores; Dado de teste 3 com valores",
  "casFormatados": [
    {
      "id": "CA01",
      "title": "Título curto e objetivo do critério",
      "descricao": "Descrição SIMPLES e DIRETA do comportamento esperado. Máximo 2-3 frases objetivas sobre o que deve acontecer e qual o resultado esperado."
    },
    {
      "id": "CA02",
      "title": "Outro título objetivo",
      "descricao": "Outra descrição simples e direta seguindo o mesmo padrão."
    }
  ]
}

### DIRETRIZES PARA QUALIDADE:

**Pré-Condições** devem incluir:
- Dados cadastrados necessários (usuários, terceiros, contratos, etc)
- Configurações e parametrizações do sistema
- Permissões e acessos do usuário
- Estados específicos de entidades (aprovado, vigente, ativo, etc)
- Integrações configuradas e disponíveis

**Dados de Teste** devem incluir:
- Identificadores específicos (CPF: 111.111.111-11; Matrícula: 12345)
- Códigos parametrizados (Tipo de Matrícula: Movimentação OS-BD)
- Códigos de erro e sucesso (ERR001: Sistema Indisponível)
- Datas relevantes (Data Início: 01/01/2024; Data Fim: 31/12/2024)
- Mensagens esperadas (entre aspas simples)

**Descrição dos CAs** deve ser SIMPLES, DIRETA e OBJETIVA:
- Máximo de 2-3 frases por CA
- Foque no RESULTADO ESPERADO, não em passos detalhados
- Seja específico sobre validações e mensagens importantes
- Evite enumerar muitos passos (1, 2, 3, 4...)
- Formato: "Ao fazer X, o sistema deve Y. Validar que Z acontece."

**Exemplos de BOAS descrições SIMPLES e DIRETAS:**
- "Ao criar usuário tipo 'C' com todos os campos obrigatórios preenchidos corretamente, o sistema deve salvar o usuário e exibir mensagem de sucesso."
- "Ao alterar CPF de terceiro ativo, o sistema deve validar se CPF é válido e único, salvando apenas se passar nas validações."
- "Ao tentar criar usuário sem preencher campo obrigatório 'Nome', o sistema deve exibir mensagem de erro e não permitir salvar."

**Exemplos de descrições RUINS (evitar):**
- "1. Acesse a tela de Terceiros; 2. Não selecione nenhum terceiro da lista; 3. Clique no botão 'Gerar Matrícula'; 4. Valide que o sistema exibe a mensagem 'Selecione ao menos um Terceiro' e não permite prosseguir."
- Descrições com muitos passos numerados (evite listas longas de 1, 2, 3, 4, 5, 6, 7...)

IMPORTANTE: 
- Seja SIMPLES e DIRETO nas descrições (máximo 2-3 frases)
- Mantenha o contexto original dos CAs fornecidos
- Numere os CAs sequencialmente com zero à esquerda (CA01, CA02...)
- Retorne o JSON completo e válido
- Verifique se todas as aspas estão fechadas

Retorne APENAS o JSON válido, sem markdown, sem explicações.`;

  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 Tentativa ${attempt}/${maxRetries} - Chamando Gemini API...`);
      
      const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 16384,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro na API Gemini:', errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('✅ Resposta recebida:', data);
    
    // Verificar se há conteúdo válido
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ Resposta inválida da API:', data);
      throw new Error('API retornou resposta sem conteúdo válido');
    }
    
    const resposta = data.candidates[0].content.parts[0].text;
    console.log('📝 Texto da resposta:', resposta);
    
    // Extrair JSON da resposta (remover markdown se houver)
    let jsonText = resposta.trim();
    
    // Remover markdown code blocks
    if (jsonText.includes('```')) {
      const jsonMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      } else {
        // Tentar remover apenas os backticks
        jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      }
    }
    
    console.log('🔧 JSON extraído:', jsonText);
    
    // LIMPEZA AGRESSIVA DO JSON
    console.log('🧹 Iniciando limpeza do JSON...');
    
    try {
      // Etapa 1: Limpar quebras de linha
      let jsonLimpo = jsonText
        .replace(/\\n/g, ' ')           // Quebras literais \n
        .replace(/\r\n/g, ' ')          // Quebras Windows
        .replace(/\n/g, ' ')            // Quebras Unix
        .replace(/\r/g, ' ')            // Quebras Mac
        .replace(/\s+/g, ' ');          // Múltiplos espaços
      
      // Etapa 2: Corrigir strings mal formatadas
      // Encontrar todas as strings e escapar aspas duplas internas
      jsonLimpo = jsonLimpo.replace(/"((?:[^"\\]|\\.)*)"/g, (_match: string, content: string) => {
        // Escapar aspas duplas que não estão escapadas
        const escaped = content
          .replace(/\\"/g, '___ESCAPED_QUOTE___')  // Proteger aspas já escapadas
          .replace(/"/g, '\\"')                     // Escapar aspas não escapadas
          .replace(/___ESCAPED_QUOTE___/g, '\\"');  // Restaurar aspas protegidas
        return `"${escaped}"`;
      });
      
      // Etapa 3: Validar se JSON está completo
      const openBraces = (jsonLimpo.match(/{/g) || []).length;
      const closeBraces = (jsonLimpo.match(/}/g) || []).length;
      const openBrackets = (jsonLimpo.match(/\[/g) || []).length;
      const closeBrackets = (jsonLimpo.match(/\]/g) || []).length;
      
      console.log(`📊 Balanço: {${openBraces}/${closeBraces}} [${openBrackets}/${closeBrackets}]`);
      
      // Se JSON está incompleto, tentar corrigir
      if (openBraces > closeBraces) {
        console.warn('⚠️ JSON incompleto, tentando corrigir...');
        // Fechar objetos abertos
        for (let i = 0; i < openBraces - closeBraces; i++) {
          jsonLimpo += '}';
        }
      }
      
      if (openBrackets > closeBrackets) {
        // Fechar arrays abertos
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
          jsonLimpo += ']';
        }
      }
      
      // Etapa 4: Remover vírgulas extras antes de } ou ]
      jsonLimpo = jsonLimpo
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');
      
      // Etapa 5: Corrigir strings não terminadas
      // Se termina com aspas abertas, fechar
      if ((jsonLimpo.match(/"/g) || []).length % 2 !== 0) {
        console.warn('⚠️ String não terminada detectada, fechando...');
        jsonLimpo += '"';
      }
      
      console.log('🧹 JSON após limpeza:', jsonLimpo.substring(0, 300) + '...');
      
      // Tentar parsear
      const resultado: GeminiResponse = JSON.parse(jsonLimpo);
      console.log('✨ Resultado parseado com sucesso!');
      
      // Validar estrutura
      if (!resultado.casFormatados || !Array.isArray(resultado.casFormatados)) {
        throw new Error('Resposta da IA não contém critérios de aceite válidos');
      }
      
      // Limpar dados: remover quebras que possam ter passado
      resultado.preCondicoes = resultado.preCondicoes?.replace(/\n/g, '; ') || '';
      resultado.dadosTeste = resultado.dadosTeste?.replace(/\n/g, '; ') || '';
      resultado.casFormatados = resultado.casFormatados.map(ca => ({
        ...ca,
        title: ca.title.replace(/\n/g, ' '),
        descricao: ca.descricao.replace(/\n/g, ' ')
      }));
      
      return resultado;
      
    } catch (parseError: any) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      console.error('JSON problemático (primeiros 1000 chars):', jsonText.substring(0, 1000));
      
      // Log mais detalhado do erro
      if (parseError.message?.includes('position')) {
        const match = parseError.message.match(/position (\d+)/);
        if (match) {
          const pos = parseInt(match[1]);
          const start = Math.max(0, pos - 100);
          const end = Math.min(jsonText.length, pos + 100);
          console.error('Contexto do erro:', jsonText.substring(start, end));
          console.error('                    ' + ' '.repeat(Math.min(100, pos - start)) + '^');
        }
      }
      
      throw new Error(`Não foi possível parsear resposta da IA: ${parseError.message || parseError}`);
    }
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Tentativa ${attempt}/${maxRetries} falhou:`, error);
      
      // Se for erro de modelo sobrecarregado, esperar e tentar novamente
      if (error.message?.includes('overloaded') && attempt < maxRetries) {
        const waitTime = attempt * 2000; // 2s, 4s, 6s
        console.log(`⏳ Aguardando ${waitTime/1000}s antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // Outros erros, não tentar novamente
      throw error;
    }
  }
  
  // Se chegou aqui, todas as tentativas falharam
  throw new Error(`Todas as ${maxRetries} tentativas falharam. Último erro: ${lastError?.message || 'Desconhecido'}`);
}
