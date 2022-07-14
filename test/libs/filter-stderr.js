module.exports = (stderr) =>
    stderr
        .replace(
            /\(node:([0-9]+?)\) Warning: No such label 'URL' for console.timeEnd\(\)/g,
            ''
        )
        .replace(
            /\*\* \(sharp:([0-9]+?)\): WARNING \*\*: ([0-9:.]+?): jpegsave_buffer: no property named `subsample_mode'/g,
            ''
        )
        .replace(/\(node:([0-9]+?)\)(.+?)DeprecationWarning:(.+?)(\r|\n)/g, '')
        .replace(
            /Update this package\.json to use a subpath pattern like(.+?)(\r|\n)/g,
            ''
        )
        .replace(/\(Use `node --trace-deprecation(.+?)(\r|\n)/g, '');
