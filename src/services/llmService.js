/**
 * LLM Service - Supports Ollama (local) and Gemini API
 */

const DEFAULT_OLLAMA_HOST = 'http://localhost:11434';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Generate system prompt for label generation based on actual label size
 */
function getLabelSystemPrompt(labelSize = { width: 50, height: 15 }) {
    const { width, height } = labelSize;
    const centerX = Math.round(width / 2);

    // Calculate appropriate top positions based on height
    const line1Top = Math.round(height * 0.2);  // ~20% from top
    const line2Top = Math.round(height * 0.5);  // ~50% from top (middle)
    const line3Top = Math.round(height * 0.8);  // ~80% from top

    return `You are a label designer assistant for thermal label printers. When the user describes a label they want to create, you generate a JSON structure that defines the label elements.

IMPORTANT RULES:
1. Respond ONLY with valid JSON, no markdown, no explanations.
2. ALL OBJECT POSITIONS MUST FIT WITHIN THE LABEL DIMENSIONS.
3. For text objects: "top" is the Y position of the text baseline. Text with fontSize 10 is approximately 3mm tall.
4. Ensure adequate spacing between text lines (at least 4-5mm for readability).

CURRENT LABEL SIZE: ${width}mm wide × ${height}mm tall

The JSON structure should be:
{
  "labelSize": { "width": ${width}, "height": ${height} },
  "objects": [
    { "type": "text", "text": "content", "left": ${centerX}, "top": ${line1Top}, "fontSize": 10, "fontWeight": "bold", "textAlign": "center" },
    { "type": "text", "text": "content", "left": ${centerX}, "top": ${line2Top}, "fontSize": 8, "textAlign": "center" },
    { "type": "text", "text": "content", "left": ${centerX}, "top": ${line3Top}, "fontSize": 6, "textAlign": "center" }
  ]
}

CRITICAL POSITIONING CONSTRAINTS:
- For this label with height=${height}mm, valid "top" values range from 0 to ${height}. Text should not exceed these bounds.
- Distribute text evenly across the label height. For 3 lines on a ${height}mm label: use top values like ${line1Top}, ${line2Top}, ${line3Top}.
- Use smaller font sizes (6-8) for secondary info, larger (10-12) for primary info.
- "left" should be set to ${centerX} (half the width) when using textAlign: "center".

Object types available:
- text: { type: "text", text: "string", left: number, top: number, fontSize: number, fontWeight?: "bold", fontStyle?: "italic", textAlign?: "left"|"center"|"right" }
- rect: { type: "rect", left: number, top: number, width: number, height: number, stroke: "#000000", strokeWidth: 2 }
- line: { type: "line", left: number, top: number, x1: 0, y1: 0, x2: 100, y2: 0 }

For peptide vial labels:
- Line 1 (top: ${line1Top}): Compound name and total dosage, fontSize: 10, bold
- Line 2 (top: ${line2Top}): Vendor code and date, fontSize: 7
- Line 3 (top: ${line3Top}): Reconstitution info and dose per unit, fontSize: 6
- Calculate dose units: If reconstituted with X ml BAC water, total_units = X * 100, mg_per_unit = total_mg / total_units

Example peptide label request: "10mg Retatrutide from ABC, created 11/12/25, reconstituted with 2ml BAC water"
Response:
{
  "labelSize": { "width": ${width}, "height": ${height} },
  "objects": [
    { "type": "text", "text": "Retatrutide 10mg", "left": ${centerX}, "top": ${line1Top}, "fontSize": 10, "fontWeight": "bold", "textAlign": "center" },
    { "type": "text", "text": "ABC | 11/12/25", "left": ${centerX}, "top": ${line2Top}, "fontSize": 7, "textAlign": "center" },
    { "type": "text", "text": "2ml BAC | 10u=0.05mg", "left": ${centerX}, "top": ${line3Top}, "fontSize": 6, "textAlign": "center" }
  ]
}

Always calculate the dosing: mg_per_unit = total_mg / (ml_bac_water * 100). Round to reasonable decimals.`;
}

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
 * Returns { response, log } where log contains request/response details
 */
async function generateWithOllama(prompt, host, model, signal, labelSize) {
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const startTime = Date.now();
    const timestamp = new Date().toLocaleTimeString();

    const systemPrompt = getLabelSystemPrompt(labelSize);
    const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`;
    const requestBody = {
        model: model,
        prompt: fullPrompt,
        stream: false,
        options: {
            temperature: 0.3,
        },
    };

    const log = {
        timestamp,
        provider: 'ollama',
        model,
        request: JSON.stringify(requestBody, null, 2),
        response: null,
        error: null,
        duration: null,
    };

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal, // AbortController signal for cancellation
    };

    try {
        let data;
        // When on HTTPS, we MUST use the proxy - direct HTTP calls are blocked
        if (isSecure) {
            const response = await fetch('/api/ollama/generate', options);
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Ollama error (${response.status}): ${text || response.statusText}`);
            }
            data = await response.json();
        } else {
            // On HTTP, use direct connection
            const response = await fetch(`${host}/api/generate`, options);
            if (!response.ok) {
                throw new Error(`Ollama error: ${response.statusText}`);
            }
            data = await response.json();
        }

        log.duration = Date.now() - startTime;
        log.response = data.response;
        return { response: data.response, log };
    } catch (error) {
        log.duration = Date.now() - startTime;
        log.error = error.message;
        if (error.name === 'AbortError') throw error; // Re-throw abort errors
        console.error('Ollama generate error:', error);
        throw Object.assign(new Error(`Failed to generate with Ollama: ${error.message}`), { log });
    }
}

