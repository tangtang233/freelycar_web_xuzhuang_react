import React from 'react';
import { Row, Col, Card, Select, Table, Iconconst, Popover, Popconfirm, Button, InputNumber, Icon } from 'antd';

import update from 'immutability-helper'
import $ from 'jquery'
import ProgramSearch from '../model/ProgramSearch.jsx'
import { Link } from 'react-router';
import PreFixInterge from '../../utils/PreFixInterge.js'
const Option = Select.Option;
const total = {
    key: '',
    index: '',
    total: '合计',
    singleSummation: '0'
}, columns = [{
    title: '项目名称',
    dataIndex: 'name',
    key: 'name'
}, {
    title: '可用次数',
    dataIndex: 'times',
    key: 'times'
}]


class ServiceTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            view: false,
            data: [],
            total: 0,
            isAdd:false
        }
    }

    componentWillReceiveProps(newprops){
        let keyArray = [],rowArray= []
        if(newprops.projects&&(this.props.projects.length !== newprops.projects.length)) {
            for(let item of newprops.projects) {
                item.key = item.projectId
            }
            this.setState({
                data:[...newprops.projects,total]
            })

            newprops.projects.forEach((item,index)=>{
                keyArray.push(item.projectId)
                item.id = item.projectId
                rowArray.unshift(item)
            });
            this.refs.programSearch.addSelectRow(keyArray,rowArray);

        }
    }

    setData = (key, data, index) => {
        this.setState({
            data: update(this.state.data, { [index]: { [key]: { $set: data } } })
        }, () => {
            this.props.saveInfo({ projects: this.state.data.slice(0, this.state.data.length - 1) })
        })
    }


    handleCancel = () => {
        this.setState({
            view: false
        })
    }

    handleOk = (data) => {
        // if(this.props.projects&&!this.state.isAdd) {
        //     for(let item of this.state.data.slice(0, this.state.data.length - 1)) {
        //         for (let i = 0 ;i<data.length;i++) {
        //             console.log(data)
        //             data[i].projectId = data[i].id;
        //             data[i].payMethod = 1;
        //             delete data[i].id;
        //             if(item.projectId == data[i].projectId) {
        //                 console.log('删除了')
        //                 data.splice(i,1)
        //             }
        //         }
        //     }
        //     console.log(data)
        //     this.state.data.slice(0, this.state.data.length - 1).forEach((item,index)=>{
        //         data.unshift(item)
        //     })
        //     this.setState({
        //         isAdd:true
        //     })
        // }
        
        if (data.length > 0 ) {
            let tempData = this.state.data;
            if (tempData.length > 0) {
                tempData.pop();
            }
            for (let i = 0; i < data.length; i++) {
                if (!data[i].projectId) {
                    data[i].projectId = data[i].id;
                    data[i].payMethod = 1;
                    delete data[i].id;
                }
                // delete data[i].staffs;
                for (let j = 0; j < tempData.length; j++) {
                    if (data[i].projectId == tempData[j].projectId && !data[i].staffs) {
                        data[i].staffs = tempData[j].staffs;
                    }
                }
            }

            // this.props.getPartsDetail(data);
            this.setState({
                view: false,
                data: [...data, total]
            }, () => {
                this.props.saveInfo({ projects: this.state.data.slice(0, this.state.data.length - 1) })
            })
        }
    }
    
    onDelete = (index) => {
        this.props.pushInventory([], this.state.data[index].id)
        let dataSource = [...this.state.data];
        dataSource.splice(index, 1);
        this.refs.programSearch.deleteSelectRow(index);
        this.setState({ data: dataSource }, () => {
            let data = JSON.parse(JSON.stringify(dataSource));
            data.splice(-1, 1)
            // this.props.getPartsDetail(data)
            this.props.saveInfo({ projects: this.state.data.slice(0, this.state.data.length - 1) })
        });
    }

    render() {
        const projectOptions = this.props.optionService.map((item, index) => {
            return <Option key={index} value={item.id + ''}>{item.name}</Option>
        }), staffOptions = this.props.staffList.map((item, index) => {
            return <Option key={index} value={item.id + ''}>{item.name}</Option>
        })

        return <Card bodyStyle={{ background: '#fff' }} style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '16px', marginBottom: '10px' }}> 服务项目&nbsp;&nbsp;&nbsp;
            <div style={{ display: 'inline-block', color: '#49a9ee', cursor: 'pointer' }} onClick={() => { this.setState({ view: true }) }}><Icon type="plus-circle-o" />&nbsp;增加</div>
            </div>
            <ProgramSearch ref='programSearch' programId={-1} view={this.state.view} handleCancel={this.handleCancel} handleOk={this.handleOk}></ProgramSearch>
            {this.state.data.length > 0 && <Table className="accountTable" dataSource={this.state.data} bordered pagination={false} >
                <Col
                    title="序号"
                    dataIndex="index"
                    key="index"
                    render={(text, record, index) => {
                        return <span>{index + 1}</span>
                    }}
                />
                <Col
                    title=""
                    dataIndex="total"
                    key="total"
                />
                <Col
                    title="项目名称"
                    key="name"
                    dataIndex="name"
                />
                <Col
                    title="项目价格"
                    key="price"
                    dataIndex="price"
                />
                <Col
                    title="参考工时"
                    key="referWorkTime"
                    dataIndex="referWorkTime"
                />}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
                <Col
                    title="工时单价"
                    key="pricePerUnit"
                    dataIndex="pricePerUnit"
                />}
                <Col
                    title="单项小计"
                    key="totalPrice"
                    dataIndex="totalPrice"
                    render={(text, record, index) => {
                        if (index == (this.state.data.length - 1)) {
                            let total = 0
                            for (let item of this.state.data) {
                                if (item.price) {
                                    total = total + item.price + item.pricePerUnit * item.referWorkTime
                                }
                            }
                            return <span>{total}</span>
                        }
                        return <span>{record.price + record.pricePerUnit * record.referWorkTime}</span>
                    }}
                />
                <Col
                    title="施工人员(必选)"
                    key="staffs"
                    dataIndex="staffs"
                    render={(text, record, index) => {
                        if ((index + 1) < this.state.data.length) {
                            let staffvalue = []
                            if(text) {
                                for(let item of text) {
                                    staffvalue.push(item.id+'')
                                }   
                            }
                                

                            return <Select showSearch
                                style={{ width: '160px', maxHeight: '500px' }}
                                placeholder="输入施工人员"
                                optionFilterProp="children"
                                value={staffvalue}
                                mode="multiple"
                                onChange={(value) => {
                                    let staffList = []
                                    for (let item of value) {
                                        staffList.push({ id: item })
                                    }
                                    this.setData('staffs', staffList, index)
                                }}
                                filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                            >
                                {staffOptions}
                            </Select>
                        }
                    }}
                />
                {/* <Col
                    title="可用卡券"
                    key="memberCard"
                    dataIndex="memberCard"
                    render={(text, record, index) => {
                        let cards = [], cardOptions = [], tickets = [], ticketsOptions = []
                        this.props.cards ? this.props.cards.map((item, index) => {
                            for (let projectItem of item.projectInfos) {
                                if (projectItem.project.id == record.projectId) {
                                    cards.push(item)
                                }
                            }
                        }) : [] //筛选有关此项目的卡

                        this.props.tickets ? this.props.tickets.map((item, index) => {
                            for (let projectItem of item.favour.set) {
                                if (projectItem.project.id == record.projectId) {
                                    tickets.push(item)
                                }
                            }
                        }) : [] //筛选有关此项目的券

                        ticketsOptions = tickets.map((item, index) => {
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
                                <Table size={'small'} pagination={false} bordered columns={columns} dataSource={projectInfos} />
                            </div>
                            const pop = <Popover arrowPointAtCenter placement="left" content={content} title="券明细" style={{ zIndex: '1000' }}>
                                {item.favour.name}
                            </Popover> //悬浮框
                            return <Option key={index} value={item.id + '$'} style={{ zIndex: '100' }}>{pop}</Option>
                        })

                        cardOptions = cards.map((item, index) => {
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
                                    <Table size={'small'} pagination={false} bordered columns={columns} dataSource={projectInfos} />
                                </div>
                            );//显示卡明细
                            const pop = <Popover arrowPointAtCenter placement="left" content={content} title="会员卡明细" style={{ zIndex: '1000' }}>
                                {item.service.name + item.cardNumber}
                            </Popover> //悬浮框
                            return <Option key={index} value={item.id + ''} style={{ zIndex: '100' }}>{pop}</Option>
                        })

                        if ((index + 1) < this.state.data.length) {
                            return <div id="memberCard"><Select showSearch
                                style={{ width: '120px', maxHeight: '200px' }}
                                placeholder="输入会员卡号"
                                optionFilterProp="children"
                                onChange={(value) => { this.setData('cardId', value, index) }}
                                dropdownMatchSelectWidth={false}
                                filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                            >
                                {cardOptions}{ticketsOptions}
                                <Option style={{ padding: '0', textAlign: 'center' }} key={-1} value={'会员开卡'}><Link to={this.props.clientId == '' ? `/app/member/memberShip` : `/app/member/memberShip/${this.props.clientId}`} style={{ display: 'block', padding: '7px 8px' }}>会员开卡</Link></Option>
                            </Select>
                            </div>
                        }
                    }}
                /> */}
                {/* <Col
                    title="扣除次数"
                    key="DeductionCardTime"
                    dataIndex="DeductionCardTime"
                    render={(text, record, index) => {
                        if ((index + 1) < this.state.data.length) {
                            return <InputNumber disabled={this.state.data[index].cardId ? false : true} min={1} onChange={(value) => this.setData('payCardTimes', value, index)}></InputNumber>
                        }
                    }}
                /> */}
                <Col
                    title="操作"
                    key="action"
                    render={(text, record, index) => {
                        if (!record.total) {
                            return <span>
                                <Popconfirm title="确认要删除嘛?" onConfirm={() => this.onDelete(index)}>
                                    <a href="javascript:void(0);">删除</a>
                                </Popconfirm>
                            </span>
                        }
                    }}
                />
            </Table>}
        </Card>
    }
}
export default ServiceTable