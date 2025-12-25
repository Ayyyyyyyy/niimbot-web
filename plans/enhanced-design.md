# Niimbot Web - Enhanced Design Specification

## Executive Summary

This document outlines a comprehensive design enhancement plan for the niimbot-web application, transforming it from a functional single-page tool into a modern, professional label design and printing platform.

## Current State Analysis

### Existing Architecture
```
niimbot-web/
├── src/
│   ├── App.jsx (Main application - 295 lines)
│   ├── components/
│   │   ├── LabelDesigner.jsx (Canvas editor)
│   │   ├── SettingsModal.jsx (AI/print settings)
│   │   ├── TemplatePicker.jsx (Template selection)
│   │   ├── TopBar.jsx (Printer controls)
│   │   ├── AIAssistant.jsx (AI generation)
│   │   └── AIDebugLog.jsx (AI debugging)
│   ├── hooks/
│   │   └── usePrinter.js (Bluetooth printer management)
│   ├── services/
│   │   └── llmService.js (AI provider integration)
│   └── utils/
│       ├── utils.js (DPI conversion, canvas cleaning)
│       ├── templates.js (Pre-built label templates)
│       └── labelDatabase.js (Label storage)
```

### Technology Stack
- **React 19.2** - UI framework
- **Fabric.js 6.9** - Canvas manipulation
- **TailwindCSS 4** - Styling
- **Vite 7** - Build tool
- **@mmote/niimbluelib** - Niimbot printer protocol
- **bwip-js** - Barcode/QR code generation

### Current Limitations
1. **Single-page architecture** - No routing, no dashboard view
2. **Basic styling** - Limited design system, dark theme only
3. **No undo/redo** - Lost work on mistakes
4. **No layers panel** - Difficult to manage complex designs
5. **No history** - Can't revisit previous designs
6. **Limited accessibility** - Missing ARIA labels, keyboard navigation
7. **No batch printing** - One label at a time
8. **No export options** - Only JSON export available
9. **No print queue** - No job management
10. **No responsive design** - Desktop-centric layout

---

## Design Philosophy

### Core Principles
1. **Progressive Enhancement** - Maintain backward compatibility while adding features
2. **Component-Driven** - Modular, reusable components
3. **Accessibility First** - WCAG 2.1 AA compliance target
4. **Mobile-Responsive** - Touch-optimized interface
5. **Performance-Oriented** - Fast canvas rendering, efficient state updates

### Design Language
- **Modern & Clean** - Generous whitespace, clear visual hierarchy
- **Professional** - Suitable for lab/warehouse environments
- **Intuitive** - Discoverable features, clear affordances
- **Feedback-Rich** - Toast notifications, loading states, success indicators

---

## Enhanced Architecture

