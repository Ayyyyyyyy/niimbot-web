/**
 * LLM Service - Supports Ollama (local) and Gemini API
 */

const DEFAULT_OLLAMA_HOST = 'http://localhost:11434';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * System prompt for label generation
 */
const LABEL_SYSTEM_PROMPT = `You are a label designer assistant for thermal label printers. When the user describes a label they want to create, you generate a JSON structure that defines the label elements.

IMPORTANT: Respond ONLY with valid JSON, no markdown, no explanations.

The JSON structure should be:
{
  "labelSize": { "width": 50, "height": 15 },
  "objects": [
    { "type": "text", "text": "content", "left": 10, "top": 5, "fontSize": 12, "fontWeight": "bold" },
    { "type": "text", "text": "content", "left": 10, "top": 20, "fontSize": 10 }
  ]
}

Object types available:
- text: { type: "text", text: "string", left: number, top: number, fontSize: number, fontWeight?: "bold", fontStyle?: "italic", textAlign?: "left"|"center"|"right" }
- rect: { type: "rect", left: number, top: number, width: number, height: number, stroke: "#000000", strokeWidth: 2 }
- line: { type: "line", left: number, top: number, x1: 0, y1: 0, x2: 100, y2: 0 }

For peptide vial labels:
- Use labelSize { width: 50, height: 15 } for standard vials
- Include: compound name, dosage, vendor code, date, reconstitution info
- Calculate dose units: If reconstituted with X ml BAC water, total_units = X * 100, mg_per_unit = total_mg / total_units
- Format clearly: "10 units = Xmg" or similar

Example peptide label request: "10mg Retatrutide from ABC, created 11/12/25, reconstituted with 2ml BAC water"
Response:
{
  "labelSize": { "width": 50, "height": 15 },
  "objects": [
    { "type": "text", "text": "Retatrutide 10mg", "left": 25, "top": 4, "fontSize": 10, "fontWeight": "bold", "textAlign": "center" },
    { "type": "text", "text": "ABC | 11/12/25", "left": 25, "top": 16, "fontSize": 7, "textAlign": "center" },
    { "type": "text", "text": "2ml BAC | 10u=0.5mg", "left": 25, "top": 28, "fontSize": 6, "textAlign": "center" }
  ]
}

Always calculate the dosing: mg_per_unit = total_mg / (ml_bac_water * 100). Round to reasonable decimals.`;

/**
 * Storage keys
 */
const STORAGE_KEYS = {
    LLM_PROVIDER: 'llmProvider',
    OLLAMA_HOST: 'ollamaHost',
    OLLAMA_MODEL: 'ollamaModel',
    GEMINI_API_KEY: 'geminiApiKey',
    GEMINI_MODEL: 'geminiModel',
};

/**
 * Get stored LLM settings
 */
export function getLLMSettings() {
    return {
        provider: localStorage.getItem(STORAGE_KEYS.LLM_PROVIDER) || 'ollama',
        ollamaHost: localStorage.getItem(STORAGE_KEYS.OLLAMA_HOST) || DEFAULT_OLLAMA_HOST,
        ollamaModel: localStorage.getItem(STORAGE_KEYS.OLLAMA_MODEL) || '',
        geminiApiKey: localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || '',
        geminiModel: localStorage.getItem(STORAGE_KEYS.GEMINI_MODEL) || 'gemini-1.5-flash',
    };
}

/**
 * Save LLM settings
 */
export function saveLLMSettings(settings) {
    if (settings.provider) localStorage.setItem(STORAGE_KEYS.LLM_PROVIDER, settings.provider);
    if (settings.ollamaHost) localStorage.setItem(STORAGE_KEYS.OLLAMA_HOST, settings.ollamaHost);
    if (settings.ollamaModel) localStorage.setItem(STORAGE_KEYS.OLLAMA_MODEL, settings.ollamaModel);
    if (settings.geminiApiKey !== undefined) localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, settings.geminiApiKey);
    if (settings.geminiModel) localStorage.setItem(STORAGE_KEYS.GEMINI_MODEL, settings.geminiModel);
}

/**
 * Discover available Gemini models using ListModels API
 */
export async function discoverGeminiModels(apiKey) {
    if (!apiKey) {
        throw new Error('API key is required to discover models');
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to fetch models');
        }

        const data = await response.json();

        // Filter models that support generateContent
        const models = (data.models || [])
            .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
            .map(m => ({
                name: m.name.replace('models/', ''),
                displayName: m.displayName,
                description: m.description,
                inputTokenLimit: m.inputTokenLimit,
                outputTokenLimit: m.outputTokenLimit,
            }))
            // Sort: flash models first (faster), then by name
            .sort((a, b) => {
                if (a.name.includes('flash') && !b.name.includes('flash')) return -1;
                if (!a.name.includes('flash') && b.name.includes('flash')) return 1;
                return a.name.localeCompare(b.name);
            });

        return models;
    } catch (error) {
        console.error('Gemini discovery error:', error);
        throw new Error(`Failed to discover Gemini models: ${error.message}`);
    }
}

