import { useState } from 'react'
import './index.css'

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('ai_api_key') || '');
  const [providerType, setProviderType] = useState(localStorage.getItem('ai_provider_type') || 'cloud');
  const [localUrl, setLocalUrl] = useState(localStorage.getItem('ai_local_url') || 'http://localhost:11434');
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'Tutor', content: 'Hello! I am your local AI coding tutor. How can I help you today?' }
  ]);
  
  const [showSettings, setShowSettings] = useState(providerType === 'cloud' && !apiKey);

  const saveSettings = () => {
    localStorage.setItem('ai_api_key', apiKey);
    localStorage.setItem('ai_provider_type', providerType);
    localStorage.setItem('ai_local_url', localUrl);
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
          {chatHistory.map((msg, index) => (
            <div key={index} style={{ marginBottom: '15px' }}>
              <strong style={{ color: msg.role === 'Tutor' ? 'var(--accent)' : 'var(--text-active)' }}>
                {msg.role}:
              </strong>
              <p style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
            </div>
          ))}
          {isTyping && <div style={{ color: '#aaa', fontSize: '13px' }}>Tutor is typing...</div>}
        </div>
        <div style={{ padding: '15px', borderTop: '1px solid var(--border-color)' }}>
          <input 
            type="text" 
            placeholder={providerType === 'local' ? 'Ask Qwen...' : 'Type your question...'}
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && inputMessage.trim() !== '') {
                const newQuery = inputMessage.trim();
                setChatHistory(prev => [...prev, { role: 'Student', content: newQuery }]);
                setInputMessage('');
                setIsTyping(true);
                
                try {
                  const payload = [...chatHistory, { role: 'Student', content: newQuery }];
                  const res = await fetch('http://localhost:8080/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: payload })
                  });
                  const data = await res.json();
                  setChatHistory(prev => [...prev, { role: 'Tutor', content: data.response }]);
                } catch (err) {
                  setChatHistory(prev => [...prev, { role: 'Tutor', content: 'Connection Error: Is the Spring Boot backend running on port 8080?' }]);
                } finally {
                  setIsTyping(false);
                }
              }
            }}
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
        <span style={{ marginLeft: '15px' }}>Model: {providerType === 'cloud' ? (apiKey ? 'Cloud API (Ready)' : 'Cloud API (No Key)') : 'Local LLM (Ready)'}</span>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="settings-modal" style={{width: '450px'}}>
            <h2>Provider Settings</h2>
            
            <div style={{display: 'flex', gap: '15px', marginBottom: '15px', fontSize: '14px', color: 'var(--text-active)'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}>
                <input 
                  type="radio" 
                  value="cloud" 
                  checked={providerType === 'cloud'} 
                  onChange={() => setProviderType('cloud')} 
                /> Cloud API (Gemini/Claude)
              </label>
              <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}>
                <input 
                  type="radio" 
                  value="local" 
                  checked={providerType === 'local'} 
                  onChange={() => setProviderType('local')} 
                /> Local LLM (Ollama)
              </label>
            </div>

            {providerType === 'cloud' ? (
              <>
                <p style={{ fontSize: '12px', marginBottom: '10px', color: '#aaa' }}>Please provide your LLM API Key to use cloud models.</p>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="sk-..." 
                  value={apiKey} 
                  onChange={e => setApiKey(e.target.value)} 
                />
              </>
            ) : (
              <>
                <p style={{ fontSize: '12px', marginBottom: '10px', color: '#aaa' }}>Provide your local LLM endpoint (e.g. Ollama).</p>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="http://localhost:11434" 
                  value={localUrl} 
                  onChange={e => setLocalUrl(e.target.value)} 
                />
              </>
            )}

            <button className="save-btn" onClick={saveSettings}>Save Settings</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