### New File Structure
```
niimbot-web/
├── src/
│   ├── App.jsx (Main router + layout)
│   ├── views/
│   │   ├── Designer.jsx (Label designer view)
│   │   ├── Dashboard.jsx (Recent designs, templates)
│   │   └── Settings.jsx (Application settings)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx (Navigation)
│   │   │   ├── Header.jsx (App header)
│   │   │   └── MainLayout.jsx (Page wrapper)
│   │   ├── designer/
│   │   │   ├── Canvas.jsx (Fabric canvas wrapper)
│   │   │   ├── Toolbar.jsx (Design tools)
│   │   │   ├── PropertiesPanel.jsx (Object properties)
│   │   │   ├── LayersPanel.jsx (Layer management)
│   │   │   └── ZoomControls.jsx (Zoom interface)
│   │   ├── dashboard/
│   │   │   ├── RecentDesigns.jsx (Design history)
│   │   │   ├── TemplateGallery.jsx (Template browser)
│   │   │   ├── PrintQueue.jsx (Print jobs)
│   │   │   └── QuickActions.jsx (Common actions)
│   │   ├── common/
│   │   │   ├── Button.jsx (Consistent button)
│   │   │   ├── IconButton.jsx (Icon buttons)
│   │   │   ├── Modal.jsx (Dialog wrapper)
│   │   │   ├── Toast.jsx (Notifications)
│   │   │   ├── Tooltip.jsx (Help text)
│   │   │   ├── Badge.jsx (Status indicators)
│   │   │   └── Dropdown.jsx (Select menus)
│   │   ├── settings/
│   │   │   ├── AIPanel.jsx (AI configuration)
│   │   │   ├── PrinterPanel.jsx (Printer settings)
│   │   │   ├── AppearancePanel.jsx (Theme settings)
│   │   │   └── GeneralPanel.jsx (App settings)
│   │   └── print/
│   │       ├── PrintPreview.jsx (Live preview)
│   │       └── BatchPrint.jsx (Multiple labels)
│   ├── contexts/
│   │   ├── AppContext.jsx (Global app state)
│   │   ├── DesignerContext.jsx (Canvas state)
│   │   ├── PrinterContext.jsx (Printer state)
│   │   └── SettingsContext.jsx (Settings state)
│   ├── hooks/
│   │   ├── useDesigner.js (Canvas operations)
│   │   ├── useHistory.js (Undo/redo)
│   │   ├── useLayers.js (Layer management)
│   │   ├── useExport.js (Export functions)
│   │   ├── useKeyboard.js (Keyboard shortcuts)
│   │   ├── useTheme.js (Theme management)
│   │   └── usePrinter.js (Existing - enhance)
│   ├── services/
│   │   ├── api.js (Backend API)
│   │   ├── storage.js (Local storage wrapper)
│   │   ├── export.js (Export handlers)
│   │   └── llm.js (Existing - enhance)
│   ├── stores/
│   │   ├── designerStore.js (Canvas state - Zustand)
│   │   ├── historyStore.js (Undo/redo - Zustand)
│   │   ├── settingsStore.js (Settings - Zustand)
│   │   └── printerStore.js (Printer state - Zustand)
│   ├── utils/
│   │   ├── constants.js (App constants)
│   │   ├── canvas.js (Fabric helpers)
│   │   ├── export.js (Export utilities)
│   │   ├── keyboard.js (Shortcut handlers)
│   │   ├── theme.js (Theme utilities)
│   │   └── validators.js (Form validation)
│   └── styles/
│       ├── index.css (Global styles)
│       ├── themes.css (Theme definitions)
│       └── components.css (Component styles)
└── public/
    └── icons/ (SVG icons)
```

### State Management Architecture

```mermaid
graph TD
    A[AppContext] -->|Global Settings|
    A -->|Theme|
    A -->|User Preferences|
    
    B[DesignerContext] -->|Canvas State|
    B -->|Objects|
    B -->|Selection|
    B -->|Zoom|
    B -->|History|
    
    C[PrinterContext] -->|Connection State|
    C -->|Print Queue|
    C -->|RFID Info|
    
    D[SettingsContext] -->|AI Settings|
    D -->|Printer Settings|
    D -->|Appearance|
    
    E[HistoryStore] -->|Undo Stack|
    E -->|Redo Stack|
    E -->|Max History|
    
    F[DesignerStore] -->|Objects Array|
    F -->|Selected Object|
    F -->|Canvas Reference|
    F -->|Viewport|
    
    G[SettingsStore] -->|Theme|
    G -->|Auto Save|
    G -->|Notifications|
    
    H[PrinterStore] -->|Connected|
    H -->|Device Info|
    H -->|Battery Level|
```

---

## UI/UX Enhancements

### 1. Design System

#### Color Palette
```javascript
// Light Theme
const lightTheme = {
  background: '#ffffff',
  surface: '#f8fafc',
  surfaceHover: '#f1f5f9',
  border: '#e2e8f0',
  text: '#1e293b',
  textSecondary: '#64748b',
  accent: '#3b82f6',
  accentHover: '#2563eb',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
}

// Dark Theme (Enhanced)
const darkTheme = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceHover: '#334155',
  border: '#334155',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  accent: '#0f3460',
  accentHover: '#1d4ed8',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#0ea5e9',
}
```

#### Typography Scale
```javascript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',  // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',     // 48px
    '3xl': '4rem',     // 64px
  },
  borderRadius: {
    sm: '0.25rem',  // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem',   // 8px
    xl: '0.75rem',  // 12px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
  },
}
```

