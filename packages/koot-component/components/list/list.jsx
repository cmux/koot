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

        return (
            <Table columns={columns} dataSource={dataSource} size="middle"></Table>
        );
    }
}

export default List;
