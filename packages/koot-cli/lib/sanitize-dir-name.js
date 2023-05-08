import sanitize from 'sanitize-filename';

const sanitizeDirName = (name) =>
    sanitize(name, { replacement: '-' }).replace(/[ ]+/g, '-');

export default sanitizeDirName;
