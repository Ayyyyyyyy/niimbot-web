/**
 * Pre-configured label templates and design options
 */

/**
 * Vendor codes for identification
 */
export const VENDORS = [
    { code: 'ABC', name: 'ABC Peptides' },
    { code: 'Uther', name: 'Uther Research' },
    { code: 'PGB', name: 'PGB Labs' },
    { code: 'TFC', name: 'TFC Compounds' },
    { code: 'OU', name: 'Outpost' },
    { code: 'QSC', name: 'QSC' },
    { code: 'Amo', name: 'Amino Asylum' },
    { code: 'Pep', name: 'Peptide Sciences' },
    { code: 'Can', name: 'Canlabs' },
    { code: 'Enz', name: 'Enzyte' },
];

/**
 * Common peptide compounds with typical dosages
 */
export const PEPTIDES = [
    // GLP-1 / Weight Loss
    { name: 'Retatrutide', dosages: ['5mg', '10mg', '15mg', '20mg', '30mg', '60mg'], category: 'GLP-1' },
    { name: 'Tirzepatide', dosages: ['5mg', '10mg', '15mg', '30mg'], category: 'GLP-1' },
    { name: 'Semaglutide', dosages: ['3mg', '5mg', '10mg'], category: 'GLP-1' },

    // Growth Hormone
    { name: 'Tesamorelin', dosages: ['2mg', '5mg', '10mg'], category: 'GHRH' },
    { name: 'CJC-1295 DAC', dosages: ['2mg', '5mg'], category: 'GHRH' },
    { name: 'CJC-1295 no DAC', dosages: ['2mg', '5mg'], category: 'GHRH' },
    { name: 'Ipamorelin', dosages: ['2mg', '5mg', '10mg'], category: 'GHRP' },
    { name: 'GHRP-6', dosages: ['5mg', '10mg'], category: 'GHRP' },
    { name: 'GHRP-2', dosages: ['5mg', '10mg'], category: 'GHRP' },
    { name: 'Sermorelin', dosages: ['2mg', '5mg'], category: 'GHRH' },
    { name: 'MK-677', dosages: ['500mg', '1g'], category: 'GH Secretagogue' },

    // BPC / Healing
    { name: 'BPC-157', dosages: ['5mg', '10mg'], category: 'Healing' },
    { name: 'TB-500', dosages: ['5mg', '10mg'], category: 'Healing' },
    { name: 'KPV', dosages: ['5mg', '10mg'], category: 'Healing' },
    { name: 'GHK-Cu', dosages: ['50mg', '100mg'], category: 'Healing' },

    // Tanning
    { name: 'Melanotan II', dosages: ['10mg'], category: 'Tanning' },
    { name: 'PT-141', dosages: ['10mg'], category: 'Tanning' },

    // Other
    { name: 'AOD-9604', dosages: ['5mg', '10mg'], category: 'Fat Loss' },
    { name: 'HGH Fragment 176-191', dosages: ['5mg'], category: 'Fat Loss' },
    { name: 'Epithalon', dosages: ['10mg', '50mg'], category: 'Anti-Aging' },
    { name: 'Selank', dosages: ['5mg'], category: 'Nootropic' },
    { name: 'Semax', dosages: ['30mg'], category: 'Nootropic' },
    { name: 'NAD+', dosages: ['100mg', '250mg', '500mg'], category: 'Anti-Aging' },
];

/**
 * Generate peptide label templates
 */
function generatePeptideTemplates() {
    const templates = [];

    for (const peptide of PEPTIDES) {
        for (const dosage of peptide.dosages) {
            templates.push({
                id: `peptide-${peptide.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${dosage}`,
                name: `${peptide.name} ${dosage}`,
                description: peptide.category,
                category: 'Peptides',
                subcategory: peptide.category,
                labelSize: { width: 40, height: 20 },
                objects: [
                    { type: 'text', text: peptide.name, left: 20, top: 10, fontSize: 12, fontWeight: 'bold', textAlign: 'center', originX: 'center', originY: 'center' },
                    { type: 'text', text: dosage, left: 20, top: 26, fontSize: 16, fontWeight: 'bold', textAlign: 'center', originX: 'center', originY: 'center' },
                    { type: 'text', text: '___', left: 70, top: 32, fontSize: 8, textAlign: 'right', originX: 'right' }, // Vendor placeholder
                ],
            });
        }
    }

    return templates;
}

