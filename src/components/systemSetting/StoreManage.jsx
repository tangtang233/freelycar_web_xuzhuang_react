import React from 'react';
import { Link, hashHistory } from 'react-router';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx'
import $ from 'jquery'
import update from 'immutability-helper'
import { Row, Col, Card, Button, Radio, DatePicker, Table, Input, Select, Icon, Modal, Popconfirm, message, Switch } from 'antd';
const Option = Select.Option;
const { RangePicker } = DatePicker,
    RadioGroup = Radio.Group;
// 日期 format
const dateFormat = 'YYYY/MM/DD';


class StoreManage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            storeList: [],
            pagination:{},
            name: ''
        }
    }

    componentDidMount() {
        this.queryStore(1,10)
    }


    queryStore = (page,number) => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'store/query',
            data: {
                page: page,
                number: number,
                name: this.state.name ? this.state.name + "" : ""
            },
            success: (result) => {
                this.setState({
                    loading: false
                })
                if (result.code == "0") {
                    let datalist = result.data
                    for (let item of datalist) {
                        item.key = item.id
                    }
                    this.setState({
                        storeList: datalist,
                        pagination: { total: result.realSize }
                    })
                } else if(result.code == "2" || result.code == "28") {
                    this.setState({
                        storeList: [],
                        pagination: { total: 0 }
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
        this.queryStore(pagination.current, 10)
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


    onDelete = (idArray) => {
        $.ajax({
            type: 'post',
            url: 'api/'+localStorage.getItem('store')+'/'+'store/delete',
            dataType: 'json',
            data: {
                storeIds: idArray
            },
            traditional: true,
            success: (result) => {
                if (result.code == "0") {
                    let dataSource = [...this.state.storeList];
                    for (let id of idArray) {
                        dataSource = dataSource.filter((obj) => {
                            return id !== obj.id;
                        });
                    }
                    this.setState({
                        storeList: dataSource,
                        pagination: update(this.state.pagination, { ['total']: { $set: result.realSize } })
                    });
                    message.success(result.msg)
                } else {
                    message.error(result.msg)
                }
            }
        })
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
            title: '门店名称',
            dataIndex: 'name',
            key: 'name',
            render:(text,record,index)=>{
                return <Link to={`/app/systemSet/storeDetail/${record.key}`}>{text}</Link>
            }
        }, {
            title: '门店地址',
            dataIndex: 'address',
            key: 'address'
        }, {
            title: '营业时间',
            dataIndex: 'openingTime',
            key: 'openingTime',
            render: (text, record, index) => {
                return <span>{text+"-"+record.closingTime}</span>
            }
        }, {
            title: '客服电话',
            dataIndex: 'phone',
            key: 'phone',
        },  {
            title: '创建时间',
            dataIndex: 'createDate',
            key: 'createDate'
        }, {
            title: '备注',
            dataIndex: 'comment',
            key: 'comment'
        }, {
            title: '操作',
            dataIndex: 'id',
            key: 'id',
            render: (text, record, index) => {
                return <span>
                    <Link to={`/app/systemSet/storeAdd/${text}`}>修改</Link>
                    &nbsp;&nbsp;
                    <Popconfirm title="确认要删除嘛?" onConfirm={() => this.onDelete([text])}>
                        <a href="javascript:void(0);">删除</a>
                    </Popconfirm>
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
                <BreadcrumbCustom first="系统设置" second="门店管理" />
                <Card>
                    <div>
                        <Row>
                            <Col span={5}>
                                <div style={{ marginBottom: 16 }}>
                                    门店名称：
                                    <Input style={{ width: '140px' }} value={this.state.name} onChange={(e) => { this.setState({ name: e.target.value }) }} />

                                </div>
                            </Col>
                            <Col span={2}>
                                <Button type="primary" onClick={() => { this.queryStore(1, 10) }}>查询</Button>
                            </Col>

                        </Row>
                        <Row style={{ marginTop: '40px', marginBottom: '20px' }}>
                            <Col span={2}>
                                <Button onClick={() => { hashHistory.push('/app/systemSet/storeAdd') }}>新增门店</Button>
                            </Col>
                            <Col span={8}>
                                <Popconfirm title="确认删除吗?" onConfirm={() => { this.onDelete(this.state.selectedIds) }} okText="是" cancelText="否">
                                    <Button>删除门店</Button>
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
                                    dataSource={this.state.storeList}
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
export default StoreManage