/**
 * Niimbot Label SKU Lookup Table
 * Maps barcodes and SKUs to label dimensions
 * Source: Official Niimbot stores + community data (Dec 2025)
 */

/**
 * Label paper database
 * Key: barcode (13-digit EAN) or SKU (NBxxx)
 */
export const NIIMBOT_LABELS = {
    // D-Series Labels (12-15mm Width - Compact)
    // By Barcode
    '6972842743558': { sku: 'NB101', width: 12, height: 22, count: 780, material: 'Thermal Gap', models: ['D11', 'D101', 'D110'] },
    '6972842743565': { sku: 'NB102', width: 12, height: 30, count: 630, material: 'Thermal Gap', models: ['D11', 'D101', 'D110'] },
    '6972842743572': { sku: 'NB103', width: 12, height: 40, count: 480, material: 'Thermal Gap', models: ['D11', 'D101', 'D110'] },
    '6972842743589': { sku: 'NB104', width: 15, height: 30, count: 210, material: 'Thermal Gap', models: ['D11', 'D101', 'D110'] },
    '6972842743596': { sku: 'NB105', width: 15, height: 50, count: 130, material: 'Thermal Gap', models: ['D11', 'D101', 'D110', 'H1S'] },
    '6972842743602': { sku: 'NB106', width: 14, height: 60, count: 330, material: 'Thermal Gap', models: ['D11', 'D101', 'D110'] },

    // B18 Thermal Transfer Ribbons (these are color ribbons, not label paper)
    '6972842745217': { sku: 'NB422', width: null, height: null, count: null, material: 'Thermal Transfer Ribbon', models: ['B18'], color: 'Black' },
    '6972842747235': { sku: 'NB423', width: null, height: null, count: null, material: 'Thermal Transfer Ribbon', models: ['B18'], color: 'Green' },
    '6972842747259': { sku: 'NB424', width: null, height: null, count: null, material: 'Thermal Transfer Ribbon', models: ['B18'], color: 'Blue' },
    '6972842747228': { sku: 'NB425', width: null, height: null, count: null, material: 'Thermal Transfer Ribbon', models: ['B18'], color: 'Red' },
    '6972842747242': { sku: 'NB426', width: null, height: null, count: null, material: 'Thermal Transfer Ribbon', models: ['B18'], color: 'White' },
};

/**
 * SKU-based lookup (for labels without known barcodes)
 */
