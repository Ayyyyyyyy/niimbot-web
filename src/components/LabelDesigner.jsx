import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, IText, Rect, Circle, Line, FabricImage } from 'fabric';
import bwipjs from 'bwip-js';
import { Toolbar, PropertiesPanel } from './Toolbar';
import { TemplatePicker } from './TemplatePicker';
import { AIAssistant } from './AIAssistant';
import { mmToPixels, pixelsToMm } from '../utils/utils';

/**
 * Main canvas label designer component using Fabric.js
 */
export function LabelDesigner({
    widthMm,
    heightMm,
    canvasRef,
    onCanvasReady,
    onLabelSizeChange,
    onOpenSettings,
}) {
    const containerRef = useRef(null);
    const fabricRef = useRef(null);
    const [selectedObject, setSelectedObject] = useState(null);
    const [activeTool, setActiveTool] = useState(null);
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);
    const [showAIAssistant, setShowAIAssistant] = useState(false);

    // Calculate pixel dimensions
    const widthPx = mmToPixels(widthMm);
    const heightPx = mmToPixels(heightMm);

    // Initialize Fabric canvas
    useEffect(() => {
        if (!containerRef.current) return;

        // Create canvas element
        const canvasEl = document.createElement('canvas');
        canvasEl.width = widthPx;
        canvasEl.height = heightPx;
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(canvasEl);

        // Initialize Fabric canvas
        const fabricCanvas = new Canvas(canvasEl, {
            backgroundColor: '#ffffff',
            selection: true,
            preserveObjectStacking: true,
        });

        fabricRef.current = fabricCanvas;

        // Store canvas element reference for printing
        if (canvasRef) {
            canvasRef.current = canvasEl;
        }

        // Notify parent
        if (onCanvasReady) {
            onCanvasReady(fabricCanvas);
        }

        // Selection event handlers
        fabricCanvas.on('selection:created', (e) => {
            setSelectedObject(e.selected?.[0] || null);
        });

        fabricCanvas.on('selection:updated', (e) => {
            setSelectedObject(e.selected?.[0] || null);
        });

        fabricCanvas.on('selection:cleared', () => {
            setSelectedObject(null);
        });

        // Object modified handler for real-time updates
        fabricCanvas.on('object:modified', () => {
            const active = fabricCanvas.getActiveObject();
            if (active) {
                setSelectedObject({ ...active });
            }
        });

        // Cleanup
        return () => {
            fabricCanvas.dispose();
        };
    }, [widthPx, heightPx]);

    // Add text to canvas
    const handleAddText = useCallback(() => {
        if (!fabricRef.current) return;

        const text = new IText('Text', {
            left: 50,
            top: 50,
            fontSize: 24,
            fontFamily: 'Arial',
            fill: '#000000',
        });

        fabricRef.current.add(text);
        fabricRef.current.setActiveObject(text);
        fabricRef.current.renderAll();
        setActiveTool('text');
    }, []);

    // Generate and add barcode
    const handleAddBarcode = useCallback(async () => {
        if (!fabricRef.current) return;

        const barcodeValue = prompt('Enter barcode value:', '12345678');
        if (!barcodeValue) return;

        try {
            // Create temp canvas for barcode
            const tempCanvas = document.createElement('canvas');
            bwipjs.toCanvas(tempCanvas, {
                bcid: 'code128',
                text: barcodeValue,
                scale: 2,
                height: 10,
                includetext: true,
                textxalign: 'center',
            });

            // Convert to Fabric image
            const img = await FabricImage.fromURL(tempCanvas.toDataURL());
            img.set({
                left: 50,
                top: 50,
            });

            fabricRef.current.add(img);
            fabricRef.current.setActiveObject(img);
            fabricRef.current.renderAll();
            setActiveTool('barcode');
        } catch (err) {
            console.error('Barcode generation error:', err);
            alert('Failed to generate barcode: ' + err.message);
        }
    }, []);

    // Generate and add QR code
    const handleAddQRCode = useCallback(async () => {
        if (!fabricRef.current) return;

        const qrValue = prompt('Enter QR code data:', 'https://example.com');
        if (!qrValue) return;

        try {
            const tempCanvas = document.createElement('canvas');
            bwipjs.toCanvas(tempCanvas, {
                bcid: 'qrcode',
                text: qrValue,
                scale: 3,
                eclevel: 'M',
            });

            const img = await FabricImage.fromURL(tempCanvas.toDataURL());
            img.set({
                left: 50,
                top: 50,
            });

            fabricRef.current.add(img);
            fabricRef.current.setActiveObject(img);
            fabricRef.current.renderAll();
            setActiveTool('qrcode');
        } catch (err) {
            console.error('QR code generation error:', err);
            alert('Failed to generate QR code: ' + err.message);
        }
    }, []);

    // Add shape to canvas
    const handleAddShape = useCallback((shapeType) => {
        if (!fabricRef.current) return;

        let shape;
        if (shapeType === 'rect') {
            shape = new Rect({
                left: 50,
                top: 50,
                width: 80,
                height: 50,
                fill: 'transparent',
                stroke: '#000000',
                strokeWidth: 2,
            });
            setActiveTool('rectangle');
        } else if (shapeType === 'circle') {
            shape = new Circle({
                left: 50,
                top: 50,
                radius: 30,
                fill: 'transparent',
                stroke: '#000000',
                strokeWidth: 2,
            });
            setActiveTool('circle');
        }

        if (shape) {
            fabricRef.current.add(shape);
            fabricRef.current.setActiveObject(shape);
            fabricRef.current.renderAll();
        }
    }, []);

    // Add line to canvas
    const handleAddLine = useCallback(() => {
        if (!fabricRef.current) return;

        const line = new Line([50, 50, 150, 50], {
            stroke: '#000000',
            strokeWidth: 2,
            selectable: true,
        });

        fabricRef.current.add(line);
        fabricRef.current.setActiveObject(line);
        fabricRef.current.renderAll();
        setActiveTool('line');
    }, []);

    // Add image from file
    const handleAddImage = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const img = await FabricImage.fromURL(event.target.result);

                    // Scale down if too large
                    const maxSize = Math.min(widthPx, heightPx) * 0.8;
                    if (img.width > maxSize || img.height > maxSize) {
                        const scale = maxSize / Math.max(img.width, img.height);
                        img.scale(scale);
                    }

                    img.set({
                        left: 50,
                        top: 50,
                    });

                    fabricRef.current.add(img);
                    fabricRef.current.setActiveObject(img);
                    fabricRef.current.renderAll();
                } catch (err) {
                    console.error('Image load error:', err);
                    alert('Failed to load image');
                }
            };
            reader.readAsDataURL(file);
        };
        input.click();
        setActiveTool('image');
    }, [widthPx, heightPx]);

    // Object manipulation handlers
    const handleDelete = useCallback(() => {
        if (!fabricRef.current) return;
        const active = fabricRef.current.getActiveObject();
        if (active) {
            fabricRef.current.remove(active);
            fabricRef.current.renderAll();
            setSelectedObject(null);
        }
    }, []);

    const handleRotate = useCallback(() => {
        if (!fabricRef.current) return;
        const active = fabricRef.current.getActiveObject();
        if (active) {
            active.rotate((active.angle || 0) + 90);
            fabricRef.current.renderAll();
            setSelectedObject({ ...active });
        }
    }, []);

    const handleFlipH = useCallback(() => {
        if (!fabricRef.current) return;
        const active = fabricRef.current.getActiveObject();
        if (active) {
            active.set('flipX', !active.flipX);
            fabricRef.current.renderAll();
            setSelectedObject({ ...active });
        }
    }, []);

    const handleFlipV = useCallback(() => {
        if (!fabricRef.current) return;
        const active = fabricRef.current.getActiveObject();
        if (active) {
            active.set('flipY', !active.flipY);
            fabricRef.current.renderAll();
            setSelectedObject({ ...active });
        }
    }, []);

    const handleDuplicate = useCallback(async () => {
        if (!fabricRef.current) return;
        const active = fabricRef.current.getActiveObject();
        if (active) {
            const cloned = await active.clone();
            cloned.set({
                left: (active.left || 0) + 20,
                top: (active.top || 0) + 20,
            });
            fabricRef.current.add(cloned);
            fabricRef.current.setActiveObject(cloned);
            fabricRef.current.renderAll();
        }
    }, []);

    const handleBringForward = useCallback(() => {
        if (!fabricRef.current) return;
        const active = fabricRef.current.getActiveObject();
        if (active) {
            fabricRef.current.bringObjectForward(active);
            fabricRef.current.renderAll();
        }
    }, []);

    const handleSendBackward = useCallback(() => {
        if (!fabricRef.current) return;
        const active = fabricRef.current.getActiveObject();
        if (active) {
            fabricRef.current.sendObjectBackwards(active);
            fabricRef.current.renderAll();
        }
    }, []);

    const handleUpdateProperty = useCallback((property, value) => {
        if (!fabricRef.current) return;
        const active = fabricRef.current.getActiveObject();
        if (active) {
            active.set(property, value);
            fabricRef.current.renderAll();
            setSelectedObject({ ...active });
        }
    }, []);

    // Load template onto canvas with automatic scaling to fit label size
    const handleLoadTemplate = useCallback(async (template) => {
        if (!fabricRef.current) return;

        // Clear existing objects
        fabricRef.current.clear();
        fabricRef.current.backgroundColor = '#ffffff';

        // Get template's original size and target size
        const templateWidth = template.labelSize?.width || 50;
        const templateHeight = template.labelSize?.height || 30;
        const targetWidth = template.labelSize?.width || widthMm;
        const targetHeight = template.labelSize?.height || heightMm;

        // Update label size if template specifies
        if (template.labelSize && onLabelSizeChange) {
            onLabelSizeChange(template.labelSize.width, template.labelSize.height);
        }

        // Calculate scale factors based on mm to pixels conversion
        // Templates are designed in pixels at ~8px per mm (203 DPI / 25.4)
        const originalWidthPx = mmToPixels(templateWidth);
        const originalHeightPx = mmToPixels(templateHeight);
        const targetWidthPx = mmToPixels(targetWidth);
        const targetHeightPx = mmToPixels(targetHeight);

        // Scale factor to fit template to target size
        const scaleX = targetWidthPx / Math.max(originalWidthPx, 160); // 160px was base design width
        const scaleY = targetHeightPx / Math.max(originalHeightPx, 90); // 90px was base design height
        const scale = Math.min(scaleX, scaleY, 1.5); // Cap max scale at 1.5x

        // Use mmToPixels directly since template coords are in "design units"
        // Design assumes roughly 8px per mm, so we convert to actual 203 DPI
        const pxPerMm = mmToPixels(1); // ~8px per mm at 203 DPI

        // Add template objects with scaling
        for (const obj of template.objects || []) {
            // Scale position and size - template uses px-like units, scale to actual canvas
            const scaledLeft = (obj.left || 0) * scale;
            const scaledTop = (obj.top || 0) * scale;

            if (obj.type === 'text') {
                const text = new IText(obj.text || 'Text', {
                    left: scaledLeft,
                    top: scaledTop,
                    fontSize: Math.max(6, (obj.fontSize || 14) * scale),
                    fontFamily: obj.fontFamily || 'Arial',
                    fontWeight: obj.fontWeight || 'normal',
                    fontStyle: obj.fontStyle || 'normal',
                    textAlign: obj.textAlign || 'left',
                    fill: '#000000',
                    angle: obj.angle || 0,
                });
                fabricRef.current.add(text);
            } else if (obj.type === 'rect') {
                const rect = new Rect({
                    left: scaledLeft,
                    top: scaledTop,
                    width: (obj.width || 80) * scale,
                    height: (obj.height || 50) * scale,
                    fill: obj.fill || 'transparent',
                    stroke: obj.stroke || '#000000',
                    strokeWidth: Math.max(1, (obj.strokeWidth || 2) * scale),
                });
                fabricRef.current.add(rect);
            } else if (obj.type === 'barcode' || obj.type === 'qrcode') {
                try {
                    const tempCanvas = document.createElement('canvas');
                    bwipjs.toCanvas(tempCanvas, {
                        bcid: obj.type === 'qrcode' ? 'qrcode' : (obj.format || 'code128'),
                        text: obj.value || '123456',
                        scale: obj.type === 'qrcode' ? 3 : 2,
                        height: obj.type === 'qrcode' ? undefined : 10,
                        includetext: obj.type !== 'qrcode',
                        textxalign: 'center',
                    });
                    const img = await FabricImage.fromURL(tempCanvas.toDataURL());
                    img.set({ left: scaledLeft, top: scaledTop });
                    img.scale(scale);
                    fabricRef.current.add(img);
                } catch (err) {
                    console.error('Barcode generation error:', err);
                }
            } else if (obj.type === 'line') {
                const line = new Line([
                    (obj.x1 || 0) * scale,
                    (obj.y1 || 0) * scale,
                    (obj.x2 || 100) * scale,
                    (obj.y2 || 0) * scale
                ], {
                    left: scaledLeft,
                    top: scaledTop,
                    stroke: obj.stroke || '#000000',
                    strokeWidth: Math.max(1, (obj.strokeWidth || 2) * scale),
                });
                fabricRef.current.add(line);
            }
        }

        fabricRef.current.renderAll();
    }, [onLabelSizeChange, widthMm, heightMm]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!fabricRef.current) return;

            // Delete key
            if (e.key === 'Delete' || e.key === 'Backspace') {
                // Don't delete if editing text
                const active = fabricRef.current.getActiveObject();
                if (active && active.isEditing) return;
                handleDelete();
            }

            // Escape to deselect
            if (e.key === 'Escape') {
                fabricRef.current.discardActiveObject();
                fabricRef.current.renderAll();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleDelete]);

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Left Toolbar */}
            <div className="p-3">
                <Toolbar
                    activeTool={activeTool}
                    onAddText={handleAddText}
                    onAddBarcode={handleAddBarcode}
                    onAddQRCode={handleAddQRCode}
                    onAddShape={handleAddShape}
                    onAddLine={handleAddLine}
                    onAddImage={handleAddImage}
                    onOpenTemplates={() => setShowTemplatePicker(true)}
                    onOpenAI={() => setShowAIAssistant(true)}
                />
            </div>

            {/* Canvas Area */}
            <div className="canvas-wrapper flex-1">
                <div className="relative">
                    {/* Size indicator */}
                    <div className="absolute -top-6 left-0 text-xs text-gray-400">
                        {widthMm}mm × {heightMm}mm ({widthPx}px × {heightPx}px @ 203 DPI)
                    </div>

                    {/* Canvas container */}
                    <div
                        ref={containerRef}
                        className="canvas-container"
                        style={{
                            width: widthPx,
                            height: heightPx,
                        }}
                    />
                </div>
            </div>

            {/* Right Properties Panel */}
            <div className="p-3">
                <PropertiesPanel
                    selectedObject={selectedObject}
                    onDelete={handleDelete}
                    onRotate={handleRotate}
                    onFlipH={handleFlipH}
                    onFlipV={handleFlipV}
                    onDuplicate={handleDuplicate}
                    onBringForward={handleBringForward}
                    onSendBackward={handleSendBackward}
                    onUpdateProperty={handleUpdateProperty}
                />
            </div>

            {/* Template Picker Modal */}
            <TemplatePicker
                isOpen={showTemplatePicker}
                onClose={() => setShowTemplatePicker(false)}
                onSelectTemplate={handleLoadTemplate}
            />

            {/* AI Assistant Modal */}
            <AIAssistant
                isOpen={showAIAssistant}
                onClose={() => setShowAIAssistant(false)}
                onApplyLabel={handleLoadTemplate}
            />
        </div>
    );
}

