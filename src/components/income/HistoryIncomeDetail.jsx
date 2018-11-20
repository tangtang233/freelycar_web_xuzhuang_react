import React from 'react';
import CustomerInfo from '../forms/CustomerInfo.jsx'
import ServiceTable from '../tables/ServiceTable.jsx'
import PartsDetail from '../tables/PartsDetail.jsx'
import BreadcrumbCustom from '../BreadcrumbCustom.jsx'
import { Row, Col, Card, Button, Radio, DatePicker, Table } from 'antd';
import { Link } from 'react-router';
import $ from 'jquery'
import getLastDay from '../../utils/getLastDay.js'
class HistoryIncomeDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            pagination: {}
        }
    }
    componentDidMount() {
        this.getIncome(this.props.params.Date, 1, 10)
    }
    getIncome = (month, page, number) => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'stat/query',
            data: {
                startTime: new Date(month),
                endTime: getLastDay(month.slice(0,4),month.slice(5,7)),
                income: 1,
                expend: 0,
                page: page,
                number: number
            },
            success: (result) => {
                if (result.code == "0") {
                    let data = result.data
                    for (let item of data) {
                        item['key'] = item.id
                    }
                    if (data[data.length - 1]['key']) {
                        this.setState({
                            incomeStat: result.incomeStat,
                            data: data,
                            pagination: { total: result.realSize },
                        })
                    }
                } else if (result.code == "2") {
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
        this.getIncome(this.props.params.Date, pagination.current, 10)
    }

    render() {
        let { sortedInfo, filteredInfo } = this.state;
        sortedInfo = sortedInfo || {};
        filteredInfo = filteredInfo || {};
        const columns = [{
            title: '序号',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => {
                return <span>{index + 1}</span>
            }
        }, {
            title: '项目',
            dataIndex: 'programName',
            key: 'programName'
        }, {
            title: '金额',
            dataIndex: 'amount',
            key: 'amount'
        }, {
            title: '时间',
            dataIndex: 'payDate',
            key: 'payDate'
        }];

        return (
            <div>
                <BreadcrumbCustom first="收支查询" second="历史收入明细" />
                <Card>
                    <div>
                        <h1 style={{ color: 'red' }}>{this.props.params.Date}&nbsp;收入总金额：{this.state.incomeStat}</h1>
                    </div>
                    <br />
                    <br />

                    <Table pagination={this.state.pagination} loading={this.state.data.length > 0 ? false : true} bordered columns={columns} onChange={this.handleTableChange} dataSource={this.state.data} />
                </Card>
            </div>
        );
    }
}
export default HistoryIncomeDetail