### 2. Layout Architecture

```mermaid
graph TB
    A[MainLayout] --> B[Header]
    A --> C[Sidebar]
    A --> D[Main Content]
    
    B -->|Logo|
    B -->|Theme Toggle|
    B -->|User Menu|
    
    C -->|Navigation|
    C -->|Recent Designs|
    C -->|Templates|
    C -->|Settings|
    
    D -->|View Router|
    D -->|Designer View|
    D -->|Dashboard View|
    D -->|Settings View|
```

### 3. Responsive Breakpoints
```javascript
const breakpoints = {
  xs: '0px',      // Mobile portrait
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet
  lg: '1024px',   // Small desktop
  xl: '1280px',   // Desktop
  '2xl': '1536px',  // Large desktop
}
```

---

## Component Specifications

### Layout Components

#### Sidebar.jsx
**Purpose**: Primary navigation for the application

**Props Interface**:
```typescript
interface SidebarProps {
  currentView: 'designer' | 'dashboard' | 'settings'
  onViewChange: (view: string) => void
  recentDesigns: Design[]
  templates: Template[]
  collapsed: boolean
  onToggle: () => void
}
```

**Features**:
- Collapsible for mobile
- Active state indicator
- Badge for unsaved changes
- Keyboard shortcut hints

#### Header.jsx
**Purpose**: Application header with global actions

**Props Interface**:
```typescript
interface HeaderProps {
  title: string
  showBackButton: boolean
  onBack: () => void
  actions: HeaderAction[]
  onMenuToggle: () => void
}
```

**Features**:
- Breadcrumb navigation
- Global search
- Theme toggle
- User menu

#### MainLayout.jsx
**Purpose**: Page wrapper with consistent layout

**Props Interface**:
```typescript
interface MainLayoutProps {
  children: React.ReactNode
  showSidebar: boolean
  sidebarContent?: React.ReactNode
}
```

### Designer Components

#### Canvas.jsx
**Purpose**: Enhanced Fabric.js canvas wrapper

**Props Interface**:
```typescript
interface CanvasProps {
  widthMm: number
  heightMm: number
  onReady: (canvas: StaticCanvas) => void
  onObjectModified: () => void
  showGrid: boolean
  showRulers: boolean
  snapToGrid: boolean
}
```

**Features**:
- Configurable grid overlay
- Rulers with measurements
- Snap-to-grid functionality
- Zoom indicator

#### PropertiesPanel.jsx
**Purpose**: Edit selected object properties

**Props Interface**:
```typescript
interface PropertiesPanelProps {
  object: FabricObject
  onUpdate: (props: Record<string, any>) => void
  onClose: () => void
}
```

**Features**:
- Property groups (Position, Appearance, Text, etc.)
- Color picker with presets
- Font family selector
- Alignment controls
- Border/stroke settings

#### LayersPanel.jsx
**Purpose**: Manage canvas object layers

**Props Interface**:
```typescript
interface LayersPanelProps {
  objects: FabricObject[]
  selectedId: string | null
  onSelect: (id: string) => void
  onToggleVisibility: (id: string, visible: boolean) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
}
```

**Features**:
- Layer list with thumbnails
- Visibility toggle
- Lock/unlock layers
- Drag-to-reorder
- Layer actions (duplicate, delete)

#### ZoomControls.jsx
**Purpose**: Canvas zoom management

**Props Interface**:
```typescript
interface ZoomControlsProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onZoomFit: () => void
  minZoom: number
  maxZoom: number
}
```

**Features**:
- Zoom percentage display
- Preset zoom levels
- Fit to screen button
- Keyboard shortcuts display

### Dashboard Components

#### RecentDesigns.jsx
**Purpose**: Display and manage saved designs

**Props Interface**:
```typescript
interface RecentDesignsProps {
  designs: SavedDesign[]
  onOpen: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onExport: (id: string) => void
}
```

**Features**:
- Grid layout with thumbnails
- Last modified date
- Design metadata
- Quick actions menu
- Search/filter

