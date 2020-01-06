const fs = require('fs-extra');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const generate = require('@babel/generator').default;

const entry = path.resolve(
    __dirname,
    '../test/projects/standard/src/router/index.js'
);

const transformFile = async (file = entry) => {
    const source = await fs.readFile(file, 'utf-8');
    const ast = parser.parse(source, {
        sourceType: 'unambiguous',
        plugins: ['dynamicImport']
    });

    console.log(ast.program);

    traverse(ast, {
        // TODO: 移除 `routeCheck` 引用
        // TODO: 转换属性 `component`
        // TODO: 转换属性 `getComponent`
        // TODO: 转换属性 `indexRoute`
        // TODO: 转换属性 `childRoutes`
        ObjectExpression: (path, state) => {
            if (t.isObjectExpression(path.node.left, { name: 'indexRoute' })) {
                console.log('\n\n\n\n');
                console.log(path, state);
                // console.log(path.key);
            }
        }
    });

    const result = generate(ast, {}, source);
    // console.log(result);
    await fs.writeFile(
        path.resolve(__dirname, '../logs/routes.js'),
        result.code,
        'utf-8'
    );
};

(async () => {
    await transformFile();
})();

// (async () => {
//     const source = await fs.readFile(file, 'utf-8');
//     const ast = parser.parse(source, {
//         sourceType: 'unambiguous',
//         plugins: ['@babel/plugin-syntax-dynamic-import', 'dynamicImport']
//     });

//     let r = '';
//     /** @type {Number} 上次截取的代码的结尾位置，作为下次处理的起始位置 */
//     let rLastPosition = 0;
//     /** @type {String} `routeCheck` 的函数名 */
//     let nameRouteCheck;

//     const append = (start, end) => {
//         r += source.substr(rLastPosition, start - rLastPosition);
//         rLastPosition = end;
//     };

//     const transformRoutesNode = node => {
//         const value = node.declaration || node.value;
//         const { start, end, properties } = value;

//         let src = source.substr(start, end - start);

//         if (Array.isArray(properties))
//             properties.forEach(property => {
//                 console.log('\n\n\n\n');

//                 const key = property.key ? property.key.name : '';

//                 switch (key) {
//                     // TODO: 转换属性 `component`
//                     case 'component': {
//                         break;
//                     }
//                     // TODO: 转换属性 `getComponent`
//                     case 'getComponent': {
//                         break;
//                     }
//                     // TODO: 转换属性 `indexRoute`
//                     case 'indexRoute': {
//                         transformRoutesNode(property);
//                         break;
//                     }
//                     // TODO: 转换属性 `childRoutes`
//                     case 'childRoutes': {
//                         break;
//                     }
//                     default: {
//                     }
//                 }
//             });

//         return src;
//     };

//     const {
//         program: { body: nodes }
//     } = ast;

//     /** @type {Node} `export default` */
//     const nodeExportDefault = nodes
//         .filter(node => node.type === 'ExportDefaultDeclaration')
//         .reduce((_, node) => node, '');

//     // ========================================================================
//     // 移除 `routeCheck` 引用
//     // ========================================================================
//     const nodeImportRouteCheck = nodes
//         .filter(
//             node =>
//                 node.type === 'ImportDeclaration' &&
//                 /route-check($|\.js)/.test(node.source.value)
//         )
//         .reduce((_, node) => node, '');
//     if (
//         typeof nodeImportRouteCheck === 'object' &&
//         nodeImportRouteCheck.specifiers
//     ) {
//         const { specifiers } = nodeImportRouteCheck;
//         nameRouteCheck = specifiers[0].local.name;
//         append(nodeImportRouteCheck.start, nodeImportRouteCheck.end);
//     }

//     // ========================================================================
//     // 如果 ExportDefaultDeclaration 为直接输出对象
//     // ========================================================================
//     if (
//         nodeExportDefault.declaration &&
//         nodeExportDefault.declaration.type === 'ObjectExpression'
//     ) {
//         const { start, end } = nodeExportDefault.declaration;
//         append(start, end);
//         r += transformRoutesNode(nodeExportDefault);
//     }

//     // ========================================================================
//     await fs.writeFile(path.resolve(__dirname, 'logs/routes.js'), r, 'utf-8');
// })();
