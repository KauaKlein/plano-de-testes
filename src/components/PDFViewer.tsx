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
          <h1>Gerador de Plano de Testes</h1>
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
      {/* CABEÇALHO SIMPLES */}
      <div className="simple-header">
        <h1 className="doc-title">{titulo}</h1>
        <div className="doc-info">
          <span>Total: {cas.length} critérios</span>
          <span>Data: {new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      {/* CRITÉRIOS */}
      <div className="test-cases">
        {cas.map((ca) => (
          <div key={ca.id} className="ca-item">
            <div className="ca-number">{ca.id}</div>
            <div className="ca-content">
              <h3>{ca.title}</h3>
              <p>{ca.descricao}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFViewer;
