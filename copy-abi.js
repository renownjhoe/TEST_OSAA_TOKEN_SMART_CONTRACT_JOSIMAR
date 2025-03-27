const fs = require('fs-extra');
const path = require('path');

async function copyABI() {
    const sourcePath = path.join(__dirname, './artifacts/contracts/OSAAToken.sol/OSAAToken.json');
    const destinationPath = path.join(__dirname, './src/OSAAToken.json');

    try {
    await fs.copy(sourcePath, destinationPath);
    console.log('ABI copied successfully!');
    } catch (err) {
    console.error('Error copying ABI:', err);
    }
}

copyABI();