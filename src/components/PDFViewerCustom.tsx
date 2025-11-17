import { useState } from 'react';
import { generatePDF } from '../utils/pdfGenerator';
import './PDFViewer.css';

interface CAInput {
  objetivo: string;
  descricao: string;
  prerequisitos: string[];
  passoAPasso: {
    passo: number;
    descricao: string;
    detalhes: string[];
  }[];
}

const PDFViewerCustom = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [caInput, setCAInput] = useState('');
  const [parsedCAs, setParsedCAs] = useState<CAInput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');

  const parseUserInput = (input: string) => {
    try {
      setError(null);
      if (!input.trim()) {
        setError('Por favor, insira seus critérios de aceite');
        return;
      }

      // Parse simples: quebra por linhas com CA##
      const cas = input.split(/(?=CA\d+:)/i).filter(ca => ca.trim());
      
      if (cas.length === 0) {
        setError('Nenhum critério encontrado. Use o formato: CA01: Descrição\nCA02: Descrição...');
        return;
      }

      const parsed: CAInput[] = cas.map((ca, index) => {
        const lines = ca.split('\n').filter(l => l.trim());
        const header = lines[0] || `CA${index + 1}`;
        const descripcion = lines.slice(1).join(' ');

        return {
          objetivo: `Validar ${header}`,
          descricao: descripcion || header,
          prerequisitos: [
            'Estar logado no sistema',
            'Ter permissão para acessar a funcionalidade',
            'Ambiente de testes preparado'
          ],
          passoAPasso: [
            {
              passo: 1,
              descricao: 'Preparar ambiente',
              detalhes: ['Preparar dados de teste', 'Validar pré-requisitos']
            },
            {
              passo: 2,
              descricao: 'Executar teste',
              detalhes: ['Executar o cenário de teste', 'Registrar resultados']
            },
            {
              passo: 3,
              descricao: 'Validar resultado',
              detalhes: ['Comparar resultado esperado', 'Registrar evidências']
            }
          ]
        };
      });

      setParsedCAs(parsed);
      setShowPreview(true);
    } catch (err) {
      setError('Erro ao processar input. Verifique o formato.');
      console.error(err);
    }
  };

  const handleGeneratePDF = async () => {
    if (!titulo.trim()) {
      setError('Por favor, preencha o título do plano');
      return;
    }

    setIsGenerating(true);
    try {
      await generatePDF();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setShowPreview(false);
    setCAInput('');
    setParsedCAs([]);
    setTitulo('');
    setError(null);
  };

  return (
    <div className="pdf-viewer">
      {!showPreview ? (
        <div className="input-container">
          <div className="input-header">
            <h1>📝 Gerador de Plano de Testes Customizado</h1>
            <p>Insira seus critérios de aceite e gere um PDF profissional</p>
          </div>

          <div className="input-form">
            <div className="form-group">
              <label htmlFor="titulo">
                <span className="label-text">Título do Plano *</span>
                <input
                  id="titulo"
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Plano de Testes - Gerar Matrícula"
                  className="input-field"
                />
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="criteria">
                <span className="label-text">Critérios de Aceite *</span>
                <textarea
                  id="criteria"
                  value={caInput}
                  onChange={(e) => setCAInput(e.target.value)}
                  placeholder="Cole aqui seus critérios de aceite.&#10;&#10;Formato sugerido:&#10;CA01: Sua primeira validação&#10;CA02: Sua segunda validação&#10;CA03: E assim por diante..."
                  rows={15}
                  className="textarea-field"
                />
              </label>
              <p className="help-text">
                💡 Dica: Use o formato CA01:, CA02:, etc. Um critério por linha
              </p>
            </div>

            {error && <div className="error-message">❌ {error}</div>}

            <div className="button-group">
              <button
                onClick={() => parseUserInput(caInput)}
                className="btn-preview"
                disabled={!caInput.trim() || !titulo.trim()}
              >
                👁️ Visualizar Plano
              </button>
              <button
                onClick={() => setCAInput('')}
                className="btn-clear"
              >
                🗑️ Limpar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="toolbar">
            <h1>📋 Visualização do Plano de Testes</h1>
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
        </>
      )}
    </div>
  );
};

interface PreviewPlanoProps {
  titulo: string;
  cas: CAInput[];
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
              <strong>Total de Critérios:</strong> {cas.length}
            </p>
            <p>
              <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>
            <p>
              <strong>Versão:</strong> 1.0
            </p>
          </div>
        </div>
      </div>

      {/* SUMÁRIO */}
      <div className="summary-page page-break">
        <h2>Sumário de Critérios</h2>
        <div className="summary-list">
          {cas.map((ca, idx) => (
            <div key={idx} className="summary-item">
              <span className="summary-id">CA{String(idx + 1).padStart(2, '0')}</span>
              <span className="summary-title">{ca.descricao}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CRITÉRIOS */}
      <div className="test-cases">
        <h1 className="main-title">Critérios de Aceite</h1>

        {cas.map((ca, idx) => (
          <div key={idx} className="ca-section page-break">
            <div className="ca-header">
              <h2 className="ca-id">CA{String(idx + 1).padStart(2, '0')}</h2>
              <h1 className="ca-title">{ca.descricao}</h1>
            </div>

            <div className="ca-objective">
              <h3>📋 OBJETIVO</h3>
              <p>{ca.objetivo}</p>
            </div>

            <div className="ca-prerequisites">
              <h3>✅ PRÉ-REQUISITOS</h3>
              <ul>
                {ca.prerequisitos.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="ca-steps">
              <h3>📝 PASSO A PASSO</h3>
              <div className="steps-container">
                {ca.passoAPasso.map((step) => (
                  <div key={step.passo} className="step">
                    <div className="step-header">
                      <span className="step-number">Passo {step.passo}</span>
                      <h4>{step.descricao}</h4>
                    </div>
                    {step.detalhes && (
                      <ul className="step-details">
                        {step.detalhes.map((detalhe, i) => (
                          <li key={i}>{detalhe}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
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
            <li>Comunique problemas ao time imediatamente</li>
            <li>Valide cenários não previstos durante testes exploratórios</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFViewerCustom;
