import { useState, useMemo } from 'react';
import { X, Search, LayoutTemplate, Beaker, Package, Tag, Truck, Users, QrCode, Box, Ruler, Pill } from 'lucide-react';
import { LABEL_TEMPLATES, VENDORS, getPeptidesByCategory, getTemplatesByCategory, searchTemplates } from '../utils/templates';

/**
 * Category icons mapping
 */
const CATEGORY_ICONS = {
    'Basic': LayoutTemplate,
    'Retail': Tag,
    'Logistics': Truck,
    'Events': Users,
    'Digital': QrCode,
    'Warehouse': Box,
    'Lab': Beaker,
    'Medical': Pill,
    'Peptides': Beaker,
};

/**
 * Available label sizes
 */
const LABEL_SIZES = [
    { name: '50×15mm (Vial)', width: 50, height: 15 },
    { name: '40×20mm', width: 40, height: 20 },
    { name: '50×30mm', width: 50, height: 30 },
    { name: '40×30mm', width: 40, height: 30 },
    { name: '25×15mm', width: 25, height: 15 },
    { name: '30×20mm', width: 30, height: 20 },
    { name: '15×50mm (Cable)', width: 15, height: 50 },
];

/**
 * Template Picker Modal
 */
export function TemplatePicker({ isOpen, onClose, onSelectTemplate }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedVendor, setSelectedVendor] = useState('');
    const [selectedLabelSize, setSelectedLabelSize] = useState(LABEL_SIZES[0]); // Default to 50x15mm

    // Get categorized templates
    const templatesByCategory = useMemo(() => getTemplatesByCategory(), []);
    const categories = ['All', ...Object.keys(templatesByCategory)];

    // Filter templates
    const filteredTemplates = useMemo(() => {
        let templates = LABEL_TEMPLATES;

        // Filter by search
        if (searchQuery) {
            templates = searchTemplates(searchQuery);
        }

        // Filter by category
        if (selectedCategory !== 'All') {
            templates = templates.filter(t => t.category === selectedCategory);
        }

        return templates;
    }, [searchQuery, selectedCategory]);

    // Handle template selection with vendor and label size override
    const handleSelect = (template) => {
        // Clone template but KEEP original size for scaling calculations
        const templateToApply = {
            ...template,
            objects: template.objects.map(obj => {
                if (obj.text === '___' || obj.text === 'VND') {
                    return { ...obj, text: selectedVendor || '___' };
                }
                return obj;
            }),
        };

        // Pass both the template AND the target size
        onSelectTemplate(templateToApply, {
            width: selectedLabelSize.width,
            height: selectedLabelSize.height
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-panel-bg rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <LayoutTemplate size={24} className="text-highlight" />
                        Label Templates
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {/* Settings Bar - Label Size, Vendor */}
                <div className="p-4 bg-accent/20 border-b border-gray-700">
                    <div className="flex items-center gap-6 flex-wrap">
                        {/* Label Size Selector - Prominent */}
                        <div className="flex items-center gap-3">
                            <Ruler size={20} className="text-highlight" />
                            <span className="text-sm text-gray-300 font-medium">Label Size:</span>
                            <div className="flex gap-2 flex-wrap">
                                {LABEL_SIZES.map(size => (
                                    <button
                                        key={size.name}
                                        onClick={() => setSelectedLabelSize(size)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedLabelSize.name === size.name
                                            ? 'bg-highlight text-white font-medium'
                                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                            }`}
                                    >
                                        {size.width}×{size.height}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Vendor Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-300">Vendor:</span>
                            <select
                                value={selectedVendor}
                                onChange={(e) => setSelectedVendor(e.target.value)}
                                className="w-44 px-3 py-1.5 bg-gray-700 rounded-lg border border-gray-600 text-sm"
                            >
                                <option value="">No Vendor</option>
                                {VENDORS.map(v => (
                                    <option key={v.code} value={v.code}>{v.code} - {v.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Search and Category Toolbar */}
                <div className="p-4 border-b border-gray-700 space-y-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search templates (e.g., Retatrutide, BPC-157, shipping)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-canvas-bg rounded-lg border border-gray-600 focus:border-highlight focus:outline-none"
                        />
                    </div>

                    {/* Category tabs */}
                    <div className="flex gap-2 flex-wrap">
                        {categories.map(cat => {
                            const Icon = CATEGORY_ICONS[cat] || LayoutTemplate;
                            const count = cat === 'All'
                                ? LABEL_TEMPLATES.length
                                : (templatesByCategory[cat]?.length || 0);
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${selectedCategory === cat
                                        ? 'bg-highlight text-white'
                                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                        }`}
                                >
                                    <Icon size={14} />
                                    {cat}
                                    <span className="text-xs opacity-70">({count})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Template Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    {filteredTemplates.length === 0 ? (
                        <div className="text-center text-gray-400 py-12">
                            No templates found matching "{searchQuery}"
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {filteredTemplates.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => handleSelect(template)}
                                    className="p-3 bg-canvas-bg rounded-lg border border-gray-700 hover:border-highlight hover:bg-accent/20 transition-all text-left group"
                                >
                                    {/* Preview (simplified) */}
                                    <div className="aspect-[3/2] bg-white rounded mb-2 flex items-center justify-center text-gray-400 text-xs overflow-hidden">
                                        <div className="text-center p-1">
                                            <div className="font-bold text-gray-700 text-xs truncate">
                                                {template.objects.find(o => o.fontWeight === 'bold')?.text || template.name}
                                            </div>
                                            {template.subcategory && (
                                                <div className="text-gray-500 text-[10px]">{template.subcategory}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="text-sm font-medium text-white truncate group-hover:text-highlight">
                                        {template.name}
                                    </div>
                                    <div className="text-xs text-gray-400 truncate">
                                        {template.description}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-700 flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                        {filteredTemplates.length} templates available
                    </span>
                    <span className="text-highlight font-medium">
                        Selected size: {selectedLabelSize.width}×{selectedLabelSize.height}mm
                    </span>
                </div>
            </div>
        </div>
    );
}
