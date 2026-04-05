import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import 'katex/dist/katex.min.css'
import './index.css'

const FileNode = ({ node, level, onSelectFile }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (node.isDir) {
    return (
      <div style={{ marginLeft: `${level * 10}px` }}>
        <div style={{ cursor: 'pointer', color: expanded ? 'var(--accent)' : 'var(--text-active)', padding: '3px 0', userSelect: 'none' }} onClick={() => setExpanded(!expanded)}>
          {expanded ? '📂' : '📁'} {node.name}
        </div>
        {expanded && node.children && node.children.map((child, i) => (
          <FileNode key={i} node={child} level={level + 1} onSelectFile={onSelectFile} />
        ))}
      </div>
    );
  } else {
    return (
      <div style={{ marginLeft: `${level * 10}px`, cursor: 'pointer', padding: '3px 0', userSelect: 'none', color: '#aaa' }} onClick={() => onSelectFile(node.path, node.name)} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = '#aaa'}>
        📄 {node.name}
      </div>
    );
  }
}

function App() {
  const [fileTree, setFileTree] = useState([]);
  const [selectedFileContent, setSelectedFileContent] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/api/workspace/tree')
      .then(res => {
        if (!res.ok) throw new Error("Server returned " + res.status);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setFileTree(data);
        } else {
          console.error("Expected array, got:", data);
        }
      })
      .catch(err => {
         console.error("Workspace API error:", err);
         setFileTree([]);
      });
  }, []);

  const handleSelectFile = async (path, name) => {
    try {
      const res = await fetch(`http://localhost:8080/api/workspace/file?path=${encodeURIComponent(path)}`);
      if (res.ok) {
        const text = await res.text();
        setSelectedFileContent(text);
        setSelectedFileName(name);
      } else {
        setSelectedFileContent('Failed to open file: Access Denied or Not Found.');
        setSelectedFileName('Error');
      }
    } catch(e) {
      console.error("Failed to fetch file:", e);
    }
  }
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
      <div style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-color)', padding: '10px', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888', marginBottom: '10px' }}>Explorer</h3>
        <div style={{ fontSize: '13px' }} className="code-font">
          <div style={{ color: 'var(--text-active)', fontWeight: 'bold', marginBottom: '5px' }}>📦 student-workspace</div>
          {Array.isArray(fileTree) && fileTree.map((node, i) => (
             <FileNode key={i} node={node} level={1} onSelectFile={handleSelectFile} />
          ))}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', overflow: 'hidden' }}>
        <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: '14px', color: 'var(--text-active)' }}>Chat - Tutor Active</span>
          <div>
            <button 
              onClick={() => setChatHistory([{ role: 'Tutor', content: 'Hello! I am your local AI coding tutor. How can I help you today?' }])} 
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginRight: '15px' }}>
              🧹 Clear Chat
            </button>
            <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>⚙️ Settings</button>
          </div>
        </div>
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {chatHistory.map((msg, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'Tutor' ? 'flex-start' : 'flex-end', marginBottom: '20px' }}>
              <div style={{
                background: msg.role === 'Tutor' ? '#2d2d30' : 'var(--accent)',
                color: 'white',
                padding: '12px 18px',
                borderRadius: '16px',
                borderBottomLeftRadius: msg.role === 'Tutor' ? '4px' : '16px',
                borderBottomRightRadius: msg.role === 'Student' ? '4px' : '16px',
                maxWidth: '85%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}>
                <div style={{ fontSize: '11px', color: msg.role === 'Tutor' ? '#aaa' : '#e0e0e0', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  {msg.role}
                </div>
                {msg.role === 'Tutor' ? (
                  <div style={{ fontSize: '14px', lineHeight: '1.6', overflowX: 'auto' }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        code({node, inline, className, children, ...props}) {
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} style={{background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: '4px', fontFamily: '"Fira Code", monospace'}} {...props}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div style={{ fontSize: '14px', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                )}
              </div>
            </div>
          ))}
          {isTyping && <div style={{ color: '#aaa', fontSize: '13px' }}>Tutor is typing...</div>}
        </div>
        <div style={{ padding: '15px', borderTop: '1px solid var(--border-color)', flexShrink: 0 }}>
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

      {/* Right Sidebar - Execution Context */}
      <div style={{ background: 'var(--bg-panel)', borderLeft: '1px solid var(--border-color)', padding: '10px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888' }}>
          {selectedFileName ? `Viewing File: ${selectedFileName}` : 'Execution Context'}
        </h3>
        {selectedFileName ? (
           <div style={{ flex: 1, marginTop: '10px', background: '#1e1e1e', overflowY: 'auto', padding: '15px', borderRadius: '4px', border: '1px solid #333' }}>
              <pre style={{ margin: 0, fontSize: '13px', fontFamily: '"Fira Code", monospace', color: '#d4d4d4', whiteSpace: 'pre-wrap' }}>
                {selectedFileContent}
              </pre>
           </div>
        ) : (
          <div style={{ marginTop: '20px', textAlign: 'center', color: '#555', fontSize: '13px' }}>
            <p>Select a file in the explorer</p>
            <p>or run code to see output.</p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div style={{ gridColumn: '1 / -1', background: 'var(--accent)', color: 'white', fontSize: '12px', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
        <span>✔ SQLite Connected</span>
        <span style={{ marginLeft: '15px' }}>Model: {providerType === 'cloud' ? (apiKey ? 'Cloud API (Ready)' : 'Cloud API (No Key)') : 'Local LLM (Ready)'}</span>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="settings-modal" style={{ width: '450px' }}>
            <h2>Provider Settings</h2>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', fontSize: '14px', color: 'var(--text-active)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value="cloud"
                  checked={providerType === 'cloud'}
                  onChange={() => setProviderType('cloud')}
                /> Cloud API (Gemini/Claude)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
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
