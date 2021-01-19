const NullDependency = require('webpack/lib/dependencies/NullDependency');
const InitFragment = require('webpack/lib/InitFragment');
const makeSerializable = require('webpack/lib/util/makeSerializable');
const { UsageState } = require('webpack/lib/ExportsInfo');

// ============================================================================

/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("webpack/lib/Dependency")} Dependency */
/** @typedef {import("webpack/lib/DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("webpack/lib/Module")} Module */
class I18nFunctionDependency extends NullDependency {
    get type() {
        return 'koot i18n translate function inject';
    }
}
makeSerializable(
    I18nFunctionDependency,
    'koot-webpack/libs/dependencies/I18nFunctionDependency'
);

I18nFunctionDependency.Template = class I18nFunctionDependencyTemplate extends (
    NullDependency.Template
) {
    constructor(functionName) {
        super();

        this.functionName = functionName;
    }

    /**
     * @param {Dependency} dependency the dependency for which the template should be applied
     * @param {ReplaceSource} source the current replace source which can be modified
     * @param {DependencyTemplateContext} templateContext the context object
     * @returns {void}
     */
    apply(
        dependency,
        source,
        {
            module,
            runtimeTemplate,
            moduleGraph,
            initFragments,
            runtimeRequirements,
            runtime,
            concatenationScope,
        }
    ) {
        // if (concatenationScope) return;
        const content = `import ${this.functionName} from 'koot/i18n/translate';`;
        console.log(111, content);
        initFragments.push(
            new InitFragment(
                content,
                InitFragment.STAGE_HARMONY_IMPORTS,
                0,
                'koot i18n translate function inject'
            )
        );
    }
};

// ============================================================================

module.exports = I18nFunctionDependency;
