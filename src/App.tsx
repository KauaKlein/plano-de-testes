import { useState } from "react";
import "./App.css";
import PDFViewer from "./components/PDFViewer";

type Route = "home" | "generator" | "macro" | "pdf-viewer";

function App() {
  const [route, setRoute] = useState<Route>("home");
  const [title, setTitle] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const defaultPrompt = `Gere um JSON (UTF-8) contendo um objeto por Critério de Aceitação (CA), na MESMA ORDEM em que foram enviados. Para cada CA, inclua as seções: Objetivo, Pré-requisitos, Passo a Passo (com numero/descricao/resultadoEsperado) e ResultadoEsperado. Retorne APENAS JSON válido.`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!acceptanceCriteria.trim()) {
      setError("Por favor, cole os Critérios de Aceitação (CAs) antes de gerar.");
      setLoading(false);
      return;
    }

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, acceptanceCriteria, prompt: prompt && prompt.trim() ? prompt : defaultPrompt })
      });

      if (!resp.ok) {
        const j = await resp.json().catch(() => null);
        throw new Error(j?.error || `HTTP ${resp.status}`);
      }

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "SRT Plano De Testes.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
        
      setSuccessMessage("🎉 O processo de geração do PDF foi iniciado. O download deve começar em breve!");
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao gerar PDF. Verifique o console ou tente novamente.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(null), 8000); 
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="header">
          <h1>📋 SRT</h1>
          <p className="subtitle">Sistema de Registro de Terceiros</p>
        </div>

        <nav className="nav-links">
          <button className={`nav-item ${route === "pdf-viewer" ? "active" : ""}`} onClick={() => setRoute("pdf-viewer")}>Gerador PDF - Matrícula</button>
          <button className={`nav-item ${route === "generator" ? "active" : ""}`} onClick={() => setRoute("generator")}>Gerador de Plano</button>
          <button className={`nav-item ${route === "macro" ? "active" : ""}`} onClick={() => setRoute("macro")}>Macro - Evidências</button>
        </nav>
      </div>

      <div className="main-area">
        {route === "home" && (
          <div className="main-content empty-home" />
        )}

        {route === "pdf-viewer" && (
          <PDFViewer />
        )}

        {route === "generator" && (
          <div className="main-content">
            <div className="page-header"><h2>Gerador de Plano de Testes</h2></div>
            <div className="card">
              <form onSubmit={handleSubmit} className="form">
                <div className="form-group full-width">
                  <label>
                    <span className="label-text">Título do Plano</span>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Gerar Matrícula retornos" />
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <span className="label-text">Critérios de Aceitação (CA)</span>
                    <textarea value={acceptanceCriteria} onChange={(e) => setAcceptanceCriteria(e.target.value)} placeholder="Cole aqui os critérios de aceitação (CA01, CA02, CA03...)" rows={12} />
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <span className="label-text">Prompt (opcional)</span>
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={6} />
                  </label>
                </div>

                <div className="actions">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? (
                      <><span className="spinner"/> Gerando PDF...</>
                    ) : (
                      <>📄 Gerar Plano e Baixar PDF</>
                    )}
                  </button>
                </div>

                {error && <div className="error-message"><span>❌</span> {error}</div>}
                {successMessage && <div className="success-message"><span>✅</span> {successMessage}</div>}
              </form>
            </div>
          </div>
        )}

        {route === "macro" && (
          <div className="main-content">
            <div className="page-header"><h2>Macro - Evidências</h2></div>
            <div className="card">
              <p>Área para macros e captura de evidências. Integre scripts ou cole instruções aqui.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
