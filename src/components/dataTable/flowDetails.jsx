import React from 'react';
import {Row, Col, Card, Table, DatePicker, Button} from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import $ from 'jquery';
import update from 'immutability-helper'
import yyyymmdd from '../../utils/dateHelper'
// 日期 format
const dateFormat = 'YYYY/MM/DD';
const columns = [
    {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        render: (text, record, index) => {
            return <span>{index + 1}</span>
        }
    }, {
        title: '车型',
        dataIndex: 'carBrand',
        key: 'carBrand'
    }, {
        title: '车牌号码',
        dataIndex: 'licensePlate',
        key: 'licensePlate'
    }, {
        title: '车主姓名',
        dataIndex: 'name',
        key: 'name'
    }, {
        title: '联系方式',
        dataIndex: 'phone',
        key: 'phone'
    }, {
        title: '消费项目',
        dataIndex: 'projectName',
        key: 'projectName',
    }, {
        title: '金额',
        dataIndex: 'totalPrice',
        key: 'totalPrice'
    }, {
        title: '时间',
        dataIndex: 'createDate',
        key: 'createDate',
        render: (text, record, index) => {
            return <span>{text.slice(0, 10)}</span>
        }
    }, {
        title: '是否会员',
        dataIndex: 'isMember',
        key: 'isMember',
        render: (text, record, index) => {
            if(text===0){
                return <span>否</span>
            } else {
                return <span>是</span>
            }
        }
    }];

class flowDetails extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            nowType: null,
            queryDate: [],
            pagination: {
                showTotal: (total) => {
                    return <span style={{marginRight: '20px'}}>共&nbsp;{total}&nbsp;条</span>
                }
            },
        }
    }

    componentDidMount() {
        this.getList(1, 10)
    }

    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        })
        this.getList(pagination.current, 10, this.state.nowType)
    }

    render() {
        return <div className="gutter-example">

            <BreadcrumbCustom first="数据报表" second="流水明细"/>
            <Card style={{marginTop: '15px'}}>
                <Row gutter={10}>
                    <Col span={14}>
                        <span>单据日期 : </span>
                        <DatePicker.RangePicker
                            format={dateFormat}
                            showToday={true}
                            style={{width: '200px'}}
                            onChange={(date, dateString) => {
                                this.setState({queryDate: dateString})
                            }}
                        />
                    </Col>
                    <Col span={4}>
                        <Button type="primary" onClick={() => {
                            this.getList(1, 10)
                        }}>查询</Button>
                    </Col>
                    <Col span={6}>
                        <a href={`api/${localStorage.getItem('store')}/report/orderSummary?startTime=${this.state.queryDate[0]}&endTime=${this.state.queryDate[1]}`}>
                            <Button icon="export" type="primary">
                                导出Excel</Button>
                        </a>
                    </Col>
                </Row>
                <Table style={{marginTop: '20px'}} columns={columns} pagination={this.state.pagination}
                       onChange={(pagination) => this.handleTableChange(pagination)} dataSource={this.state.data}
                       bordered></Table>
            </Card>
        </div>
    }
    // api/xuzhuang/report/orderSummary?startTime=2018-08-01&endTime=2018-08-31

    getList = (page, number) => {
        let obj = {
                page: page,
                pageSize: number,
                startTime: this.state.queryDate.length > 0 ? this.state.queryDate[0] : null,
                endTime: this.state.queryDate.length > 0 ? this.state.queryDate[1] : null,
            }

        $.ajax({
            url: 'api/' + localStorage.getItem('store') + '/' + 'orderSummary/list',
            data: obj,
            success: (result) => {
                if (result.code == "0") {
                    let data = result.data
                    for (let item of data) {
                        item['key'] = item.id
                        item.expendDate = item.expendDate ? item.expendDate.slice(0, 10) : ''
                    }
                    this.setState({
                        data: data,
                        pagination: update(this.state.pagination, {['total']: {$set: result.realSize}})
                    })
                } else {
                    this.setState({
                        data: []
                    })
                    message.error(result.msg, 5)
                }
            }
        })
    }
}

export default flowDetails