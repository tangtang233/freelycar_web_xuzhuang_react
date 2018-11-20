import { Table, Input, Icon, Button, Popconfirm, InputNumber } from 'antd';
import React from 'react';
import EditableCell from '../tables/EditableCell.jsx'
 const columns = [{
            title: '项目名称',
            dataIndex: 'projectName',
            render: (text, record, index) => (
                <EditableCell
                    value={text}
                    onChange={this.onCellChange(index, 'projectName')}
                />
            ),
        }, {
            title: '可用次数',
            dataIndex: 'restCount',
            render: (text, record, index) => (
                <InputNumber size="large" defaultValue={1} min={1} onChange={this.onChange} />
            ),
        },
        {
            title: '操作',
            dataIndex: 'operation',
            render: (text, record, index) => {
                return (
                    <span>
                        <span style={{ marginRight: '10px', cursor: 'pointer' }} onClick={this.handleAdd}>
                            <a href="javascript:void(0);">新增</a>
                        </span>
                        <Popconfirm title="确认要删除嘛?" onConfirm={() => this.onDelete(index)}>
                            <a href="javascript:void(0);">删除</a>
                        </Popconfirm>
                    </span>

                );
            },
        }];

class ModalTable extends React.Component {
    

    constructor(props) {
        super(props);  
        this.state = {
            dataSource: [{
                key: '1',
                projectName: "洗车",
                restCount: 20,

            }, {
                key: '2',
                projectName: "打蜡",
                restCount: 10,
            }],
            count: 3,
        };
    }
       

    // onCellChange = (index, key) => {
    //     return (value) => {
    //         const dataSource = [...this.state.dataSource];
    //         dataSource[index][key] = value;
    //         this.setState({ dataSource });
    //     };
    // }
    onChange = (value) => {
    }
    onDelete = (index) => {
        const dataSource = [...this.state.dataSource];
        dataSource.splice(index, 1);
        this.setState({ dataSource });
    }
 

    render() {
        const columns = this.columns;

        return (
            <div>
                <Table bordered size="small" pagination={false} dataSource={this.state.dataSource}  columns={columns}  />
            </div>

        );
    }
}

export default ModalTable