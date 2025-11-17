export interface CA {
  id: string;
  title: string;
  objetivo: string;
  prerequisitos: string[];
  passoAPasso: {
    passo: number;
    descricao: string;
    detalhes?: string[];
  }[];
  tabelas?: {
    titulo: string;
    colunas: string[];
    linhas: string[][];
  }[];
}

export const testCases: CA[] = [
  {
    id: "CA01",
    title: "Criar configuração de comunicação externa para Gerar Matrícula",
    objetivo:
      "Configurar os sistemas de comunicação (AUT e NDS) e os tratamentos de eventos com falha para a funcionalidade de geração de matrícula, permitindo que o sistema saiba como proceder em casos de erro de integração.",
    prerequisitos: [
      "Acesso ao Menu: Configurações >> Parametrização >> Comunicação Externa",
      "Permissão para criar/editar configurações de comunicação",
      "Conhecimento dos sistemas de comunicação disponíveis (AUT, NDS)",
    ],
    passoAPasso: [
      {
        passo: 1,
        descricao: "Acessar Configurações de Comunicação Externa",
        detalhes: [
          "Navegar até Menu >> Configurações",
          "Selecionar Parametrização",
          "Clicar em Comunicação Externa",
        ],
      },
      {
        passo: 2,
        descricao: "Configurar Sistemas de Comunicação",
        detalhes: [
          "Localizar a funcionalidade 'Gerar Matrícula'",
          "Para o sistema AUT: Marcar 'Não' em Validar Pendência e 'Sim' em Envio de E-mail para Falha",
          "Para o sistema NDS: Marcar 'Não' em Validar Pendência e 'Sim' em Envio de E-mail para Falha",
        ],
      },
      {
        passo: 3,
        descricao: "Configurar Tratamento de Eventos com Falha",
        detalhes: [
          "Para cada código de erro do sistema AUT (010, 012, 014, 017, 098), preencher:",
          "  - Código do Erro",
          "  - Ação (Manual/Reenvio/Efetivar Operação)",
          "  - Orientação (instrução para resolução)",
          "  - Motivo (causa raiz do erro)",
          "Para sistema NDS, configurar códigos -1 e -2",
        ],
      },
      {
        passo: 4,
        descricao: "Salvar Configurações",
        detalhes: [
          "Revisar todas as configurações preenchidas",
          "Clicar em Salvar",
          "Confirmar que a mensagem de sucesso foi exibida",
        ],
      },
    ],
    tabelas: [
      {
        titulo: "Sistemas de Comunicação",
        colunas: ["Sistema", "Validar Pendência", "Envio de E-mail para Falha"],
        linhas: [
          ["AUT", "Não", "Sim"],
          ["NDS", "Não", "Sim"],
        ],
      },
      {
        titulo: "Tratamento de Eventos - Sistema AUT",
        colunas: ["Código", "Ação", "Orientação", "Motivo"],
        linhas: [
          [
            "010",
            "Manual",
            "CORRIGIR ESTE CAMPO PARA NÃO UTILIZA MATRÍCULA ou preencher campo STC e AUTORIZADOS",
            "Contrato com cód AUT incorreto ou em branco",
          ],
          [
            "012",
            "Manual",
            "Corrigir DDD e número de celular",
            "Cadastro de DDD errado na ficha cadastral do TR",
          ],
          [
            "014",
            "Manual",
            "Verificar no Autorizados a qual empresa o terceiro pertence",
            "Matrícula ativa no AUT como colaborador OI ou CONTAX",
          ],
          [
            "017",
            "Manual",
            "Corrigir gestor ou auxiliar",
            "Gestor ou auxiliar não está ativo no FPw",
          ],
          [
            "098",
            "Reenvio",
            "Aguardar o reenvio automático",
            "Concorrência no barramento. Mais de 1 evento no mesmo horário",
          ],
        ],
      },
      {
        titulo: "Tratamento de Eventos - Sistema NDS",
        colunas: ["Código", "Ação", "Orientação", "Motivo"],
        linhas: [
          ["-1", "Efetivar Operação", "Sem ação no SRT", "NDS da VTal desligado"],
          ["-2", "Efetivar Operação", "Sem ação no SRT", "NDS da VTal desligado"],
        ],
      },
    ],
  },

  {
    id: "CA02",
    title: "Exibir opção de Gerar Matrícula para Terceiros",
    objetivo:
      "Disponibilizar a opção de 'Gerar Matrícula' na interface, permitindo que o usuário execute a ação de geração sobre múltiplos registros de Terceiros selecionados simultaneamente.",
    prerequisitos: [
      "Estar logado no sistema com permissão de geração de matrícula",
      "Ter Terceiros cadastrados e elegíveis (CA09)",
      "Estar na listagem de Terceiros",
    ],
    passoAPasso: [
      {
        passo: 1,
        descricao: "Acessar a Listagem de Terceiros",
        detalhes: [
          "Navegar até o Menu Principal",
          "Localizar e acessar a seção de Terceiros",
          "Aguardar o carregamento da listagem",
        ],
      },
      {
        passo: 2,
        descricao: "Verificar Disponibilidade da Opção",
        detalhes: [
          "Observar a barra de ferramentas ou menu de ações",
          "Confirmar que a opção 'Gerar Matrícula' está visível",
          "A opção deve estar acessível para usuários com permissão adequada",
        ],
      },
      {
        passo: 3,
        descricao: "Verificar Funcionalidade em Lote",
        detalhes: [
          "Selecionar múltiplos Terceiros (checkbox ou similar)",
          "Clicar em 'Gerar Matrícula'",
          "O sistema deve processar todos os registros selecionados",
        ],
      },
    ],
  },

  {
    id: "CA03",
    title: "Validar seleção obrigatória de Terceiros",
    objetivo:
      "Garantir que o usuário selecione pelo menos um Terceiro antes de executar a geração de matrícula, evitando execuções sem registros.",
    prerequisitos: [
      "Estar na listagem de Terceiros",
      "Ter a opção 'Gerar Matrícula' visível (CA02)",
      "Permissão para executar geração de matrícula",
    ],
    passoAPasso: [
      {
        passo: 1,
        descricao: "Acessar a Listagem de Terceiros",
        detalhes: [
          "Navegar até a seção de Terceiros no sistema",
        ],
      },
      {
        passo: 2,
        descricao: "Tentar Executar sem Seleção",
        detalhes: [
          "NÃO selecionar nenhum Terceiro",
          "Clicar no botão 'Gerar Matrícula'",
        ],
      },
      {
        passo: 3,
        descricao: "Validar Mensagem de Erro",
        detalhes: [
          "O sistema deve exibir a mensagem: 'Selecione ao menos um Terceiro.'",
          "A geração de matrícula não deve ser iniciada",
          "A operação deve ser bloqueada",
        ],
      },
    ],
  },

  {
    id: "CA04",
    title: "Exibir pop-up de confirmação com seleção de Tipo de Matrícula",
    objetivo:
      "Apresentar um pop-up de confirmação que permite ao usuário selecionar o Tipo de Matrícula desejado antes de confirmar a geração, com informações claras sobre o processo.",
    prerequisitos: [
      "Ter pelo menos um Terceiro elegível selecionado",
      "Ter Tipos de Matrícula cadastrados e ativos no sistema",
      "Estar na listagem de Terceiros",
    ],
    passoAPasso: [
      {
        passo: 1,
        descricao: "Selecionar Terceiros",
        detalhes: [
          "Na listagem de Terceiros, selecionar um ou mais registros",
          "Confirmar que os Terceiros atendem aos critérios de CA09",
        ],
      },
      {
        passo: 2,
        descricao: "Clicar em Gerar Matrícula",
        detalhes: [
          "Localizar e clicar no botão 'Gerar Matrícula'",
          "Aguardar a exibição do pop-up",
        ],
      },
      {
        passo: 3,
        descricao: "Validar Pop-up de Confirmação",
        detalhes: [
          "Confirmar que o pop-up exibe o título 'Gerar Matrícula'",
          "Verificar que a mensagem está correta: 'Confirmar a operação? A data de expiração da matrícula será atribuída para todos os empregados terceirizados selecionados, por um período de 180 dias, respeitando o vencimento do contrato.'",
        ],
      },
      {
        passo: 4,
        descricao: "Selecionar Tipo de Matrícula",
        detalhes: [
          "Localizar o campo 'Tipo de Matrícula' (obrigatório)",
          "Expandir a lista de opções",
          "Observar que todas os tipos cadastrados e ativos aparecem, EXCETO 'Não utiliza Matrícula'",
          "Observar o tooltip com a Descrição da Ajuda para cada opção",
          "Selecionar um Tipo de Matrícula",
        ],
      },
      {
        passo: 5,
        descricao: "Confirmar Operação",
        detalhes: [
          "Clicar no botão 'Confirmar'",
          "O sistema deve processar a seleção",
        ],
      },
    ],
  },

  {
    id: "CA05",
    title: "Disparar evento e exibir mensagem de início do processo",
    objetivo:
      "Ao confirmar a geração de matrícula, o sistema dispara o evento de processamento e exibe uma mensagem informando ao usuário que o processo foi iniciado e pode ser acompanhado.",
    prerequisitos: [
      "Ter completado os passos de CA04 (pop-up com seleção de Tipo de Matrícula)",
      "Ter Tipo de Matrícula selecionado",
      "Ter clicado em Confirmar no pop-up",
    ],
    passoAPasso: [
      {
        passo: 1,
        descricao: "Confirmar Seleção no Pop-up",
        detalhes: [
          "No pop-up aberto em CA04, clicar em 'Confirmar' após selecionar o Tipo de Matrícula",
        ],
      },
      {
        passo: 2,
        descricao: "Validar Disparo do Evento",
        detalhes: [
          "O sistema deve disparar o evento de salvar internamente",
          "Verificar no console/logs que o evento foi processado",
        ],
      },
      {
        passo: 3,
        descricao: "Validar Mensagem de Sucesso",
        detalhes: [
          "O sistema deve exibir a mensagem: 'O processo de geração foi iniciado. Você poderá acompanhar os detalhes no Monitor de Logs e na seção de Notificações do sistema.'",
          "A mensagem deve ser clara e visível",
        ],
      },
      {
        passo: 4,
        descricao: "Verificar Acesso aos Monitoradores",
        detalhes: [
          "Confirmar que o usuário pode clicar em 'Monitor de Logs'",
          "Confirmar que a seção de 'Notificações' está acessível",
        ],
      },
    ],
  },

  {
    id: "CA06",
    title: "Incluir notificação com status 'Processo aguardando início'",
    objetivo:
      "Quando o processo é incluído na fila, o sistema deve criar uma notificação informando ao usuário que o processo está aguardando início.",
    prerequisitos: [
      "Ter disparado o evento de geração (CA05 completo)",
      "Sistema com notificações ativas",
    ],
    passoAPasso: [
      {
        passo: 1,
        descricao: "Completar Confirmação de CA05",
        detalhes: [
          "Executar todos os passos de CA05",
          "Confirmar que a mensagem de início foi exibida",
        ],
      },
      {
        passo: 2,
        descricao: "Acessar Notificações",
        detalhes: [
          "Navegar para a seção de Notificações do sistema",
          "Pode estar no canto superior direito ou em um menu",
        ],
      },
      {
        passo: 3,
        descricao: "Validar Notificação Criada",
        detalhes: [
          "Confirmar que uma nova notificação foi criada",
          "A notificação deve exibir a mensagem: 'Gerar Matrícula. Processo aguardando início.'",
          "A notificação deve estar marcada com o status correto",
        ],
      },
      {
        passo: 4,
        descricao: "Verificar Persistência",
        detalhes: [
          "Atualizar a página",
          "Confirmar que a notificação ainda existe",
        ],
      },
    ],
  },

  {
    id: "CA07",
    title: "Atualizar notificação com status 'Processo em andamento'",
    objetivo:
      "Quando o processamento das gerações de matrícula é iniciado, o sistema deve atualizar a notificação informando que está em andamento.",
    prerequisitos: [
      "Ter a notificação de CA06 criada e aguardando",
      "Processo pronto para iniciar no backend",
    ],
    passoAPasso: [
      {
        passo: 1,
        descricao: "Completar CA06",
        detalhes: [
          "Executar todos os passos de CA06",
          "Confirmar notificação com status 'Processo aguardando início'",
        ],
      },
      {
        passo: 2,
        descricao: "Aguardar Início do Processamento",
        detalhes: [
          "O sistema backend inicia o processamento automaticamente",
          "Isso ocorre quando o serviço de fila processa o evento",
        ],
      },
      {
        passo: 3,
        descricao: "Validar Atualização da Notificação",
        detalhes: [
          "Acessar a seção de Notificações",
          "Confirmar que a mesma notificação foi atualizada",
          "A mensagem deve ser: 'Gerar Matrícula. Processo Em andamento, consulte o monitor de logs para verificar os detalhes.'",
        ],
      },
      {
        passo: 4,
        descricao: "Verificar Link para Monitor de Logs",
        detalhes: [
          "A notificação deve conter ou permitir acesso ao Monitor de Logs",
          "Clicar no link e verificar que os logs estão sendo registrados",
        ],
      },
    ],
  },

  {
    id: "CA08",
    title: "Atualizar notificação com status 'Processo Finalizado'",
    objetivo:
      "Ao concluir o processamento das gerações de matrícula, o sistema deve atualizar a notificação informando a conclusão e disponibilizando acesso aos detalhes.",
    prerequisitos: [
      "Ter processamento em andamento (CA07 completo)",
      "Processamento concluído no backend (sucesso, falha ou parcial)",
    ],
    passoAPasso: [
      {
        passo: 1,
        descricao: "Completar CA07",
        detalhes: [
          "Executar todos os passos de CA07",
          "Confirmar que o processamento está em andamento",
        ],
      },
      {
        passo: 2,
        descricao: "Aguardar Conclusão do Processamento",
        detalhes: [
          "Esperar até que o backend finalize o processamento de todos os Terceiros",
          "Isso pode levar alguns segundos a minutos",
        ],
      },
      {
        passo: 3,
        descricao: "Validar Atualização Final",
        detalhes: [
          "Acessar a seção de Notificações",
          "Confirmar que a notificação foi atualizada para o status final",
          "A mensagem deve ser: 'Gerar Matrícula. Processo Finalizado, consulte o monitor de logs para verificar os detalhes.'",
        ],
      },
      {
        passo: 4,
        descricao: "Validar Acesso aos Resultados",
        detalhes: [
          "Clicar no link do Monitor de Logs",
          "Verificar que os logs de sucesso/falha estão registrados (CA17)",
          "Confirmar que todos os Terceiros processados estão documentados",
        ],
      },
    ],
  },

  {
    id: "CA09",
    title: "Filtrar Terceiros elegíveis para geração de matrícula",
    objetivo:
      "A listagem de Terceiros para geração de matrícula deve incluir apenas Terceiros que atendem aos critérios de elegibilidade, excluindo aqueles que não possuem Tipo de Acesso 'Lógico' ou cujo cargo está associado apenas a 'Não utiliza Matrícula'.",
    prerequisitos: [
      "Ter Terceiros cadastrados no sistema",
      "Alguns Terceiros com Tipo de Acesso 'Lógico' e Cargos elegíveis",
      "Alguns Terceiros com Tipo de Acesso diferente de 'Lógico' ou inelegíveis",
    ],
    passoAPasso: [
      {
        passo: 1,
        descricao: "Acessar a Listagem de Terceiros para Geração de Matrícula",
        detalhes: [
          "Navegar até a funcionalidade de Gerar Matrícula",
          "Acessar a listagem de Terceiros",
        ],
      },
      {
        passo: 2,
        descricao: "Validar Filtro de Tipo de Acesso",
        detalhes: [
          "Verificar que APENAS Terceiros com Tipo de Acesso = 'Lógico' aparecem",
          "Confirmar que Terceiros com Tipo de Acesso = 'Físico', 'Administrativo', etc. não estão na lista",
        ],
      },
      {
        passo: 3,
        descricao: "Validar Filtro de Cargo/Tipo de Matrícula",
        detalhes: [
          "Verificar que Terceiros cujo Cargo está associado APENAS a 'Não utiliza Matrícula' não aparecem",
          "Confirmar que Terceiros com Cargos que possuem outros Tipos de Matrícula aparecem",
        ],
      },
      {
        passo: 4,
        descricao: "Comparar com Listagem Geral",
        detalhes: [
          "Navegar até a listagem geral de Terceiros",
          "Comparar e confirmar que a listagem de Geração de Matrícula é um subconjunto filtrado",
        ],
      },
    ],
  },

  {
    id: "CA10",
    title: "Executar validações por Terceiro antes de gerar matrícula",
    objetivo:
      "Para cada Terceiro selecionado, o sistema deve executar validações específicas (vinculação de Tipo de Matrícula ao Cargo e compatibilidade de UFs) e registrar logs detalhados de sucesso ou falha.",
    prerequisitos: [
      "Ter Terceiros selecionados",
      "Ter Tipo de Matrícula selecionado em CA04",
      "Estar no início do processamento",
    ],
    passoAPasso: [
      {
        passo: 1,
        descricao: "Selecionar Terceiros e Tipo de Matrícula",
        detalhes: [
          "Executar passos de CA02 a CA05",
          "Ter Terceiros selecionados e Tipo de Matrícula confirmado",
        ],
      },
      {
        passo: 2,
        descricao: "Iniciar Processamento de Validações",
        detalhes: [
          "O sistema backend inicia o loop de processamento",
          "Para cada Terceiro selecionado, executa as validações",
        ],
      },
      {
        passo: 3,
        descricao: "Validação 1: Vinculação de Tipo de Matrícula ao Cargo",
        detalhes: [
          "Sistema verifica se o Tipo de Matrícula selecionado está vinculado ao Cargo do Terceiro",
          "Se SIM: Continua para próxima validação",
          "Se NÃO: Registra log de FALHA com mensagem específica (ver detalhes em CA10)",
        ],
      },
      {
        passo: 4,
        descricao: "Validação 2: Compatibilidade de UFs (se Movimentação OS-BD)",
        detalhes: [
          "Se o Tipo de Matrícula = 'Movimentação OS-BD' e Terceiro tem múltiplos Contratos:",
          "  - Verifica se todas as estruturas/UFs são IGUAIS",
          "  - Se SIM: Continua para geração de matrícula",
          "  - Se NÃO: Registra log de FALHA com mensagem específica",
          "Para outros Tipos de Matrícula: Pula esta validação",
        ],
      },
      {
        passo: 5,
        descricao: "Sucesso: Gerar Matrícula",
        detalhes: [
          "Se todas as validações passam, o sistema dispara a geração de matrícula",
          "Atualiza o Terceiro com nova matrícula e data de expiração (CA13)",
          "Envia comunicação externa (CA14-CA17)",
        ],
      },
      {
        passo: 6,
        descricao: "Falha: Registrar Log de Erro",
        detalhes: [
          "Se alguma validação falha, registra log com:",
          "  - Data e Hora (DD/MM/YYYY HH:MM:SS)",
          "  - Interface: SRT",
          "  - Ação: Gerar Matrícula",
          "  - CPF ou Identidade Estrangeira",
          "  - Resposta com motivo específico",
          "  - Responsável (usuário que executou)",
        ],
      },
    ],
  },

  {
    id: "CA11",
    title: "Validar seleção obrigatória em geração em massa",
    objetivo:
      "Garantir que a geração em lote de matrícula valide a necessidade de seleção de pelo menos um Terceiro, bloqueando tentativas sem seleção.",
    prerequisitos: [
      "Estar na listagem de Terceiros",
      "Ter acesso ao botão 'Gerar Matrícula'",
    ],
    passoAPasso: [
      {
        passo: 1,
        descricao: "Acessar Listagem de Terceiros",
        detalhes: [
          "Navegar até a seção de Terceiros",
        ],
      },
      {
        passo: 2,
        descricao: "Tentar Executar sem Seleção",
        detalhes: [
          "NÃO selecionar nenhum Terceiro (ou desselecionar todos)",
          "Clicar no botão 'Gerar Matrícula'",
        ],
      },
      {
        passo: 3,
        descricao: "Validar Mensagem de Erro",
        detalhes: [
          "O sistema deve exibir a mensagem: 'Selecione ao menos um Terceiro.'",
          "O pop-up de CA04 NÃO deve ser exibido",
          "A operação deve ser totalmente bloqueada",
        ],
      },
    ],
  },

  {
    id: "CA12",
    title: "Validar geração individual de matrícula",
    objetivo:
      "Quando a geração de matrícula é feita individualmente (para um Terceiro específico), o sistema valida o preenchimento do Tipo de Matrícula, sua vinculação ao Cargo e compatibilidade de UFs, exibindo mensagens de erro apropriadas.",
    prerequisitos: [
      "Estar na tela de detalhes de um Terceiro (edição/visualização)",
      "Ter a opção de gerar matrícula individual disponível",
    ],
    passoAPasso: [
      {
        passo: 1,
        descricao: "Acessar Tela de Terceiro Individual",
        detalhes: [
          "Navegar até a listagem de Terceiros",
          "Clicar em um Terceiro para abrir sua tela de detalhe/edição",
        ],
      },
      {
        passo: 2,
        descricao: "Validação 1: Campo Tipo de Matrícula Obrigatório",
        detalhes: [
          "Tentar clicar em 'Gerar Matrícula' SEM preencher o campo 'Tipo de Matrícula'",
          "O sistema deve exibir a mensagem: '[Nome do Campo] deve ser informado.'",
          "A geração não deve ser iniciada",
        ],
      },
      {
        passo: 3,
        descricao: "Validação 2: Vinculação do Cargo ao Tipo de Matrícula",
        detalhes: [
          "Preencher o campo 'Tipo de Matrícula'",
          "Selecionar um Tipo de Matrícula que NÃO está vinculado ao Cargo do Terceiro",
          "Clicar em 'Gerar Matrícula'",
          "O sistema deve exibir: 'O Tipo de Matrícula selecionado não é permitido para o Cargo do Terceiro.'",
        ],
      },
      {
        passo: 4,
        descricao: "Validação 3: Compatibilidade de UFs (Movimentação OS-BD)",
        detalhes: [
          "Se o Terceiro tem múltiplos Contratos com UFs diferentes",
          "Selecionar o Tipo de Matrícula = 'Movimentação OS-BD'",
          "Clicar em 'Gerar Matrícula'",
          "O sistema deve exibir: 'Para o Tipo de Matricula \"Movimentação OS-BD\" não é permitido que o Terceiro esteja associado à UFs diferentes'",
        ],
      },
      {
        passo: 5,
        descricao: "Sucesso: Gerar com Validações Passando",
        detalhes: [
          "Preencher Tipo de Matrícula vinculado ao Cargo",
          "Se Movimentação OS-BD, garantir que as UFs são iguais",
          "Clicar em 'Gerar Matrícula'",
          "O processo deve ser iniciado com sucesso",
        ],
      },
    ],
  },

  {
    id: "CA13",
    title: "Calcular data de expiração respeitando vigência de contratos",
    objetivo:
      "Quando gerando matrícula, o sistema deve calcular a data de expiração como a data atual + 180 dias, mas limitada à maior data de vigência dos contratos do Terceiro.",
    prerequisitos: [
      "Ter Terceiro com contratos cadastrados",
      "Contratos com datas de término ou prorrogação preenchidas",
    ],
    passoAPasso: [
      {
        passo: 1,
        descricao: "Verificar Contratos do Terceiro",
        detalhes: [
          "Acessar os detalhes do Terceiro",
          "Localizar a listagem de Contratos associados",
          "Anotar as datas de término e prorrogação de cada contrato",
        ],
      },
      {
        passo: 2,
        descricao: "Calcular Vigência Esperada",
        detalhes: [
          "Para cada contrato, considerar a MAIOR entre 'Data Término' e 'Data Prorrogação'",
          "Identificar qual é a MAIOR data entre todos os contratos (data de vigência máxima)",
        ],
      },
      {
        passo: 3,
        descricao: "Calcular Data de Expiração",
        detalhes: [
          "Calcular: Data Atual + 180 dias",
          "Comparar com a data de vigência máxima dos contratos",
          "Se (Data Atual + 180) > Data Vigência Máxima: Usar Data Vigência Máxima",
          "Se (Data Atual + 180) <= Data Vigência Máxima: Usar Data Atual + 180 dias",
        ],
      },
      {
        passo: 4,
        descricao: "Executar Geração e Validar",
        detalhes: [
          "Executar a geração de matrícula para o Terceiro",
          "Acessar os logs ou o registro do Terceiro",
          "Confirmar que a data de expiração foi calculada corretamente",
        ],
      },
    ],
  },

  {
    id: "CA14",
    title: "Enviar comunicação para o sistema AUT quando configurado",
    objetivo:
      "O sistema deve enviar comunicação externa para o AUT quando este estiver parametrizado para a funcionalidade de Gerar Matrícula. Se o AUT não estiver configurado, a operação é bloqueada e notificada.",
    prerequisitos: [
      "CA01 completado (Comunicação Externa configurada)",
      "Sistema AUT está ativo e parametrizado",
      "Processo de geração no estado de envio de comunicação",
    ],
    passoAPasso: [
      {
        passo: 1,
        descricao: "Verificar Configuração do AUT em CA01",
        detalhes: [
          "Confirmar que o AUT está incluído em 'Sistemas para Comunicação' para 'Gerar Matrícula'",
          "Verificar que está com 'Envio de E-mail para Falha' = Sim",
        ],
      },
      {
        passo: 2,
        descricao: "Executar Geração de Matrícula",
        detalhes: [
          "Selecionar Terceiro(s) e executar geração conforme CA02-CA05",
        ],
      },
      {
        passo: 3,
        descricao: "Validar Envio para AUT",
        detalhes: [
          "Acessar Monitor de Logs",
          "Confirmar que a comunicação foi enviada para o AUT",
          "Verificar o XML enviado contém as informações corretas do Terceiro",
        ],
      },
      {
        passo: 4,
        descricao: "Validar Cenário sem AUT Configurado",
        detalhes: [
          "Se o AUT NÃO estiver parametrizado:",
          "Tentar gerar matrícula",
          "O sistema deve interromper e exibir: 'Geração de Matrícula. Processo Interrompido, não há sistema parametrizado para geração da matricula.'",
          "Nenhuma comunicação deve ser enviada",
        ],
      },
    ],
  },

  {
    id: "CA15",
    title: "Bloquear geração se houver pendência de resposta do barramento",
    objetivo:
      "Antes de gerar matrícula, o sistema valida se o Terceiro possui pendência de resposta do barramento. Se houver, a geração é bloqueada e um log de falha é registrado.",
    prerequisitos: [
      "Serviço para verificar pendência do barramento ativo (US 96078)",
      "Ter Terceiro com pendência de resposta",
    ],
    passoAPasso: [
      {
        passo: 1,
        descricao: "Selecionar Terceiro com Pendência",
        detalhes: [
          "Na listagem de Terceiros, localizar um que possui 'Pendência de Resposta do Barramento'",
          "Selecionar este Terceiro",
        ],
      },
      {
        passo: 2,
        descricao: "Tentar Gerar Matrícula",
        detalhes: [
          "Clicar em 'Gerar Matrícula' para o Terceiro com pendência",
          "Selecionar o Tipo de Matrícula",
          "Clicar em 'Confirmar'",
        ],
      },
      {
        passo: 3,
        descricao: "Validar Bloqueio da Geração",
        detalhes: [
          "O sistema deve verificar se existe pendência",
          "Deve BLOQUEAR a geração",
          "Deve registrar log de FALHA",
        ],
      },
      {
        passo: 4,
        descricao: "Validar Mensagem de Erro",
        detalhes: [
          "Log deve conter:",
          "  - Data e Hora (DD/MM/YYYY HH:MM:SS)",
          "  - Interface: SRT",
          "  - Ação: Gerar Matrícula",
          "  - Status: Falha",
          "  - Resposta: 'Falha. CPF [CPF]/Identidade [IDENTIDADE]. Existe outra solicitação em andamento para este Terceiro. Neste caso, aguarde o processamento.'",
          "  - Responsável: Usuário que executou",
        ],
      },
    ],
  },

  {
    id: "CA16",
    title: "Selecionar primeiro contrato aprovado e vigente para AUT",
    objetivo:
      "Para o sistema AUT, o sistema deve selecionar APENAS o primeiro contrato aprovado (com menor data de aprovação) que ainda está vigente. Se nenhum estiver vigente, retorna ao primeiro aprovado.",
    prerequisitos: [
      "Terceiro com múltiplos contratos aprovados",
      "Alguns contratos vigentes, outros expirados",
    ],
    passoAPasso: [
      {
        passo: 1,
        descricao: "Verificar Contratos do Terceiro",
        detalhes: [
          "Acessar detalhes de Terceiro com múltiplos contratos",
          "Anotar o Status de Aprovação de cada contrato",
          "Anotar a Data e Hora de Aprovação",
          "Anotar a Data de Término e Data de Prorrogação (vigência)",
        ],
      },
      {
        passo: 2,
        descricao: "Identificar Primeiro Contrato Aprovado",
        detalhes: [
          "Filtrar APENAS contratos com Status Aprovação = 'Aprovado'",
          "Selecionar aquele com MENOR data e hora de aprovação",
          "Anotar este contrato",
        ],
      },
      {
        passo: 3,
        descricao: "Verificar Vigência do Primeiro Contrato",
        detalhes: [
          "Calcular vigência: MAIOR entre (Data Término, Data Prorrogação)",
          "Se vigência > data atual: Contrato está VIGENTE",
          "Se vigência <= data atual: Contrato está EXPIRADO",
        ],
      },
      {
        passo: 4,
        descricao: "Validar Seleção Correta",
        detalhes: [
          "Executar geração de matrícula",
          "Verificar no XML enviado para AUT qual contrato foi usado",
          "Se primeiro aprovado vigente: Deve ser este",
          "Se nenhum aprovado vigente: Deve ser o primeiro aprovado (mesmo expirado)",
        ],
      },
    ],
  },

  {
    id: "CA17",
    title: "Registrar log de sucesso após envio de comunicação",
    objetivo:
      "Após enviar a comunicação externa com sucesso, o sistema registra um log detalhado com informações do Terceiro, sistema de destino e responsável pela ação.",
    prerequisitos: [
      "Geração de matrícula ter sido bem-sucedida",
      "Comunicação externa enviada para AUT/NDS",
    ],
    passoAPasso: [
      {
        passo: 1,
        descricao: "Executar Geração de Matrícula com Sucesso",
        detalhes: [
          "Executar passos de CA02-CA05 para Terceiro(s) elegível(is)",
          "Confirmar processamento bem-sucedido até comunicação externa",
        ],
      },
      {
        passo: 2,
        descricao: "Verificar Envio para Sistema Externo",
        detalhes: [
          "Confirmar que comunicação foi enviada para AUT",
          "Verificar que não houve erros no envio",
        ],
      },
      {
        passo: 3,
        descricao: "Acessar Monitor de Logs",
        detalhes: [
          "Navegar até Monitor de Logs",
          "Filtrar por Interface = 'SRT', Ação = 'Gerar Matrícula'",
          "Localizar o log mais recente de SUCESSO",
        ],
      },
      {
        passo: 4,
        descricao: "Validar Conteúdo do Log de Sucesso",
        detalhes: [
          "Confirmar presença de:",
          "  - Data Hora: DD/MM/YYYY HH:MM:SS",
          "  - Interface: SRT",
          "  - Ação: Gerar Matrícula",
          "  - Status: Sucesso",
          "  - CPF ou Identidade Estrangeira (conforme CA10)",
          "  - Resposta: 'Sucesso. CPF/Identidade [VALOR]. - Disponibilizado para o Sistema: AUT'",
          "  - Responsável: Nome do usuário",
        ],
      },
    ],
  },

  {
    id: "CA18",
    title: "Alterar título da tela para 'Geração de Matrícula Autorizados/STC'",
    objetivo:
      "O título da tela de geração de matrícula deve ser alterado para 'Geração de Matrícula Autorizados/STC' para refletir melhor a funcionalidade.",
    prerequisitos: [
      "Estar na tela de geração de matrícula",
      "Ter acesso para editar a interface",
    ],
    passoAPasso: [
      {
        passo: 1,
        descricao: "Acessar Tela de Geração de Matrícula",
        detalhes: [
          "Navegar até a funcionalidade de Gerar Matrícula",
        ],
      },
      {
        passo: 2,
        descricao: "Verificar Título da Tela",
        detalhes: [
          "Observar o título exibido no topo da tela",
          "Confirmar que agora é 'Geração de Matrícula Autorizados/STC'",
          "O título anterior deve ter sido 'Geração de Matrícula' ou similar",
        ],
      },
      {
        passo: 3,
        descricao: "Validar em Múltiplos Contextos",
        detalhes: [
          "Verificar se o título aparece corretamente em:",
          "  - Título da página/aba",
          "  - Breadcrumb de navegação",
          "  - Menu lateral",
          "  - Notificações relacionadas",
        ],
      },
    ],
  },

  {
    id: "CA19",
    title: "Incluir testes para listagem, geração e testes exploratórios",
    objetivo:
      "O plano de testes deve cobrir não apenas a ação de geração de matrícula e comunicação externa, mas também a listagem para seleção de Terceiros e testes exploratórios adicionais.",
    prerequisitos: [
      "Todos os CAs anteriores implementados",
      "Ambiente de testes preparado",
    ],
    passoAPasso: [
      {
        passo: 1,
        descricao: "Testes de Listagem de Terceiros",
        detalhes: [
          "Validar filtros (CA09)",
          "Verificar ordenação e paginação",
          "Testar busca e seleção múltipla",
          "Validar mensagens de vazio (quando nenhum Terceiro atende critérios)",
        ],
      },
      {
        passo: 2,
        descricao: "Testes de Geração de Matrícula",
        detalhes: [
          "Validar todos os CAs de CA02 até CA17",
          "Testar cenários de sucesso e falha",
          "Testar geração em massa e individual",
          "Validar logs e notificações",
        ],
      },
      {
        passo: 3,
        descricao: "Testes Exploratórios",
        detalhes: [
          "Testar com dados limite (nomes longos, valores extremos)",
          "Testar validações de data (datas passadas, futuras)",
          "Testar com Terceiros em situações especiais (estrangeiro sem CPF)",
          "Testar concorrência (múltiplos usuários ao mesmo tempo)",
          "Testar com diferentes tipos de navegador",
          "Testar responsividade em dispositivos móveis",
        ],
      },
      {
        passo: 4,
        descricao: "Testes de Integração",
        detalhes: [
          "Validar comunicação com AUT e NDS",
          "Testar tratamento de erros de integração (CA01)",
          "Validar reenvios automáticos",
          "Testar com diferentes configurações de Comunicação Externa",
        ],
      },
    ],
  },
];
