import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { dracula } from '@uiw/codemirror-theme-dracula';

const longCode = `
<!DOCTYPE html>
<html>
  <head>
    <title>Very Long HTML Test</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #111;
      }
    </style>
  </head>
  <body>
    <div style="width: 2000px;">
      <!-- A very long line to trigger horizontal scroll -->
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. 
      Donec et mollis dolor. Praesent et diam eget libero egestas mattis sit amet vitae augue.
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus.
    </div>
  </body>
</html>
`;

const ScrollEditorTest = () => {
  return (
    <div
      style={{
        height: '80vh',
        padding: '1rem',
        background: '#0d1117',
        boxSizing: 'border-box'
      }}
    >
      <h2 style={{ color: '#fff' }}>Test Scrollable CodeMirror</h2>
      <div
        style={{
          height: '100%',
          border: '1px solid #333',
          overflow: 'hidden',
          borderRadius: '8px',
        }}
      >
        <CodeMirror
          value={longCode}
          height="100%"
          theme={dracula}
          extensions={[html()]}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
          }}
          style={{
            height: '100%',
            overflow: 'auto'
          }}
        />
      </div>
    </div>
  );
};

export default ScrollEditorTest;
