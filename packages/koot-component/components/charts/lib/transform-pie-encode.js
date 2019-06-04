import _ from 'lodash';
import tooltipFormatter from './formatter.js';

const defaultOptions = {
    tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)",
        // 是否将 tooltip 框限制在图表的区域内。
        confine: true,
    },
    grid: {
        top: '6%',
        bottom: '6%',
    },
}

// 转换 pie 映射
const transformPieEncode = ( encodeSeriesItem, source, nameMapper, encodeSeriesType ) => {
    const { name = 'name', dataItem = {}, seriesIndex = 0, label: encodeSeriesLabel } = encodeSeriesItem;
    const { name: dataItemName, value: dataItemValue } = dataItem;
    const { tooltip } = encodeSeriesItem.__parent;
    const sourceItem = source[seriesIndex] || {};
    const { dataset = [] } = sourceItem;
    if( !Array.isArray(dataset) ){
        return {}
    }
    const seriesList = []
    const seriesItem = {
        type: 'pie',
        name: sourceItem[name],
        data: [],
    };
    // series.label 支持
    // 对应 echarts: series.label
    if( encodeSeriesLabel ){
        seriesItem.label = encodeSeriesLabel;
    }
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
    dataset.forEach(datasetItem => {
        const name = datasetItem[dataItemName];
        const value = datasetItem[dataItemValue];
        seriesItem.data.push({
            name,
            value
        });
    })
    seriesList.push(seriesItem);
   
    const resultOptions = _.merge({}, defaultOptions, {
        series: seriesList,
        tooltip: nextTooltip
    })
    return resultOptions;
}

export default transformPieEncode;
