import React from 'react';
import CustomerInfo from '../forms/CustomerInfo.jsx';
import ServiceTable from '../tables/ServiceTable.jsx';
import PartsDetail from '../tables/PartsDetail.jsx';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import { hashHistory } from 'react-router'
import $ from 'jquery';
import PreFixInterge from '../../utils/PreFixInterge.js'
import { Row, Col, Card, Button, Input, Steps, Table, Icon } from 'antd';
const Step = Steps.Step;
const serviceColumns = [{
    title: '序号', dataIndex: 'index', key: 'index', render: (text, record, index) => {
        return <span>{index + 1}</span>
    }
}, {
    title: '',
    dataIndex: 'total',
    key: 'total',
}, {
    title: '项目名称',
    dataIndex: 'project',
    key: 'project',
}, {
    title: '项目价格',
    dataIndex: 'Itemprice',
    key: 'Itemprice',
}, {
    title: '单项小计',
    dataIndex: 'price',
    key: 'price',
}, {
    title: '施工人员',
    dataIndex: 'StaffName',
    key: 'StaffName',

}, {
    title: '使用卡券',
    dataIndex: 'CardNum',
    key: 'CardNum',
}, {
    title: '扣除次数',
    dataIndex: 'DeductionCardTime',
    key: 'DeductionCardTime',
}]
const fixColumns = [{
    title: '序号', dataIndex: 'index', key: 'index', render: (text, record, index) => {
        return <span>{index + 1}</span>
    }
}, {
    title: '',
    dataIndex: 'total',
    key: 'total',
}, {
    title: '项目名称',
    dataIndex: 'project',
    key: 'project',
}, {
    title: '项目价格',
    dataIndex: 'Itemprice',
    key: 'Itemprice',
}, {
    title: '单项小计',
    dataIndex: 'price',
    key: 'price',
}, {
    title: '数量',
    dataIndex: 'number',
    key: 'number',
}, {
    title: '参考工时',
    dataIndex: 'worktime',
    key: 'worktime',
}, {
    title: '工时单价',
    dataIndex: 'singlePrice',
    key: 'singlePrice',
}, {
    title: '施工人员',
    dataIndex: 'StaffName',
    key: 'StaffName',
}, {
    title: '单项小计',
    dataIndex: 'singleSummation',
    key: 'singleSummation',
}, {
    title: '使用卡券',
    dataIndex: 'CardNum',
    key: 'CardNum',
}, {
    title: '扣除次数',
    dataIndex: 'DeductionCardTime',
    key: 'DeductionCardTime',
}]
const partsDetail = [
    {
        title: '序号', dataIndex: 'index', key: 'index', render: (text, record, index) => {
            return <span>{index + 1}</span>
        }
    }, {
        title: '',
        dataIndex: 'total',
        key: 'total',
    }, {
        title: '配件名称',
        dataIndex: 'partName',
        key: 'partName',
    }, {
        title: '配件品牌',
        dataIndex: 'brand',
        key: 'brand',
    }, {
        title: '规格',
        dataIndex: 'specification',
        key: 'specification',
    }, {
        title: '属性',
        dataIndex: 'attribute',
        key: 'attribute',
    }, {
        title: '配件价格',
        dataIndex: 'price',
        key: 'price',
    }, {
        title: '可用库存',
        dataIndex: 'inventory',
        key: 'inventory',
    }, {
        title: '数量',
        dataIndex: 'number',
        key: 'number',
    }, {
        title: '单项合计',
        dataIndex: 'singleSummation',
        key: 'singleSummation',
    }
]


class BeautyDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            current: 2,
            programId: 0,
            faultDesc: '',
            repairAdvice: '',
            totalPrice: '',
            sumPrice: 0,
            fixsumPrice: 0,
            inventoryPrice: 0,
            payState: 0,
            serviceData: [],
            fixData: [],
            actualPrice: 0,
            inventoryData: [],
            form: {
                orderMaker: '',
                licensePlate: '',
                carType: '',
                brand: '',
                lastMiles: '',
                Miles: '',
                name: '',
                phone: '',
                //  drivingLicense: '',
                parkingLocation: '',
                createDate: '',
                deliverTime: '',
                finishTime: '',
                staffs: ''
            },
            partsDetailData: [{
                key: 1,
                index: 1,
                partName: '洗车',
                price: '20.00',
                number: '20',
                singleSummation: '20',
                DeductionCardTime: '1'
            }, {
                key: '',
                index: '',
                total: '合计',
                singleSummation: '20',
                DeductionCardTime: '1'
            }],

        }
    }
    componentDidMount() {
        this.GetClientInfo();
    }

    onclick = () => {
        hashHistory.push(`/app/consumption/costclose/${this.props.params.orderId}`)
    }
    onreturn = () => {
        hashHistory.push('/app/consumption/orderManage?from=xq')
    }

    GetClientInfo() {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'order/queryid',
            dataType: 'json',
            type: 'GET',
            contentType: 'application/json;charset=utf-8',
            data: {
                consumOrderId: this.props.params.orderId
            },
            success: (res) => {
                var sumprice = 0;
                var fixsumprice = 0;
                var inventoryprice = 0;
                let obj = res.data;
                let objservice = obj.projects;
                let objinventory = obj.inventoryInfos;
                let totalPrice = obj.totalPrice;
                let stateType = obj.state;
                let programId = obj.programId;
                let faultDesc = obj.faultDesc;
                let repairAdvice = obj.repairAdvice;
                let createDate = obj.createDate;
                let staffList = obj.projects.staffs;
                let orderMaker = obj.orderMaker.name;
                let licensePlate = obj.licensePlate;
                let carType = obj.carType;
                let brand = obj.carBrand;
                let lastMiles = obj.lastMiles;
                let Miles = obj.miles;
                let name = obj.clientName;
                let phone = obj.phone;

                let parkingLocation = obj.parkingLocation;
                let pickTime = obj.pickTime;
                let finishTime = (obj.finishTime) ? obj.finishTime : "未完工";

                let deliverTime = (obj.deliverTime) ? obj.deliverTime : "未交车";
                let staffString = ''
                // for (let i = 0; i < staffList.length; i++) {
                //      staffString += staffList[i].name + ' 、 ';

                //  }    
                staffString = staffString.substring(0, staffString.length - 2)
                let serviceList = [];
                let fixList = [];
                let inventoryList = [];

                for (let i = 0; i < objinventory.length; i++) {
                    var inventoryprice = inventoryprice + objinventory[i].inventory.price * objinventory[i].number;
                    let inventoryItem = {
                        key: objinventory[i].inventory.id,
                        id: objinventory[i].inventory.id,
                        partName: objinventory[i].inventory.name,
                        brand: objinventory[i].inventory.brandName,
                        specification: objinventory[i].inventory.standard,
                        attribute: objinventory[i].inventory.property,
                        price: objinventory[i].inventory.price,
                        inventory: objinventory[i].inventory.amount,
                        number: objinventory[i].number,
                        singleSummation: objinventory[i].inventory.price * objinventory[i].number,
                    }
                    inventoryList.push(inventoryItem)
                }
                this.setState({
                    inventoryData: inventoryList,
                    totalPrice: totalPrice, 
                    actualPrice: res.data.actualPrice +res.data.actualPrice1,
                    inventoryPrice: inventoryprice,
                    payState: obj.payState,
                })
                var inventorylist = this.state.inventoryData;
                let inventoryTable = {
                    key: '',
                    total: '合计',
                    singleSummation: this.state.inventoryPrice,

                }
                if (objinventory.length > 0) {

                    inventorylist.push(inventoryTable)
                    this.setState({
                        inventoryData: inventorylist,

                    })
                }

                for (let i = 0; i < objservice.length; i++) {
                    var sumprice = sumprice + objservice[i].price;
                    var fixsumprice = fixsumprice + (objservice[i].price + objservice[i].referWorkTime * objservice[i].pricePerUnit);
                    let staffList = objservice[i].staffs;
                    let staffString = ''
                    for (let i = 0; i < staffList.length; i++) {
                        staffString += staffList[i].name + ' 、 ';

                    }
                    let serviceItem = {
                        key: objservice[i].id,
                        id: objservice[i].id,
                        project: objservice[i].name,
                        Itemprice: objservice[i].price,
                        price: objservice[i].price,
                        StaffName: staffString.substring(0, staffString.length - 2),
                        CardNum: objservice[i].cardId ? (objservice[i].cardId != '0' ? (objservice[i].cardName + '--' + objservice[i].cardNumber) : (objservice[i].favourName == '' ? '-' : objservice[i].favourName)) : '无',
                        DeductionCardTime: objservice[i].payCardTimes,
                    }

                    let fixItem = {
                        key: objservice[i].id,
                        id: objservice[i].id,
                        project: objservice[i].name,
                        number: '1',
                        Itemprice: objservice[i].price,
                        price: objservice[i].price,
                        StaffName: staffString.substring(0, staffString.length - 2),
                        worktime: objservice[i].referWorkTime,
                        singlePrice: objservice[i].pricePerUnit,
                        singleSummation: objservice[i].price + objservice[i].referWorkTime * objservice[i].pricePerUnit,
                        CardNum: objservice[i].cardId != '0' ? (objservice[i].cardName + '--' + objservice[i].cardNumber) : (objservice[i].favourName == '' ? '-' : objservice[i].favourName),
                        DeductionCardTime: objservice[i].payCardTimes,
                    }
                    serviceList.push(serviceItem);
                    fixList.push(fixItem);
                    if (serviceList.length == objservice.length) {
                        //    serviceList.push({ sumTable })
                        this.setState({
                            serviceData: serviceList,
                            fixData: fixList,
                            sumPrice: sumprice,
                            fixsumPrice: fixsumprice
                        })

                    }
                    this.setState({
                        current: stateType,
                        programId: programId,
                        repairAdvice: repairAdvice,
                        faultDesc: faultDesc,
                        form: {
                            orderMaker: orderMaker,
                            licensePlate: licensePlate,
                            carType: carType,
                            brand: brand,
                            lastMiles: lastMiles,
                            Miles: Miles,
                            createDate: createDate,
                            name: name,
                            phone: phone,
                            // drivingLicense: '',

                            parkingLocation: parkingLocation,
                            pickTime: pickTime,
                            finishTime: finishTime,
                            deliverTime: deliverTime,
                            staffs: staffString,
                        },

                    })
                }

                var servicelist = this.state.serviceData;
                var fixlist = this.state.fixData;
                let sumTable = {
                    key: '',

                    total: '合计',
                    price: this.state.sumPrice,
                }
                let fixsumTable = {
                    key: '',

                    total: '合计',
                    singleSummation: this.state.fixsumPrice,
                }
                if (objinventory.length > 0) {
                    servicelist.push(sumTable)
                    fixlist.push(fixsumTable)
                    this.setState({
                        serviceData: servicelist,
                        fixData: fixlist
                    })
                }
            }
        })

    }
    render() {
        return <div>
            <BreadcrumbCustom first="消费开单" second="单据详情" />
            <Card style={{ marginBottom: '10px' }}>当前状态：
                <Steps current={this.state.current}>
                    <Step title="接车" />
                    <Step title="完成" />
                    <Step title="交车" />
                </Steps>
            </Card>
            <CustomerInfo form={this.state.form} />
            {this.state.programId == 2 && <Card style={{ marginBottom: '10px' }}>
                <h3>故障描述：</h3>
                <p>{this.state.faultDesc}</p>
                <h3>维修建议：</h3>
                <p>{this.state.repairAdvice}</p>
            </Card>
            }
            {this.state.programId == 1 && <Card style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '18px', marginBottom: '10px', fontSize: '16px' }}>服务项目</div>
                <Table className="accountTable" columns={serviceColumns} dataSource={this.state.serviceData} bordered />
            </Card>}
            {this.state.programId == 2 && <Card style={{ marginBottom: '10px', fontSize: '16px' }}>
                <div style={{ fontSize: '18px', marginBottom: '10px' }}>服务项目</div>
                <Table className="accountTable" columns={fixColumns} pagination={false} dataSource={this.state.fixData} bordered />
            </Card>}
            <Card style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '18px', marginBottom: '10px', fontSize: '16px' }}>配件明细</div>
                <Table className="accountTable" columns={partsDetail} pagination={false} dataSource={this.state.inventoryData} bordered />
            </Card>
            <Card>
                <div style={{ textAlign: 'right' }}>
                    整单金额
                <span style={{ margin: '0 10px', color: 'red', fontWeight: 'bold', fontSize: '20px' }}>{this.state.totalPrice}</span>
                    元
                </div>
                {this.state.payState == 1 && <div style={{ textAlign: 'right' }}>
                    实收金额
                <span style={{ margin: '0 10px', color: 'red', fontWeight: 'bold', fontSize: '20px' }}>{this.state.actualPrice}</span>
                    元
                </div>}
            </Card>
            {this.state.payState == 0 && <Button type="primary" style={{ float: 'right', margin: '10px', width: '100px', height: '50px' }} size={'large'} onClick={() => this.onclick(true)}>结算</Button>}
            {this.state.payState == 1 && <Button type="primary" style={{ float: 'right', margin: '10px', width: '100px', height: '50px' }} size={'large'} onClick={() => this.onreturn()}>返回</Button>}
            {/*<Button type="primary" style={{ float: 'right', margin: '10px', width: '100px', height: '50px' }} size={'large'}>保存</Button>
            <Button type="primary" style={{ float: 'right', margin: '10px', width: '100px', height: '50px' }} size={'large'}>重新开单</Button>*/}
        </div>
    }
}
export default BeautyDetail