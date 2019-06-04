# koot-component 是 koot.js 的组件库
主要是为了加快开发效率，将一些在项目中常用到的封装起来，供大家使用

## 安装 / Install

```sh
npm install -g koot-component
```

### charts & react-echarts
这个是在 [ECharts](https://github.com/apache/incubator-echarts) 基础上进行二次开发的，因为koot是使用react的开发规范来进行书写的，为了统一开发习惯和降低学习成本，封装了一层以支持用react书写规范和开发规范来写ECharts.

目前支持三种格式：line, bar, pie.

额外添加了新功能：支持字体自适应；
场景：随着浏览器窗口的变化，ECharts图表也会发生相应的变化，但是字体却不变，在某些情况会，图表不够美观。通过该功能，可以使字体与图表的大小相匹配。

### 使用 / Usage
```sh
import React, { Component } from 'react';
import { Chart } from '@components/chart';
import moment from 'moment';

class TypeCard extends Component {
    render() {
        const { chartRender } = this;
        return (
            <Chart render={chartRender}></Chart>
        )
    }

    chartRender = () => {
        const { data } = this.props;  // 渲染的数据来源
        return {
            type: 'chart',
            nameMapper: {
                'num': '次数',
            },
            source: data,
            encode: {
                xAxis: {
                    // x轴格式 ，同理 yAxis 对应的就是y轴格式
                    axisLabel: {
                     // 对x轴数据进行处理
                        formatter: (value) => {
                            return moment(value, 'YYYY-MM-DD').format('MM/DD')
                        },
                        color: function (value) {
                            const weekDay = moment(value, 'YYYY-MM-DD').weekday();
                            const color = (weekDay === 5 || weekDay === 6)  ? '#FF3400' : '#000000';
                            return color;
                        }
                    },
                },
                tooltip: {
                    //小浮窗
                    title: ['name', 'week'],
                    body: [
                        {
                            key: 'num',
                            separator: ',', //对数字进行千位符格式化
                        },
                    ]
                },
                series: {
                    type: 'line', // 图表类型，目前支持line,bar,pie
                    x: 'name',
                    y: 'num',
                    stack: true,
                }
            }
        }
    }
}
```

数据格式如下：
```sh
"data": {
  "source": [{
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
      "name": "2019-05-30",
      "num": "1496",
      "ctc": "-0.33%",
      "stc": "-20.64%"
    }, {
      "name": "2019-05-31",
      "num": "2285",
      "ctc": "52.74%",
      "stc": "5.06%"
    }, {
      "name": "2019-06-01",
      "num": "2661",
      "ctc": "16.46%",
      "stc": "14.70%"
    }, {
      "name": "2019-06-02",
      "num": "1821",
      "ctc": "-31.57%",
      "stc": "-6.71%"
    }, {
      "name": "2019-06-03",
      "num": "1185",
      "ctc": "-34.93%",
      "stc": "8.42%"
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
      "name": "2019-05-30",
      "num": "2705",
      "ctc": "6.45%",
      "stc": "-18.57%"
    }, {
      "name": "2019-05-31",
      "num": "4218",
      "ctc": "55.93%",
      "stc": "1.37%"
    }, {
      "name": "2019-06-01",
      "num": "4772",
      "ctc": "13.13%",
      "stc": "13.43%"
    }, {
      "name": "2019-06-02",
      "num": "3217",
      "ctc": "-32.59%",
      "stc": "-10.06%"
    }, {
      "name": "2019-06-03",
      "num": "2041",
      "ctc": "-36.56%",
      "stc": "7.88%"
    }],
    "name": "语音",
    "total": 22247
  }]
}
  ```
