import {
    Bluetooth,
    Usb,
    Power,
    Printer,
    Download,
    Upload,
    Battery,
    BatteryLow,
    BatteryMedium,
    BatteryFull,
    AlertTriangle,
    X,
    RefreshCw,
    ScanLine,
    Layers,
    Settings
} from 'lucide-react';
import { LABEL_PRESETS } from '../utils/utils';

/**
 * Get appropriate battery icon based on level
 */
function BatteryIcon({ level }) {
    if (level === null || level === undefined) return <Battery size={16} className="text-gray-500" />;
    if (level <= 20) return <BatteryLow size={16} className="text-red-500" />;
    if (level <= 50) return <BatteryMedium size={16} className="text-yellow-500" />;
    return <BatteryFull size={16} className="text-green-500" />;
}

/**
 * Top application bar with connection and file controls
 */
export function TopBar({
    // Printer state
    isConnected,
    isConnecting,
    isPrinting,
    isDetecting,
    connectionStatus,
    batteryLevel,
    printerModel,
    printProgress,
    error,
    canReconnect,
    rfidInfo,

    // Printer actions
    onConnectBLE,
    onConnectUSB,
    onReconnect,
    onDisconnect,
    onDetectPaper,
    onPrint,
    onClearError,

    // File actions
    onExport,
    onImport,

    // Label settings
    labelWidth,
    labelHeight,
    onLabelSizeChange,

    // Auto-save setting
    autoSaveBeforePrint,
    onAutoSaveChange,

    // Settings
    onOpenSettings,
}) {
    return (
        <header className="bg-panel-bg border-b border-gray-700/50 px-4 py-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Logo / Title */}
                <div className="flex items-center gap-3">
                    <Printer size={24} className="text-highlight" />
                    <h1 className="text-lg font-bold bg-gradient-to-r from-highlight to-pink-400 bg-clip-text text-transparent">
                        Niimbot Label Designer
                    </h1>
                </div>

                {/* Label Size Controls */}
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Label:</span>

                    {/* Preset dropdown */}
                    <select
                        value={`${labelWidth}x${labelHeight}`}
                        onChange={(e) => {
                            const [w, h] = e.target.value.split('x').map(Number);
                            if (w && h) onLabelSizeChange(w, h);
                        }}
                        className="w-24"
                    >
                        {LABEL_PRESETS.map((preset) => (
                            <option key={preset.name} value={`${preset.width}x${preset.height}`}>
                                {preset.name}
                            </option>
                        ))}
                        <option value="custom">Custom</option>
                    </select>

                    {/* Custom size inputs */}
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        defaultValue={labelWidth}
                        key={`width-${labelWidth}`}
                        onBlur={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 10 && val <= 100) {
                                onLabelSizeChange(val, labelHeight);
                            } else {
                                e.target.value = labelWidth;
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') e.target.blur();
                        }}
                        className="w-14 text-center"
                    />
                    <span className="text-gray-500">×</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        defaultValue={labelHeight}
                        key={`height-${labelHeight}`}
                        onBlur={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 10 && val <= 100) {
                                onLabelSizeChange(labelWidth, val);
                            } else {
                                e.target.value = labelHeight;
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') e.target.blur();
                        }}
                        className="w-14 text-center"
                    />
                    <span className="text-gray-400">mm</span>

                    {/* Detect Paper Button */}
                    {isConnected && (
                        <button
                            onClick={onDetectPaper}
                            disabled={isDetecting}
                            className="btn-secondary flex items-center gap-2"
                            title="Detect paper from printer RFID"
                        >
                            <ScanLine size={16} className={isDetecting ? 'animate-pulse' : ''} />
                            {isDetecting ? 'Detecting...' : 'Detect'}
                        </button>
                    )}
                </div>

                {/* Connection Controls */}
                <div className="flex items-center gap-2">
                    {!isConnected ? (
                        <>
                            <button
                                onClick={onConnectBLE}
                                disabled={isConnecting}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Bluetooth size={16} />
                                {isConnecting ? 'Connecting...' : 'Bluetooth'}
                            </button>
                            {canReconnect && (
                                <button
                                    onClick={onReconnect}
                                    disabled={isConnecting}
                                    className="btn-secondary flex items-center gap-2"
                                    title="Reconnect to last printer"
                                >
                                    <RefreshCw size={16} />
                                    Reconnect
                                </button>
                            )}
                            <button
                                onClick={onConnectUSB}
                                disabled={isConnecting}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <Usb size={16} />
                                USB
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onDisconnect}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Power size={16} />
                            Disconnect
                        </button>
                    )}

                    {/* Connection Status */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-canvas-bg rounded-lg">
                        <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
                        <span className="text-sm text-gray-300">{connectionStatus}</span>
                        {printerModel && (
                            <span className="text-xs text-gray-500">({printerModel})</span>
                        )}
                        {batteryLevel !== null && (
                            <div className="flex items-center gap-1 ml-2">
                                <BatteryIcon level={batteryLevel} />
                                <span className="text-xs text-gray-400">{batteryLevel}%</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* File & Print Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onImport}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Upload size={16} />
                        Load
                    </button>
                    <button
                        onClick={onExport}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Download size={16} />
                        Save
                    </button>
                    <button
                        onClick={onPrint}
                        disabled={!isConnected || isPrinting}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Printer size={16} />
                        {isPrinting ? 'Printing...' : 'Print'}
                    </button>

                    {/* Auto-save toggle */}
                    <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer ml-2">
                        <input
                            type="checkbox"
                            checked={autoSaveBeforePrint}
                            onChange={(e) => onAutoSaveChange(e.target.checked)}
                            className="w-4 h-4 rounded"
                        />
                        Auto-save
                    </label>

                    {/* Settings Button */}
                    <button
                        onClick={onOpenSettings}
                        className="btn-secondary flex items-center gap-2 ml-2"
                        title="Settings"
                    >
                        <Settings size={16} />
                    </button>
                </div>
            </div>

            {/* RFID Info Display */}
            {rfidInfo && rfidInfo.tagPresent && (
                <div className="mt-3 bg-accent/30 rounded-lg p-2 flex items-center gap-4 text-sm">
                    <Layers size={16} className="text-gray-400" />
                    <span className="text-gray-300">
                        Paper: <span className="text-white font-medium">{rfidInfo.usedPaper} / {rfidInfo.allPaper}</span> labels used
                    </span>
                    {rfidInfo.barCode && (
                        <span className="text-gray-400">
                            Code: {rfidInfo.barCode}
                        </span>
                    )}
                </div>
            )}

            {/* Print Progress */}
            {printProgress && (
                <div className="mt-3 bg-accent/30 rounded-lg p-2 flex items-center gap-3">
                    <div className="flex-1">
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-highlight transition-all duration-300"
                                style={{ width: `${printProgress.printProgress}%` }}
                            />
                        </div>
                    </div>
                    <span className="text-sm text-gray-300">
                        Page {printProgress.page}/{printProgress.totalPages} - {printProgress.printProgress}%
                    </span>
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div className="mt-3 bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-3">
                    <AlertTriangle size={20} className="text-red-400" />
                    <span className="flex-1 text-sm text-red-200">{error}</span>
                    <button onClick={onClearError} className="p-1 hover:bg-red-500/30 rounded">
                        <X size={16} className="text-red-400" />
                    </button>
                </div>
            )}
        </header>
    );
}
