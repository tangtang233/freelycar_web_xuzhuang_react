import React from 'react';
import { Row, Col, Button, Table, Modal, Select, Input, Radio } from 'antd';
import $ from 'jquery'
import update from 'immutability-helper'
const Search = Input.Search,
    Option = Select.Option,
    RadioGroup = Radio.Group;
const columns = [{
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    render: (text, record, index) => {
        return <span>{index + 1}</span>
    }
}, {
    title: '券名',
    dataIndex: 'name',
    key: 'name'
}, {
    title: '券种',
    dataIndex: 'type',
    key: 'type',
    render: (text, record, index) => {
        return <div>
            {text == 1 ? '抵用券' : '代金券'}
        </div>
    }
}, {
    title: '有效期（月）',
    dataIndex: 'validTime',
    key: 'validTime'
}, {
    title: '优惠项目',
    dataIndex: 'set',
    key: 'set',
    render: (text, record, index) => {
        let names = ''
        for (let item of record.set) {
            names = names + (names !== '' ? '、' : '') + item.project.name
        }
        return <div>
            {names}
        </div>
    }
}, {
    title: '项目原价',
    dataIndex: 'initalPrice',
    key: 'initalPrice',
    render: (text, record, index) => {
        let totalprice = 0
        for (let item of record.set) {
            totalprice = item.project.price + totalprice
        }
        return <div>{totalprice}</div>
    }
}, {
    title: '项目现价',
    dataIndex: 'presentPrice',
    key: 'presentPrice',
    render: (text, record, index) => {
        let totalprice = 0
        for (let item of record.set) {
            totalprice = item.presentPrice + totalprice
        }
        return <div>{totalprice}</div>
    }
}, {
    title: '购券价格',
    dataIndex: 'buyPrice',
    key: 'buyPrice',
    render: (text, record, index) => {
        let totalprice = 0
        for (let item of record.set) {
            totalprice = item.buyPrice + totalprice
        }
        return <div>{totalprice}</div>
    }
}];
class PreferenceItem extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            selectedRows: [],
            selectedRowKeys: [],
            typeList: [],
            type: '',
            visible: this.props.view,
            cardName: '',
            pagination: {},
            data: [],
        }
    }
    componentDidMount() {
        this.getList(1, 10)
    }

    componentWillReceiveProps(newProps) {
        if (newProps.view != this.state.visible) {
            this.setState({
                visible: newProps.view
            })
        }
    }

    getList = (page, pageSize) => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'favour/query',
            data: {
                page: page,
                number: pageSize,
                name: this.state.cardName,
                type: this.props.type ? this.props.type : '',
            },
            success: (result) => {
                this.setState({
                    loading: false
                })
                if (result.code == "0") {
                    for (let item of result.data) {
                        item.key = item.id
                    }
                    this.setState({
                        data: result.data,
                        pagination: { total: result.realSize }
                    })
                } else {
                    this.setState({
                        data: [],
                        pagination: { total: 0 },
                    })
                }
            }
        })
    }

    handleTableChange = (pagination) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        })

        this.getList(pagination.current, 10)
    }

    setSearchName = (value) => {
        this.setState({
            cardName: value
        })
    }

    setSearchType = (value) => {
        this.setState({
            type: value
        })
    }

    onChange = (e) => {
        this.setState({
            value: e.target.value,
        });
    }

    render() {
        const rowSelection = {
            //针对全选
            onSelectAll: (selected, selectedRows, changeRows) => {
                let origKeys = this.state.selectedRowKeys;
                let origRows = this.state.selectedRows;
                if(selected){
                    origRows = [...origRows,...changeRows];
                    for(let item of changeRows){
                        origKeys.push(item.id);
                    }
                }else{
                    for(let change of changeRows){
                        origKeys = origKeys.filter((obj) => {
                            return obj !== change.key;
                        });
                        origRows = origRows.filter((obj) => {
                            return obj.key !== change.key;
                        });
                    }
                }
                this.setState({
                    selectedRowKeys: origKeys,
                    selectedRows: origRows,
                });

            },
            selectedRowKeys: this.state.selectedRowKeys,
            onSelect: (changableRow, selected, selectedRows) => {
                   //state里面记住这两个变量就好
                   let origKeys = this.state.selectedRowKeys;
                   let origRows = this.state.selectedRows;
                   if (selected) {
                       Array.prototype.push.apply(origKeys, [changableRow.key]);
                       Array.prototype.push.apply(origRows, [changableRow]);
                   } else {
                       origKeys = origKeys.filter((obj) => {
                           return obj !== changableRow.key;
                       });
                       origRows = origRows.filter((obj) => {
                           return obj.key !== changableRow.key;
                       });
   
                   }
                   this.setState({
                       selectedRowKeys: origKeys,
                       selectedRows: origRows
                   });
            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User',    // Column configuration not to be checked
            }),

        }, partTypeOptions = this.state.typeList.map((item, index) => {
            return <Option key={index} value={item.id + ''}>{item.typeName}</Option>
        }), radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };
        return <Modal
            visible={this.state.visible}
            maskClosable={false}
            width='80%'
            title="优惠查询"
            onOk={() => this.props.handleOk(this.state.selectedRows)}
            onCancel={() => this.props.handleCancel()}
            footer={[
                <Button key="back" size="large" onClick={() => this.props.handleCancel()}>取消</Button>,
                <Button key="submit" type="primary" size="large" loading={this.state.loading} onClick={() => this.props.handleOk(this.state.selectedRows)}>
                    确认
            </Button>
            ]}
        >

            <Row gutter={24} style={{ marginBottom: '10px' }} id="parts-area">
                <Col span={10} style={{ verticalAlign: 'middle' }}>
                    券名：
                    <Input
                        style={{ width: '120px', marginBottom: '10px', marginLeft: '20px' }}
                        onChange={e => this.setSearchName(e.target.value)}
                        value={this.state.cardName}
                    />
                </Col>
                <Col span={2}>
                    <Button type="primary" onClick={() => { this.getList(1, 10) }}>查询</Button>
                </Col>
            </Row>
            <Table loading={this.state.loading} pagination={this.state.pagination} bordered onChange={(pagination) => this.handleTableChange(pagination)} columns={columns} dataSource={this.state.data}  rowSelection={rowSelection} />
        </Modal>
    }
}
export default PreferenceItem