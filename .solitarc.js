const path = require('path');
const programDir = path.join(__dirname, '.', 'programs/geist_amm');
const idlDir = path.join(__dirname, 'idl');
const sdkDir = path.join(__dirname, 'sdk');
const binaryInstallDir = path.join(__dirname, '.crates');

module.exports = {
    idlGenerator: 'anchor',
    programName: 'geist_amm',
    programId: 'AVzr6agjgPNhh4i4bTRLt9rLv48Nj4v5qKxMvgYty21n',
    idlDir,
    sdkDir,
    binaryInstallDir,
    programDir,
};