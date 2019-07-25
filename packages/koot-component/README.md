# `koot-component`
> koot-component 是koot的组件库，配套koot使用，目前包含常用的样式组件，可快速搭建一套供后台使用的前端样式和展示数据图表的组件（基于[ECharts](https://github.com/apache/incubator-echarts)进行二次开发）

### 为什么要针对ECharts进行二次开发？
>因为koot是基于react规范进行开发的，ECharts不支持react开发规范，进行二次开发后，可以按照react开发规范直接进行开发，降低学习成本和开发成本，提高工作效率。

### 目前Chart主要支持三种常用的图表类型：bar,line,pie。属性可查看[官网](https://www.echartsjs.com/option.html#title)
>新功能：支持字体自适应；
场景：随着浏览器窗口的变化，ECharts图表也会发生相应的变化，但是字体却不变，通过该功能，可使字体与图表的大小相匹配，使图表更美观。
## 安装 
```shell
npm install -g koot-component
```
## 使用 

* line,bar 类型例子：
```js
import React, { Component } from 'react';
import { Chart } from 'koot-component';

class TypeCard extends Component {
    render() {
        return (
            <Chart render={this.barAndLineRender}
                onClick={e => {
                // 支持ECharts触发事件
                console.log(e)
            }} ></Chart>
        )
    }

    barAndLineRender = () => {
        const tcValueFormatter = value => {
            const color =
                parseInt(value) > 0
                    ? '#FF4343'
                    : parseInt(value) < 0
                    ? '#3AF7AC'
                    : '#FFFFFF';
            return `<span style="color: ${color}">${value}</span>`;
        };

        const { compare_type } = cardFilter;
        return {
            type: 'chart', 
            nameMapper: {
                num: '次数',   // num 对应取得key值，'次数' 是对应展示的字段，可自定义
                stc: '同比',
                ctc: '环比'
            },
            source: data, // 需渲染的数据
            encode: {
                xAxis: {
                // x轴 数据处理，同理 yAxis对应y轴
                    axisLabel: {
                        formatter: value => {
                        // 格式转化
                            ...
                            }
                            return value;
                        },
                        color: function(value) {
                        // 颜色处理
                            if (compare_type === 'day') {
                                ...
                                return color;
                            }
                            return '#000000';
                        }
                    }
                },
                tooltip: {
                    title:
                    //  提示框标题
                        compare_type === 'hour'
                            ? ['name', 'hour', 'week']
                            : ['name', 'week'],
                    body: [
                    // 提示框主题
                        {
                            key: 'num',
                        // 展示字段里对应的数据
                            separator: ','
                        // 对数值型数据用千位符隔开
                        },
                        {
                            key: 'stc',
                            formatter: tcValueFormatter
                        // 格式化，使数据的变化更直观
                        },
                        {
                            key: 'ctc',
                            formatter: tcValueFormatter
                        }
                    ]
                },
                /**
                 series 数据的渲染方式有两种
                1，数组，[{datasetIndex: 0,}]，datasetIndex取对应下标数据，从0开始，这个方式适用于多条数据，需要按照不同的条件来渲染；
                2，对象，{},有多少数据都会展示出来
                **/
                series: [
                    {
                        datasetIndex: 0,  //取对应下标数据，如果没有，会默认展示全部数据
                        type: 'line',  // 图表类型，line, bar
                        x: compare_type === 'hour' ? 'hour' : 'name', 
                        // x轴展示内容 
                        y: 'num', // y轴展示内容 
                        label: {
                            normal: {
                                show: this.state.isShow,  // 是否展示图表数值
                                position: 'top' // 数值位置
                            }
                        }
                    }
                ]
            }
        };
}

// 数据格式如下：
"data": {
  "source": [{ // 会解析"source"和"dataset"里面的内容 
    "dataset": [{
      "name": "2019-05-28",
      "num": "1579",
      "ctc": "44.46%",
      "stc": "22.59%"
    }, {
      "name": "2019-05-29",
      "num": "1501",
      "ctc": "-4.94%",
      "stc": "-0.13%"
    }, {
      ...
    }],
    "name": "点击",
    "total": 12528
  }, {
    "dataset": [{
      "name": "2019-05-28",
      "num": "2753",
      "ctc": "45.51%",
      "stc": "12.46%"
    }, {
      "name": "2019-05-29",
      "num": "2541",
      "ctc": "-7.70%",
      "stc": "-3.53%"
    }, {
      ...
    }],
    "name": "语音",
    "total": 22247
  }]
}
```
* pie 类型例子：
> pie与bar,line主要区别：
> 1，没有xAxis和yAxis；
> 2，series只能展示一条数据。
```js
pieRender = () => {
    const { data } = this.props;
    return {
        type: 'chart',
        nameMap: {},
        source: data,
        encode: {
            series: [
                {
                    type: 'pie',  
                    datasetIndex: 0,
                    dataItem: {
                        name: 'name',
                        value: 'num'
                    },
                    label: {
                        formatter: params => {
                            const { name, value } = params;
                            let v = separatorFormat(value);
                            return `${name} ${v} 台`;
                        }
                    }
                }
            ],
            tooltip: {
                title: [
                    {
                        value: '运行状态'
                    }
                ],
                body: [
                    {
                        key: 'num',
                        separator: ',',
                        formatter: value => {
                            return `${value} 台`;
                        }
                    },
                    {
                        key: 'percent',
                        formatter: value => {
                            return `${value} %`;
                        }
                    }
                ]
            }
        }
    };
};

//数据格式：
"data": {
    "source": [{
        "dataset": [{
            "behavior": "讲解",
            "num": 1777
        }, {
            "behavior": "对话",
            "num": 12458
        }, {
           ...
        }],
        "total": 382724
    }]
}

```
