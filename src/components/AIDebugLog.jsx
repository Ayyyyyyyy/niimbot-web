import { useState } from 'react';
import { ChevronDown, ChevronUp, Terminal, Copy, Check } from 'lucide-react';

/**
 * Collapsible debug log viewer for AI requests/responses
 */
export function AIDebugLog({ logs }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);

    if (!logs || logs.length === 0) return null;

    const handleCopy = async (text, index) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="border-t border-gray-700">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-2 flex items-center justify-between text-gray-400 hover:bg-gray-700/30 transition-colors"
            >
                <div className="flex items-center gap-2 text-sm">
                    <Terminal size={14} />
                    <span>Debug Logs ({logs.length})</span>
                </div>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isExpanded && (
                <div className="max-h-64 overflow-y-auto bg-gray-900/50">
                    {logs.map((log, index) => (
                        <div key={index} className="border-b border-gray-800 last:border-b-0">
                            {/* Request Section */}
                            <div className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-blue-400">
                                        REQUEST ({log.timestamp})
                                    </span>
                                    <button
                                        onClick={() => handleCopy(log.request, `req-${index}`)}
                                        className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-gray-300"
                                        title="Copy request"
                                    >
                                        {copiedIndex === `req-${index}` ? (
                                            <Check size={12} className="text-green-400" />
                                        ) : (
                                            <Copy size={12} />
                                        )}
                                    </button>
                                </div>
                                <pre className="text-xs text-gray-300 whitespace-pre-wrap break-all bg-gray-800/50 p-2 rounded max-h-32 overflow-y-auto">
                                    {log.request}
                                </pre>
                            </div>

                            {/* Response Section */}
                            {log.response && (
                                <div className="p-3 pt-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-green-400">
                                            RESPONSE ({log.duration}ms)
                                        </span>
                                        <button
                                            onClick={() => handleCopy(log.response, `res-${index}`)}
                                            className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-gray-300"
                                            title="Copy response"
                                        >
                                            {copiedIndex === `res-${index}` ? (
                                                <Check size={12} className="text-green-400" />
                                            ) : (
                                                <Copy size={12} />
                                            )}
                                        </button>
                                    </div>
                                    <pre className="text-xs text-gray-300 whitespace-pre-wrap break-all bg-gray-800/50 p-2 rounded max-h-32 overflow-y-auto">
                                        {log.response}
                                    </pre>
                                </div>
                            )}

                            {/* Error Section */}
                            {log.error && (
                                <div className="p-3 pt-0">
                                    <div className="text-xs font-medium text-red-400 mb-2">
                                        ERROR
                                    </div>
                                    <pre className="text-xs text-red-300 whitespace-pre-wrap break-all bg-red-900/20 p-2 rounded">
                                        {log.error}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
