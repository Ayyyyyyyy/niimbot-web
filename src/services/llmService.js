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

    return `You are an Autonomous Label Architect for thermal printing.
**CORE OBJECTIVE:** Transform user data into a JSON layout.
**CREATIVE MODE:** If the user does not specify a layout (e.g., asks to "make it cool", "design it", or just gives data), you must ANALYZE the content and autonomously apply the most appropriate "Design Theme" from the library below.

### 1. SYSTEM CONSTRAINTS
- Canvas: ${width}mm x ${height}mm.
- Safe Zone: Keep text 1mm away from edges.
- Math: Dosage calculations are MANDATORY for peptides.

### 2. THE TOOLKIT (Your Palette)
**Fonts:**
- "Roboto" (Default, clean)
- "Oswald" (Bold, warning/headers)
- "Share Tech Mono" (Lab/Technical/Code)
- "Courier Prime" (Retro/Medical)

**Icons (MDI Keys):**
- "flask" (Science) | "alert" (Danger/Caution) | "water" (Diluent) | "star" (Premium) | "leaf" (Natural)

**Shapes:**
- Rects (Borders) | Lines (Dividers)

### 3. DESIGN THEME LIBRARY (Apply these autonomously)

**THEME A: "CLINICAL" (Default for Peptides/Meds)**
*Trigger: Standard medical requests.*
- Layout: Centered.
- Font: "Roboto".
- Decor: Thin separator lines between rows.
- Icon: None (clean).

**THEME B: "HAZARD / LAB"**
*Trigger: High dosage, "Warning", "Research Only", or user asks for "Cool/Tech".*
- Layout: Left-Aligned text.
- Font: "Share Tech Mono".
- Decor: Thick border (strokeWidth: 3).
- Icon: "flask" or "alert" at {left: 2, top: 2, size: 5}.
- Text Offset: Indent top text to left: 8 to accommodate icon.

**THEME C: "PREMIUM / BOUTIQUE"**
*Trigger: "Gold", "Luxury", "Star", or specific "Design" requests.*
- Layout: Centered with wide spacing.
- Font: "Oswald" for Header, "Roboto" for body.
- Decor: Double Border (Rect at 0,0 and Rect at 2,2).
- Icon: "star" centered at top or bottom if space permits.

### 4. MANDATORY MATH LOGIC
If mass (mg) and volume (ml) are present:
1. Units = ml * 100.
2. Conc = mass / Units.
3. Output: "X ml | 10u = [Conc]mg".

### 5. OUTPUT RULES
- Return ONLY valid JSON.
- Do not output markdown.
- If the user gives no design preference, default to THEME A.

Example Request (Vague): "Design a label for 10mg Retatrutide."
(AI Logic: Detects peptide -> Applies THEME A or B based on 'vibe')
Example Output:
{
  "labelSize": { "width": ${width}, "height": ${height} },
  "objects": [
    { "type": "rect", "left": 1, "top": 1, "width": ${width - 2}, "height": ${height - 2}, "strokeWidth": 2 },
    { "type": "text", "text": "RETATRUTIDE 10mg", "left": ${centerX}, "top": 4, "fontSize": 11, "fontFamily": "Oswald", "fontWeight": "bold", "textAlign": "center" },
    { "type": "line", "left": 5, "top": 7, "x1": 0, "y1": 0, "x2": ${width - 10}, "y2": 0, "strokeWidth": 1 },
    { "type": "text", "text": "RESEARCH USE ONLY", "left": ${centerX}, "top": 10, "fontSize": 7, "fontFamily": "Roboto", "textAlign": "center" }
  ]
}`;
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

    // Strategy 1: Remove markdown code blocks
    if (jsonStr.includes('```')) {
        const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
            jsonStr = codeBlockMatch[1].trim();
        }
    }

    // Strategy 2: Extract JSON object or array from surrounding text
    const firstBrace = jsonStr.search(/[{[]/);
    if (firstBrace !== -1) {
        const isArray = jsonStr[firstBrace] === '[';
        const lastBrace = jsonStr.lastIndexOf(isArray ? ']' : '}');

        if (lastBrace !== -1 && lastBrace > firstBrace) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        }
    }

    try {
        const parsed = JSON.parse(jsonStr);
        let normalized = { ...parsed };

        // Handle root-level array (treat as objects list)
        if (Array.isArray(parsed)) {
            normalized = { objects: parsed };
        }
        // Handle nested "label" or "design" objects
        else if (parsed.label && typeof parsed.label === 'object') {
            normalized = parsed.label;
        } else if (parsed.design && typeof parsed.design === 'object') {
            normalized = parsed.design;
        }

        // Locate the objects array: search common keys
        if (!normalized.objects || !Array.isArray(normalized.objects)) {
            const possibleKeys = ['content', 'elements', 'items', 'shapes', 'components'];
            const foundKey = possibleKeys.find(key => Array.isArray(parsed[key]));

            if (foundKey) {
                normalized.objects = parsed[foundKey];
            } else {
                // Last resort: find ANY array property at root
                const anyArrayKey = Object.keys(parsed).find(key => Array.isArray(parsed[key]));
                if (anyArrayKey) {
                    normalized.objects = parsed[anyArrayKey];
                } else {
                    throw new Error('Invalid response: missing objects array');
                }
            }
        }

        // Ensure labelSize exists with defaults
        if (!normalized.labelSize) {
            normalized.labelSize = { width: 50, height: 15 };
        }

        // Normalize object properties
        normalized.objects = normalized.objects.map(obj => {
            const normalized_obj = { ...obj };

            if (obj.x !== undefined && obj.left === undefined) normalized_obj.left = obj.x;
            if (obj.y !== undefined && obj.top === undefined) normalized_obj.top = obj.y;
            if (obj.font_size !== undefined && obj.fontSize === undefined) normalized_obj.fontSize = obj.font_size;
            if (obj.font_weight !== undefined && obj.fontWeight === undefined) normalized_obj.fontWeight = obj.font_weight;
            if (obj.text_align !== undefined && obj.textAlign === undefined) normalized_obj.textAlign = obj.text_align;
            if (obj.bold === true && !obj.fontWeight) normalized_obj.fontWeight = 'bold';

            // Map "rect" stroke defaults if missing
            if (obj.type === 'rect' && !obj.stroke) obj.stroke = '#000000';
            if (obj.type === 'rect' && !obj.strokeWidth) obj.strokeWidth = 2;

            return normalized_obj;
        });

        return normalized;
    } catch (error) {
        console.error('Failed to parse LLM response:', response);
        console.error('Attempted to parse:', jsonStr);
        throw new Error(`Failed to parse AI response: ${error.message}. Check debug logs.`);
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
