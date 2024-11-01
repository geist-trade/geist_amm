const path = require('path');
const programDir = path.join(__dirname, '.', 'programs/geist_amm');
const idlDir = path.join(__dirname, 'idl');
const sdkDir = path.join(__dirname, 'sdk/src/generated');
const binaryInstallDir = path.join(__dirname, '.crates');

module.exports = {
    idlGenerator: 'anchor',
    programName: 'geist_amm',
    programId: 'HTHyAbn3YXReoNWRczVasQkocnbXB4TASkjMpHrEGS9Q',
    idlDir,
    sdkDir,
    binaryInstallDir,
    programDir,
};