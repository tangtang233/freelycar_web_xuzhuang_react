import React from 'react';
import CustomerInfo from '../forms/CustomerInfo.jsx'
import ServiceTable from '../tables/ServiceTable.jsx'
import PartsDetail from '../tables/PartsDetail.jsx'
import BreadcrumbCustom from '../BreadcrumbCustom.jsx'
import $ from 'jquery';
import { Row, Col, Card, Button, Radio, DatePicker, Table } from 'antd';
import moment from 'moment';
import getLastDay from '../../utils/getLastDay.js'
import { Link } from 'react-router';
import update from 'immutability-helper'
// 日期 format
const dateFormat = 'YYYY/MM/DD';



class BeautyOrder extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            data: [],
            pagination: {},
            expendStat: ''
        }
    }
    componentDidMount() {
        this.getExpend(this.props.params.Date, 1, 10)
    }
    getExpend = (month, page, number) => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'stat/query',
            data: {
                startTime: new Date(month),
                endTime: getLastDay(month.slice(0, 4), month.slice(5, 7)),
                income: 0,
                expend: 1,
                page:page,
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
                            expendStat: result.expendStat,
                            data: data,
                            pagination: update(this.state.pagination, { total: { $set: result.realSize } })
                        })
                    }
                } else if (result.code == "2") {
                    this.setState({
                        expendStat: 0,
                        data: [],
                        pagination: update(this.state.pagination, { total: { $set: 0 } })
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
        this.getExpend(this.props.params.Date, pagination.current, 10)
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
            title: '支出项目',
            dataIndex: 'type',
            key: 'type',

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
                <BreadcrumbCustom first="收支查询" second="历史支出明细" />
                <Card>
                    <div>
                        <h1 style={{ color: 'red' }}>{this.props.params.Date}&nbsp;支出总金额：{this.state.expendStat}</h1>
                    </div>
                    <br />
                    <br />

                    <Table pagination={this.state.pagination} loading={this.state.data.length > 0 ? false : true} bordered onChange={this.handleTableChange} columns={columns} dataSource={this.state.data} />
                </Card>
            </div>
        );
    }
}
export default BeautyOrder