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
        dataIndex: 'model',
        key: 'model'
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
        dataIndex: 'consumption',
        key: 'consumption',
    }, {
        title: '金额',
        dataIndex: 'price',
        key: 'price'
    }, {
        title: '时间',
        dataIndex: 'createDate',
        key: 'createDate',
        render: (text, record, index) => {
            return <span>{text.slice(0, 10)}</span>
        }
    }, {
        title: '是否会员',
        dataIndex: 'isVip',
        key: 'isVip'
    }];

class flowDetails extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            pagination: {},
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
                            this.getList(1, 10, this.state.nowType)
                        }}>查询</Button>
                    </Col>
                    <Col span={6}>
                        <a href={`api/${localStorage.getItem('store')}/report/insurance`}>
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

    getList = (page, number, otherExpendTypeId) => {
        let obj
        console.log(this.state.queryDate)
        if (this.state.queryDate.length > 0) {
            obj = {
                page: page,
                number: number,
                typeId: otherExpendTypeId ? otherExpendTypeId : -1,
                startTime: this.state.queryDate.length > 0 ? new Date(this.state.queryDate[0]) : null,
                endTime: this.state.queryDate.length > 0 ? new Date(this.state.queryDate[1]) : null,
            }
        } else {
            obj = {
                typeId: otherExpendTypeId ? otherExpendTypeId : -1,
                page: page,
                number: number
            }
        }

        $.ajax({
            url: 'api/' + localStorage.getItem('store') + '/' + 'charge/query',
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