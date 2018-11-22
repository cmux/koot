import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd'; 

class List extends Component {

    static propTypes = {
        children: PropTypes.node,
        config: PropTypes.object.isRequired,
    }

    render() {
        const { config } = this.props;
        const { columns, dataSource } = config;
        const props = this.propsHandler(config);
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
        this.defaultPropsHandler(nextConfig);

        delete nextConfig.type;
        delete nextConfig.name;
        delete nextConfig.columns;
        delete nextConfig.dataSource;
        delete nextConfig.page;

        return nextConfig;
    }

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