#### TemplateGallery.jsx
**Purpose**: Browse and apply templates

**Props Interface**:
```typescript
interface TemplateGalleryProps {
  templates: Template[]
  categories: TemplateCategory[]
  selectedCategory: string | null
  onSelectCategory: (category: string) => void
  onApplyTemplate: (template: Template) => void
}
```

**Features**:
- Category filtering
- Template preview cards
- Quick apply button
- Template details

#### PrintQueue.jsx
**Purpose**: Manage print jobs

**Props Interface**:
```typescript
interface PrintQueueProps {
  queue: PrintJob[]
  onPause: (id: string) => void
  onResume: (id: string) => void
  onCancel: (id: string) => void
  onPrintAll: () => void
  onClear: () => void
}
```

**Features**:
- Job status indicators
- Batch controls
- Progress display
- Queue management

### Common Components

#### Toast.jsx
**Purpose**: Non-intrusive notifications

**Props Interface**:
```typescript
interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose?: () => void
  action?: ToastAction
}
```

**Features**:
- Auto-dismiss after timeout
- Progress bar for async operations
- Action button
- Stack for multiple toasts

#### Modal.jsx
**Purpose**: Dialog wrapper with consistent styling

**Props Interface**:
```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showClose?: boolean
  closeOnOverlayClick?: boolean
}
```

#### Tooltip.jsx
**Purpose**: Contextual help text

**Props Interface**:
```typescript
interface TooltipProps {
  content: string | React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  children: React.ReactNode
}
```

### Settings Components

#### AIPanel.jsx
**Purpose**: AI provider configuration

**Props Interface**:
```typescript
interface AIPanelProps {
  provider: 'ollama' | 'gemini'
  model: string
  apiKey: string
  endpoint: string
  temperature: number
  maxTokens: number
  onUpdate: (settings: AISettings) => void
  onTest: () => Promise<void>
}
```

#### PrinterPanel.jsx
**Purpose**: Printer connection settings

**Props Interface**:
```typescript
interface PrinterPanelProps {
  isConnected: boolean
  deviceName: string
  batteryLevel: number
  rfidInfo: RFIDInfo
  autoDetect: boolean
  onConnect: () => void
  onDisconnect: void
  onToggleAutoDetect: () => void
}
```

#### AppearancePanel.jsx
**Purpose**: Theme and display settings

**Props Interface**:
```typescript
interface AppearancePanelProps {
  theme: 'light' | 'dark'
  accentColor: string
  fontSize: 'sm' | 'base' | 'lg'
  showGrid: boolean
  showRulers: boolean
  onUpdate: (settings: AppearanceSettings) => void
}
```

---

## New Features Specification

### 1. Undo/Redo System

#### Requirements
- Persistent history stack
- Configurable max history size
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z)
- Visual history indicator
- Branching history for non-linear workflows

#### Data Structure
```typescript
interface HistoryState {
  past: CanvasState[]
  present: CanvasState
  future: CanvasState[]
  maxHistory: number
}

interface CanvasState {
  objects: FabricObject[]
  selection: string[]
  zoom: number
  viewport: ViewportTransform
}
```

### 2. Label History & Management

#### Requirements
- Save designs to local storage
- Auto-save with debouncing
- Design metadata (name, tags, created/modified)
- Search and filter
- Export/import multiple formats

#### Data Structure
```typescript
interface SavedDesign {
  id: string
  name: string
  thumbnail: string
  canvasData: string
  metadata: DesignMetadata
  createdAt: string
  modifiedAt: string
  tags: string[]
}

interface DesignMetadata {
  labelSize: { width: number; height: number }
  templateId?: string
  category?: string
}
```

### 3. Batch Printing

#### Requirements
- Queue multiple print jobs
- Set quantity per job
- Pause/resume/cancel jobs
- Print progress tracking
- Group jobs by label size

#### Data Structure
```typescript
interface PrintJob {
  id: string
  designId: string
  quantity: number
  status: 'pending' | 'printing' | 'completed' | 'failed'
  progress: number
  createdAt: string
}

interface PrintQueue {
  jobs: PrintJob[]
  status: 'idle' | 'printing' | 'paused'
  currentJob?: string
}
```

