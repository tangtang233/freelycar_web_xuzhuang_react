import React from 'react';
import { Row, Col, Card, Table, Select, InputNumber, Input, Button, Icon, DatePicker, Modal, Radio, Popconfirm, message } from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';

import { Link } from 'react-router';
import update from 'immutability-helper'
import $ from 'jquery';
import getParameterByName from '../../utils/getParameterByName'
const Option = Select.Option;
class ClientInfo extends React.Component {
    constructor(props) {
        super(props);
        let cleartag = getParameterByName('from')
        if (cleartag !== 'xq') {
            sessionStorage.clear()
        }
        let info = JSON.parse(sessionStorage.getItem('customer'))
        console.log(info)
        this.state = {
            option: [],
            visible: false,
            clientName: info ? info.name : '',
            clientPhone: info ? info.phone : '',
            licensePlate: info ? info.licensePlate : '',
            isMember: info ? info.isMember : -1,
            realSize: '',
            thisMonth: '',
            todayCount: '',
            dataSource: [],
            pagination: {
                current: info ? info.current : 1
            },
            selectedIds: [],
            queryValue: '',
            type: [],
            columns: [
                {
                    title: '序号', dataIndex: 'index', key: 'index', render: (text, record, index) => {
                        return <span>{index + 1}</span>
                    }
                },
                {
                    title: '姓名', dataIndex: 'customerName', key: 'customerName', render: (text, record, index) => {
                        return <Link to={'app/member/customer/' + record.id}>{text}</Link>
                    }
                },
                { title: '手机号码', dataIndex: 'phoneNumber', key: 'phoneNumber' },
                {
                    title: '车牌号码', dataIndex: 'cars', key: 'cars', render: (text, record, index) => {
                        let carnum = '';
                        let indx = 0;
                        let length = text.length;
                        for (let item of text) {
                            if (indx < length - 1) {
                                carnum += item.licensePlate + ', ';
                            } else {
                                carnum += item.licensePlate;
                            }
                            indx++;
                        }
                        return carnum;
                    }
                },
                {
                    title: '品牌', dataIndex: 'cars', key: 'carBrand', render: (text, record, index) => {
                        let carnum = '';
                        let indx = 0;
                        let length = text.length;
                        for (let item of text) {
                            if (indx < length - 1) {
                                carnum += item.carbrand + ', ';
                            } else {
                                carnum += item.carbrand;
                            }
                            indx++;
                        }
                        return carnum;
                    }
                },
                { title: '是否会员', dataIndex: 'isMember', key: 'isMember' },
                { title: '总消费次数', dataIndex: 'consumeCount', key: 'consumeCount' },
                { title: '最近到店时间', dataIndex: 'latelyTime', key: 'latelyTime' },
                {
                    title: '操作', dataIndex: 'operation', key: 'operation', render: (text, record, index) => {
                        return <span>
                            <span style={{ marginRight: '10px' }}>
                                <Link to={'app/member/memberShip/' + record.id} >
                                    <span >开卡</span>
                                </Link>
                                <Link to={'app/member/modifyclient/' + record.id} >
                                    <span style={{ marginLeft: '15px' }}>修改</span>
                                </Link>
                                <Popconfirm title="确认要删除嘛?" onConfirm={() => this.onDelete([record.id])}>
                                    <a href="javascript:void(0);" style={{ marginLeft: '15px' }}>删除</a>
                                </Popconfirm>
                            </span>

                        </span>
                    }
                },
            ]
        }
    }
    //渲染完成后执行
    componentDidMount() {
        this.loadData(this.state.pagination.current, 10);
        this.getName();
    }

