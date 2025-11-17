import { testCases } from '../data/testCases';
import type { CA } from '../data/testCases';
import './PlanoDeTestes.css';

const PlanoDeTestes = () => {
  const renderCA = (ca: CA) => {
    return (
      <div key={ca.id} className="ca-section page-break">
        <div className="ca-header">
          <h2 className="ca-id">{ca.id}</h2>
          <h1 className="ca-title">{ca.title}</h1>
        </div>

        {/* OBJETIVO */}
        <div className="ca-objective">
          <h3>📋 OBJETIVO</h3>
          <p>{ca.objetivo}</p>
        </div>

        {/* PRÉ-REQUISITOS */}
        <div className="ca-prerequisites">
          <h3>✅ PRÉ-REQUISITOS</h3>
          <ul>
            {ca.prerequisitos.map((prereq, idx) => (
              <li key={idx}>{prereq}</li>
            ))}
          </ul>
        </div>

        {/* TABELAS (se existirem) */}
        {ca.tabelas &&
          ca.tabelas.map((tabela, idx) => (
            <div key={idx} className="ca-table">
              <h4>{tabela.titulo}</h4>
              <table>
                <thead>
                  <tr>
                    {tabela.colunas.map((col, colIdx) => (
                      <th key={colIdx}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tabela.linhas.map((linha, lineIdx) => (
                    <tr key={lineIdx}>
                      {linha.map((cell, cellIdx) => (
                        <td key={cellIdx}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {/* PASSO A PASSO */}
        <div className="ca-steps">
          <h3>📝 PASSO A PASSO</h3>
          <div className="steps-container">
            {ca.passoAPasso.map((step, idx) => (
              <div key={idx} className="step">
                <div className="step-header">
                  <span className="step-number">Passo {step.passo}</span>
                  <h4>{step.descricao}</h4>
                </div>
                {step.detalhes && (
                  <ul className="step-details">
                    {step.detalhes.map((detalhe, detIdx) => (
                      <li key={detIdx}>{detalhe}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="pdf-content" className="plano-container">
      {/* CAPA */}
      <div className="cover-page page-break">
        <div className="cover-content">
          <h1 className="cover-title">Plano de Testes</h1>
          <h2 className="cover-subtitle">Geração de Matrícula Autorizados/STC</h2>
          <div className="cover-divider"></div>

          <div className="cover-info">
            <p>
              <strong>Sistema:</strong> SRT - Sistema de Registro de Terceiros
            </p>
            <p>
              <strong>Funcionalidade:</strong> Gerar Matrícula para Terceiros
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
              <span className="stat-label">Total de Critérios de Aceite:</span>
              <span className="stat-value">{testCases.length}</span>
            </p>
            <p className="stat-item">
              <span className="stat-label">Cenários de Teste:</span>
              <span className="stat-value">
                {testCases.reduce((acc, ca) => acc + ca.passoAPasso.length, 0)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* SUMÁRIO */}
      <div className="summary-page page-break">
        <h2>Sumário de Critérios de Aceite</h2>
        <div className="summary-list">
          {testCases.map((ca) => (
            <div key={ca.id} className="summary-item">
              <span className="summary-id">{ca.id}</span>
              <span className="summary-title">{ca.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CRITÉRIOS DE ACEITE */}
      <div className="test-cases">
        <h1 className="main-title">Critérios de Aceite - Geração de Matrícula</h1>

        {testCases.map((ca) => renderCA(ca))}
      </div>

      {/* OBSERVAÇÕES FINAIS */}
      <div className="final-notes page-break">
        <h2>Observações Finais</h2>
        <div className="notes-content">
          <h3>Pontos Importantes:</h3>
          <ul>
            <li>
              Todos os CAs devem ser testados em ambiente de homologação antes
              da produção
            </li>
            <li>
              A comunicação externa com AUT e NDS deve ser validada com os
              respectivos times
            </li>
            <li>
              Os logs devem ser registrados conforme especificado em cada CA para
              rastreabilidade
            </li>
            <li>
              Testes exploratórios devem cobrir cenários não previstos neste
              documento
            </li>
            <li>
              A data de expiração deve respeitar a vigência dos contratos
              conforme CA13
            </li>
            <li>
              Múltiplos Terceiros podem ser processados em paralelo, validar
              concorrência
            </li>
          </ul>

          <h3>Responsabilidades:</h3>
          <ul>
            <li>Analista de Testes: Executar e documentar resultados</li>
            <li>Desenvolvedor: Implementar conforme CAs</li>
            <li>
              Arquiteto: Validar integração com sistemas externos (AUT, NDS)
            </li>
            <li>Product Owner: Aprovar resultados dos testes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlanoDeTestes;
