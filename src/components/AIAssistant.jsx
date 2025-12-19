import { useState, useEffect, useCallback } from 'react';
import { X, Bot, Send, Loader2, Sparkles } from 'lucide-react';
import { getLLMSettings, generateLabelDesign } from '../services/llmService';

/**
 * AI Assistant Modal - simplified, settings-free label generation
 */
export function AIAssistant({ isOpen, onClose, onApplyLabel }) {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [generatedLabel, setGeneratedLabel] = useState(null);
    const [history, setHistory] = useState([]);
    const [settings, setSettings] = useState(getLLMSettings());

    // Reload settings when modal opens
    useEffect(() => {
        if (isOpen) {
            setSettings(getLLMSettings());
        }
    }, [isOpen]);

    // Generate label from prompt
    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setError(null);
        setGeneratedLabel(null);

        // Add to history
        setHistory(prev => [...prev, { role: 'user', content: prompt }]);

        try {
            const result = await generateLabelDesign(prompt);
            setGeneratedLabel(result);
            setHistory(prev => [...prev, { role: 'assistant', content: JSON.stringify(result, null, 2) }]);
            setPrompt(''); // Clear input on success
        } catch (err) {
            setError(err.message);
            setHistory(prev => [...prev, { role: 'error', content: err.message }]);
        }

        setIsGenerating(false);
    }, [prompt]);

    // Apply generated label
    const handleApply = useCallback(() => {
        if (generatedLabel) {
            onApplyLabel(generatedLabel);
            onClose();
        }
    }, [generatedLabel, onApplyLabel, onClose]);

    // Check if AI is configured
    const isConfigured = settings.provider === 'ollama'
        ? !!settings.ollamaModel
        : !!settings.geminiApiKey;

    const providerName = settings.provider === 'ollama'
        ? `Ollama (${settings.ollamaModel || 'not configured'})`
        : `Gemini (${settings.geminiModel || 'not configured'})`;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-panel-bg rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles size={24} className="text-yellow-400" />
                        AI Label Assistant
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {/* Not Configured Warning */}
                {!isConfigured && (
                    <div className="p-4 bg-yellow-500/10 border-b border-yellow-500/20">
                        <div className="flex items-center justify-between">
                            <div className="text-yellow-400 text-sm">
                                <strong>AI not configured.</strong> Please set up your LLM provider in Settings.
                            </div>
                            <button
                                onClick={() => { onClose(); onOpenSettings?.(); }}
                                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-medium rounded-lg"
                            >
                                Open Settings
                            </button>
                        </div>
                    </div>
                )}

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {history.length === 0 && (
                        <div className="text-center text-gray-400 py-8">
                            <Bot size={48} className="mx-auto mb-3 opacity-50" />
                            <p className="text-lg font-medium mb-2">Describe your label</p>
                            <p className="text-sm mb-4">Example: "10mg vial of Retatrutide from ABC, created 11/12/25, reconstituted with 2ml BAC water"</p>
                            <div className="text-xs text-gray-500">
                                The AI will calculate dosing automatically (mg per unit based on BAC water amount)
                            </div>
                        </div>
                    )}

                    {history.map((msg, i) => (
                        <div
                            key={i}
                            className={`p-3 rounded-lg ${msg.role === 'user'
                                ? 'bg-highlight/20 ml-8'
                                : msg.role === 'error'
                                    ? 'bg-red-500/20 mr-8'
                                    : 'bg-gray-700/50 mr-8'
                                }`}
                        >
                            <div className="text-xs text-gray-400 mb-1">
                                {msg.role === 'user' ? 'You' : msg.role === 'error' ? 'Error' : 'AI'}
                            </div>
                            <div className="text-sm whitespace-pre-wrap">
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {isGenerating && (
                        <div className="flex items-center gap-2 text-gray-400 p-3">
                            <Loader2 size={16} className="animate-spin" />
                            Generating label design...
                        </div>
                    )}
                </div>

                {/* Generated Label Preview & Apply */}
                {generatedLabel && (
                    <div className="p-4 border-t border-gray-700 bg-green-500/10">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-green-400">
                                ✓ Label generated: {generatedLabel.labelSize?.width}×{generatedLabel.labelSize?.height}mm with {generatedLabel.objects?.length} elements
                            </div>
                            <button
                                onClick={handleApply}
                                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium"
                            >
                                Apply to Canvas
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && !history.find(h => h.role === 'error' && h.content === error) && (
                    <div className="p-4 border-t border-gray-700 bg-red-500/10 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-gray-700">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
                            placeholder="Describe the label you want to create..."
                            className="flex-1 px-4 py-3 bg-canvas-bg rounded-lg border border-gray-600 focus:border-highlight focus:outline-none"
                            disabled={isGenerating || !isConfigured}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt.trim() || !isConfigured}
                            className="px-6 py-3 bg-highlight hover:bg-highlight/80 disabled:opacity-50 rounded-lg flex items-center gap-2"
                        >
                            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            Generate
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Provider: {providerName}
                    </p>
                </div>
            </div>
        </div>
    );
}
