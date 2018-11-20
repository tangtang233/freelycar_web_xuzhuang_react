import React from 'react';
import { Row, Col, Card, Table, Select, InputNumber, Input, Button, DatePicker, message } from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import { Link } from 'react-router';
import OrderTable from './OrderTable.jsx'
import $ from 'jquery'
import update from 'immutability-helper'
import dateHelper from '../../utils/dateHelper.js'
import getParameterByName from '../../utils/getParameterByName'
const { MonthPicker, RangePicker } = DatePicker;
const Option = Select.Option;
class OrderManage extends React.Component {
    constructor(props) {
        super(props)
        let cleartag = getParameterByName('from')
        if (cleartag !== 'xq') {
            sessionStorage.clear()
        }
        let info = JSON.parse(sessionStorage.getItem('lastinfo'))
        console.log(info)
        this.state = {
            option: [],
            type: '美容',
            pagination: {
                current:info ? info.current : ''
            },
            data: [],
            query: {
                id: info ? info.id : null,
                licensePlate: info ? info.licensePlate : '',
                programId: info ? info.programId : null,
                payState: info ? info.payState : null,
                startDate: info ? info.startDate : '',
                dates: info ? info.dates : [],
                dateString : info ? info.dateString : [],
                endDate: info ? info.endDate:'',
                dateType: info ? info.dateType:null,
                state: info ? info.state:null
            }
        }
    }
    handleSelectChange = (value) => {
        this.setState({
            type: value
        })
    }
    componentDidMount() {
        this.getQuery(1, 10)
    }

    setQueryData = (key, data) => {
        console.log(data)
        this.setState({
            query: update(this.state.query, { [key]: { $set: data } })
        }, () => {
            if (key == 'state') {
                this.getQuery(this.state.pagination.current, 10)
            }
        })
    }

    handleTableChange = (pagination) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        })
        sessionStorage.removeItem('lastinfo')
        let info = {...this.state.query,current:pagination.current}
        console.log('query',this.state.query)
        sessionStorage.setItem('lastinfo',JSON.stringify(info))
        console.log('handleTableChange',info)
        this.getQuery(pagination.current, 10)
    }

    startClear = () => {
        this.setState({
            query: {
                id: null,
                licensePlate: '',
                programId: null,
                payState: null,
                startDate: '',
                dateString: [],
                endDate: '',
                dateType: null,
                state: null
            }
        })
    }

    getQuery = (page, pageNumber) => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'order/query',
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({
                consumOrder: {
                    id: this.state.query.id ? this.state.query.id : '',
                    licensePlate: this.state.query.licensePlate,
                    programId: this.state.query.programId ? this.state.query.programId : -1,
                    payState: this.state.query.payState ? this.state.query.payState : -1,
                    clientId: -1,
                    state: this.state.query.state ? this.state.query.state : -1
                },
                startDate: this.state.query.dateType ? dateHelper(new Date(this.state.query.dateString[0])) : null,
                endDate: this.state.query.dateType ? dateHelper(new Date(this.state.query.dateString[1])) : null,
                dateType: this.state.query.dateType ? this.state.query.dateType : -1,
                page: page,
                number: pageNumber
            }),
            success: (res) => {
                if (res.code == '0') {
                    let dataArray = res.data
                    for (let item of dataArray) {
                        item.key = item.id
                    }
                    this.setState({
                        data: dataArray,
                        pagination: update(this.state.pagination, { total: { $set: res.realSize } })

                    })
                } else {
                    message.error(res.msg)
                    this.setState({
                        data: [],
                        pagination: update(this.state.pagination, { total: { $set: 0 } })
                    })
                }
            }
        })
    }

    render() {
        const plateOptions = this.state.option.map((item, index) => {
            return <Option key={index} value={item.value}>{item.text}</Option>
        })

        return (
            <div className="gutter-example">
                <BreadcrumbCustom first="消费开单" second="单据管理" />
                <Card bodyStyle={{ background: '#fff' }}>
                    <Row gutter={16} style={{ marginBottom: "10px" }}>
                        <Col span={8} >
                            单据编号：
                       <Input style={{ width: '120px' }} onChange={(e) => this.setQueryData('id', e.target.value)} value={this.state.query.id} />
                        </Col>
                        <Col span={8} id="type">
                            项目类别：
                        <Select allowClear style={{ width: 120 }} value={this.state.query.programId} onChange={(value) => this.setQueryData('programId', value)} getPopupContainer={() => document.getElementById('type')}>
                                <Option value={null}>全部</Option>
                                <Option value="1">美容</Option>
                                <Option value="2">维修</Option>
                            </Select>
                        </Col>
                        <Col span={8} >
                            车辆状态：
                            <div style={{ display: "inline-block" }}>
                                <Button size="large" shape="circle" onClick={() => { if (this.state.query.state !== 1) { this.setQueryData('state', 1) } else { this.setQueryData('state', null) } }} type={this.state.query.state == 1 ? 'primary' : null}>接</Button>
                                <Button size="large" shape="circle" onClick={() => { if (this.state.query.state !== 2) { this.setQueryData('state', 2) } else { this.setQueryData('state', null) } }} type={this.state.query.state == 2 ? 'primary' : null}>完</Button>
                                <Button size="large" shape="circle" onClick={() => { if (this.state.query.state !== 3) { this.setQueryData('state', 3) } else { this.setQueryData('state', null) } }} type={this.state.query.state == 3 ? 'primary' : null}>交</Button>
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: "10px" }}>
                        <Col span={8} id="car-number">
                            车牌号码：
                         <Input style={{ width: '120px' }} value={this.state.query.licensePlate} onChange={(e) => this.setQueryData('licensePlate', e.target.value)} />
                        </Col>
                        <Col span={8} id="pay-state">
                            结算状态：
                        <Select allowClear value={this.state.query.payState} style={{ width: 120 }} onChange={(value) => this.setQueryData('payState', value)} getPopupContainer={() => document.getElementById('pay-state')}>
                                <Option value={null}>全部</Option>
                                <Option value="0">未结算</Option>
                                <Option value=" 1">已结算</Option>
                            </Select>
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: "10px" }} id="area">
                        <Col span={8} >
                            时间类型：
                        <Select allowClear value={this.state.query.dateType} style={{ width: 120 }} onChange={(value) => this.setQueryData('dateType', value)} getPopupContainer={() => document.getElementById('area')}>
                                <Option value={null}>全部</Option>
                                <Option value="0">单据时间</Option>
                                <Option value="1">接车时间</Option>
                                <Option value="2">交车时间</Option>
                                <Option value="3">完工时间</Option>
                            </Select>
                        </Col>
                        {this.state.query.dateType && <Col span={8} id="timepicker">
                            <div>
                                <RangePicker onChange={(dates, dateString) => this.setQueryData('dateString', dateString)} getPopupContainer={() => document.getElementById('timepicker')} />
                            </div>
                        </Col>}
                        <Col span={8} />
                    </Row>
                    <Row gutter={16} style={{ marginBottom: "10px" }}>
                        <Col span={8}>
                            <Button type="primary" onClick={() => {
                                sessionStorage.removeItem('lastinfo')
                                let lastinfo = JSON.stringify(this.state.query)
                                sessionStorage.setItem('lastinfo',lastinfo)
                                this.getQuery(this.state.pagination.current, 10)
                            }}>查询</Button>
                            <Button onClick={() => this.startClear()}>清空</Button>
                        </Col>
                    </Row>
                </Card>
                <OrderTable pagination={this.state.pagination} onChange={this.handleTableChange} data={this.state.data} />
            </div>
        )
    }
}
export default OrderManage