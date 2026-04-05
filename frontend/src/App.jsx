import { useState } from 'react'
import './index.css'

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('ai_api_key') || '');
  const [showSettings, setShowSettings] = useState(!apiKey);

  const saveSettings = () => {
    localStorage.setItem('ai_api_key', apiKey);
    setShowSettings(false);
  };

  return (
    <div className="ide-layout">
      {/* Sidebar Panel */}
      <div style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-color)', padding: '10px' }}>
        <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888' }}>Explorer</h3>
        <ul style={{ listStyle: 'none', marginTop: '10px', fontSize: '13px' }} className="code-font">
          <li style={{ color: 'var(--text-active)' }}>📁 student-workspace</li>
          <li style={{ marginLeft: '15px' }}>📄 Main.java</li>
          <li style={{ marginLeft: '15px' }}>📄 Assignment.pdf</li>
        </ul>
      </div>

      {/* Main Chat Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
        <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-active)' }}>Chat - Tutor Active</span>
          <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>⚙️ Settings</button>
        </div>
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: 'var(--accent)' }}>Tutor:</strong>
            <p style={{ marginTop: '5px' }}>Hello! I see you're working on Java inheritance today. What's confusing you?</p>
          </div>
        </div>
        <div style={{ padding: '15px', borderTop: '1px solid var(--border-color)' }}>
          <input 
            type="text" 
            placeholder="Type your question..." 
            style={{ width: '100%', padding: '10px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }} 
          />
        </div>
      </div>

      {/* Context/Test Cases Panel */}
      <div style={{ background: 'var(--bg-panel)', borderLeft: '1px solid var(--border-color)', padding: '10px' }}>
        <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888' }}>Execution Context</h3>
        <div style={{ marginTop: '10px', fontSize: '13px', color: '#aaa' }}>
          No code tests running...
        </div>
      </div>

      {/* Status Bar */}
      <div style={{ gridColumn: '1 / -1', background: 'var(--accent)', color: 'white', fontSize: '12px', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
        <span>✔ SQLite Connected</span>
        <span style={{ marginLeft: '15px' }}>Model: {apiKey ? 'Gemini/Claude (Ready)' : 'No API Key'}</span>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="settings-modal">
            <h2>Provider Settings</h2>
            <p style={{ fontSize: '12px', marginBottom: '10px', color: '#aaa' }}>Since this is a local app, please provide your LLM API Key.</p>
            <input 
              type="password" 
              className="input-field" 
              placeholder="sk-..." 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)} 
            />
            <button className="save-btn" onClick={saveSettings}>Save API Key</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
