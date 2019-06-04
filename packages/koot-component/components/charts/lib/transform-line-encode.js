import _ from 'lodash';
import tooltipFormatter from './formatter.js';
import numberValueFormatter from './number-value-formatter.js';

const defaultOptions = {
    tooltip : {
        trigger: 'axis',
        axisPointer: {
            type: 'line',
            snap: true,
        },
        // 是否将 tooltip 框限制在图表的区域内。
        confine: true,
        default: 'rgba(50,50,50,0.5)',
        // alwaysShowContent: true
    },
    xAxis: {
        // 坐标轴两边是否留白
        boundaryGap : false,
        axisLabel: {
            rotate: 40
        },
    },
    yAxis: {
        axisLabel: {
            formatter: numberValueFormatter
        }
    },
    grid: {
        left: '4%',
        right: '4%',
        bottom: '15%',
        top: '1%'
    },
}

const transformLineEncode = ( encodeSeriesItem, source, nameMapper, encodeSeriesType ) => {
    const { name = 'name', x, y , stack, seriesIndex = 0, label: encodeSeriesLabel } = encodeSeriesItem;
    const { tooltip, xAxis: encodeXAxis = {}, legend } = encodeSeriesItem.__parent;
    const xAxis = {
        data: [],
    };
    // xAxis.axisLabel.formatter 支持
    if( encodeXAxis.axisLabel ){
        xAxis.axisLabel = _.merge({}, encodeXAxis.axisLabel);
    }
    const yAxis = {};
    const seriesList = []
    const nextTooltip = {
        formatter: (...args) => {
            if( encodeSeriesType === 'all' ){
                return tooltipFormatter(...args, source, tooltip, nameMapper)
            }else{
                const sourceItem = source[seriesIndex];
                return tooltipFormatter(...args, [sourceItem], tooltip, nameMapper)
            }
        }
    }
    
    const handleSourceItem = (sourceItem, sourceIndex) => {
        const { dataset = [] } = sourceItem;
        if( !Array.isArray(dataset) ){
            return {}
        }
        const seriesItem = {
            name: sourceItem[name],
            data: [],
            type: 'line'
        };
        if( encodeSeriesLabel ){
            seriesItem.label = encodeSeriesLabel;
        }
        // 是否堆叠
        if( stack === true ){
            seriesItem.stack = true;
            seriesItem.areaStyle = {normal: {}};
        }
        dataset.forEach((dataItem) => {
            const xValue = dataItem[x] || '';
            const yValue = dataItem[y] || '';
            if( sourceIndex === 0 ){
                xAxis.data.push(xValue);
            }
            seriesItem.data.push(yValue);
        })
        seriesList.push(seriesItem);
    }

    // 通用映射显示所有数据集
    if( encodeSeriesType === 'all' ){
        source.forEach((sourceItem, sourceIndex) => {
            handleSourceItem(sourceItem, sourceIndex);
        })
    }else{
        const sourceItem = source[seriesIndex] || {};
        const sourceIndex = 0;
        handleSourceItem(sourceItem, sourceIndex);
    }
    
    const resultOptions = _.merge({}, defaultOptions, {
        xAxis,
        yAxis,
        tooltip: nextTooltip,
        series: seriesList,
        legend: legend
    })
    if( !resultOptions.legend ){
        if( seriesList.length > 1 ){
            resultOptions.legend = {
                type: 'scroll'
            }
            resultOptions.grid.top = '10%';
        }else{
            resultOptions.grid.top = '6%';
        }
    }
    return resultOptions;
}

export default transformLineEncode;
