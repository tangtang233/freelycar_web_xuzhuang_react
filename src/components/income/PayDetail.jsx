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

class PayDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            pagination: {},
            selectedRowKeys: [],
            loading: false,
        }
    }
    componentDidMount() {
        this.getIncomeExpend(this.props.params.mode, 1, 10)
    }
    componentWillReceiveProps(newprops) {
        this.getIncomeExpend(this.props.params.mode, 1, 10)
    }
    getIncomeExpend = (mode, page, number) => {
        let datastrings
        if (mode == 'query') {
            datastrings = localStorage.getItem('datastrings').split(',')
        }
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'stat/' + mode,
            data: {
                startTime: datastrings ? new Date(datastrings[0]) : null,
                endTime: datastrings ? new Date(datastrings[1]) : null,
                income: 0,
                expend: 1,
                page: page,
                number: number
            },
            success: (result) => {
                if (result.code == "0") {
                    if (result.code == "0") {
                        let data = result.data
                        for (let item of data) {
                            item['key'] = item.id
                        }
                        if (data[data.length - 1]['key']) {
                            this.setState({
                                expendStat:  (new Number(result.expendStat)).toFixed(2),
                                data: data,
                                pagination: { total: result.realSize },
                            })
                        }
                    }
                } else if (result.code == "2"||result.code == "28") {
                    this.setState({
                        expendStat: 0,
                        data: [],
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
        this.getIncomeExpend(this.props.params.mode, pagination.current, 10)
    }
    clearFilters = () => {
        this.setState({ filteredInfo: null });
    }
    clearAll = () => {
        this.setState({
            filteredInfo: null,
            sortedInfo: null,
        });
    }
    setAgeSort = () => {
        this.setState({
            sortedInfo: {
                order: 'descend',
                columnKey: 'age',
            },
        });
    }


    render() {
        let { sortedInfo, filteredInfo } = this.state;
        sortedInfo = sortedInfo || {};
        filteredInfo = filteredInfo || {};
        const columns = [{
            title: '支出项目',
            dataIndex: 'type',
            key: 'type'
        }, {
            title: '金额',
            dataIndex: 'amount',
            key: 'amount'
        }, {
            title: '支出时间',
            dataIndex: 'payDate',
            key: 'payDate'
        }, {
            title: '备注',
            dataIndex: 'comment',
            key: 'comment'
        }];
        return (
            <div>
                <BreadcrumbCustom first="收支查询" second="支出明细" />
                <Card>
                    <Radio.Group value={this.props.params.mode} onChange={this.handleSizeChange}>
                        <Radio.Button value="today"><Link to='/app/incomeManage/incomeSearch/paydetail/today'>当日</Link></Radio.Button>
                        <Radio.Button value="thisweek"><Link to='/app/incomeManage/incomeSearch/paydetail/thisweek'>本周</Link></Radio.Button>
                        <Radio.Button value="thismonth"><Link to='/app/incomeManage/incomeSearch/paydetail/thismonth'>本月</Link></Radio.Button>
                    </Radio.Group>
                    <div style={{ color: 'red', margin: '30px 0', fontSize: '18px' }}>合计金额：<span>{this.state.expendStat}</span></div>
                    <Table bordered pagination={this.state.pagination} columns={columns} dataSource={this.state.data} onChange={this.handleTableChange} />
                </Card>
            </div>
        );
    }
}
export default PayDetail