### 4. Advanced Object Properties

#### Requirements
- Gradient fills
- Shadow effects
- Border radius
- Opacity/transparency
- Blend modes
- Stroke styles (dashed, dotted)

#### Data Structure
```typescript
interface AdvancedObjectProps {
  fill: string | Gradient
  stroke: string
  strokeWidth: number
  strokeDashArray?: number[]
  shadow?: {
    color: string
    blur: number
    offsetX: number
    offsetY: number
  }
  opacity: number
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay'
  borderRadius?: number
}
```

### 5. Layers Management

#### Requirements
- Layer visibility toggle
- Layer lock/unlock
- Layer reordering (drag-drop)
- Layer naming
- Layer grouping

#### Data Structure
```typescript
interface Layer {
  id: string
  name: string
  type: 'text' | 'image' | 'barcode' | 'qrcode' | 'shape'
  visible: boolean
  locked: boolean
  zIndex: number
  objectId: string
}
```

### 6. Enhanced Export Options

#### Requirements
- PNG export (transparent background)
- PDF export (vector quality)
- SVG export (editable)
- Print-ready format
- Export settings dialog

#### Data Structure
```typescript
interface ExportOptions {
  format: 'png' | 'pdf' | 'svg' | 'json'
  dpi: number
  transparentBackground: boolean
  includeMetadata: boolean
  quality: 'low' | 'medium' | 'high'
}
```

---

## State Management Specification

### Zustand Store Structure

#### Designer Store
```typescript
import { create } from 'zustand'

interface DesignerStore {
  // State
  objects: FabricObject[]
  selectedIds: string[]
  zoom: number
  viewport: { x: number; y: number; zoom: number }
  clipboard: FabricObject | null
  
  // Actions
  addObject: (object: FabricObject) => void
  updateObject: (id: string, props: Partial<FabricObject>) => void
  deleteObject: (id: string) => void
  duplicateObject: (id: string) => void
  selectObject: (id: string) => void
  selectMultiple: (ids: string[]) => void
  clearSelection: () => void
  setZoom: (zoom: number) => void
  setViewport: (viewport: ViewportTransform) => void
  setClipboard: (object: FabricObject | null) => void
  pasteObject: () => void
}

export const useDesignerStore = create<DesignerStore>((set, get) => ({
  objects: [],
  selectedIds: [],
  zoom: 1,
  viewport: { x: 0, y: 0, zoom: 1 },
  clipboard: null,
  
  addObject: (object) => set((state) => ({
    objects: [...state.objects, object],
  })),
  
  updateObject: (id, props) => set((state) => ({
    objects: state.objects.map((obj) =>
      obj.id === id ? { ...obj, ...props } : obj
    ),
  })),
  
  deleteObject: (id) => set((state) => ({
    objects: state.objects.filter((obj) => obj.id !== id),
  })),
  
  // ... more actions
}))
```

#### History Store
```typescript
interface HistoryStore {
  // State
  past: CanvasState[]
  present: CanvasState
  future: CanvasState[]
  maxHistory: number
  
  // Actions
  push: (state: CanvasState) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  clear: () => void
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  past: [],
  present: {
    objects: [],
    selection: [],
    zoom: 1,
    viewport: { x: 0, y: 0, zoom: 1 },
  },
  future: [],
  maxHistory: 50,
  
  push: (state) => set((state) => ({
    past: [...state.past, state.present],
    present: state,
    future: [],
  })),
  
  undo: () => set((state) => ({
    past: state.past.slice(0, -1),
    present: state.past[state.past.length - 1],
    future: [state.present, ...state.future],
  })),
  
  redo: () => set((state) => ({
    past: [...state.past, state.present],
    present: state.future[0],
    future: state.future.slice(1),
  })),
  
  canUndo: () => {
    const { past } = get()
    return past.length > 0
  },
  
  canRedo: () => {
    const { future } = get()
    return future.length > 0
  },
}))
```

