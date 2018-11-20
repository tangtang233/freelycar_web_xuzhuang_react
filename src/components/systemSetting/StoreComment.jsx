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


class StoreComment extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            data: [],
            pagination: {}
        }
    }
    componentDidMount() {
        this.getEvaluation(1, 10, this.props.params.id)
    }

    getEvaluation = (page, number) => {

        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'store/evaluation',
            data: {
                storeId: 1,
                page: page,
                number: number
            },
            type: 'get',
            dataType: 'json',
            success: (result) => {
                if (result.code == '0') {
                    for (let item of result.data) {
                        item.key = item.id
                    }
                    this.setState({
                        data: result.data,
                        average: result.average,
                        realSize: result.realSize,
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

    handleTableChange = (pagination) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        })
        this.getEvaluation(pagination.current, 10)
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
            title: '项目名称',
            dataIndex: 'projects',
            key: 'projects',
            render: (text, record, index) => {
                let str = ''
                for (let item of text) {
                    str = item.name + str + '、'
                }
                str = str.slice(0, -1)
                return <span>{str}</span>
            }
        }, {
            title: '客户名称',
            dataIndex: 'clientName',
            key: 'clientName'
        }, {
            title: '打分',
            dataIndex: 'stars',
            key: 'stars',
        }, {
            title: '评价内容',
            dataIndex: 'comment',
            key: 'comment'
        }, {
            title: '评价时间',
            dataIndex: 'commentDate',
            key: 'commentDate'
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
                <BreadcrumbCustom first="门店管理" second="门店评价" />
                <Card>
                    <div>
                        <Row>
                            <Col span={4}  >
                                <div style={{ marginBottom: 16 }}>
                                    综合评分
                                    <span style={{ color: 'red', fontSize: '20px', margin: ' 0 10px' }}>
                                        {this.state.average}
                                    </span>
                                </div>
                            </Col>

                            <Col span={4} >
                                <div style={{ marginBottom: 16 }}>
                                    共
                                    <span style={{ color: 'red', fontSize: '20px', margin: ' 0 10px' }}>
                                        {this.state.realSize}
                                    </span>
                                    条
                                </div>
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
export default StoreComment