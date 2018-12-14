import React from 'react';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx'
import $ from 'jquery'
import update from 'immutability-helper'
import { Link } from 'react-router';
import { Row, Col, Card, Button, Radio, DatePicker, Table, Input, Select, Icon, Modal, Popconfirm, message } from 'antd';
const Option = Select.Option;
const { RangePicker } = DatePicker,
    RadioGroup = Radio.Group;
// 日期 format
const dateFormat = 'YYYY/MM/DD';


class CabinetManage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            filteredInfo: null,
            sortedInfo: null,
            visible: false,
            data: [],
            selectedIds: [],
            cabinetSn: '',
            modifyIndex: null,
            cabinetSpecification: ['16', '24', '32'],
            modalstate: 'add',
            error1: '',
            error2: '',
            error3: '',
            error4: '',
            form: {
                id: '',
                sn: '',
                location: '',
                specification: ''
            }
        }
    }
    componentDidMount() {
        this.queryCabinet(1, 10)
    }
    queryCabinet = (page, number) => {
        $.ajax({
            url: 'api/' + localStorage.getItem('store') + '/' + 'cabinet/list',
            type: 'get',
            data: {
                sn: this.state.cabinetSn,
                page: page,
                number: number
            },
            success: (result) => {
                if (result.code == "0") {
                    let datalist = result.data
                    for (let item of datalist) {
                        item.key = item.id
                    }

                    this.setState({
                        data: datalist,
                        loading: false,
                        pagination: { total: result.realSize }
                    })
                } else {
                    this.setState({
                        data: [],
                        loading: false
                    })
                    message.error(result.msg)
                }
            }
        })
    }

    setFormData = (key, value) => {
        this.setState({
            form: update(this.state.form, {
                [key]: {
                    $set: value
                }
            })
        })
    }

    handleChange = (pagination, filters, sorter) => {
        this.setState({
            filteredInfo: filters,
            sortedInfo: sorter,
        });
    }

    onDelete = (idArray) => {
        $.ajax({
            type: 'get',
            url: 'api/' + localStorage.getItem('store') + '/' + 'cabinet/delete',
            contentType:'application/json;charset=utf-8',
            dataType: 'json',
            data: {
                id: idArray
            },
            traditional: true,
            success: (result) => {
                if (result.code == "0") {
                    let dataSource = [...this.state.data];
                    for (let id of idArray) {
                        dataSource = dataSource.filter((obj) => {
                            return id !== obj.id;
                        });
                    }
                    this.setState({
                        data: dataSource,
                        pagination: update(this.state.pagination, { ['total']: { $set: result.realSize },['current']:{ $set: result.realSize%10!=0 ? result.realSize/10+1 : result.realSize/10 } })
                    });
                    
                    // this.handleTableChange(this.state.pagination)
                    message.success(result.msg)

                } else {
                    message.error(result.msg)
                }
            }
        })
    }


    // tab1模态框的处理函数

    showModal = () => {
        this.setState({
            visible: true,
            modalstate: 'add'
        });
    }
    handleOk = (e) => {
        let obj = {}
        if (this.state.modalstate == 'modify') {
            obj = {
                id: this.state.form.id,
                sn: this.state.form.sn,
                location: this.state.form.location,
                specification: this.state.form.specification
            }
        } else {
            obj = {
                sn: this.state.form.sn,
                location: this.state.form.location,
                specification: this.state.form.specification
            }
        }
        if (this.state.form.sn == '') {
            this.setState({
                error1: '请填写智能柜序号'
            })
        }
        if (this.state.form.location == '') {
            this.setState({
                error2: '请填写智能柜位置'
            })
        }
        if (this.state.form.specification == '') {
            this.setState({
                error3: '请选择智能柜规格'
            })
        }
        if (this.state.form.sn !== '' && this.state.form.location !== '' && this.state.form.specification !== '') {
            $.ajax({
                url: `api/${localStorage.getItem('store')}/cabinet/` + this.state.modalstate,
                type: this.state.modalstate == 'modify' ? 'put' : 'post',
                dataType: 'json',
                contentType: "application/json",
                data: JSON.stringify(obj),
                success: (result) => {
                    if (result.code == "0") {
                        if ((this.state.modalstate == 'modify') && (this.state.modifyIndex >= 0)) {
                            this.setState({
                                data: update(this.state.data, { [this.state.modifyIndex]: { $merge: this.state.form } }),
                                visible: false,
                                form: {
                                    id: '',
                                    sn: '',
                                    location: '',
                                    specification: ''
                                }
                            })
                            message.success('修改成功', 5);
                        } else {
                            result.data.key = result.data.id
                            this.setState({
                                data: update(this.state.data, { $push: [result.data] }),
                                visible: false,
                                form: {
                                    id: '',
                                    sn: '',
                                    location: '',
                                    specification: ''
                                }
                            })
                            message.success('增加成功', 5)
                        }
                    } else {
                        message.error(result.msg, 5);
                        this.setState({
                            visible: false,
                            form: {
                                id: '',
                                sn: '',
                                location: '',
                                specification: ''
                            }
                        })
                    }
                }
            })
        }
    }

    handleTableChange = (pagination) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        console.log(pager)
        console.log(pagination)
        this.setState({
            pagination: pager
        })
        // pager.total/10==pager.current?
        this.queryCabinet(pagination.current, 10)
    }

    handleCancel = (e) => {
        this.setState({
            visible: false,
            form: {
                id: '',
                sn: '',
                location: '',
                specification: ''
            },
            error1: '',
            error2: '',
            error3: ''
        });
    }

    modifyInfo = (record, index) => {
        this.setState({
            visible: true,
            modalstate: 'modify',
            modifyIndex: index,
            form: {
                id: record.id,
                sn: record.sn,
                location: record.location,
                specification: record.specification
            }
        })
    }

    PreFixInterge = (num, n) => {
        //num代表传入的数字，n代表要保留的字符的长度  
        return (Array(n).join(0) + num).slice(-n);
    }
    render() {
        const cabinetSpecification = this.state.cabinetSpecification.map((item, index) => {
            return <Option key={index} value={item}>{item}</Option>
        }),
            columns = [{
                title: '序号',
                dataIndex: 'index',
                key: 'index',
                render: (text, record, index) => {
                    return <span>{index + 1}</span>
                }
            }, {
                title: '智能柜序号',
                dataIndex: 'sn',
                key: 'sn',
                render: (text, record, index) => {
                    return <span><Link to={"/app/systemSet/cabinetManage/" + text}>{text}</Link></span>
                }
            }, {
                title: '投放位置',
                dataIndex: 'location',
                key: 'location'
            }, {
                title: '规格（格）',
                dataIndex: 'specification',
                key: 'specification'
            }, {
                title: '创建时间',
                dataIndex: 'createTime',
                key: 'createTime'
            }, {
                title: '操作',
                dataIndex: 'operation',
                key: 'operation',
                render: (text, record, index) => {
                    return <span>
                        <span onClick={() => { this.modifyInfo(record, index) }}>
                            <a href="javascript:void(0);">
                                修改
                             </a>
                        </span>
                        {/*<Popconfirm title="确认要删除嘛?" onConfirm={() => this.onDelete([record.id])}>*/}
                            {/*<a href="javascript:void(0);">删除</a>*/}
                        {/*</Popconfirm>*/}
                    </span>
                }
            }];

        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                let selectedIds = []
                for (let item of selectedRows) {
                    selectedIds.push(item.id);
                }
                this.setState({
                    selectedIds: selectedIds
                })
            }
        }
        return (
            <div>
                <BreadcrumbCustom first="系统管理" second="智能柜管理" />
                <Card>
                    <div>
                        <Row>
                            <Col span={5}>
                                <div style={{ marginBottom: 16 }}>
                                    智能柜序号：
                                    <Input style={{ width: '140px' }} value={this.state.cabinetSn} onChange={(e) => { this.setState({ cabinetSn: e.target.value }) }} />
                                </div>
                            </Col>
                            <Col span={2}>
                                <Button type="primary" onClick={() => { this.queryCabinet(1, 10) }}>查询</Button>
                            </Col>
                            <Modal
                                title={this.state.modalstate == 'modify' ? '修改智能柜' : '新增智能柜'}
                                visible={this.state.visible}
                                onOk={this.handleOk}
                                maskClosable={false}
                                onCancel={this.handleCancel}
                            >
                                <Row type='flex' align='middle' gutter={16} style={{ marginBottom: '10px' }}>
                                    <Col span={8} style={{ textAlign: 'right' }}>
                                        智能柜序号：
                                    </Col>
                                    <Col span={8}>
                                        <Input disabled={this.state.modalstate == 'modify' ? true : false} value={this.state.form.sn} onChange={(e) => this.setFormData('sn', e.target.value)} />
                                        <span style={{ color: 'red' }}>{this.state.error1}</span>
                                    </Col>
                                </Row>
                                <Row type='flex' align='middle' gutter={16} style={{ marginBottom: '10px' }}>
                                    <Col span={8} style={{ textAlign: 'right' }}>
                                        投放位置：
                                    </Col>
                                    <Col span={8}>
                                        <Input value={this.state.form.location} onChange={(e) => this.setFormData('location', e.target.value)} />
                                        <span style={{ color: 'red' }}>{this.state.error2}</span>
                                    </Col>
                                </Row>
                                <Row type='flex' align='middle' gutter={16} style={{ marginBottom: '10px' }} id="provider-area1">
                                    <Col span={8} style={{ textAlign: 'right' }}>
                                        智能柜规格：
                                    </Col>
                                    <Col span={8}>
                                        <Select
                                            // showSearch
                                            style={{ width: '150px' }}
                                            placeholder="选择规格"
                                            optionFilterProp="children"
                                            value={this.state.form.specification}
                                            onChange={(value) => this.setFormData('specification', value)}
                                            filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                                            getPopupContainer={() => document.getElementById('provider-area1')}
                                        >
                                            {cabinetSpecification}
                                        </Select>
                                        <span style={{ color: 'red' }}>{this.state.error3}</span>
                                    </Col>
                                </Row>
                            </Modal>
                        </Row>
                        <Row style={{ marginTop: '40px', marginBottom: '20px' }}>
                            <Col span={2}>
                                <Button onClick={() => { this.showModal() }}>新增智能柜</Button>
                            </Col>
                            <Col span={8}>
                                <Popconfirm title="确认删除吗?" onConfirm={() => { this.onDelete(this.state.selectedIds) }} okText="是" cancelText="否">
                                    <Button>删除智能柜</Button>
                                </Popconfirm>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Table
                                    loading={this.state.loading}
                                    pagination={this.state.pagination}
                                    rowSelection={rowSelection}
                                    onChange={(pagination) => this.handleTableChange(pagination)}
                                    columns={columns}
                                    dataSource={this.state.data}
                                    bordered
                                />
                            </Col>
                        </Row>
                    </div>
                </Card>
            </div>
        );
    }
}
export default CabinetManage