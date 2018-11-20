import React from 'react';
import $ from 'jquery'
import update from 'immutability-helper'
import { Modal, Menu, Icon, Button, Card, Row, Col, Input, Popconfirm, Table, Form, Select, message, Checkbox, DatePicker } from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import ProgramSearch from '../model/ProgramSearch.jsx';
import moment from 'moment';
import dateHelper from '../../utils/dateHelper'
const FormItem = Form.Item,
    Option = Select.Option,
    { RangePicker } = DatePicker,
    { TextArea } = Input;

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 11 }
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 10 }
    }
};
class PreferentialActivities extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            method: 'add',
            view: false,
            form: {
                name: '',
                type: '1',
                validityPeriod: '',
                comment: '',
                limitTime: false,
                limitDate: '',
                couponProgram: []
            },
            data: [],
        }
    }

    componentDidMount() {
        this.getList(1, 10)
    }

    getList = (page, pageSize, name) => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'favour/query',
            data: {
                page: page,
                number: pageSize,
                name: name
            },
            success: (result) => {
                this.setState({
                    loading: false
                })
                if (result.code == "0") {
                    for (let item of result.data) {
                        item.key = item.id
                    }
                    this.setState({
                        data: result.data,
                        pagination: { total: result.realSize }
                    })
                } else {
                    this.setState({
                        data: [],
                        pagination: { total: 0 },
                    })
                }
            },
        })
    }

    addFavour = () => {
        let set = []
        if (this.state.form.couponProgram.length > 0) {
            for (let item of this.state.form.couponProgram) {
                if (item.buyPrice > -1 || item.presentPrice > -1) {
                    set.push({
                        project: item,
                        times: 1,
                        buyPrice: item.buyPrice,
                        presentPrice: parseInt(item.presentPrice)
                    })
                } else {
                    message.error('请输入价格')
                }
            }
        } else {
            message.error('请选择项目')
        }

        if ((set.length == this.state.form.couponProgram.length) && set.length > 0) {
            $.ajax({
                url: 'api/'+localStorage.getItem('store')+'/'+'favour/add',
                type: 'post',
                contentType: 'application/json;charset=utf-8',
                dataType: 'json',
                data: JSON.stringify({
                    id: this.state.form.id,
                    name: this.state.form.name,
                    type: this.state.form.type,
                    validTime: this.state.form.validityPeriod,
                    content: this.state.form.comment,
                    buyStartline:this.state.form.limitDate[0] ? dateHelper(new Date(this.state.form.limitDate[0])) : null,
                    buyDeadline:this.state.form.limitDate[1] ? dateHelper(new Date(this.state.form.limitDate[1])) : null,
                    set: set,
                }),
                success: (result) => {

                    if (result.code == "0") {
                        message.success(result.msg)
                        if (this.state.method == 'modify') {
                            this.props.form.resetFields()
                            result.data.key = result.data.id
                            this.setState({
                                data: update(this.state.data, { [this.state.mergeIndex]: { $set: result.data } }),
                                visible: false,
                                form: {
                                    name: '',
                                    type: '1',
                                    validityPeriod: '',
                                    comment: '',
                                    limitTime: false,
                                    limitDate: '',
                                    couponProgram: []
                                }
                            })
                        } else {
                            this.props.form.resetFields()
                            result.data.key = result.data.id
                            this.setState({
                                data: update(this.state.data, { $push: [result.data] }),
                                visible: false,
                                form: {
                                    name: '',
                                    type: '1',
                                    validityPeriod: '',
                                    comment: '',
                                    limitTime: false,
                                    limitDate: '',
                                    couponProgram: []
                                }
                            })
                        }

                    } else {
                        message.error(result.msg)
                    }
                }
            })
        }
    }

    handleChange = (key, value) => {
        this.setState({
            form: update(this.state.form, { [key]: { $set: value } })
        }, () => {
            this.props.form.setFieldsValue({
                name: this.state.form.name,
                type: this.state.form.type == 1 ? '抵用券' : '代金券',
                validityPeriod: this.state.form.validityPeriod,
                comment: this.state.form.comment
            })
        })
    }


    showModal = (method, record, index) => {
        if (method == 'modify') {
            record.index = index;
            this.setState({
                mergeIndex: index
            })
            let couponProgram = []
            for (let item of record.set) {
                item.project.presentPrice = item.presentPrice
                item.project.buyPrice = item.buyPrice
                item.project.key = item.project.id
                couponProgram.push(item.project)
            }
            this.setState({
                method: 'modify',
                form: {
                    id: record.key,
                    name: record.name,
                    type: record.type,
                    validityPeriod: record.validTime,
                    comment: record.content,
                    limitTime: record.buyDeadline ? true : false,
                    limitDate: [record.buyStartline, record.buyDeadline],
                    couponProgram: couponProgram
                },
                visible: true
            }, () => {
                this.props.form.setFieldsValue({
                    name: this.state.form.name,
                    type: this.state.form.type == 1 ? '抵用券' : '代金券',
                    validityPeriod: this.state.form.validityPeriod,
                    comment: this.state.form.comment
                })
            });
        } else {
            this.setState({
                method: 'add',
                visible: true,
                form: {
                    name: '',
                    type: '1',
                    validityPeriod: '',
                    comment: '',
                    limitTime: false,
                    limitDate: '',
                    couponProgram: []
                }
            });
        }
    }

    onDelete = (idArray) => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'favour/delete',
            type: 'post',
            // contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            traditional: true,
            data: {
                favourIds: idArray
            },
            success: (result) => {
                if (result.code == "0") {
                    message.success(result.msg)
                    let dataSource = [...this.state.data];
                    for (let id of idArray) {
                        dataSource = dataSource.filter((obj) => {
                            return id !== obj.id;
                        });
                    }
                    this.setState({
                        data: dataSource,
                        pagination: update(this.state.pagination, { ['total']: { $set: result.realSize } })
                    });
                } else {
                    message.error(result.msg)
                }

            }
        })
    }

    onCancel = () => {
        this.setState({
            visible: false
        })
        this.props.form.resetFields()
    }

    handleCancel = () => {
        this.setState({
            view: false
        })
    }

    handleOk = (data) => {
        let datalist = this.state.form.couponProgram;
        if (datalist.length > 0) {
            for (let i = 0; i < data.length; i++) {
                let same = 0;
                for (let j = 0; j < datalist.length; j++) {
                    if (data[i].id == datalist[j].id) {
                        same++
                    }
                }
                data[i]['payMethod'] = 0
                if (same == 0) {
                    datalist.unshift(data[i])
                }
            }
        } else {
            for (let item of data) {
                item['payMethod'] = 1
            }
            datalist.push(...data)
        }
        this.setState({
            view: false,
            form: update(this.state.form, { couponProgram: { $set: datalist } })
        })
    }

    check = () => {
        this.props.form.validateFields(
            (err) => {
                if (!err) {
                    this.addFavour()
                }
            },
        )
    }

    onRefDelete = (index) => {
        let sr = this.state.form.couponProgram;
        sr.splice(index, 1);
        this.setState({
            form: update(this.state.form, { couponProgram: { $set: sr } })
        })
    }

    queryData = () => {
        this.getList(1, 10, this.state.cardName)
    }

    handlePageChange = (pagination) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        })

        this.getList(pagination.current, 10)
    }

    render() {
        const columns = [{
            title: '序号',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => {
                return <span>{index + 1}</span>
            }
        }, {
            title: '券名',
            dataIndex: 'name',
            key: 'name'
        }, {
            title: '券种',
            dataIndex: 'type',
            key: 'type',
            render: (text, record, index) => {
                return <div>
                    {text == 1 ? '抵用券' : '代金券'}
                </div>
            }
        }, {
            title: '有效期（月）',
            dataIndex: 'validTime',
            key: 'validTime'
        }, {
            title: '优惠项目',
            dataIndex: 'set',
            key: 'set',
            render: (text, record, index) => {
                let names = ''
                for (let item of record.set) {
                    names = names + (names !== '' ? '、' : '') + item.project.name
                }
                return <div>
                    {names}
                </div>
            }
        }, {
            title: '项目原价',
            dataIndex: 'initalPrice',
            key: 'initalPrice',
            render: (text, record, index) => {
                let totalprice = 0
                for (let item of record.set) {
                    totalprice = item.project.price + totalprice
                }
                return <div>{totalprice}</div>
            }
        }, {
            title: '项目现价',
            dataIndex: 'presentPrice',
            key: 'presentPrice',
            render: (text, record, index) => {
                let totalprice = 0
                for (let item of record.set) {
                    totalprice = item.presentPrice + totalprice
                }
                return <div>{totalprice}</div>
            }

        }, {
            title: '购券价格',
            dataIndex: 'buyPrice',
            key: 'buyPrice',
            render: (text, record, index) => {
                let totalprice = 0
                for (let item of record.set) {
                    totalprice = item.buyPrice + totalprice
                }
                return <div>{totalprice}</div>
            }

        }, {
            title: '内容说明',
            dataIndex: 'content',
            key: 'content'
        }, {
            title: '创建时间',
            dataIndex: 'createDate',
            key: 'createDate'
        }, {
            title: '操作',
            dataIndex: 'operation',
            render: (text, record, index) => {
                return (
                    <div>
                        <a onClick={() => this.showModal('modify', record, index)} style={{ marginRight: '15px' }}>修改</a>

                        <Popconfirm title="确认要删除吗?" onConfirm={() => this.onDelete([record.key])}>
                            <a href="#">删除</a>
                        </Popconfirm>
                    </div>
                );
            },
        }], couponColumns = [{
            title: '项目名称',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: '项目原价',
            dataIndex: 'price',
            key: 'Price'
        }, {
            title: '购券价格',
            dataIndex: 'buyPrice',
            key: 'buyPrice',
            render: (text, record, index) => {
                return <Input style={{ width: '150px' }} placeholder="输入价格" value={record.buyPrice} onChange={(e) => {
                    this.setState({
                        form: update(this.state.form, { couponProgram: { [index]: { $merge: { buyPrice: e.target.value } } } })
                    })
                }} />
            }
        }, {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            render: (text, record, index) => {
                return (
                    <div>
                        <Popconfirm title="确定要删除?" onConfirm={() => this.onRefDelete(index)}>
                            <a>删除</a>
                        </Popconfirm>
                    </div>
                );
            },
        }]

        if (this.state.form.type == 2) {
            couponColumns[2] = {
                title: '项目现价',
                dataIndex: 'presentPrice',
                key: 'presentPrice',
                render: (text, record, index) => {
                    return <Input style={{ width: '150px' }} value={record.presentPrice} placeholder="输入价格" onChange={(e) => {
                        this.setState({
                            form: update(this.state.form, { couponProgram: { [index]: { $merge: { presentPrice: e.target.value } } } })
                        })
                    }} />
                }
            }
        }

        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ selectedRowKeys: selectedRowKeys });
            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User',    // Column configuration not to be checked
            }),
        }, { getFieldDecorator } = this.props.form;
        return <div>
            <BreadcrumbCustom first="营销管理" second="优惠活动" />
            <Card>
                <div>
                    <Row gutter={16}>
                        <Col xs={15} sm={10} md={10} lg={6} xl={4} style={{ verticalAlign: 'middle' }}>
                            <span>券名 : </span>
                            <Input style={{ width: '140px' }} onChange={(e) => this.setState({ cardName: e.target.value })} />
                        </Col>
                        <Col span={3}>
                            <Button type="primary" onClick={this.queryData}>查询</Button>
                        </Col>
                    </Row>

                    <Row gutter={16} style={{ marginTop: '40px', marginBottom: '20px' }}>
                        <Col xs={6} sm={5} md={4} lg={2} xl={2}>
                            <Button className="editable-add-btn" onClick={() => this.showModal('add')}>新增活动</Button>
                        </Col>
                        <Col xs={2} sm={4} md={6}>
                            <Popconfirm title="确定要删除?" onConfirm={() => this.onDelete(this.state.selectedRowKeys)}>
                                <Button >删除活动</Button>
                            </Popconfirm>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24}>
                            <Table
                                rowSelection={rowSelection}
                                columns={columns}
                                dataSource={this.state.data}
                                bordered
                                pagination={this.state.pagination}
                                onChange={(pagination) => this.handlePageChange(pagination)}
                            />
                        </Col>
                    </Row>
                </div>
            </Card>
            <Modal
                title={this.state.method == 'add' ? '新增优惠' : '修改优惠'}
                maskClosable={false}
                visible={this.state.visible}
                footer={[
                    <Button key="back" onClick={() => this.onCancel()}>取消</Button>,
                    <Button key="submit" type="primary" htmlType="submit" onClick={() => this.check()}>提交</Button>,
                ]}
                onOk={() => this.onOk()}
                onCancel={() => this.onCancel()}
                width='60%' >
                <Form>
                    <FormItem
                        {...formItemLayout}
                        label={`券名`}
                        hasFeedback
                        key="name"
                    >
                        {getFieldDecorator('name', {
                            initialValue: '',
                            rules: [{
                                required: true, message: '请输入券名',
                            }]

                        })(
                            <Input style={{ width: 150 }} onChange={(e) => { this.handleChange('name', e.target.value) }} />
                            )}

                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="券种"
                        hasFeedback
                        key="type"
                    >
                        {getFieldDecorator('type', {
                            initialValue: '1',
                            rules: [{
                                required: true, message: '请选择券种',
                            }],
                        })(
                            <Select style={{ width: 150 }} onChange={(e) => { this.handleChange('type', e) }} disabled={this.state.method == 'add' ? false : true}>
                                <Option key="daijin" value={'1'}>抵用券</Option>
                                <Option key="diyong" value={'2'}>代金券</Option>
                            </Select>
                            )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="有效期（月）"
                        hasFeedback
                        key="validityPeriod"
                    >
                        {getFieldDecorator('validityPeriod', {
                            initialValue: '',
                            rules: [{
                                required: true, message: '请输入有效期',
                            }],
                        })(
                            <Input style={{ width: 150 }} onChange={(e) => { this.handleChange('validityPeriod', e.target.value) }} />
                            )}

                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="内容说明"
                        hasFeedback
                        key="comment"
                    >
                        {getFieldDecorator('comment', {
                            initialValue: '',
                            rules: [{
                                required: false
                            }],
                        })(
                            <TextArea style={{ width: 150 }} rows={4} onChange={(e) => { this.handleChange('comment', e.target.value) }} />
                            )}

                    </FormItem>
                </Form>
                <div style={{ textAlign: 'center' }}>{this.state.form.type == 1 && <Checkbox checked={this.state.form.limitTime} onChange={() => this.setState({ form: update(this.state.form, { limitTime: { $set: !this.state.form.limitTime } }) })}>限时购买</Checkbox>}
                    {this.state.form.limitTime && <RangePicker defaultValue={[moment(this.state.form.limitDate[0]), moment(this.state.form.limitDate[0])]} onChange={(date, dateString) => this.handleChange('limitDate', dateString)} />}
                </div>
                <Row style={{ marginBottom: '10px' }}>
                    <Button type="primary" onClick={() => { this.setState({ view: true }) }}>优惠项目</Button>(必选)
                   {this.state.form.couponProgram.length > 0 && <Table
                        dataSource={this.state.form.couponProgram}
                        columns={couponColumns}
                    />}
                </Row>
                <ProgramSearch programId={-1} view={this.state.view} handleCancel={this.handleCancel} handleOk={this.handleOk}></ProgramSearch>
            </Modal>
        </div>
    }
}
const PreferentialActivity = Form.create()(PreferentialActivities);
export default PreferentialActivity