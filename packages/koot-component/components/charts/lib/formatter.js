const separatorFormat = (num, symbol) => {
    symbol = symbol || ',';
    return num && num.toString().replace(/\d+/, function (s) {
        return s.replace(/(\d)(?=(\d{3})+$)/g, '$1' + symbol)
    })
}

/**
 * 
 * @param {*} configList 
 * @param {*} paramsItem 
 * @param {*} source 
 */
const getContentListByConfig = (
    configList = [],
    paramsItem = {},
    source = []
) => {
    const contentList = [];
    // paramItem
    const { seriesIndex = 0, dataIndex = 0 } = paramsItem;
    // seriresItem
    const seriesData = source[seriesIndex] || {};
    const { dataset = [] } = seriesData;
    // dataItem
    const dataItem = dataset[dataIndex] || {};
    configList.forEach(configItem => {
        let result;
        if( typeof configItem === 'string' ){
            result = [
                dataItem[configItem], 
                seriesData[configItem], 
                paramsItem[configItem]
            ].filter(item => item !== undefined && item !== null)[0];
        }
        if( typeof configItem === 'object' ){
            const { key, separator, formatter, value } = configItem;
            result = [
                value, 
                dataItem[key], 
                seriesData[key], 
                paramsItem[key]
            ].filter(item => item !== undefined && item !== null)[0]
            if( result || result === 0 ){
                if( separator ){
                    result  = separatorFormat(result, separator);
                }
                if( formatter && typeof formatter === 'function' ){
                    result = formatter(result)
                }
            }
        }
        contentList.push(result);
    })
    return contentList;
}

/**
 * 
 * @param {*} params 
 * @param {*} source 
 * @param {*} tooltips 
 */
const tooltipTitleHandler = ({
    params = [],
    source = [],
    tooltips = {}
}) => {
    const { title } = tooltips;
    const paramItem = params[0] || {};
    const { seriesType } = paramItem;
    const titleContentList = getContentListByConfig(title, paramItem, source);
    if( seriesType === 'pie' ){
        const { seriesName = '' } = paramItem;
        if( titleContentList.length === 0 ){
            titleContentList.push(seriesName);
        }
    }else{
        const { axisValueLabel = '' } = paramItem;
        if( titleContentList.length === 0 ){
            titleContentList.push(axisValueLabel);
        }
    }
    return `
        <h1>${titleContentList.join(' ')}</h1>
    `
}

/**
 * 
 * @param {*} params 
 * @param {*} source 
 * @param {*} tooltips 
 * @param {*} nameMapper 
 */
const tooltipHeaderHandler = ({
    tooltips = {},
    nameMapper = {}
}) => {
    const { body } = tooltips;
    const headerContent = body && body.map(key => {
        if( key && typeof key === 'string' ){
            return nameMapper[key]
        }
        if( key && typeof key === 'object' ){
            return nameMapper[key['key']]
        }
        return '';
    })
    return `
        <thead>
            <tr>
                <th><!--占位颜色 Mark --></th>
                <th><!--占位SeriesName --></th>
                <th>
                    ${(headerContent && headerContent.join('</th><th>')) || ''}
                </th>
            </tr>
        </thead>
    `;
}

/**
 * 
 * @param {*} bodyContentResultList 
 */
const tooltipBodyRowHandler = ( bodyContentResultList ) => {
    return bodyContentResultList.map(trItem => {
        return `
            <tr>
                <td>
                    ${trItem.join('</td><td>')}
                </td>
            </tr>
        `
    })
}

/**
 * 
 * @param {*} params 
 * @param {*} source 
 * @param {*} tooltips 
 * @param {*} nameMapper 
 */
const tooltipBodyHandler = ({
    params = [], 
    source = [], 
    tooltips = {}, 
}) => {
    const { body = [] } = tooltips;
    const bodyContentResult = params.map(paramsItem => {
        // 兼容 pie 图表无配置映射时，自动显示 类别|value|百分比
        if( paramsItem.seriesType === 'pie' && body.length === 0 ){
            body.push({
                key: 'value',
            },{
                key: 'percent',
                formatter: ( value ) => {
                    return `${value} %`
                }
            })
        }
        const bodyContentList = getContentListByConfig(body, paramsItem, source);
        const { seriesName = '', value, seriesType, name } = paramsItem;
        // 
        if( bodyContentList.length === 0 ){
            bodyContentList.push(value);
        }
        // 
        if( seriesType === 'pie' && name ){
            bodyContentList.splice(0, 0, name);
        }else{
            if( seriesName.indexOf('series') === -1 ){
                bodyContentList.splice(0, 0, seriesName);
            }
        }
        
        // 添加 颜色 mark
        const markHtml = paramsItem['marker'];
        if( markHtml ){
            bodyContentList.splice(0, 0, markHtml);
        }
        return bodyContentList;
    })
    return `
        <tbody>
            ${tooltipBodyRowHandler(bodyContentResult).join('')}
        </tbody>
    `
}

/**
 * 
 * @param {*} params 
 * @param {*} source 
 * @param {*} tooltips 
 * @param {*} nameMapper 
 */
const tooltipDomHandler = (
    params, 
    source, 
    tooltips, 
    nameMapper
) => {
    const title = tooltipTitleHandler({
        params,
        source,
        tooltips,
        nameMapper
    });
    const header = tooltipHeaderHandler({
        params,
        source,
        tooltips,
        nameMapper
    });
    const body = tooltipBodyHandler({
        params,
        source,
        tooltips,
        nameMapper
    });

    return `
        <div class='koot-chart-tooltip-wrapper'>
            ${title}
            <table>
                ${header}
                ${body}
            </table>
        </div>
    `
}

/**
 * 
 * @param {*} params 
 * @param {*} ticket 
 * @param {*} callback 
 * @param {*} source 
 * @param {*} tooltips 
 * @param {*} nameMapper 
 */
export const tooltipFormatter = (
    params, 
    ticket, 
    callback, 
    source, 
    tooltips, 
    nameMapper
) => {
    let nextParams;
    if( Array.isArray(params) ){
        nextParams = params;
    }else{
        nextParams = [params];
    }
    const html = tooltipDomHandler(nextParams, source, tooltips, nameMapper);
    return html;
}

export default tooltipFormatter;
