import {
  Barcode,
  Circle,
  Copy,
  FlipHorizontal,
  FlipVertical,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  Minus,
  QrCode,
  RotateCw,
  Sparkles,
  Square,
  Trash2,
  Type,
} from 'lucide-react'

/**
 * Left toolbar with drawing tools
 */
export function Toolbar({
  onAddText,
  onAddBarcode,
  onAddQRCode,
  onAddShape,
  onAddLine,
  onAddImage,
  onOpenTemplates,
  onOpenAI,
  activeTool,
}) {
  const tools = [
    { id: 'text', icon: Type, label: 'Add Text', action: onAddText },
    { id: 'barcode', icon: Barcode, label: 'Add Barcode', action: onAddBarcode },
    { id: 'qrcode', icon: QrCode, label: 'Add QR Code', action: onAddQRCode },
    { id: 'rectangle', icon: Square, label: 'Add Rectangle', action: () => onAddShape('rect') },
    { id: 'circle', icon: Circle, label: 'Add Circle', action: () => onAddShape('circle') },
    { id: 'line', icon: Minus, label: 'Add Line', action: onAddLine },
    { id: 'image', icon: ImageIcon, label: 'Add Image', action: onAddImage },
  ]

  return (
    <div className='panel p-2 flex flex-col gap-1'>
      {/* Templates Button - Large and Prominent */}
      <button
        onClick={onOpenTemplates}
        className='flex flex-col items-center gap-2 p-4 mb-2 rounded-xl bg-gradient-to-br from-highlight to-purple-600 hover:from-highlight/90 hover:to-purple-500 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105'
        title='Browse Templates'
      >
        <LayoutTemplate size={28} />
        <span className='text-sm font-bold tracking-wide'>TEMPLATES</span>
        <span className='text-xs opacity-80'>60+ designs</span>
      </button>

      {/* AI Assistant Button */}
      <button
        onClick={onOpenAI}
        className='flex flex-col items-center gap-2 p-3 mb-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105'
        title='AI Label Assistant'
      >
        <Sparkles size={24} className='animate-pulse' />
        <span className='text-sm font-bold'>AI ASSIST</span>
      </button>

      <h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 py-1'>
        Tools
      </h3>
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={tool.action}
          className={`tool-btn flex items-center gap-3 ${activeTool === tool.id ? 'active' : ''}`}
          title={tool.label}
        >
          <tool.icon size={20} />
          <span className='text-sm'>{tool.label}</span>
        </button>
      ))}
    </div>
  )
}

/**
 * Right panel for object properties
 */
