import React from 'react';
import { Row, Col, Card, Table, Radio, Select, InputNumber, Input, Button, Checkbox, message, Popover, Icon } from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import { Link, hashHistory } from 'react-router';
import update from 'immutability-helper'
import $ from 'jquery';
import PreFixInterge from '../../utils/PreFixInterge.js'

const RadioGroup = Radio.Group;
const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
};
const Option = Select.Option;

const total = {
    key: '',
    index: '',
    total: '合计',
    singleSummation: '0'
}, columns1 = [{
    title: '项目名称',
    dataIndex: 'name',
    key: 'name'
}, {
    title: '可用次数',
    dataIndex: 'times',
    key: 'times'
}]

class CostClose extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: 1,
            dataInfo: {},
            otherProject: [],//别人的项目
            card: [],
            ticket: [],
            sumPrice: 0,//合计金额
            // actualPrice: -1,//支付金额
            // payMethod: '0',//支付方式
            programId: 1,
            deductionSearch: false,//代扣的搜索框以及搜索按钮 true 显示, false: 隐藏(default)
            phoneOrCard: '',//手机号或者卡号
            payList: [{
                actualPrice: -1,//支付金额
                payMethod: '0',//支付方式
            }]
        }
    }

    componentDidMount() {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'order/queryid',
            type: 'get',
            data: { consumOrderId: this.props.params.orderId },
            dataType: 'json',
            success: (res) => {
                if (res.code == '0') {
                    (res.card)
                    this.setState({
                        dataInfo: res,
                        card: res.card,
                        ticket: res.ticket,
                        sumPrice: this.calcTotalSum(res.data),
                        payList: [{
                            actualPrice: this.calcaActualPrice(res.data),//支付金额
                            payMethod: '0',//支付方式
                        }],
                        programId: res.data.programId,
                    });
                }
            }
        });

    }

    //计算合计价格
    calcTotalSum = (resdata) => {
        let totalSum = 0;
        //配件金额
        for (let inv of resdata.inventoryInfos) {
            totalSum += inv.inventory.price * inv.number;
        }
        //项目费用+工时*单价
        for (let item of resdata.projects) {
            totalSum += item.price + item.referWorkTime * item.pricePerUnit
        }
        return totalSum;
    }

    //计算支付金额 支付金额是扣除了卡券的情况 .用的是presentPrice
    calcaActualPrice = (resdata) => {

        let totalSum = 0;
        //配件金额
        for (let inv of resdata.inventoryInfos) {
            totalSum = totalSum + inv.inventory.price * inv.number;
        }
        //项目费用+工时*单价
        for (let item of resdata.projects) {
            totalSum = totalSum + item.presentPrice + item.referWorkTime * item.pricePerUnit
        }
        return totalSum;
    }

    //public fuc 
    //为表格item设置key
    setTableDateKey = (arr) => {
        if (arr) {
            for (let item of arr) {
                if (!item.key) {
                    if (item.id)
                        item.key = item.id;
                    else
                        item.key = Math.random() + '';
                }
            }
            return arr;
        } else
            return [];
    }
    //改变feeDetail的值,
    //针对 数组的 本列中主要用于可用卡券的选择
    setProjectsDataArr = (keyValue, index) => {

        let json = {};
        keyValue.map((item, index) => {
            let key1 = item.key, value = item.value;
            json[key1] = { $set: value };
        });
        this.setState({
            dataInfo: update(this.state.dataInfo, {
                'data': {
                    'projects': {
                        [index]: json
                    }
                }
            })
        }, () => {
            let actualPrice = 0;
            for (let item of this.state.dataInfo.data.projects) {
                actualPrice += item.presentPrice;
            }
            this.setState({
                payList: update(this.state.payList, {[0]:{['actualPrice']:{$set:actualPrice}}})
            })
        })
    }
    //针对单个
    setProjectsData = (key, value, index) => {

        this.setState({
            dataInfo: update(this.state.dataInfo, {
                'data': {
                    'projects': {
                        [index]: {
                            [key]: { $set: value },
                        }
                    }
                }
            })
        }, () => {
            this.setState({
                sumPrice: this.calcTotalSum(this.state.dataInfo.data)
            })
        })
    }

    //搜索
    searchCardOrTicket = (phoneOrCard) => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'pay/other',
            type: 'get',
            data: { code: phoneOrCard },
            dataType: 'json',
            success: (res) => {
                if (res.code == '0') {
                    if (Object.prototype.toString.call(res.data) === '[object Array]') {
                        this.setState({ otherProject: res.data });
                    } else {
                        this.setState({ otherProject: [res.data] });
                    }
                }
            }
        });
    }

    confirm = (pay) => {
        let obj = {}, url = '';
        obj.consumOrdersId = this.props.params.orderId;
        obj.payMethod = this.state.payList[0].payMethod;
        obj.payMethod1 = this.state.payList[1] ? this.state.payList[1].payMethod : null;
        obj.actualPrice = this.state.payList[0].actualPrice;
        obj.actualPrice1 = this.state.payList[1] ? this.state.payList[1].actualPrice : null;
        obj.projectInfos = this.state.dataInfo.data.projects;
        for (let item of obj.projectInfos) {
            if (item.cardId == '0' && item.ticketId == '0') {
                delete item.cardId
                delete item.ticketId
            }
        }
        obj.pay = pay;
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'pay/consumpay',
            type: 'post',
            data: JSON.stringify(obj),
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            success: (res) => {
                if (res.code == '0') {
                    message.success('结算成功');
                    hashHistory.push('/app/consumption/orderManage');
                } else {
                    message.error(res.msg);
                }
            }
        });
    }

    handleChangePayMethod = (index, value) => {
        const payList = this.state.payList;
        payList[index].payMethod = value;
        this.setState({
            payList: payList
        })
    }

    handleChangePayMoney = (index, value) => {
        const payList = this.state.payList;
        payList[index].actualPrice = value;
        this.setState({
            payList: payList
        })
    }

    handleChangePayWays = (index) => {
        const payList = this.state.payList;
        if (index > 0) {
            payList.pop();
        } else {
            payList.push({
                actualPrice: 0,//支付金额
                payMethod: '0',//支付方式
            });
        }

        this.setState({
            payList: payList
        })
    }

    render() {
        const columns = [
            { title: '项目名称', dataIndex: 'name', key: 'itemName' },
            { title: '项目费用', dataIndex: 'price', key: 'itemFee' },
            {
                title: '实际工时', dataIndex: 'referWorkTime', key: 'workHour', render: (text, record, index) => {
                    if (this.state.programId == 1) {
                        return <span>{text}</span>
                    } else {
                        return <InputNumber min={0} defaultValue={text} onChange={(e) => { this.setProjectsData('referWorkTime', e, index) }} />
                    }
                }
            },
            {
                title: '工时单价', dataIndex: 'pricePerUnit', key: 'perHourCost', render: (text, record, index) => {
                    if (this.state.programId == 1) {
                        return <span>{text}</span>
                    } else {
                        return <InputNumber min={0} defaultValue={text} onChange={(e) => { this.setProjectsData('pricePerUnit', e, index) }} />
                    }
                }
            },
            {
                title: '配件金额', dataIndex: 'inventory', key: 'productFee', render: (text, record, index) => {
                    let rowId = record.projectId;
                    let sum = 0;
                    for (let item of this.state.dataInfo.data.inventoryInfos) {
                        if (item.projectId == rowId) {
                            sum += item.inventory.price * item.number;
                        }
                    }
                    return <span>{sum}</span>
                }
            },
            {
                title: '合计', dataIndex: 'totalPrice', key: 'total', render: (text, record, index) => {
                    return {
                        props: {
                            rowSpan: index == 0 ? this.state.dataInfo.data.projects.length : 0
                        },
                        children: <a>{this.state.sumPrice}</a>,
                    }
                }
            },
        ];

        //存了所有项目的卡券
        let allCardTicket = [];
        let ticketItem = []

        let optionCard = [];
        const options_card = (projectId) => {
            optionCard = [];
            let allItem = [];
            const option = this.state.card.map((item, index) => {
                let proinfos = item.projectInfos;
                let exist_card = false;
                // if(item.service.type === 2) {
                //     allItem.push(item);
                // }
                for (let p of proinfos) {
                    if (p.project.id == projectId) {
                        allItem.push(item);
                    }
                }
            });
            optionCard = allItem.map((item, index) => {
                let projectInfos = []
                for (let projectItem of item.projectInfos) {
                    let obj = {
                        key: projectItem.id,
                        name: projectItem.project.name,
                        times: projectItem.remaining
                    }
                    projectInfos.push(obj)
                }
                const content = (
                    <div style={{ width: '200px' }}>
                        <Row gutter={16} style={{ marginBottom: '15px' }}>
                            <Col span={12} >卡类名称：</Col>
                            <Col span={12}>{item.service.name}</Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: '15px' }}>
                            <Col span={12} >卡类属性：</Col>
                            <Col span={12}>{item.service.type == '1' ? '组合次卡' : '次卡'}</Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: '15px' }}>
                            <Col span={12} >售卡金额：</Col>
                            <Col span={12}>{item.service.price}</Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: '15px' }}>
                            <Col span={12} >卡内余额：</Col>
                            <Col span={12}>{item.balance}</Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: '15px' }}>
                            <Col span={12} >有效期：</Col>
                            <Col span={12}>{item.service.validTime}年</Col>
                        </Row>
                        {item.service.type !== 2 && <Row gutter={16} style={{ marginBottom: '15px' }}>
                            <Col span={12} >剩余次数明细：</Col>
                        </Row>}
                        {item.service.type !== 2 && <Table size={'small'} pagination={false} bordered columns={columns1} dataSource={projectInfos} />}
                    </div>
                );//显示卡明细
                const pop = <Popover arrowPointAtCenter placement="left" content={content} title="会员卡明细" style={{ zIndex: '1000' }}>
                    {item.service.name + item.cardNumber}
                </Popover> //悬浮框
                return <Option key={index} value={'card' + item.id} style={{ zIndex: '100' }}>{pop}</Option>
            })
        }
        let optionTicket = []
        const options_ticket = (projectId) => {
            let ticketItem = [];
            const option = this.state.ticket.map((item, index) => {
                let proinfos = item.remainingInfos;
                let exist_ticket = false;
                for (let p of proinfos) {
                    if (p.project.id == projectId) {
                        ticketItem.push(item);
                    }
                }
            });

            optionTicket = ticketItem.map((item, index) => {
                let projectInfos = [], ticketPrice = 0
                for (let projectItem of item.favour.set) {
                    let obj = {
                        key: projectItem.id,
                        name: projectItem.project.name,
                        times: 1
                    }
                    ticketPrice = ticketPrice + projectItem.project.price - projectItem.presentPrice
                    projectInfos.push(obj)
                }
                const content = <div style={{ width: '200px' }}>
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={12} >券名称：</Col>
                        <Col span={12}>{item.favour.name}</Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={12} >券属性：</Col>
                        <Col span={12}>{item.favour.type == '1' ? '抵用券' : '代金券'}</Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={12} >截止日期：</Col>
                        <Col span={12}>{item.expirationDate}</Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={12} >券面价格：</Col>
                        <Col span={12}>{ticketPrice}</Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={12} >剩余次数明细：</Col>
                    </Row>
                    <Table size={'small'} pagination={false} bordered columns={columns1} dataSource={projectInfos} />
                </div>
                const pop = <Popover arrowPointAtCenter placement="left" content={content} title="券明细" style={{ zIndex: '1000' }}>
                    {item.favour.name}
                </Popover> //悬浮框
                return <Option key={index} value={'ticket' + item.id} style={{ zIndex: '100' }}>{pop}</Option>
            })
        }

        //别人的卡
        let optionOther = [];
        const options_other = (projectId) => {
            optionOther = [];
            let allItem = []
            this.state.otherProject.map((item, index) => {
                let proinfos = item.projectInfos;
                let exist = false;
                for (let p of proinfos) {
                    if (p.project.id == projectId) {
                        allItem.push(item)
                    }
                }
            });

            optionOther = allItem.map((item, index) => {
                let projectInfos = []
                for (let projectItem of item.projectInfos) {
                    let obj = {
                        key: projectItem.id,
                        name: projectItem.project.name,
                        times: projectItem.remaining
                    }
                    projectInfos.push(obj)
                }
                const content = (
                    <div style={{ width: '200px' }}>
                        <Row gutter={16} style={{ marginBottom: '15px' }}>
                            <Col span={12} >卡类名称：</Col>
                            <Col span={12}>{item.service.name}</Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: '15px' }}>
                            <Col span={12} >卡类属性：</Col>
                            <Col span={12}>{item.service.type == '1' ? '组合次卡' : '次卡'}</Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: '15px' }}>
                            <Col span={12} >售卡金额：</Col>
                            <Col span={12}>{item.service.price}</Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: '15px' }}>
                            <Col span={12} >有效期：</Col>
                            <Col span={12}>{item.service.validTime}年</Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: '15px' }}>
                            <Col span={12} >剩余次数明细：</Col>
                        </Row>
                        <Table size={'small'} pagination={false} bordered columns={columns1} dataSource={projectInfos} />
                    </div>
                );//显示卡明细
                const pop = <Popover arrowPointAtCenter placement="left" content={content} title="会员卡明细" style={{ zIndex: '1000' }}>
                    {item.service.name + item.cardNumber}
                </Popover> //悬浮框
                return <Option key={index} value={'other' + item.id} style={{ zIndex: '100' }}>{pop}</Option>
            })
        }

        let projectArr = this.state.dataInfo.data ? this.state.dataInfo.data.projects : []

        const projects = projectArr.map((item, index) => {
            options_card(item.projectId);
            options_ticket(item.projectId);
            return <Row key={index} style={{ marginBottom: '10px' }}>
                <Col xs={24} sm={24} md={24} lg={7} xl={7} offset={1}>
                    项目名称:
                    <div style={{ display: 'inline-block', marginLeft: '10px' }}>
                        {item.name}
                    </div>
                </Col>

                <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                    可用卡券:
                    <div style={{ display: 'inline-block', marginLeft: '10px' }}>
                        <Select
                            defaultValue={item.cardId != '0' ? (!item.cardId ? 'cash' : item.cardName + item.cardNumber) : ((item.ticketId ? (item.ticketId != '0' ? 'ticket' + item.ticketId : '无') : '无'))} style={{ width: '150px' }}
                            onSelect={(value, option) => {
                                let arr = [];
                                if (value.indexOf('card') >= 0) {
                                    arr.push({ key: 'payMethod', value: 0 });
                                    arr.push({ key: 'presentPrice', value: 0 });
                                    arr.push({ key: 'cardId', value: value.substr(4) });
                                } else if (value.indexOf('ticket') >= 0) {
                                    arr.push({ key: 'payMethod', value: 0 });
                                    arr.push({ key: 'presentPrice', value: 0 });
                                    arr.push({ key: 'cardId', value: value.substr(6) + '$' });
                                } else if (value.indexOf('cash') >= 0) {//cash
                                    arr.push({ key: 'payMethod', value: 1 });
                                    arr.push({ key: 'cardId', value: '' });
                                    arr.push({ key: 'ticketId', value: '' });
                                    arr.push({ key: 'presentPrice', value: item.price });
                                }
                                this.setProjectsDataArr(arr, index);
                            }}
                        >
                            <Option value='cash' >无</Option>
                            {optionCard}
                            {optionTicket}
                        </Select>
                    </div>
                </Col>

                {projectArr[index].payMethod == '0' && <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                    扣除:
                    <div style={{ display: 'inline-block', marginLeft: '10px' }}>
                        <InputNumber
                            min={0}
                            style={{ width: '80px', color: 'red' }}
                            value={projectArr[index].payCardTimes}
                            onChange={(value) => { this.setProjectsData('payCardTimes', value, index) }}
                        />
                        次
                </div>
                </Col>}
            </Row>
        })


        const projects2 = projectArr.map((item, index) => {
            options_other(item.projectId);
            return <Row key={index} style={{ marginBottom: '10px' }}>
                <Col xs={24} sm={24} md={24} lg={7} xl={7} offset={1}>
                    项目名称:
                        <div style={{ display: 'inline-block', marginLeft: '10px' }}>
                        {item.name}
                    </div>
                </Col>

                <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                    可用卡券:
                        <div style={{ display: 'inline-block', marginLeft: '10px' }}>
                        <Select defaultValue={'-1'} style={{ width: '150px' }}
                            onChange={(value) => {
                                //看选的是卡还是券
                                let arr = [];
                                if (value.indexOf('other') >= 0) {
                                    arr.push({ key: 'payMethod', value: 0 });
                                    arr.push({ key: 'presentPrice', value: 0 });
                                    arr.push({ key: 'cardId', value: value.substr(5) });
                                } else {
                                    arr.push({ key: 'payMethod', value: 1 });
                                    arr.push({ key: 'cardId', value: '' });
                                    arr.push({ key: 'ticketId', value: '' });
                                }
                                this.setProjectsDataArr(arr, index);
                            }}
                        >
                            <Option key='none' value='-1' >请选择</Option>
                            {optionOther}
                        </Select>
                    </div>
                </Col>

                <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                    扣除:
                        <div style={{ display: 'inline-block', marginLeft: '10px' }}>
                        <InputNumber
                            min={0}
                            style={{ width: '80px', color: 'red' }}
                            value={projectArr[index].payCardTimes}
                            onChange={(value) => { this.setProjectsData('payCardTimes', value, index) }}
                        />
                        次
                    </div>
                </Col>
            </Row>

        })


        const pays = this.state.payList.map((item, index) => {

            let storedCard = []

            for (let item of this.state.card) {
                if (item.service.type == 2) {
                    storedCard.push(item)
                }
            }

            let cardOptions = storedCard.map((item, index) => {
                (item)
                const content = (
                    <div style={{ width: '200px' }}>
                        <Row gutter={16} style={{ marginBottom: '15px' }}>
                            <Col span={12} >卡类名称：</Col>
                            <Col span={12}>{item.service.name}</Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: '15px' }}>
                            <Col span={12} >卡类属性：</Col>
                            <Col span={12}>储值卡</Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: '15px' }}>
                            <Col span={12} >卡面金额：</Col>
                            <Col span={12}>{item.service.price}</Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: '15px' }}>
                            <Col span={12} >截止日期：</Col>
                            <Col span={12}>{item.expirationDate}</Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: '15px' }}>
                            <Col span={12} >折扣比例：</Col>
                            <Col span={12}>{item.service.discount}%</Col>
                        </Row>
                    </div>
                );//显示卡明细
                const pop = <Popover arrowPointAtCenter placement="left" content={content} title="储值卡明细" style={{ zIndex: '1000' }}>
                    {item.cardNumber + item.service.name}
                </Popover> //悬浮框
                return <Option key={index} value={`5$${item.cardNumber}$`} style={{ zIndex: '100' }}>{pop}</Option>
            })
            return <Row key={index} style={{ marginTop: '20px' }} >
                <Col xs={16} sm={24} md={24} lg={7} xl={7}>支付方式:
                    <div style={{ display: 'inline-block', marginLeft: '10px' }}>
                        <Select defaultValue="0" style={{ width: 120 }} onChange={(value) => { this.handleChangePayMethod(index, value) }} >
                            <Option value="0">现金</Option>
                            <Option value="1">刷卡</Option>
                            <Option value="2">支付宝</Option>
                            <Option value="3">微信</Option>
                            <Option value="4">易付宝</Option>
                            {cardOptions}
                        </Select>
                    </div>
                </Col>

                <Col xs={24} sm={24} md={24} lg={8} xl={8} offset={1}>支付金额:
                        <div style={{ display: 'inline-block', marginLeft: '10px' }}>
                        <InputNumber
                            min={0}
                            className='actualPrice'
                            style={{ width: '120px' }}
                            value={this.state.payList[index].actualPrice}
                            onChange={(value) => { this.handleChangePayMoney(index, value) }}
                        />
                    </div>
                </Col>
                {(index == 0 && this.state.payList.length == 1) ? <Icon type='plus-circle' style={{ fontSize: 25, color: '#08c' }} onClick={() => { this.handleChangePayWays(index) }}></Icon> : ''}
                {(index != 0 && this.state.payList.length > 1) ? <Icon type='minus-circle' style={{ fontSize: 25, color: 'red' }} onClick={() => { this.handleChangePayWays(index) }}></Icon> : ''}
            </Row >
        });

        return (
            <div className="gutter-example" >
                <BreadcrumbCustom first="消费开单" second="结算中心" />
                <div style={{ fontSize: '20px', textAlign: 'center', marginBottom: '10px' }}>结算中心</div>

                <Row gutter={12} >
                    <Col span={2} offset={2}></Col>
                    <Col className="gutter-row" span={16}>
                        <div className="gutter-box">
                            <Card title="应收金额" bordered={false} >
                                <Table bordered className="accountTable" columns={columns} dataSource={this.setTableDateKey(projectArr)} />
                            </Card>
                            <Card title="支付方式" bordered={false} className="choosetype">

                                <Checkbox onChange={(e) => { this.setState({ deductionSearch: e.target.checked }) }}><span>代扣他人卡次</span></Checkbox>
                                <span style={{ display: this.state.deductionSearch ? '' : 'none' }}>
                                    <Input value={this.state.phoneOrCard} onChange={(e) => { this.setState({ phoneOrCard: e.target.value }) }} placeholder="输入代扣人手机号或者卡号进行搜索" style={{ width: '250px', marginRight: '30px' }} />
                                    <Button type="primary" onClick={() => { this.searchCardOrTicket(this.state.phoneOrCard) }}>搜索</Button>
                                </span>
                                <br /><br />
                                <div style={{ marginBottom: '30px' }}>
                                    <div>抵扣项目费用</div>
                                    {!this.state.deductionSearch && projects}
                                    {this.state.deductionSearch && projects2}
                                </div>

                                {pays}

                                <Row style={{ marginTop: '30px', marginBottom: '50px' }}>
                                    <Col xs={3} offset={10}>
                                        < Button type="primary" onClick={() => { this.confirm(true) }}>确定</Button>
                                    </Col>
                                    <Col xs={3}>
                                        <Link to="/app/consumption/orderManage">
                                            < Button onClick={() => { this.confirm(false) }}>挂单</Button>
                                        </Link>
                                    </Col>
                                </Row>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>
        )
    }
}
export default CostClose;