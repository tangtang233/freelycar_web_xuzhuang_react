import React from 'react';
import { Row, Col, Card, Table, Select, InputNumber, Input, Button, DatePicker, message } from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import update from 'immutability-helper'
import $ from 'jquery'
const columns = [{
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    render: (text, record, index) => {
        return <span>{index + 1}</span>
    }
}, {
    title: '车主姓名',
    dataIndex: 'name',
    key: 'name'
}, {
    title: '车牌号码',
    dataIndex: 'licensePlate',
    key: 'licensePlate'
}, {
    title: '手机号码',
    dataIndex: 'phone',
    key: 'price'
}, {
    title: '保险公司',
    dataIndex: 'insuranceCompany',
    key: 'insuranceCompany'
}, {
    title: '询价时间',
    dataIndex: 'createDate',
    key: 'createDate',
    render:(text,record,index)=>{
        return <span>{text.slice(0,10)}</span>
    }
}, {
    title: '客户意向',
    dataIndex: 'intention',
    key: 'intention'
}];
class AutoInsurance extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            pagination: {},
            data: []
        }
    }

    componentDidMount() {
        this.getInsuranceList(1, 10)
    }

    getInsuranceList(page, number) {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'client/insurance',
            type: 'get',
            // contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            data: {
                page: page,
                number: number
            },
            success: (result) => {
                for (let item of result.data) {
                    item.key = item.id
                }
                if (result.code == "0") {
                    this.setState({
                        data: result.data,
                        pagination: { total: result.realSize }
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
        this.getInsuranceList(pagination.current, 10)
    }


    render() {
        return <div className="gutter-example">

            <BreadcrumbCustom first="会员管理" second="车险客户" />
            <Card style={{ marginTop: '15px' }}  >

                <a href={`api/${localStorage.getItem('store')}/report/insurance`} >
                    <Button icon="export" type="primary">
                        导出Excel</Button>
                </a>
                <Table style={{ marginTop: '20px' }} columns={columns} pagination={this.state.pagination} onChange={(pagination) => this.handleTableChange(pagination)} dataSource={this.state.data} bordered></Table>
            </Card>
        </div>
    }
}

export default AutoInsurance