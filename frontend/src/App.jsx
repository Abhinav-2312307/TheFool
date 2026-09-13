import { useState } from 'react'
import { 
  Wand2, 
  Image as ImageIcon, 
  Settings, 
  Loader2, 
  AlertCircle,
  Download
} from 'lucide-react'
import './App.css'

function App() {
  // Connection state
  const [apiUrl, setApiUrl] = useState('')
  
  // Generation states
  const [prompt, setPrompt] = useState('A highly detailed, majestic futuristic city at sunset, cyberpunk aesthetics, neon lights, hyperrealistic, 8k resolution, octane render')
  const [negativePrompt, setNegativePrompt] = useState('blurry, low quality, distorted, deformed, watermark, signature, bad anatomy')
  const [steps, setSteps] = useState(25)
  const [cfgScale, setCfgScale] = useState(7)
  const [width, setWidth] = useState(1024)
  const [height, setHeight] = useState(1024)
  
  // Model states
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('')
  const [isFetchingModels, setIsFetchingModels] = useState(false)
  // App states
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [error, setError] = useState(null)

  const fetchModels = async () => {
    if (!apiUrl) {
      setError('Please enter the API URL first.')
      return
    }
    setIsFetchingModels(true)
    setError(null)
    const baseUrl = apiUrl.replace(/\/$/, '')
    try {
      const response = await fetch(`${baseUrl}/sdapi/v1/sd-models`)
      if (!response.ok) throw new Error('Failed to fetch models')
      const data = await response.json()
      setModels(data)
      if (data.length > 0) {
        setSelectedModel(data[0].title)
      }
    } catch (err) {
      console.error(err)
      setError('Could not fetch models. Make sure the API URL is correct and the backend is running.')
    } finally {
      setIsFetchingModels(false)
    }
  }

  const handleGenerate = async () => {
    if (!apiUrl) {
      setError('Please enter the API URL from your Colab notebook.')
      return
    }

    if (!prompt) {
      setError('Please enter a prompt.')
      return
    }

    setIsGenerating(true)
    setError(null)

    // Ensure the URL doesn't have a trailing slash
    const baseUrl = apiUrl.replace(/\/$/, '')
    const endpoint = `${baseUrl}/sdapi/v1/txt2img`

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          negative_prompt: negativePrompt,
          steps: parseInt(steps),
          cfg_scale: parseFloat(cfgScale),
          width: parseInt(width),
          height: parseInt(height),
          sampler_name: "DPM++ 2M Karras",
          override_settings: selectedModel ? { sd_model_checkpoint: selectedModel } : {},
          override_settings_restore_afterwards: false,
          send_images: true,
          save_images: false
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}. Ensure your Colab notebook is running and the URL is correct.`)
      }

      const data = await response.json()
      
      if (data && data.images && data.images.length > 0) {
        // A1111 returns base64 strings
        setGeneratedImage(`data:image/png;base64,${data.images[0]}`)
      } else {
        throw new Error('Received invalid response from the API.')
      }

    } catch (err) {
      console.error(err)
      setError(err.message === 'Failed to fetch' 
        ? 'Network error. Make sure the API URL is correct and the Colab notebook is still running. (CORS must be enabled in Colab)' 
        : err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = `generation-${Date.now()}.png`
      link.click()
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        <Wand2 className="header-icon" />
        <h1>FluxGen UI</h1>
      </header>

      <main className="main-content">
        <aside className="sidebar panel">
          <div className="api-settings">
            <div className="form-group">
              <label>
                <Settings size={16} />
                Colab Backend URL
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  className="form-control api-url-input" 
                  placeholder="https://xxxx.gradio.live"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                />
                <button 
                  onClick={fetchModels} 
                  disabled={isFetchingModels || !apiUrl}
                  style={{ padding: '0 15px', borderRadius: '8px', cursor: 'pointer', background: 'var(--primary-color)', color: 'white', border: 'none', display: 'flex', alignItems: 'center' }}
                >
                  {isFetchingModels ? <Loader2 size={16} className="spin" /> : 'Connect'}
                </button>
              </div>
              <small style={{color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '4px'}}>
                Run your colab notebook and paste the public Gradio URL here, then click Connect.
              </small>
            </div>
            {models.length > 0 && (
              <div className="form-group" style={{ marginTop: '15px' }}>
                <label>Select AI Model</label>
                <select 
                  className="form-control" 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={{ padding: '10px', width: '100%' }}
                >
                  {models.map(m => (
                    <option key={m.title} value={m.title}>{m.model_name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Prompt</label>
            <textarea 
              className="form-control" 
              placeholder="Describe what you want to see..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Negative Prompt</label>
            <textarea 
              className="form-control" 
              placeholder="What to exclude..."
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Steps: {steps}</label>
              <input 
                type="range" 
                min="10" 
                max="50" 
                value={steps} 
                onChange={(e) => setSteps(e.target.value)} 
              />
            </div>
            
            <div className="form-group">
              <label>CFG Scale: {cfgScale}</label>
              <input 
                type="range" 
                min="1" 
                max="20" 
                step="0.5"
                value={cfgScale} 
                onChange={(e) => setCfgScale(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Width</label>
              <select className="form-control" value={width} onChange={(e) => setWidth(e.target.value)}>
                <option value="512">512</option>
                <option value="768">768</option>
                <option value="1024">1024</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Height</label>
              <select className="form-control" value={height} onChange={(e) => setHeight(e.target.value)}>
                <option value="512">512</option>
                <option value="768">768</option>
                <option value="1024">1024</option>
              </select>
            </div>
          </div>

          <button 
            className="generate-btn" 
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="btn-icon spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="btn-icon" />
                Generate Image
              </>
            )}
          </button>

          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              <span>{error}</span>
            </div>
          )}
        </aside>

        <section className="image-area panel">
          <div className={`image-container ${generatedImage ? 'has-image' : ''}`}>
            {!generatedImage && !isGenerating && (
              <div className="placeholder">
                <ImageIcon className="placeholder-icon" />
                <p>Your generation will appear here.</p>
              </div>
            )}

            {isGenerating && (
              <div className="placeholder">
                <Loader2 className="placeholder-icon spin" style={{ opacity: 1, color: 'var(--primary-color)' }} />
                <p>Dreaming up your image...</p>
              </div>
            )}

            {generatedImage && !isGenerating && (
              <>
                <img src={generatedImage} alt="Generated" className="generated-image" />
                <button className="download-btn" onClick={handleDownload} title="Download Image">
                  <Download size={16} /> Download
                </button>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
