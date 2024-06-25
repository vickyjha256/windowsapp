# Electron Startup Program Manager

This Electron application allows users to manage Windows startup programs. It requires administrative privileges to perform registry operations.

## Features

- **Scan for Startup Programs**: List all programs configured to run at startup.
- **Enable/Disable Startup Programs**: Allow users to enable or disable programs from running at startup.
- **Error Handling**: Provides user notifications for permission errors and unexpected issues.

## Prerequisites

- Node.js
- npm (Node Package Manager)
- Electron

## Setup

1. **Clone the repository**:

    ```bash
    git clone https://github.com/your-repo/electron-startup-manager.git
    cd electron-startup-manager
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Create Manifest File**:
   
   Create a file named `app.manifest` in the root directory with the following content to request administrative privileges:

    ```xml
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
      <trustInfo xmlns="urn:schemas-microsoft-com:asm.v3">
        <security>
          <requestedPrivileges>
            <requestedExecutionLevel level="requireAdministrator" uiAccess="false" />
          </requestedPrivileges>
        </security>
      </trustInfo>
    </assembly>
    ```

4. **Update `package.json`**:

    Ensure your `package.json` includes the following configuration under the `build` section:

    ```json
    {
      "build": {
        "win": {
          "requestedExecutionLevel": "requireAdministrator"
        }
      }
    }
    ```

5. **Run the application**:

    ```bash
    npm start
    ```

## Usage

1. **Scanning for Startup Programs**:
   - Click the "Scan" button to list all programs configured to run at startup.

2. **Managing Startup Programs**:
   - Click the "Manage Startup" button to display the list of startup programs.
   - Click "Disable" to prevent a program from running at startup.
   - Click "Enable" to allow a program to run at startup.

3. **Error Handling**:
   - If the application encounters a permission error, a notification will be displayed, indicating that administrative privileges are required.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
