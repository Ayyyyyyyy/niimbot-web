# Niimbot Web

A powerful web-based label designer and printer interface for Niimbot thermal printers. Design custom labels directly in your browser and print via Bluetooth.

## ✨ Features

### 🎨 Label Designer
- **Drag-and-drop canvas** - Intuitive Fabric.js-powered design interface
- **Text elements** - Add and style text with custom fonts, sizes, and alignment
- **Barcodes** - Generate Code128 barcodes with automatic encoding
- **QR Codes** - Create QR codes for URLs, text, or any data
- **Shapes** - Add rectangles, circles, and lines
- **Images** - Import custom images and scale them to fit
- **Object manipulation** - Rotate, flip, duplicate, and layer objects

### 🤖 AI Label Assistant
- **Natural language label creation** - Describe what you want and AI generates the label
- **Supports Ollama (local)** - Use local LLMs like Llama, Mistral, or Qwen
- **Supports Google Gemini** - Use cloud-based Gemini models
- **Auto-calculates dosing** - Perfect for peptide vial labels with reconstitution math
- **Debug logging** - View full AI request/response logs for troubleshooting

### 🔍 Canvas Controls
- **Zoom in/out** - 25% to 400% zoom range
- **Keyboard shortcuts**:
  - `Ctrl + A` - Select all objects (move entire label)
  - `Ctrl + +` / `Ctrl + =` - Zoom in
  - `Ctrl + -` - Zoom out
  - `Ctrl + 0` - Reset zoom to 100%
  - `Ctrl + Scroll` - Mouse wheel zoom
  - `Delete` / `Backspace` - Delete selected object
  - `Escape` - Deselect all

### 🖨️ Printing
- **Bluetooth connectivity** - Connect directly to Niimbot printers via Web Bluetooth
- **Real-time preview** - See exactly what your label will look like before printing
- **Multiple label sizes** - Configure custom label dimensions in millimeters
- **Auto-save** - Optionally save labels before printing

### 📋 Templates
- **Pre-built templates** - Quick-start with common label layouts
- **Peptide vial labels** - Specialized templates for compound labeling

## Prerequisites

- [Node.js](https://nodejs.org/) **v22.20.0** (use `nvm use` to automatically switch via `.nvmrc`)
  > ⚠️ **Note**: Node.js v22.21.0 has a [known regression](https://github.com/nodejs/node/issues/issues) that crashes the Vite HTTPS dev server. Use v22.20.0 until a fix is released.
- A device with Bluetooth capabilities
- A supported browser (Chrome, Edge, or other Chromium-based browsers) for Web Bluetooth support

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd niimbot-web
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## HTTPS Configuration (Required for Bluetooth)

The Web Bluetooth API **only works over HTTPS**. To run the app locally with full functionality, you need to generate a locally trusted self-signed certificate.

We recommend using [mkcert](https://github.com/FiloSottile/mkcert) for this.

1.  **Install mkcert**:
    -   **macOS**: `brew install mkcert`
    -   **Linux**: `sudo apt install libnss3-tools` (then install mkcert binary)
    -   **Windows**: Use Chocolatey or Scoop

2.  **Initialize the local CA**:
    ```bash
    mkcert -install
    ```
    (You might need sudo/admin privileges for this step)

3.  **Generate certificates**:
    ```bash
    mkdir -p .certs
    mkcert -key-file .certs/key.pem -cert-file .certs/cert.pem localhost 127.0.0.1 ::1
    ```

    *Note: To access from another device on your network, include your local IP address (e.g., `mkcert ... localhost 192.168.1.5`).*

The `vite.config.js` is already configured to look for `.certs/key.pem` and `.certs/cert.pem`.

## Running the Application

Start the development server:

```bash
npm run dev
```

The app should now be accessible at `https://localhost:5173`. Your browser will trust the certificate if you ran `mkcert -install` correctly.

## 🤖 AI Configuration

The AI Label Assistant supports two providers:

### Ollama (Local)
1. Install [Ollama](https://ollama.ai/)
2. Pull a model: `ollama pull qwen3:4b` (or any other model)
3. Start Ollama: `ollama serve`
4. In the app, click the **⚙️ Settings** icon
5. Select "Ollama" as the provider and choose your model

### Google Gemini
1. Get an API key from [Google AI Studio](https://aistudio.google.com/)
2. In the app, click the **⚙️ Settings** icon
3. Select "Gemini" as the provider and enter your API key

### Example AI Prompts
- "10mg vial of Retatrutide from ABC, created 12/19/24, reconstituted with 2ml BAC water"
- "Shipping label for fragile electronics, handle with care"
- "Name badge for John Smith, Engineering Department"

## Technologies

-   **React 19** - UI Library
-   **Vite 7** - Build tool & dev server
-   **Fabric.js 6** - Canvas manipulation for label design
-   **@mmote/niimbluelib** - Niimbot printer communication protocol
-   **TailwindCSS 4** - Styling
-   **bwip-js** - Barcode/QR code generation
-   **Lucide React** - Icons

## Troubleshooting

-   **"Bluetooth Adapter not available"**: Ensure your device has Bluetooth and you are using a Chromium-based browser (Chrome, Edge). Web Bluetooth is not supported in Firefox or Safari.
-   **Certificate Errors**: If Chrome says "Not Secure", make sure you ran `mkcert -install` and restarted your browser.
-   **AI not responding**: Check that Ollama is running (`ollama serve`) or verify your Gemini API key is correct.
-   **Labels not printing**: Ensure your Niimbot printer is powered on and in range. Try disconnecting and reconnecting via Bluetooth.

## License

MIT
