import { useState } from 'react';
import { generateDOCX } from '../utils/docxGenerator';
import { gerarPlanoComIA } from '../utils/geminiService';
import './PDFViewer.css';

interface CAData {
  id: string;
  title: string;
  descricao: string;
}

const PDFViewer = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingIA, setIsLoadingIA] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [tipoTeste, setTipoTeste] = useState('Integração');
  const [preCondicoes, setPreCondicoes] = useState('');
  const [caInput, setCAInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [parsedCAs, setParsedCAs] = useState<CAData[]>([]);

  const handleVisualizeComIA = async () => {
    setError(null);
    setIsLoadingIA(true);

    if (!titulo.trim()) {
      setError('Por favor, preencha o título do plano');
      setIsLoadingIA(false);
      return;
    }

    if (!caInput.trim()) {
      setError('Por favor, insira seus critérios de aceite');
      setIsLoadingIA(false);
      return;
    }

    try {
      console.log(' Enviando para IA:', { titulo, caInput });
      const resultado = await gerarPlanoComIA(titulo, caInput);
      
      console.log(' Resultado recebido da IA:', resultado);
      
      setTipoTeste(resultado.tipoTeste || 'Integração');
      setPreCondicoes(resultado.preCondicoes || '');
      setParsedCAs(resultado.casFormatados || []);
      
      if (!resultado.casFormatados || resultado.casFormatados.length === 0) {
        throw new Error('IA não retornou critérios de aceite válidos');
      }
      
      setShowPreview(true);
    } catch (err: any) {
      console.error(' Erro completo:', err);
      const errorMessage = err?.message || 'Erro desconhecido';
      setError(`Erro ao processar: ${errorMessage}. Verifique o console para mais detalhes.`);
    } finally {
      setIsLoadingIA(false);
    }
  };

  const handleGenerateDOCX = async () => {
    setIsGenerating(true);
    try {
      await generateDOCX(titulo, tipoTeste, preCondicoes, parsedCAs);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setShowPreview(false);
    setTitulo('');
    setTipoTeste('Integração');
    setPreCondicoes('');
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

          <div className="form-row">
            <div className="form-group">
              <label>
                <span className="label-text">Tipo de Teste</span>
                <select
                  value={tipoTeste}
                  onChange={(e) => setTipoTeste(e.target.value)}
                  className="input-field"
                >
                  <option value="Integração">Integração</option>
                  <option value="Barramento">Barramento</option>
                  <option value="Unidade">Unidade</option>
                  <option value="CRUD">CRUD</option>
                  <option value="Validação">Validação</option>
                </select>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>
              <span className="label-text">Critérios de Aceite (CAs) *</span>
              <textarea
                value={caInput}
                onChange={(e) => setCAInput(e.target.value)}
                placeholder="Cole aqui seus critérios de aceite."
                rows={15}
                className="textarea-field"
              />
            </label>
          </div>

          {error && <div className="error-message"> {error}</div>}

          <div className="button-group">
            <button
              onClick={handleVisualizeComIA}
              className="btn-primary btn-success"
              disabled={!caInput.trim() || !titulo.trim() || isLoadingIA}
            >
              {isLoadingIA ? ' Processando com IA...' : ' Gerar Plano de Testes'}
            </button>
            <button
              onClick={() => {
                setTitulo('');
                setTipoTeste('Integração');
                setPreCondicoes('');
                setCAInput('');
                setError(null);
              }}
              className="btn-tertiary"
              disabled={isLoadingIA}
            >
               Limpar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      <div className="toolbar">
        <h1> {titulo}</h1>
        <div className="toolbar-buttons">
          <button
            onClick={handleGenerateDOCX}
            disabled={isGenerating}
            className="btn-generate"
          >
            {isGenerating ? 'Gerando...' : '📝 Baixar DOCX'}
          </button>
          <button
            onClick={handleReset}
            className="btn-back"
          >
             Voltar
          </button>
        </div>
      </div>
      <div id="pdf-content" className="content">
        <PreviewPlano 
          titulo={titulo}
          tipoTeste={tipoTeste}
          preCondicoes={preCondicoes}
          cas={parsedCAs} 
        />
      </div>
    </div>
  );
};

interface PreviewPlanoProps {
  titulo: string;
  tipoTeste: string;
  preCondicoes: string;
  cas: CAData[];
}

const PreviewPlano = ({ titulo, tipoTeste, preCondicoes, cas }: PreviewPlanoProps) => {
  return (
    <div className="plano-container">
      <div className="simple-header">
        <h1>{titulo}</h1>
        <p>Data: {new Date().toLocaleDateString('pt-BR')} | Total: {cas.length} CAs{tipoTeste && ` | ${tipoTeste}`}</p>
      </div>

      {preCondicoes && (
        <div className="section page-break-after">
          <h2>Pré-requisitos</h2>
          <ol>
            {preCondicoes.split(';').map((item, idx) => (
              <li key={idx}>{item.trim()}</li>
            ))}
          </ol>
        </div>
      )}

      <div className="section">
        <h2>Critérios de Aceite - Passo a Passo</h2>
        {cas.map((ca, index) => {
          const shouldBreakBefore = index > 0 && index % 2 === 0;
          return (
            <div key={ca.id} className={`ca-item ${shouldBreakBefore ? 'page-break-before' : ''}`}>
              <h3>{ca.id} - {ca.title}</h3>
              <p>{ca.descricao}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PDFViewer;
