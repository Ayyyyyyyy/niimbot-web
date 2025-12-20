import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Bot, Send, Loader2, Sparkles, StopCircle } from 'lucide-react';
import { getLLMSettings, generateLabelDesign } from '../services/llmService';
import { AIDebugLog } from './AIDebugLog';

/**
 * AI Assistant Modal - simplified, settings-free label generation
 */
export function AIAssistant({ isOpen, onClose, onApplyLabel, labelWidth = 50, labelHeight = 15 }) {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [generatedLabel, setGeneratedLabel] = useState(null);
    const [history, setHistory] = useState([]);
    const [settings, setSettings] = useState(getLLMSettings());
    const [debugLogs, setDebugLogs] = useState([]);

    // AbortController for cancelling requests
    const abortControllerRef = useRef(null);

    // Reload settings when modal opens
    useEffect(() => {
        if (isOpen) {
            setSettings(getLLMSettings());
        }
    }, [isOpen]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Cancel generation
    const handleCancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsGenerating(false);
        setHistory(prev => [...prev, { role: 'system', content: 'Generation cancelled by user.' }]);
    }, []);

    // Generate label from prompt
    const handleGenerate = useCallback(async (promptOverride = null) => {
        // Allow passing a string directly (from Surprise Me) or use state
        const textToUse = typeof promptOverride === 'string' ? promptOverride : prompt;

        if (!textToUse.trim()) return;

        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();

        setIsGenerating(true);
        setError(null);
        setGeneratedLabel(null);

        // Add to history
        setHistory(prev => [...prev, { role: 'user', content: textToUse }]);

        try {
            const result = await generateLabelDesign(textToUse, abortControllerRef.current.signal, { width: labelWidth, height: labelHeight });

            // Extract and store the debug log
            if (result.log) {
                setDebugLogs(prev => [...prev, result.log]);
            }

            // Remove log from the label result before storing
            const { log, ...labelData } = result;
            setGeneratedLabel(labelData);
            setHistory(prev => [...prev, { role: 'assistant', content: JSON.stringify(labelData, null, 2) }]);
            if (!promptOverride) setPrompt(''); // Clear input only if manual
        } catch (err) {
            // Don't show error if it was cancelled
            if (err.name === 'AbortError') {
                return;
            }
            // Capture error log if available
            if (err.log) {
                setDebugLogs(prev => [...prev, err.log]);
            }
            setError(err.message);
            setHistory(prev => [...prev, { role: 'error', content: err.message }]);
        } finally {
            setIsGenerating(false);
            abortControllerRef.current = null;
        }
    }, [prompt, labelWidth, labelHeight]);

    // Apply generated label
    const handleApply = useCallback(() => {
        if (generatedLabel) {
            onApplyLabel(generatedLabel);
            onClose();
        }
    }, [generatedLabel, onApplyLabel, onClose]);

    // Surprise Me Logic
    const handleSurprise = useCallback(() => {
        handleGenerate("Surprise me! Generate a creative, random label design using one of your themes. Be unique.");
    }, [handleGenerate]);

    // Check if AI is configured
    const isConfigured = settings.provider === 'ollama'
        ? !!settings.ollamaModel
        : !!settings.geminiApiKey;

    const providerName = settings.provider === 'ollama'
        ? `Ollama (${settings.ollamaModel || 'not configured'})`
        : `Gemini (${settings.geminiModel || 'not configured'})`;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-panel-bg rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles size={20} className="text-yellow-400" />
                        AI Label Architect
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Not Configured Warning */}
                {!isConfigured && (
                    <div className="p-4 bg-yellow-500/10 border-b border-yellow-500/20">
                        <div className="text-yellow-400 text-sm flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                            Please configure LLM settings to start designing.
                        </div>
                    </div>
                )}

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {history.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10">
                                <Bot size={40} className="text-purple-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">What shall we create?</h3>
                            <p className="text-gray-400 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                                "Design a 10mg Retatrutide vial label"<br />
                                "Make a hazard warning label for 100mg Caffeine"<br />
                                "Create a premium gold-styled label for my peptide"
                            </p>

                            {!isGenerating && isConfigured && (
                                <button
                                    onClick={handleSurprise}
                                    className="px-6 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-full text-purple-300 text-sm flex items-center gap-2 transition-all"
                                >
                                    <Sparkles size={14} />
                                    I'm feeling lucky
                                </button>
                            )}
                        </div>
                    )}

                    {history.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user'
                                        ? 'bg-highlight text-white rounded-br-none'
                                        : msg.role === 'error'
                                            ? 'bg-red-900/50 border border-red-500/30 text-red-200'
                                            : msg.role === 'assistant'
                                                ? 'bg-gray-800 border border-gray-700 text-gray-200 font-mono text-xs rounded-bl-none overflow-x-auto'
                                                : 'bg-gray-800 text-yellow-500 text-xs font-mono'
                                    }`}
                            >
                                {msg.role === 'user' ? (
                                    <div className="text-sm">{msg.content}</div>
                                ) : msg.role === 'assistant' ? (
                                    <>
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700/50 opacity-50">
                                            <Bot size={12} />
                                            Generated JSON Layout
                                        </div>
                                        <pre className="whitespace-pre-wrap">{msg.content}</pre>
                                    </>
                                ) : (
                                    <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isGenerating && (
                        <div className="flex justify-start">
                            <div className="bg-gray-800 rounded-2xl p-4 flex items-center gap-4 rounded-bl-none">
                                <Loader2 size={20} className="animate-spin text-blue-400" />
                                <div className="space-y-1">
                                    <div className="text-sm text-gray-300 font-medium">Architecting Label...</div>
                                    <div className="text-xs text-gray-500">Analyzing dimensions & applying themes</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Generated Label Preview & Apply */}
                {generatedLabel && (
                    <div className="px-6 py-4 bg-green-500/5 border-t border-green-500/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                <Sparkles size={14} />
                            </div>
                            <div className="text-sm text-green-300">
                                <span className="font-bold">Design Ready:</span> {generatedLabel.labelSize?.width}×{generatedLabel.labelSize?.height}mm
                            </div>
                        </div>
                        <button
                            onClick={handleApply}
                            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-full text-sm font-bold shadow-lg shadow-green-900/20 transition-all hover:scale-105 active:scale-95"
                        >
                            Inject Layout
                        </button>
                    </div>
                )}

                {/* Error Display */}
                {error && !history.find(h => h.role === 'error' && h.content === error) && (
                    <div className="px-6 py-3 bg-red-900/20 border-t border-red-500/20 text-red-300 text-sm flex items-center gap-2">
                        <StopCircle size={14} />
                        {error}
                    </div>
                )}

                {/* Footer Input Area */}
                <div className="p-6 pt-2 bg-gradient-to-t from-panel-bg to-transparent">
                    <div className={`
                        flex items-center gap-2 p-2 rounded-full border transition-all duration-300
                        ${isGenerating ? 'bg-gray-800/50 border-transparent opacity-50' : 'bg-black/30 border-white/10 hover:border-white/20 hover:bg-black/40 shadow-lg'}
                    `}>
                        {/* Surprise Me integrated button */}
                        <button
                            onClick={handleSurprise}
                            disabled={isGenerating || !isConfigured}
                            className="p-3 rounded-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
                            title="Surprise Me (Auto-Generate)"
                        >
                            <Sparkles size={20} />
                        </button>

                        <div className="h-6 w-px bg-white/10 mx-1" />

                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !isGenerating && handleGenerate()}
                            placeholder="Describe your perfect label..."
                            className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-gray-500/80 px-2"
                            disabled={isGenerating || !isConfigured}
                            autoFocus
                        />

                        {isGenerating ? (
                            <button
                                onClick={handleCancel}
                                className="p-1 pr-4 pl-3 rounded-full text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors"
                            >
                                <div className="p-1.5 bg-red-500/20 rounded-full">
                                    <StopCircle size={14} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Stop</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => handleGenerate()}
                                disabled={!prompt.trim() || !isConfigured}
                                className={`
                                    p-2 pr-4 pl-2 rounded-full flex items-center gap-2 transition-all
                                    ${!prompt.trim() ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 bg-highlight text-white hover:brightness-110 shadow-lg'}
                                `}
                            >
                                <div className="p-1.5 bg-white/20 rounded-full">
                                    <Send size={14} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Generate</span>
                            </button>
                        )}
                    </div>

                    <div className="text-center mt-3">
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold">
                            Powered by {providerName}
                        </p>
                    </div>
                </div>

                <AIDebugLog logs={debugLogs} />
            </div>
        </div>
    );
}