#### Settings Store
```typescript
interface SettingsStore {
  // State
  theme: 'light' | 'dark'
  accentColor: string
  fontSize: 'sm' | 'base' | 'lg'
  autoSave: boolean
  autoSaveInterval: number
  showGrid: boolean
  showRulers: boolean
  snapToGrid: boolean
  gridSize: number
  language: 'en' | 'es' | 'fr' | 'de'
  
  // Actions
  setTheme: (theme) => void
  setAccentColor: (color) => void
  setFontSize: (size) => void
  toggleAutoSave: () => void
  setAutoSaveInterval: (minutes) => void
  setShowGrid: (show) => void
  setShowRulers: (show) => void
  setSnapToGrid: (snap) => void
  setGridSize: (size) => void
  setLanguage: (lang) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: 'dark',
  accentColor: '#0f3460',
  fontSize: 'base',
  autoSave: true,
  autoSaveInterval: 5,
  showGrid: true,
  showRulers: true,
  snapToGrid: false,
  gridSize: 10,
  language: 'en',
}))
```

---

## Keyboard Shortcuts

### Global Shortcuts
```javascript
const keyboardShortcuts = {
  // File operations
  save: 'Ctrl+S',
  saveAs: 'Ctrl+Shift+S',
  open: 'Ctrl+O',
  import: 'Ctrl+I',
  export: 'Ctrl+E',
  
  // Edit operations
  undo: 'Ctrl+Z',
  redo: 'Ctrl+Y',
  delete: 'Delete',
  duplicate: 'Ctrl+D',
  copy: 'Ctrl+C',
  paste: 'Ctrl+V',
  selectAll: 'Ctrl+A',
  deselectAll: 'Escape',
  
  // Canvas operations
  zoomIn: 'Ctrl++',
  zoomOut: 'Ctrl+-',
  zoomReset: 'Ctrl+0',
  zoomFit: 'Ctrl+1',
  
  // Object operations
  bringForward: 'Ctrl+]',
  sendBackward: 'Ctrl+[',
  lock: 'Ctrl+L',
  unlock: 'Ctrl+Shift+L',
  hide: 'Ctrl+H',
  showAll: 'Ctrl+Shift+H',
  
  // Print operations
  print: 'Ctrl+P',
  quickPrint: 'Ctrl+Enter',
  
  // View operations
  toggleGrid: 'Ctrl+G',
  toggleRulers: 'Ctrl+R',
  toggleSidebar: 'Ctrl+B',
  toggleFullscreen: 'F11',
}
```

---

## Accessibility Specification

### ARIA Labels & Roles
```jsx
// Button example
<button
  aria-label="Save design"
  aria-pressed={isSaving}
  disabled={isSaving}
>
  <SaveIcon size={16} />
  <span>Save</span>
</button>

// Canvas region
<div
  role="region"
  aria-label="Label designer canvas"
  aria-roledescription="Interactive canvas for designing labels. Use arrow keys to navigate objects, Tab to select tools."
  tabIndex={0}
>
  <Canvas />
</div>

// Modal dialog
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Settings</h2>
  <p id="modal-description">Configure your preferences</p>
  <button onClick={onClose}>Close</button>
</div>
```

### Focus Management
- Logical tab order
- Focus trap in modals
- Focus restoration after close
- Skip to content on initial load
- Announce changes to screen readers

### Color Contrast Requirements
- WCAG 2.1 AA: 4.5:1 for normal text
- WCAG 2.1 AA: 3:1 for large text (18px+)
- WCAG 2.1 AA: 3:1 for UI components
- Interactive elements: 3:1 minimum

---

## Performance Optimizations

### Canvas Rendering
- Virtual rendering for large object counts
- Debounced resize handlers
- RequestAnimationFrame for smooth updates
- Object pooling for repeated elements
- Lazy loading of offscreen canvases

### State Updates
- Memoized selectors
- Batched state updates
- Optimistic updates for UI
- Debounced auto-save

### Asset Loading
- Code splitting for routes
- Lazy loading of components
- Preloading of fonts
- Image optimization

---

## Implementation Roadmap

### Phase 1: Foundation (Priority: High)
1. Set up Zustand stores
2. Create design system (colors, typography, spacing)
3. Implement layout components (Sidebar, Header, MainLayout)
4. Create common components (Button, Modal, Toast, Tooltip)
5. Add routing (react-router-dom)

