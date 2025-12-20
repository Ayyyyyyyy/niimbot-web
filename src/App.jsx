import { useState, useRef, useCallback, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { LabelDesigner } from './components/LabelDesigner';
import { SettingsModal } from './components/SettingsModal';
import { usePrinter } from './hooks/usePrinter';
import { DEFAULT_LABEL, isSecureContext, downloadFile } from './utils/utils';
import { lookupLabelByBarcode } from './utils/labelDatabase';
import { AlertTriangle, CheckCircle } from 'lucide-react';

function App() {
  // Label dimensions
  const [labelWidth, setLabelWidth] = useState(DEFAULT_LABEL.widthMm);
  const [labelHeight, setLabelHeight] = useState(DEFAULT_LABEL.heightMm);
  const [detectedLabel, setDetectedLabel] = useState(null);

  // Settings
  const [autoSaveBeforePrint, setAutoSaveBeforePrint] = useState(() => {
    return localStorage.getItem('autoSaveBeforePrint') === 'true';
  });
  const [showSettings, setShowSettings] = useState(false);

  // Canvas reference for printing and export
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  // Printer hook
  const printer = usePrinter();

  // Persist auto-save setting
  useEffect(() => {
    localStorage.setItem('autoSaveBeforePrint', autoSaveBeforePrint.toString());
  }, [autoSaveBeforePrint]);

  // Handle label size change
  const handleLabelSizeChange = useCallback((width, height) => {
    if (width >= 10 && width <= 100) setLabelWidth(width);
    if (height >= 10 && height <= 100) setLabelHeight(height);
    setDetectedLabel(null); // Clear auto-detected state when manually changed
  }, []);

  // Store Fabric canvas reference
  const handleCanvasReady = useCallback((fabricCanvas) => {
    fabricCanvasRef.current = fabricCanvas;
  }, []);

  // Detect paper and auto-set label size
  const handleDetectPaper = useCallback(async () => {
    const rfidInfo = await printer.detectPaper();

    if (rfidInfo && rfidInfo.tagPresent) {
      // Try barcode lookup first
      let labelSpec = lookupLabelByBarcode(rfidInfo.barCode);

      // Also try serial number if barcode didn't match
      if (!labelSpec && rfidInfo.serialNumber) {
        labelSpec = lookupLabelByBarcode(rfidInfo.serialNumber);
      }

      if (labelSpec && labelSpec.width && labelSpec.height) {
        // Enforce Landscape orientation (Width >= Height)
        // Most D110 labels print horizontally, so we normalize 15x50 -> 50x15
        const w = Math.max(labelSpec.width, labelSpec.height);
        const h = Math.min(labelSpec.width, labelSpec.height);

        setLabelWidth(w);
        setLabelHeight(h);
        setDetectedLabel(labelSpec);
      } else if (rfidInfo.labelWidth && rfidInfo.labelHeight) {
        // Fallback to raw RFID dimensions if no preset match
        const rawW = parseInt(rfidInfo.labelWidth);
        const rawH = parseInt(rfidInfo.labelHeight);

        if (!isNaN(rawW) && !isNaN(rawH)) {
          const w = Math.max(rawW, rawH);
          const h = Math.min(rawW, rawH);
          setLabelWidth(w);
          setLabelHeight(h);
        }
        setDetectedLabel(null);
      } else {
        setDetectedLabel(null);
      }
    }
  }, [printer]);

  // Export canvas to JSON file
  const handleExport = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const data = {
      version: '1.0',
      labelWidth,
      labelHeight,
      canvas: fabricCanvasRef.current.toJSON(),
    };

    const json = JSON.stringify(data, null, 2);
    const filename = `label-design-${Date.now()}.json`;
    downloadFile(json, filename);
  }, [labelWidth, labelHeight]);

  // Import canvas from JSON file
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Validate format
        if (!data.canvas || !data.version) {
          throw new Error('Invalid design file format');
        }

        // Update label size if included
        if (data.labelWidth && data.labelHeight) {
          setLabelWidth(data.labelWidth);
          setLabelHeight(data.labelHeight);
        }

        // Load canvas data
        if (fabricCanvasRef.current) {
          await fabricCanvasRef.current.loadFromJSON(data.canvas);
          fabricCanvasRef.current.renderAll();
        }
      } catch (err) {
        console.error('Import error:', err);
        alert('Failed to import design: ' + err.message);
      }
    };

    input.click();
  }, []);

  // Print the current design
  const handlePrint = useCallback(async () => {
    if (!canvasRef.current || !printer.isConnected) return;

    // Auto-save before printing if enabled
    if (autoSaveBeforePrint && fabricCanvasRef.current) {
      const data = {
        version: '1.0',
        labelWidth,
        labelHeight,
        canvas: fabricCanvasRef.current.toJSON(),
      };
      const json = JSON.stringify(data, null, 2);
      const filename = `label-design-${Date.now()}.json`;
      downloadFile(json, filename);
    }

    // Get the underlying canvas element from Fabric
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;

    // Save current zoom state
    const currentZoom = fabricCanvas.getZoom();

    // Deselect objects before printing to hide selection UI
    fabricCanvas.discardActiveObject();

    // Reset to 1:1 scale for printing (203 DPI)
    // We must ensure the canvas is at the correct pixel dimensions for the printer
    const { mmToPixels } = await import('./utils/utils');
    const targetWidth = mmToPixels(labelWidth);
    const targetHeight = mmToPixels(labelHeight);

    fabricCanvas.setDimensions({
      width: targetWidth,
      height: targetHeight
    });
    fabricCanvas.setZoom(1);
    fabricCanvas.renderAll();

    // Get the canvas element
    const canvasEl = canvasRef.current;

    // Print
    const success = await printer.print(canvasEl, {
      direction: 'left',
      quantity: 1,
    });

    // Restore zoom state layout
    fabricCanvas.setDimensions({
      width: targetWidth * currentZoom,
      height: targetHeight * currentZoom
    });
    fabricCanvas.setZoom(currentZoom);
    fabricCanvas.renderAll();

    if (success) {
      // Could show success notification here
      console.log('Print completed successfully');
    }
  }, [printer, autoSaveBeforePrint, labelWidth, labelHeight]);

  // Check secure context
  const secureContext = isSecureContext();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Security Warning */}
      {!secureContext && (
        <div className="security-warning flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>
            Web Bluetooth requires HTTPS or localhost. Current connection may not work.
          </span>
        </div>
      )}

      {/* Auto-detected label notification */}
      {detectedLabel && (
        <div className="bg-green-500/20 border-l-4 border-green-500 text-green-200 px-4 py-2 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          <span>
            Auto-detected: <strong>{detectedLabel.sku}</strong> ({detectedLabel.width}×{detectedLabel.height}mm)
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
        onPrint={handlePrint}
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
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

export default App;
