/**
 * Pre-configured label templates and design options
 */

/**
 * Pre-configured label templates
 */
export const LABEL_TEMPLATES = [
  // --- Basic Templates ---
  {
    id: 'blank',
    name: 'Blank Label',
    description: 'Start with an empty canvas',
    category: 'Basic',
    labelSize: { width: 50, height: 30 },
    objects: [],
  },
  {
    id: 'product-basic',
    name: 'Product Label',
    description: 'Name, price, and barcode',
    category: 'Retail',
    labelSize: { width: 50, height: 30 },
    objects: [
      { type: 'text', text: 'Product Name', left: 10, top: 8, fontSize: 18, fontWeight: 'bold' },
      { type: 'text', text: '$0.00', left: 10, top: 45, fontSize: 24, fontWeight: 'bold' },
      { type: 'barcode', value: '123456789', left: 100, top: 35, format: 'code128' },
    ],
  },
  {
    id: 'qr-link',
    name: 'QR Link',
    description: 'QR code with label',
    category: 'Digital',
    labelSize: { width: 30, height: 30 },
    objects: [
      { type: 'qrcode', value: 'https://example.com', left: 15, top: 5 },
      {
        type: 'text',
        text: 'Scan Me',
        left: 15,
        top: 75,
        fontSize: 14,
        textAlign: 'center',
        originX: 'center',
      },
    ],
  },
  {
    id: 'inventory',
    name: 'Inventory Tag',
    description: 'SKU and location',
    category: 'Warehouse',
    labelSize: { width: 40, height: 20 },
    objects: [
      { type: 'text', text: 'SKU:', left: 5, top: 5, fontSize: 12 },
      { type: 'text', text: 'ABC-12345', left: 40, top: 5, fontSize: 14, fontWeight: 'bold' },
      { type: 'text', text: 'LOC:', left: 5, top: 25, fontSize: 12 },
      { type: 'text', text: 'A-01-23', left: 40, top: 25, fontSize: 14 },
    ],
  },
  {
    id: 'pro-injection',
    name: 'Injection Vial (50x30)',
    description: 'Pharma style with side warnings',
    category: 'Peptide',
    labelSize: { width: 50, height: 30 },
    objects: [
      // --- Simplified High-Legibility Layout ---

      // Header: NDC & Rx Only
      { type: 'text', text: 'NDC 0009-0086', left: 25, top: 25, fontSize: 18, fill: '#000000', fontWeight: 'bold' },
      { type: 'text', text: 'Rx ONLY', left: 375, top: 25, fontSize: 18, fontWeight: 'bold', fill: '#DC2626', originX: 'right' },

      // Main Title (Massive)
      {
        type: 'text',
        text: 'L-CARNITINE',
        left: 200,
        top: 65,
        fontSize: 42,
        fontWeight: 'bold',
        fill: '#DC2626',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },
      {
        type: 'text',
        text: 'INJECTION, USP',
        left: 200,
        top: 95,
        fontSize: 22,
        fontWeight: 'bold',
        fill: '#000000',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },

      // Dosage Box (Full Width centered)
      {
        type: 'rect',
        left: 50,
        top: 120,
        width: 300,
        height: 50,
        fill: '#DC2626',
        rx: 5,
        ry: 5,
      },
      {
        type: 'text',
        text: '500 mg/mL',
        left: 200,
        top: 145,
        fontSize: 36,
        fontWeight: 'bold',
        fill: '#FFFFFF',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },

      // Bottom Metadata
      { type: 'text', text: 'Multi-Dose Vial', left: 200, top: 185, fontSize: 20, fontWeight: 'bold', originX: 'center' },

      { type: 'line', left: 20, top: 200, x1: 0, y1: 0, x2: 360, y2: 0, stroke: 'black', strokeWidth: 2 },

      // Footer: LOT / EXP
      { type: 'text', text: 'LOT: A123', left: 30, top: 215, fontSize: 18, fontWeight: 'bold' },
    ],
  },
  {
    id: 'pro-injection-15',
    name: 'Injection Vial (50x15)',
    description: 'Compact 50x15mm Pharma Label',
    category: 'Peptide',
    labelSize: { width: 50, height: 15 },
    objects: [
      // --- Layout for 50x15mm (approx 400px x 120px) ---

      // 1. Main Title (Top-Left)
      {
        type: 'text',
        text: 'L-CARNITINE',
        left: 10,
        top: 15,
        fontSize: 28, // Max size for top half
        fontWeight: 'bold',
        fill: '#DC2626', // Red
        originX: 'left',
      },

      // 2. Dosage Box (Bottom-Left)
      {
        type: 'rect',
        left: 10,
        top: 60,
        width: 180,
        height: 50,
        fill: '#DC2626',
        rx: 4,
        ry: 4,
      },
      {
        type: 'text',
        text: '500 mg/mL',
        left: 100,
        top: 85,
        fontSize: 24,
        fontWeight: 'bold',
        fill: '#FFFFFF',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },

      // 3. Middle Data (Type)
      {
        type: 'text',
        text: 'Injection, USP',
        left: 200,
        top: 25,
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#000000',
        originX: 'center',
      },
      {
        type: 'text',
        text: 'Multi-Dose',
        left: 200,
        top: 45,
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#000000',
        originX: 'center',
      },

      // 4. Right Side (QR & Meta)
      {
        type: 'qrcode',
        value: 'https://example.com',
        left: 310,
        top: 10,
        width: 100, // Max height fits in 15mm (120px) -> 100px with padding
        height: 100,
      },

      // Vertical text for "Rx Only" near QR
      {
        type: 'text',
        text: 'Rx ONLY',
        left: 290,
        top: 60,
        fontSize: 14,
        fontWeight: 'bold',
        angle: -90,
        fill: '#DC2626',
        originX: 'center',
        originY: 'center',
      }
    ],
  },

  {
    id: 'peptide-recon-table',
    name: 'Reconstitution Table (50x30)',
    description: 'Dosing lookup table (5mg / 2mL)',
    category: 'Peptide',
    labelSize: { width: 50, height: 30 },
    objects: [
      // Header
      {
        type: 'text',
        text: 'BPC-157 (5mg)',
        left: 200,
        top: 25,
        fontSize: 26,
        fontWeight: 'bold',
        fill: '#DC2626',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },
      {
        type: 'text',
        text: 'Add 2mL Bacteriostatic Water',
        left: 200,
        top: 50,
        fontSize: 16,
        fontWeight: 'bold',
        fill: '#000000',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },

      // Table Header Bar
      { type: 'rect', left: 20, top: 70, width: 360, height: 30, fill: '#000000', rx: 3, ry: 3 },
      { type: 'text', text: 'DOSE', left: 110, top: 85, fontSize: 16, fontWeight: 'bold', fill: '#FFFFFF', originX: 'center', originY: 'center' },
      { type: 'text', text: 'PULL TO (IU)', left: 290, top: 85, fontSize: 16, fontWeight: 'bold', fill: '#FFFFFF', originX: 'center', originY: 'center' },

      // Row 1
      { type: 'text', text: '250 mcg', left: 110, top: 115, fontSize: 20, fontWeight: 'bold', originX: 'center', originY: 'center' },
      { type: 'text', text: '10 IU', left: 290, top: 115, fontSize: 20, fontWeight: 'bold', originX: 'center', originY: 'center' },
      { type: 'line', left: 20, top: 130, x1: 0, y1: 0, x2: 360, y2: 0, stroke: '#000000', strokeWidth: 1 },

      // Row 2
      { type: 'text', text: '500 mcg', left: 110, top: 145, fontSize: 20, fontWeight: 'bold', originX: 'center', originY: 'center' },
      { type: 'text', text: '20 IU', left: 290, top: 145, fontSize: 20, fontWeight: 'bold', originX: 'center', originY: 'center' },
      { type: 'line', left: 20, top: 160, x1: 0, y1: 0, x2: 360, y2: 0, stroke: '#000000', strokeWidth: 1 },

      // Row 3
      { type: 'text', text: '1000 mcg', left: 110, top: 175, fontSize: 20, fontWeight: 'bold', originX: 'center', originY: 'center' },
      { type: 'text', text: '40 IU', left: 290, top: 175, fontSize: 20, fontWeight: 'bold', originX: 'center', originY: 'center' },

      // Footer
      { type: 'rect', left: 100, top: 195, width: 200, height: 20, fill: '#DC2626', rx: 10, ry: 10 },
      { type: 'text', text: 'Refrigerate after mixing', left: 200, top: 205, fontSize: 12, fill: '#FFFFFF', fontWeight: 'bold', originX: 'center', originY: 'center' },
    ]
  },
  // --- Professional / Lab Templates (High Density) ---

  {
    id: 'pro-data-dense',
    name: 'Data Dense (50x30)',
    description: 'QR + Detailed Analysis Columns',
    category: 'Peptide',
    labelSize: { width: 50, height: 30 },
    objects: [
      // Top Header
      {
        type: 'text',
        text: 'Professional Labs',
        left: 200,
        top: 12,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },
      {
        type: 'text',
        text: 'Compound 10mg | BATCH001',
        left: 200,
        top: 30,
        fontSize: 18,
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },

      // Vertical Divider
      {
        type: 'line',
        left: 140,
        top: 45,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 190,
        stroke: '#000000',
        strokeWidth: 2,
      },

      // Left Side (Dates + QR)
      {
        type: 'text',
        text: 'Rec: 10.20.25',
        left: 70,
        top: 55,
        fontSize: 12,
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },
      {
        type: 'text',
        text: 'Test: 10.25.25',
        left: 70,
        top: 70,
        fontSize: 12,
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },
      { type: 'qrcode', value: 'https://example.com/verify', left: 20, top: 85, width: 100 }, // Scaled via width? No, usually generic scaler. Assuming standard size.

      // Right Side (Table Data)
      {
        type: 'text',
        text: 'TESTED PURITY',
        left: 270,
        top: 55,
        fontSize: 14,
        fontWeight: 'bold',
        textDecoration: 'underline',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },

      {
        type: 'text',
        text: '10.5mg',
        left: 150,
        top: 80,
        fontSize: 14,
        originX: 'left',
        originY: 'center',
      },
      {
        type: 'text',
        text: '99.8%',
        left: 390,
        top: 80,
        fontSize: 14,
        originX: 'right',
        originY: 'center',
      },

      {
        type: 'text',
        text: '10.4mg',
        left: 150,
        top: 100,
        fontSize: 14,
        originX: 'left',
        originY: 'center',
      },
      {
        type: 'text',
        text: '99.9%',
        left: 390,
        top: 100,
        fontSize: 14,
        originX: 'right',
        originY: 'center',
      },

      // Horizontal Divider in Right Col
      {
        type: 'line',
        left: 150,
        top: 115,
        x1: 0,
        y1: 0,
        x2: 240,
        y2: 0,
        stroke: '#000000',
        strokeWidth: 1,
      },

      {
        type: 'text',
        text: 'Avg: 99.85%',
        left: 270,
        top: 130,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },

      {
        type: 'text',
        text: 'Recon: 1mL BAC',
        left: 150,
        top: 160,
        fontSize: 14,
        originX: 'left',
        originY: 'center',
      },
      {
        type: 'text',
        text: '10mg = 50 units',
        left: 150,
        top: 185,
        fontSize: 16,
        fontWeight: 'bold',
        originX: 'left',
        originY: 'center',
      },
    ],
  },

  {
    id: 'pro-header-box',
    name: 'Header & Box (50x30)',
    description: 'Inverted Header + Side Dosage Box',
    category: 'Peptide',
    labelSize: { width: 50, height: 30 },
    objects: [
      // Red/Black Header Bar
      { type: 'rect', left: 30, top: 10, width: 340, height: 40, fill: '#000000', rx: 5, ry: 5 },
      {
        type: 'text',
        text: 'COMPOUND NAME',
        left: 200,
        top: 30,
        fontSize: 26,
        fontWeight: 'bold',
        fill: '#FFFFFF',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },

      // Left Column Text (Red)
      { type: 'text', text: 'Rec: 10.20.25', left: 40, top: 70, fontSize: 12, fill: '#000000' },
      { type: 'text', text: 'Test: 10.25.25', left: 40, top: 90, fontSize: 12, fill: '#000000' },

      {
        type: 'text',
        text: 'PURITY REPORT',
        left: 40,
        top: 120,
        fontSize: 14,
        fontWeight: 'bold',
        textDecoration: 'underline',
      },
      { type: 'text', text: 'Mass: 10.2mg', left: 40, top: 145, fontSize: 14 },
      { type: 'text', text: 'Purity: 99.5%', left: 40, top: 165, fontSize: 14 },

      // Right Box (Dosage)
      {
        type: 'rect',
        left: 200,
        top: 60,
        width: 170,
        height: 130,
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 3,
        rx: 5,
        ry: 5,
      },
      {
        type: 'text',
        text: 'DOSAGE',
        left: 285,
        top: 80,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },
      {
        type: 'text',
        text: '1mL BAC',
        left: 285,
        top: 105,
        fontSize: 14,
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },

      {
        type: 'text',
        text: '05mg = 25u',
        left: 285,
        top: 135,
        fontSize: 16,
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },
      {
        type: 'text',
        text: '10mg = 50u',
        left: 285,
        top: 160,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },
    ],
  },

  {
    id: 'pro-quadrant',
    name: 'Quadrant Layout (50x30)',
    description: 'Split sections for info',
    category: 'Peptide',
    labelSize: { width: 50, height: 30 },
    objects: [
      // Header
      {
        type: 'text',
        text: 'Pharma Grade',
        left: 200,
        top: 15,
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },
      {
        type: 'text',
        text: 'COMPOUND 10mg',
        left: 200,
        top: 40,
        fontSize: 20,
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },

      // Main Divider (Vertical)
      {
        type: 'line',
        left: 180,
        top: 60,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 170,
        stroke: '#000000',
        strokeWidth: 2,
      },

      // Left Quadrant (QR)
      {
        type: 'text',
        text: 'Scan Report',
        left: 90,
        top: 75,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
      },
      { type: 'qrcode', value: 'https://example', left: 40, top: 100, width: 90 },

      // Top Right Quadrant
      {
        type: 'text',
        text: 'Tested Purity',
        left: 290,
        top: 75,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
      },
      {
        type: 'text',
        text: '11.69mg | 99.3%',
        left: 290,
        top: 100,
        fontSize: 16,
        textAlign: 'center',
        originX: 'center',
      },

      // Horizontal Splitter
      {
        type: 'line',
        left: 190,
        top: 120,
        x1: 0,
        y1: 0,
        x2: 200,
        y2: 0,
        stroke: '#000000',
        strokeWidth: 2,
      },

      // Bottom Right Quadrant (Large Dosage)
      {
        type: 'text',
        text: '5mg = 50ui',
        left: 250,
        top: 160,
        fontSize: 28,
        fontWeight: 'bold',
        originY: 'center',
      },

      // Vertical text on far right? (Simulated with rotation)
      {
        type: 'text',
        text: '1mL BAC',
        left: 380,
        top: 160,
        fontSize: 14,
        angle: -90,
        originX: 'center',
        originY: 'center',
      },
    ],
  },

  // --- Design Templates (Generic & Professional) ---

  {
    id: 'design-header-bar',
    name: 'Header Bar (50x30)',
    description: 'Solid header with large title',
    category: 'Design',
    labelSize: { width: 50, height: 30 },
    objects: [
      // Black Header
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: 400,
        height: 50,
        fill: '#000000',
        stroke: 'transparent',
      },
      {
        type: 'text',
        text: 'TITLE HERE',
        left: 200,
        top: 25,
        fontSize: 28,
        fontWeight: 'bold',
        fill: '#FFFFFF',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },

      // Content
      {
        type: 'text',
        text: 'Subtitle or Detail',
        left: 200,
        top: 90,
        fontSize: 20,
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },
      {
        type: 'text',
        text: 'Secondary Info',
        left: 200,
        top: 130,
        fontSize: 16,
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },

      // Bottom Accent
      {
        type: 'rect',
        left: 0,
        top: 220,
        width: 400,
        height: 20,
        fill: '#000000',
        stroke: 'transparent',
      },
    ],
  },

  {
    id: 'design-split-vert',
    name: 'Vertical Split (50x30)',
    description: 'Side bar for date/icon',
    category: 'Design',
    labelSize: { width: 50, height: 30 },
    objects: [
      // Divider Line
      {
        type: 'line',
        left: 100,
        top: 10,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 220,
        stroke: '#000000',
        strokeWidth: 3,
      },

      // Left Side (Rotation -90deg for vertical text effect or just icon)
      {
        type: 'text',
        text: 'DATE',
        left: 50,
        top: 80,
        fontSize: 14,
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },
      {
        type: 'text',
        text: '12/25',
        left: 50,
        top: 120,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },

      // Right Side
      {
        type: 'text',
        text: 'Main Content',
        left: 120,
        top: 60,
        fontSize: 26,
        fontWeight: 'bold',
        originY: 'center',
      },
      {
        type: 'text',
        text: 'Description text goes',
        left: 120,
        top: 100,
        fontSize: 18,
        originY: 'center',
      },
      {
        type: 'text',
        text: 'here on two lines.',
        left: 120,
        top: 130,
        fontSize: 18,
        originY: 'center',
      },
    ],
  },

  {
    id: 'design-frame-bold',
    name: 'Bold Frame (50x30)',
    description: 'High visibility boxed label',
    category: 'Design',
    labelSize: { width: 50, height: 30 },
    objects: [
      // Outer Frame
      {
        type: 'rect',
        left: 10,
        top: 10,
        width: 380,
        height: 220,
        stroke: '#000000',
        strokeWidth: 8,
        fill: 'transparent',
      },

      // Inner Content
      {
        type: 'text',
        text: 'WARNING',
        left: 200,
        top: 50,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },
      {
        type: 'text',
        text: 'HANDLE WITH',
        left: 200,
        top: 110,
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },
      {
        type: 'text',
        text: 'CARE',
        left: 200,
        top: 150,
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },
    ],
  },

  {
    id: 'design-address',
    name: 'Address Block (50x30)',
    description: 'Standard To/From shipping',
    category: 'Home',
    labelSize: { width: 50, height: 30 },
    objects: [
      // From Section
      { type: 'text', text: 'FROM:', left: 15, top: 15, fontSize: 12, fontWeight: 'bold' },
      { type: 'text', text: 'Sender Name', left: 70, top: 15, fontSize: 14 },

      // Divider
      {
        type: 'line',
        left: 10,
        top: 50,
        x1: 0,
        y1: 0,
        x2: 380,
        y2: 0,
        stroke: '#000000',
        strokeWidth: 2,
      },

      // To Section
      { type: 'text', text: 'TO:', left: 15, top: 70, fontSize: 16, fontWeight: 'bold' },
      {
        type: 'text',
        text: 'Recipient Name',
        left: 30,
        top: 100,
        fontSize: 22,
        fontWeight: 'bold',
      },
      { type: 'text', text: '123 Street Name', left: 30, top: 135, fontSize: 18 },
      { type: 'text', text: 'City, State 12345', left: 30, top: 165, fontSize: 18 },
    ],
  },

  {
    id: 'design-kitchen',
    name: 'Kitchen Date (50x30)',
    description: 'Food prep label',
    category: 'Home',
    labelSize: { width: 50, height: 30 },
    objects: [
      {
        type: 'text',
        text: 'ITEM NAME',
        left: 200,
        top: 40,
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      },
      {
        type: 'line',
        left: 20,
        top: 90,
        x1: 0,
        y1: 0,
        x2: 360,
        y2: 0,
        stroke: '#000000',
        strokeWidth: 3,
      },
      { type: 'text', text: 'Made: __/__', left: 20, top: 130, fontSize: 16, originX: 'left' },
      {
        type: 'text',
        text: 'Use By: __/__',
        left: 200,
        top: 130,
        fontSize: 16,
        fontWeight: 'bold',
        originX: 'left',
      },
    ],
  },

  {
    id: 'design-cable-flag',
    name: 'Cable Flag (50x15)',
    description: 'Wrap-around cable tag',
    category: 'Home',
    labelSize: { width: 50, height: 15 },
    objects: [
      // Left side (Front)
      {
        type: 'text',
        text: 'HDMI 1',
        left: 10,
        top: 40,
        fontSize: 18,
        fontWeight: 'bold',
        angle: 0,
      },
      // Middle Divider (Fold line)
      {
        type: 'line',
        left: 200,
        top: 0,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 120,
        stroke: '#999999',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
      },
      // Right side (Back/Duplicate)
      {
        type: 'text',
        text: 'HDMI 1',
        left: 390,
        top: 40,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'right',
        originX: 'right',
      },
    ],
  },
]

