import React from 'react';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import { Card, Button, Input, Select, Menu, Icon, Table, Row, Col, Popconfirm, InputNumber, message, Popover } from 'antd';
import { Link } from 'react-router';
import ProductReceipts from './ProductReceipts.jsx'
import $ from 'jquery'
import PartsSearch from '../model/PartsSearch.jsx'
import update from 'immutability-helper'
const Option = Select.Option;
class PutInStorage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            view: false,
            display: 'none',
            data: [],
            error: '',
            options: [],
            providerId:''
        }
        this.success = false
    }

    componentDidMount() {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'provider/list',
            dataType: 'json',
            type: 'get',
            data: {
                page: 1,
                number: 99,
            },
            success: (result) => {
                if (result.code == '0') {
                    this.setState({
                        options: result.data
                    })
                }
            }
        })
    }

  

    handleCancel = () => {
        this.setState({
            view: false
        })
    }
    modeShow = () => {
        this.setState({
            view: true
        })
    }
    handleOk = (data) => {
        data.map((item,index)=>{
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

    onDelete = (index) => {
        const dataSource = [...this.state.data];
        dataSource.splice(index, 1);
        this.setState({
            data: dataSource,
            display: dataSource.length > 0 ? 'block' : 'none'
        });
    }


    setSearchProvider = (value) => {
        this.setState({
            providerId: value
        })
    }

    saveData = (totalPrice) => {
        if (this.state.data.length < 1) {
            this.setState({
                error: '请新增配件入库'
            })
        }
        if (this.state.error == '') {
            let instockArray = []
            let inv = this.state.data;
            for (let item of inv) {
                item.inventoryId = item.id;
                delete (item.id);
                delete (item.brandId);
                delete (item.providerName);
                delete (item.typeId);
                delete (item.manufactureNumber);
                delete (item.createDate);
                delete (item.comment);
                delete (item.key)
            }

            $.ajax({
                url: 'api/'+localStorage.getItem('store')+'/'+'inventory/instock',
                contentType: 'application/json;charset=utf-8',
                dataType: 'json',
                type: 'post',
                data: JSON.stringify({
                    types: [0],
                    state: 0,
                    totalPrice: totalPrice,
                    orderMaker: { id: localStorage.getItem('userId') },
                    inventoryInfos: inv,
                    providerId:Number(this.state.providerId),
                    payState:1
                }),
                traditional: true,
                success: (result) => {
                    if (result.code == '0') {
                        this.success = true;
                        message.success('入库成功', 5);
                        this.setState({
                            data: []
                        },()=>{
                            this.success = false;
                        })
                    }
                }
            })
        }
    }
    render() {
        let totalPrice = 0, disabled = true, oneDisabled = 0, plateOptions
        for (let item of this.state.data) {
            totalPrice = totalPrice + (item.amount&&item.price ? item.price * item.amount : 0)
            if (item.price && item.amount && item.provider) {
                oneDisabled++
            }
        }

        if (oneDisabled == this.state.data.length) {
            disabled = false
        }
        plateOptions = this.state.options.map((item, index) => {
            const content = (
                <div style={{ width: '200px' }}>
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={12} >供应商名称：</Col>
                        <Col span={12}>{item.name}</Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={12} >联系人：</Col>
                        <Col span={12}>{item.contactName}</Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={12} >手机号码：</Col>
                        <Col span={12}>{item.phone}</Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={12} >座机号码：</Col>
                        <Col span={12}>{item.landline}</Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={12} >地址：</Col>
                        <Col span={12}>{item.address}</Col>
                    </Row>
                </div>
            );
            const pop = <Popover arrowPointAtCenter placement="left" content={content} title="供应商明细" style={{ zIndex: '1000' }}>
                {item.name}
            </Popover>
            return <Option key={index} value={item.id + ''}>{pop}</Option>
        });
        return <div>
            <BreadcrumbCustom first="进销存管理" second="入库" />
            <Card style={{ marginBottom: '10px' }}>
                <Row gutter={24} style={{ marginBottom: "10px" }}>
                    <Col span={8} >
                        制单人：
                        <span style={{ verticalAlign: 'middle' }}>{localStorage.getItem('username')}</span>
                    </Col>
                </Row>
                供应商：<Select
                        showSearch
                        style={{ width: '150px', marginLeft: '20px' }}
                        optionFilterProp="children"
                        onChange={(value) => this.setSearchProvider(value)}
                        filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                    >
                        {plateOptions}
                </Select>
                {this.state.providerId&&<Button type="primary" style={{ marginLeft: '10px', marginBottom: '10px' }} onClick={() => this.modeShow()} size={'large'}>添加配件入库</Button>}
                
                {this.state.providerId&&<PartsSearch providerId={this.state.providerId} view={this.state.view} handleCancel={this.handleCancel} handleOk={this.handleOk}></PartsSearch>}

                <div style={{ display: this.state.display }}>
                    {this.state.data.length > 0 && <Table loading={this.state.data ? false : true} className="accountTable" dataSource={this.state.data} bordered>
                        <Col
                            title="序号"
                            dataIndex="index"
                            key="index"
                            render={(text, record, index) => { return <span>{index + 1}</span> }}
                        />
                        <Col
                            title="配件编号"
                            dataIndex="id"
                            key="id"
                        />
                        <Col
                            title="配件名称"
                            key="name"
                            dataIndex="name"
                        />
                        <Col
                            title="配件类别"
                            key=" typeName"
                            dataIndex="typeName"
                        />
                        <Col
                            title="规格属性"
                            key="property"
                            dataIndex="property"
                        />
                        <Col
                            title="单价"
                            key="price"
                            dataIndex="price"
                            render={(text, record, index) => {
                                return <InputNumber style={{ width: '100px' }} onChange={(value) => this.changeData('price', value, index)} />
                            }}
                        />
                        <Col
                            title="数量"
                            key="amount"
                            dataIndex="amount"
                            render={(text, record, index) => {
                                return <InputNumber min={1} defaultValue={1} style={{ width: '100px' }} onChange={(value) => this.changeData('amount', value, index)} />
                            }}
                        />
                        <Col
                            title="供应商"
                            key="provider"
                            dataIndex="provider"
                            render={(text, record, index) => {
                                // return <Select showSearch
                                //     style={{ width: '200px' }}
                                //     placeholder="输入供应商名称"
                                //     allowClear={true}
                                //     defaultValue={text.name}
                                //     optionFilterProp="children"
                                //     filterOption={(input, option) => option.props.children.props.children.indexOf(input) >= 0}
                                //     onChange={(value) => this.changeData('provider', { id: value }, index)}
                                // >
                                //     {plateOptions}
                                // </Select>
                                return <span>{text.name}</span>
                            }}
                        />
                        <Col
                            title="单项合计"
                            key="DeductionCardTime"
                            dataIndex="DeductionCardTime"
                            render={(text, record, index) => {
                                return <span>{record.amount ? record.amount * record.price : 0}</span>
                            }}
                        />
                        <Col
                            title="操作"
                            key="action"
                            render={(text, record, index) => {
                                return <span>
                                    <Popconfirm title="确认要删除嘛?" onConfirm={() => this.onDelete(index)}>
                                        <a href="javascript:void(0);">删除</a>
                                    </Popconfirm>
                                </span>
                            }}
                        />
                    </Table>}
                    {this.state.data.length > 0 && <div style={{ marginTop: '40px', borderTop: '1px solid #a1a1a1' }}>
                        <Row gutter={24} style={{ margin: "20px 0", fontSize: '18px' }}>
                            <Col span={12} >合计金额：<span>{totalPrice}</span>
                            </Col>
                            {/* <Col span={12} >
                                合计数量：
                            <span>{this.state.data.length}</span>
                            </Col> */}
                        </Row>
                        <Row gutter={24} style={{ margin: "20px 0", fontSize: '18px' }}>
                            <Col span={12} >
                            </Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                                <span style={{ color: 'red', marginRight: '20px' }} >{`${this.state.error}`}</span>
                                <Button style={{ width: '100px', height: '50px' }} size={'large'}>取消</Button>
                                <Button onClick={() => this.saveData(totalPrice)} type="primary" disabled={disabled} style={{ width: '100px', height: '50px' }} size={'large'}>保存</Button>
                            </Col>
                        </Row>
                    </div>}
                </div>
            </Card>
            <ProductReceipts success={this.success}></ProductReceipts>
        </div>
    }
}
export default PutInStorage