import React from 'react';
import CustomerInfo from '../forms/EditCustomerInfo.jsx';
import ServiceTable from '../tables/ServiceTable.jsx';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import update from 'immutability-helper'
import $ from 'jquery'
import { Row, Col, Card, Upload, Button, Input, Select, Menu, Icon, Switch, TreeSelect, Table, message } from 'antd';
const Option = Select.Option,
    SubMenu = Menu.SubMenu,
    Search = Input.Search
class ProductSearch extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            options: [],
            pagination: {},
            name: null,
            tradeName: '',
            category: '',
            theme: 'light',
            current: '1',
            conlums: [{
                title: '序号',
                dataIndex: 'index',
                key: 'index',
                render: (text, record, index) => {
                    return <span>{index + 1}</span>
                }
            }, {
                title: '库存编号',
                dataIndex: 'number',
                key: 'number'
            }, {
                title: '配件名称',
                dataIndex: 'name',
                key: 'name'
            }, {
                title: '配件类别',
                dataIndex: 'category',
                key: 'category'
            }, {
                title: '配件品牌',
                dataIndex: 'brand',
                key: 'brand'

            }, {
                title: '规格',
                dataIndex: 'specification',
                key: 'specification'
            }, {
                title: '属性',
                dataIndex: 'attribute',
                key: 'attribute'
            }, {
                title: '配件价格',
                dataIndex: 'price',
                key: 'price'
            }, {
                title: '可用库存',
                dataIndex: 'stock',
                key: 'stock',
                render: (text, record, index) => {
                    return <span style={{ color: Number(text) == 0 ? 'red' : '' }}>{text}</span>
                }
            }],
            data: []
        }
    }
    componentDidMount() {
        this.getList(null, null, 1, 10)
        this.getTypeList(1, 10)
    }

    getTypeList = (page, pageSize) => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'inventory/querytype',
            data: {
                page: page,
                number: pageSize
            },
            success: (result) => {
                if (result.code == '0') {
                    for (let item of result.data) {
                        this.setState({ options: update(this.state.options, { $push: [item] }) })
                    }
                }
            }
        })
    }

    getList = (name, typeId, page, pageSize) => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'inventory/list',
            data: {
                name: name,
                typeId: (!typeId || typeId == -1) ? "" : typeId,
                page: page,
                number: pageSize
            },
            success: (result) => {
                if (result.code == "0") {
                    let datalist = []
                    for (let i = 0; i < result.data.length; i++) {
                        let dataitem = {
                            key: result.data[i].id,
                            number: result.data[i].id,
                            id: result.data[i].id,
                            name: result.data[i].name,
                            category: result.data[i].typeName,
                            brand: result.data[i].brandName,
                            specification: result.data[i].standard,
                            attribute: result.data[i].property,
                            price: result.data[i].price,
                            stock: result.data[i].amount,
                            supplier: result.data[i].provider ? result.data[i].provider.name : '',
                            createDate: result.data[i].createDate,
                            phone: result.data[i].provider ? result.data[i].provider.phone : ''
                        }
                        datalist.push(dataitem)
                    }
                    this.setState({
                        data: datalist,
                        pagination: { total: result.realSize },
                    })
                } else {
                    if (result.code !== "2") {
                        message.error(result.msg)
                    }
                    this.setState({
                        data: [],
                        pagination: { total: 0 }
                    })
                }
            },
        })
    }

    handleChange = (value) => {
        this.setState({
            category: value
        })
    }
    
    handleTableChange = (pagination) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        })
        if (this.state.category > -1) {
            this.getList(null, this.state.category, pagination.current, 10)
        } else {
            this.getList(this.state.tradeName, -1, pagination.current, 10)
        }

    }
    handleClick = (e) => {
        this.setState({
            current: e.key,
        });
    }
    setTradeName = (value) => {
        this.setState({
            tradeName: value,
        });
    }
    render() {
        const plateOptions = [...new Set(this.state.options)].map((item, index) => {
            return <Option key={index} value={item.id + ''}>{item.typeName}</Option>
        });
        return <div>
            <BreadcrumbCustom first="进销存管理" second="库存查询" />
            <Card>
                <div>
                    <Row gutter={24} style={{ marginBottom: '10px' }}>
                        <Col span={6} style={{ verticalAlign: 'middle' }}>
                            配件名称：<Input
                                style={{ width: '120px', marginBottom: '10px' }}
                                onChange={e => this.setTradeName(e.target.value)}
                                value={this.state.tradeName}
                            />
                        </Col>
                        <Col span={6} style={{ verticalAlign: 'middle' }} id="provider-area">
                            配件类别：<Select
                                showSearch
                                style={{ width: '120px' }}
                                optionFilterProp="children"
                                onChange={(value) => this.handleChange(value)}
                                filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                                getPopupContainer={() => document.getElementById('provider-area')}
                            >
                                <Option key="-1" >全部</Option>
                                {plateOptions}
                            </Select>

                        </Col>
                        <Col span={6}>
                            <Button onClick={() => this.getList(this.state.tradeName, this.state.category, 1, 10)} type="primary" >查询</Button>
                        </Col>
                    </Row>
                    < Table pagination={this.state.pagination} bordered columns={this.state.conlums} dataSource={this.state.data} onChange={(pagination) => this.handleTableChange(pagination)} />
                </div>
            </Card>
        </div>
    }
}
export default ProductSearch