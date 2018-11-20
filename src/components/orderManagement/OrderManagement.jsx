import React from 'react';
import { Row, Col, Card, Button, Radio, DatePicker, Table, Input, Select, Icon, Modal, Popconfirm, message, Layout } from 'antd';
import $ from 'jquery';
import update from 'immutability-helper';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import moment from 'moment';
import "../../styles/global.less"
const { Header, Content } = Layout;
let webSocket;
class OrderManagement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            carCode: '',
            data: [],
            loading: false,
            consumOrder: {
                consumOrderId: null,
                index: null
            },
            finishModal: false,
            finishWork: {
                finishTime: moment(),
                parkingLocation: '',
                comment: ''
            }
        }
    }

    componentDidMount() {
        webSocket = new WebSocket(window.webSocketUrl)
        this.openSocket();
        this.getQuery();
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

        webSocket.onmessage =  (event) =>  {
            console.log(event);
            if (event.data )
                var data = JSON.parse(event.data)
                if(data.message && data.message.type && data.message.type == "finishWork") {
                console.log("query")
                this.getQuery();
            }
        };
    }

    socketSend = (json) => {
        webSocket.send(JSON.stringify(json));
    }

    getQuery = () => {
        this.setState({
            loading: true
        })
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'order/query',
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({
                consumOrder: {
                    id:'',
                    licensePlate: this.state.carCode,
                    programId: -1,
                    payState: -1,
                    clientId: -1,
                    state: 1
                },
                startDate: null,
                endDate: null,
                dateType: -1
            }),
            success: (result) => {
                this.setState({
                    loading: false
                });
                if (result.code == '0') {
                    let dataArray = result.data;
                    for (let item of dataArray) {
                        item.operator = (item.orderMaker && item.orderMaker.name) ? item.orderMaker.name : '';
                        item.key = item.id;

                        let projects = item.projects ? item.projects : [];
                        let projectNames = [];
                        projects.map((item, index) => {
                            if(item.name) {
                                projectNames.push(item.name);
                            }
                        });
                        item.programName = projectNames.toString();
                    }
                    this.setState({
                        data: dataArray
                    });
                } else {
                    message.error(result.msg);
                    this.setState({
                        data: []
                    });
                }
            }
        })
    }

    setTime = (key, value) => {
        this.setState(update(this.state, { [key]: { finishTime: { $set: value } } }));
    }

    onValueChange = (key, value) => {
        this.setState({
            finishWork: update(this.state.finishWork, { [key]: { $set: value } })
        });
    }

    finishWork = (e) => {
        this.setState({
            finishModal: false
        });
        this.setState({
            loading: true
        });

        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'order/finish',
            type: 'post',
            dataType: 'json',
            data: {
                consumOrderId: this.state.consumOrder.consumOrderId,
                date: new Date(this.state.finishWork.finishTime),
                comment: this.state.finishWork.comment,
                parkingLocation: this.state.finishWork.parkingLocation
            },
            success: (res) => {
                this.setState({
                    loading: false
                })
                if (res.code == '0') {
                    let dataSource = this.state.data;
                    res.data.key = res.data.id;
                    dataSource.splice(this.state.consumOrder.index, 1);
                    this.socketSend({
                        id: res.data.id,
                        message: {type: "finishWork"}
                    })
                    this.setState({
                        data: dataSource,
                        finishWork: update(this.state.finishWork, { parkingLocation: { $set: '' } })
                    });
                }
            }
        })
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
            title: '接单时间',
            dataIndex: 'createDate',
            key: 'createDate',
        }, {
            title: '车牌号',
            dataIndex: 'licensePlate',
            key: 'licensePlate'
        }, {
            title: '服务项目',
            dataIndex: 'programName',
            key: 'programName'
        }, {
            title: '服务人员',
            dataIndex: 'operator',
            key: 'operator'
        }, {
            title: '确认完工',
            key: 'action',
            render: (text, record, index) => {
                return (<span>
                    <a href="javascript:void(0);" style={{ marginRight: '15px' }} onClick={() => this.setState({ finishModal: true, consumOrder: { consumOrderId: record.id, index: index } })}>完工</a>
                </span>)
            }
        }];
        return (
            <Layout>
                <Header style={{ backgroundColor: '#fff', textAlign: 'center', fontSize: '24px' }}>
                    <img style={{ width: '126px', margin: '12.5px 0', height: '39px', position: 'absolute', left: '10px', verticalAlign: 'middle' }} src={require('../../styles/imgs/xiaoyiaiche2.png')} alt="" />
                    订单管理
                </Header>
                <Content>
                    <Card>
                        <Row>
                            <Col span={7}>
                                <div style={{ marginBottom: 16 }}>
                                    车牌号码：
                                    <Input style={{ width: '200px' }} value={this.state.carCode} onChange={(e) => { this.setState({ carCode: e.target.value }) }} />
                                </div>
                            </Col>
                            <Col span={2}>
                                <Button type="primary" onClick={() => { this.getQuery() }}>查询</Button>
                            </Col>
                        </Row>
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
                        <Table
                            loading={this.state.loading}
                            pagination={false}
                            columns={columns}
                            className="pad-table"
                            dataSource={this.state.data}
                            style={{fontSize: 100}}
                            bordered
                        />
                    </Card>
                </Content>
            </Layout>
        );

    }
}
export default OrderManagement