    getName = () => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'client/querynames',
            data: {
                name: "",
            },
            success: (result) => {
                this.setState({
                    option: result.data,
                })
            }
        })
    }


    loadData = (page, number) => {
        let jsonData = {};
        jsonData.name = this.state.clientName;
        jsonData.phone = this.state.clientPhone;
        jsonData.licensePlate = this.state.licensePlate;
        jsonData.page = page;
        jsonData.number = number;
        jsonData.isMember = this.state.isMember;
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'client/query',
            data: jsonData,
            type: 'get',
            success: (res) => {
                if (res.code == "0") {
                    let datalist = [];
                    var obj = res.data;
                    for (let i = 0; i < obj.length; i++) {
                        let dataItem = {
                            key: obj[i].id,
                            id: obj[i].id,
                            customerName: obj[i].name,
                            phoneNumber: obj[i].phone,
                            cars: obj[i].cars,
                            carBrand: obj[i].cars.length > 0 ? obj[i].cars[0].carbrand : '',
                            isMember: obj[i].isMember ? "是" : "否",
                            consumeCount: obj[i].consumTimes,
                            latelyTime: obj[i].lastVisit,
                        }
                        datalist.push(dataItem)
                    }
                    this.setState({
                        dataSource: datalist,
                        pagination: update(this.state.pagination, { total: { $set: res.realSize } })
                    })
                } else if (res.code == "2") {
                    let datalist = [];
                    this.setState({
                        dataSource: datalist

                    })
                }
            },

        })


    }


    //获取分页
    getList = (page, pageSize) => {
        $.ajax({
            url: "api/"+localStorage.getItem('store')+"/client/list",
            type: "GET",
            data: {
                page: page,
                number: pageSize
            },
            //  dataType:'json',
            success: (res) => {
                if (res.code == "0") {
                    let datalist = [];
                    var obj = res.data;
                    for (let i = 0; i < obj.length; i++) {
                        let dataItem = {
                            key: obj[i].id,
                            id: obj[i].id,
                            customerName: obj[i].name,
                            phoneNumber: obj[i].phone,
                            cars: obj[i].cars,
                            isMember: obj[i].isMember ? "是" : "否",
                            consumeCount: obj[i].consumTimes,
                            latelyTime: obj[i].lastVisit,
                        }
                        datalist.push(dataItem)
                        if (datalist.length == obj.length) {
                            this.setState({
                                dataSource: datalist,
                                pagination: { total: res.realSize },
                            })
                        }
                    }
                }
            },
        })

    }

    setQueryData = (data) => {
        this.setState({
            isMember: data
        }, () => {
            console.log(this.state)
            this.loadData(this.state.pagination.current, 10)
        })
    }
    //这个模态框到底要不要显示新增会员数呢？
    showModal = () => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'client/stat',
            type: 'GET',
            dataType: 'json',
            data: {},
            success: (res) => {
                this.setState({
                    realSize: res.realSize,
                    thisMonth: res.thisMonth,
                    todayCount: res.today
                })
            }
        })
        this.setState({
            visible: true,

        });
    }
    hideModal = () => {
        this.setState({
            visible: false,
        });
    }
    onDelete = (idArray) => {
        $.ajax({
            type: 'post',
            url: 'api/'+localStorage.getItem('store')+'/'+'client/delete',
            dataType: 'json',
            data: {
                clientIds: idArray
            },
            traditional: true,
            success: (result) => {
                if (result.code == "0") {
                    let dataSource = [...this.state.dataSource];
          
                    for (let id of idArray) {
                        dataSource = dataSource.filter((obj) => {
                            return id !== obj.id;
                        });
                    }
                    this.setState({
                        dataSource: dataSource,
                        pagination: update(this.state.pagination, { ['total']: { $set: result.realSize } })
                    });
                    message.success('删除成功', 5)
                }

            }
        })
    }
    handleSelected = (value) => {
        this.setState({ queryValue: value })
    }
    startQuery = () => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'client/query',
            type: 'GET',
            dataType: 'json',
            data: {
                name: this.state.queryValue,
                page: 1,
                number: 10
            },
            traditional: true,
            success: (res) => {
                if (res.code == "0") {
                    let datalist = [];
                    let obj = res.data;
                    for (let i = 0; i < obj.length; i++) {
                        let dataItem = {
                            key: obj[i].id,
                            id: obj[i].id,
                            customerName: obj[i].name,
                            phoneNumber: obj[i].phone,
                            busNumber: obj[i].cars[0].licensePlate,
                            carBrand: obj[i].cars[0].type.brand.name,
                            isMember: obj[i].cards == "" ? "否" : "是",
                            consumeCount: obj[i].consumTimes,
                            latelyTime: obj[i].lastVisit,
                        }
                        datalist.push(dataItem)
                        if (datalist.length == obj.length) {
                            this.setState({
                                dataSource: datalist,
                                pagination: { total: result.realSize },
                            })
                        }
                    }
                }
            }
        })
    }
    handleTableChange = (pagination) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        })
        let jsonData = {}
        jsonData.name = this.state.clientName
        jsonData.phone = this.state.clientPhone
        jsonData.licensePlate = this.state.licensePlate
        jsonData.isMember = this.state.isMember;
        let info = {...jsonData,current:pagination.current}
        sessionStorage.setItem('customer',JSON.stringify(info))
        this.loadData(pagination.current, 10)
    }




    render() {

        return (
            <div>
                <BreadcrumbCustom first="会员管理" second="客户管理" />

                <div style={{ display: 'inline-block', marginBottom: '25px' }}>
                    <Row>
                        <div style={{ marginBottom: 16, display: "inline-block", marginRight: '20px' }} >
                            <span> 姓名：</span><Input style={{ width: "120px" }} value={this.state.clientName} onChange={(e) => this.setState({ clientName: e.target.value })} />
                        </div>

                        <div style={{ marginBottom: 16, display: "inline-block", marginRight: "20px" }}>
                            <span>手机号码：</span><Input style={{ width: "140px" }} value={this.state.clientPhone} onChange={(e) => this.setState({ clientPhone: e.target.value })} />
                        </div>


                        <div style={{ marginBottom: 16, display: "inline-block", marginRight: "20px" }}>
                            <span>车牌号码：</span><Input style={{ width: "140px" }} value={this.state.licensePlate} onChange={(e) => this.setState({ licensePlate: e.target.value })} />
                        </div>
                        <div style={{ marginBottom: 16, display: "inline-block", marginRight: "20px" }}>
                             <span>是否会员：</span><Button size="large" shape="circle" onClick={() => { if (this.state.isMember !== 1) { this.setQueryData(1) } else { this.setQueryData(-1) } }} type={this.state.isMember == 1 ? 'primary' : null}>是</Button>
                         </div>
                        <Button style={{ display: 'inline-block' }} type="primary" onClick={() =>{
                            sessionStorage.removeItem('customer')
                            let jsonData = {};
                            jsonData.name = this.state.clientName;
                            jsonData.phone = this.state.clientPhone;
                            jsonData.licensePlate = this.state.licensePlate;
                            jsonData.isMember = this.state.isMember;
                            let customer = JSON.stringify(jsonData)
                            sessionStorage.setItem('customer',customer)
                            this.loadData(1, 10)
                        }
                        }
                        >查询</Button>
                    </Row>
                    {/* <Col span={10} style={{ marginBottom: 16, marginRight: '8px', marginLeft: '26px' }}>
                      <span>手机号码：</span> <Input style={{width:"140px"}}  value={this.state.clientPhone} onChange={(e) => this.setState({ clientPhone: e.target.value })} />
                    </Col> */}



                </div>

                <div>
                    <Button ><Link to={'app/member/addclient'}><Icon type='plus'></Icon>新增客户</Link></Button>
                    <Button style={{ margin: '0 30px 0 30px' }} onClick={this.showModal}>会员统计</Button>
                    <a href="api/report/client">
                        <Button icon="export" type="primary">
                            导出Excel</Button>
                    </a>
                </div>
                <Card style={{ marginTop: '20px' }}>
                    <div>
                        <Table pagination={this.state.pagination} bordered onChange={(pagination) => this.handleTableChange(pagination)} dataSource={this.state.dataSource} columns={this.state.columns}>

                        </Table>
                    </div>
                </Card>
                <Modal
                    title="会员统计"
                    visible={this.state.visible}
                    onOk={this.hideModal}
                    onCancel={this.hideModal}
                    maskClosable={false}
                    okText="确认"
                    cancelText="取消"
                    width='25%'
                >
                    <div>
                        <p style={{ fontSize: '16px' }}>会员总数：<span>{this.state.realSize}</span></p>
                        <p style={{ fontSize: '16px' }}>本月新增：<span>{this.state.thisMonth}</span></p>
                        <p style={{ fontSize: '16px' }}>今日新增：<span>{this.state.todayCount}</span></p>

                    </div>
                </Modal>
            </div>
        )

    }


}
export default ClientInfo