export const NIIMBOT_SKUS = {
    // D-Series
    'NB101': { width: 12, height: 22, count: 780, material: 'Thermal Gap', models: ['D11', 'D101', 'D110'] },
    'NB102': { width: 12, height: 30, count: 630, material: 'Thermal Gap', models: ['D11', 'D101', 'D110'] },
    'NB103': { width: 12, height: 40, count: 480, material: 'Thermal Gap', models: ['D11', 'D101', 'D110'] },
    'NB104': { width: 15, height: 30, count: 210, material: 'Thermal Gap', models: ['D11', 'D101', 'D110'] },
    'NB105': { width: 15, height: 50, count: 130, material: 'Thermal Gap', models: ['D11', 'D101', 'D110', 'H1S'] },
    'NB106': { width: 14, height: 60, count: 330, material: 'Thermal Gap', models: ['D11', 'D101', 'D110'] },
    'NB107': { width: 15, height: 50, count: 130, material: 'Thermal Gap', models: ['D11', 'D101', 'D110', 'H1S'] },
    'NB108': { width: 12, height: 109, count: 195, material: 'Thermal Gap', models: ['D11', 'D101', 'D110'] }, // Cable
    'NB109': { width: 14, height: 40, count: 480, material: 'Transparent', models: ['D11', 'D101', 'D110'] },
    'NB110': { width: 14, height: 28, count: 220, material: 'Thermal Gap', models: ['D11', 'D101', 'D110'], shape: 'Round' },

    // D-Series Color
    'NB201': { width: 12, height: 22, count: 780, material: 'Thermal Gap', models: ['D11', 'D101', 'D110'], colored: true },
    'NB202': { width: 15, height: 30, count: 210, material: 'Thermal Gap', models: ['D11', 'D101', 'D110'], colored: true },

    // D-Series Transparent
    'NB301': { width: 12, height: 22, count: 780, material: 'Transparent', models: ['D11', 'D101', 'D110'] },
    'NB302': { width: 15, height: 30, count: 210, material: 'Transparent', models: ['D11', 'D101', 'D110'] },

    // D-Series Cable
    'NB401': { width: 12, height: 109, count: 195, material: 'Thermal Gap', models: ['D11', 'D101', 'D110'] },
    'NB402': { width: 14, height: 60, count: 330, material: 'Thermal Gap', models: ['D11', 'D101', 'D110'] },

    // B-Series White Labels (>25mm Width)
    'NB501': { width: 30, height: 15, count: 460, material: 'Thermal Gap', models: ['B21', 'B1', 'B3S'] },
    'NB502': { width: 50, height: 30, count: 230, material: 'Thermal Gap', models: ['B21', 'B1', 'B3S'] },
    'NB503': { width: 40, height: 30, count: 280, material: 'Thermal Gap', models: ['B21', 'B1', 'B3S'] },
    'NB504': { width: 40, height: 40, count: 210, material: 'Thermal Gap', models: ['B21', 'B1', 'B3S'] },
    'NB505': { width: 50, height: 50, count: 120, material: 'Thermal Gap', models: ['B21', 'B1', 'B3S'] },

    // B-Series Clear
    'NB601': { width: 30, height: 15, count: 460, material: 'Transparent', models: ['B21', 'B1', 'B3S'] },
    'NB602': { width: 50, height: 30, count: 230, material: 'Transparent', models: ['B21', 'B1', 'B3S'] },

    // B-Series Color
    'NB701': { width: 30, height: 15, count: 460, material: 'Thermal Gap', models: ['B21', 'B1', 'B3S'], colored: true },
    'NB702': { width: 50, height: 30, count: 230, material: 'Thermal Gap', models: ['B21', 'B1', 'B3S'], colored: true },

    // B-Series Round
    'NB801': { width: 20, height: 20, count: 600, material: 'Thermal Gap', models: ['B21', 'B1', 'B3S'], shape: 'Round' },
    'NB802': { width: 25, height: 25, count: 420, material: 'Thermal Gap', models: ['B21', 'B1', 'B3S'], shape: 'Round' },
    'NB803': { width: 30, height: 30, count: 320, material: 'Thermal Gap', models: ['B21', 'B1', 'B3S'], shape: 'Round' },

    // B-Series Cable
    'NB901': { width: 30, height: 15, count: 460, material: 'Thermal Gap', models: ['B21', 'B1', 'B3S'] },

    // D101 Cute Color Labels
    'NB1401': { width: 25, height: 25, count: 420, material: 'Thermal Gap', models: ['D101'], colored: true },
    'NB1402': { width: 25, height: 50, count: 210, material: 'Thermal Gap', models: ['D101'], colored: true },
};

/**
 * Look up label dimensions from barcode
 * @param {string} barcode - 13-digit EAN barcode or SKU
 * @returns {Object|null} Label info with width, height, etc. or null if not found
 */
export function lookupLabelByBarcode(barcode) {
    if (!barcode) return null;

    // Clean the barcode (remove spaces, dashes)
    const cleanBarcode = barcode.replace(/[\s-]/g, '');

    // Try direct barcode lookup
    if (NIIMBOT_LABELS[cleanBarcode]) {
        return NIIMBOT_LABELS[cleanBarcode];
    }

    // Try SKU lookup
    const upperBarcode = cleanBarcode.toUpperCase();
    if (NIIMBOT_SKUS[upperBarcode]) {
        return { sku: upperBarcode, ...NIIMBOT_SKUS[upperBarcode] };
    }

    // Check if barcode contains a known SKU pattern
    for (const sku of Object.keys(NIIMBOT_SKUS)) {
        if (cleanBarcode.includes(sku) || upperBarcode.includes(sku)) {
            return { sku, ...NIIMBOT_SKUS[sku] };
        }
    }

    return null;
}

/**
 * Get all labels compatible with a printer model
 * @param {string} model - Printer model (e.g., 'B21', 'D11')
 * @returns {Array} Array of compatible label specs
 */
export function getLabelsForModel(model) {
    const results = [];

    for (const [sku, spec] of Object.entries(NIIMBOT_SKUS)) {
        if (spec.models?.includes(model)) {
            results.push({ sku, ...spec });
        }
    }

    return results.sort((a, b) => (a.width * a.height) - (b.width * b.height));
}