/**
 * Pre-configured label templates
 */
export const LABEL_TEMPLATES = [
    // Basic templates
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
            { type: 'text', text: 'Product Name', left: 10, top: 8, fontSize: 14, fontWeight: 'bold' },
            { type: 'text', text: '$0.00', left: 10, top: 45, fontSize: 18, fontWeight: 'bold' },
            { type: 'barcode', value: '123456789', left: 100, top: 35, format: 'code128' },
        ],
    },
    {
        id: 'shipping',
        name: 'Shipping Label',
        description: 'Address and tracking',
        category: 'Logistics',
        labelSize: { width: 50, height: 30 },
        objects: [
            { type: 'text', text: 'FROM:', left: 10, top: 8, fontSize: 8 },
            { type: 'text', text: 'Sender Name', left: 10, top: 18, fontSize: 10 },
            { type: 'text', text: 'TO:', left: 10, top: 35, fontSize: 8, fontWeight: 'bold' },
            { type: 'text', text: 'Recipient Name', left: 10, top: 45, fontSize: 12, fontWeight: 'bold' },
        ],
    },
    {
        id: 'name-badge',
        name: 'Name Badge',
        description: 'Hello my name is...',
        category: 'Events',
        labelSize: { width: 50, height: 30 },
        objects: [
            { type: 'text', text: 'HELLO', left: 50, top: 10, fontSize: 10, textAlign: 'center', originX: 'center', originY: 'center' },
            { type: 'text', text: 'my name is', left: 50, top: 20, fontSize: 8, textAlign: 'center', originX: 'center', originY: 'center' },
            { type: 'text', text: 'Your Name', left: 50, top: 45, fontSize: 16, fontWeight: 'bold', textAlign: 'center', originX: 'center', originY: 'center' },
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
            { type: 'text', text: 'Scan Me', left: 15, top: 75, fontSize: 10, textAlign: 'center', originX: 'center' },
        ],
    },
    {
        id: 'inventory',
        name: 'Inventory Tag',
        description: 'SKU and location',
        category: 'Warehouse',
        labelSize: { width: 40, height: 20 },
        objects: [
            { type: 'text', text: 'SKU:', left: 5, top: 5, fontSize: 8 },
            { type: 'text', text: 'ABC-12345', left: 25, top: 5, fontSize: 10, fontWeight: 'bold' },
            { type: 'text', text: 'LOC:', left: 5, top: 20, fontSize: 8 },
            { type: 'text', text: 'A-01-23', left: 25, top: 20, fontSize: 10 },
        ],
    },
    {
        id: 'vial-small',
        name: 'Vial Label (Small)',
        description: 'Small vial identification',
        category: 'Lab',
        labelSize: { width: 25, height: 15 },
        objects: [
            { type: 'text', text: 'Compound', left: 12, top: 7, fontSize: 8, fontWeight: 'bold', textAlign: 'center', originX: 'center', originY: 'center' },
            { type: 'text', text: '10mg', left: 12, top: 22, fontSize: 10, fontWeight: 'bold', textAlign: 'center', originX: 'center', originY: 'center' },
        ],
    },
    {
        id: 'vial-medium',
        name: 'Vial Label (Medium)',
        description: 'Medium vial with vendor',
        category: 'Lab',
        labelSize: { width: 40, height: 20 },
        objects: [
            { type: 'text', text: 'Compound Name', left: 20, top: 10, fontSize: 10, fontWeight: 'bold', textAlign: 'center', originX: 'center', originY: 'center' },
            { type: 'text', text: '10mg', left: 20, top: 25, fontSize: 14, fontWeight: 'bold', textAlign: 'center', originX: 'center', originY: 'center' },
            { type: 'text', text: 'VND', left: 70, top: 32, fontSize: 6, textAlign: 'right', originX: 'right' },
        ],
    },

    // Medical Templates - Professional layouts
    // Canvas at 203 DPI: 50mm=400px, 15mm=120px, 30mm=240px
    // Coordinates are in pixels matching the canvas size

    {
        id: 'peptide-pro-50x30',
        name: 'Peptide Pro (50×30)',
        description: 'Professional layout with QR code',
        category: 'Medical',
        labelSize: { width: 50, height: 30 },
        objects: [
            // Black header bar with compound name
            { type: 'rect', left: 0, top: 0, width: 400, height: 40, fill: '#000000', stroke: 'transparent' },
            { type: 'text', text: 'COMPOUND NAME', left: 200, top: 20, fontSize: 20, fontWeight: 'bold', textAlign: 'center', originX: 'center', originY: 'center', fill: 'white' },

            // Dosage box with border (left side)
            { type: 'rect', left: 15, top: 50, width: 90, height: 50, stroke: '#cc0000', strokeWidth: 2, fill: 'transparent' },
            { type: 'text', text: '10 mg', left: 60, top: 75, fontSize: 18, fontWeight: 'bold', textAlign: 'center', originX: 'center', originY: 'center' },

            // Lot number below dosage
            { type: 'text', text: 'LOT123456', left: 60, top: 110, fontSize: 10, textAlign: 'center', originX: 'center', originY: 'center' },

            // QR code area (center)
            { type: 'qrcode', value: 'https://example.com/verify', left: 150, top: 50, originX: 'left' },

            // "For Research use only"
            { type: 'text', text: 'Research Only', left: 200, top: 140, fontSize: 10, textAlign: 'center', originX: 'center', originY: 'center' },

            // Expiry date box (right side)
            { type: 'rect', left: 300, top: 50, width: 85, height: 70, stroke: '#cc0000', strokeWidth: 2, fill: 'transparent' },
            { type: 'text', text: 'EXP', left: 342, top: 65, fontSize: 12, textAlign: 'center', originX: 'center', originY: 'center' },
            { type: 'text', text: '12/25', left: 342, top: 90, fontSize: 16, fontWeight: 'bold', textAlign: 'center', originX: 'center', originY: 'center' },

            // Bottom row - reconstitution info
            { type: 'text', text: '2mL BAC | 10u = 0.5mg', left: 200, top: 165, fontSize: 12, textAlign: 'center', originX: 'center', originY: 'center' },

            // Vendor code
            { type: 'text', text: 'VND', left: 380, top: 220, fontSize: 10, textAlign: 'right', originX: 'right', originY: 'center' },
        ],
    },
    {
        id: 'peptide-pro-50x15',
        name: 'Peptide Pro (50×15)',
        description: 'Compact professional layout',
        category: 'Medical',
        labelSize: { width: 50, height: 15 },
        objects: [
            // Black header bar with compound name
            { type: 'rect', left: 0, top: 0, width: 400, height: 28, fill: '#000000', stroke: 'transparent' },
            { type: 'text', text: 'COMPOUND', left: 200, top: 14, fontSize: 16, fontWeight: 'bold', textAlign: 'center', originX: 'center', originY: 'center', fill: 'white' },

            // Dosage box with red border (left)
            { type: 'rect', left: 10, top: 35, width: 70, height: 35, stroke: '#cc0000', strokeWidth: 2, fill: 'transparent' },
            { type: 'text', text: '10 mg', left: 45, top: 52, fontSize: 14, fontWeight: 'bold', textAlign: 'center', originX: 'center', originY: 'center' },

            // Lot number (below dosage)
            { type: 'text', text: 'LOT123456', left: 45, top: 75, fontSize: 8, textAlign: 'center', originX: 'center', originY: 'center' },

            // Center info
            { type: 'text', text: '2mL BAC | 10u=0.5mg', left: 200, top: 52, fontSize: 10, textAlign: 'center', originX: 'center', originY: 'center' },
            { type: 'text', text: 'Research Only', left: 200, top: 85, fontSize: 8, textAlign: 'center', originX: 'center', originY: 'center' },

            // Expiry box (right side)
            { type: 'rect', left: 320, top: 35, width: 70, height: 50, stroke: '#cc0000', strokeWidth: 2, fill: 'transparent' },
            { type: 'text', text: 'EXP', left: 355, top: 45, fontSize: 10, textAlign: 'center', originX: 'center', originY: 'center' },
            { type: 'text', text: '12/25', left: 355, top: 68, fontSize: 14, fontWeight: 'bold', textAlign: 'center', originX: 'center', originY: 'center' },
        ],
    },
    {
        id: 'peptide-minimal',
        name: 'Peptide Minimal (50×15)',
        description: 'Clean minimal design',
        category: 'Medical',
        labelSize: { width: 50, height: 15 },
        objects: [
            // Compound name - large bold
            { type: 'text', text: 'RETATRUTIDE', left: 200, top: 15, fontSize: 18, fontWeight: 'bold', textAlign: 'center', originX: 'center', originY: 'center' },

            // Divider line
            { type: 'line', left: 20, top: 35, x1: 0, y1: 0, x2: 360, y2: 0, stroke: '#000000', strokeWidth: 1 },

            // Info row: Dosage | Reconstitution
            { type: 'text', text: '10mg | 2mL BAC | 10u = 0.5mg', left: 200, top: 50, fontSize: 12, textAlign: 'center', originX: 'center', originY: 'center' },

            // Bottom row: Date and Vendor
            { type: 'text', text: '__/__/__', left: 60, top: 85, fontSize: 10, originX: 'center', originY: 'center' },
            { type: 'text', text: 'VND', left: 340, top: 85, fontSize: 10, textAlign: 'right', originX: 'right', originY: 'center' },

            // Divider line bottom
            { type: 'line', left: 20, top: 100, x1: 0, y1: 0, x2: 360, y2: 0, stroke: '#000000', strokeWidth: 1 },
        ],
    },
    {
        id: 'peptide-atom',
        name: 'Peptide with Atom Icon (50×30)',
        description: 'Professional with atom symbol',
        category: 'Medical',
        labelSize: { width: 50, height: 30 },
        objects: [
            // Black header bar
            { type: 'rect', left: 0, top: 0, width: 400, height: 40, fill: '#000000', stroke: 'transparent' },
            { type: 'text', text: 'COMPOUND NAME', left: 200, top: 20, fontSize: 18, fontWeight: 'bold', textAlign: 'center', originX: 'center', originY: 'center', fill: 'white' },

            // Dosage with border (left)
            { type: 'rect', left: 15, top: 50, width: 85, height: 45, stroke: '#000000', strokeWidth: 2, fill: 'transparent' },
            { type: 'text', text: '10 mg', left: 57, top: 72, fontSize: 16, fontWeight: 'bold', textAlign: 'center', originX: 'center', originY: 'center' },

            // Lot number
            { type: 'text', text: 'LOT12345', left: 57, top: 110, fontSize: 10, textAlign: 'center', originX: 'center', originY: 'center' },

            // Atom symbol area (center)
            { type: 'text', text: '⚛', left: 200, top: 72, fontSize: 48, textAlign: 'center', originX: 'center', originY: 'center' },

            // Expiry box (right)
            { type: 'rect', left: 300, top: 50, width: 85, height: 70, stroke: '#000000', strokeWidth: 2, fill: 'transparent' },
            { type: 'text', text: 'EXP', left: 342, top: 65, fontSize: 12, textAlign: 'center', originX: 'center', originY: 'center' },
            { type: 'text', text: '12/25', left: 342, top: 90, fontSize: 16, fontWeight: 'bold', textAlign: 'center', originX: 'center', originY: 'center' },

            // Reconstitution 
            { type: 'text', text: '2mL BAC | 10u = 0.5mg', left: 200, top: 145, fontSize: 12, textAlign: 'center', originX: 'center', originY: 'center' },

            // Research notice
            { type: 'text', text: 'For Research Use Only', left: 200, top: 200, fontSize: 10, textAlign: 'center', originX: 'center', originY: 'center' },
        ],
    },
    {
        id: 'rx-standard',
        name: 'Rx Label (50×30)',
        description: 'Prescription style format',
        category: 'Medical',
        labelSize: { width: 50, height: 30 },
        objects: [
            // Border - full label
            { type: 'rect', left: 5, top: 5, width: 390, height: 230, stroke: '#000000', strokeWidth: 2 },

            // Rx symbol
            { type: 'text', text: '℞', left: 20, top: 12, fontSize: 28, fontWeight: 'bold' },

            // Drug name
            { type: 'text', text: 'COMPOUND NAME', left: 70, top: 15, fontSize: 18, fontWeight: 'bold' },

            // Strength
            { type: 'text', text: '10mg / vial', left: 70, top: 45, fontSize: 14 },

            // Divider line
            { type: 'line', left: 15, top: 75, x1: 0, y1: 0, x2: 370, y2: 0, stroke: '#000000', strokeWidth: 1 },

            // Instructions
            { type: 'text', text: 'Reconstituted with 2mL BAC Water', left: 20, top: 85, fontSize: 12 },
            { type: 'text', text: '10 units = 0.5mg', left: 20, top: 110, fontSize: 14, fontWeight: 'bold' },

            // Divider line
            { type: 'line', left: 15, top: 140, x1: 0, y1: 0, x2: 370, y2: 0, stroke: '#000000', strokeWidth: 1 },

            // Date and lot
            { type: 'text', text: 'Date: __/__/__', left: 20, top: 150, fontSize: 11 },
            { type: 'text', text: 'Lot: ______', left: 200, top: 150, fontSize: 11 },

            // Expiry
            { type: 'text', text: 'Exp: __/__/__', left: 20, top: 175, fontSize: 11 },
            { type: 'text', text: 'Source: ___', left: 200, top: 175, fontSize: 11 },

            // Research notice
            { type: 'text', text: 'FOR RESEARCH USE ONLY', left: 200, top: 210, fontSize: 10, textAlign: 'center', originX: 'center', originY: 'center' },
        ],
    },
    {
        id: 'simple-vial',
        name: 'Simple Vial (50×15)',
        description: 'Clean 3-line layout',
        category: 'Medical',
        labelSize: { width: 50, height: 15 },
        objects: [
            // Compound name - top line
            { type: 'text', text: 'RETATRUTIDE', left: 200, top: 18, fontSize: 18, fontWeight: 'bold', textAlign: 'center', originX: 'center', originY: 'center' },

            // Dosage and reconstitution - middle line
            { type: 'text', text: '10mg | 2mL BAC | 10u=0.5mg', left: 200, top: 55, fontSize: 12, textAlign: 'center', originX: 'center', originY: 'center' },

            // Date, Lot, Vendor - bottom line
            { type: 'text', text: '__/__/__', left: 50, top: 90, fontSize: 10, originX: 'center', originY: 'center' },
            { type: 'text', text: 'LOT: ______', left: 200, top: 90, fontSize: 10, textAlign: 'center', originX: 'center', originY: 'center' },
            { type: 'text', text: '___', left: 350, top: 90, fontSize: 10, originX: 'right', textAlign: 'right', originY: 'center' },

            // Bottom accent line
            { type: 'line', left: 10, top: 105, x1: 0, y1: 0, x2: 380, y2: 0, stroke: '#000000', strokeWidth: 2 },
        ],
    },

    // Add generated peptide templates
    ...generatePeptideTemplates(),
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory() {
    const categories = {};
    for (const template of LABEL_TEMPLATES) {
        const cat = template.category;
        if (!categories[cat]) {
            categories[cat] = [];
        }
        categories[cat].push(template);
    }
    return categories;
}

/**
 * Get peptide templates by subcategory
 */
export function getPeptidesByCategory() {
    const peptideTemplates = LABEL_TEMPLATES.filter(t => t.category === 'Peptides');
    const categories = {};
    for (const template of peptideTemplates) {
        const subcat = template.subcategory || 'Other';
        if (!categories[subcat]) {
            categories[subcat] = [];
        }
        categories[subcat].push(template);
    }
    return categories;
}

/**
 * Search templates by name
 */
export function searchTemplates(query) {
    const lowerQuery = query.toLowerCase();
    return LABEL_TEMPLATES.filter(t =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.category.toLowerCase().includes(lowerQuery)
    );
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
];

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
];

/**
 * Common font sizes
 */
export const FONT_SIZES = [6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72];
