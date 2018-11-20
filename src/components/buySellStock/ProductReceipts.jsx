import React from 'react';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import { Card, Button, Input, Select, Menu, Icon, Table, message, Row, Col, Popconfirm, DatePicker } from 'antd';
import { Link } from 'react-router';
import moment from 'moment';
import $ from 'jquery';
import update from 'immutability-helper'
import dateHelper from '../../utils/dateHelper.js'
const { RangePicker } = DatePicker
const Option = Select.Option,
    Search = Input.Search
// 日期 format
const dateFormat = 'YYYY/MM/DD';
class PutInStorage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            option: [],
            orderNumber: '',
            orderMaker: '',
            errormsg: false,
            payState: -1,
            providerId: -1,
            startDate: null,
            endDate: null,
            adminList: [],
            stateList: [{ state: '已结清', key: '0' }, { state: '未结清', key: '1' }, { state: '待付款', key: '2' }],
            providerList: []
        }
    }
    componentDidMount() {
        this.queryList(1, 10)
        this.getAdminList()
        this.queryProviderList()
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.success) {
            this.queryList(1, 10)
        }
    }


    getAdminList = () => {
        $.ajax({
            url: `api/${localStorage.getItem('store')}/admin/list`,
            data: {
                page: 1,
                number: 99
            },
            success: (result) => {
                if (result.code == "0") {
                    this.setState({
                        adminList: result.data
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
        this.queryList(pagination.current, 10)
    }
    onDelete = (id) => {
        $.ajax({
            type: 'post',
            url: `api/${localStorage.getItem('store')}/inventory/delorder`,
            // contentType:'application/json;charset=utf-8',
            dataType: 'json',
            data: {
                orderId: id
            },
            traditional: true,
            success: (result) => {
                if (result.code == "0") {
                    let dataSource = [...this.state.data];
                    dataSource = dataSource.filter((obj) => {
                        return id !== obj.id;
                    });
                    this.setState({
                        data: dataSource
                    });
                }
            }
        })
    }
    queryList = (page, number) => {
        $.ajax({
            type: 'post',
            url: `api/${localStorage.getItem('store')}/inventory/query`,
            dataType: 'json',
            data: {
                id: this.state.orderNumber,
                // adminId: adminId,
                types: [0],
                page: page,
                number: number,
                startTime: this.state.startDate ? dateHelper(this.state.startDate) : '1990-01-01 00:00:00',
                endTime: this.state.endDate ? dateHelper(this.state.endDate) : '3990-01-01 00:00:00',
                providerId: this.state.providerId,
                payState: this.state.payState,
            },
            traditional: true,
            success: (result) => {
                if (result.code == "0") {
                    let data = result.data
                    for (let item of data) {
                        item['key'] = item.id
                    }
                    this.setState({
                        data: data,
                        pagination: { total: result.realSize }
                    });
                } else {
                    if (result.code !== '2') {
                        message.error(result.msg)
                    }
                    this.setState({
                        data: [],
                        pagination: { total: 0 },
                        errormsg: true
                    })
                }
            }
        })
    }

    queryProviderList = () => {
        $.ajax({
            type: 'get',
            url: `api/${localStorage.getItem('store')}/provider/query`,
            data: {
                page: 1,
                number: 99
            },
            success: (result) => {
                if (result.code == '0') {
                    this.setState({
                        providerList: result.data
                    })
                }
            }
        })
    }

    setOrderNumber = (value) => {
        this.setState({
            orderNumber: value
        })
    }
    setOrderMaker = (value) => {
        this.setState({
            orderMaker: value
        })
    }

    dateChange = (data, dataString) => {
        // console.log(data)

        this.setState({
            startDate: new Date(dataString[0]),
            endDate: new Date(dataString[1])
        })
    }
    render() {
        const projectOptions = this.state.option.map((item, index) => {
            return <Option key={index} value={item.value}>{item.text}</Option>
        }), conlums = [{
            title: '序号',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => {
                return <span>{index + 1}</span>
            }
        }, {
            title: '库存编号',
            dataIndex: 'id',
            key: 'id',
            render: (text, record, index) => {
                return <span><Link to={"/app/buySellStock/productReceipts/" + text} >{text}</Link></span>
            }
        }, {
            title: '合计金额',
            dataIndex: 'totalPrice',
            key: 'totalPrice'
        }, {
            title: '供应商',
            dataIndex: 'providerName',
            key: 'providerName',
            render: (text, record, index) => {
                return <span><Link to={"/app/buySellStock/providerDetail/" + record.providerId} >{text}</Link></span>
            }
        }, {
            title: '清算状态',
            dataIndex: 'payState',
            key: 'payState',
            render: (text, record, index) => {
                let payState = ''
                switch (text) {
                    case 0: payState = '已结清'; break;
                    case 1: payState = '未结清'; break;
                    case 2: payState = '待付款'; break;
                }
                return <span>{payState}</span>
            }
        }, {
            title: '清算时间',
            dataIndex: 'payDate',
            key: 'payDate'
        }, {
            title: '创建时间',
            dataIndex: 'createDate',
            key: 'createDate'
        }, {
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            render: (text, record, index) => {
                return (record.payState == 2 ?
                    (<span>
                        <Link to={`/app/buySellStock/storageEdit/${record.id}`}>修改</Link>
                        &nbsp;&nbsp;
                        <Popconfirm title="确认要删除嘛?" onConfirm={() => this.onDelete(record.id)}>
                            <a href="javascript:void(0);">作废</a>
                        </Popconfirm>
                    </span>) :
                    (<span><Link to={"/app/buySellStock/productReceipts/" + record.id} >查看</Link>
                        &nbsp;&nbsp;
                    <Popconfirm title="确认要删除嘛?" onConfirm={() => this.onDelete(record.id)}>
                            <a href="javascript:void(0);">作废</a>
                        </Popconfirm></span>))
            }
        }], adminList = this.state.adminList.map((item, index) => {
            return <Option key={index} value={item.id + ''}>{item.name}</Option>
        }), stateList = this.state.stateList.map((item, index) => {
            return <Option key={index} value={item.key + ''}>{item.state}</Option>
        }), providerList = this.state.providerList.map((item, index) => {
            return <Option key={index} value={item.id + ''}>{item.name}</Option>
        })

        return <div>
            <Card>
                <Row style={{ marginBottom: "10px" }}>
                    <Col span={8} >库存编号：<Input
                        placeholder="输入单据编号"
                        style={{ width: '200px', marginBottom: '10px' }}
                        value={this.state.orderNumber}
                        onChange={(e) => this.setOrderNumber(e.target.value)}
                    />
                    </Col>
                    <Col span={16} >
                        单据时间：
                        <RangePicker
                            format={dateFormat}
                            onChange={this.dateChange}
                        />
                        {/* <div style={{ height: '28px', lineHeight: '28px' }} id='provider-area'>
                            制单人：
                           <Select
                                showSearch
                                style={{ width: '200px' }}
                                placeholder="选择制单人"
                                optionFilterProp="children"
                                allowClear
                                onChange={(value) => this.setOrderMaker(value)}
                                filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                                getPopupContainer={() => document.getElementById('provider-area')}
                            >
                                <Option key="-1" >全部</Option>
                                {adminList}
                            </Select>
                        </div> */}
                    </Col>
                </Row>
                <Row>
                    <Col span={8}>
                        供应商：<Select
                            showSearch
                            style={{ width: '200px' }}
                            placeholder="选择供应商"
                            optionFilterProp="children"
                            allowClear
                            onChange={(value) => this.setState({ providerId: value })}
                            filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                        >
                            <Option key="-1" >全部</Option>
                            {providerList}
                        </Select>
                    </Col>
                    <Col span={8}>
                        清算状态：<Select
                            showSearch
                            style={{ width: '200px' }}
                            optionFilterProp="children"
                            placeholder="选择清算状态"
                            allowClear
                            onChange={(value) => this.setState({ payState: value })}
                            filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                        >
                            <Option key="-1" >全部</Option>
                            {stateList}
                        </Select>
                    </Col>
                    <Col span={8} >
                        <div style={{ height: '28px', lineHeight: '28px' }}>
                            <Button type="primary" onClick={() => this.queryList(1, 10)}>
                                查询
                        </Button>
                        </div>
                    </Col>
                </Row>
                <Table style={{ marginTop: '20px' }} bordered pagination={this.state.pagination} columns={conlums} dataSource={this.state.data} onChange={(pagination) => this.handleTableChange(pagination)} />
            </Card>
        </div>
    }
}
export default PutInStorage