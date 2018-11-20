import React from 'react';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import { Card, Button, Input, Select, Menu, Icon, Table, Row, Col, Popconfirm, InputNumber, message, Popover, DatePicker } from 'antd';
import { Link } from 'react-router';
import ProductReceipts from './ProductReceipts.jsx'
import $ from 'jquery'
import PartsSearch from '../model/PartsSearch.jsx'
import update from 'immutability-helper'
import moment from 'moment';
import { hashHistory } from 'react-router'
const dateFormat = 'YYYY/MM/DD';
const Option = Select.Option;
class PutInStorage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            error: '',
            options: [],
            providers: [],
            adminList: [],
            orderNumber: '',
            orderMaker: '',
        }
    }

    componentDidMount() {
        this.queryList();
        this.getProviders();
    }


    getAdminList = () => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'admin/list',
            data: {
                page: 1,
                number: 99
            },
            success: (result) => {
                if (result.code == "0") {
                    this.setState({
                        adminList: result.data
                    })
                }
            }
        })
    }
    
    getProviders = () => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'provider/list',
            data: {
                page: 1,
                number: 99
            },
            success: (result) => {
                if (result.code == "0") {
                    this.setState({
                        providers: result.data
                    })
                }
            }
        })
    }


    queryList = () => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'inventory/orderdetail',
            data: {
                inventoryOrderId: this.props.params.receiptId
            },
            success: (result) => {
                let data = result.data.inventoryInfos
                for (let item of data) {
                    item['key'] = item.id
                    item['total'] = result.data.totalPrice
                }
                if (result.code == "0") {
                    this.setState({
                        data: data,
                        createDate: result.data.createDate
                    })
                }
            }
        })
    }

    handleOk = (data) => {
        data.map((item, index) => {
            item.price = null
        })
        let datalist = this.state.data
        if (datalist.length > 0) {
            for (let i = 0; i < data.length; i++) {
                let same = 0;
                for (let j = 0; j < datalist.length; j++) {
                    if (data[i].id == datalist[j].id) {
                        same++
                    }
                }
                if (same == 0) {
                    datalist.push(data[i])
                }
            }
        } else {
            datalist.push(...data)
        }
        for (let item of datalist) {
            item.amount = 1;
        }
        this.setState({
            view: false,
            data: datalist,
            display: data.length > 0 ? 'block' : 'none'
        })
    }

    changeData = (key, value, index) => {
        this.setState({
            data: update(this.state.data, { [index]: { [key]: { $set: value } } })
        })
    }

    //复杂类型
    changeDataOfObj = (key, vobj, index) => {
        this.setState({
            data: update(this.state.data, { [index]: { [key]: { 'id': { $set: vobj.key }, 'name': { $set: vobj.label } } } })
        })
    }

    onDelete = (ids) => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'inventory/delete',
            dataType: 'json',
            type: 'post',
            data: {inventoryIds:ids},
            traditional: true,
            success: (result) => {
                if (result.code == '0') {
                    message.success('修改成功', 5);
                    // this.setState({
                    //     data: []
                    // })
                }
            }
        })
    }

    saveData = () => {

        let dataObj = {
            id: this.props.params.receiptId,
            inventoryInfos: this.state.data,
            orderMaker:{id:localStorage.getItem('userId')},
        };

        for (let item of dataObj.inventoryInfos) {
         
            delete (item.brandId);
            delete (item.providerName);
            delete (item.typeId);
            delete (item.manufactureNumber);
            delete (item.createDate);
            delete (item.comment);
            delete (item.total);
            delete (item.key);
        }

        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'inventory/modifyorder',
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify(dataObj),
            traditional: true,
            success: (result) => {
                if (result.code == '0') {
                    message.success('修改成功', 5);
                    // this.setState({
                    //     data: []
                    // })
                    hashHistory.push('/app/buySellStock/putInStorage')
                }
            }
        })
    }
    
    render() {
        const conlums = [{
            title: '序号',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => {
                return <span>{index + 1}</span>
            }
        }, {
            title: '配件名称',
            dataIndex: 'name',
            key: 'name'
        }, {
            title: '配件类别',
            dataIndex: 'typeName',
            key: 'typeName'
        }, {
            title: '配件品牌',
            dataIndex: 'brandName',
            key: 'brandName'
        }, {
            title: '规格',
            dataIndex: 'standard',
            key: 'standard'
        }, {
            title: '属性',
            dataIndex: 'property',
            key: 'property'

        }, {
            title: '单价',
            dataIndex: 'price',
            key: 'price',
            render: (text, record, index) => {
                return <InputNumber defaultValue={text} value={this.state.data[index].price} onChange={(e) => { this.changeData('price', e, index) }} />
            }
        }, {
            title: '数量',
            dataIndex: 'amount',
            key: 'amount',
            render: (text, record, index) => {
                return <InputNumber defaultValue={text} value={this.state.data[index].amount} onChange={(e) => { this.changeData('amount', e, index) }} />
            }
        }, {
            title: '供应商',
            dataIndex: 'provider',
            key: 'provider',
            render: (text, record, index) => {
                return <span>{text.name}</span>
            }
        }, {
            title: '单项合计',
            dataIndex: 'single-total',
            key: 'single-total',
            render: (text, record, index) => {
                return <span>{this.state.data[index].price * this.state.data[index].amount}</span>
            }
        }, {
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            render: (text, record, index) => {
                return <span>
                    <Popconfirm title="确认要删除嘛?" onConfirm={() => this.onDelete([record.id])}>
                        <a href="javascript:void(0);">删除</a>
                    </Popconfirm>
                </span>
            }
        }], adminList = this.state.providers.map((item, index) => {
            return <Option key={index} value={item.id + ''}>{item.name}</Option>

        }), providers = this.state.providers.map((item, index) => {
            return <Option key={index} value={item.id + ''}>{item.name}</Option>
        });


        return <div>
            <BreadcrumbCustom first="进销存管理" second="库存单据修改" />
            <Card>
                <Row gutter={24} style={{ marginBottom: "10px" }}>
                    <Col span={8} >单据编号：<Input
                        placeholder="输入单据编号"
                        style={{ width: '200px', marginBottom: '10px' }}
                        defaultValue={this.props.params.receiptId}
                    />
                    </Col>

                    <Col span={8} >
                        单据时间：
                        <DatePicker defaultValue={moment()} format={dateFormat} />
                    </Col>

                    <Col span={8} >
                        <div style={{ height: '28px', lineHeight: '28px' }} id='provider-area'>
                            制单人：
                           <Select
                                showSearch
                                style={{ width: '200px' }}
                                placeholder="选择制单人"
                                optionFilterProp="children"
                                allowClear
                                onChange={(value) => this.setOrderMaker(value)}
                                filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                                getPopupContainer={() => document.getElementById('provider-area')}
                            >
                                <Option key="-1" >全部</Option>
                                {adminList}
                            </Select>
                        </div>
                    </Col>
                </Row>

                <Table className="accountTable" bordered columns={conlums} dataSource={this.state.data} onChange={this.handleChange} />

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <Button onClick={() => { hashHistory.push('/app/buySellStock/putInStorage') }}>取消</Button>
                    <Button type="primary" onClick={() => { this.saveData() }}>保存</Button>
                </div>
            </Card>
        </div>
    }
}
export default PutInStorage