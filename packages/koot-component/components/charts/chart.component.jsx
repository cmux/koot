import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactEchart from '../react-echarts';
import * as TransformEncode from './lib';

const firstUpperCase = str => {
    return str.toLowerCase().replace(/( |^)[a-z]/g, L => L.toUpperCase());
};

const isObject = data => {
    return Object.prototype.toString.call(data) === '[object Object]';
};

@KootExtend({
    styles: require('./chart.component.less')
})
class Chart extends Component {
    static propTypes = {
        render: PropTypes.func
    };

    render() {
        const props = this.propsHandler();
        return <ReactEchart {...props} />;
    }

    propsHandler = () => {
        const { props } = this;
        const nextProps = Object.assign({}, props);
        const { render, options } = nextProps;
        const nextOptions = options || this.getOptionsByRender(render);
        // 赋值
        nextProps.options = nextOptions;
        // 移除多余 props
        delete nextProps.render;

        return nextProps;
    };

    getOptionsByRender = render => {
        if (!render || typeof render !== 'function') {
            return null;
        }
        const options = render();

        return this.transformEchartOptions(options);
    };

    transformEchartOptions = oriOptions => {
        const { nameMapper = {}, source = [], encode = {} } = oriOptions;
        const { series } = encode;
        let resultOptions = {},
            adaptive = {};
        if (encode['adaptive']) {
            adaptive['adaptive'] = encode['adaptive'];
        }
        // series 如果为数组则一一对应
        if (Array.isArray(series)) {
            const newSource = this.collectDatasetBySeries(series, source);
            series.forEach((serieItem, serieIndex) => {
                serieItem.serieIndex = serieIndex;
                serieItem.__parent = encode;
                const itemOptions = this.serieItemTypeHandler(
                    serieItem,
                    newSource,
                    nameMapper
                );
                resultOptions = Object.assign(
                    {},
                    resultOptions,
                    itemOptions,
                    adaptive
                );
            });
            // series 如果为对象，则对应到所有单位上
        } else if (isObject(series)) {
            series.__parent = encode;
            const itemOptions = this.serieItemTypeHandler(
                series,
                source,
                nameMapper,
                'all'
            );
            resultOptions = Object.assign(
                {},
                resultOptions,
                itemOptions,
                adaptive
            );
        }
        return resultOptions;
    };

    serieItemTypeHandler = (
        serieItem,
        source,
        nameMapper,
        encodeSeriesType
    ) => {
        const { type } = serieItem;
        const typeName = firstUpperCase(type);
        const funcName = `transform${typeName}Encode`;
        const func = TransformEncode[funcName];
        return (
            func &&
            typeof func === 'function' &&
            func(serieItem, source, nameMapper, encodeSeriesType)
        );
    };

    // 根据 series 收集 source 内数据集
    // source 数组 item 将与 seriesIndex 对应
    // formatter 函数内 多 series 也将收到如此对应关系
    collectDatasetBySeries = (series, source) => {
        const datasetIndexList = series.map(item => item.datasetIndex);
        const newSource = [];
        datasetIndexList.forEach(datasetIndex => {
            newSource.push(source[datasetIndex]);
        });
        return newSource;
    };
}

export default Chart;
