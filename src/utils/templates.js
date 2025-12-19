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
                    { type: 'text', text: peptide.name, left: 20, top: 8, fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
                    { type: 'text', text: dosage, left: 20, top: 28, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
                    { type: 'text', text: '___', left: 70, top: 32, fontSize: 8, textAlign: 'right' }, // Vendor placeholder
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
            { type: 'text', text: 'HELLO', left: 50, top: 5, fontSize: 10, textAlign: 'center' },
            { type: 'text', text: 'my name is', left: 50, top: 15, fontSize: 8, textAlign: 'center' },
            { type: 'text', text: 'Your Name', left: 50, top: 35, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
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
            { type: 'text', text: 'Scan Me', left: 15, top: 75, fontSize: 10, textAlign: 'center' },
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
            { type: 'text', text: 'Compound', left: 12, top: 5, fontSize: 8, fontWeight: 'bold', textAlign: 'center' },
            { type: 'text', text: '10mg', left: 12, top: 18, fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
        ],
    },
    {
        id: 'vial-medium',
        name: 'Vial Label (Medium)',
        description: 'Medium vial with vendor',
        category: 'Lab',
        labelSize: { width: 40, height: 20 },
        objects: [
            { type: 'text', text: 'Compound Name', left: 20, top: 5, fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
            { type: 'text', text: '10mg', left: 20, top: 22, fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
            { type: 'text', text: 'VND', left: 70, top: 32, fontSize: 6, textAlign: 'right' },
        ],
    },

    // Prescription-style templates
    // Note: 50mm = 400px, 15mm = 120px, 30mm = 240px at 203 DPI
    {
        id: 'rx-vial-50x15',
        name: 'Rx Vial (50×15)',
        description: 'Prescription vial label - fits 50×15mm',
        category: 'Medical',
        labelSize: { width: 50, height: 15 },
        objects: [
            // Border - full label
            { type: 'rect', left: 4, top: 4, width: 390, height: 110, stroke: '#000000', strokeWidth: 2 },
            // Rx symbol
            { type: 'text', text: '℞', left: 15, top: 10, fontSize: 28, fontWeight: 'bold' },
            // Drug name - large
            { type: 'text', text: 'COMPOUND', left: 55, top: 8, fontSize: 22, fontWeight: 'bold' },
            // Strength
            { type: 'text', text: '10mg', left: 320, top: 8, fontSize: 22, fontWeight: 'bold' },
            // Divider line
            { type: 'line', left: 10, top: 50, x1: 0, y1: 0, x2: 378, y2: 0 },
            // Bottom row - dosing and vendor
            { type: 'text', text: '2mL BAC | 10u = 0.5mg', left: 55, top: 60, fontSize: 16 },
            { type: 'text', text: '__/__/__', left: 250, top: 60, fontSize: 14 },
            { type: 'text', text: '___', left: 360, top: 88, fontSize: 14, textAlign: 'right' },
        ],
    },
    {
        id: 'rx-standard',
        name: 'Rx Label (Standard)',
        description: 'Prescription style - 50×30mm',
        category: 'Medical',
        labelSize: { width: 50, height: 30 },
        objects: [
            // Border - full label (50mm=400px, 30mm=240px)
            { type: 'rect', left: 4, top: 4, width: 390, height: 230, stroke: '#000000', strokeWidth: 2 },
            // Rx symbol
            { type: 'text', text: '℞', left: 15, top: 12, fontSize: 36, fontWeight: 'bold' },
            // Drug name
            { type: 'text', text: 'COMPOUND NAME', left: 70, top: 15, fontSize: 24, fontWeight: 'bold' },
            // Strength
            { type: 'text', text: '10mg/mL', left: 70, top: 50, fontSize: 20 },
            // Divider line
            { type: 'line', left: 10, top: 85, x1: 0, y1: 0, x2: 378, y2: 0 },
            // Instructions
            { type: 'text', text: 'Inject 0.5mL SubQ weekly', left: 15, top: 95, fontSize: 18 },
            // Reconstitution
            { type: 'text', text: '2mL BAC Water | 10 units = 0.5mg', left: 15, top: 130, fontSize: 16 },
            // Divider line
            { type: 'line', left: 10, top: 165, x1: 0, y1: 0, x2: 378, y2: 0 },
            // Date and lot
            { type: 'text', text: 'Date: __/__/__', left: 15, top: 175, fontSize: 14 },
            { type: 'text', text: 'Lot: ______', left: 200, top: 175, fontSize: 14 },
            // Vendor
            { type: 'text', text: '___', left: 370, top: 200, fontSize: 14, textAlign: 'right' },
        ],
    },
    {
        id: 'peptide-pro-50x15',
        name: 'Peptide Pro (50×15)',
        description: 'Professional peptide - 50×15mm',
        category: 'Medical',
        labelSize: { width: 50, height: 15 },
        objects: [
            // Top accent bar
            { type: 'rect', left: 0, top: 0, width: 400, height: 8, fill: '#000000', stroke: 'transparent' },
            // Name - centered
            { type: 'text', text: 'RETATRUTIDE', left: 200, top: 15, fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
            // Strength badge
            { type: 'rect', left: 150, top: 50, width: 100, height: 30, stroke: '#000000', strokeWidth: 2 },
            { type: 'text', text: '10 mg', left: 200, top: 53, fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
            // Bottom info
            { type: 'text', text: '2mL BAC | 10u=0.5mg', left: 200, top: 90, fontSize: 14, textAlign: 'center' },
            { type: 'text', text: '___', left: 380, top: 95, fontSize: 12, textAlign: 'right' },
        ],
    },
    {
        id: 'simple-vial',
        name: 'Simple Vial (50×15)',
        description: 'Clean minimal vial label',
        category: 'Medical',
        labelSize: { width: 50, height: 15 },
        objects: [
            // Top line
            { type: 'line', left: 10, top: 5, x1: 0, y1: 0, x2: 380, y2: 0 },
            // Drug name - large centered
            { type: 'text', text: 'RETATRUTIDE', left: 200, top: 15, fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
            // Strength and dosing
            { type: 'text', text: '10mg | 2mL BAC | 10u=0.5mg', left: 200, top: 55, fontSize: 18, textAlign: 'center' },
            // Date and vendor
            { type: 'text', text: '__/__/__', left: 20, top: 90, fontSize: 14 },
            { type: 'text', text: '___', left: 380, top: 90, fontSize: 14, textAlign: 'right' },
            // Bottom line
            { type: 'line', left: 10, top: 112, x1: 0, y1: 0, x2: 380, y2: 0 },
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
