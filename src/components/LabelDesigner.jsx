import bwipjs from 'bwip-js'
import { ActiveSelection, Canvas, Circle, FabricImage, IText, Line, Rect } from 'fabric'
import { Magnet, Maximize2, Redo, Undo, ZoomIn, ZoomOut } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { mmToPixels, pixelsToMm } from '../utils/utils'
import { AIAssistant } from './AIAssistant'
import { TemplatePicker } from './TemplatePicker'
import { PropertiesPanel, Toolbar } from './Toolbar'

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
  const containerRef = useRef(null)
  const canvasWrapperRef = useRef(null)
  const fabricRef = useRef(null)
  const [selectedObject, setSelectedObject] = useState(null)
  const [activeTool, setActiveTool] = useState(null)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [zoom, setZoom] = useState(1)

  // Zoom constants
  const ZOOM_MIN = 0.25
  const ZOOM_MAX = 4
  const ZOOM_STEP = 0.25

  // Calculate pixel dimensions
  const widthPx = mmToPixels(widthMm)
  const heightPx = mmToPixels(heightMm)

  // Interaction modes: 'select', 'pan'
  const [interactionMode, setInteractionMode] = useState('select')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [snapEnabled, setSnapEnabled] = useState(false)
  const isDraggingRef = useRef(false)
  const lastPosXRef = useRef(0)
  const lastPosYRef = useRef(0)
  const panPositionRef = useRef({ x: 0, y: 0 })
  const snapEnabledRef = useRef(snapEnabled)

  // Undo/Redo State
  const [history, setHistory] = useState([])
  const [historyStep, setHistoryStep] = useState(-1)
  const isHistoryProcessing = useRef(false)

  // Update ref when state changes
  useEffect(() => {
    snapEnabledRef.current = snapEnabled
  }, [snapEnabled])

  // Initialize Fabric canvas
  useEffect(() => {
    if (!containerRef.current) return

    // Create canvas element
    const canvasEl = document.createElement('canvas')
    canvasEl.width = widthPx
    canvasEl.height = heightPx
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(canvasEl)

    // Initialize Fabric canvas
    const fabricCanvas = new Canvas(canvasEl, {
      backgroundColor: backgroundColor,
      preserveObjectStacking: true,
      // Disable default selection in pan mode
      selection: interactionMode === 'select',
    })

    fabricRef.current = fabricCanvas

    // Store canvas element reference for printing
    if (canvasRef) {
      canvasRef.current = canvasEl
    }

    // Notify parent
    if (onCanvasReady) {
      onCanvasReady(fabricCanvas)
    }

    // Selection event handlers
    fabricCanvas.on('selection:created', (e) => {
      setSelectedObject(e.selected?.[0] || null)
    })

    fabricCanvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected?.[0] || null)
    })

    fabricCanvas.on('selection:cleared', () => {
      setSelectedObject(null)
    })

    // Object modified handler for real-time updates
    fabricCanvas.on('object:modified', () => {
      const active = fabricCanvas.getActiveObject()
      if (active) {
        setSelectedObject({ ...active, type: active.type })
      }
    })

    // Text editing events
    fabricCanvas.on('text:changed', () => {
      const active = fabricCanvas.getActiveObject()
      if (active) {
        setSelectedObject({ ...active, type: active.type })
      }
    })

    fabricCanvas.on('text:editing:entered', () => {
      const active = fabricCanvas.getActiveObject()
      if (active) {
        setSelectedObject({ ...active, type: active.type })
      }
    })

    // Smart Snap (Smart Guides)
    fabricCanvas.on('object:moving', (e) => {
      if (!snapEnabledRef.current) return

      const obj = e.target
      const threshold = 6 / zoom // Lower threshold (6px) for smarter feeling
      const canvasWidth = widthPx
      const canvasHeight = heightPx

      // Clear existing guides
      fabricCanvas.getObjects('line').forEach((o) => {
        if (o.id?.startsWith('guide-')) {
          fabricCanvas.remove(o)
        }
      })

      // Get all other objects to snap to
      const otherObjects = fabricCanvas
        .getObjects()
        .filter(
          (o) =>
            o !== obj &&
            o.id !== 'guide-h' &&
            o.id !== 'guide-v' &&
            !o.id?.startsWith('guide-') &&
            o.visible &&
            o.evented,
        )

      // Collect snap candidates (Vertical lines)
      const verticalCandidates = [
        { x: 0, type: 'canvas' },
        { x: canvasWidth / 2, type: 'canvas' },
        { x: canvasWidth, type: 'canvas' },
      ]

      // Collect snap candidates (Horizontal lines)
      const horizontalCandidates = [
        { y: 0, type: 'canvas' },
        { y: canvasHeight / 2, type: 'canvas' },
        { y: canvasHeight, type: 'canvas' },
      ]

      // Add other objects' edges/centers as candidates
      otherObjects.forEach((target) => {
        const tb = target.getBoundingRect()
        verticalCandidates.push(
          { x: tb.left, type: 'object' },
          { x: tb.left + tb.width / 2, type: 'object' },
          { x: tb.left + tb.width, type: 'object' },
        )
        horizontalCandidates.push(
          { y: tb.top, type: 'object' },
          { y: tb.top + tb.height / 2, type: 'object' },
          { y: tb.top + tb.height, type: 'object' },
        )
      })

      // Calculate Object's current bounds
      const b = obj.getBoundingRect(true) // Absolute coords

      // Points on the moving object we want to align: [Left, Center, Right]
      const objVPoints = [
        { x: b.left, offset: 0 },
        { x: b.left + b.width / 2, offset: b.width / 2 },
        { x: b.left + b.width, offset: b.width },
      ]

      // Points on the moving object we want to align: [Top, Center, Bottom]
      const objHPoints = [
        { y: b.top, offset: 0 },
        { y: b.top + b.height / 2, offset: b.height / 2 },
        { y: b.top + b.height, offset: b.height },
      ]

      let bestDx = null
      let bestDy = null
      let snapX = null
      let snapY = null

      // Find best Vertical snap
      for (const cand of verticalCandidates) {
        for (const point of objVPoints) {
          const dist = cand.x - point.x
          if (Math.abs(dist) < threshold) {
            // Prioritize smaller distance
            if (bestDx === null || Math.abs(dist) < Math.abs(bestDx)) {
              bestDx = dist
              snapX = cand.x
            }
          }
        }
      }

      // Find best Horizontal snap
      for (const cand of horizontalCandidates) {
        for (const point of objHPoints) {
          const dist = cand.y - point.y
          if (Math.abs(dist) < threshold) {
            if (bestDy === null || Math.abs(dist) < Math.abs(bestDy)) {
              bestDy = dist
              snapY = cand.y
            }
          }
        }
      }

      // Apply Snap
      if (bestDx !== null) {
        obj.left += bestDx
        obj.setCoords()
      }
      if (bestDy !== null) {
        obj.top += bestDy
        obj.setCoords()
      }

      // Draw Guides (Visual Feedback)
      if (snapX !== null) {
        const line = new Line([snapX, 0, snapX, canvasHeight], {
          stroke: 'cyan',
          strokeWidth: 1 / zoom,
          selectable: false,
          evented: false,
          strokeDashArray: [4, 4],
          id: 'guide-v',
        })
        fabricCanvas.add(line)
      }

      if (snapY !== null) {
        const line = new Line([0, snapY, canvasWidth, snapY], {
          stroke: 'cyan',
          strokeWidth: 1 / zoom,
          selectable: false,
          evented: false,
          strokeDashArray: [4, 4],
          id: 'guide-h',
        })
        fabricCanvas.add(line)
      }
    })
    const clearGuidelines = () => {
      fabricCanvas.getObjects('line').forEach((o) => {
        if (o.id?.startsWith('guide-')) {
          fabricCanvas.remove(o)
        }
      })
    }

    // Clear guidelines on mouse up
    fabricCanvas.on('mouse:up', () => {
      fabricCanvas.getObjects('line').forEach((o) => {
        if (o.id && (o.id === 'guide-v' || o.id === 'guide-h')) {
          fabricCanvas.remove(o)
        }
      })
      fabricCanvas.requestRenderAll()
    })

    // Panning Handlers (Infinite Canvas via CSS Transform)
    fabricCanvas.on('mouse:down', (opt) => {
      const evt = opt.e
      if (interactionModeRef.current === 'pan') {
        isDraggingRef.current = true
        fabricCanvas.selection = false
        lastPosXRef.current = evt.clientX
        lastPosYRef.current = evt.clientY
        fabricCanvas.defaultCursor = 'grabbing'
      }
    })

    fabricCanvas.on('mouse:move', (opt) => {
      if (isDraggingRef.current && interactionModeRef.current === 'pan') {
        const e = opt.e

        // Calculate delta
        const deltaX = e.clientX - lastPosXRef.current
        const deltaY = e.clientY - lastPosYRef.current

        // Update pan position
        panPositionRef.current.x += deltaX
        panPositionRef.current.y += deltaY

        // Apply transform directly to parent container for performance
        if (containerRef.current?.parentElement) {
          containerRef.current.parentElement.style.transform = `translate(${panPositionRef.current.x}px, ${panPositionRef.current.y}px)`
        }

        lastPosXRef.current = e.clientX
        lastPosYRef.current = e.clientY
      }
    })

    fabricCanvas.on('mouse:up', () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false
        fabricCanvas.defaultCursor = 'grab'
      }
    })

    // Cleanup
    return () => {
      fabricCanvas.dispose()
    }
  }, [widthPx, heightPx]) // Re-init on size change (simplest approach)

  // Undo/Redo Logic
  const saveHistory = useCallback(() => {
    if (!fabricRef.current || isHistoryProcessing.current) return

    // Save current state
    const json = JSON.stringify(fabricRef.current.toJSON(['id', 'selectable', 'evented']))

    // If we are in the middle of history, discard future
    const newHistory = history.slice(0, historyStep + 1)
    newHistory.push(json)

    // Limit history size
    if (newHistory.length > 50) {
      newHistory.shift()
    }

    setHistory(newHistory)
    setHistoryStep(newHistory.length - 1)
  }, [history, historyStep])

  // Attach history listeners
  useEffect(() => {
    if (!fabricRef.current) return
    const canvas = fabricRef.current

    const handleSave = () => saveHistory()

    // Save initial state if empty
    if (history.length === 0) {
      saveHistory()
    }

    canvas.on('object:added', handleSave)
    canvas.on('object:removed', handleSave)
    canvas.on('object:modified', handleSave)

    return () => {
      canvas.off('object:added', handleSave)
      canvas.off('object:removed', handleSave)
      canvas.off('object:modified', handleSave)
    }
  }, [fabricRef.current, saveHistory])

  const handleUndo = async () => {
    if (historyStep <= 0 || !fabricRef.current) return

    isHistoryProcessing.current = true
    const previousState = history[historyStep - 1]

    try {
      await fabricRef.current.loadFromJSON(previousState)
      fabricRef.current.renderAll()
    } finally {
      isHistoryProcessing.current = false
    }

    setHistoryStep(historyStep - 1)
  }

  const handleRedo = async () => {
    if (historyStep >= history.length - 1 || !fabricRef.current) return

    isHistoryProcessing.current = true
    const nextState = history[historyStep + 1]

    try {
      await fabricRef.current.loadFromJSON(nextState)
      fabricRef.current.renderAll()
    } finally {
      isHistoryProcessing.current = false
    }

    setHistoryStep(historyStep + 1)
  }

  // Update selection mode when interaction mode changes
  useEffect(() => {
    if (fabricRef.current) {
      // Enable/disable group selection based on mode
      fabricRef.current.selection = interactionMode === 'select'
      // Also ensure all objects are selectable/evented based on mode if needed
      // But usually just toggling canvas.selection is enough for the drag box.
      // Individual object selection is handled by Fabric default.
    }
  }, [interactionMode])

  // Update background color
  useEffect(() => {
    if (!fabricRef.current) return
    fabricRef.current.backgroundColor = backgroundColor
    fabricRef.current.renderAll()
  }, [backgroundColor])

  // Handle interaction mode changes
  const interactionModeRef = useRef(interactionMode)
  useEffect(() => {
    interactionModeRef.current = interactionMode
    if (!fabricRef.current) return

    fabricRef.current.selection = interactionMode === 'select'
    fabricRef.current.defaultCursor = interactionMode === 'pan' ? 'grab' : 'default'

    // If switching to pan, discard selection
    if (interactionMode === 'pan') {
      fabricRef.current.discardActiveObject()
      fabricRef.current.renderAll()
    }
  }, [interactionMode])

  // Handle zoom updates
  useEffect(() => {
    if (!fabricRef.current) return

    const canvas = fabricRef.current
    canvas.setDimensions({
      width: widthPx * zoom,
      height: heightPx * zoom,
    })
    canvas.setZoom(zoom)
    canvas.renderAll()
  }, [zoom, widthPx, heightPx])

  // Add text to canvas
  const handleAddText = useCallback(() => {
    if (!fabricRef.current) return

    const text = new IText('Text', {
      left: 50,
      top: 50,
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000',
    })

    fabricRef.current.add(text)
    fabricRef.current.setActiveObject(text)
    fabricRef.current.renderAll()
    setActiveTool('text')
  }, [])

  // Generate and add barcode
  const handleAddBarcode = useCallback(async () => {
    if (!fabricRef.current) return

    const barcodeValue = prompt('Enter barcode value:', '12345678')
    if (!barcodeValue) return

    try {
      // Create temp canvas for barcode
      const tempCanvas = document.createElement('canvas')
      bwipjs.toCanvas(tempCanvas, {
        bcid: 'code128',
        text: barcodeValue,
        scale: 2,
        height: 10,
        includetext: true,
        textxalign: 'center',
      })

      // Convert to Fabric image
      const img = await FabricImage.fromURL(tempCanvas.toDataURL())
      img.set({
        left: 50,
        top: 50,
      })

      fabricRef.current.add(img)
      fabricRef.current.setActiveObject(img)
      fabricRef.current.renderAll()
      setActiveTool('barcode')
    } catch (err) {
      console.error('Barcode generation error:', err)
      alert(`Failed to generate barcode: ${err.message}`)
    }
  }, [])

  // Generate and add QR code
  const handleAddQRCode = useCallback(async () => {
    if (!fabricRef.current) return

    const qrValue = prompt('Enter QR code data:', 'https://example.com')
    if (!qrValue) return

    try {
      const tempCanvas = document.createElement('canvas')
      bwipjs.toCanvas(tempCanvas, {
        bcid: 'qrcode',
        text: qrValue,
        scale: 3,
        eclevel: 'M',
      })

      const img = await FabricImage.fromURL(tempCanvas.toDataURL())
      img.set({
        left: 50,
        top: 50,
      })

      fabricRef.current.add(img)
      fabricRef.current.setActiveObject(img)
      fabricRef.current.renderAll()
      setActiveTool('qrcode')
    } catch (err) {
      console.error('QR code generation error:', err)
      alert(`Failed to generate QR code: ${err.message}`)
    }
  }, [])

  // Add shape to canvas
  const handleAddShape = useCallback((shapeType) => {
    if (!fabricRef.current) return

    let shape
    if (shapeType === 'rect') {
      shape = new Rect({
        left: 50,
        top: 50,
        width: 80,
        height: 50,
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 2,
      })
      setActiveTool('rectangle')
    } else if (shapeType === 'circle') {
      shape = new Circle({
        left: 50,
        top: 50,
        radius: 30,
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 2,
      })
      setActiveTool('circle')
    }

    if (shape) {
      fabricRef.current.add(shape)
      fabricRef.current.setActiveObject(shape)
      fabricRef.current.renderAll()
    }
  }, [])

  // Add line to canvas
  const handleAddLine = useCallback(() => {
    if (!fabricRef.current) return

    const line = new Line([50, 50, 150, 50], {
      stroke: '#000000',
      strokeWidth: 2,
      selectable: true,
    })

    fabricRef.current.add(line)
    fabricRef.current.setActiveObject(line)
    fabricRef.current.renderAll()
    setActiveTool('line')
  }, [])

  // Add image from file
  const handleAddImage = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const img = await FabricImage.fromURL(event.target.result)

          // Scale down if too large
          const maxSize = Math.min(widthPx, heightPx) * 0.8
          if (img.width > maxSize || img.height > maxSize) {
            const scale = maxSize / Math.max(img.width, img.height)
            img.scale(scale)
          }

          img.set({
            left: 50,
            top: 50,
          })

          fabricRef.current.add(img)
          fabricRef.current.setActiveObject(img)
          fabricRef.current.renderAll()
        } catch (err) {
          console.error('Image load error:', err)
          alert('Failed to load image')
        }
      }
      reader.readAsDataURL(file)
    }
    input.click()
    setActiveTool('image')
  }, [widthPx, heightPx])

  // Object manipulation handlers
  const handleDelete = useCallback(() => {
    if (!fabricRef.current) return
    const active = fabricRef.current.getActiveObject()
    if (active) {
      fabricRef.current.remove(active)
      fabricRef.current.renderAll()
      setSelectedObject(null)
    }
  }, [])

  const handleRotate = useCallback(() => {
    if (!fabricRef.current) return
    const active = fabricRef.current.getActiveObject()
    if (active) {
      active.rotate((active.angle || 0) + 90)
      fabricRef.current.renderAll()
      setSelectedObject({ ...active })
    }
  }, [])

  const handleFlipH = useCallback(() => {
    if (!fabricRef.current) return
    const active = fabricRef.current.getActiveObject()
    if (active) {
      active.set('flipX', !active.flipX)
      fabricRef.current.renderAll()
      setSelectedObject({ ...active })
    }
  }, [])

  const handleFlipV = useCallback(() => {
    if (!fabricRef.current) return
    const active = fabricRef.current.getActiveObject()
    if (active) {
      active.set('flipY', !active.flipY)
      fabricRef.current.renderAll()
      setSelectedObject({ ...active })
    }
  }, [])

  const handleDuplicate = useCallback(async () => {
    if (!fabricRef.current) return
    const active = fabricRef.current.getActiveObject()
    if (active) {
      const cloned = await active.clone()
      cloned.set({
        left: (active.left || 0) + 20,
        top: (active.top || 0) + 20,
      })
      fabricRef.current.add(cloned)
      fabricRef.current.setActiveObject(cloned)
      fabricRef.current.renderAll()
    }
  }, [])

  const handleBringForward = useCallback(() => {
    if (!fabricRef.current) return
    const active = fabricRef.current.getActiveObject()
    if (active) {
      fabricRef.current.bringObjectForward(active)
      fabricRef.current.renderAll()
    }
  }, [])

  const handleSendBackward = useCallback(() => {
    if (!fabricRef.current) return
    const active = fabricRef.current.getActiveObject()
    if (active) {
      fabricRef.current.sendObjectBackwards(active)
      fabricRef.current.renderAll()
    }
  }, [])

  const handleUpdateProperty = useCallback((property, value) => {
    if (!fabricRef.current) return
    const active = fabricRef.current.getActiveObject()
    if (active) {
      active.set(property, value)
      fabricRef.current.renderAll()
      setSelectedObject({ ...active, type: active.type })
    }
  }, [])

  // Select all objects on canvas
  const handleSelectAll = useCallback(() => {
    if (!fabricRef.current) return
    const objects = fabricRef.current.getObjects()
    if (objects.length === 0) return

    // Discard current selection
    fabricRef.current.discardActiveObject()

    // Create active selection with all objects
    const selection = new ActiveSelection(objects, {
      canvas: fabricRef.current,
    })

    fabricRef.current.setActiveObject(selection)
    fabricRef.current.renderAll()
    setSelectedObject(selection)
  }, [])

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, ZOOM_MAX))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, ZOOM_MIN))
  }, [])

  const handleZoomReset = useCallback(() => {
    setZoom(1)
  }, [])

  // Handle mouse wheel zoom - use native event listener to properly prevent browser zoom
  useEffect(() => {
    const wrapper = canvasWrapperRef.current
    if (!wrapper) return

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        e.stopPropagation()
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
        setZoom((prev) => Math.min(Math.max(prev + delta, ZOOM_MIN), ZOOM_MAX))
      }
    }

    // Use passive: false to allow preventDefault
    wrapper.addEventListener('wheel', handleWheel, { passive: false })
    return () => wrapper.removeEventListener('wheel', handleWheel)
  }, [])

  const [currentTemplate, setCurrentTemplate] = useState(null)
  const isLoadingTemplate = useRef(false)

  // Re-apply template when label size changes
  useEffect(() => {
    if (currentTemplate && !isLoadingTemplate.current) {
      handleLoadTemplate(currentTemplate)
    }
  }, [widthMm, heightMm])

  // Load template onto canvas with automatic scaling to fit current label size
  const handleLoadTemplate = useCallback(
    async (template, targetSize) => {
      if (!fabricRef.current) return

      // Prevent recursive updates
      isLoadingTemplate.current = true
      isHistoryProcessing.current = true // Lock history during load

      try {
        // Update persistent template reference
        setCurrentTemplate(template)

        // Update label size if provided (from TemplatePicker)
        // Only return if size ACTUALLY changes, otherwise fallback to immediate render
        if (targetSize && onLabelSizeChange) {
          if (targetSize.width !== widthMm || targetSize.height !== heightMm) {
            onLabelSizeChange(targetSize.width, targetSize.height)
            // Wait for effect to trigger
            // Note: Effect will handle cleanup via isLoadingTemplate check/reset,
            // but we must release local lock if effect DOESN'T run essentially.
            // Actually, if we return, we expect effect to re-trigger load.
            // But we must release history lock? No, effect will call load again.
            // But wait, if we return here, we exit the function.
            // isLoadingTemplate stays true.
            // Effect (line 765) sees currentTemplate set?
            // Line 765: if (currentTemplate && !isLoadingTemplate.current)
            // If we leave it true, effect WON'T run.
            // So we must set it false?
            // The original code set it false (lines 787).
            // So we must set it false here too.
            isLoadingTemplate.current = false
            isHistoryProcessing.current = false
            return
          }
        }

        // Clear existing objects
        fabricRef.current.clear()
        fabricRef.current.backgroundColor = '#ffffff'

        // Get template's original design size (in pixels at 203 DPI)
        const templateWidthMm = template.labelSize?.width || 50
        const templateHeightMm = template.labelSize?.height || 30
        const templateWidthPx = mmToPixels(templateWidthMm)
        const templateHeightPx = mmToPixels(templateHeightMm)

        // Get current canvas size (user's selected label size)
        const canvasWidthPx = mmToPixels(widthMm)
        const canvasHeightPx = mmToPixels(heightMm)

        // Calculate scale factors to fit template content to current label
        // Scale proportionally to maintain aspect ratio, fitting within bounds
        const scaleX = canvasWidthPx / templateWidthPx
        const scaleY = canvasHeightPx / templateHeightPx

        // Use independent scaling for positions/layout to fill the label
        // Use uniform scaling for text/content to prevent distortion
        const contentScale = Math.min(scaleX, scaleY)

        // Add template objects with scaling
        for (const obj of template.objects || []) {
          // Scale position - stretch to fill
          const scaledLeft = (obj.left || 0) * scaleX
          const scaledTop = (obj.top || 0) * scaleY

          if (obj.type === 'text') {
            const text = new IText(obj.text || 'Text', {
              left: scaledLeft,
              top: scaledTop,
              fontSize: Math.max(6, (obj.fontSize || 14) * contentScale),
              fontFamily: obj.fontFamily || 'Arial',
              fontWeight: obj.fontWeight || 'normal',
              fontStyle: obj.fontStyle || 'normal',
              textAlign: obj.textAlign || 'left',
              fill: obj.fill || '#000000',
              angle: obj.angle || 0,
              originX: obj.originX || 'left',
              originY: obj.originY || 'top',
            })
            fabricRef.current.add(text)
          } else if (obj.type === 'rect') {
            const rect = new Rect({
              left: scaledLeft,
              top: scaledTop,
              width: (obj.width || 80) * scaleX,
              height: (obj.height || 50) * scaleY,
              fill: obj.fill || 'transparent',
              stroke: obj.stroke || '#000000',
              strokeWidth: Math.max(1, (obj.strokeWidth || 2) * contentScale),
            })
            fabricRef.current.add(rect)
          } else if (obj.type === 'barcode' || obj.type === 'qrcode') {
            try {
              const tempCanvas = document.createElement('canvas')
              bwipjs.toCanvas(tempCanvas, {
                bcid: obj.type === 'qrcode' ? 'qrcode' : obj.format || 'code128',
                text: obj.value || '123456',
                scale: obj.type === 'qrcode' ? 3 : 2,
                height: obj.height || 10, // Always provide height, even for QR
                includetext: obj.type !== 'qrcode',
                textxalign: 'center',
              })
              const img = await FabricImage.fromURL(tempCanvas.toDataURL())

              // Calculate scale to match requested width if provided, otherwise use contentScale
              let finalScale = contentScale
              if (obj.width) {
                const targetWidth = obj.width * scaleX
                if (img.width > 0) {
                  finalScale = targetWidth / img.width
                }
              }

              img.set({ left: scaledLeft, top: scaledTop })
              img.scale(finalScale)
              fabricRef.current.add(img)
            } catch (err) {
              console.error('Barcode generation error:', err)
            }
          } else if (obj.type === 'line') {
            const line = new Line(
              [
                (obj.x1 ?? 0) * scaleX,
                (obj.y1 ?? 0) * scaleY,
                (obj.x2 ?? 100) * scaleX,
                (obj.y2 ?? 0) * scaleY,
              ],
              {
                left: scaledLeft,
                top: scaledTop,
                stroke: obj.stroke || '#000000',
                strokeWidth: Math.max(1, (obj.strokeWidth || 2) * contentScale),
              },
            )
            fabricRef.current.add(line)
          }
        }

        fabricRef.current.renderAll()
      } finally {
        isLoadingTemplate.current = false
        isHistoryProcessing.current = false
        saveHistory() // Save template state
      }
    },
    [widthMm, heightMm, onLabelSizeChange, saveHistory],
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!fabricRef.current) return

      // Delete key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Don't delete if editing text
        const active = fabricRef.current.getActiveObject()
        if (active?.isEditing) return
        handleDelete()
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        fabricRef.current.discardActiveObject()
        fabricRef.current.renderAll()
      }

      // Zoom shortcuts (when not editing text)
      const active = fabricRef.current.getActiveObject()
      if (active?.isEditing) return

      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        handleZoomIn()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        handleZoomOut()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        handleZoomReset()
      }
      // Select all (Ctrl+A)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        handleSelectAll()
      }

      // Undo (Ctrl+Z)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }

      // Redo (Ctrl+Y or Ctrl+Shift+Z)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    handleDelete,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleSelectAll,
    setInteractionMode,
  ])

  return (
    <div className='flex-1 flex overflow-hidden relative'>
      {/* Left Toolbar */}
      <div className='p-3'>
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

      {/* Canvas Area - Infinite Workspace */}
      <div
        ref={canvasWrapperRef}
        className='canvas-wrapper flex-1 overflow-hidden flex items-center justify-center bg-gray-900'
      >
        <div
          className='relative inline-block transition-transform duration-75 ease-out will-change-transform'
          style={{ minWidth: 'fit-content' }}
        >
          {/* Size and zoom indicator */}
          <div className='absolute -top-6 left-0 text-xs text-gray-400 flex items-center gap-4'>
            <span>
              {widthMm}mm × {heightMm}mm ({widthPx}px × {heightPx}px @ 203 DPI)
            </span>
            <span className='text-highlight'>{Math.round(zoom * 100)}%</span>
          </div>

          {/* Canvas container with zoom transform */}
          <div ref={containerRef} className='canvas-container relative' />
        </div>
      </div>

      {/* Right Properties Panel */}
      <div className='p-3'>
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
        labelWidth={widthMm}
        labelHeight={heightMm}
      />

      {/* Stitch-style Floating Controls */}

      {/* Bottom Left: Status & Background */}
      <div className='absolute bottom-6 left-20 flex items-center gap-3 bg-gray-900/90 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm z-50'>
        {/* Zoom Indicator */}
        <div className='text-sm font-medium border-r border-gray-700 pr-3 mr-1'>
          {Math.round(zoom * 100)}%
        </div>

        {/* Background Color Picker */}
        <div className='flex items-center gap-2'>
          <div
            className='w-4 h-4 rounded-full border border-gray-500 cursor-pointer'
            style={{ backgroundColor: backgroundColor }}
            onClick={() => document.getElementById('bg-color-picker').click()}
          />
          <input
            id='bg-color-picker'
            type='color'
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className='w-0 h-0 opacity-0 absolute'
          />
        </div>
      </div>

      {/* Bottom Center: Tools */}
      <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900/90 text-white px-2 py-1.5 rounded-full shadow-lg backdrop-blur-sm z-50'>
        {/* Undo */}
        <button
          onClick={handleUndo}
          disabled={historyStep <= 0}
          className='p-2 rounded-full hover:bg-gray-700 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed'
          title='Undo (Ctrl+Z)'
        >
          <Undo size={20} />
        </button>

        {/* Redo */}
        <button
          onClick={handleRedo}
          disabled={historyStep >= history.length - 1}
          className='p-2 rounded-full hover:bg-gray-700 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed'
          title='Redo (Ctrl+Y)'
        >
          <Redo size={20} />
        </button>

        <div className='w-px h-6 bg-gray-700 mx-1' />

        {/* Select Tool */}
        <button
          onClick={() => setInteractionMode('select')}
          className={`p-2 rounded-full transition-colors ${interactionMode === 'select' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-400'}`}
          title='Select (V)'
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z' />
            <path d='M13 13l6 6' />
          </svg>
        </button>

        {/* Pan Tool */}
        <button
          onClick={() => setInteractionMode('pan')}
          className={`p-2 rounded-full transition-colors ${interactionMode === 'pan' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-400'}`}
          title='Pan (H)'
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0' />
            <path d='M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2' />
            <path d='M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8' />
            <path d='M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15' />
          </svg>
        </button>

        <div className='w-px h-6 bg-gray-700 mx-1' />

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          disabled={zoom <= ZOOM_MIN}
          className='p-2 rounded-full hover:bg-gray-700 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed'
          title='Zoom Out'
        >
          <ZoomOut size={20} />
        </button>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          disabled={zoom >= ZOOM_MAX}
          className='p-2 rounded-full hover:bg-gray-700 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed'
          title='Zoom In'
        >
          <ZoomIn size={20} />
        </button>

        <div className='w-px h-6 bg-gray-700 mx-1' />

        {/* Snap Toggle */}
        <button
          onClick={() => setSnapEnabled(!snapEnabled)}
          className={`p-2 rounded-full transition-colors ${snapEnabled ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-400'}`}
          title={snapEnabled ? 'Disable Snap to Edge' : 'Enable Snap to Edge'}
        >
          <Magnet size={20} />
        </button>

        <div className='w-px h-6 bg-gray-700 mx-1' />

        {/* Add Image */}
        <button
          onClick={handleAddImage}
          className='p-2 rounded-full hover:bg-gray-700 text-gray-400'
          title='Add Image'
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <rect x='3' y='3' width='18' height='18' rx='2' ry='2' />
            <circle cx='8.5' cy='8.5' r='1.5' />
            <polyline points='21 15 16 10 5 21' />
          </svg>
        </button>
      </div>
    </div>
  )
}
