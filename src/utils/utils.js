/**
 * Utility functions for DPI conversion and other helpers
 */

// 203 DPI is standard for Niimbot thermal printers
export const DPI = 203;

/**
 * Convert millimeters to pixels at 203 DPI
 * @param {number} mm - Millimeters
 * @returns {number} Pixels
 */
export function mmToPixels(mm) {
    // 1 inch = 25.4mm
    // pixels = (mm / 25.4) * DPI
    return Math.round((mm / 25.4) * DPI);
}

/**
 * Convert pixels to millimeters at 203 DPI
 * @param {number} px - Pixels
 * @returns {number} Millimeters
 */
export function pixelsToMm(px) {
    return Math.round((px / DPI) * 25.4);
}

/**
 * Default label size - 50x15mm (standard vial size)
 */
export const DEFAULT_LABEL = {
    widthMm: 50,
    heightMm: 15,
    widthPx: mmToPixels(50),
    heightPx: mmToPixels(15),
};

/**
 * Common Niimbot label presets
 */
export const LABEL_PRESETS = [
    { name: '50×15', width: 50, height: 15 },
    { name: '50×30', width: 50, height: 30 },
    { name: '40×30', width: 40, height: 30 },
    { name: '40×20', width: 40, height: 20 },
    { name: '30×20', width: 30, height: 20 },
    { name: '25×15', width: 25, height: 15 },
    { name: '15×50', width: 15, height: 50 },
    { name: '12×22', width: 12, height: 22 },
];

/**
 * Check if running in secure context (required for Web Bluetooth)
 */
export function isSecureContext() {
    return window.isSecureContext;
}

/**
 * Download a string as a file
 */
export function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Clean canvas for printing - removes anti-aliasing artifacts
 * Converts all near-white pixels to pure white and near-black to pure black
 * @param {HTMLCanvasElement} sourceCanvas - The source canvas
 * @param {number} threshold - Threshold 0-255 (pixels darker than this become black)
 * @returns {HTMLCanvasElement} Cleaned canvas
 */
export function cleanCanvasForPrint(sourceCanvas, threshold = 200) {
    // Create a new canvas with the same dimensions
    const cleanCanvas = document.createElement('canvas');
    cleanCanvas.width = sourceCanvas.width;
    cleanCanvas.height = sourceCanvas.height;

    const sourceCtx = sourceCanvas.getContext('2d');
    const cleanCtx = cleanCanvas.getContext('2d');

    // Get image data
    const imageData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const data = imageData.data;

    // Process each pixel
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Calculate luminance (grayscale value)
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        // Apply threshold - if luminance is above threshold, make white
        // Also account for alpha - transparent pixels should be white
        if (luminance > threshold || a < 128) {
            data[i] = 255;     // R
            data[i + 1] = 255; // G
            data[i + 2] = 255; // B
            data[i + 3] = 255; // A
        } else {
            // Make pure black
            data[i] = 0;       // R
            data[i + 1] = 0;   // G
            data[i + 2] = 0;   // B
            data[i + 3] = 255; // A
        }
    }

    // Put cleaned image data
    cleanCtx.putImageData(imageData, 0, 0);

    return cleanCanvas;
}
