/**
 * Utility functions for DPI conversion and other helpers
 */

// 203 DPI is standard for Niimbot thermal printers
export const DPI = 203

/**
 * Convert millimeters to pixels at 203 DPI
 * @param {number} mm - Millimeters
 * @returns {number} Pixels
 */
export function mmToPixels(mm) {
  // 1 inch = 25.4mm
  // pixels = (mm / 25.4) * DPI
  return Math.round((mm / 25.4) * DPI)
}

/**
 * Convert pixels to millimeters at 203 DPI
 * @param {number} px - Pixels
 * @returns {number} Millimeters
 */
export function pixelsToMm(px) {
  return Math.round((px / DPI) * 25.4)
}

/**
 * Default label size - 50x15mm (standard vial size)
 */
export const DEFAULT_LABEL = {
  widthMm: 50,
  heightMm: 15,
  widthPx: mmToPixels(50),
  heightPx: mmToPixels(15),
}

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
]

/**
 * Check if running in secure context (required for Web Bluetooth)
 */
export function isSecureContext() {
  return window.isSecureContext
}

/**
 * Download a string as a file
 */
export function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Clean canvas for printing using Floyd-Steinberg dithering
 * Converts grayscale to black/white while preserving detail via error diffusion
 * @param {HTMLCanvasElement} sourceCanvas - The source canvas
 * @param {number} threshold - Threshold 0-255 (defaults to 128)
 * @returns {HTMLCanvasElement} Cleaned canvas
 */
export function cleanCanvasForPrint(sourceCanvas, threshold = 128) {
  // Create a new canvas with the same dimensions
  const cleanCanvas = document.createElement('canvas')
  cleanCanvas.width = sourceCanvas.width
  cleanCanvas.height = sourceCanvas.height

  const sourceCtx = sourceCanvas.getContext('2d')
  const cleanCtx = cleanCanvas.getContext('2d')

  // Fill with white first
  cleanCtx.fillStyle = '#FFFFFF'
  cleanCtx.fillRect(0, 0, cleanCanvas.width, cleanCanvas.height)

  // Get image data
  const imageData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height)
  const data = imageData.data
  const width = sourceCanvas.width
  const height = sourceCanvas.height

  // Convert to grayscale first to simplify processing
  // We'll use a float32 array for precise error calculation
  const grayscale = new Float32Array(width * height)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    // Treat transparent pixels as white
    const a = data[i + 3]

    // Standard luminance formula
    let lum = 0.2126 * r + 0.7152 * g + 0.0722 * b

    // Mix in white for transparent areas (simulate printing on white paper)
    if (a < 255) {
      lum = lum * (a / 255) + 255 * (1 - a / 255)
    }

    grayscale[i / 4] = lum
  }

  // Floyd-Steinberg Dithering
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const oldPixel = grayscale[idx]
      const newPixel = oldPixel < threshold ? 0 : 255

      grayscale[idx] = newPixel

      const quantError = oldPixel - newPixel

      // Distribute error to neighbors
      if (x + 1 < width) {
        grayscale[idx + 1] += (quantError * 7) / 16
      }
      if (x - 1 >= 0 && y + 1 < height) {
        grayscale[(y + 1) * width + (x - 1)] += (quantError * 3) / 16
      }
      if (y + 1 < height) {
        grayscale[(y + 1) * width + x] += (quantError * 5) / 16
      }
      if (x + 1 < width && y + 1 < height) {
        grayscale[(y + 1) * width + (x + 1)] += (quantError * 1) / 16
      }
    }
  }

  // Write back to image data
  for (let i = 0; i < grayscale.length; i++) {
    const val = grayscale[i]
    const outputVal = val < 128 ? 0 : 255 // Final clamp

    data[i * 4] = outputVal // R
    data[i * 4 + 1] = outputVal // G
    data[i * 4 + 2] = outputVal // B
    data[i * 4 + 3] = 255 // A (Fully opaque)
  }

  // Put cleaned image data
  cleanCtx.putImageData(imageData, 0, 0)

  return cleanCanvas
}
