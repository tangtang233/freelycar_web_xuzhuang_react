import React from 'react';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx'
import $ from 'jquery'
import update from 'immutability-helper'
import { Link } from 'react-router';
import { Row, Col, Card, Button, Radio, DatePicker, Table, Input, Select, Icon, Modal, Popconfirm, message } from 'antd';
const Option = Select.Option;
const { RangePicker } = DatePicker,
    RadioGroup = Radio.Group;
// 日期 format
const dateFormat = 'YYYY/MM/DD';


class StaffManage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            filteredInfo: null,
            sortedInfo: null,
            visible: false,
            authorVisible: false,
            unauthorVisible: false,
            data: [],
            selectedIds: [],
            staffId: null,
            staffName: '',
            modifyIndex: null,
            positionOptions: ['店长', '维修工', '洗车工', '客户经理', '收银员', '会计'],
            levelOptions: ['初级', '中级', '高级'],
            modalstate: 'add',
            error1: '',
            error2: '',
            error3: '',
            error4: '',
            error5: '',
            error6: '',
            form: {
                id: '',
                name: '',
                gender: '',
                phone: '',
                position: '',
                level: '',
                comment: '',
                techniciansAccount: '',
                account: '',
                password: ''
            }
        }
    }
    componentDidMount() {
        this.queryStaff(1, 10)
    }
    queryStaff = (page, number) => {
        $.ajax({
            url: 'api/' + localStorage.getItem('store') + '/' + 'staff/query',
            data: {
                staffId: this.state.staffId,
                staffName: this.state.staffName,
                page: page,
                number: number
            },
            success: (result) => {
                if (result.code == "0") {
                    let datalist = result.data
                    for (let item of datalist) {
                        item.key = item.id
                    }

                    this.setState({
                        data: datalist,
                        loading: false,
                        pagination: { total: result.realSize }
                    })
                } else {
                    this.setState({
                        data: [],
                        loading: false
                    })
                    message.error(result.msg)
                }
            }
        })
    }

    setFormData = (key, value) => {
        this.setState({
            form: update(this.state.form, {
                [key]: {
                    $set: value
                }
            })
        })
    }

    handleChange = (pagination, filters, sorter) => {
        this.setState({
            filteredInfo: filters,
            sortedInfo: sorter,
        });
    }

    onDelete = (idArray) => {
        $.ajax({
            type: 'post',
            url: 'api/' + localStorage.getItem('store') + '/' + 'staff/delete',
            // contentType:'application/json;charset=utf-8',
            dataType: 'json',
            data: {
                staffIds: idArray
            },
            traditional: true,
            success: (result) => {
                if (result.code == "0") {
                    let dataSource = [...this.state.data];
                    for (let id of idArray) {
                        dataSource = dataSource.filter((obj) => {
                            return id !== obj.id;
                        });
                    }
                    this.setState({
                        data: dataSource,
                        pagination: update(this.state.pagination, { ['total']: { $set: result.realSize } })
                    });
                    message.success(result.msg)
                } else {
                    message.error(result.msg)
                }
            }
        })
    }


    // tab1模态框的处理函数

    showModal = () => {
        this.setState({
            visible: true,
            modalstate: 'add'
        });
    }
    handleOk = (e) => {
        let obj = {}
        if (this.state.modalstate == 'modify') {
            obj = {
                id: this.state.form.id,
                name: this.state.form.name,
                phone: this.state.form.phone,
                position: this.state.form.position,
                level: this.state.form.level,
                gender: this.state.form.gender,
                comment: this.state.form.comment
            }
        } else {
            obj = {
                name: this.state.form.name,
                phone: this.state.form.phone,
                position: this.state.form.position,
                level: this.state.form.level,
                gender: this.state.form.gender,
                comment: this.state.form.comment
            }
        }
        if (this.state.form.name == '') {
            this.setState({
                error1: '请填写员工姓名'
            })
        }
        if (this.state.form.gender == '') {
            this.setState({
                error2: '请选择性别'
            })
        }
        if (this.state.form.phone == '') {
            this.setState({
                error3: '请输入手机号'
            })
        }
        if (this.state.form.position == '') {
            this.setState({
                error4: '请输入职位'
            })
        }
        if (this.state.form.name !== '' && this.state.form.gender !== '' && this.state.form.phone !== '' && this.state.form.position !== '') {
            $.ajax({
                url: `api/${localStorage.getItem('store')}/staff/` + this.state.modalstate,
                type: 'post',
                dataType: 'json',
                data: obj,
                success: (result) => {
                    if (result.code == "0") {
                        if ((this.state.modalstate == 'modify') && (this.state.modifyIndex >= 0)) {
                            this.setState({
                                data: update(this.state.data, { [this.state.modifyIndex]: { $merge: this.state.form } }),
                                visible: false,
                                form: {
                                    id: '',
                                    name: '',
                                    gender: '',
                                    phone: '',
                                    position: '',
                                    level: '',
                                    comment: ''
                                }
                            })
                            message.success('修改成功', 5);
                        } else {
                            result.data.key = result.data.id
                            this.setState({
                                data: update(this.state.data, { $push: [result.data] }),
                                visible: false,
                                form: {
                                    id: '',
                                    name: '',
                                    gender: '',
                                    phone: '',
                                    position: '',
                                    level: '',
                                    comment: ''
                                }
                            })
                            message.success('增加成功', 5)
                        }
                    } else {
                        message.error(result.msg, 5);
                        this.setState({
                            visible: false,
                            form: {
                                id: '',
                                name: '',
                                gender: '',
                                phone: '',
                                position: '',
                                level: '',
                                comment: ''
                            }
                        })
                    }
                }
            })
        }
    }

    handleUnauthor = (e) => {
        let obj = {
            id: this.state.form.id,
            name: this.state.form.name,
            phone: this.state.form.phone,
            position: this.state.form.position,
            level: this.state.form.level,
            gender: this.state.form.gender,
            comment: this.state.form.comment,
            techniciansAccount: 0,
            account: this.state.form.account,
            password: this.state.form.password
        }
        $.ajax({
            url: `api/${localStorage.getItem('store')}/staff/openOrCloseStaffLoginAccount`,
            type: 'post',
            dataType: 'json',
            data: obj,
            success: (result) => {
                if (result.code == "0") {
                    message.success("关闭权限成功");
                    this.setState({
                        unauthorVisible: false
                    })
                    this.queryStaff(1, 10)
                } else {
                    message.error("关闭权限失败，如有疑问，请联系系统运维人员")
                }
            }
        })
    }
    handleAuthorOk = (e) => {

        let obj = {
            id: this.state.form.id,
            name: this.state.form.name,
            phone: this.state.form.phone,
            position: this.state.form.position,
            level: this.state.form.level,
            gender: this.state.form.gender,
            comment: this.state.form.comment,
            techniciansAccount: 1,
            account: this.state.form.account,
            password: this.state.form.password
        }
        if (this.state.form.account == '') {
            this.setState({
                error5: '请填写技师登录账号'
            })
        }
        if (this.state.form.password == '') {
            this.setState({
                error6: '请填写技师登录密码'
            })
        }
        if (this.state.form.account !== '' && this.state.form.password !== '') {
            $.ajax({
                url: `api/${localStorage.getItem('store')}/staff/openOrCloseStaffLoginAccount`,
                type: 'post',
                dataType: 'json',
                data: obj,
                success: (result) => {
                    if (result.code == "0") {
                        message.success("开通成功");
                        this.setState({
                            authorVisible: false
                        })
                        this.queryStaff(1, 10)
                    } else {
                        message.error(result.msg)
                    }
                }
            })
        }
    }

    handleTableChange = (pagination) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        })
        this.queryStaff(pagination.current, 10)
    }

    handleCancel = (e) => {
        this.setState({
            visible: false,
            form: {
                id: '',
                name: '',
                gender: '',
                phone: '',
                position: '',
                level: '',
                comment: ''
            },
            error1: '',
            error2: '',
            error3: '',
            error4: ''
        });
    }

    handleAuthorCancel = (e) => {
        this.setState({
            authorVisible: false
        })
    }
    handleUnauthorCancel = (e) => {
        this.setState({
            unauthorVisible: false
        })
    }
    modifyInfo = (record, index) => {
        this.setState({
            visible: true,
            modalstate: 'modify',
            modifyIndex: index,
            form: {
                id: record.id,
                name: record.name,
                gender: record.gender,
                phone: record.phone,
                position: record.position,
                level: record.level,
                comment: record.comment
            }
        })
    }

    authorizeCabinet = (record, index) => {
        this.setState({
            authorVisible: record.techniciansAccount == 0 ? true : false,
            unauthorVisible: record.techniciansAccount == 1 ? true : false,
            modalstate: 'authorizeCabinet',
            modifyIndex: index,
            form: {
                id: record.id,
                name: record.name,
                position: record.position
            }
        })
    }

    PreFixInterge = (num, n) => {
        //num代表传入的数字，n代表要保留的字符的长度  
        return (Array(n).join(0) + num).slice(-n);
    }
    render() {
        const positionOptions = this.state.positionOptions.map((item, index) => {
            return <Option key={index} value={item}>{item}</Option>
        }), levelOptions = this.state.levelOptions.map((item, index) => {
            return <Option key={index} value={item}>{item}</Option>
        }),
            columns = [{
                title: '序号',
                dataIndex: 'index',
                key: 'index',
                render: (text, record, index) => {
                    return <span>{index + 1}</span>
                }
            }, {
                title: '员工工号',
                dataIndex: 'id',
                key: 'id',
                render: (text, record, index) => {
                    return <span><Link to={"/app/systemSet/staffManage/" + text}>{this.PreFixInterge(text, 3)}</Link></span>
                }
            }, {
                title: '员工姓名',
                dataIndex: 'name',
                key: 'name'
            }, {
                title: '性别',
                dataIndex: 'gender',
                key: 'gender'
            }, {
                title: '手机号码',
                dataIndex: 'phone',
                key: 'phone'
            }, {
                title: '职位',
                dataIndex: 'position',
                key: 'position'
            }, {
                title: '级别',
                dataIndex: 'level',
                key: 'level'
            }, {
                title: '创建时间',
                dataIndex: 'createDate',
                key: 'createDate'
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
                        <span style={{ marginRight: '10px' }}
                            onClick={() => { this.authorizeCabinet(record, index) }}>
                            <a href="javascript:void(0);" style={{ marginRight: '15px' }}>
                                {record.techniciansAccount == "1" ? '关闭' : '开通'}
                            </a>
                        </span>
                        <span style={{ marginRight: '10px' }}
                            onClick={() => { this.modifyInfo(record, index) }}>
                            <a href="javascript:void(0);" style={{ marginRight: '15px' }}>
                                修改
                             </a>
                        </span>
                        <Popconfirm title="确认要删除嘛?" onConfirm={() => this.onDelete([record.id])}>
                            <a href="javascript:void(0);">删除</a>
                        </Popconfirm>
                    </span>
                }
            }];

        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                let selectedIds = []
                for (let item of selectedRows) {
                    selectedIds.push(item.id);
                }
                this.setState({
                    selectedIds: selectedIds
                })
            }
        }
        return (
            <div>
                <BreadcrumbCustom first="系统设置" second="员工管理" />
                <Card>
                    <div>
                        <Row>
                            <Col span={5}>
                                <div style={{ marginBottom: 16 }}>
                                    员工工号：
                                    <Input style={{ width: '140px' }} value={this.state.staffId} onChange={(e) => { this.setState({ staffId: e.target.value }) }} />
                                </div>
                            </Col>
                            <Col span={5}>
                                <div style={{ marginBottom: 16 }}>
                                    员工姓名：
                                    <Input style={{ width: '140px' }} value={this.state.staffName} onChange={(e) => { this.setState({ staffName: e.target.value }) }} />
                                </div>
                            </Col>
                            <Col span={2}>
                                <Button type="primary" onClick={() => { this.queryStaff(1, 10) }}>查询</Button>
                            </Col>
                            <Modal
                                title={this.state.modalstate == 'modify' ? '修改员工' : '新增员工'}
                                visible={this.state.visible}
                                maskClosable={false}
                                onOk={this.handleOk}
                                onCancel={this.handleCancel}
                            >
                                <Row gutter={16} style={{ marginBottom: '10px' }}>
                                    <Col span={8} style={{ textAlign: 'right' }}>
                                        员工姓名：
                                    </Col>
                                    <Col span={8}>
                                        <Input value={this.state.form.name} onChange={(e) => this.setFormData('name', e.target.value)} />
                                        <span style={{ color: 'red' }}>{this.state.error1}</span>
                                    </Col>
                                </Row>
                                <Row gutter={16} style={{ marginBottom: '10px' }}>
                                    <Col span={8} style={{ textAlign: 'right' }}>
                                        性别：
                                    </Col>
                                    <Col span={8}>
                                        <RadioGroup onChange={(e) => this.setFormData('gender', e.target.value)} value={this.state.form.gender}>
                                            <Radio value={'男'}>男</Radio>
                                            <Radio value={'女'}>女</Radio>
                                        </RadioGroup>
                                        <div style={{ color: 'red' }}>{this.state.error2}</div>
                                    </Col>
                                </Row>
                                <Row gutter={16} style={{ marginBottom: '10px' }}>
                                    <Col span={8} style={{ textAlign: 'right' }}>
                                        手机号码：
                                    </Col>
                                    <Col span={8}>
                                        <Input value={this.state.form.phone} onChange={(e) => this.setFormData('phone', e.target.value)} />
                                        <span style={{ color: 'red' }}>{this.state.error3}</span>
                                    </Col>
                                </Row>
                                <Row gutter={16} style={{ marginBottom: '10px' }} id="provider-area1">
                                    <Col span={8} style={{ textAlign: 'right' }}>
                                        职位：
                                    </Col>
                                    <Col span={8}>
                                        <Select
                                            showSearch
                                            style={{ width: '150px' }}
                                            placeholder="选择职位"
                                            optionFilterProp="children"
                                            value={this.state.form.position}
                                            onChange={(value) => this.setFormData('position', value)}
                                            filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                                            getPopupContainer={() => document.getElementById('provider-area1')}
                                        >
                                            {positionOptions}
                                        </Select>
                                        <span style={{ color: 'red' }}>{this.state.error4}</span>
                                    </Col>
                                </Row>
                                <Row gutter={16} style={{ marginBottom: '10px' }} id="provider-area">
                                    <Col span={8} style={{ textAlign: 'right' }}>
                                        级别：
                                    </Col>
                                    <Col span={8}>
                                        <Select
                                            showSearch
                                            style={{ width: '150px' }}
                                            placeholder="选择级别"
                                            value={this.state.form.level}
                                            optionFilterProp="children"
                                            onChange={(value) => this.setFormData('level', value)}
                                            filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                                            getPopupContainer={() => document.getElementById('provider-area')}
                                        >
                                            {levelOptions}
                                        </Select>
                                    </Col>
                                </Row>
                                <Row gutter={16} style={{ marginBottom: '10px' }}>
                                    <Col span={8} style={{ textAlign: 'right' }}>
                                        备注：
                                    </Col>
                                    <Col span={8}>
                                        <Input value={this.state.form.comment} onChange={(e) => this.setFormData('comment', e.target.value)} />
                                    </Col>
                                </Row>
                            </Modal>
                            {/* 技师端关闭 */}
                            <Modal
                                title="关闭技师端账号"
                                maskClosable={false}
                                visible={this.state.unauthorVisible}
                                onOk={this.handleUnauthor}
                                onCancel={this.handleUnauthorCancel}
                            >
                                <p>确定关闭技师端权限吗?</p>
                                
                            </Modal>
                            {/* 技师端开通 */}

                            <Modal
                                title={'开通技师端账号'}
                                maskClosable={false}
                                visible={this.state.authorVisible}
                                onOk={this.handleAuthorOk}
                                onCancel={this.handleAuthorCancel}
                            >
                                <Row gutter={8} style={{ marginBottom: '50px', backgroundColor: 'grey' }}>
                                    <div style={{ height: '50px', lineHeight: '50px' }}>
                                        <Col span={4} style={{ textAlign: 'right' }}>
                                            员工工号：
                                    </Col>
                                        <Col span={4}>
                                            <span>{this.state.form.id}</span>
                                        </Col>
                                        <Col span={4} style={{ textAlign: 'right' }}>
                                            员工姓名：
                                    </Col>
                                        <Col span={4}>
                                            <span>{this.state.form.name}</span>
                                        </Col>
                                        <Col span={4} style={{ textAlign: 'right' }}>
                                            职别：
                                    </Col>
                                        <Col span={4}>
                                            <span>{this.state.form.position}</span>
                                        </Col>
                                    </div>
                                </Row>
                                <Row type='flex' align='middle' gutter={8} style={{ marginBottom: '10px' }}>

                                    <Col span={10} style={{ textAlign: 'right' }}>
                                        技师登录账号：
                                    </Col>
                                    <Col span={10}>
                                        <Input value={this.state.form.account} onChange={(e) => this.setFormData('account', e.target.value)} />
                                        <span style={{ color: 'red' }}>{this.state.error5}</span>
                                    </Col>
                                </Row>
                                <Row type='flex' align='middle' gutter={8} style={{ marginBottom: '50px' }}>

                                    <Col span={10} style={{ textAlign: 'right' }}>
                                        技师登录密码：
                                    </Col>
                                    <Col span={10}>
                                        <Input type="password" value={this.state.form.password} onChange={(e) => this.setFormData('password', e.target.value)} />
                                        <span style={{ color: 'red' }}>{this.state.error6}</span>
                                    </Col>
                                </Row>

                            </Modal>
                        </Row>
                        <Row style={{ marginTop: '40px', marginBottom: '20px' }}>
                            <Col span={2}>
                                <Button onClick={() => { this.showModal() }}>新增员工</Button>
                            </Col>
                            <Col span={8}>
                                <Popconfirm title="确认删除吗?" onConfirm={() => { this.onDelete(this.state.selectedIds) }} okText="是" cancelText="否">

                                    <Button>删除员工</Button>
                                </Popconfirm>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Table
                                    loading={this.state.loading}
                                    pagination={this.state.pagination}
                                    rowSelection={rowSelection}
                                    onChange={(pagination) => this.handleTableChange(pagination)}
                                    columns={columns}
                                    dataSource={this.state.data}
                                    bordered
                                />
                            </Col>
                        </Row>
                    </div>
                </Card>
            </div>
        );
    }
}
export default StaffManage