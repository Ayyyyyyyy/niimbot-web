import { useState, useCallback, useRef, useEffect } from 'react';
import {
    NiimbotBluetoothClient,
    NiimbotSerialClient,
    ImageEncoder,
} from '@mmote/niimbluelib';
import { cleanCanvasForPrint } from '../utils/utils';

/**
 * Custom hook for managing Niimbot printer connection and printing
 */
export function usePrinter() {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [batteryLevel, setBatteryLevel] = useState(null);
    const [printerModel, setPrinterModel] = useState(null);
    const [printProgress, setPrintProgress] = useState(null);
    const [error, setError] = useState(null);
    const [canReconnect, setCanReconnect] = useState(false);
    const [rfidInfo, setRfidInfo] = useState(null);
    const [isDetecting, setIsDetecting] = useState(false);

    const clientRef = useRef(null);
    const lastTransportRef = useRef('ble');

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (clientRef.current) {
                clientRef.current.disconnect();
            }
        };
    }, []);

    /**
     * Set up event handlers for the client
     */
    const setupClientEvents = useCallback((client) => {
        client.on('connect', () => {
            setIsConnected(true);
            setConnectionStatus('Connected');
            setIsConnecting(false);
            setCanReconnect(true);

            // Try to get printer info
            const model = client.getPrintTaskType();
            if (model) {
                setPrinterModel(model);
            }
        });

        client.on('disconnect', () => {
            setIsConnected(false);
            setConnectionStatus('Disconnected');
            setBatteryLevel(null);
            setPrintProgress(null);
            // Keep canReconnect true so user can try reconnecting
        });

        client.on('printprogress', (e) => {
            setPrintProgress({
                page: e.page,
                totalPages: e.pagesTotal,
                printProgress: e.pagePrintProgress,
                feedProgress: e.pageFeedProgress,
            });
        });
    }, []);

    /**
     * Connect to printer via Bluetooth (BLE) or Serial (USB)
     * @param {'ble' | 'serial'} transport - Connection type
     */
    const connect = useCallback(async (transport = 'ble') => {
        setError(null);
        setIsConnecting(true);
        setConnectionStatus('Connecting...');
        lastTransportRef.current = transport;

        try {
            // Disconnect existing client if any
            if (clientRef.current) {
                await clientRef.current.disconnect();
            }

            // Create new client based on transport
            const client = transport === 'ble'
                ? new NiimbotBluetoothClient()
                : new NiimbotSerialClient();

            // Set up event handlers
            setupClientEvents(client);

            // Attempt connection (triggers browser pairing modal)
            clientRef.current = client;
            await client.connect();

            // Wait for connection to stabilize before enabling heartbeat
            await new Promise(resolve => setTimeout(resolve, 250));

            try {
                client.startHeartbeat();
            } catch (hbErr) {
                console.warn('Failed to start heartbeat:', hbErr);
            }

        } catch (err) {
            setIsConnecting(false);
            setConnectionStatus('Connection failed');
            setError(err.message || 'Failed to connect to printer');
            console.error('Printer connection error:', err);

            // Handle common errors
            if (err.message?.includes('cancelled')) {
                setError('Pairing cancelled by user');
            } else if (err.message?.includes('Bluetooth')) {
                setError('Bluetooth not available or permission denied');
            }
        }
    }, [setupClientEvents]);

    /**
     * Attempt to reconnect to the last connected printer
     */
    const reconnect = useCallback(async () => {
        if (!clientRef.current) {
            setError('No previous connection. Please connect first.');
            return;
        }

        setError(null);
        setIsConnecting(true);
        setConnectionStatus('Reconnecting...');

        try {
            // Try to reconnect using existing client
            await clientRef.current.connect();
        } catch (err) {
            setIsConnecting(false);
            setConnectionStatus('Reconnect failed');

            // If reconnect fails, suggest new connection
            if (err.message?.includes('GATT') || err.message?.includes('connect')) {
                setError('Reconnect failed. The printer may be connected elsewhere. Try "Bluetooth" to pair again.');
            } else {
                setError(err.message || 'Reconnect failed');
            }
            console.error('Reconnect error:', err);
        }
    }, []);

    /**
     * Disconnect from printer
     */
    const disconnect = useCallback(async () => {
        if (clientRef.current) {
            await clientRef.current.disconnect();
            // Don't null out clientRef so we can reconnect
        }
        setIsConnected(false);
        setConnectionStatus('Disconnected');
        setBatteryLevel(null);
        setError(null);
    }, []);

    /**
     * Fully disconnect and forget the device
     */
    const forgetDevice = useCallback(async () => {
        if (clientRef.current) {
            await clientRef.current.disconnect();
            clientRef.current = null;
        }
        setIsConnected(false);
        setConnectionStatus('Disconnected');
        setBatteryLevel(null);
        setPrinterModel(null);
        setCanReconnect(false);
        setRfidInfo(null);
        setError(null);
    }, []);

    /**
     * Detect paper/label info from RFID tag
     * Returns RFID info including paper count and type
     */
    const detectPaper = useCallback(async () => {
        if (!clientRef.current || !isConnected) {
            setError('Printer not connected');
            return null;
        }

        setIsDetecting(true);
        setError(null);

        try {
            // Read RFID info from the label roll
            const info = await clientRef.current.abstraction.rfidInfo();

            setRfidInfo(info);
            setIsDetecting(false);

            return info;
        } catch (err) {
            setIsDetecting(false);

            // Some printers or label types may not support RFID
            const msg = err.message?.toLowerCase() || '';
            if (msg.includes('notsupported') || msg.includes('timeout') || msg.includes('waiting')) {
                setError('RFID not supported or tag read failed. Using manual label size.');
            } else {
                setError(err.message || 'Failed to detect paper');
            }
            console.error('Paper detection error:', err);
            return null;
        }
    }, [isConnected]);

    /**
     * Print canvas content to connected printer
     * @param {HTMLCanvasElement} canvas - The canvas to print
     * @param {Object} options - Print options
     * @param {string} options.direction - Print direction ('left' or 'top')
     * @param {number} options.quantity - Number of copies
     * @param {string} options.printerType - Printer model override
     */
    const print = useCallback(async (canvas, options = {}) => {
        const {
            direction = 'left',
            quantity = 1,
            printerType = null
        } = options;

        if (!clientRef.current || !isConnected) {
            setError('Printer not connected');
            return false;
        }

        setIsPrinting(true);
        setPrintProgress(null);
        setError(null);

        try {
            // Clean canvas to remove anti-aliasing artifacts (gray pixels become dots)
            // threshold=200 means pixels with luminance > 200 become white, others become black
            const cleanedCanvas = cleanCanvasForPrint(canvas, 200);

            // Encode cleaned canvas for printer (converts to B&W bitmap)
            const encoded = ImageEncoder.encodeCanvas(cleanedCanvas, direction);

            // Get printer model - use provided or auto-detected
            const taskType = printerType || clientRef.current.getPrintTaskType() || 'B1';

            // Create print task
            const printTask = clientRef.current.abstraction.newPrintTask(taskType, {
                totalPages: quantity,
                statusPollIntervalMs: 100,
                statusTimeoutMs: 30000,
            });

            // Execute print
            await printTask.printInit();
            await printTask.printPage(encoded, quantity);
            await printTask.waitForFinished();
            await printTask.printEnd();

            setIsPrinting(false);
            setPrintProgress(null);
            return true;

        } catch (err) {
            setIsPrinting(false);
            setError(err.message || 'Print failed');
            console.error('Print error:', err);
            return false;
        }
    }, [isConnected]);

    return {
        // State
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

        // Actions
        connect,
        reconnect,
        disconnect,
        forgetDevice,
        detectPaper,
        print,
        clearError: () => setError(null),
    };
}