/**
 * Get templates by category
 */
export function getTemplatesByCategory() {
  const categories = {}
  for (const template of LABEL_TEMPLATES) {
    const cat = template.category
    if (!categories[cat]) {
      categories[cat] = []
    }
    categories[cat].push(template)
  }
  return categories
}

/**
 * Search templates by name
 */
export function searchTemplates(query) {
  const lowerQuery = query.toLowerCase()
  return LABEL_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.category.toLowerCase().includes(lowerQuery),
  )
}

/**
 * Available fonts for text elements
 */
export const FONTS = [
  // Google Fonts
  { name: 'Inter', family: 'Inter, sans-serif', category: 'Google' },
  { name: 'Roboto', family: 'Roboto, sans-serif', category: 'Google' },
  { name: 'Open Sans', family: '"Open Sans", sans-serif', category: 'Google' },
  { name: 'Lato', family: 'Lato, sans-serif', category: 'Google' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif', category: 'Google' },
  { name: 'Poppins', family: 'Poppins, sans-serif', category: 'Google' },
  { name: 'Oswald', family: 'Oswald, sans-serif', category: 'Google' },
  { name: 'Source Code Pro', family: '"Source Code Pro", monospace', category: 'Google' },

  // System fonts
  { name: 'Arial', family: 'Arial, sans-serif', category: 'Sans-serif' },
  { name: 'Helvetica', family: 'Helvetica, sans-serif', category: 'Sans-serif' },
  { name: 'Times New Roman', family: '"Times New Roman", serif', category: 'Serif' },
  { name: 'Courier New', family: '"Courier New", monospace', category: 'Monospace' },
]

/**
 * Barcode format options
 */
export const BARCODE_FORMATS = [
  { id: 'code128', name: 'Code 128', description: 'General purpose' },
  { id: 'code39', name: 'Code 39', description: 'Alphanumeric' },
  { id: 'ean13', name: 'EAN-13', description: 'Product codes' },
  { id: 'ean8', name: 'EAN-8', description: 'Short product codes' },
  { id: 'qrcode', name: 'QR Code', description: '2D matrix' },
  { id: 'datamatrix', name: 'Data Matrix', description: '2D matrix' },
]

/**
 * Common font sizes
 */
export const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72]
