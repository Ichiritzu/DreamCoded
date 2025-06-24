// components/LiveEditor/LiveEditor.jsx
import React, { useState, useEffect } from 'react';
import './LiveEditor.css';

const LiveEditor = () => {
  const [html, setHtml] = useState('<div id="app">Hello DreamCoded</div>');
  const [css, setCss] = useState('#app { color: cyan; font-size: 2rem; }');
  const [js, setJs] = useState("document.getElementById('app').innerText += ' ✨';");
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <html>
            <head>
            <style>${css}</style>
            </head>
            <body>
            ${html}
            <script>${js}</script>
            </body>
        </html>
        `);
    }, 250);

    return () => clearTimeout(timeout);
  }, [html, css, js]);

  return (
    <div className="live-editor-container">
      <div className="code-inputs">
        <textarea value={html} onChange={(e) => setHtml(e.target.value)} placeholder="HTML" />
        <textarea value={css} onChange={(e) => setCss(e.target.value)} placeholder="CSS" />
        <textarea value={js} onChange={(e) => setJs(e.target.value)} placeholder="JavaScript" />
      </div>
      <div className="preview-pane">
        <iframe
          srcDoc={srcDoc}
          title="Live Preview"
          sandbox="allow-scripts"
          frameBorder="0"
          className="live-preview"
        />
      </div>
    </div>
  );
};

export default LiveEditor;
