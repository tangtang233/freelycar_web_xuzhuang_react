import React from 'react';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx'
import $ from 'jquery'
import update from 'immutability-helper'
import moment from 'moment';
import { Link } from 'react-router';
import { hashHistory } from 'react-router'
import { Row, Col, Card, Button, Radio, DatePicker, TimePicker, Table, Input, Select, Icon, Modal, Popconfirm, message, Upload } from 'antd';

import ProgramSearch from '../model/ProgramSearch.jsx'
import PreferenceItem from '../model/PreferenceItem.jsx'
const Option = Select.Option;
const { RangePicker } = DatePicker,
    RadioGroup = Radio.Group;
// 日期 format
const format = 'HH:mm';

class StaffManage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            previewVisible: false,
            previewImage: '',
            fileList: [],//上传的图片的fileList
            imgUrlList: [],//详情返回的图片urlList
            loading: true,
            filteredInfo: null,
            storeName: '',
            storeAddress: '',
            openingTime: undefined,
            closingTime: undefined,
            storePhone: '',
            projectModalVisible: false,//项目模态框的显示开关
            projectSelectedRows: [],
            repairModalVisible: false,//维修模态框的显示开关
            repairSelectedRows: [],
            activityModalVisible: false,//优惠活动模态框的显示开关
            activitySelectedRows: [],
            data: [],
            selectedIds: [],
            staffId: null,
            staffName: '',
            modifyIndex: null,
            positionOptions: ['店长', '维修工', '洗车工', '客户经理', '收银员', '会计'],
            levelOptions: ['  ', '初级', '中级', '高级'],
            form: {
                id: '',
                name: '',
                gender: '',
                phone: '',
                position: '',
                level: '',
                comment: ''
            }
        }
    }
    componentDidMount() {
        //this.getStoreEvaluation(1, 10);
        this.getStoreDetail();
    }

    getStoreDetail() {
        if (!this.props.params.storeId) {
            return;
        }

        $.ajax({
            url: 'api/' + localStorage.getItem('store') + '/' + 'store/detail',
            dataType: 'json',
            type: 'get',
            data: { storeId: this.props.params.storeId },
            success: (result) => {
                if (result.code == '0') {
                    let obj = result.data;
                    //图片
                    let imgList = []
                    for (let item of result.data.imgUrls) {
                        let imgObj = {
                            uid: item.id,
                            name: 'showpic',
                            status: 'done',
                            url: 'http://www.freelycar.com/jinao/store/' + item.url,
                            response: item.url,
                        }
                        imgList.push(imgObj)
                    }

                    //美容项目
                    //state
                    let proState = this.state.projectSelectedRows;
                    let repState = this.state.repairSelectedRows;

                    let projects = obj.storeProjects;
                    for (let item of projects) {
                        let project = item.project;
                        project.key = project.id;
                        let type = project.program.id;
                        if (type == 3) {//美容
                            proState.push(project);
                        } else if (type == 4) {//维修
                            repState.push(project);
                        }
                    }

                    //优惠活动
                    let actState = this.state.activitySelectedRows;
                    let acts = obj.storefavours;
                    for (let item of acts) {
                        let favour = item.favour;
                        favour.key = favour.id;
                        actState.push(favour);
                    }

                    this.setState({
                        fileList: imgList,
                        storeName: obj.name,
                        storeAddress: obj.address,
                        imgUrlList: obj.imgUrls,
                        openingTime: moment(obj.openingTime, format),
                        closingTime: moment(obj.closingTime, format),
                        storePhone: obj.phone,
                        projectSelectedRows: proState,
                        repairSelectedRows: repState,
                        activitySelectedRows: actState,
                    });
                }
            }
        })
    }

    //获取门店评价
    getStoreEvaluation = (page, number) => {
        if (this.props.params.storeId) {
            let objData = {
                page: page,
                number: number,
                storeId: this.props.params.storeId
            }

            $.ajax({
                url: 'api/' + localStorage.getItem('store') + '/' + 'store/evaluation',
                dataType: 'json',
                type: 'get',
                data: objData,
                success: (result) => {
                    if (result.code == '0') {
                        this.setState({
                            options: result.data
                        })
                    }
                }
            })
        }
    }

    saveStore = () => {
        let objData = {
            name: this.state.storeName,
            address: this.state.storeAddress,
            latitude: 118.89157,
            longitude: 32.087214,
            openingTime: this.state.openingTime.format(format),
            closingTime: this.state.closingTime.format(format),
            phone: this.state.storePhone
        };

        //美容项目
        let proselect = this.state.projectSelectedRows;
        let repselect = this.state.repairSelectedRows;
        Array.prototype.push.apply(proselect, repselect);

        let proArr = [];
        for (let item of proselect) {
            let storeItem = {};
            let project = {};
            project.id = item.id;
            storeItem.project = project;

            proArr.push(storeItem);
        }
        objData.storeProjects = proArr;

        //优惠项目
        let actselect = this.state.activitySelectedRows;
        let actArr = [];
        for (let item of actselect) {
            let actItem = {};
            let favour = {};
            favour.id = item.id;
            actItem.favour = favour;

            actArr.push(actItem);
        }
        objData.storefavours = actArr;



        //区分修改 | 添加
        let url = 'api/' + localStorage.getItem('store') + '/' + 'store/add';
        let message = '添加成功';
        if (this.props.params.storeId) {
            url = 'api/' + localStorage.getItem('store') + '/' + 'store/modify';
            objData.id = this.props.params.storeId;
            message = '更新成功';
        }


        let imgUrlList = [];
        let fileList = this.state.fileList;
        for (let file of fileList) {
            let imgUrl = {};
            imgUrl.url = file.response;
            imgUrlList.push(imgUrl);
        }

        objData.imgUrls = imgUrlList;

        $.ajax({
            url: url,
            dataType: 'json',
            type: 'post',
            data: JSON.stringify(objData),
            traditional: true,
            contentType: 'application/json;charset=utf-8',
            success: (result) => {
                if (result.code == '0') {
                    message.success(message)
                    hashHistory.push(`/app/systemSet/storeManage`);
                }
            }
        })
    }



    //照片墙的函数
    handleCancel = () => this.setState({ previewVisible: false })

    handlePreview = (file) => {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    }

    handleChange = ({ file, fileList }) => {
        this.setState({ fileList })
    }

    //end 照片墙的函数

    setFormData = (key, value) => {
        this.setState({
            form: update(this.state.form, {
                [key]: {
                    $set: value
                }
            })
        })
    }



    handleTableChange = (pagination) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        })
        this.queryStaff(pagination.current, 10)
    }


    PreFixInterge = (num, n) => {
        //num代表传入的数字，n代表要保留的字符的长度  
        return (Array(n).join(0) + num).slice(-n);
    }

    render() {

        const { previewVisible, previewImage, fileList } = this.state;
        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">Upload</div>
            </div>
        );

        const positionOptions = this.state.positionOptions.map((item, index) => {
            return <Option key={index} value={item}>{item}</Option>
        }), levelOptions = this.state.levelOptions.map((item, index) => {
            return <Option key={index} value={item}>{item}</Option>
        }),
            beauty = [{
                title: '序号',
                dataIndex: 'index',
                key: 'index',
                render: (text, record, index) => {
                    return <span>{index + 1}</span>
                }
            }, {
                title: '项目名称',
                dataIndex: 'name',
                key: 'name'
            }, {
                title: '项目价格',
                dataIndex: 'price',
                key: 'price'
            }, {
                title: '备注',
                dataIndex: 'comment',
                key: 'comment'
            }, {
                title: '操作',
                dataIndex: 'operation',
                key: 'operation',
                render: (text, record, index) => {
                    return <span>
                        <Popconfirm title="确认要删除嘛?" onConfirm={() => {
                            let proRows = this.state.projectSelectedRows;
                            proRows.splice(index, 1);
                            this.setState({ projectSelectedRows: proRows });
                        }}>
                            <a href="javascript:void(0);">删除</a>
                        </Popconfirm>
                    </span>
                }
            }],
            repair = [{
                title: '序号',
                dataIndex: 'index',
                key: 'index',
                render: (text, record, index) => {
                    return <span>{index + 1}</span>
                }
            }, {
                title: '项目名称',
                dataIndex: 'name',
                key: 'name'
            }, {
                title: '参考工时',
                dataIndex: 'referWorkTime',
                key: 'referWorkTime'
            }, {
                title: '工时单价',
                dataIndex: 'pricePerUnit',
                key: 'pricePerUnit'
            }, {
                title: '参考价格',
                dataIndex: 'price',
                key: 'price'
            }, {
                title: '备注',
                dataIndex: 'comment',
                key: 'comment'
            }, {
                title: '操作',
                dataIndex: 'operation',
                key: 'operation',
                render: (text, record, index) => {
                    return <span>

                        <Popconfirm title="确认要删除嘛?" onConfirm={() => {
                            let proRows = this.state.repairSelectedRows;
                            proRows.splice(index, 1);
                            this.setState({ repairSelectedRows: proRows });
                        }}>
                            <a href="javascript:void(0);">删除</a>
                        </Popconfirm>
                    </span>
                }
            }],
            //优惠
            preferential = [{
                title: '序号',
                dataIndex: 'index',
                key: 'index',
                render: (text, record, index) => {
                    return <span>{index + 1}</span>
                }
            }, {
                title: '券名',
                dataIndex: 'name',
                key: 'name'
            }, {
                title: '券种',
                dataIndex: 'type',
                key: 'type',
                render: (text, record, index) => {
                    return <span>{text == 1 ? '抵用券' : '代金券'}</span>
                }
            }, {
                title: '有效时间',
                dataIndex: 'validTime',
                key: 'validTime',
                render: (text, record, index) => {
                    return <span>{text}个月</span>
                }
            }, {
                title: '优惠项目',
                dataIndex: 'set',
                key: 'set',
                render: (text, record, index) => {
                    let names = ''
                    for (let item of record.set) {
                        names = names + (names !== '' ? '、' : '') + item.project.name
                    }
                    return <div>
                        {names}
                    </div>
                }
            }, {
                title: '项目原价',
                dataIndex: 'initalPrice',
                key: 'initalPrice',
                render: (text, record, index) => {
                    let totalprice = 0
                    for (let item of record.set) {
                        totalprice = item.project.price + totalprice
                    }
                    return <div>{totalprice}</div>
                }
            }, {
                title: '项目现价',
                dataIndex: 'presentPrice',
                key: 'presentPrice',
                render: (text, record, index) => {
                    let totalprice = 0
                    for (let item of record.set) {
                        totalprice = item.presentPrice + totalprice
                    }
                    return <div>{totalprice}</div>
                }
            }, {
                title: '操作',
                dataIndex: 'operation',
                key: 'operation',
                render: (text, record, index) => {
                    return <span>
                        <Popconfirm title="确认要删除嘛?" onConfirm={() => {
                            let proRows = this.state.activitySelectedRows;
                            proRows.splice(index, 1);
                            this.setState({ activitySelectedRows: proRows });
                        }}>
                            <a href="javascript:void(0);">删除</a>
                        </Popconfirm>
                    </span>
                }
            }],
            //评价
            evaluation = [{
                title: '序号',
                dataIndex: 'index',
                key: 'index',
                render: (text, record, index) => {
                    return <span>{index + 1}</span>
                }
            }, {
                title: '项目名称',
                dataIndex: 'id',
                key: 'id'
            }, {
                title: '参考工时',
                dataIndex: 'name',
                key: 'name'
            }, {
                title: '工时单价',
                dataIndex: 'name1',
                key: 'name1'
            }, {
                title: '参考价格',
                dataIndex: 'name2',
                key: 'name2'
            }, {
                title: '备注',
                dataIndex: 'gender',
                key: 'gender'
            }, {
                title: '操作',
                dataIndex: 'operation',
                key: 'operation',
                render: (text, record, index) => {
                    return <span>
                        <span style={{ marginRight: '10px' }} onClick={() => { this.modifyInfo(record, index) }}> <a href="javascript:void(0);" style={{ marginRight: '15px' }}>修改</a></span>

                        <Popconfirm title="确认要删除嘛?" onConfirm={() => this.onDelete([record.id])}>
                            <a href="javascript:void(0);">删除</a>
                        </Popconfirm>
                    </span>
                }
            }];
        return (
            <div>
                <BreadcrumbCustom first="门店管理" second={this.props.params.storeId ? '编辑门店' : '新增门店'} />

                <Card title='基本信息' className='store-card-magin' >
                    <Row gutter={16} className='store-row-magin'>
                        <Col span={8} offset={4} >
                            <Row className='store-row-magin'>
                                门店名称：
                                    <Input style={{ width: '140px' }} value={this.state.storeName} onChange={(e) => { this.setState({ storeName: e.target.value }) }} />
                            </Row>
                            <Row className='store-row-magin'>
                                门店地址：
                                    <Input style={{ width: '140px' }} value={this.state.storeAddress} onChange={(e) => { this.setState({ storeAddress: e.target.value }) }} />
                            </Row>
                            <Row className='store-row-magin'>
                                营业时间：
                                    <TimePicker value={this.state.openingTime} format={format} onChange={(e) => { this.setState({ openingTime: e }) }} /> ~
                                    <TimePicker value={this.state.closingTime} format={format} onChange={(e) => { this.setState({ closingTime: e }) }} />
                            </Row>
                            <Row className='store-row-magin'>
                                客服电话：
                                    <Input style={{ width: '140px' }} value={this.state.storePhone} onChange={(e) => { this.setState({ storePhone: e.target.value }) }} />
                            </Row>
                        </Col>

                        <Col span={12}>
                            上传图片
                                <div className="clearfix">
                                <Upload
                                    action={`api/${localStorage.getItem('store')}/store/addPicture`}
                                    listType="picture-card"
                                    fileList={fileList}
                                    onPreview={this.handlePreview}
                                    onChange={this.handleChange}
                                    data={(file) => {
                                        return {
                                            upload: file
                                        }
                                    }}
                                >
                                    {fileList.length >= 3 ? null : uploadButton}
                                </Upload>
                                <Modal visible={previewVisible} 
                                 maskClosable={false}
                                footer={null} onCancel={this.handleCancel}>
                                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                                </Modal>
                            </div>
                        </Col>
                    </Row>
                </Card>

                <Card title='服务项目' className='store-card-magin' >
                    <div className='store-table-title'>汽车美容&nbsp;&nbsp;<Icon type="plus-circle-o" onClick={() => { this.setState({ projectModalVisible: true }) }} /></div>
                    <Table
                        columns={beauty}
                        dataSource={this.state.projectSelectedRows}
                        bordered
                    />
                    <ProgramSearch
                        view={this.state.projectModalVisible}
                        programId={3}
                        handleCancel={() => { this.setState({ projectModalVisible: false }) }}
                        handleOk={(selectedRows) => { this.setState({ projectSelectedRows: selectedRows, projectModalVisible: false }) }}
                    />

                    <div className='store-table-title'>商品&nbsp;&nbsp;<Icon type="plus-circle-o" onClick={() => { this.setState({ repairModalVisible: true }) }} /></div>
                    <Table
                        columns={repair}
                        dataSource={this.state.repairSelectedRows}
                        bordered
                    />
                    <ProgramSearch
                        view={this.state.repairModalVisible}
                        handleCancel={() => { this.setState({ repairModalVisible: false }) }}
                        programId={4}
                        handleOk={(selectedRows) => { this.setState({ repairSelectedRows: selectedRows, repairModalVisible: false }) }}
                    />

                </Card>

                <Card title='优惠活动' className='store-card-magin' >
                    <div className='store-table-title'>优惠项目&nbsp;&nbsp;<Icon type="plus-circle-o" onClick={() => { this.setState({ activityModalVisible: true }) }} /></div>
                    <Table
                        columns={preferential}
                        dataSource={this.state.activitySelectedRows}
                        bordered
                    />

                    <PreferenceItem type={'1'} view={this.state.activityModalVisible} handleCancel={() => { this.setState({ activityModalVisible: false }) }} handleOk={(selectedRows) => { this.setState({ activitySelectedRows: selectedRows, activityModalVisible: false }) }}
                        ticketSelectKeys={this.state.ticketSelectKeys}
                    />
                </Card>

                <Row style={{ textAlign: 'center' }}>
                    <Button type="primary" size='large' onClick={() => { this.saveStore() }}>保存</Button>
                    <Button size='large' onClick={() => { hashHistory.push(`/app/systemSet/storeManage`) }}>取消</Button>
                </Row>

            </div>
        );
    }
}
export default StaffManage