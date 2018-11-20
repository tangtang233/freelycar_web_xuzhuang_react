import React from 'react';
import { Link } from 'react-router';
import $ from 'jquery';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import { Row, Col, Card, Button, Input, Select, DatePicker, Table, Modal, message, Checkbox } from 'antd';
import update from 'immutability-helper';
import dateHelper from '../../utils/dateHelper'
const { RangePicker } = DatePicker
const dateFormat = 'YYYY/MM/DD';
const columns1 = [{
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    render: (text, record, index) => {
        return <span>{index + 1}</span>
    }
}, {
    title: '库存编号',
    dataIndex: 'id',
    key: 'id',
    render: (text, record, index) => {
        return <span><Link to={`/app/buySellStock/productReceipts/${text}`} >{text}</Link></span>
    }
}, {
    title: '合计金额',
    dataIndex: 'totalPrice',
    key: 'totalPrice'
}, {
    title: '单据时间',
    dataIndex: 'createDate',
    key: 'createDate'
}, {
    title: '清算状态',
    dataIndex: 'state',
    key: 'state'
}],
    columns2 = [{
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        render: (text, record, index) => {
            return <span>{index + 1}</span>
        }
    }, {
        title: '入库日期',
        dataIndex: 'createDate',
        key: 'createDate'
    }, {
        title: '合计金额',
        dataIndex: 'totalPrice',
        key: 'totalPrice'
    }, {
        title: '清算金额',
        dataIndex: 'clearPrice',
        key: 'clearPrice'
    }, {
        title: '清算时间',
        dataIndex: 'clearDate',
        key: 'clearDate'
    }, {
        title: '清算人',
        dataIndex: 'orderMakerName',
        key: 'orderMakerName'
    },]
class ProviderDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            providerInfo: {},
            clearingRecords: [],
            unClearingRecords: [],
            startTime: new Date(1990,1,0),
            endTime: new Date(2100,1,0),
            clearPagination: {
                pageSize: 5
            },
            unclearPagination: {
                pageSize: 5

            },
            clearInfo: {
                inStockDate: '',
                totalPrice: 0,
                needPayAmount: 0,
                discount: 100,
                clearAmount: 0,
                isPercentage: false
            },
            loading: {
                unClearLoading: true,
                clearLoading: true,
            },
            selectedRowKeys: [],
            selectedIds: []
        }
    }

    //初始化数据
    componentDidMount() {
        this.getProviderDetail();
        this.getUnCliearingRecord(1, 5);
        this.getClearHistory(1, 5);
    }

    //获取供应商详情
    getProviderDetail = () => {
        $.ajax({
            type: 'get',
            data: { providerId: this.props.params.providerId },
            url: 'api/'+localStorage.getItem('store')+'/'+'provider/getbyid',
            dataType: 'json',
            success: (result) => {
                if (result.code == '0') {
                    this.setState({
                        providerInfo: result.data
                    });
                } else if( result.code == "2") {
                    this.setState({
                        providerInfo: []
                    });
                    message.warning(result.msg, 1.5);
                }
            },
            error: (requestObj, error, obj) => {
                message.warning('网络错误！', 1.5);
            }
        });
    }

    //获取供应商已清算记录
    getClearHistory = (page, number) => {
        $.ajax({
            type: 'get',
            data: {
                page: page,
                number: number,
                providerId: this.props.params.providerId
            },
            url: 'api/'+localStorage.getItem('store')+'/'+'provider/clearHistory',
            dataType: 'json',
            success: (result) => {
                if (result.code == '0') {
                    let records = []
                    result.data.map((item) => {
                        if(item.orderMaker) {
                            if(item.orderMaker.name) {
                                item.orderMakerName = item.orderMaker.name
                            }
                            if(item.orderMaker.createDate) {
                                item.createDate = item.orderMaker.createDate
                            }
                            
                        }
                        item.key = item.id;
                        records.push(item)
                    })
                    this.setState({
                        loading: update(this.state.loading, { ['clearLoading']: { $set: false } }),
                        clearingRecords: records,
                        clearPagination: { pageSize: 5, total: result.realSize },
                    })
                } else {
                    this.setState({
                        loading: update(this.state.loading, { ['clearLoading']: { $set: false } }),
                        clearingRecords: [],
                        clearPagination: { pageSize: 5, total: 0 },
                    })
                    message.warning(result.msg, 1.5);
                }
            },
            error: (requestObj, error, errorObj) => {
                this.setState({
                    loading: update(this.state.loading, { ['clearLoading']: { $set: false } })
                })
                message.warning('网络错误！', 1.5);
            }
        });
    }

    //通过时间获取未清算的记录
    getUnCliearingRecord = (page, number) => {
        $.ajax({
            type: 'get',
            data: {
                page: page,
                number: number,
                providerId: this.props.params.providerId,
                startTime: this.state.startTime ? dateHelper(this.state.startTime) : "",
                endTime: this.state.endTime ? dateHelper(this.state.endTime) : "",
            },          
            url: 'api/'+localStorage.getItem('store')+'/'+'provider/instock',
            dataType: 'json',
            success: (result) => {
                this.setState({
                    loading: {unClearLoading: false, clearLoading: false}
                })
                if (result.code == '0') {
                    let source = result.data;
                    let records = [];
                    let maxDate = '', minDate = '';
                    source.map((record, index) => {
                        if (record.payState != 0) {
                            if (record.payState == 1) {
                                source[index].state = '未结清';
                            } else if (record.payState == 2) {
                                source[index].state = '待付款';
                            }
                            if (record.createDate) {
                                if (index == 0) {
                                    maxDate = record.createDate;
                                    minDate = record.createDate;
                                } else {
                                    if (record.createDate < minDate) {
                                        minDate = record.createDate;
                                    }
                                    if (record.createDate > maxDate) {
                                        maxDate = record.createDate;
                                    }
                                }
                            }
                            if (record.id) {
                                record.key = record.id;
                            }
                        }
                    })

                    minDate = minDate.slice(0, 10);
                    maxDate = maxDate.slice(0, 10);
                    this.setState({
                        unClearingRecords: source,
                        clearInfo: update(this.state.clearInfo, {
                            ['inStockDate']: { $set: minDate + '~' + maxDate },
                        }),
                        unclearPagination: {
                            pagenaSize : 5,
                            total: result.realSize
                        }
                    });
                } else {
                    message.warning(result.msg, 1.5);
                }
            },
            error: (requestObj, error, obj) => {
                this.setState({
                    loading: {unClearLoading: false, clearLoading: false}
                })
                message.warning('网络错误！', 1.5);
            }
        });
    }

    selectClearingTime = (date, dateStrings) => {
        this.setState({
            startTime: dateStrings[0] == "" ? "" : new Date(dateStrings[0]),
            endTime: dateStrings[1] == "" ? "" : new Date(dateStrings[1])
        }, () => {this.getUnCliearingRecord(1, 5)})
    }

    handleOk = () => {
        const clearInfo = this.state.clearInfo;
        if (clearInfo.clearAmount && clearInfo.clearInfo < 0) {
            message.warning('请输入清算金额！', 1.5);
            return;
        }

        $.ajax({
            type: 'POST',
            data: {
                providerId: this.props.params.providerId,
                adminId: localStorage.getItem('userId'),
                inStockDate: this.state.clearInfo.inStockDate,
                clearAmount: this.state.clearInfo.clearAmount,
                inventoryOrderIds: this.state.selectedIds,
            },
            url: 'api/'+localStorage.getItem('store')+'/'+'provider/clear',
            traditional: true,
            dataType: 'json',
            success: (result) => {
                this.setState({
                    loading: update(this.state.loading, { ['unClearLoading']: { $set: false } })
                })
                if (result.code == '0') {
                    this.setState({
                        visible: false,
                        clearInfo: update(this.state.clearInfo, { ['clearAmount']: { $set: 0 }, ['discount']: { $set: 100 }, ['isPercentage']: { $set: false} })
                    })
                    message.success('清算成功', 1.5);
                    
                    this.getUnCliearingRecord(1, 5);
                    this.getClearHistory(1, 5);
                } else {
                    message.warning(result.msg, 1.5);
                }
            },
            error: (requestObj, error, obj) => {
                this.setState({
                    loading: update(this.state.loading, { ['unClearLoading']: { $set: false } })
                })
                message.warning('网络错误！', 1.5);
            }
        });
    }

    handleCancel = () => {
        this.setState({
            visible: false,
            clearInfo: update(this.state.clearInfo, { ['clearAmount']: { $set: 0 }, ['discount']: { $set: 100 }, ['isPercentage']: { $set: false} })
        })
    }

    modeShow = () => {
        if (this.state.selectedIds.length <= 0) {
            message.warning('无可清算单据', 1.5);
            return;
        }
        this.setState({
            visible: true
        })
    }

    handelInputChnange = (type, value) => {
        if (type == 'discount' || type == 'clearAmount') {
            const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
            if (!((!isNaN(value) && reg.test(value)) || value === '' || value === '-')) {
                return;
            }
            if (type == 'discount') {
                if (value > 100 || value < 0) {
                    return;
                }
            }
        }
        if (type == 'isPercentage') {
            const isPercentage = value.target.checked;
            const clearInfo = this.state.clearInfo;
            if (!isPercentage) {
                this.setState({
                    clearInfo: update(this.state.clearInfo, { ['discount']: { $set: 100 }, ['isPercentage']: { $set: isPercentage } })
                })
            } else {
                this.setState({
                    clearInfo: update(this.state.clearInfo, { ['isPercentage']: { $set: isPercentage }, ['clearAmount']: { $set: this.state.clearInfo.needPayAmount } })
                })
            }
        } else {
            if (type == 'discount') {
                let clearAmount = 0;
                clearAmount = (this.state.clearInfo.needPayAmount * value / 100).toFixed(2);
                this.setState({
                    clearInfo: update(this.state.clearInfo, { ['clearAmount']: { $set: clearAmount }, [type]: { $set: value } })
                })
            } else if (type == 'clearAmount') {
                let discount = 0;
                discount = (value / this.state.clearInfo.needPayAmount).toFixed(2) * 100;
                this.setState({
                    clearInfo: update(this.state.clearInfo, { ['discount']: { $set: discount }, [type]: { $set: value } })
                })
            }
        }
    }

    handleTableChange = (type, pagination) => {
        if(type == 'clear') {
            const pager = { ...this.state.clearPagination };
            pager.current = pagination.current;
            this.setState({
                pagination: pager
            })
            this.getClearHistory(pagination.current, 5)
        } else if (type == 'unclear') {
            const pager = { ...this.state.unclearPagination };
            pager.current = pagination.current;
            this.setState({
                pagination: pager
            })
            this.getUnCliearingRecord(pagination.current, 5)
        }
        
    }
    
    render() {
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                
                let selectedIds = [], totalPrice = 0, needPayAmount = 0
                for (let item of selectedRows) {
                    selectedIds.push(item.id);
                    if (item.totalPrice && item.totalPrice > 0) {
                        totalPrice += item.totalPrice;
                    }
                    if(item.needPayAmount && item.needPayAmount > 0) {
                        needPayAmount += item.needPayAmount;
                    }
                }
                this.setState({
                    selectedRowKeys: selectedRowKeys,
                    selectedIds: selectedIds,
                    clearInfo: update(this.state.clearInfo, {
                        ['totalPrice']: { $set: totalPrice },
                        ['needPayAmount']: { $set: needPayAmount },
                    })
                })
            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User',    // Column configuration not to be checked
            }),
        }, plateOptions = [...new Set(this.state.options)].map((item, index) => {
            return <Option key={index} value={item + ''}>{item}</Option>
        });
        return <div>
            <BreadcrumbCustom first="进销存管理" second="供应商详细" />
            <Card style={{ marginBottom: '10px' }}>
                <Row style={{ marginBottom: '20px' }}>
                    <Col span="8">
                        供应商名称：{this.state.providerInfo.name ? this.state.providerInfo.name : ''}
                    </Col>
                    <Col span="8">
                        联系人：{this.state.providerInfo.contactName ? this.state.providerInfo.contactName : ''}
                    </Col>
                    <Col span="8">
                        手机号码：{this.state.providerInfo.phone ? this.state.providerInfo.phone : ''}
                    </Col>
                </Row>
                <Row>
                    <Col span="8">
                        座机号码：{this.state.providerInfo.landline ? this.state.providerInfo.landline : ''}
                    </Col>
                    <Col span="8">
                        邮箱地址：{this.state.providerInfo.email ? this.state.providerInfo.email : ''}
                    </Col>
                    <Col span="8">
                        联系地址：{this.state.providerInfo.address ? this.state.providerInfo.address : ''}
                    </Col>
                </Row>
            </Card>
            <Modal
                title="库存清算"
                maskClosable={false}
                visible={this.state.visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
            >
                <Row gutter={16} style={{ marginBottom: '10px' }}>
                    <Col span={8} style={{ textAlign: 'right' }}>
                        供应商：
                    </Col>
                    <Col span={8} >
                        <span>{this.state.providerInfo.name ? this.state.providerInfo.name : ''}</span>
                    </Col>
                </Row>

                <Row gutter={16} style={{ marginBottom: '10px' }}>
                    <Col span={8} style={{ textAlign: 'right' }}>
                        入库日期：
                            </Col>
                    <Col span={8}>
                        <span>{this.state.clearInfo.inStockDate}</span>
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: '10px' }}>
                    <Col span={8} style={{ textAlign: 'right' }}>
                        合计金额：
                    </Col>

                    <Col span={8}>
                        <span>{this.state.clearInfo.totalPrice}</span>
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: '10px' }}>
                    <Col span={8} style={{ textAlign: 'right' }}>
                        未清算金额：
                    </Col>
                    <Col span={8}>
                        <span>{this.state.clearInfo.needPayAmount}</span>
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: '10px' }}>
                    <Col span={8} style={{ textAlign: 'right' }}>
                        <Checkbox checked={this.state.clearInfo.isPercentage} onChange={(e) => this.handelInputChnange('isPercentage', e)} style={{ marginTop: '3px' }}>按百分比  :</Checkbox>
                    </Col>
                    <Col span={8}>
                        <Input disabled={!this.state.clearInfo.isPercentage} style={{ width: '60px' }} value={this.state.clearInfo.discount} onChange={(e) => { this.handelInputChnange('discount', e.target.value) }} /> &nbsp; %
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: '10px' }}>
                    <Col span={8} style={{ textAlign: 'right' }}>
                        本次清算：
                    </Col>
                    <Col span={8}>
                        <Input value={this.state.clearInfo.clearAmount} onChange={(e) => { this.handelInputChnange('clearAmount', e.target.value) }} />
                    </Col>
                </Row>
            </Modal>
            <Card style={{ marginBottom: '10px' }}>
                <div>请选择单据时间：
                    <RangePicker
                        format={dateFormat}
                        onChange={this.selectClearingTime}
                    />
                </div>
                <Table rowSelection={rowSelection} pagination={this.state.unclearPagination} loading={this.state.loading.unClearLoading} style={{ marginTop: '20px' }} bordered columns={columns1} dataSource={this.state.unClearingRecords} onChange={(pagination) => this.handleTableChange('unclear', pagination)} />
                <div style={{ textAlign: 'right', marginTop: '20px' }}><Button type="primary" style={{ marginRight: '20px' }} onClick={() => this.modeShow()} size={'large'}>清算</Button></div>
            </Card>
            <Card>
                <div>清算记录：
                </div>
                <Table loading={this.state.loading.clearLoading} style={{ marginTop: '20px' }} bordered pagination={this.state.clearPagination} columns={columns2} dataSource={this.state.clearingRecords} onChange={(pagination) => this.handleTableChange('clear', pagination)}/>
            </Card>
        </div>
    }
}

export default ProviderDetail