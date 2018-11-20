import React from 'react';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import { Card, Button, Input, Select, Menu, Icon, Row, Col, DatePicker, Radio, message } from 'antd';
import { Link } from 'react-router';
import update from 'immutability-helper';
import $ from 'jquery';
import { hashHistory } from 'react-router'
import moment from 'moment';
import CarBrand from '../model/CarBrand.jsx';
import dateHelper from '../../utils/dateHelper.js';
const RadioGroup = Radio.Group;
const Option = Select.Option;
class ModifyClient extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            option: [],
            type: [],
            // value: '男',
            carvalue: 'true',
            carId: '',
            carModal: false,
            typeId: '',
            havetwocar: false,
            form: {
                name: '',
                age: '',
                idNumber: '',
                gender: '',
                phone: '',
                birthday: '',
                driverLicense: '',
                recommendName: '',

            },
            cars: [],
            cards: [],

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
                clientId: this.props.params.id,
            },
            success: (res) => {
                if (res.code == '0') {
                    let obj = res.client
                    let car = []

                    for (let item of obj.cars) {
                        item.insuranceEndtime = item.insuranceEndtime ? moment(item.insuranceEndtime) : ''
                        item.insuranceStarttime = item.insuranceStarttime ? moment(item.insuranceStarttime) : ''
                        item.licenseDate = item.licenseDate ? moment(item.licenseDate) : ''
                        item.models = []
                    }
                    obj.birthday = (obj.birthday) ? (obj.birthday).substring(0, 10) : ""
                    this.setState({
                        form: obj,
                        cars: obj.cars,
                        // cards:cardItem
                        cards: obj.cards
                    })
                }
            }
        })
    }
    //传数据
    saveData = (e) => {
        let forms = this.state.form;
        delete forms.cars;
        delete forms.cards;
        $.ajax({
            type: 'post',
            url: 'api/'+localStorage.getItem('store')+'/'+'client/modify',
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            data: JSON.stringify({
                id: this.props.params.id,
                ...forms,
                cars: this.state.cars,
                cards: this.state.cards
            }),

            success: (result) => {
                if (result.code == "0") {
                    window.history.go(-1);
                } else {
                    message.error(result.msg)
                }
            }
        })

    }
    genderonChange = (e) => {
        this.setState({
            value: e.target.value,
        });
        this.state.form.gender = e.target.value
    }
    isnewcar = (e) => {
        this.setState({
            carvalue: e.target.value,
        });
        this.state.form.newCar = e.target.value
    }

    licensetimeonChange = (time) => {
        this.state.form.licensetime = new Date(time);
    }
    onValueChange = (key, value) => {
        this.setState({
            form: update(this.state.form, { [key]: { $set: value } })
        })
    }
    carInfoChange = (key, value, index) => {
        if (key == 'insuranceStarttime') {
            let starttime = value.getTime();
            let endtime = (this.state.cars[index].insuranceEndtime) ? this.state.cars[index].insuranceEndtime : (value.getTime() + 1)
            if (starttime > endtime) {
                message.warning("截止时间必须大于开始时间")
            } else {
                this.setState({
                    cars: update(this.state.cars, { [index]: { [key]: { $set: value } } })
                })
            }
        }
        else if (key == 'insuranceEndtime') {
            let endtime = value.getTime();
            let starttime = (this.state.cars[index].insuranceStarttime) ? this.state.cars[index].insuranceStarttime : (value.getTime() - 1)
            if (starttime > endtime) {
                message.warning("截止时间必须大于开始时间")
            } else {
                this.setState({
                    cars: update(this.state.cars, { [index]: { [key]: { $set: value } } })
                })
            }
        } else {

            this.setState({
                cars: update(this.state.cars, { [index]: { [key]: { $set: value } } })
            })
        }
    }
    birthdayonChange = (key, value) => {
        this.setState({
            form: update(this.state.form, { [key]: { $set: new Date(value) } })
        })
    }

    saveCarData = (str, modelArray, index) => {
        this.setState({

            cars: update(this.state.cars, { [index]: { carbrand: { $set: str }, models: { $set: modelArray } } }),

        })
    }

    handleCancel2 = () => {
        this.setState({
            carModal: false
        });
    }


    TypehandleChange = (value, index) => {
        this.setState({
            cars: update(this.state.cars, { [index]: { cartype: { $set: value } } }),
        })
    }

    render() {

        const carsInfo = this.state.cars.map((item, index) => {
            const typeOptions = item.models.map((item, index) => {
                return <Option key={index} value={item.model}>{item.model}</Option>
            })

            return <Card key={index} title='车辆信息' style={{ marginTop: '20px' }}>
                <Row gutter={16} style={{ marginBottom: '15px' }}>
                    {/* <Col span={8} offset={4}>车牌号：
                           <span style={{ marginLeft: '14px' }}>{item.licensePlate}</span>
                    </Col> */}
                    <Col span={8} offset={4}><span style={{ color: "red" }}>*</span>车牌号：
                        <Input style={{ width: '150px', marginLeft: '14px' }} value={item.licensePlate} onChange={(e) => this.carInfoChange('licensePlate', e.target.value, index)} />
                    </Col>
                    <Col span={8}>是否新车：
                                    <div style={{ display: 'inline-block', marginLeft: '5px' }}>
                            <RadioGroup onChange={this.isnewcar} value={item.newCar}>
                                <Radio value={true}>是</Radio>
                                <Radio value={false}>否</Radio>
                            </RadioGroup>
                        </div>
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: '15px' }}>
                    <Col span={8} offset={4} id="car-brand">品牌车系:
                    <span style={{ marginLeft: '10px' }}>{item.carbrand}</span>
                        {this.state.carbrand == '' && <Icon type="plus-circle-o" style={{ fontSize: 20, color: '#08c' }} onClick={() => { this.setState({ carModal: true }) }} />}
                        {this.state.carbrand != '' && <Icon type="close-circle-o" style={{ marginLeft: '10px', fontSize: 16, color: '#08c' }} onClick={() => { this.setState({ carModal: true }) }} />}
                        {this.state.carModal && <CarBrand handleOk={() => { this.setState({ carModal: false }) }} saveCarData={(str, modelArray) => this.saveCarData(str, modelArray, index)} handleCancel={this.handleCancel2} visible={this.state.carModal} />}
                    </Col>
                    <Col span={8}>保险开始日期：
                            <DatePicker onChange={(time) => this.carInfoChange('insuranceStarttime', dateHelper(new Date(time)), index)} style={{ marginLeft: '10px' }} defaultValue={item.insuranceStarttime ? item.insuranceStarttime : ''}
                        />
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: '15px' }}>
                    <Col span={8} offset={4}>车辆型号:
                        <Select showSearch
                            style={{ width: '150px', marginLeft: '10px' }}
                            placeholder="请选择车辆型号"
                            optionFilterProp="children"
                            dropdownMatchSelectWidth={false}
                            allowClear={true}
                            value={item.cartype}
                            onChange={(value) => this.TypehandleChange(value, index)}
                            filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                        >
                            {typeOptions}
                        </Select>
                    </Col>
                    <Col span={8} >保险截止日期：
                            <DatePicker onChange={(time) => this.carInfoChange('insuranceEndtime', dateHelper(new Date(time)), index)} style={{ marginLeft: '10px' }} defaultValue={item.insuranceEndtime ? item.insuranceEndtime : ''}

                        />
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: '15px' }}>
                    <Col span={8} offset={4}>上次里程：
                            {/* <span style={{ marginLeft: '2px' }}>{item.lastMiles}</span> */}
                        {<Input style={{ width: '150px', marginLeft: '2px' }} value={item.lastMiles} onChange={(e) => this.carInfoChange('lastMiles', e.target.value, index)} />}
                    </Col>
                    <Col span={8} >保险金额：
                        <Input style={{ width: '155px', marginLeft: '35px' }} value={item.insuranceAmount} onChange={(e) => this.carInfoChange('insuranceAmount', e.target.value, index)} />
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: '15px' }}>
                    <Col span={8} offset={4}>本次里程：
                        {/* <span style={{ marginLeft: '2px' }}>{item.miles}</span> */}
                        {<Input style={{ width: '150px', marginLeft: '14px' }} value={item.miles} onChange={(e) => this.carInfoChange('miles', e.target.value, index)} />}
                    </Col>
                    <Col span={8} id="licTime">上牌时间：
                         <DatePicker defaultValue={item.licenseDate ? item.licenseDate : ''} onChange={(time) => this.carInfoChange('licenseDate', new Date(time), index)} style={{ marginLeft: '35px' }}
                            getCalendarContainer={() => document.getElementById('licTime')}
                        />
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: '15px' }}>
                    <Col span={8} offset={4}>车架号：
                         {/* <span style={{ marginLeft: '15px' }}>{item.frameNumber}</span> */}
                        <Input style={{ width: '155px' }} value={item.frameNumber} onChange={(e) => this.carInfoChange('frameNumber', e.target.value, index)} />

                    </Col>
                    <Col span={8} >发动机号：
                        {/* <span style={{ marginLeft: '25px' }}>{item.engineNumber}</span> */}
                        <Input style={{ width: '155px', marginLeft: '35px' }} value={item.engineNumber} onChange={(e) => this.carInfoChange('engineNumber', e.target.value, index)} />

                    </Col>
                </Row>
            </Card>

        })
        return (
            <div>
                <BreadcrumbCustom first="会员管理" second="修改客户信息" />

                <Card title='客户信息' style={{ marginTop: '15px', marginBottom: '15px' }}>
                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={8} offset={4}>姓名:
                            <Input style={{ width: '150px', marginLeft: '22px' }} value={this.state.form.name} onChange={(e) => this.onValueChange('name', e.target.value)} />
                        </Col>
                        <Col span={8}>年龄:
                            <Input style={{ width: '150px', marginLeft: '30px' }} value={this.state.form.age} onChange={(e) => this.onValueChange('age', e.target.value)} />
                        </Col>
                    </Row>

                    <Row gutter={16} style={{ marginBottom: '15px' }}>
                        <Col span={8} offset={4}>手机号:
                            <Input style={{ width: '150px', marginLeft: '10px' }} value={this.state.form.phone} onChange={(e) => this.onValueChange('phone', e.target.value)} />
                        </Col>
                        <Col span={8}>性别：
                            <div style={{ display: 'inline-block', marginLeft: '26px' }}>
                                {/* <span>{this.state.form.gender}</span> */}
                                <RadioGroup onChange={(e) => this.onValueChange('gender', e.target.value)} value={this.state.form.gender}>
                                    <Radio value={'男'}>男</Radio>
                                    <Radio value={'女'}>女</Radio>
                                </RadioGroup>
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '12px' }}>
                        <Col span={8} offset={4} id="birthday"><span >生日：</span>
                            <DatePicker onChange={(time) => this.birthdayonChange('birthday', time)} style={{ marginLeft: '15px' }} value={this.state.form.birthday ? moment(this.state.form.birthday) : ''}
                                getCalendarContainer={() => document.getElementById('birthday')}
                            />

                        </Col>
                        <Col span={8}>身份证号:
                            <Input style={{ width: '150px', marginLeft: '12px' }} value={this.state.form.idNumber} onChange={(e) => this.onValueChange('idNumber', e.target.value)} />
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '12px' }}>
                        <Col span={8} offset={4}>行驶证号:
                            <Input style={{ width: '150px', marginLeft: '0px' }} value={this.state.form.driverLicense} onChange={(e) => this.onValueChange('driverLicense', e.target.value)} />
                        </Col>
                        <Col span={8}>推荐人:
                            <Input style={{ width: '150px', marginLeft: '25px' }} value={this.state.form.recommendName} onChange={(e) => this.onValueChange('recommendName', e.target.value)} />
                        </Col>
                    </Row>
                </Card>
                {carsInfo}
                <div style={{ marginLeft: '37%', marginTop: '20px', }}>
                    <Button type="primary" style={{ marginRight: '50px' }} size='large' onClick={this.saveData}>
                        保存
                    </Button>
                    <Button type="primary" size='large'>
                        <Link to={'app/member/customer'}>取消</Link>
                    </Button>
                </div>
            </div>
        )
    }
}
export default ModifyClient