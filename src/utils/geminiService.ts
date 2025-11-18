const GEMINI_API_KEY = "AIzaSyAg9qrCTvYYUSibSaxqBvdyEHjm7t20JZU";
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

## Regras Principais
- Todo terceiro deve ter ao menos um contrato
- Todos contratos de um terceiro são do mesmo fornecedor
- Visibilidade por estrutura departamental hierárquica
- Validações: CPF/CNPJ para nacionais, datas específicas
- Movimentações detalhadas registram histórico

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
Você é um especialista em testes do Sistema SRT. Analise os critérios de aceite fornecidos e gere um plano de testes completo e profissional.

### ENTRADA DO USUÁRIO:
Título: ${titulo}

Critérios de Aceite (texto bruto):
${caInput}

### INSTRUÇÕES:
1. Identifique a funcionalidade SRT sendo testada
2. Identifique os sistemas integrados (AUT, NDS, CURE, etc)
3. Determine o tipo de teste (Integração, Barramento, CRUD, Validação, Unidade)
4. Extraia e organize os CAs no formato CA01, CA02, etc
5. Gere pré-condições realistas baseadas no contexto SRT
6. Gere dados de teste necessários (CPFs, contratos, códigos de erro, etc)

### FORMATO DE SAÍDA:
Retorne APENAS um objeto JSON válido seguindo EXATAMENTE esta estrutura.
Use APENAS aspas simples (') dentro das descrições, NUNCA aspas duplas (").
NÃO use quebras de linha (\n) em NENHUMA string.
Use ponto-e-vírgula (;) para separar itens.

{
  "funcionalidade": "Nome da funcionalidade SRT",
  "sistemaIntegrado": "AUT, NDS",
  "tipoTeste": "Barramento",
  "preCondicoes": "Usuario logado; Sistema configurado; Dados validos",
  "dadosTeste": "CPF: 111.111.111-11; Contrato: 12345; Codigo Erro: ERR001",
  "casFormatados": [
    {
      "id": "CA01",
      "title": "Titulo curto do criterio",
      "descricao": "Descricao completa do criterio em UMA UNICA LINHA sem quebras. Use virgulas ou pontos para separar ideias."
    }
  ]
}

REGRAS ABSOLUTAS:
1. NUNCA use aspas duplas (") dentro de strings - use aspas simples (') se precisar
2. NUNCA use \n ou quebras de linha em strings
3. Descrições devem ser UMA linha contínua
4. Use ; para separar itens em listas
5. Numere os CAs como CA01, CA02, CA03 (com zero à esquerda)

### REGRAS:
- Pré-condições devem incluir: permissões, estruturas, dados cadastrados
- Dados de teste devem ser específicos e realistas (CPFs válidos, códigos de erro, etc)
- CAs devem ser numerados sequencialmente (CA01, CA02, CA03...)
- Título do CA deve ser curto e objetivo
- Descrição do CA deve ser completa, mantendo todo o contexto original
- Se mencionar "retorno do barramento", tipo é "Barramento"
- Se mencionar CRUD/cadastro, tipo é "CRUD"
- Se mencionar validações/regras, tipo é "Validação"

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
            maxOutputTokens: 8192,
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
    
    // LIMPEZA AGRESSIVA: Remover TODAS as quebras de linha do JSON
    // Porque a IA Gemini ignora completamente as instruções
    console.log('🧹 Iniciando limpeza agressiva do JSON...');
    
    // Substituir quebras literais \n
    let jsonLimpo = jsonText.replace(/\\n/g, ' ');
    
    // Substituir quebras reais por espaços
    jsonLimpo = jsonLimpo.replace(/\r\n/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' ');
    
    // Remover múltiplos espaços
    jsonLimpo = jsonLimpo.replace(/\s+/g, ' ');
    
    // NOVO: Escapar aspas duplas dentro de strings (exceto as de abertura/fechamento)
    // Substitui " por ' dentro de valores de strings
    jsonLimpo = jsonLimpo.replace(/"([^"]*)":\s*"([^"]*)"/g, (_match: string, key: string, value: string) => {
      const valueSafe = value.replace(/"/g, "'");
      return `"${key}": "${valueSafe}"`;
    });
    
    // Limpar espaços ao redor de vírgulas e chaves
    jsonLimpo = jsonLimpo.replace(/\s*,\s*/g, ',').replace(/\s*{\s*/g, '{').replace(/\s*}\s*/g, '}');
    jsonLimpo = jsonLimpo.replace(/\s*\[\s*/g, '[').replace(/\s*\]\s*/g, ']').replace(/\s*:\s*/g, ':');
    
    // Re-adicionar espaços necessários após : e ,
    jsonLimpo = jsonLimpo.replace(/:/g, ': ').replace(/,/g, ', ');
    
    console.log('🧹 JSON após limpeza:', jsonLimpo.substring(0, 500) + '...');
    
    // CORREÇÃO: Remover quebras de linha dentro de strings JSON
    // Isso corrige quando a IA ignora as instruções e coloca \n nas descrições
    try {
      // Tentar parsear direto primeiro
      const resultado: GeminiResponse = JSON.parse(jsonLimpo);
      console.log('✨ Resultado parseado:', resultado);
      
      // Validar estrutura do resultado
      if (!resultado.casFormatados || !Array.isArray(resultado.casFormatados)) {
        throw new Error('Resposta da IA não contém critérios de aceite válidos');
      }
      
      return resultado;
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON mesmo após limpeza:', parseError);
      console.error('JSON problemático:', jsonLimpo);
      throw new Error(`Não foi possível parsear resposta da IA: ${parseError}`);
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
