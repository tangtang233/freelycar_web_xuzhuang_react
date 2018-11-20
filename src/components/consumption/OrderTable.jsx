import React from 'react';
import { Row, Col, Card, Table, Select, InputNumber, Input, Button, Icon, Modal, DatePicker } from 'antd';
import { Link } from 'react-router';
import update from 'immutability-helper'
import $ from 'jquery'
import moment from 'moment';

let webSocket;
class OrderTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            option: [],
            finishModal: false,
            reverseModal: false,
            consumOrder: {
                consumOrderId: null,
                index: null
            },
            reverseCar: {
                finishTime: moment()._d,
                comment: ''
            },
            data: this.props.data,
            finishWork: {
                finishTime: moment()._d,
                parkingLocation: '',
                comment: ''
            }
        }
    }

    componentDidMount() {
        console.log(window.webSocketUrl);
        webSocket = new WebSocket(window.webSocketUrl)
        this.openSocket();
    }
    
    componentWillUnmount() {
        webSocket.close();
    }

    openSocket = () => {
        if (webSocket !== undefined && webSocket.readyState !== WebSocket.CLOSED) {
            console.log("WebSocket is already opened.");
        }
        webSocket.onopen = function (event) {
            if (event.data === undefined) {
                return;
            }
        };
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            data: newProps.data
        })
    }


    openFinishModal = () => {
        this.setState({
            finishModal: true
        })
    }

    finishWork = (e) => {
        this.setState({
            finishModal: false
        });

        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'order/finish',
            type: 'post',
            dataType: 'json',
            data: {
                consumOrderId: this.state.consumOrder.consumOrderId,
                date: this.state.finishWork.finishTime,
                comment: this.state.finishWork.comment,
                parkingLocation: this.state.finishWork.parkingLocation
            },
            success: (res) => {
                if (res.code == '0') {
                    let dataSource = this.state.data
                    res.data.key = res.data.id
                    dataSource.splice(this.state.consumOrder.index, 1, res.data)
                    webSocket.send(JSON.stringify({
                        id: res.data.id,
                        message: {type: "finishWork"}
                    }));
                    this.setState({
                        data: dataSource,
                        finishWork: update(this.state.finishWork, { parkingLocation: { $set: '' } })
                    })
                }
            }
        })
    }

    setTime = (key, value) => {
        console.log(value)
        this.setState(update(this.state, { [key]: { finishTime: { $set: value._d } } }))
    }

    onValueChange = (key, value) => {
        this.setState({
            finishWork: update(this.state.finishWork, { [key]: { $set: value } })
        })
    }

    onInfoChange = (key, value) => {
        this.setState({
            reverseCar: update(this.state.reverseCar, { [key]: { $set: value } })
        })
    }

    reverseCar = () => {
        this.setState({ reverseModal: false })
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'order/deliver',
            type: 'post',
            data: {
                consumOrderId: this.state.consumOrder.consumOrderId,
                date: this.state.reverseCar.finishTime,
                comment: this.state.reverseCar.comment
            },
            dataType: 'json',
            success: (res) => {
                if (res.code == '0') {
                    let dataSource = this.state.data
                    res.data.key = res.data.id
                    dataSource.splice(this.state.consumOrder.index, 1, res.data)
                    this.setState({
                        data: dataSource
                    })
                }
            }
        })
    }

    render() {
        const columns = [
            {
                title: '单据编号', dataIndex: 'id', key: 'id', render: (text, record, index) => {
                    return <div><Link to={`/app/consumption/ordermanage/${text}`}>{text}</Link></div>
                }
            },
            { title: '车牌号码', dataIndex: 'licensePlate', key: 'licensePlate' },
            {
                title: '车辆状态', dataIndex: 'state', key: 'state',
                render: (text, record, index) => {
                    let innertext = ''
                    if (text == 1) {
                        innertext = '已接车'
                    } else if (text == 2) {
                        innertext = '已完工'
                    } else if (text == 3) {
                        innertext = ' 已交车'
                    }
                    return <span>{innertext}</span>
                }
            },
            { title: '停车位置', dataIndex: 'parkingLocation', key: 'parkingLocation' },
            { title: '接车时间', dataIndex: 'pickTime', key: 'pickTime' },
            { title: '完工时间', dataIndex: 'finishTime', key: 'finishTime' },
            { title: '交车时间', dataIndex: 'deliverTime', key: 'deliverTime' },
            {
                title: '结算状态', dataIndex: 'payState', key: 'payState',
                render: (text, record, index) => {
                    return <span>{text == 1 ? '已结算' : '未结算'}</span>
                }
            },
            {
                title: '操作', dataIndex: 'operation', key: 'operation', render: (text, record, index) => {
                    let innertext = ''
                    if (record.payState == 0) {
                        switch (record.state) {
                            case 1: innertext = <Row gutter={8}>
                                    <Col className="gutter-row" span={12}>
                                    <a href="javascript:void(0);" onClick={() => this.setState({ finishModal: true, consumOrder: { consumOrderId: record.id, index: index } })}>完工</a>
                                    </Col>
                                    <Col className="gutter-row" span={12}>
                                    <Link to={`/app/consumption/order/${record.id}`}>修改</Link>
                                    </Col>
                                </Row>;
                                break;
                            case 2: innertext = <Row gutter={8}>
                                    <Col className="gutter-row" span={12}>
                                    <Link to={`/app/consumption/costclose/${record.id}`}>结算</Link>
                                    </Col>
                                    <Col className="gutter-row" span={12}>
                                    <a href="javascript:void(0);" onClick={() => this.setState({ reverseModal: true, consumOrder: { consumOrderId: record.id, index: index } })}>交车</a>
                                    </Col>
                                </Row>;
                                break;
                            case 3: innertext = <Link to={`/app/consumption/costclose/${record.id}`} >结算</Link>;
                                break;
                        }
                    } else {
                        switch (record.state) {
                            case 1: innertext =  <a href="javascript:void(0);"  onClick={() => this.setState({ finishModal: true, consumOrder: { consumOrderId: record.id, index: index } })}>完工</a>;  
                                break;
                            case 2: innertext = <a href="javascript:void(0);" onClick={() => this.setState({ reverseModal: true, consumOrder: { consumOrderId: record.id, index: index } })}>交车</a>;
                                break;
                            case 3: innertext = <Link to={`/app/consumption/ordermanage/${record.id}`} >
                                <span>查看</span>
                            </Link>;
                                break;
                        }
                    }

                    return <span>
                        <span style={{ marginRight: '10px' }}>
                            {innertext}
                            {/* <Link to="">
                                <span style={{ marginLeft: '5px' }}> 修改 </span>
                            </Link> */}
                        </span>
                    </span>
                }
            },
        ]
        return (
            <div className="gutter-example">
                <Modal
                    title="交车"
                    visible={this.state.reverseModal}
                    maskClosable={false}
                    onOk={() => this.reverseCar()}
                    onCancel={() => this.setState({ reverseModal: false })}
                >
                    <Row gutter={16} style={{ marginBottom: '10px' }}>
                        <Col span={8} style={{ textAlign: 'right' }}>
                            交车时间：
                            </Col>
                        <Col span={8}>
                            <DatePicker
                                showTime
                                defaultValue={ moment()}
                                format="YYYY-MM-DD HH:mm:ss"
                                placeholder="选择时间"
                                onChange={(value) => this.setTime('reverseCar', value)}
                            />
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '10px' }}>
                        <Col span={8} style={{ textAlign: 'right' }}>
                            备注：
                            </Col>
                        <Col span={8}>
                            <Input type="textarea" rows={3} value={this.state.reverseCar.comment} onChange={(e) => this.onInfoChange('comment', e.target.value)} />
                        </Col>
                    </Row>
                </Modal>
                <Modal
                    title="完工"
                    visible={this.state.finishModal}
                    maskClosable={false}
                    onOk={() => this.finishWork()}
                    onCancel={() => this.setState({ finishModal: false })}
                >
                    <Row gutter={16} style={{ marginBottom: '10px' }}>
                        <Col span={8} style={{ textAlign: 'right' }}>
                            完工时间：
                            </Col>
                        <Col span={8}>
                            <DatePicker
                                showTime
                                defaultValue={moment()}
                                format="YYYY-MM-DD HH:mm:ss"
                                placeholder="选择时间"
                                onChange={(value) => this.setTime('finishWork', value)}
                            />
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '10px' }}>
                        <Col span={8} style={{ textAlign: 'right' }}>
                            停车位置：
                    </Col>
                        <Col span={8}>
                            <Input value={this.state.finishWork.parkingLocation} onChange={(e) => this.onValueChange('parkingLocation', e.target.value)} />
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '10px' }}>
                        <Col span={8} style={{ textAlign: 'right' }}>
                            备注：
                            </Col>
                        <Col span={8}>
                            <Input type="textarea" rows={3} value={this.state.finishWork.comment} onChange={(e) => this.onValueChange('comment', e.target.value)} />
                        </Col>
                    </Row>
                </Modal>
                <Row gutter={8}>
                    <div className="gutter-box">
                        <Card bordered>
                            <Table columns={columns} pagination={this.props.pagination} onChange={(pagination) => this.props.onChange(pagination)} dataSource={this.state.data} bordered></Table>
                        </Card>
                    </div>
                </Row>
            </div>
        )
    }
}
export default OrderTable