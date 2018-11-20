import React from 'react';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import { Card, Button, Input, Select, Menu, Icon, Table, Row, Col, Popconfirm, DatePicker, message } from 'antd';
import { Link } from 'react-router';
import moment from 'moment';
import $ from 'jquery'
const Option = Select.Option;
// 日期 format
const dateFormat = 'YYYY/MM/DD';
class PutInStorage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            inventoryOrderId: '',//搜索单据编号
            adminId: '',
            option: [],
            startTime:null,
            endTime:null
        }
    }
    componentDidMount() {
        this.loadData(1, 10, [1,2,3]);
        this.loadAdmin();
    }

    //条件查询
    conditionQuery = () => {
        this.loadData(1, 10,[1,2,3], this.state.inventoryOrderId, this.state.adminId);
    }

    loadData = (page, number, type, inventoryOrderId, adminId,startTime,endTime) => {
        var obj = {};
        obj.inventoryOrderId = inventoryOrderId?inventoryOrderId:'';
        obj.adminId = adminId?adminId:-1;
        obj.payState = -1;
        obj.providerId = -1;
        obj.types = type;
        obj.page = page;
        obj.number = number;
        if(this.state.startTime) {
            obj.startTime = this.state.startTime;
            obj.endTime = this.state.endTime;
        }

        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'inventory/query',
            type: 'post',
            data: obj,
            dataType: 'json',
            traditional:true,
            success: (res) => {
                if (res.code == '0') {
                    let data = [];
                    let arr = res.data;
                    for (let item of arr) {
                        let invArr = item.inventoryInfos;//配件数组
                        for (let i of invArr) {
                            i.key = i.id;
                            i.docNmuber = item.id;//单据编号
                            i.docType = item.type;//单据类型
                            i.createDate = item.createDate;
                            data.push(i);
                        }
                    }
                    this.setState({
                        data: data
                    });
                } else {
                    if (res.code !== "2") {
                        message.error(res.msg)
                    }
                    this.setState({
                        data: [],
                        pagination: { total: 0 }
                    })
                }
            }

        });
    }

    loadAdmin = () => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'admin/list',
            type: 'get',
            data: { page: 1, number: 99 },
            dataType: 'json',
            success: (res) => {
                if (res.code == '0') {
                    this.setState({
                        option: res.data
                    });
                }
            }
        });
    }

    handleChange = (e) => {
        this.setState({
            adminId: e
        })
    }

    onTimeSelected = (dates, dateStrings) => {
        this.setState({
            startTime:new Date(dateStrings[0]),
            endTime:new Date(dateStrings[1])
        })
    }

    render() {
        const adminOption = this.state.option.map((item, index) => {
            return <Option key={index} value={item.id + ''}>{item.name}</Option>
        })

        return <div>
            <BreadcrumbCustom first="进销存管理" second="出库" />
            <Card>
                <Row gutter={24} style={{ marginBottom: "10px" }}>

                    <Col span={6} >
                        单据编号：
                        <Input style={{ width: '120px' }} value={this.state.inventoryOrderId} onChange={(e) => { this.setState({ inventoryOrderId: e.target.value }) }} />
                    </Col>

                    <Col span={9} >
                        单据时间：
                        <DatePicker.RangePicker
                            /* defaultValue={[moment(), moment()]}s */
                            format={dateFormat}
                            showToday={true}
                            onChange={(dates, dateStrings) => { this.onTimeSelected(dates, dateStrings) }}
                        />
                    </Col>

                    <Col span={9} >
                        制单人：
                        <Select style={{ width: '120px', marginRight: '20px' }} onChange={(e) => this.handleChange(e)}>
                            <Option key="-1" >全部</Option>
                            {adminOption}
                        </Select>
                        <Button type="primary" onClick={() => { this.conditionQuery() }}>查询</Button>
                    </Col>

                </Row>
                <Table dataSource={this.state.data} bordered>
                    <Col
                        title="序号"
                        dataIndex="index"
                        key="index"
                        render={(text, record, index) => {
                            return <span>{index + 1}</span>
                        }}
                    />
                    <Col
                        title="配件名称"
                        key="name"
                        dataIndex="name"
                    />
                    <Col
                        title="配件类别"
                        key="typeName"
                        dataIndex="typeName"
                    />
                    <Col
                        title="单据编号"
                        key="docNmuber"
                        dataIndex="docNmuber"
                    />
                    <Col
                        title="单据类型"
                        key="docType"
                        dataIndex="docType"
                        render={(text, record, index) => {
                            let view = ''
                            if (text == 0) {
                                view = '入库'
                            } else if (text == 1) {
                                view = '维修出库'
                            } else if (text == 2) {
                                view = '美容出库'
                            } else {
                                view = '退货出库'
                            }
                            return <span>{view}</span>
                        }}
                    />
                    <Col
                        title="单价"
                        key="price"
                        dataIndex="price"
                    />
                    <Col
                        title="出库数量"
                        key="amount"
                        dataIndex="amount"
                    />
                    <Col
                        title="总计"
                        key="total"
                        dataIndex="total"
                        render={(text, record, index) => {
                            return <span>{record.price * record.amount}</span>
                        }}
                    />
                    <Col
                        title="创建时间"
                        key="createDate"
                        dataIndex="createDate"
                    />
                </Table>
            </Card>
        </div>
    }
}
export default PutInStorage