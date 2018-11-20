import React from 'react';
import { Row, Col, Button, Table, Modal, Select, Input, Radio } from 'antd';
import $ from 'jquery'
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
    title: '项目名称',
    dataIndex: 'name',
    key: 'name'
}, {
    title: '项目类别',
    dataIndex: 'program',
    key: 'program',
    render: (text, record, index) => {
        return <span>{text.name}</span>
    }

}, {
    title: '项目价格',
    dataIndex: 'price',
    key: 'price'
}, {
    title: '参考工时',
    dataIndex: 'referWorkTime',
    key: 'referWorkTime'
}, {
    title: '工时单价',
    dataIndex: 'pricePerUnit',
    key: 'pricePerUnit'
}, {
    title: '备注',
    dataIndex: 'comment',
    key: 'comment'
}];
class ProgramSearch extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            selectedRows: [],
            selectedRowKeys: [],
            typeList: [],
            value: 1,
            type: this.props.programId?this.props.programId+'':'-1',
            visible: this.props.view,
            partName: '',
            pagination: {},
            data: [],
        }
    }
    componentDidMount() {
        this.getList(null, null, 1, 10)
        this.getTypeList(1, 99)
    }
    componentWillReceiveProps(newProps) {
        if (newProps.view != this.state.visible) {
            this.setState({
                visible: newProps.view
            })
        }
    }
    getTypeList = (page, pageSize) => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'program/list',
            data: {
                page: page,
                number: pageSize
            },
            success: (res) => {
                if (res.code == "0") {
                    this.setState({
                        typeList: res.data
                    })
                }
            }
        })
    }
    getList = (name, typeId, page, pageSize) => {
    
    
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'project/query',
            data: {
                name: name,
                programId:typeId == -1 ? '' : typeId + '',
                page: page,
                number: pageSize
            },
            success: (result) => {
                this.setState({ loading: false })
                if (result.code == "0") {
                    let datalist = []
                    for (let item of result.data) {
                        item.key = item.id
                        datalist.push(item)
                    }
                    this.setState({
                        data: datalist,
                        pagination: { total: result.realSize },
                    })
                } else if (result.code == '2') {
                    this.setState({
                        data: [],
                        pagination: { total: 0 },
                    })
                }
            },
        })
    }
    handleTableChange = (pagination) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        })

        this.getList(this.state.partName, this.state.type, pagination.current, 10)
    }
    setSearchName = (value) => {
        this.setState({
            partName: value,
            type: -1
        })
    }
    setSearchType = (value) => {
        this.setState({
            type: value,
            partName: null
        })
        this.getList(null, value, 1, 10)
    }
    onChange = (e) => {
        this.setState({
            value: e.target.value,
        });
    }


    //删除选择的数据
    deleteSelectRow = (index) => {
        let origKeys = this.state.selectedRowKeys;
        let origRows = this.state.selectedRows;

        origKeys.splice(index, 1);
        origRows.splice(index, 1);
        this.setState({
            selectedRowKeys: origKeys,
            selectedRows: origRows,
        });
    }

    addSelectRow = (keyArray, rowArray) => {
        let newKeyArray = JSON.parse(JSON.stringify(keyArray))
        let newRowArray = JSON.parse(JSON.stringify(rowArray))
        this.setState({
            selectedRowKeys: [...newKeyArray],
            selectedRows: [...newRowArray],
        });
    }


    render() {
        const rowSelection = {
            //针对全选
            onSelectAll: (selected, selectedRows, changeRows) => {
                let origKeys = this.state.selectedRowKeys;
                let origRows = this.state.selectedRows;
                if (selected) {
                    origRows = [...origRows, ...changeRows];
                    for (let item of changeRows) {
                        origKeys.push(item.id);
                    }
                } else {
                    for (let change of changeRows) {
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
                    origKeys = [...origKeys, changableRow.key];
                    origRows = [...origRows, changableRow];
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
            // onChange:(selectedRowKeys,selectedRows)=>{

            // },

            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User',    // Column configuration not to be checked
            }),
        }, partTypeOptions = this.state.typeList.map((item, index) => {
            return <Option key={item.id} value={item.id + ''}>{item.name}</Option>
        }), radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };
        return <Modal
            visible={this.props.view}
            maskClosable={false}
            width={800}
            title="项目查询"
            onCancel={() => this.props.handleCancel()}
            footer={[
                <Button key="back" size="large" onClick={() => this.props.handleCancel()}>取消</Button>,
                <Button key="submit" type="primary" size="large" loading={this.state.loading} onClick={() => this.props.handleOk(this.state.selectedRows)}>
                    确认
            </Button>
            ]}
        >
            <Row gutter={24} style={{ marginBottom: '10px' }}>
                <Col span={10} style={{ verticalAlign: 'middle' }} id="provider-area">
                    项目名称：
                    <Input
                        placeholder="按项目名称进行搜索"
                        style={{ width: '150px', marginBottom: '10px', marginLeft: '20px' }}

                        onChange={e => this.setSearchName(e.target.value)}
                        value={this.state.partName}
                    />
                </Col>
                {this.props.programId == -1 && <Col span={10} style={{ verticalAlign: 'middle' }}>
                    项目类别：
                     <Select
                        allowClear
                        showSearch
                        style={{ width: '120px', marginLeft: '20px' }}
                        placeholder="选择项目类别"
                        optionFilterProp="children"
                        optionLabelProp="children"
                        value = {this.state.type}
                        onChange={(value) => this.setSearchType(value)}
                        getPopupContainer={() => document.getElementById('provider-area')}
                        filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                    >
                        {partTypeOptions}
                        <Option key={-1} value={'-1'}>全部</Option>
                    </Select>
                </Col>}
                <Col span={2}>
                    <Button type="primary" onClick={() => { this.getList(this.state.partName, this.state.type, 1, 10) }}>查询</Button>
                </Col>
            </Row>
            <Table loading={this.state.loading} pagination={this.state.pagination} bordered onChange={(pagination) => this.handleTableChange(pagination)} columns={columns} dataSource={this.state.data} rowSelection={rowSelection} />
        </Modal>
    }
}
export default ProgramSearch