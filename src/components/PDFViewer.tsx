import { useState } from 'react';
import { generatePDF } from '../utils/pdfGenerator';
import './PDFViewer.css';

interface CAData {
  id: string;
  title: string;
  descricao: string;
}

const PDFViewer = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [caInput, setCAInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [parsedCAs, setParsedCAs] = useState<CAData[]>([]);

  const handleVisualize = () => {
    setError(null);

    if (!titulo.trim()) {
      setError('Por favor, preencha o título do plano');
      return;
    }

    if (!caInput.trim()) {
      setError('Por favor, insira seus critérios de aceite');
      return;
    }

    // Parse dos CAs
    const lines = caInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const cas: CAData[] = [];
    let currentCA: CAData | null = null;

    lines.forEach((line) => {
      const caMatch = line.match(/^CA(\d+):?\s*(.*)/i);
      if (caMatch) {
        if (currentCA) {
          cas.push(currentCA);
        }
        currentCA = {
          id: `CA${caMatch[1].padStart(2, '0')}`,
          title: caMatch[2] || `Critério ${caMatch[1]}`,
          descricao: caMatch[2] || `Critério de aceite ${caMatch[1]}`
        };
      } else if (currentCA && line.length > 0) {
        currentCA.descricao = (currentCA.descricao || '') + ' ' + line;
      }
    });

    if (currentCA) {
      cas.push(currentCA);
    }

    if (cas.length === 0) {
      setError('Nenhum critério encontrado. Use o formato: CA01: Descrição\nCA02: Descrição');
      return;
    }

    setParsedCAs(cas);
    setShowPreview(true);
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      await generatePDF();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setShowPreview(false);
    setTitulo('');
    setCAInput('');
    setParsedCAs([]);
    setError(null);
  };

  if (!showPreview) {
    return (
      <div className="pdf-viewer input-view">
        <div className="input-header">
          <h1>📝 Gerador de Plano de Testes</h1>
          <p>Insira seus critérios de aceite e gere um PDF profissional</p>
        </div>

        <div className="input-form">
          <div className="form-group">
            <label>
              <span className="label-text">Título do Plano *</span>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Plano de Testes - Gerar Matrícula"
                className="input-field"
              />
            </label>
          </div>

          <div className="form-group">
            <label>
              <span className="label-text">Critérios de Aceite (CAs) *</span>
              <textarea
                value={caInput}
                onChange={(e) => setCAInput(e.target.value)}
                placeholder="Cole aqui seus critérios de aceite.

Formato:
CA01: Primeiro critério de aceite
CA02: Segundo critério de aceite
CA03: Terceiro critério de aceite

Um por linha, começando com CA##:"
                rows={12}
                className="textarea-field"
              />
            </label>
            <p className="help-text">
              💡 Dica: Use o formato CA01:, CA02:, CA03:, etc. Um critério por linha
            </p>
          </div>

          {error && <div className="error-message">❌ {error}</div>}

          <div className="button-group">
            <button
              onClick={handleVisualize}
              className="btn-primary"
              disabled={!caInput.trim() || !titulo.trim()}
            >
              👁️ Visualizar Plano
            </button>
            <button
              onClick={() => {
                setTitulo('');
                setCAInput('');
                setError(null);
              }}
              className="btn-secondary"
            >
              🗑️ Limpar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      <div className="toolbar">
        <h1>📋 {titulo}</h1>
        <div className="toolbar-buttons">
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="btn-generate"
          >
            {isGenerating ? '⏳ Gerando PDF...' : '📥 Gerar PDF e Baixar'}
          </button>
          <button
            onClick={handleReset}
            className="btn-back"
          >
            ← Voltar
          </button>
        </div>
      </div>
      <div id="pdf-content" className="content">
        <PreviewPlano titulo={titulo} cas={parsedCAs} />
      </div>
    </div>
  );
};

interface PreviewPlanoProps {
  titulo: string;
  cas: CAData[];
}

const PreviewPlano = ({ titulo, cas }: PreviewPlanoProps) => {
  return (
    <div className="plano-container">
      {/* CAPA */}
      <div className="cover-page page-break">
        <div className="cover-content">
          <h1 className="cover-title">Plano de Testes</h1>
          <h2 className="cover-subtitle">{titulo}</h2>
          <div className="cover-divider"></div>

          <div className="cover-info">
            <p>
              <strong>Sistema:</strong> SRT - Sistema de Registro de Terceiros
            </p>
            <p>
              <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>
            <p>
              <strong>Versão:</strong> 1.0
            </p>
          </div>

          <div className="cover-stats">
            <p className="stat-item">
              <span className="stat-label">Total de Critérios:</span>
              <span className="stat-value">{cas.length}</span>
            </p>
          </div>
        </div>
      </div>

      {/* SUMÁRIO */}
      <div className="summary-page page-break">
        <h2>Sumário de Critérios de Aceite</h2>
        <div className="summary-list">
          {cas.map((ca) => (
            <div key={ca.id} className="summary-item">
              <span className="summary-id">{ca.id}</span>
              <span className="summary-title">{ca.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CRITÉRIOS */}
      <div className="test-cases">
        <h1 className="main-title">Critérios de Aceite</h1>

        {cas.map((ca) => (
          <div key={ca.id} className="ca-section page-break">
            <div className="ca-header">
              <h2 className="ca-id">{ca.id}</h2>
              <h1 className="ca-title">{ca.title}</h1>
            </div>

            <div className="ca-objective">
              <h3>📋 OBJETIVO</h3>
              <p>Validar o seguinte critério: {ca.descricao}</p>
            </div>

            <div className="ca-prerequisites">
              <h3>✅ PRÉ-REQUISITOS</h3>
              <ul>
                <li>Estar logado no sistema com permissões adequadas</li>
                <li>Ter acesso ao ambiente de testes</li>
                <li>Dados de teste preparados e validados</li>
                <li>Navegador compatível atualizado</li>
              </ul>
            </div>

            <div className="ca-steps">
              <h3>📝 PASSO A PASSO</h3>
              <div className="steps-container">
                <div className="step">
                  <div className="step-header">
                    <span className="step-number">Passo 1</span>
                    <h4>Preparar Ambiente de Teste</h4>
                  </div>
                  <ul className="step-details">
                    <li>Validar que todos os pré-requisitos foram atendidos</li>
                    <li>Confirmar acesso ao sistema</li>
                    <li>Preparar dados necessários para o teste</li>
                  </ul>
                </div>

                <div className="step">
                  <div className="step-header">
                    <span className="step-number">Passo 2</span>
                    <h4>Executar o Cenário de Teste</h4>
                  </div>
                  <ul className="step-details">
                    <li>Executar as ações descritas no critério de aceite</li>
                    <li>Registrar cada passo realizado</li>
                    <li>Observar o comportamento do sistema</li>
                  </ul>
                </div>

                <div className="step">
                  <div className="step-header">
                    <span className="step-number">Passo 3</span>
                    <h4>Validar Resultado</h4>
                  </div>
                  <ul className="step-details">
                    <li>Comparar resultado obtido com o esperado</li>
                    <li>Capturar evidências (screenshots, logs)</li>
                    <li>Registrar conclusão do teste</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* OBSERVAÇÕES */}
      <div className="final-notes page-break">
        <h2>Observações Finais</h2>
        <div className="notes-content">
          <h3>Pontos Importantes:</h3>
          <ul>
            <li>Todos os critérios devem ser testados conforme documentado</li>
            <li>Registre evidências para cada teste executado</li>
            <li>Comunique problemas ao time de desenvolvimento imediatamente</li>
            <li>Realize testes exploratórios para validar cenários não previstos</li>
            <li>Documente qualquer comportamento inesperado</li>
          </ul>

          <h3>Responsabilidades:</h3>
          <ul>
            <li>Analista de Testes: Executar testes e documentar resultados</li>
            <li>Desenvolvedor: Implementar correções conforme necessário</li>
            <li>QA Lead: Revisar e aprovar resultados dos testes</li>
            <li>Product Owner: Validar conformidade com requisitos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
