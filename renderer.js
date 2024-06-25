const fs = require('fs');
const path = require('path');
const regedit = require('regedit');

document.getElementById('scanBtn').addEventListener('click', scanJunkFiles);
document.getElementById('cleanBtn').addEventListener('click', cleanJunkFiles);
document.getElementById('manageStartupBtn').addEventListener('click', toggleStartupPrograms);

async function scanJunkFiles() {
    const tempPath = process.env.TEMP || process.env.TMP;
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    const progressBar = document.getElementById('progressBar');
    const cleanBtn = document.getElementById('cleanBtn');
    const startupContainer = document.getElementById('startupContainer');
    const alertContainer = document.getElementById('alertContainer');
    cleanBtn.disabled = true;

    // Hide startup programs table and alert if they are visible
    if (startupContainer.style.display === 'block') {
        startupContainer.style.display = 'none';
    }
    alertContainer.innerHTML = '';

    const junkFiles = [];

    const scanDir = async (dir) => {
        const files = await fs.promises.readdir(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = await fs.promises.stat(filePath);
            if (stats.isFile()) {
                junkFiles.push(filePath);
                const listItem = document.createElement('li');
                listItem.textContent = filePath;
                listItem.className = 'list-group-item';
                fileList.appendChild(listItem);
            }
        }
    };

    try {
        await scanDir(tempPath);
        const totalFiles = junkFiles.length;
        progressBar.style.width = '0%';
        progressBar.style.display = 'block';
        for (let index = 0; index < totalFiles; index++) {
            setTimeout(() => {
                progressBar.style.width = `${((index + 1) / totalFiles) * 100}%`;
                if (index === totalFiles - 1) {
                    cleanBtn.disabled = false;
                }
            }, 10);
        }
    } catch (err) {
        console.error('Error scanning directory:', err);
    }
}

async function cleanJunkFiles() {
    const fileList = document.getElementById('fileList');
    const files = Array.from(fileList.getElementsByTagName('li'));
    const progressBar = document.getElementById('progressBar');
    const cleanBtn = document.getElementById('cleanBtn');
    const alertContainer = document.getElementById('alertContainer');
    cleanBtn.disabled = true;

    let totalFiles = files.length;
    if (totalFiles === 0) return;

    const deleteFile = async (filePath) => {
        try {
            await fs.promises.unlink(filePath);
        } catch (err) {
            console.error(`Failed to delete ${filePath}:`, err.message);
        }
    };

    for (let index = 0; index < totalFiles; index++) {
        const filePath = files[index].textContent;
        await deleteFile(filePath);
        files[index].remove();
        progressBar.style.width = `${((index + 1) / totalFiles) * 100}%`;
    }

    progressBar.style.width = '100%';
    setTimeout(() => {
        progressBar.style.width = '0%';
    }, 1000);

    cleanBtn.disabled = true;

    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        <strong>Success!</strong> All junk files have been cleaned.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alertDiv);

    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 2000);
}

function toggleStartupPrograms() {
    const startupContainer = document.getElementById('startupContainer');
    const fileList = document.getElementById('fileList');
    const progressBar = document.getElementById('progressBar');
    const alertContainer = document.getElementById('alertContainer');

    // Hide fileList and progressBar if they are visible
    if (fileList.innerHTML !== '') {
        fileList.innerHTML = '';
    }
    if (progressBar.style.display === 'block') {
        progressBar.style.display = 'none';
    }
    alertContainer.innerHTML = '';

    if (startupContainer.style.display === 'none' || startupContainer.style.display === '') {
        manageStartupPrograms();
        startupContainer.style.display = 'block';
    } else {
        startupContainer.style.display = 'none';
    }
}

function manageStartupPrograms() {
    const startupTableBody = document.querySelector('#startupTable tbody');
    startupTableBody.innerHTML = '';

    const startupKey = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';

    regedit.list(startupKey, (err, result) => {
        if (err) {
            console.error('Error accessing registry:', err);
            return;
        }

        const startupPrograms = result[startupKey].values;

        for (const [name, value] of Object.entries(startupPrograms)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${name}</td>
                <td>
                    <button class="btn btn-danger btn-sm" data-name="${name}" data-value="${value.value}">Disable</button>
                </td>
            `;
            row.querySelector('button').addEventListener('click', () => {
                toggleStartupProgram(name, value.value);
            });
            startupTableBody.appendChild(row);
        }
    });
}

function toggleStartupProgram(name, value) {
    const startupKey = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
    const programButton = document.querySelector(`button[data-name="${name}"]`);

    if (programButton.textContent === 'Disable') {
        regedit.deleteValue({ [startupKey]: name }, (err) => {
            if (err) {
                console.error(`Failed to disable startup program ${name}:`, err);
                return;
            }
            programButton.textContent = 'Enable';
            programButton.classList.remove('btn-danger');
            programButton.classList.add('btn-success');
        });
    } else {
        const valuesToAdd = { [startupKey]: {} };
        valuesToAdd[startupKey][name] = {
            value: value,
            type: 'REG_SZ'
        };
        regedit.putValue(valuesToAdd, (err) => {
            if (err) {
                console.error(`Failed to re-enable startup program ${name}:`, err);
                return;
            }
            programButton.textContent = 'Disable';
            programButton.classList.remove('btn-success');
            programButton.classList.add('btn-danger');
        });
    }
}
