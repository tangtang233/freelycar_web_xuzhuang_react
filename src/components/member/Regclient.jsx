import React from 'react';
import { Link } from 'react-router';
import { Row, Col, Card, Table, Select, InputNumber, Input, Button, Icon, Popconfirm, Radio, Modal } from 'antd';

import $ from 'jquery'
class Regclient extends React.Component{
    constructor(props){
        super(props)
        this.state={
             form: {
                name: '',
                phone: '',
                birthday: '',
                gender: '',
                drivingLicense: '',
                idNumber: '',
                points: '',
            },
            clientId:this.props.clientId
        }
    }
    componentDidMount() {
        this.getClientInfo()
    }
    getClientInfo = () => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'client/detail',
            dataType: 'json',
            type: 'GET',
            data: {
                clientId:this.state.clientId
            },
            success:(res)=>{
                if(res.code=='0'){
                    var obj = res.client;
                   
                     let clientInfo = {
                        name: obj.name,
                        phone: obj.phone,
                        birthday: obj.birthday,
                        gender: obj.gender,
                        driverLicense: obj.driverLicense,
                        idNumber: obj.idNumber,
                        points: obj.points,

                    }

                    this.setState({
                        form: clientInfo
                    })
                }
            }
        })
    }
    render(){
        return (
            <Card title='客户信息' >
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={8} offset={4}>客户姓名：
                            <span style={{ marginLeft: '15px' }}>{this.state.form.name}</span>
                        </Col>
                        <Col span={8}>性别：
                            <span style={{ marginLeft: '15px' }}>{this.state.form.gender}</span>
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={8} offset={4}>手机号:
                            <span style={{ marginLeft: '15px' }}>{this.state.form.phone}</span>
                        </Col>
                        <Col span={8} >身份证号：
                            <span style={{ marginLeft: '15px' }}>{this.state.form.idNumber}</span>
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={8} offset={4}>行驶证号:
                            <span style={{ marginLeft: '15px' }}>{this.state.form.driverLicense}</span>
                        </Col>
                        <Col span={8} >积分：
                            <span style={{ marginLeft: '15px' }}>{this.state.form.points}</span>
                        </Col>
                    </Row>
                </Card>
        )
    }

}
export default Regclient