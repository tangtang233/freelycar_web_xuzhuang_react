import React from 'react';
import CustomerInfo from '../forms/CustomerInfo.jsx'
import ServiceTable from '../tables/ServiceTable.jsx'
import PartsDetail from '../tables/PartsDetail.jsx'
import BreadcrumbCustom from '../BreadcrumbCustom.jsx'
import $ from 'jquery';
import { Row, Col, Card, Button, Radio, DatePicker, Table } from 'antd';
import moment from 'moment';

import { Link } from 'react-router';

// 日期 format
const dateFormat = 'YYYY/MM/DD';

//表格
const columns = [{
    title: '时间',
    key: 'payDate',
    dataIndex: 'payDate'
}, {
    title: '实际收入',
    key: 'income',
    dataIndex: 'income',
    render: (text, record, index) => {
        return <Link to={`/app/incomeManage/historyIncomeDetail/${record.payDate}`}>{text}</Link>
    }
}, {
    title: '实际支出',
    key: 'expend',
    dataIndex: 'expend',
    render: (text, record, index) => {
        return <Link to={`/app/incomeManage/historyOutcomeDetail/${record.payDate}`}>{text}</Link>
    }
}];

class IncomeSearch extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            mode: 'today',
            incomeStat: '',
            expendStat: '',
            data:[]
        }
    }
    componentDidMount() {
        this.getIncomeExpend(this.state.mode)
        this.getYearList()
    }
    getIncomeExpend = (mode) => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'stat/' + mode,
            data: {
                income: 1,
                expend: 1,
                page:1,
                number:10
            },
            success: (result) => {
                if (result.code == "0") {
                    this.setState({
                        incomeStat: result.incomeStat,
                        expendStat: result.expendStat
                    })
                }
            }
        })
    }
    getYearList=()=>{
        let myDate = new Date()
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'stat/monthlybyyear',
            data: {
                selectYear:new Date(myDate.getFullYear()+'')
            },
            success: (result) => {
                if (result.code == "0") {
                    let newdata = result.data.slice(0,2)
                    for(let i=0;i<newdata.length;i++) {
                        newdata[i]['key'] = i
                    }
                   this.setState({
                       data:newdata
                   })
                }
            }
        })
    }
    handleModeChange = (e) => {
        const mode = e.target.value;
        this.setState({ mode: mode });
        if (mode == 'today') {
            this.getIncomeExpend(mode)
        } else if (mode == 'thismonth') {
            this.getIncomeExpend(mode)
        }
    }
    onTimeSelected = (dates,dateStrings) =>{
        localStorage.setItem('datastrings',dateStrings)
        if(this.state.mode == 'query') {
             $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'stat/query',
            data: {
                startTime:new Date(dateStrings[0]),
                endTime:new Date(dateStrings[1]),
                income:1,
                expend:1,
                page:1,
                number:10
            },
            success: (result) => {
                if (result.code == "0") {
                    this.setState({
                        incomeStat: result.incomeStat,
                        expendStat: result.expendStat
                    })
                }
            }
        })
        }
    }
    render() {
        return (
            <div>
                <BreadcrumbCustom first="收支管理"  second="收支查询"/>
                <div>
                    <Row>
                        <Col span={12}>
                            <Radio.Group onChange={this.handleModeChange} value={this.state.mode} style={{ marginBottom: 8 }}>
                                <Radio.Button value="today" >今日</Radio.Button>
                                <Radio.Button value="thismonth">本月</Radio.Button>
                                <Radio.Button value="query">区间查找</Radio.Button>
                            </Radio.Group>
                        </Col>
                        {/*日期选择器*/}
                        <Col span={12} style={{ display: this.state.mode == 'query' ? 'inline-block' : 'none' }}>
                            <span>选择查找日期 : </span>
                            <DatePicker.RangePicker
                                format={dateFormat}
                                showToday={true}
                                onChange={(dates,dateStrings)=>{this.onTimeSelected(dates,dateStrings)}}
                            />
                        </Col>
                    </Row>
                </div>
                <div>
                    <Row>
                        <Col span={12}>
                            <div style={{ background: '#ECECEC', padding: '30px', textAlign: 'center' }} >
                                <Card className="nature-income" title="实际收入">
                                    <h1>¥{(new Number(this.state.incomeStat)).toFixed(2)}</h1>
                                    <p><Link to={'/app/incomeManage/incomeSearch/incomedetail/'+this.state.mode} activeClassName="active">详情</Link></p>
                                </Card>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ background: '#ECECEC', padding: '30px', textAlign: 'center' }}>
                                <Card className="nature-outcome" title="实际支出">
                                    <h1>¥{(new Number(this.state.expendStat)).toFixed(2)}</h1>
                                    <p><Link to={'/app/incomeManage/incomeSearch/paydetail/'+this.state.mode} activeClassName="active">详情</Link></p>
                                </Card>
                            </div>
                        </Col>
                    </Row>
                </div>
                {/*历史收支查询*/}
                <div>

                    <Row>
                        <Col span={24}>
                            <div style={{ background: '#ECECEC', padding: '30px', textAlign: 'center' }} >
                                <Card title='历史收支查询' style={{ textAlign: 'left' }}>
                                    <Table
                                        columns={columns}
                                        dataSource={this.state.data}
                                        bordered
                                        className="accountTable"
                                    />
                                    <div style={{ marginTop: '10px', float: 'right',paddingBottom:'20px' }}>
                                        <Link to="/app/incomeManage/historyAccount">更多>></Link>
                                    </div>
                                </Card>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}
export default IncomeSearch