import { ArrowDown, ArrowRight, Printer, Settings2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getLLMSettings, saveLLMSettings } from '../services/llmService'

export function PrintDialog({ isOpen, onClose, onPrint, isPrinting }) {
    const [settings, setSettings] = useState({
        quantity: 1,
        direction: 'left',
        offsetX: 0,
        offsetY: 0,
    })

    // Load saved settings on open
    useEffect(() => {
        if (isOpen) {
            const saved = getLLMSettings()
            setSettings({
                quantity: 1, // Reset copies to 1
                direction: saved.printDirection || 'left',
                offsetX: saved.printOffsetX || 0,
                offsetY: saved.printOffsetY || 0,
            })
        }
    }, [isOpen])

    // Save settings when changed
    const updateSetting = (key, value) => {
        const newSettings = { ...settings, [key]: value }
        setSettings(newSettings)

        // Save to valid storage keys
        saveLLMSettings({
            printDirection: newSettings.direction,
            printOffsetX: newSettings.offsetX,
            printOffsetY: newSettings.offsetY,
        })
    }

    const handlePrint = () => {
        onPrint(settings)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4'>
            <div className='bg-panel-bg rounded-xl shadow-2xl w-full max-w-md flex flex-col'>

                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b border-gray-700'>
                    <h2 className='text-xl font-bold text-white flex items-center gap-2'>
                        <Printer size={24} className="text-highlight" />
                        Print Label
                    </h2>
                    <button onClick={onClose} className='p-2 hover:bg-gray-700 rounded-lg'>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className='p-6 space-y-6'>

                    {/* Quantity */}
                    <div>
                        <label className='text-sm font-medium text-gray-300 block mb-2'>Copies</label>
                        <div className='flex items-center gap-4'>
                            <button
                                className='px-3 py-2 bg-gray-700 rounded-lg hover:bg-gray-600'
                                onClick={() => updateSetting('quantity', Math.max(1, settings.quantity - 1))}
                            >
                                -
                            </button>
                            <input
                                type='number'
                                min='1'
                                value={settings.quantity}
                                onChange={(e) => updateSetting('quantity', parseInt(e.target.value) || 1)}
                                className='flex-1 text-center py-2 bg-gray-800 rounded-lg border border-gray-600 focus:border-highlight focus:outline-none'
                            />
                            <button
                                className='px-3 py-2 bg-gray-700 rounded-lg hover:bg-gray-600'
                                onClick={() => updateSetting('quantity', settings.quantity + 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="h-px bg-gray-700" />

                    {/* Alignment Settings */}
                    <div>
                        <h3 className='text-sm font-medium text-gray-300 mb-3 flex items-center gap-2'>
                            <Settings2 size={16} />
                            Alignment & Direction
                        </h3>

                        {/* Direction */}
                        <div className='grid grid-cols-2 gap-3 mb-4'>
                            <button
                                onClick={() => updateSetting('direction', 'left')}
                                className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${settings.direction === 'left'
                                        ? 'bg-highlight/20 border-highlight text-white'
                                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                                    }`}
                            >
                                <ArrowRight size={20} />
                                <span className='text-xs'>Standard (Left)</span>
                            </button>
                            <button
                                onClick={() => updateSetting('direction', 'top')}
                                className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${settings.direction === 'top'
                                        ? 'bg-highlight/20 border-highlight text-white'
                                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                                    }`}
                            >
                                <ArrowDown size={20} />
                                <span className='text-xs'>Alternate (Top)</span>
                            </button>
                        </div>

                        {/* Offsets */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className='text-xs text-gray-400 block mb-1'>X Offset (mm)</label>
                                <input
                                    type="number"
                                    value={settings.offsetX}
                                    onChange={(e) => updateSetting('offsetX', parseFloat(e.target.value) || 0)}
                                    className='w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-highlight focus:outline-none'
                                />
                            </div>
                            <div>
                                <label className='text-xs text-gray-400 block mb-1'>Y Offset (mm)</label>
                                <input
                                    type="number"
                                    value={settings.offsetY}
                                    onChange={(e) => updateSetting('offsetY', parseFloat(e.target.value) || 0)}
                                    className='w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-highlight focus:outline-none'
                                />
                            </div>
                        </div>
                        <p className='text-xs text-gray-500 mt-2'>
                            Use offsets to center your label if it prints off-alignment.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className='p-4 border-t border-gray-700 flex justify-end gap-3'>
                    <button
                        onClick={onClose}
                        className='px-4 py-2 text-gray-400 hover:text-white transition-colors'
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePrint}
                        disabled={isPrinting}
                        className='px-6 py-2 bg-highlight hover:bg-highlight/90 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {isPrinting ? 'Printing...' : 'Print Label'}
                    </button>
                </div>
            </div>
        </div>
    )
}
