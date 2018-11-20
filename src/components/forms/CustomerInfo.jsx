import React from 'react';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import { Link } from 'react-router';
import { Row, Col, Select, Input, Card, Dropdown, Menu, Icon, DatePicker, Modal, Button } from 'antd';
import styled from "styled-components"

import $ from 'jquery';
const Option = Select.Option;
const MemberButton = styled.div`
    display:inline-block;
    padding:10px 30px;
    font-size:15px;
    background:#01adff;
    color:#fff;
    border-radius:5px;
`
class CustomerInfo extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            option: [],
            visible: false
        }
    }

    showModal = () => {
        this.setState({
            visible: true
        });
    }
    handleOk = () => {
        this.setState({
            visible: false
        });
    }
    handleCancel = () => {
        this.setState({
            visible: false
        });
    }
    render() {
        const plateOptions = this.state.option.map((item, index) => {
            return <Option key={index} value={item.value}>{item.text}</Option>
        })
        return <div className="gutter-example" >
            <div style={{ marginBottom: '15px' }}>
              
                <div style={{ width: '30%', display: 'inline-block' }}>单据时间：
                    <span style={{ width: '150px' }}>{this.props.form.createDate}</span>
                </div>
                <div style={{ width: '30%', display: 'inline-block' }}>开单人：
                    <span style={{ width: '150px' }}>{this.props.form.orderMaker}</span>
                </div>
            </div>
            <Card bodyStyle={{ background: '#fff' }} style={{ marginBottom: '10px' }}>
                <Row gutter={16} style={{ marginBottom: "10px" }}>
                    <Col span={8} >车牌号码：
                        <span style={{ width: '100px' }}>{this.props.form.licensePlate}</span>
                    </Col>
                    <Col span={8} >
                        客户姓名：
                        <span style={{ width: '100px' }}>{this.props.form.name}</span>
                    </Col>
                    <Col span={8}>
                        完工时间：
                        <span style={{ width: '100px' }}>{this.props.form.finishTime}</span>
                    </Col>
                    
                    
                </Row>
                <Row gutter={16} style={{ marginBottom: '10px' }}>
                    <Col span={8} >
                        车辆型号：
                        <span style={{ width: '100px' }}>{this.props.form.brand}-{this.props.form.carType}</span>
                    </Col>
                    <Col span={8}>
                        手机号码：
                        <span style={{ width: '100px' }}>{this.props.form.phone}</span>
                    </Col>
                  <Col span={8} >
                        交车时间：
                        <span style={{ width: '100px' }}>{this.props.form.deliverTime}</span>
                    </Col>
                    
                </Row>
                <Row gutter={16} style={{ marginBottom: '10px' }}>
                    <Col span={8}>
                        上次里程：
                        <span style={{ width: '100px' }}>{this.props.form.lastMiles}km</span>
                    </Col>
                      <Col span={8} >
                        停车位置：
                        <span style={{ width: '100px' }}>{this.props.form.parkingLocation}</span>
                    </Col>
                    {/*<Col span={8}>
                        历史消费：
                        <span style={{ width: '100px' }}>￥19999</span>
                    </Col>*/}
             
                   
                    
                </Row>
                <Row gutter={16} style={{ marginBottom: '10px' }}>
                    <Col span={8}>
                        本次里程：
                        <span style={{ width: '100px' }}>{this.props.form.Miles}km</span>
                    </Col>
                    {/*<Col span={8}>
                        实时积分：
                        <span style={{ width: '100px' }}>5000</span>
                    </Col>*/}
                      <Col span={8}>
                        接车时间：
                        <span style={{ width: '100px' }}>{this.props.form.pickTime}</span>
                    </Col>
                    <Col span={8}></Col>
                   
                   
                </Row>
            </Card>
        </div>
    }
}
export default CustomerInfo