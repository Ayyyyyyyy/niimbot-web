# Niimbot Web

A web-based interface for designing and printing labels on Niimbot thermal printers directly from your browser.

## Features

- **Label Designer**: Create custom labels with text, barcodes, and images using a drag-and-drop interface.
- **Bluetooth Connectivity**: Connect directly to your Niimbot printer via Web Bluetooth.
- **Real-time Preview**: See exactly what your label will look like before printing.

## Prerequisites

- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- A device with Bluetooth capabilities.
- A supported browser (Chrome, Edge, or other Chromium-based browsers) for Web Bluetooth support.

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

The Web Bluetooth API **only works over HTTPS** (or `localhost`, but this app is configured to verify certificates). To run the app locally with full functionality, you need to generate a locally trusted self-signed certificate.

We recommend using [mkcert](https://github.com/FiloSottile/mkcert) for this.

1.  **Install mkcert**:
    -   **macOS**: `brew install mkcert`
    -   **Linux**: `sudo apt install libnss3-tools` (then install mkcert binary)
    -   **Windows**: Use Chocolatey or Scoop.

2.  **Initialize the local CA**:
    ```bash
    mkcert -install
    ```
    (You might need sudo/admin privileges for this step).

3.  **Generate certificates**:
    Create a `.certs` directory and generate the key and certificate files inside it.

    ```bash
    mkdir -p .certs
    mkcert -key-file .certs/key.pem -cert-file .certs/cert.pem localhost 127.0.0.1 ::1
    ```

    *Note: If you want to access the app from another device on your network (e.g., a phone), include your local IP address in the `mkcert` command as well (e.g., `mkcert ... localhost 192.168.1.5`).*

The `vite.config.js` is already configured to look for `.certs/key.pem` and `.certs/cert.pem`.

## Running the Application

Start the development server:

```bash
npm run dev
```

The app should now be accessible at `https://localhost:5173` (or your local IP). Your browser will trust the certificate if you ran `mkcert -install` correctly.

## Technologies

-   **React**: UI Library
-   **Vite**: Build tool & dev server
-   **Fabric.js**: Canvas manipulation for label design
-   **@mmote/niimbluelib**: Niimbot printer communication protocol
-   **TailwindCSS**: Styling

## Troubleshooting

-   **"Bluetooth Adapter not available"**: Ensure your device has Bluetooth and you are using a Chromium-based browser (Chrome, Edge). Web Bluetooth is not supported in Firefox or Safari by default.
-   **Certificate Errors**: If Chrome says "Not Secure", make sure you ran `mkcert -install` and restarted your browser.