export function PropertiesPanel({
  selectedObject,
  onDelete,
  onRotate,
  onFlipH,
  onFlipV,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onUpdateProperty,
}) {
  if (!selectedObject) {
    return (
      <div className='panel p-4 w-64'>
        <h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4'>
          Properties
        </h3>
        <p className='text-sm text-gray-500 italic'>Select an object to edit its properties</p>
      </div>
    )
  }

  const objectType = selectedObject.type

  return (
    <div className='panel p-4 w-64 space-y-4'>
      <h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>Properties</h3>

      {/* Object type indicator */}
      <div className='text-sm text-gray-300 capitalize bg-accent/30 px-2 py-1 rounded'>
        {objectType}
      </div>

      {/* Action buttons */}
      <div className='flex flex-wrap gap-2'>
        <button onClick={onRotate} className='tool-btn p-2' title='Rotate 90°'>
          <RotateCw size={16} />
        </button>
        <button onClick={onFlipH} className='tool-btn p-2' title='Flip Horizontal'>
          <FlipHorizontal size={16} />
        </button>
        <button onClick={onFlipV} className='tool-btn p-2' title='Flip Vertical'>
          <FlipVertical size={16} />
        </button>
        <button onClick={onDuplicate} className='tool-btn p-2' title='Duplicate'>
          <Copy size={16} />
        </button>
        <button onClick={onBringForward} className='tool-btn p-2' title='Bring Forward'>
          <Layers size={16} />
        </button>
        <button onClick={onDelete} className='tool-btn p-2 hover:bg-red-500/50' title='Delete'>
          <Trash2 size={16} />
        </button>
      </div>

      {/* Text-specific properties */}
      {(objectType === 'i-text' ||
        objectType === 'textbox' ||
        objectType === 'text' ||
        objectType === 'IText') && (
        <div className='space-y-3'>
          <div>
            <label className='text-xs text-gray-400 block mb-1'>Text Content</label>
            <textarea
              value={selectedObject.text || ''}
              onChange={(e) => onUpdateProperty('text', e.target.value)}
              className='w-full h-20 bg-gray-700 border border-gray-600 rounded p-2 text-sm text-white resize-none focus:outline-none focus:border-highlight'
              placeholder='Enter text...'
            />
          </div>
          <div>
            <label className='text-xs text-gray-400 block mb-1'>Font Size</label>
            <select
              value={Math.round(selectedObject.fontSize || 24)}
              onChange={(e) => onUpdateProperty('fontSize', Number.parseInt(e.target.value, 10))}
              className='w-full'
            >
              {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96].map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='text-xs text-gray-400 block mb-1'>Font Family</label>
            <select
              value={selectedObject.fontFamily || 'Arial'}
              onChange={(e) => onUpdateProperty('fontFamily', e.target.value)}
              className='w-full'
            >
              <optgroup label='Google Fonts'>
                <option value='Inter'>Inter</option>
                <option value='Roboto'>Roboto</option>
                <option value='Open Sans'>Open Sans</option>
                <option value='Lato'>Lato</option>
                <option value='Montserrat'>Montserrat</option>
                <option value='Poppins'>Poppins</option>
                <option value='Raleway'>Raleway</option>
                <option value='Oswald'>Oswald</option>
                <option value='Playfair Display'>Playfair Display</option>
                <option value='Source Code Pro'>Source Code Pro</option>
              </optgroup>
              <optgroup label='Sans-serif'>
                <option value='Arial'>Arial</option>
                <option value='Helvetica'>Helvetica</option>
                <option value='Verdana'>Verdana</option>
                <option value='Tahoma'>Tahoma</option>
                <option value='Trebuchet MS'>Trebuchet MS</option>
                <option value='Impact'>Impact</option>
              </optgroup>
              <optgroup label='Serif'>
                <option value='Times New Roman'>Times New Roman</option>
                <option value='Georgia'>Georgia</option>
                <option value='Palatino Linotype'>Palatino</option>
                <option value='Book Antiqua'>Book Antiqua</option>
              </optgroup>
              <optgroup label='Monospace'>
                <option value='Courier New'>Courier New</option>
                <option value='Lucida Console'>Lucida Console</option>
                <option value='Consolas'>Consolas</option>
              </optgroup>
            </select>
          </div>

          {/* Text style buttons */}
          <div className='flex gap-2'>
            <button
              onClick={() =>
                onUpdateProperty(
                  'fontWeight',
                  selectedObject.fontWeight === 'bold' ? 'normal' : 'bold',
                )
              }
              className={`tool-btn p-2 flex-1 font-bold ${selectedObject.fontWeight === 'bold' ? 'active' : ''}`}
              title='Bold'
            >
              B
            </button>
            <button
              onClick={() =>
                onUpdateProperty(
                  'fontStyle',
                  selectedObject.fontStyle === 'italic' ? 'normal' : 'italic',
                )
              }
              className={`tool-btn p-2 flex-1 italic ${selectedObject.fontStyle === 'italic' ? 'active' : ''}`}
              title='Italic'
            >
              I
            </button>
            <button
              onClick={() => onUpdateProperty('underline', !selectedObject.underline)}
              className={`tool-btn p-2 flex-1 underline ${selectedObject.underline ? 'active' : ''}`}
              title='Underline'
            >
              U
            </button>
            <button
              onClick={() => onUpdateProperty('linethrough', !selectedObject.linethrough)}
              className={`tool-btn p-2 flex-1 line-through ${selectedObject.linethrough ? 'active' : ''}`}
              title='Strikethrough'
            >
              S
            </button>
          </div>

          {/* Text alignment */}
          <div>
            <label className='text-xs text-gray-400 block mb-1'>Alignment</label>
            <div className='flex gap-2'>
              <button
                onClick={() => onUpdateProperty('textAlign', 'left')}
                className={`tool-btn p-2 flex-1 ${selectedObject.textAlign === 'left' ? 'active' : ''}`}
                title='Align Left'
              >
                ⬅
              </button>
              <button
                onClick={() => onUpdateProperty('textAlign', 'center')}
                className={`tool-btn p-2 flex-1 ${selectedObject.textAlign === 'center' ? 'active' : ''}`}
                title='Align Center'
              >
                ⬌
              </button>
              <button
                onClick={() => onUpdateProperty('textAlign', 'right')}
                className={`tool-btn p-2 flex-1 ${selectedObject.textAlign === 'right' ? 'active' : ''}`}
                title='Align Right'
              >
                ➡
              </button>
            </div>
          </div>

          {/* Letter spacing */}
          <div>
            <label className='text-xs text-gray-400 block mb-1'>Letter Spacing</label>
            <input
              type='range'
              min='-50'
              max='200'
              value={selectedObject.charSpacing || 0}
              onChange={(e) => onUpdateProperty('charSpacing', Number.parseInt(e.target.value, 10))}
              className='w-full'
            />
          </div>

          {/* Line height */}
          <div>
            <label className='text-xs text-gray-400 block mb-1'>Line Height</label>
            <input
              type='range'
              min='0.5'
              max='3'
              step='0.1'
              value={selectedObject.lineHeight || 1.16}
              onChange={(e) => onUpdateProperty('lineHeight', Number.parseFloat(e.target.value))}
              className='w-full'
            />
          </div>
        </div>
      )}

      {/* Position & Size */}
      <div className='space-y-3 pt-2 border-t border-gray-700'>
        <div className='grid grid-cols-2 gap-2'>
          <div>
            <label className='text-xs text-gray-400 block mb-1'>X</label>
            <input
              type='number'
              key={`x-${Math.round(selectedObject.left || 0)}`}
              defaultValue={Math.round(selectedObject.left || 0)}
              onBlur={(e) => {
                const val = Number.parseInt(e.target.value, 10)
                if (!Number.isNaN(val)) onUpdateProperty('left', val)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.target.blur()
              }}
              className='w-full'
            />
          </div>
          <div>
            <label className='text-xs text-gray-400 block mb-1'>Y</label>
            <input
              type='number'
              key={`y-${Math.round(selectedObject.top || 0)}`}
              defaultValue={Math.round(selectedObject.top || 0)}
              onBlur={(e) => {
                const val = Number.parseInt(e.target.value, 10)
                if (!Number.isNaN(val)) onUpdateProperty('top', val)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.target.blur()
              }}
              className='w-full'
            />
          </div>
        </div>
        <div className='grid grid-cols-2 gap-2'>
          <div>
            <label className='text-xs text-gray-400 block mb-1'>Width</label>
            <input
              type='number'
              min='1'
              key={`w-${Math.round(selectedObject.width * (selectedObject.scaleX || 1))}`}
              defaultValue={Math.round(selectedObject.width * (selectedObject.scaleX || 1))}
              onBlur={(e) => {
                const newWidth = Number.parseInt(e.target.value, 10)
                if (!Number.isNaN(newWidth) && newWidth > 0) {
                  onUpdateProperty('scaleX', newWidth / selectedObject.width)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.target.blur()
              }}
              className='w-full'
            />
          </div>
          <div>
            <label className='text-xs text-gray-400 block mb-1'>Height</label>
            <input
              type='number'
              min='1'
              key={`h-${Math.round(selectedObject.height * (selectedObject.scaleY || 1))}`}
              defaultValue={Math.round(selectedObject.height * (selectedObject.scaleY || 1))}
              onBlur={(e) => {
                const newHeight = Number.parseInt(e.target.value, 10)
                if (!Number.isNaN(newHeight) && newHeight > 0) {
                  onUpdateProperty('scaleY', newHeight / selectedObject.height)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.target.blur()
              }}
              className='w-full'
            />
          </div>
        </div>
        <div>
          <label className='text-xs text-gray-400 block mb-1'>Rotation (°)</label>
          <input
            type='number'
            min='-360'
            max='360'
            key={`r-${Math.round(selectedObject.angle || 0)}`}
            defaultValue={Math.round(selectedObject.angle || 0)}
            onBlur={(e) => {
              const val = Number.parseInt(e.target.value, 10)
              if (!Number.isNaN(val)) onUpdateProperty('angle', val)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.target.blur()
            }}
            className='w-full'
          />
        </div>
      </div>
    </div>
  )
}
