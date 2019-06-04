const encode = {
    series: {
        // 默认 type: 'line'
        type: 'line',
        // 默认取第一组数据的 date 字段
        // x: 'date'
        x: {
            datasetIndex: 1,
            valueLabel: 'date'
        },
        // 默认取第一组数据的 num 字段
        // y: 'num'
        y: {
            dataseIndex: 1,
            valueLabel: 'num'
        }
    }
}


const dimension = [

]

const target = [

]

const responseData = {
    data: {
        source: [
            {
                name: 'xxx',
                dataset: [
                    {
                        name: 
                    }
                ]
            }
        ]
    }
}

const render = () => {
    return {
        type: 'chart',
        // line, bar, boxplot, candlestick,
        button: [
            {
                label: 'buttonName',
                value: 'buttonValue',
                active: false,
                disabled: false,
                fixed: 0,
                targets: ['active', 'user_number', 'some-target'],
                tooltips: []
            }
        ],
        // 名字映射：可用于多语言
        nameMap: {
            active: '访问量'
        },
        // 数据集
        // 优点结构清晰，可以服务端计算统计数据
        // 缺点数据结构层次深
        source: [
            // 每组数据源
            {
                name: 'pt-1',
                count: 999,
                // 没个数据源的数据集
                dataset: [
                    {
                        active: 10,
                    }
                ]
            },
            {
                name: 'pt-2',
                count: 888,
                dataset: [
                    {
                        active: 10,
                    }
                ]
            }
        ],
        // // 二维数组形式
        // source: [
        //     [
        //         {
        //             name: 'pt-1',
        //             date: '2018-09-10',
        //             active: 10,
        //         },
        //         {
        //             name: 'pt-1',
        //             date: '2018-09-11',
        //             active: 12,
        //         }
        //     ]
        //     [
        //         {
        //             name: 'pt-2',
        //             date: '2018-08-10',
        //             active: 9,
        //         },
        //         {
        //             name: 'pt-2',
        //             date: '2018-08-11',
        //             active: 5,
        //         }
        //     ]
        // ],
        // 配置映射 （支持映射数据集中的数据）
        encode: {
            series: {
                // 默认 type: 'line'
                type: 'line',
                // 默认取第一组数据的 date 字段
                // x: 'date'
                x: {
                    datasetIndex: 1,
                    valueLabel: 'date'
                },
                // 默认取第一组数据的 num 字段
                // y: 'num'
                y: {
                    dataseIndex: 1,
                    valueLabel: 'num'
                }
            }
        },
        tooltip: {
            formatter: () => {
                
            }
        }
    }
}
