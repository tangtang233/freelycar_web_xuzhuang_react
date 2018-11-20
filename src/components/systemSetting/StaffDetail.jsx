import React from 'react';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx'
import $ from 'jquery'
import update from 'immutability-helper'
import PreFixInterge from '../../utils/PreFixInterge.js'

import { Row, Col, Card, Button, Radio, DatePicker, Table, Input, Select, Icon, Modal, Popconfirm, message, Switch } from 'antd';
const Option = Select.Option;
const { RangePicker } = DatePicker,
    RadioGroup = Radio.Group;
// 日期 format
const dateFormat = 'YYYY/MM/DD';


class AccountManage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            data: [],
            selectedIds: [],
            form: {
                id: '',
                account: '',
                name: '',
                level: '',
                position: ''
            }
        }
    }
    componentDidMount() {
        this.queryAccount( 1, 10,this.props.params.id)
    }

    queryAccount = ( page, number,sid) => {

        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'staff/detail',
            data: {
                staffId: sid,
                page: page,
                number: number
            },
            type: 'get',
            dataType: 'json',
            success: (result) => {
                let staffInfo = result.staffInfo;
                this.setState({
                    form: update(this.state.form,
                        {
                            ['id']: { $set: staffInfo.id },
                            ['name']: { $set: staffInfo.name },
                            ['position']: { $set: staffInfo.position },
                            ['level']: { $set: staffInfo.level }
                        })
                });

                if (result.code == "0") {

                    let arr = result.data;
                    for (let item of arr) {
                        item.key = item.id;
                    }

                    this.setState({
                        data: result.data,
                        pagination: { total: result.realSize },
                        loading: false
                    })
                } else {
                    message.error(result.msg)
                    this.setState({
                        data: [],
                        pagination: { total: result.realSize }
                    })
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
        this.queryAccount( pagination.current, 10,this.props.params.id)
    }




    handleTableChange = (pagination) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        })
        this.queryaccount(pagination.current, 10)
    }

    render() {
        const columns = [{
            title: '序号',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => {
                return <span>{index + 1}</span>
            }
        }, {
            title: '客户名称',
            dataIndex: 'clientName',
            key: 'clientName'
        }, {
            title: '车牌号码',
            dataIndex: 'licensePlate',
            key: 'licensePlate'
        }, {
            title: '品牌型号',
            dataIndex: 'brandName',
            key: 'brandName'
        }, {
            title: '项目名称',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: '金额',
            dataIndex: 'price',
            key: 'price'
        }, {
            title: '服务时间',
            dataIndex: 'createDate',
            key: 'createDate'
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
                <BreadcrumbCustom first="系统设置" second="员工管理" />
                <Card>
                    <div>
                        <Row>
                            <Col span={4}  >
                                <div style={{ marginBottom: 16 }}>
                                    员工工号：
                                    <span>
                                        {PreFixInterge(this.state.form.id,3)}
                                    </span>
                                </div>
                            </Col>

                            <Col span={4} >
                                <div style={{ marginBottom: 16 }}>
                                    员工姓名：
                                    <span>
                                        {this.state.form.name}
                                    </span>
                                </div>
                            </Col>

                            <Col span={4} >
                                <div style={{ marginBottom: 16 }}>
                                    职位：
                                    <span>
                                        {this.state.form.position}
                                    </span>
                                </div>
                            </Col>

                            <Col span={4} >
                                <div style={{ marginBottom: 16 }}>
                                    等级：
                                    <span>
                                        {this.state.form.level}
                                    </span>
                                </div>
                            </Col>

                        </Row>
                        <Row style={{ marginTop: '40px', marginBottom: '20px' }}>
                            <Col span={2}>
                                服务详情
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Table
                                    loading={this.state.loading}
                                    pagination={this.state.pagination}
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
export default AccountManage