/**
 * Get the Ollama API URL - use proxy to bypass CORS
 * The Vite proxy at /api/ollama forwards to the actual Ollama server
 */
function getOllamaUrl(host) {
    // If running in dev with proxy, use the proxy path
    // The proxy is configured in vite.config.js
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        // When accessing from network, use the proxy
        return '/api/ollama';
    }
    // For localhost or if proxy fails, try direct connection
    return host;
}

/**
 * Discover available Ollama models
 */
export async function discoverOllamaModels(host = DEFAULT_OLLAMA_HOST) {
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';

    // When on HTTPS, we MUST use the proxy - direct HTTP calls are blocked
    if (isSecure) {
        try {
            const response = await fetch('/api/ollama/tags');
            if (response.ok) {
                const data = await response.json();
                return data.models || [];
            }
            const text = await response.text();
            throw new Error(`Proxy error (${response.status}): ${text || response.statusText}`);
        } catch (error) {
            console.error('Ollama discovery error:', error);
            throw new Error(`Cannot connect to Ollama via proxy. Make sure Ollama is running on the server and the Vite proxy is configured correctly.`);
        }
    }

    // On HTTP, try direct connection
    try {
        const response = await fetch(`${host}/api/tags`);
        if (!response.ok) throw new Error('Failed to fetch models');
        const data = await response.json();
        return data.models || [];
    } catch (error) {
        console.error('Ollama discovery error:', error);
        throw new Error(`Cannot connect to Ollama at ${host}. Make sure Ollama is running.`);
    }
}

/**
 * Generate label design using Ollama
 */
async function generateWithOllama(prompt, host, model) {
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';

    const body = JSON.stringify({
        model: model,
        prompt: `${LABEL_SYSTEM_PROMPT}\n\nUser request: ${prompt}`,
        stream: false,
        options: {
            temperature: 0.3,
        },
    });

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
    };

    // When on HTTPS, we MUST use the proxy - direct HTTP calls are blocked
    if (isSecure) {
        try {
            const response = await fetch('/api/ollama/generate', options);
            if (response.ok) {
                const data = await response.json();
                return data.response;
            }
            const text = await response.text();
            throw new Error(`Ollama error (${response.status}): ${text || response.statusText}`);
        } catch (error) {
            console.error('Ollama generate error:', error);
            throw new Error(`Failed to generate with Ollama: ${error.message}`);
        }
    }

    // On HTTP, use direct connection
    const response = await fetch(`${host}/api/generate`, options);

    if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
}

/**
 * Generate label design using Gemini API
 */
async function generateWithGemini(prompt, apiKey, model = 'gemini-1.5-flash') {
    const response = await fetch(
        `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${LABEL_SYSTEM_PROMPT}\n\nUser request: ${prompt}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 1024,
                },
            }),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Parse LLM response into label structure
 */
function parseResponse(response) {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response.trim();

    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    try {
        const parsed = JSON.parse(jsonStr);

        // Validate structure
        if (!parsed.objects || !Array.isArray(parsed.objects)) {
            throw new Error('Invalid response: missing objects array');
        }

        return parsed;
    } catch (error) {
        console.error('Failed to parse LLM response:', response);
        throw new Error('Failed to parse AI response. Please try again with a clearer description.');
    }
}

/**
 * Generate a label design from natural language
 */
export async function generateLabelDesign(prompt) {
    const settings = getLLMSettings();

    let response;

    if (settings.provider === 'ollama') {
        if (!settings.ollamaModel) {
            throw new Error('No Ollama model selected. Please configure in settings.');
        }
        response = await generateWithOllama(prompt, settings.ollamaHost, settings.ollamaModel);
    } else if (settings.provider === 'gemini') {
        if (!settings.geminiApiKey) {
            throw new Error('Gemini API key not configured. Please add it in settings.');
        }
        response = await generateWithGemini(prompt, settings.geminiApiKey, settings.geminiModel);
    } else {
        throw new Error('Invalid LLM provider');
    }

    return parseResponse(response);
}

/**
 * Test connection to LLM provider
 */
export async function testConnection(provider, settings) {
    if (provider === 'ollama') {
        const models = await discoverOllamaModels(settings.ollamaHost);
        return { success: true, models };
    } else if (provider === 'gemini') {
        // Simple test - list models
        const response = await fetch(
            `${GEMINI_API_URL}?key=${settings.geminiApiKey}`
        );
        if (!response.ok) throw new Error('Invalid API key');
        return { success: true };
    }
    throw new Error('Unknown provider');
}
