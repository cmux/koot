import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd'; 

class List extends Component {

    static propTypes = {
        children: PropTypes.node,
        config: PropTypes.oneOfType([
            PropTypes.func.isRequired,
            PropTypes.object.isRequired
        ]),
    }

    render() {
        const { config } = this.props;
        let nextConfig;
        if( typeof config === 'function' ){
            nextConfig = config();
        }else{
            nextConfig = config;
        }
        const props = this.propsHandler(nextConfig);
        const { columns, dataSource } = nextConfig;
        const nextDataSource = dataSource && dataSource.map((dataItem, index) => {
            return Object.assign({}, dataItem, {
                key: index
            })
        })
        return (
            <Table
                columns={columns}
                dataSource={nextDataSource}
                {...props}
            >
            </Table>
        );
    }

    propsHandler = ( config ) => {
        const nextConfig = Object.assign({}, config);
        this.autoScrollHandler(nextConfig);
        this.defaultPropsHandler(nextConfig);

        delete nextConfig.type;
        delete nextConfig.name;
        delete nextConfig.columns;
        delete nextConfig.dataSource;
        delete nextConfig.page;

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
        const pagination = {
            size: "small",
            showSizeChanger: true,
            showQuickJumper: true,
            pageSize: config.page.pageSize,
            current: config.page.pageIndex,
            total: config.page.total,
            onChange: config.page.onPageIndexChange,
            onShowSizeChange: config.page.onPageSizeChange,
            showTotal: total => `Total ${total} items`, 
        }
        config.size = config.size || 'middle';
        config.bordered = config.bordered || true;
        config.pagination = config.pagination || pagination;
    }
}

export default List;
