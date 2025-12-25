import { AlertTriangle, CheckCircle } from 'lucide-react'
import { StaticCanvas } from 'fabric'
import { useCallback, useEffect, useRef, useState } from 'react'
import { LabelDesigner } from './components/LabelDesigner'
import { PrintDialog } from './components/PrintDialog'
import { SettingsModal } from './components/SettingsModal'
import { TopBar } from './components/TopBar'
import { usePrinter } from './hooks/usePrinter'
import { getLLMSettings } from './services/llmService'
import { lookupLabelByBarcode } from './utils/labelDatabase'
import { DEFAULT_LABEL, downloadFile, isSecureContext } from './utils/utils'

function App() {
  // Label dimensions
  const [labelWidth, setLabelWidth] = useState(DEFAULT_LABEL.widthMm)
  const [labelHeight, setLabelHeight] = useState(DEFAULT_LABEL.heightMm)
  const [detectedLabel, setDetectedLabel] = useState(null)

  // Settings
  const [autoSaveBeforePrint, setAutoSaveBeforePrint] = useState(() => {
    return localStorage.getItem('autoSaveBeforePrint') === 'true'
  })
  const [showSettings, setShowSettings] = useState(false)
  const [showPrintDialog, setShowPrintDialog] = useState(false)

  // Canvas reference for printing and export
  const canvasRef = useRef(null)
  const fabricCanvasRef = useRef(null)

  // Printer hook
  const printer = usePrinter()

  // Persist auto-save setting
  useEffect(() => {
    localStorage.setItem('autoSaveBeforePrint', autoSaveBeforePrint.toString())
  }, [autoSaveBeforePrint])

  // Handle label size change
  const handleLabelSizeChange = useCallback((width, height) => {
    if (width >= 10 && width <= 100) setLabelWidth(width)
    if (height >= 10 && height <= 100) setLabelHeight(height)
    setDetectedLabel(null) // Clear auto-detected state when manually changed
  }, [])

  // Store Fabric canvas reference
  const handleCanvasReady = useCallback((fabricCanvas) => {
    fabricCanvasRef.current = fabricCanvas
  }, [])

  // Detect paper and auto-set label size
  const handleDetectPaper = useCallback(async () => {
    const rfidInfo = await printer.detectPaper()

    if (rfidInfo?.tagPresent) {
      // Try barcode lookup first
      let labelSpec = lookupLabelByBarcode(rfidInfo.barCode)

      // Also try serial number if barcode didn't match
      if (!labelSpec && rfidInfo.serialNumber) {
        labelSpec = lookupLabelByBarcode(rfidInfo.serialNumber)
      }

      if (labelSpec?.width && labelSpec.height) {
        // Enforce Landscape orientation (Width >= Height)
        // Most D110 labels print horizontally, so we normalize 15x50 -> 50x15
        const w = Math.max(labelSpec.width, labelSpec.height)
        const h = Math.min(labelSpec.width, labelSpec.height)

        setLabelWidth(w)
        setLabelHeight(h)
        setDetectedLabel(labelSpec)
      } else if (rfidInfo.labelWidth && rfidInfo.labelHeight) {
        // Fallback to raw RFID dimensions if no preset match
        const rawW = Number.parseInt(rfidInfo.labelWidth)
        const rawH = Number.parseInt(rfidInfo.labelHeight)

        if (!Number.isNaN(rawW) && !Number.isNaN(rawH)) {
          const w = Math.max(rawW, rawH)
          const h = Math.min(rawW, rawH)
          setLabelWidth(w)
          setLabelHeight(h)
        }
        setDetectedLabel(null)
      } else {
        setDetectedLabel(null)
      }
    }
  }, [printer])

  // Auto-dismiss detected label notification
  useEffect(() => {
    if (detectedLabel) {
      const timer = setTimeout(() => {
        setDetectedLabel(null)
      }, 5000) // 5 seconds
      return () => clearTimeout(timer)
    }
  }, [detectedLabel])

  // Export canvas to JSON file
  const handleExport = useCallback(() => {
    if (!fabricCanvasRef.current) return

    const data = {
      version: '1.0',
      labelWidth,
      labelHeight,
      canvas: fabricCanvasRef.current.toJSON(),
    }

    const json = JSON.stringify(data, null, 2)
    const filename = `label-design-${Date.now()}.json`
    downloadFile(json, filename)
  }, [labelWidth, labelHeight])

  // Import canvas from JSON file
  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = async (e) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const data = JSON.parse(text)

        // Validate format
        if (!data.canvas || !data.version) {
          throw new Error('Invalid design file format')
        }

        // Update label size if included
        if (data.labelWidth && data.labelHeight) {
          setLabelWidth(data.labelWidth)
          setLabelHeight(data.labelHeight)
        }

        // Load canvas data
        if (fabricCanvasRef.current) {
          await fabricCanvasRef.current.loadFromJSON(data.canvas)
          fabricCanvasRef.current.renderAll()
        }
      } catch (err) {
        console.error('Import error:', err)
        alert(`Failed to import design: ${err.message}`)
      }
    }

    input.click()
  }, [])

  // Open Print Dialog
  const handlePrintRequest = useCallback(() => {
    if (!printer.isConnected) return
    setShowPrintDialog(true)
  }, [printer.isConnected])

  // Execute print with settings from dialog
  const executePrint = useCallback(async (printSettings) => {
    if (!printer.isConnected || !fabricCanvasRef.current) return

    // Auto-save before printing if enabled
    if (autoSaveBeforePrint) {
      const data = {
        version: '1.0',
        labelWidth,
        labelHeight,
        canvas: fabricCanvasRef.current.toJSON(),
      }
      const json = JSON.stringify(data, null, 2)
      const filename = `label-design-${Date.now()}.json`
      downloadFile(json, filename)
    }

    try {
      // 1. Get current design as JSON (scene coordinates, independent of zoom)
      const json = fabricCanvasRef.current.toJSON()

      // 2. Calculate target 1:1 pixel dimensions (203 DPI)
      const { mmToPixels } = await import('./utils/utils')
      const targetWidth = mmToPixels(labelWidth)
      const targetHeight = mmToPixels(labelHeight)

      // 3. Create a detached canvas element of the exact target size
      const printCanvasEl = document.createElement('canvas')
      printCanvasEl.width = targetWidth
      printCanvasEl.height = targetHeight

      // 4. Create a StaticCanvas on this element
      const staticCanvas = new StaticCanvas(printCanvasEl, {
        width: targetWidth,
        height: targetHeight,
        backgroundColor: '#ffffff', // Ensure white background
      })

      // 5. Load the design
      await staticCanvas.loadFromJSON(json)

      // 6. Force 1:1 zoom on the static canvas (just in case JSON carried viewport)
      staticCanvas.setZoom(1)
      staticCanvas.setViewportTransform([1, 0, 0, 1, 0, 0])

      // 7. Render
      staticCanvas.renderAll()

      // 8. Apply Print Settings (Offset & Direction)
      const direction = printSettings.direction || 'left'
      const quantity = printSettings.quantity || 1

      // Convert offsets from mm to pixels
      const offsetX = mmToPixels(printSettings.offsetX || 0)
      const offsetY = mmToPixels(printSettings.offsetY || 0)

      // If offsets are present, we need to shift the content
      let finalCanvasForPrint = printCanvasEl

      if (offsetX !== 0 || offsetY !== 0) {
        const shiftedCanvas = document.createElement('canvas')
        shiftedCanvas.width = targetWidth
        shiftedCanvas.height = targetHeight
        const ctx = shiftedCanvas.getContext('2d')

        // Fill white
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, targetWidth, targetHeight)

        // Draw with offset
        ctx.drawImage(printCanvasEl, offsetX, offsetY)

        finalCanvasForPrint = shiftedCanvas
      }

      // 9. Send to printer
      const success = await printer.print(finalCanvasForPrint, {
        direction: direction,
        quantity: quantity,
      })

      // 10. Cleanup
      staticCanvas.dispose()

      if (success) {
        console.log('Print completed successfully')
      }
    } catch (err) {
      console.error('Print generation failed:', err)
      alert('Failed to generate print data')
    }
  }, [printer, autoSaveBeforePrint, labelWidth, labelHeight])

  // Check secure context
  const secureContext = isSecureContext()

  return (
    <div className='min-h-screen flex flex-col'>
      {/* Security Warning */}
      {!secureContext && (
        <div className='security-warning flex items-center gap-2'>
          <AlertTriangle size={16} />
          <span>Web Bluetooth requires HTTPS or localhost. Current connection may not work.</span>
        </div>
      )}

      {/* Auto-detected label notification */}
      {detectedLabel && (
        <div className='bg-green-500/20 border-l-4 border-green-500 text-green-200 px-4 py-2 text-sm flex items-center gap-2'>
          <CheckCircle size={16} />
          <span>
            Auto-detected: <strong>{detectedLabel.sku}</strong> ({detectedLabel.width}×
            {detectedLabel.height}mm)
            {detectedLabel.material && ` - ${detectedLabel.material}`}
          </span>
        </div>
      )}

      {/* Top Bar */}
      <TopBar
        // Printer state
        isConnected={printer.isConnected}
        isConnecting={printer.isConnecting}
        isPrinting={printer.isPrinting}
        isDetecting={printer.isDetecting}
        connectionStatus={printer.connectionStatus}
        batteryLevel={printer.batteryLevel}
        printerModel={printer.printerModel}
        printProgress={printer.printProgress}
        error={printer.error}
        canReconnect={printer.canReconnect}
        rfidInfo={printer.rfidInfo}
        // Printer actions
        onConnectBLE={() => printer.connect('ble')}
        onConnectUSB={() => printer.connect('serial')}
        onReconnect={printer.reconnect}
        onDisconnect={printer.disconnect}
        onDetectPaper={handleDetectPaper}
        onPrint={handlePrintRequest}
        onClearError={printer.clearError}
        // File actions
        onExport={handleExport}
        onImport={handleImport}
        // Label settings
        labelWidth={labelWidth}
        labelHeight={labelHeight}
        onLabelSizeChange={handleLabelSizeChange}
        // Auto-save setting
        autoSaveBeforePrint={autoSaveBeforePrint}
        onAutoSaveChange={setAutoSaveBeforePrint}
        // Settings
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Label Designer */}
      <LabelDesigner
        widthMm={labelWidth}
        heightMm={labelHeight}
        canvasRef={canvasRef}
        onCanvasReady={handleCanvasReady}
        onLabelSizeChange={handleLabelSizeChange}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Print Dialog */}
      <PrintDialog
        isOpen={showPrintDialog}
        onClose={() => setShowPrintDialog(false)}
        onPrint={executePrint}
        isPrinting={printer.isPrinting}
      />
    </div>
  )
}

export default App
