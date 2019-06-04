import _ from 'lodash';
import tooltipFormatter from './formatter.js';
import numberValueFormatter from './number-value-formatter.js';

const defaultOptions = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'line',
            snap: true
        },
        // 是否将 tooltip 框限制在图表的区域内。
        confine: true
        // alwaysShowContent: true
    },
    yAxis: {
        axisLabel: {}
    },
    xAxis: {
        show: true,
        axisLabel: {
            rotate: 40
        }
    },
    grid: {
        left: '4%',
        right: '4%',
        bottom: '10%'
    }
};

// 转换 bar 映射
const transformBarEncode = (
    encodeSeriesItem,
    source,
    nameMapper,
    encodeSeriesType
) => {
    const {
        name = 'name',
        x,
        y,
        stack,
        seriesIndex = 0,
        flip,
        label: encodeSeriesLabel
    } = encodeSeriesItem;
    const {
        tooltip,
        xAxis: encodeXAxis = {},
        yAxis: encodeYAxis = {},
        legend
    } = encodeSeriesItem.__parent;
    const xAxis = {
        axisLabel: {}
    };
    const yAxis = {
        axisLabel: {}
    };
    const grid = {};
    // xAxis.axisLabel.formatter 支持
    if (encodeXAxis.axisLabel) {
        xAxis.axisLabel = _.merge({}, encodeXAxis.axisLabel);
    }
    if (encodeXAxis.show != undefined) {
        xAxis.show = encodeXAxis.show;
    }
    if (encodeYAxis.show != undefined) {
        yAxis.show = encodeYAxis.show;
    }
    // yAxis.axisLabel.formatter 支持
    if (encodeYAxis.axisLabel) {
        yAxis.axisLabel = _.merge({}, encodeYAxis.axisLabel);
    }
    // xAxis.type 支持
    if (encodeXAxis.type) {
        xAxis.type = encodeXAxis.type;
    }
    // yAxis.type 支持
    if (encodeYAxis.type) {
        yAxis.type = encodeYAxis.type;
    }
    const seriesList = [];
    const nextTooltip = {
        formatter: (...args) => {
            if (encodeSeriesType === 'all') {
                return tooltipFormatter(...args, source, tooltip, nameMapper);
            } else {
                const sourceItem = source[seriesIndex];
                return tooltipFormatter(
                    ...args,
                    [sourceItem],
                    tooltip,
                    nameMapper
                );
            }
        }
    };

    const handleSourceItem = (sourceItem, sourceIndex) => {
        const { dataset = [] } = sourceItem;
        if (!Array.isArray(dataset)) {
            return {};
        }
        const seriesItem = {
            name: sourceItem[name],
            data: [],
            type: 'bar'
        };
        if (encodeSeriesLabel) {
            seriesItem.label = encodeSeriesLabel;
        }
        // 是否堆叠
        if (stack === true) {
            seriesItem.stack = true;
            seriesItem.areaStyle = { normal: {} };
        }
        dataset.forEach(dataItem => {
            const xValue = dataItem[x] || '';
            const yValue = dataItem[y] || '';
            if (sourceIndex === 0) {
                if (flip === true) {
                    if (!yAxis.data) {
                        yAxis.data = [];
                    }
                    if (!yAxis.type) {
                        yAxis.type = 'category';
                    }
                    yAxis.data.push(xValue);
                    grid.containLabel = true;
                    grid.left = '2%';
                    grid.bottom = '4%';
                    xAxis.axisLabel.formatter = numberValueFormatter;
                } else {
                    if (!xAxis.data) {
                        xAxis.data = [];
                    }
                    xAxis.data.push(xValue);
                    yAxis.axisLabel.formatter = numberValueFormatter;
                }
            }
            seriesItem.data.push(yValue);
        });
        seriesList.push(seriesItem);
    };

    // 通用映射显示所有数据集
    if (encodeSeriesType === 'all') {
        source.forEach((sourceItem, sourceIndex) => {
            handleSourceItem(sourceItem, sourceIndex);
        });
    } else {
        const sourceItem = source[seriesIndex] || {};
        const sourceIndex = 0;
        handleSourceItem(sourceItem, sourceIndex);
    }

    const resultOptions = _.merge({}, defaultOptions, {
        xAxis,
        yAxis,
        grid,
        tooltip: nextTooltip,
        series: seriesList,
        legend: legend
    });

    if (!resultOptions.legend) {
        if (seriesList.length > 1) {
            resultOptions.legend = {
                type: 'scroll'
            };
            resultOptions.grid.top = '10%';
        } else {
            resultOptions.grid.top = '6%';
        }
    }

    return resultOptions;
};

export default transformBarEncode;
