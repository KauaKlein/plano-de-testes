import { useState } from 'react';
import { generatePDF } from '../utils/pdfGenerator';
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
  const [funcionalidade, setFuncionalidade] = useState('');
  const [sistemaIntegrado, setSistemaIntegrado] = useState('');
  const [tipoTeste, setTipoTeste] = useState('Integração');
  const [preCondicoes, setPreCondicoes] = useState('');
  const [dadosTeste, setDadosTeste] = useState('');
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
      console.log('📤 Enviando para IA:', { titulo, caInput });
      const resultado = await gerarPlanoComIA(titulo, caInput);
      
      console.log('📥 Resultado recebido da IA:', resultado);
      
      // Preencher campos com resposta da IA
      setFuncionalidade(resultado.funcionalidade || '');
      setSistemaIntegrado(resultado.sistemaIntegrado || '');
      setTipoTeste(resultado.tipoTeste || 'Integração');
      setPreCondicoes(resultado.preCondicoes || '');
      setDadosTeste(resultado.dadosTeste || '');
      setParsedCAs(resultado.casFormatados || []);
      
      if (!resultado.casFormatados || resultado.casFormatados.length === 0) {
        throw new Error('IA não retornou critérios de aceite válidos');
      }
      
      setShowPreview(true);
    } catch (err: any) {
      console.error('❌ Erro completo:', err);
      const errorMessage = err?.message || 'Erro desconhecido';
      setError(`Erro ao processar o : ${errorMessage}. Verifique o console para mais detalhes.`);
    } finally {
      setIsLoadingIA(false);
    }
  };

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
    setFuncionalidade('');
    setSistemaIntegrado('');
    setTipoTeste('Integração');
    setPreCondicoes('');
    setDadosTeste('');
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
                <span className="label-text">Funcionalidade SRT</span>
                <input
                  type="text"
                  value={funcionalidade}
                  onChange={(e) => setFuncionalidade(e.target.value)}
                  placeholder="Ex: Gerar Matrícula, Retorno Barramento"
                  className="input-field"
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                <span className="label-text">Sistema Integrado</span>
                <input
                  type="text"
                  value={sistemaIntegrado}
                  onChange={(e) => setSistemaIntegrado(e.target.value)}
                  placeholder="Ex: AUT, NDS, CURE"
                  className="input-field"
                />
              </label>
            </div>

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

          {error && <div className="error-message">❌ {error}</div>}

          <div className="button-group">
            <button
              onClick={handleVisualizeComIA}
              className="btn-primary btn-ia"
              disabled={!caInput.trim() || !titulo.trim() || isLoadingIA}
            >
              {isLoadingIA ? '🤖 Processando com IA...' : '✨ Gerar Plano de Testes'}
            </button>
            <button
              onClick={() => {
                setTitulo('');
                setFuncionalidade('');
                setSistemaIntegrado('');
                setTipoTeste('Integração');
                setPreCondicoes('');
                setDadosTeste('');
                setCAInput('');
                setError(null);
              }}
              className="btn-tertiary"
              disabled={isLoadingIA}
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
        <PreviewPlano 
          titulo={titulo}
          funcionalidade={funcionalidade}
          sistemaIntegrado={sistemaIntegrado}
          tipoTeste={tipoTeste}
          preCondicoes={preCondicoes}
          dadosTeste={dadosTeste}
          cas={parsedCAs} 
        />
      </div>
    </div>
  );
};

interface PreviewPlanoProps {
  titulo: string;
  funcionalidade: string;
  sistemaIntegrado: string;
  tipoTeste: string;
  preCondicoes: string;
  dadosTeste: string;
  cas: CAData[];
}

const PreviewPlano = ({ titulo, funcionalidade, sistemaIntegrado, tipoTeste, preCondicoes, dadosTeste, cas }: PreviewPlanoProps) => {
  return (
    <div className="plano-container">
      {/* CABEÇALHO SIMPLES */}
      <div className="simple-header">
        <h1 className="doc-title">{titulo}</h1>
        <div className="doc-meta">
          <p className="doc-date">Data: {new Date().toLocaleDateString('pt-BR')}</p>
          <p className="doc-total">Total: {cas.length} critérios de aceite</p>
          {funcionalidade && <p className="doc-funcionalidade"><strong>Funcionalidade:</strong> {funcionalidade}</p>}
          {sistemaIntegrado && <p className="doc-sistema"><strong>Sistema:</strong> {sistemaIntegrado}</p>}
          {tipoTeste && <p className="doc-tipo"><strong>Tipo:</strong> {tipoTeste}</p>}
        </div>
      </div>

      {/* PRÉ-CONDIÇÕES */}
      {preCondicoes && (
        <div className="section-box precondicoes">
          <h2 className="section-title">✅ Pré-condições</h2>
          <div className="section-content">
            {preCondicoes.split(';').map((linha, idx) => (
              <p key={idx}>• {linha.trim()}</p>
            ))}
          </div>
        </div>
      )}

      {/* DADOS DE TESTE */}
      {dadosTeste && (
        <div className="section-box dados-teste">
          <h2 className="section-title">📋 Dados de Teste</h2>
          <div className="section-content">
            {dadosTeste.split(';').map((linha, idx) => (
              <p key={idx}>• {linha.trim()}</p>
            ))}
          </div>
        </div>
      )}

      {/* CRITÉRIOS */}
      <div className="test-cases">
        {cas.map((ca) => (
          <div key={ca.id} className="ca-item">
            <div className="ca-number">{ca.id}</div>
            <div className="ca-content">
              <h3 className="ca-title">{ca.title}</h3>
              <p className="ca-description">{ca.descricao}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFViewer;