### Phase 2: Designer Enhancements (Priority: High)
1. Implement Canvas wrapper with grid/rulers
2. Create PropertiesPanel component
3. Create LayersPanel component
4. Create ZoomControls component
5. Add keyboard shortcuts handling

### Phase 3: History & Management (Priority: High)
1. Implement undo/redo system
2. Create history store
3. Add design save/load
4. Implement RecentDesigns component
5. Add design metadata

### Phase 4: Dashboard (Priority: Medium)
1. Create TemplateGallery component
2. Create PrintQueue component
3. Implement dashboard view
4. Add search/filter functionality
5. Add quick actions

### Phase 5: Settings (Priority: Medium)
1. Create settings panels (AI, Printer, Appearance)
2. Implement settings store
3. Add settings view
4. Create SettingsModal enhancement
5. Add theme switching

### Phase 6: Advanced Features (Priority: Low)
1. Implement batch printing
2. Add advanced object properties
3. Create export dialog
4. Add multiple export formats
5. Optimize performance

### Phase 7: Polish (Priority: Low)
1. Add animations and transitions
2. Improve accessibility
3. Add comprehensive error handling
4. Write unit tests
5. Update documentation

---

## Risk Analysis

### Potential Pitfalls

1. **Breaking Changes**
   - Risk: Modifying core canvas logic could break existing features
   - Mitigation: Maintain Fabric.js API compatibility, test thoroughly

2. **Performance Degradation**
   - Risk: Large object counts could slow rendering
   - Mitigation: Implement virtualization, use requestAnimationFrame

3. **Bluetooth API Limitations**
   - Risk: HTTPS requirement, browser support
   - Mitigation: Clear messaging, fallback options

4. **State Synchronization**
   - Risk: Multiple stores could become inconsistent
   - Mitigation: Use single source of truth, implement store sync

5. **Browser Storage Limits**
   - Risk: LocalStorage has size limits
   - Mitigation: Implement cleanup, use IndexedDB for large data

### Edge Cases

1. **Empty Canvas State**
   - Handle gracefully with empty state message
   - Provide clear call-to-action

2. **Corrupted Saved Data**
   - Validate on load, show error
   - Offer recovery options

3. **Printer Disconnection Mid-Print**
   - Queue the job, retry on reconnect
   - Show clear status

4. **AI Provider Failure**
   - Graceful degradation
   - Clear error messages
   - Fallback to manual design

5. **Mobile Canvas Interaction**
   - Touch events vs mouse events
   - Gesture support (pinch zoom)
   - Responsive toolbar

---

## Migration Strategy

### Backward Compatibility
1. Keep existing component interfaces
2. Maintain Fabric.js object structure
3. Preserve localStorage data format
4. Keep printer protocol unchanged

### Incremental Migration
1. Phase 1: Add new components alongside existing
2. Phase 2: Migrate features gradually
3. Phase 3: Deprecate old components
4. Phase 4: Remove old code

### Data Migration
```javascript
// Migrate localStorage format
function migrateLocalStorage() {
  const oldData = localStorage.getItem('savedDesigns')
  
  if (!oldData) return
  
  const designs = JSON.parse(oldData)
  
  // Add missing metadata
  const migrated = designs.map(design => ({
    ...design,
    createdAt: design.createdAt || new Date().toISOString(),
    modifiedAt: design.modifiedAt || design.createdAt,
    tags: design.tags || [],
  }))
  
  localStorage.setItem('savedDesigns', JSON.stringify(migrated))
}

// Run on app load
migrateLocalStorage()
```

---

## Conclusion

This enhanced design transforms niimbot-web from a functional tool into a professional, user-friendly label design platform. The modular architecture allows for incremental implementation while maintaining backward compatibility. The focus on accessibility, performance, and modern UX patterns ensures the application will serve a wide range of users effectively.

**Next Steps:**
1. Review and approve this architecture
2. Set up Zustand for state management
3. Begin Phase 1 implementation
4. Test each phase before proceeding
