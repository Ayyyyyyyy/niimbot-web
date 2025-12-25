import {
  Check,
  Key,
  Loader2,
  RefreshCw,
  Save,
  Server,
  Settings as SettingsIcon,
  Sparkles,
  Printer,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  discoverGeminiModels,
  discoverOllamaModels,
  getLLMSettings,
  saveLLMSettings,
} from '../services/llmService'

/**
 * Global Settings Modal - AI configuration
 */
export function SettingsModal({ isOpen, onClose }) {
  // Local state for form (not auto-saved)
  const [formData, setFormData] = useState(getLLMSettings())
  const [ollamaModels, setOllamaModels] = useState([])
  const [geminiModels, setGeminiModels] = useState([])
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [discoveryStatus, setDiscoveryStatus] = useState(null)
  const [isSaved, setIsSaved] = useState(false)

  // Load settings on open
  useEffect(() => {
    if (isOpen) {
      setFormData(getLLMSettings())
      setIsSaved(false)
      setDiscoveryStatus(null)
    }
  }, [isOpen])

  // Discover Ollama models
  const handleDiscoverOllama = useCallback(async () => {
    setIsDiscovering(true)
    setDiscoveryStatus(null)
    try {
      const models = await discoverOllamaModels(formData.ollamaHost)
      setOllamaModels(models)
      setDiscoveryStatus({ success: true, message: `Found ${models.length} Ollama models` })

      // Auto-select first model if none selected
      if (!formData.ollamaModel && models.length > 0) {
        setFormData((prev) => ({ ...prev, ollamaModel: models[0].name }))
      }
    } catch (err) {
      setDiscoveryStatus({ success: false, message: err.message })
    }
    setIsDiscovering(false)
  }, [formData.ollamaHost, formData.ollamaModel])

  // Discover Gemini models
  const handleDiscoverGemini = useCallback(async () => {
    if (!formData.geminiApiKey) {
      setDiscoveryStatus({ success: false, message: 'Please enter your API key first' })
      return
    }
    setIsDiscovering(true)
    setDiscoveryStatus(null)
    try {
      const models = await discoverGeminiModels(formData.geminiApiKey)
      setGeminiModels(models)
      setDiscoveryStatus({ success: true, message: `Found ${models.length} Gemini models` })

      // Auto-select first model if current is invalid
      if (models.length > 0 && !models.find((m) => m.name === formData.geminiModel)) {
        setFormData((prev) => ({ ...prev, geminiModel: models[0].name }))
      }
    } catch (err) {
      setDiscoveryStatus({ success: false, message: err.message })
    }
    setIsDiscovering(false)
  }, [formData.geminiApiKey, formData.geminiModel])

  // Save settings
  const handleSave = useCallback(() => {
    saveLLMSettings(formData)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }, [formData])

  // Update form field
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsSaved(false)
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4'>
      <div className='bg-panel-bg rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-700'>
          <h2 className='text-xl font-bold text-white flex items-center gap-2'>
            <SettingsIcon size={24} />
            Settings
          </h2>
          <button onClick={onClose} className='p-2 hover:bg-gray-700 rounded-lg'>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6 space-y-6'>
          {/* Printer Settings Section */}
          <section>
            <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
              <Printer size={20} className='text-cyan-400' />
              Printer Configuration
            </h3>

            <div className='bg-gray-800/50 rounded-lg p-4 space-y-4'>
              {/* Print Direction */}
              <div>
                <label className='text-sm font-medium text-gray-300 block mb-2'>Print Direction</label>
                <div className='flex gap-3'>
                  <button
                    onClick={() => updateField('printDirection', 'left')}
                    className={`flex-1 p-3 rounded-lg border transition-all ${formData.printDirection === 'left'
                      ? 'bg-cyan-600 border-cyan-400 text-white'
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      }`}
                  >
                    <div className='text-sm font-medium'>Left</div>
                    <div className='text-xs opacity-70'>Standard (Landscape)</div>
                  </button>
                  <button
                    onClick={() => updateField('printDirection', 'top')}
                    className={`flex-1 p-3 rounded-lg border transition-all ${formData.printDirection === 'top'
                      ? 'bg-cyan-600 border-cyan-400 text-white'
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      }`}
                  >
                    <div className='text-sm font-medium'>Top</div>
                    <div className='text-xs opacity-70'>Portrait / Alternate</div>
                  </button>
                </div>
              </div>

              {/* Print Offsets */}
              <div>
                <label className='text-sm font-medium text-gray-300 block mb-2'>Print Alignment Adjustment</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className='text-xs text-gray-400 block mb-1'>X Offset (mm)</label>
                    <input
                      type="number"
                      value={formData.printOffsetX || 0}
                      onChange={(e) => updateField('printOffsetX', parseFloat(e.target.value) || 0)}
                      className='w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none'
                    />
                  </div>
                  <div>
                    <label className='text-xs text-gray-400 block mb-1'>Y Offset (mm)</label>
                    <input
                      type="number"
                      value={formData.printOffsetY || 0}
                      onChange={(e) => updateField('printOffsetY', parseFloat(e.target.value) || 0)}
                      className='w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none'
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Adjust values if print is off-center (Negative values move Left/Up)</p>
              </div>
            </div>
          </section>

          <div className="h-px bg-gray-700 my-2" />

          {/* AI Provider Section */}
          <section>
            <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
              <Sparkles size={20} className='text-yellow-400' />
              AI Label Assistant
            </h3>

            {/* Provider Selection */}
            <div className='mb-4'>
              <label className='text-sm font-medium text-gray-300 block mb-2'>LLM Provider</label>
              <div className='flex gap-3'>
                <button
                  onClick={() => updateField('provider', 'ollama')}
                  className={`flex-1 p-3 rounded-lg border transition-all ${formData.provider === 'ollama'
                    ? 'bg-highlight border-highlight text-white'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    }`}
                >
                  <Server size={20} className='mx-auto mb-1' />
                  <div className='text-sm font-medium'>Ollama (Local)</div>
                  <div className='text-xs opacity-70'>Free, private, runs locally</div>
                </button>
                <button
                  onClick={() => updateField('provider', 'gemini')}
                  className={`flex-1 p-3 rounded-lg border transition-all ${formData.provider === 'gemini'
                    ? 'bg-highlight border-highlight text-white'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    }`}
                >
                  <Sparkles size={20} className='mx-auto mb-1' />
                  <div className='text-sm font-medium'>Google Gemini</div>
                  <div className='text-xs opacity-70'>Cloud API, requires key</div>
                </button>
              </div>
            </div>

            {/* Ollama Settings */}
            {formData.provider === 'ollama' && (
              <div className='space-y-4 p-4 bg-gray-800/50 rounded-lg'>
                <h4 className='text-sm font-medium text-gray-300 flex items-center gap-2'>
                  <Server size={16} />
                  Ollama Configuration
                </h4>

                <div>
                  <label className='text-xs text-gray-400 block mb-1'>Host URL</label>
                  <div className='flex gap-2'>
                    <input
                      type='text'
                      value={formData.ollamaHost}
                      onChange={(e) => updateField('ollamaHost', e.target.value)}
                      placeholder='http://localhost:11434'
                      className='flex-1 px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-highlight focus:outline-none'
                    />
                    <button
                      onClick={handleDiscoverOllama}
                      disabled={isDiscovering}
                      className='px-4 py-2 bg-highlight hover:bg-highlight/80 disabled:opacity-50 rounded-lg flex items-center gap-2'
                    >
                      {isDiscovering ? (
                        <Loader2 size={16} className='animate-spin' />
                      ) : (
                        <RefreshCw size={16} />
                      )}
                      Discover
                    </button>
                  </div>
                </div>

                <div>
                  <label className='text-xs text-gray-400 block mb-1'>Model</label>
                  <select
                    value={formData.ollamaModel}
                    onChange={(e) => updateField('ollamaModel', e.target.value)}
                    className='w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-highlight focus:outline-none'
                  >
                    <option value=''>Select a model...</option>
                    {ollamaModels.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} ({(m.size / 1e9).toFixed(1)}GB)
                      </option>
                    ))}
                  </select>
                  {ollamaModels.length === 0 && (
                    <p className='text-xs text-gray-500 mt-1'>
                      Click Discover to find available models
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Gemini Settings */}
            {formData.provider === 'gemini' && (
              <div className='space-y-4 p-4 bg-gray-800/50 rounded-lg'>
                <h4 className='text-sm font-medium text-gray-300 flex items-center gap-2'>
                  <Key size={16} />
                  Gemini Configuration
                </h4>

                <div>
                  <label className='text-xs text-gray-400 block mb-1'>API Key</label>
                  <div className='flex gap-2'>
                    <input
                      type='password'
                      value={formData.geminiApiKey}
                      onChange={(e) => updateField('geminiApiKey', e.target.value)}
                      placeholder='Enter your Gemini API key'
                      className='flex-1 px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-highlight focus:outline-none'
                    />
                    <button
                      onClick={handleDiscoverGemini}
                      disabled={isDiscovering || !formData.geminiApiKey}
                      className='px-4 py-2 bg-highlight hover:bg-highlight/80 disabled:opacity-50 rounded-lg flex items-center gap-2'
                    >
                      {isDiscovering ? (
                        <Loader2 size={16} className='animate-spin' />
                      ) : (
                        <RefreshCw size={16} />
                      )}
                      Discover
                    </button>
                  </div>
                  <p className='text-xs text-gray-500 mt-1'>
                    Get your API key from{' '}
                    <a
                      href='https://aistudio.google.com/apikey'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-highlight hover:underline'
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>

                <div>
                  <label className='text-xs text-gray-400 block mb-1'>Model</label>
                  <select
                    value={formData.geminiModel}
                    onChange={(e) => updateField('geminiModel', e.target.value)}
                    className='w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-highlight focus:outline-none'
                  >
                    {geminiModels.length > 0 ? (
                      geminiModels.map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.displayName || m.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value=''>Click Discover to find models...</option>
                        <option value='gemini-1.5-flash'>Gemini 1.5 Flash (Fast)</option>
                        <option value='gemini-1.5-pro'>Gemini 1.5 Pro (Advanced)</option>
                        <option value='gemini-2.0-flash-exp'>
                          Gemini 2.0 Flash (Experimental)
                        </option>
                      </>
                    )}
                  </select>
                  {geminiModels.length > 0 && (
                    <p className='text-xs text-gray-500 mt-1'>
                      {geminiModels.length} models available
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Discovery Status */}
            {discoveryStatus && (
              <div
                className={`mt-4 text-sm p-3 rounded-lg ${discoveryStatus.success
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
                  }`}
              >
                {discoveryStatus.message}
              </div>
            )}
          </section>
        </div>

        {/* Footer with Save */}
        <div className='p-4 border-t border-gray-700 flex items-center justify-between'>
          <p className='text-xs text-gray-500'>Settings are stored locally in your browser</p>
          <div className='flex items-center gap-3'>
            <button type='button'
              onClick={onClose}
              className='px-4 py-2 text-gray-400 hover:text-white transition-colors'
            >
              Cancel
            </button>
            <button type='button'
              onClick={handleSave}
              className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${isSaved
                ? 'bg-green-600 text-white'
                : 'bg-highlight hover:bg-highlight/80 text-white'
                }`}
            >
              {isSaved ? <Check size={18} /> : <Save size={18} />}
              {isSaved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