/**
 * Generate label design using Gemini API
 * Returns { response, log } where log contains request/response details
 */
async function generateWithGemini(prompt, apiKey, model = 'gemini-1.5-flash', signal, labelSize) {
    const startTime = Date.now();
    const timestamp = new Date().toLocaleTimeString();

    const systemPrompt = getLabelSystemPrompt(labelSize);
    const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`;
    const requestBody = {
        contents: [{
            parts: [{
                text: fullPrompt
            }]
        }],
        generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,  // Increased from 1024 to handle complex labels
        },
    };

    const log = {
        timestamp,
        provider: 'gemini',
        model,
        request: JSON.stringify(requestBody, null, 2),
        response: null,
        error: null,
        duration: null,
    };

    try {
        const response = await fetch(
            `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                signal, // AbortController signal for cancellation
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Gemini error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        log.duration = Date.now() - startTime;
        log.response = responseText;
        return { response: responseText, log };
    } catch (error) {
        log.duration = Date.now() - startTime;
        log.error = error.message;
        if (error.name === 'AbortError') throw error;
        throw Object.assign(new Error(`Failed to generate with Gemini: ${error.message}`), { log });
    }
}

/**
 * Parse LLM response into label structure
 */
function parseResponse(response) {
    let jsonStr = response.trim();

    // Try multiple strategies to extract JSON

    // Strategy 1: Remove markdown code blocks (```json ... ``` or ``` ... ```)
    if (jsonStr.includes('```')) {
        // Extract content between code fences
        const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
            jsonStr = codeBlockMatch[1].trim();
        }
    }

    // Strategy 2: Find JSON object by looking for { ... }
    if (!jsonStr.startsWith('{')) {
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }
    }

    // Strategy 3: Remove any leading/trailing text outside the JSON
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }

    try {
        const parsed = JSON.parse(jsonStr);

        // Handle different response structures
        // Some models return { labelSize, objects } directly
        // Others might wrap it differently

        // Normalize the response
        let normalized = parsed;

        // If there's a nested "label" or "design" object, extract it
        if (parsed.label && typeof parsed.label === 'object') {
            normalized = parsed.label;
        } else if (parsed.design && typeof parsed.design === 'object') {
            normalized = parsed.design;
        }

        // Ensure we have the objects array
        if (!normalized.objects || !Array.isArray(normalized.objects)) {
            // Check if objects is at root level with different name
            if (parsed.elements && Array.isArray(parsed.elements)) {
                normalized.objects = parsed.elements;
            } else if (parsed.items && Array.isArray(parsed.items)) {
                normalized.objects = parsed.items;
            } else {
                throw new Error('Invalid response: missing objects array');
            }
        }

        // Ensure labelSize exists with defaults
        if (!normalized.labelSize) {
            normalized.labelSize = { width: 50, height: 15 };
        }

        // Normalize object properties (some models use different property names)
        normalized.objects = normalized.objects.map(obj => {
            const normalized_obj = { ...obj };

            // Normalize property names
            if (obj.x !== undefined && obj.left === undefined) normalized_obj.left = obj.x;
            if (obj.y !== undefined && obj.top === undefined) normalized_obj.top = obj.y;
            if (obj.font_size !== undefined && obj.fontSize === undefined) normalized_obj.fontSize = obj.font_size;
            if (obj.font_weight !== undefined && obj.fontWeight === undefined) normalized_obj.fontWeight = obj.font_weight;
            if (obj.text_align !== undefined && obj.textAlign === undefined) normalized_obj.textAlign = obj.text_align;
            if (obj.bold === true && !obj.fontWeight) normalized_obj.fontWeight = 'bold';

            return normalized_obj;
        });

        return normalized;
    } catch (error) {
        console.error('Failed to parse LLM response:', response);
        console.error('Attempted to parse:', jsonStr);
        throw new Error(`Failed to parse AI response: ${error.message}. Check debug logs for raw response.`);
    }
}

/**
 * Generate a label design from natural language
 * @param {string} prompt - User's description of the label
 * @param {AbortSignal} [signal] - Optional AbortController signal for cancellation
 * @param {object} [labelSize] - Current label dimensions { width, height } in mm
 * @returns {Promise<{labelSize: object, objects: array, log: object}>}
 */
export async function generateLabelDesign(prompt, signal, labelSize = { width: 50, height: 15 }) {
    const settings = getLLMSettings();

    let result;

    if (settings.provider === 'ollama') {
        if (!settings.ollamaModel) {
            throw new Error('No Ollama model selected. Please configure in settings.');
        }
        result = await generateWithOllama(prompt, settings.ollamaHost, settings.ollamaModel, signal, labelSize);
    } else if (settings.provider === 'gemini') {
        if (!settings.geminiApiKey) {
            throw new Error('Gemini API key not configured. Please add it in settings.');
        }
        result = await generateWithGemini(prompt, settings.geminiApiKey, settings.geminiModel, signal, labelSize);
    } else {
        throw new Error('Invalid LLM provider');
    }

    // Try to parse the response, but preserve the log even if parsing fails
    try {
        const parsed = parseResponse(result.response);
        // Attach the log to the parsed result
        return { ...parsed, log: result.log };
    } catch (parseError) {
        // Attach the log to the error so debug info is available
        const errorWithLog = new Error(parseError.message);
        errorWithLog.log = result.log;
        throw errorWithLog;
    }
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
