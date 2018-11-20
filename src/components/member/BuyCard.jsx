import React from 'react';
import { Link } from 'react-router';
import { Row, Col, Card, Table, Select, InputNumber, Input, Button, Icon, Popconfirm, Radio, Modal, message } from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import CardModal from '../productManage/CardModal.jsx';
import Regclient from './Regclient.jsx'
import CarBrand from '../model/CarBrand.jsx'
import update from 'immutability-helper';
import { hashHistory } from 'react-router'
import $ from 'jquery'
const RadioGroup = Radio.Group;
const Option = Select.Option,
    columns = [
        {
            title: '代金券名称',
            dataIndex: 'favour',
            key: 'name',
            render: (text, record, index) => {
                return <span>{text.name}</span>
            }
        }, {
            title: '有效期（月）',
            dataIndex: 'favour',
            key: 'validateTime',
            render: (text, record, index) => {
                return <span>{text.validTime}</span>
            }
        }, {
            title: '张数',
            dataIndex: 'count',
            key: 'count'
        }
    ]
class BuyCard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            id: '',
            isPop: false,
            carModal: false,
            visible2: false,
            carbrand: '',
            models: [],
            model: '',
            option: [],
            adminList: [],
            cardList: [],
            phoneclassName: "hidden",
            licensePlateClassName: "hidden",
            man: 'man',
            female: 'female',
            value: 1,
            vaild: '',
            typeId: '',
            haveClient: false,
            cardtype: '',
            actualPrice:'',
            cardNumber: '',
            actualPrice:'',
            type: [],
            price: '',
            orderMaker: '',
            serviceId: '',
            uid: 1,
            clientId: parseInt(this.props.params.id),
            form: {
                name: '',
                phone: '',
                birthday: '',
                gender: '',
                drivingLicense: '',
                idNumber: '',
                points: '',
            },
            cardType: {
                name: '',
                price: '',
                vaild: '',
                cardtype: '',
            },
            clientInfo: {
                name: '',
                phone: '',
                gender: '',
                recommendName: '',
                licensePlate: '',
            },
            carId: '',
            payMethod: '',
            visible: false,
            modifyData: {}
        }
    }

    onChange = (e) => {
        this.setState({
            value: e.target.value,
        });
    }
    componentDidMount() {
        // this.getCarBrand();
        this.getService();
        this.getStaff();
        let uid = localStorage.getItem("userId")
        this.setState({
            orderMaker: uid
        })
        this.props.router.setRouteLeaveHook(
            this.props.route,
            this.routerWillLeave
        )
    }
    routerWillLeave = (nextLocation) => {
        if (this.state.isPop) {
            return '确认要离开？';
        } else {
            return;
        }
    }
    getService = () => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'service/query',
            type: 'GET',
            data: {
                page: 1,
                number: 99,
            },
            success: (res) => {
                if (res.code == '0') {
                    this.setState({
                        cardList: res.data
                    })
                }
            }
        })
    }
    getStaff = () => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'admin/list',
            type: 'GET',
            data: {
                page: 1,
                number: 99,
            },
            success: (res) => {
                this.setState({
                    adminList: res.data,
                })
            }
        })
    }

    showModal = () => {
        this.setState({
            visible: true
        });
    }
    TypehandleChange = (value) => {
        this.setState({
            model: value
        })
    }
    CardhandleChange = (value) => {

        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'service/query',
            type: 'GET',
            data: {
                name: value,
                page: 1,
                number: 99,
            },
            success: (res) => {
                let cardtype = "";
                if (res.data[0].type == 0) {
                    cardtype = "次卡";
                } else if (res.data[0].type == 1) {
                    cardtype = "组合卡";
                } else if (res.data[0].type == 2){
                    cardtype = "储值卡";
                }
                for (let item of res.data[0].favourInfos) {
                    item.key = item.id
                }
                this.setState({
                    isPop: true,
                    favourInfos: res.data[0].favourInfos,
                    vaild: res.data[0].validTime,
                    price: res.data[0].price,
                    actualPrice:res.data[0].actualPrice,
                    cardtype: cardtype,
                    serviceId: res.data[0].id,
                })
            }
        })
    }
    CheckInfo = () => {
        var phonecheck = this.state.clientInfo.phone;
        var reg = /^1[3|4|5|7|8][0-9]{9}$/; //验证规则

        if (!reg.test(phonecheck)) {
            this.setState({
                phoneclassName: "display"
            })
            return false;
        } else {
            this.setState({
                phoneclassName: "hidden"
            })
            return true;
        }

    }
    licensePlateCheckInfo = () => {
        var licensePlatecheck = this.state.clientInfo.licensePlate;
        var re = /^[\u4e00-\u9fa5]{1}[A-Z]{1}[A-Z_0-9]{5}$/;
        if (!re.test(licensePlatecheck)) {
            this.setState({
                licensePlateClassName: "display"
            })
            return false
        } else {
            this.setState({
                licensePlateClassName: "hidden"
            })
            return true;
        }
    }
    SaveClient = () => {

        if (this.CheckInfo()) {
            if (this.licensePlateCheckInfo()) {
                let clientInfos = this.state.clientInfo;
                if (clientInfos.name && clientInfos.phone && this.state.carbrand && clientInfos.licensePlate) {
                    $.ajax({
                        type: 'post',
                        url: 'api/'+localStorage.getItem('store')+'/'+'client/add',
                        datatype: 'json',
                        contentType: 'application/json;charset=utf-8',
                        data: JSON.stringify({
                            name: clientInfos.name,
                            phone: clientInfos.phone,
                            gender: clientInfos.gender,
                            recommendName: clientInfos.recommendName,
                            cars: [{
                                //select选择
                                carMark: window.localStorage.getItem('carMark'),
                                carbrand: this.state.carbrand,
                                cartype: this.state.model,
                                licensePlate: clientInfos.licensePlate,
                            }]
                        }),
                        success: (res) => {
                            if (res.code == "0") {
                                this.setState({

                                    clientId: res.data.id,
                                    haveClient: true
                                });
                                message.success("保存成功")
                            } else {
                                message.error(res.msg)
                            }
                        }
                    })
                } else {
                    message.error("请把必填信息补充完整！")
                }
            }

        }


    }
    genderonChange = (e) => {
        this.setState({
            value: e.target.value,
        });
        this.state.clientInfo.gender = e.target.value
    }
    StaffhandleChange = (value) => {

        this.setState({
            orderMaker: parseInt(value)
        })
    }
    SaveCard = () => {
        this.setState({
            isPop: false,
        })
        if (this.state.serviceId) {
            if (this.state.haveClient == true) {
                $.ajax({
                    url: 'api/'+localStorage.getItem('store')+'/'+'pay/buycard',
                    type: 'POST',
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify({
                        clientId: this.state.clientId,
                        card: {
                            service: {
                                id: this.state.serviceId,
                            },
                            balance:this.state.actualPrice,
                            cardNumber: this.state.cardNumber,
                            orderMaker: { id: ((this.state.orderMaker == "") ? this.state.uid : this.state.orderMaker) },
                            payMethod: this.state.payMethod,
                        }
                    }),
                    success: (res) => {
                        if (res.code == '0') {
                            message.success('保存成功!');
                            hashHistory.push('/app/member/customer')
                        } else {
                            message.error(res.msg)
                        }
                    }
                })
            } else if (this.props.params.id) {
                $.ajax({
                    url: 'api/'+localStorage.getItem('store')+'/'+'pay/buycard',
                    type: 'POST',
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify({
                        clientId: this.state.clientId,
                        card: {
                            service: {
                                id: this.state.serviceId
                            },
                            cardNumber: this.state.cardNumber,
                            orderMaker: { id: this.state.orderMaker },
                            payMethod: this.state.payMethod,
                        }
                    }),
                    success: (res) => {
                        if (res.code == '0') {
                            message.success('保存成功!');
                            hashHistory.push('/app/member/customer')
                        } else {
                            message.error(res.msg)
                        }
                    }
                })
            } else {
                message.error('请先保存客户', 1.5);
            }
        } else {
            message.error("请选择要办理的卡", 1.5)
        }
    }


    onValueChange = (key, value) => {
        this.setState({
            clientInfo: update(this.state.clientInfo, { [key]: { $set: value } }),
            isPop: true,
        })
    }

    payhandleChange = (event) => {
        this.setState({
            payMethod: event
        })
    }

    handleChange = (e) => {
        let typelist
        this.state.option.map((item, index) => {
            if (item.id == e) {
                typelist = item.types
            }
        })
        this.setState({
            carId: e,
            type: typelist,
            //  type:""
            typeId: ''
        })
    }
    handleOk = () => {
        this.setState({
            visible: false
        });
        this.getService();
        //  message.success("保存成功",1)
    }
    handleCancel = () => {
        this.setState({
            visible: false
        });
    }
    handleCancel2 = () => {
        this.setState({
            carModal: false
        });
    }

    onVisible2Ok = () => {
        this.setState({
            visible2: false
        })
    }
    onVisible2Cancel = () => {
        this.setState({
            visible2: false
        })
    }


    saveCarData = (str, modelArray) => {
        this.setState({
            carbrand: str,
            models: modelArray
        })
    }
    render() {
        const CardOptions = this.state.cardList.map((item, index) => {
            return <Option key={item.id} value={item.name}>{item.name}</Option>
        }), StaffOptions = this.state.adminList.map((item, index) => {
            let staffId = item.id + '';
            return <Option key={staffId} value={staffId}>{item.name}</Option>
        }), typeOptions = this.state.models.map((item, index) => {
            return <Option key={index} value={item.model}>{item.model}</Option>
        })


        return (

            <div>

                <BreadcrumbCustom first="会员管理" second="会员办理" />
                {!this.props.params.id && <Card title='客户信息'  >
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={8} offset={4}><span style={{ color: "red" }}>*</span>客户姓名：
                            <Input style={{ width: '140px' }} value={this.state.clientInfo.name} onChange={(e) => this.onValueChange('name', e.target.value)} />

                        </Col>
                        <Col span={8}>性别：
                            <div style={{ display: 'inline-block', marginLeft: '26px' }}>
                                <RadioGroup onChange={(value) => this.genderonChange(value)} value={this.state.value}>
                                    <Radio value={'男'}>男</Radio>
                                    <Radio value={'女'}>女</Radio>
                                </RadioGroup>
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={8} offset={4}><span style={{ color: "red" }}>*</span>手机号:
                            <Input style={{ width: '140px', marginLeft: '21px' }} value={this.state.clientInfo.phone} onChange={(e) => this.onValueChange('phone', e.target.value)} />
                            <span style={{ color: "red", fontSize: "12px", verticalAlign: "middle", marginLeft: "10px" }} className={this.state.phoneclassName}>手机号码格式有误</span>
                        </Col>
                        <Col span={8} ><span style={{ color: "red", marginLeft: "-5px" }}>*</span>车牌号：
                            <Input style={{ width: '140px', marginLeft: '14px' }} value={this.state.clientInfo.licensePlate} onChange={(e) => this.onValueChange('licensePlate', e.target.value)} />
                            <span style={{ color: "red", fontSize: "12px", verticalAlign: "middle", marginLeft: "10px" }} className={this.state.licensePlateClassName}>车牌号格式有误</span>
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={8} offset={4} id="car-brand"><span style={{ color: "red" }}>*</span>品牌车系:
                        <span style={{ marginLeft: '10px' }}>{this.state.carbrand}</span>
                            {this.state.carbrand == '' && <Icon type="plus-circle-o" style={{ fontSize: 20, color: '#08c' }} onClick={() => { this.setState({ carModal: true }) }} />}
                            {this.state.carbrand != '' && <Icon type="close-circle-o" style={{ marginLeft: '10px', fontSize: 16, color: '#08c' }} onClick={() => { this.setState({ carModal: true }) }} />}
                            {this.state.carModal && <CarBrand handleOk={() => { this.setState({ carModal: false }) }} saveCarData={this.saveCarData} handleCancel={this.handleCancel2} visible={this.state.carModal} />}
                        </Col>

                        <Col span={8} >推荐人：
                            <Input style={{ width: '140px', marginLeft: '15px' }} value={this.state.clientInfo.recommendName} onChange={(e) => this.onValueChange('recommendName', e.target.value)} />
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={8} offset={4} id="provider-area">车辆型号:
                        <Select showSearch
                                style={{ width: '150px', marginLeft: '10px' }}
                                placeholder="请选择车辆型号"
                                optionFilterProp="children"
                                dropdownMatchSelectWidth={false}
                                allowClear={true}
                                onChange={this.TypehandleChange}
                                filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                            >
                                {typeOptions}
                            </Select>
                        </Col>
                    </Row>
                    <Row>
                        <Col offset={18}><Button type="primary" onClick={this.SaveClient} >保存</Button></Col>
                    </Row>

                </Card>}

                {this.props.params.id && <Regclient clientId={this.state.clientId} style={{ display: 'none' }}></Regclient>}

                <Card title="会员信息" style={{ marginTop: '15px' }}  >

                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={8} offset={4}>会员卡号：
                            <Input style={{ width: '140px', marginLeft: '14px' }} value={this.state.cardNumber} onChange={(e) => { this.setState({ cardNumber: e.target.value }) }} />
                        </Col>
                        {this.state.cardtype=='储值卡'&&<Col span={8} >卡面金额：
                            <Input style={{ width: '140px', marginLeft: '14px', color: 'red' }} value={this.state.actualPrice == '' ? '' : this.state.actualPrice + '元'} disabled />
                        </Col>}
                    </Row>

                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={8} offset={4}>
                            会员卡类：
                        <Select
                                style={{ width: '140px', marginLeft: '13px', maxHeight: '150px' }}
                                optionFilterProp="children"
                                allowClear={true}
                                onChange={(value) => this.CardhandleChange(value)}
                                filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                            >
                                {CardOptions}
                            </Select>
                            <Icon type="plus-circle-o" onClick={this.showModal} style={{ marginLeft: '10px', color: '#108ee9', cursor: 'pointer' }} />
                            <span style={{ marginLeft: '10px', color: '#108ee9', cursor: 'pointer' }} onClick={() => { this.setState({ visible2: true }) }}>查看赠送券</span>
                            <Modal
                                title={'查看优惠券'}
                                visible={this.state.visible2}
                                maskClosable={false}
                                onOk={() => this.onVisible2Ok()}
                                footer={null}
                                onCancel={() => this.onVisible2Cancel()}
                                width='50%' >
                                <Table
                                    columns={columns}

                                    dataSource={this.state.favourInfos}
                                    bordered
                                />
                            </Modal>

                        </Col>
                        <Col span={8} >售卡金额：
                            <Input style={{ width: '140px', marginLeft: '14px', color: 'red' }} value={this.state.price == '' ? '' : this.state.price + '元'} disabled />
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={8} offset={4}>有效期：
                            <Input style={{ width: '140px', marginLeft: '25px', color: 'red' }} value={this.state.vaild == '' ? '' : this.state.vaild + '年'} disabled />
                        </Col>
                        <Col span={8} >会员卡种：
                             <Input style={{ width: '140px', marginLeft: '15px', color: 'red' }} value={this.state.cardtype} disabled />
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={8} offset={4} >
                            <div style={{ display: 'inline-block', width: '80%' }}>支付方式:
                                 <div style={{ display: 'inline-block', marginLeft: '12px' }}>
                                    <Select defaultValue="现金" style={{ width: 140, marginLeft: 10, maxHeight: '100px' }} onChange={(value) => this.payhandleChange(value)} >
                                        <Option value="0">现金</Option>
                                        <Option value="1">刷卡</Option>
                                        <Option value="2">支付宝</Option>
                                        <Option value="3">微信</Option>
                                        <Option value="4">易付宝</Option>
                                    </Select>
                                </div>
                            </div>
                        </Col>
                        <Col span={8} id='staff'>
                            <div style={{ display: 'inline-block', width: '80%' }}>办理人员:
                                 <div style={{ display: 'inline-block', marginLeft: '105x' }}>
                                    <Select showSearch
                                        style={{ width: '140px', marginLeft: '25px' }}
                                        placeholder="选择办卡人员"
                                        optionFilterProp="children"
                                        allowClear={true}
                                        onChange={(value) => this.StaffhandleChange(value)}
                                        filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                                        getPopupContainer={() => document.getElementById('staff')}
                                    >
                                        {StaffOptions}
                                    </Select>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card>
                <CardModal visible={this.state.visible} onOk={this.handleOk} modifyData={this.state.modifyData}
                    onCancel={this.handleCancel}>
                </CardModal>
                <Button type="primary" style={{ display: 'block', margin: '10px auto', width: '100px', height: '50px' }} size={'large'} onClick={() => this.SaveCard()}>办理</Button>
            </div >
        )
    }
}
export default BuyCard