import React, { Component } from 'react';
import { Upload, Icon, Modal } from 'antd';

class UploadComponent extends Component {

    // static propTypes = {
    //     children: PropTypes.node,
    //     config: PropTypes.object.isRequired,
    //     onChange: PropTypes.func
    // }

    state = {
        previewVisible: false,
        previewImage: '',
        fileList: [
            {
                uid: '-1',
                name: 'xxx.png',
                status: 'done',
                url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
            }
        ],
    };

    render() {
        const { fileList, previewVisible, previewImage } = this.state;
        const { handlePreview, handleChange } = this;
        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">Upload</div>
            </div>
        );
        const action = this.props.action || `https://r.cmcm.com/upload?project=test1s`;
        return (
            <div className={this.props.className}>
                <Upload
                    action={action}
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}
                >
                    {fileList.length >= 3 ? null : uploadButton}
                </Upload>
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </div>
        )
    }

    handlePreview = ( file ) => {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    }

    handleChange = ({ fileList }) => this.setState({ fileList })

    handleCancel = () => this.setState({ previewVisible: false })
}

export default UploadComponent;
