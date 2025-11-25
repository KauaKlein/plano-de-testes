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
# CONTEXTO DO SISTEMA SRT

## Sistema SRT (Sistema de Registro de Terceiros)
Sistema que gerencia terceiros (prestadores de serviço) da Oi, controlando:
- Terceiros (nacionais com CPF ou estrangeiros sem CPF)
- Contratos vinculando terceiros a contratantes
- Fornecedores (empresas que prestam serviço)
- Contratantes (empresas do grupo Oi)
- Estruturas departamentais e Filiais (por UF)
- Situações funcionais (Ativo, Inativo, etc.)

## Integrações e Barramento
- **AUT**: Sistema de autenticação/matrícula
- **NDS**: Sistema de dados
- **CURE**: Sistema complementar
- Comunicação assíncrona via barramento
- Retornos podem ser: OK, ERRO (com códigos parametrizados)
- Ações de erro: Reenviar Evento, Efetivar Operação, Manual, Sem Ação

## Regras de Negócio Detalhadas

### Terceiros
- Podem ser nacionais (com CPF) ou estrangeiros (sem CPF)
- Sempre devem ter uma situação funcional válida
- Relacionamento obrigatório com: prédio, cargo, prestação de serviço, tipo de matrícula
- **TODO TERCEIRO DEVE TER AO MENOS UM CONTRATO**
- **TODOS OS CONTRATOS DE UM TERCEIRO SÃO DO MESMO FORNECEDOR** (mas podem ser de contratantes diferentes)
- Para instanciar objetos, sempre usar Factory pattern para garantir polimorfismo correto
- Validações: CPF/CNPJ válidos para nacionais, datas específicas (datetime: YYYYMMDDHHMMSS, date: YYYY-MM-DD)
- Herança: cls_terceiroBase → cls_terceiroEstrangeiro

### Contratos
- Vinculam terceiros a contratantes
- **TODO CONTRATO DEVE TER UM CONTRATANTE**
- **TODO CONTRATO DEVE TER UM FORNECEDOR**
- Possuem aprovações e tipos de acesso
- Relacionados a filiais e estruturas organizacionais
- A estrutura do terceiro É a estrutura do contrato

### Situações Funcionais
- Controlam o estado atual do terceiro no sistema
- Devem ter data/hora de referência, início e fim
- Tipos: Atividade Normal, Inativo, etc.
- Datas em formatos específicos (datetime: YYYYMMDDHHMMSS, date: YYYY-MM-DD)

### Fornecedores
- Representam as empresas para as quais os terceiros trabalham
- Prestam serviços ao contratante

### Contratantes
- Representam empresas do grupo Oi que contratam os serviços

### Filial
- Representação de uma unidade de negócio por UF (Estado)

### Estruturas Departamentais
- Representação de hierarquia departamental
- Associadas a filiais para determinar a estrutura por UF
- **Entidades associadas a estruturas são visíveis APENAS para usuários do mesmo nível departamental ou inferior**

## Visibilidade no Sistema
**Conceito**: Determina quais registros o usuário logado pode visualizar

### Tipos de Usuários:
1. **Usuários Contratantes**:
   - Associados a estruturas e filiais (filial pode ser opcional)
   - Visibilidade: todas entidades da mesma estrutura E filial
   - Se não houver filial: considerar apenas estrutura
   - Se não houver estrutura nem filial: visualiza TUDO

2. **Usuários Fornecedores**:
   - Estrutura determinada pelos contratos associados ao fornecedor
   - Deve estar associado ao contrato (pode haver múltiplos usuários por fornecedor)
   - Cada usuário pode ter acesso a contratos diferentes de forma EXCLUSIVA
   - Visibilidade: apenas terceiros/entidades dos contratos na sua hierarquia

### Regra de Hierarquia:
- Aplica-se a TODAS as entidades associadas aos contratos
- Exemplo: usuário só acessa terceiros dos contratos na sua hierarquia
- **Para todos os efeitos: a estrutura do terceiro É a estrutura do contrato**

## Tipos de Teste Comuns
- **Integração**: Teste de comunicação entre sistemas
- **Barramento**: Retorno de eventos assíncronos
- **CRUD**: Criar, Ler, Atualizar, Deletar entidades
- **Validação**: Regras de negócio e validações
- **Unidade**: Testes isolados de componentes
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
     * Título curto e descritivo
     * Descrição COMPLETA e DETALHADA do comportamento esperado
     * Inclua validações, mensagens, regras de negócio
     * Seja específico sobre o que deve acontecer

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
      "descricao": "Descrição COMPLETA e DETALHADA do critério de aceite. Inclua o comportamento esperado, validações realizadas, mensagens exibidas, regras de negócio aplicadas e qualquer outra informação relevante. Seja específico sobre o que o sistema deve fazer, como deve validar e o que deve retornar. Use vírgulas e pontos para organizar as ideias em uma única linha contínua."
    },
    {
      "id": "CA02",
      "title": "Outro título objetivo",
      "descricao": "Outra descrição completa e detalhada seguindo o mesmo padrão."
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

**Descrição dos CAs** deve ser um PASSO A PASSO PRÁTICO para execução do teste:
- Escreva instruções OBJETIVAS e EXECUTÁVEIS
- Use linguagem imperativa: 'Abra', 'Clique', 'Preencha', 'Verifique', 'Valide'
- Organize em passos numerados quando necessário
- Inclua ONDE fazer a ação (tela, menu, botão específico)
- Especifique O QUE verificar e qual RESULTADO ESPERADO
- Mencione valores específicos a serem usados
- Indique validações que devem ser conferidas

**Exemplos de boas descrições estilo PASSO A PASSO:**
- "1. Acesse a tela de Terceiros; 2. Não selecione nenhum terceiro da lista; 3. Clique no botão 'Gerar Matrícula'; 4. Valide que o sistema exibe a mensagem 'Selecione ao menos um Terceiro' e não permite prosseguir."
- "1. Acesse Monitor de Logs; 2. Filtre por 'Gerar Matrícula'; 3. Verifique que existe um log com Status 'Sucesso', CPF com máscara e texto 'Disponibilizado para o Sistema: AUT'; 4. Acesse a aba de Notificações; 5. Valide que a notificação foi atualizada para 'Processo Finalizado'."

IMPORTANTE: 
- Seja EXTREMAMENTE detalhado nas descrições
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
