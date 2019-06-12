/**
 * dataset : 数据集
 *
 *
 *
 **/

/**
 * 为了匹配各种数据的输入形式，常常需要有数据处理过程
 *
 *
 */

// 对象数组形式
const source_1 = [
    {
        product: 'Matcha Latte',
        '2015': 43.3,
        '2016': 85.8,
        '2017': 93.7
    },
    {
        product: 'Milk Tea',
        '2015': 83.1,
        '2016': 73.4,
        '2017': 55.1
    },
    {
        product: 'Cheese Cocoa',
        '2015': 86.4,
        '2016': 65.2,
        '2017': 82.5
    },
    {
        product: 'Walnut Brownie',
        '2015': 72.4,
        '2016': 53.9,
        '2017': 39.1
    }
];

const source_2 = [
    {
        product_name: 'Matcha Latte',
        date: '2018-09-09',
        active: 100,
        user_number: 10000
    }
];

// const responseData = {
//     code: 200,
//     data: [

//     ],
//     msg: 'success'
// }

const dataset = [source_1, source_2];

const options = {
    // 数据集
    dataset: [[{}, {}, {}], [{}, {}, {}]],
    // 映射
    // encode: {
    //     x: 'date',
    //     y: 'active',
    //     tootip: [
    //         'date',
    //         'active',
    //     ]
    // },
    dimensions: {
        active: {
            displayName: '显示的名称',
            type: 'number'
        }
    },
    series: [
        {
            type: 'xxx',
            encode: {
                x: [3, 1, 5], // 表示维度 3、1、5 映射到 x 轴。
                y: 2, // 表示维度 2 映射到 y 轴。
                tooltip: [3, 2, 4] // 表示维度 3、2、4 会在 tooltip 中显示。
            }
        }
    ]
};
