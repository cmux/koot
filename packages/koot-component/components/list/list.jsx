import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import { Resizable } from 'react-resizable';
import { separatorFormat, ellipsisStyleFormat, minWidthStyleFormat, maxWidthStyleFormat } from './format.js';
import { isObject } from 'util';
import { AutoTooltip } from './components';

const ResizeableTitle = (props) => {
    const { onResize, width, ...restProps } = props;
  
    if (!width) {
        return <th {...restProps} />;
    }

    return (
        <Resizable 
            width={width} 
            height={0} 
            onResize={onResize}
        >
            <th {...restProps} />
        </Resizable>
    );
};

const uuid = (len, radix) => {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        // rfc4122, version 4 form
        var r;

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return uuid.join('');
}

// @KootExtend({
//     styles: require('./list.module.less'),
// })


class List extends Component {

    constructor(props) {
        super(props);
        // const { render } = this.props;
        // const config  = render();
        // const { columns } = config;
        // this.state = {
        //     columns: this.columnsHandler(columns)
        // }
    }
    

    static propTypes = {
        children: PropTypes.node,
        render: PropTypes.func.isRequired
    }

    render() {
        const { render, resizable } = this.props;
        const config  = render();
        // 处理props
        const props = this.propsHandler( Object.assign({}, this.props, config) );
        // 处理数据源
        const { dataSource, columns } = config;
        const nextDataSource = dataSource && dataSource.map((dataItem, index) => {
            return Object.assign({}, dataItem, {
                key: index
            })
        })
        
        let nextColumns = columns;
        // if (resizable) {
        //     nextColumns = nextColumns.map((col, index) => ({
        //         ...col,
        //         onHeaderCell: column => ({
        //             width: column.width,
        //             onResize: this.handleResize(index),
        //         }),
        //     }));
        //     return (
        //         <Table
        //             components={this.components}
        //             columns={nextColumns}
        //             dataSource={nextDataSource}
        //             {...props}
        //         >
        //         </Table>
        //     )
        // } else {
        return (
            <Table
                columns={nextColumns}
                dataSource={nextDataSource}
                {...props}
            >
            </Table>
        )
        // }
        
    }

    components = {
        header: {
            cell: ResizeableTitle,
        },
    };

    handleResize = index => (e, { size }) => {
        this.setState(({ columns }) => {
            const nextColumns = [...columns];
            nextColumns[index] = {
                ...nextColumns[index],
                width: size.width,
            };
            return { columns: nextColumns };
        });
    };

    columnsHandler = ( columns ) => {
        return columns && columns.map(item => {
            const { autoTooltip } = item;
            const style = this.styleFormatter(item);
            const orignRender = item.render;
            item.render = (text, record, index) => {
                let value = this.valueFormatter(text, item);
                // dataIndex 不存在时 text === record
                value = isObject(value) ? '' : value;
                if( orignRender && typeof orignRender === 'function' ){
                    value = orignRender(value, record, index);
                }
                return (
                    <div style={style}>
                        {
                            autoTooltip === true
                                ? <AutoTooltip>{value}</AutoTooltip>
                                : <span>{value}</span>
                        }
                        
                    </div>
                )
            }
            return item;
        })
    }

    styleFormatter = (item) => {
        const defaultStyle = {}
        const style = ellipsisStyleFormat(item.ellipsis);
        const minWidthStyle = minWidthStyleFormat(item.minWidth);
        const maxWidthStyle = maxWidthStyleFormat(item.maxWidth);
        return Object.assign(defaultStyle, style, minWidthStyle, maxWidthStyle);
    }

    valueFormatter = (text, item) => {
        text = this.separatorFormatterHandler(text, item);
        return text;
    }

    separatorFormatterHandler = (value, item) => {
        if( item.separator ){
            // 千位符格式化
            value = separatorFormat(value, item.separator);
        }
        return value;
    }

    propsHandler = ( config ) => {
        const nextConfig = Object.assign({}, config);
        this.autoScrollHandler(nextConfig);
        this.defaultPropsHandler(nextConfig);
        // this.resizeableHandler(nextConfig)

        if( !nextConfig.rowKey ){
            nextConfig.rowKey = () => {
                return (uuid(16, 64) + new Date().getTime()).toString().toUpperCase();
            }
        }

        delete nextConfig.type;
        delete nextConfig.name;
        delete nextConfig.columns;
        delete nextConfig.dataSource;
        delete nextConfig.page;
        delete nextConfig.render;

        return nextConfig;
    }

    autoScrollHandler = ( config ) => {
        const { columns } = config;
        if( columns && columns.length && !config.scroll){
            let count = 0;
            let countWidth = 0;
            columns.forEach(item => {
                if( item && item.width ){
                    count++;
                    countWidth += parseInt(item.width)
                }
            })
            if( count === columns.length && countWidth ){
                config.scroll = {
                    x: countWidth
                }
            }else{
                config.scroll = {
                    x: true,
                }
                // config.style = {
                //     whiteSpace: 'nowrap'
                // }
            }
        }
    }

    /**
     * 
     */
    defaultPropsHandler = ( config ) => {
        const { page, pagination } = config;
        if( page ){
            config.pagination = {
                size: "small",
                showSizeChanger: true,
                showQuickJumper: true,
                pageSize: config.page.pageSize,
                current: config.page.pageIndex,
                total: config.page.total,
                onChange: config.page.onPageIndexChange,
                onShowSizeChange: config.page.onPageSizeChange,
                showTotal: total => `共 ${total} 条`, 
            }
        }
        if( pagination ){
            config.pagination = pagination;
        }
        if( !page && !pagination ){
            config.pagination = false;
        }
        config.size = config.size || 'middle';
        config.bordered = config.bordered || true;
    }
}

// export default List;
export default KootExtend({
    styles: require('./list.module.less'),
})(List);
