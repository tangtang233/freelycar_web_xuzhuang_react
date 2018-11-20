import React from 'react';
import CustomerInfo from '../forms/CustomerInfo.jsx'
import ServiceTable from '../tables/ServiceTable.jsx'
import PartsDetail from '../tables/PartsDetail.jsx'
import BreadcrumbCustom from '../BreadcrumbCustom.jsx'
import { Row, Col, Card, Button, Radio, DatePicker, Table, Input, Select, Pagination, message, Icon, Modal,Popconfirm } from 'antd';
import moment from 'moment';
import { Link } from 'react-router';
import $ from 'jquery';
import update from 'immutability-helper'
import yyyymmdd from '../../utils/dateHelper'
const Option = Select.Option;
// 日期 format
const dateFormat = 'YYYY/MM/DD';


class OtherPay extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            view: false,
            visible: false,
            typeList: [],
            nowType: null,
            selectedRowKeys: [],
            error1: '',
            error2: '',
            error3: '',
            pagination: {
                showTotal: (total) => {
                    return <span style={{ marginRight: '20px' }}>共&nbsp;{total}&nbsp;条</span>
                }
            },
            loading: false,
            type: '',
            selectedRow: [],
            option: [],
            data: [],
            selectedIds: [],
            queryDate: [],
            queryType: '',
            form: {
                dateString: null,
                payType: '',
                amount: null,
                comment: ''
            }
        }
    }
    componentDidMount() {
        this.getType()
        this.getList(1, 10)
    }
    getType = () => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'charge/listtype',
            data: {
            },
            success: (result) => {
                if (result.code == "0") {
                    this.setState({
                        typeList: result.data,
                    })
                }
            }
        })
    }
    getList = (page, number, otherExpendTypeId) => {
        let obj
        if (this.state.queryDate.length > 0) {
            obj = {
                page: page,
                number: number,
                typeId: otherExpendTypeId?otherExpendTypeId:-1,
                startTime: this.state.queryDate.length > 0 ? new Date(this.state.queryDate[0]) : null,
                endTime: this.state.queryDate.length > 0 ? new Date(this.state.queryDate[1]) : null,
            }
        } else {
            obj = {
                typeId: otherExpendTypeId?otherExpendTypeId:-1,
                page: page,
                number: number
            }
        }

        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'charge/query',
            data: obj,
            success: (result) => {
                if (result.code == "0") {
                    let data = result.data
                    for (let item of data) {
                        item['key'] = item.id
                        item.expendDate = item.expendDate ? item.expendDate.slice(0, 10) : ''
                    }
                    this.setState({
                        data: data,
                        pagination: update(this.state.pagination, { ['total']: { $set: result.realSize } })
                    })
                } else {
                    this.setState({
                        data: []
                    })
                    message.error(result.msg, 5)
                }
            }
        })
    }

    handleChangeType = (value) => {
        this.setState({
            nowType: value.key
        })
        // this.getList(1, 10, value.key);
    }

    onDelete = (index) => {
        const dataSource = [...this.state.data];
        dataSource.splice(index, 1);
        this.setState({ data: dataSource });
    }

    deleteItems = (idArray) => {
        $.ajax({
            type: 'post',
            url: 'api/'+localStorage.getItem('store')+'/'+'charge/delete',
            dataType: 'json',
            data: {
                ids: idArray
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
                        pagination: update(this.state.pagination, { ['total']: { $set: result.realSize } })
                    });
                }
            }
        })
    }

    setTypeValue = (value) => {
        this.setState({
            type: value
        })
    }

    showModal = () => {
        this.setState({
            visible: true
        })
    }

    handleOk = () => {
        this.setState({
            visible: false
        });
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'charge/addtype',
            type: 'post',
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            data: JSON.stringify({
                name: this.state.type
            }),
            traditional: true,
            success: (result) => {
                if (result.code == "0") {
                    this.getType()
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
        this.getList(pagination.current, 10, this.state.nowType)
    }

    addPay = () => {
        this.setState({
            view: true
        })
    }
    handleAddOk = () => {
        if (!this.state.form.dateString) {
            this.setState({
                error1: '* 请选择单据日期'
            })
        } else {
            this.setState({
                error1: ''
            })
        }
        if (this.state.form.payType == '') {
            this.setState({
                error2: "* 请选择支出类别"
            })
        } else {
            this.setState({
                error2: ''
            })
        }
        if (!this.state.form.amount) {
            this.setState({
                error3: '* 请输入支出金额'
            })
        } else {
            this.setState({
                error3: ''
            })
        }

        if (this.state.form.dateString && this.state.form.payType !== '' && this.state.form.amount) {
            
            $.ajax({
                url: 'api/'+localStorage.getItem('store')+'/'+'charge/add',
                type: 'post',
                contentType: 'application/json;charset=utf-8',
                dataType: 'json',
                data: JSON.stringify({
                    typeId: this.state.form.payType,
                    amount: this.state.form.amount,
                    comment: this.state.form.comment,
                    expendDate: this.state.form.dateString ? yyyymmdd(new Date(this.state.form.dateString)): '',
                }),
                traditional: true,
                success: (result) => {
                    if (result.code == "0") {

                        let data = result.data
                        data['key'] = data.id
                        data.expendDate = data.expendDate ? data.expendDate.slice(0, 10) : ''
                        this.setState({
                            view: false,
                            data: update(this.state.data, { $unshift: [data] }),
                            pagination: update(this.state.pagination, { ['total']: { $set: result.realSize } }),
                            form: {
                                dateString: null,
                                payType: '',
                                amount: null,
                                comment: ''
                            }
                        })
                    } else {
                        message.error(result.msg)
                    }
                }
            })
        }

    }

    handleCancel = () => {
        this.setState({
            visible: false

        });
    }
    handleAddCancel = () => {
        this.setState({
            view: false,
            error3: '',
            error1: '',
            error2: ''
        });
    }
    setFormData = (key, data) => {
        this.setState({
            form: update(this.state.form, { [key]: { $set: data } })
        })
    }
    render() {
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
        }, conlums = [{
            title: '序号',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => {
                return <span>{index + 1}</span>
            }
        }, {
            title: '单据编号',
            dataIndex: 'id',
            key: 'id'
        }, {
            title: '单据日期',
            dataIndex: 'expendDate',
            key: 'expendDate'
        }, {
            title: '支出类别',
            dataIndex: 'typeName',
            key: 'typeName',
        }, {
            title: '支出金额',
            dataIndex: 'amount',
            key: 'amount'
        }, {
            title: '备注',
            dataIndex: 'comment',
            key: 'comment'
        }, {
            title: '创建时间',
            dataIndex: 'createDate',
            key: 'createDate'
        }], typeOptions = this.state.typeList.map((item, index) => {
            return <Option key={index} value={item.id + ''}>{item.name}</Option>
        })

        return (
            < div >
                <BreadcrumbCustom first="收支管理" second="其他支出" />
                <Card style={{ marginBottom: '10px' }}>
                    <Row style={{ marginBottom: '20px' }}>
                        <Col span={8}>
                            支出类别：<Select
                                style={{ width: '100px' }}
                                placeholder="选择支出类别"
                                optionFilterProp="children"
                                onChange={(value) => { this.handleChangeType(value) }}
                                labelInValue
                                filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                            >
                                <Option key={-1} value={null}>全部</Option>
                                {typeOptions}
                            </Select>
                            <Icon type="plus-circle-o" onClick={this.showModal} style={{ marginLeft: '10px', color: '#108ee9', cursor: 'pointer' }} />
                            <Modal title="编辑" visible={this.state.visible}
                             maskClosable={false}
                                onOk={this.handleOk} onCancel={this.handleCancel}
                                okText="保存" cancelText="取消">
                                <span>支出类别名称：</span>
                                <Input value={this.state.type} style={{ width: '200px' }} onChange={(e) => this.setTypeValue(e.target.value)} />
                            </Modal>
                        </Col>
                        <Col span={8}>
                            <span>单据日期 : </span>
                            <DatePicker.RangePicker
                                format={dateFormat}
                                showToday={true}
                                style={{ width: '200px' }}
                                onChange={(date, dateString) => { this.setState({ queryDate: dateString }) }}
                            />
                        </Col>
                        <Col span={8}>
                            <Button type="primary" onClick={() => this.getList(1, 10, this.state.nowType)}>查询</Button>
                        </Col>
                    </Row>
                </Card>
                <Card>
                    <div className="table-operations">
                        <Button onClick={() => this.addPay()}>增加</Button>
                        <Modal
                            title="支出单"
                            maskClosable={false}
                            visible={this.state.view}
                            onOk={this.handleAddOk}
                            onCancel={this.handleAddCancel}
                        >
                            <Row gutter={20} style={{ marginBottom: '10px' }}>
                                <Col span={8} style={{ textAlign: 'right' }}>
                                    单据日期：
                                </Col>
                                <Col span={8} style={{ textAlign: 'right' }}>
                                    <DatePicker value={this.state.form.dateString ? moment(this.state.form.dateString).startOf('day') : null} format={dateFormat} style={{ width: '150px' }} onChange={(date, dateString) => this.setFormData('dateString', dateString)} />
                                </Col>
                                <Col span={8} style={{ textAlign: 'left' }}>
                                    <span style={{ color: 'red' }}>{this.state.error1}</span>
                                </Col>
                            </Row>
                            <Row gutter={20} style={{ marginBottom: '10px' }} id="area">
                                <Col span={8} style={{ textAlign: 'right' }}>
                                    支出类别：
                            </Col>
                                <Col span={8}>
                                    <Select
                                        style={{ width: '150px' }}
                                        value={this.state.form.payType}
                                        placeholder="选择支出类别"
                                        optionFilterProp="children"
                                        onChange={(value) => this.setFormData('payType', value)}
                                        filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                                    >
                                        {typeOptions}
                                    </Select>
                                </Col>
                                <Col span={8} style={{ textAlign: 'left' }}>
                                    <span style={{ color: 'red' }}>{this.state.error2}</span>
                                </Col>
                            </Row>
                            <Row gutter={20} style={{ marginBottom: '10px' }}>
                                <Col span={8} style={{ textAlign: 'right' }}>
                                    支出金额：
                            </Col>
                                <Col span={8}>
                                    <Input value={this.state.form.amount} style={{ width: '150px' }} onChange={(e) => this.setFormData('amount', e.target.value)} />
                                </Col>
                                <Col span={8} style={{ textAlign: 'left' }}>
                                    <span style={{ color: 'red' }}>{this.state.error3}</span>
                                </Col>
                            </Row>
                            <Row gutter={16} style={{ marginBottom: '10px' }}>
                                <Col span={8} style={{ textAlign: 'right' }}>
                                    备注：
                                </Col>
                                <Col span={8}>
                                    {/*<Input size="large" type="textarea" rows={3} />*/}
                                    <Input value={this.state.form.comment} rows={3} type="textarea" onChange={(e) => this.setFormData('comment', e.target.value)} />
                                </Col>
                            </Row>
                        </Modal>
                        <Popconfirm title="确认删除吗?" onConfirm={() => this.deleteItems(this.state.selectedIds)}  okText="是" cancelText="否">
                            <Button>删除</Button>
                        </Popconfirm>
                    </div>
                    <Table pagination={this.state.pagination} bordered columns={conlums} dataSource={this.state.data} onChange={(pagination) => this.handleTableChange(pagination)} rowSelection={rowSelection} >
                    </Table>
                </Card>
            </div >
        );
    }
}
export default OtherPay