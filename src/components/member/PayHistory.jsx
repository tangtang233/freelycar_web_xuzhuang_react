import React from 'react';
import { Row, Col, Card, Table, InputNumber, Input, Button, Icon, Radio, DatePicker } from 'antd';
import { Link } from 'react-router';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import { Tabs } from 'antd';
import $ from 'jquery';
import compare from '../../utils/compare.js'
import update from 'immutability-helper'
const TabPane = Tabs.TabPane;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD 00:00:00';


class PayHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: '',
            option: [],
            payData: [],
            queryStart: '',
            queryEnd: '',
            pagination: {},
            key: 1,
            Columns: [
                {
                    title: '序号', dataIndex: 'index', key: 'index', render: (text, record, index) => {
                        return <span>{index + 1}</span>
                    }
                },
                { title: '项目', dataIndex: 'programName', key: 'programName' },
                { title: '消费金额', dataIndex: 'payMoney', key: 'payMoney' },
                { title: '支付方式', dataIndex: 'payType', key: 'payType' },
                //  { title: '服务人员', dataIndex: 'servicePeople', key: 'servicePeople' },
                { title: '服务时间', dataIndex: 'serviceTime', key: 'serviceTime' },
                //  { title: '状态', dataIndex: 'serviceState', key: 'serviceState' },
            ]
        }
    }

    componentDidMount() {

        this.loadData(this.props.params.id, 1, 1, 10)
    }
    tabCallback = (key) => {
        if (key == 1) {

            this.loadData(this.props.params.id, 1, 1, 10)

            this.setState({
                key: key
            });
        } else if (key == 2) {

            this.loadData(this.props.params.id, 2, 1, 10)
            this.setState({
                key: key
            });

        } else if (key == 3) {
            this.loadData(this.props.params.id, 3, 1, 10)
            this.setState({
                key: key
            });

        }
    }
    queryTime = () => {
        this.loadData(this.props.params.id, Number(this.state.key), 1, 10);
    }

    onTimeSelected = (dates, dateStrings) => {
        this.setState({
            queryStart: new Date(dateStrings[0]),
            queryEnd: new Date(dateStrings[1])
        })
    }

    handlePageChange = (pagination) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        })
        this.loadData(this.props.params.id, Number(this.state.key), pagination.current, 10);
    }

    loadData = (clientId, type, page, number) => {
        let jsonData = {}, url = '';
        jsonData.clientId = clientId;
        jsonData.page = page;
        jsonData.number = number;
        jsonData.startTime = this.state.queryStart;
        jsonData.endTime = this.state.queryEnd;
        switch (type) {
            case 1: url = 'consumhistToday'; break;
            case 2: url = 'consumhistMonth'; break;
            case 3: url = 'consumhistAll'; break;
            default: url = ''; break;
        }
        $.ajax({
            url: `api/${localStorage.getItem('store')}/client/${url}`,
            dataType: 'json',
            data: JSON.stringify(jsonData),
            contentType: 'application/json;charset=utf-8',
            type: 'POST',
            success: (res) => {
                if (res.code == '0') {
                    var objpay = res.data;
                    let paylist = [];
                    objpay.sort(compare('serviceDate'))
                    for (let k = 0; k < objpay.length; k++) {
                        let payMethod = objpay[k].payMethod;
                        let paymeth;
                        switch (payMethod) {
                            case 0: paymeth = "现金";
                                break;
                            case 1: paymeth = "刷卡";
                                break;
                            case 2: paymeth = "支付宝";
                                break;
                            case 3: paymeth = "微信";
                                break;
                            case 4: paymeth = "易付宝";
                                break;
                        }

                        let payItem = {
                            key: objpay[k].id,
                            id: objpay[k].id,
                            programName: objpay[k].project,
                            payMoney: objpay[k].consumAmount,
                            payType: paymeth,
                            serviceTime: objpay[k].serviceDate,
                            insuranceMoney: objpay[k].amount,
                        }
                        paylist.push(payItem);
                    }
                    // paylist.sort(compare('serviceTime'))
                    this.setState({
                        amount: res.amount,
                        payData: paylist,
                        pagination: update(this.state.pagination, { total: { $set: res.realSize } })
                    })
                } else if (res.code == "2") {
                    this.setState({
                        payData: [],
                        amount: 0,
                        pagination: {}
                    })
                }
            }
        })

    }
    render() {
        return (
            <div className="card-container">
                <Tabs type="card" onChange={this.tabCallback}>
                    <TabPane tab="今日" key="1">
                        <Card>
                            <div style={{ marginBottom: '20px', fontSize: '16px' }}>合计消费：<span>{this.state.amount}</span></div>
                            <Table columns={this.state.Columns} dataSource={this.state.payData} pagination={this.state.pagination} onChange={(pagination) => this.handlePageChange(pagination)} bordered></Table>
                        </Card>
                    </TabPane>
                    <TabPane tab="本月" key="2">
                        <Card>
                            <div style={{ marginBottom: '20px', fontSize: '16px' }}>合计消费：<span>{this.state.amount}</span></div>
                            <Table columns={this.state.Columns} dataSource={this.state.payData} pagination={this.state.pagination} onChange={(pagination) => this.handlePageChange(pagination)} bordered></Table>
                        </Card>
                    </TabPane>
                    <TabPane tab="全部" key="3">
                        <Card>
                            <div style={{ marginBottom: '20px', fontSize: '16px' }}>合计消费：<span>{this.state.amount}</span></div>
                            查找日期： <DatePicker.RangePicker
                                format={dateFormat}
                                showToday={true}
                                onChange={(dates, dateStrings) => { this.onTimeSelected(dates, dateStrings) }}
                            />
                            <Button type="primary" onClick={this.queryTime} style={{ marginLeft: '10px' }}>查询</Button>
                            <Table
                                columns={this.state.Columns}
                                dataSource={this.state.payData}
                                style={{ marginTop: '20px' }}
                                bordered
                                pagination={this.state.pagination}
                                onChange={(pagination) => this.handlePageChange(pagination)}
                            ></Table>
                        </Card>
                    </TabPane>
                </Tabs>
            </div>
        )
    }


}
export default PayHistory