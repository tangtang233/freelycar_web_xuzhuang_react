import React from 'react';
import CustomerInfo from '../forms/CustomerInfo.jsx'
import ServiceTable from '../tables/ServiceTable.jsx'
import PartsDetail from '../tables/PartsDetail.jsx'
import BreadcrumbCustom from '../BreadcrumbCustom.jsx'
import update from 'immutability-helper'
import { Row, Col, Upload, Card, Button, Radio, DatePicker, Table, Tabs, Input, Select, Icon, Modal, Form, Popconfirm, InputNumber, message } from 'antd';
import moment from 'moment';
import $ from 'jquery';
import PartsSearch from '../model/PartsSearch.jsx';
import { Link } from 'react-router';
const Option = Select.Option;
const { RangePicker } = DatePicker;
const FormItem = Form.Item
const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 8 }
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 10 }
    }
};


// 日期 format
const dateFormat = 'YYYY/MM/DD';
const TabPane = Tabs.TabPane;


class ItemManage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedRowKeys: [],
            // fileList: [],
            fileList: [],
            loading: false,
            visible: false,
            visibleType: false,
            selectedIds: [],
            data: [],
            form: {},
            form2: {
                name: '',
                comment: ''
            },
            programItem: [],
            projName: '',//条件查询的项目名称
            progId: '',//条件查询的项目类别id
            pagination: {},
            tabkey: 1,
            modal2: false,//modal之上的modal
            modifyRow: {},//修改的哪一条(行)数据
            modifyIndex: 0,//修改那条记录的索引
            invSelectKeys: [],//用于修改配件 回显已经选择的配件
        }
    }

    handleUploadChange = (info) => {
        let fileList = info.fileList;
        fileList = fileList.slice(-1);
        fileList = fileList.map((file) => {
            if (file.response) {
                file.url = file.response.url;
            }
            return file;
        });

        fileList = fileList.filter((file) => {
            if (file.response) {
                if (file.response.code == 0) {
                    message.success("上传成功");
                    if (file.response.repeat && file.response.repeat.length > 0) {
                        message.warn('第 ' + file.response.repeat.toString() + ' 条与原数据冲突！');
                    }
                    return file.response.status === 'success';
                }
                else {
                    message.error("上传失败！");
                    return false;
                }
            }
            return true;
        });
        this.setState({ fileList });
    }

    //public fuc 
    //为表格item设置key
    setTableDataKey = (arr) => {
        if (arr) {
            for (let item of arr) {
                if (!item.key) {
                    if (item.id) {
                        item.key = item.id;
                    } else {
                        item.key = Math.random() + '';
                    }
                }
            }
            return arr;
        } else {
            return [];
        }
    }

    //判断字符串str是否为空
    objIsNull = (str) => {
        if (str) {
            if (str == undefined || str == '')
                return true;
            else
                return false;
        }
        return true;
    }

    //初始化数据
    componentDidMount() {
        this.loadData(1, 10);
        this.loadProgram();
    }

    //条件查询
    queryData = () => {
        this.loadData(1, 10, this.state.projName, this.state.progId);
    }

    //获取数据的函数
    loadData = (page, number, proName, programId) => {
        let jsonData = {};
        jsonData.name = proName;
        jsonData.programId = (!programId || programId == -1) ? "" : programId + "";
        jsonData.page = page;
        jsonData.number = number;
        $.ajax({
            url: 'api/' + localStorage.getItem('store') + '/' + 'project/query',
            data: jsonData,
            dataType: 'json',
            type: 'get',
            success: (res) => {
                let code = res.code;
                if (code == '0') {
                    let arr = res.data;
                    this.setState({ data: this.setTableDataKey(arr), pagination: { total: res.realSize } });
                } else {
                    this.setState({ data: [] });
                }

            }

        });
    }

    //获取数据的函数
    loadDataTab2 = (page, number) => {
        let jsonData = {};
        jsonData.page = page;
        jsonData.number = number;
        $.ajax({
            url: 'api/' + localStorage.getItem('store') + '/' + 'program/list',
            data: jsonData,
            dataType: 'json',
            type: 'get',
            success: (res) => {
                let code = res.code;
                if (code == '0') {
                    let arr = res.data;
                    this.setState({ data: this.setTableDataKey(arr), pagination: { total: res.realSize } });
                } else {
                    this.setState({ data: [] });
                }
            }
        });
    }

    loadProgram = () => {
        $.ajax({
            url: 'api/' + localStorage.getItem('store') + '/' + 'program/listall',
            dataType: 'json',
            type: 'get',
            success: (res) => {
                let code = res.code;
                if (code == '0') {
                    let programItem = [];//表格显示的数据
                    let arr = res.data;
                    for (let i = 0, len = arr.length; i < len; i++) {
                        let obj = arr[i];
                        programItem.push(<Option key={obj.id}>{obj.name}</Option>);
                    }
                    this.setState({ programItem: programItem });
                }

            }
        });
    }

    handleChange = (pagination) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        })

        let tabkey = this.state.tabkey;
        if (tabkey == 1) {
            this.loadData(pagination.current, 10, this.state.projName, this.state.progId);
        } else if (tabkey == 2) {
            this.loadDataTab2(pagination.current, 10);
        }

    }

    //tab切换函数
    tabCallback = (key) => {
        if (key == 1) {
            this.loadData(1, 10);
            this.loadProgram();
        } else if (key == 2) {
            this.loadDataTab2(1, 10);
        }

        //async
        this.setState({ tabkey: key });
    }


    //新增 修改 配件 modal确认
    handleOk = (e, index) => {

        let jsonData = this.state.modifyRow;
        //check require
        if (this.objIsNull(jsonData.name)) {
            message.warn('项目名称必填项');
            return false;
        }
        if (!jsonData.program) {
            message.warn('项目类别必填项');
            return false;
        }

        $.ajax({
            type: 'post',
            url: 'api/' + localStorage.getItem('store') + '/' + 'project/add',
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(jsonData),
            traditional: true,
            success: (result) => {
                let code = result.code;
                if (code == '0') {
                    let oriData = this.state.data;
                    if (this.state.modalstate == 'modify') {
                        oriData[this.state.modifyIndex] = jsonData;
                    } else {
                        oriData.push(jsonData);
                    }
                    this.setState({
                        data: this.setTableDataKey(oriData),
                        visible: false,
                        pagination: update(this.state.pagination, { ['total']: { $set: this.state.pagination.total ? (this.state.pagination.total + 1) : 1 } })
                    });
                }

            }
        });


    }

    //为state的form
    onValueChange = (key, value, index) => {
        //之所以判断是因为 program是个对象
        if (key == 'program') {
            this.setState({
                modifyRow: update(this.state.modifyRow, { [key]: { ['name']: { $set: value.label }, ['id']: { $set: value.key } } })
            })
        } else if (key == 'inventoryInfos') {
            //修改配件数量
            this.setState({
                modifyRow: update(this.state.modifyRow, { [key]: { [index]: { ['number']: { $set: value } } } })
            })
        } else if (key == 'inventoryInfos-update') {
            //新增删除 修改配件数组
            //value传过来的一定是[]
            let inventoryInfos = [];
            for (let item of value) {
                inventoryInfos.push({ 'inventory': item, 'number': 1 });
            }
            this.setState({
                modifyRow: update(this.state.modifyRow, { 'inventoryInfos': { $set: inventoryInfos } }),
                modal2: false
            })

        } else
            this.setState({
                modifyRow: update(this.state.modifyRow, { [key]: { $set: value } })
            })
    }

    //新增项目按钮
    addProject = () => {
        //新增我要的是一个空的表单
        //这里注意一下.我们构建modifyRow的时候,把里面的对象也构建一个空对象
        this.setState({
            visible: true,
            modalstate: 'add',
            modifyRow: { 'inventoryInfos': [], 'program': {} },
        })
    }

    //修改功能
    modifyMethod = (record, index) => {
        let invSelectKeys = [];
        for (let item of record.inventoryInfos) {
            invSelectKeys.push(item.inventory.id);
        }
        this.setState({
            visible: true,
            modalstate: 'modify',
            modifyRow: record,
            modifyIndex: index,
            invSelectKeys: invSelectKeys,
        })
    }
    //项目类别的修改操作
    modifyTab2 = (record, index) => {
        this.setState({
            visibleType: true,
            form2: {
                name: record.name,
                comment: record.comment,
                id: record.id,
                index: index
            }
        })
    }

    //表格删除
    onDelete = (idArray) => {
        let tabkey = this.state.tabkey;
        let url = '';
        let data = {};
        if (tabkey == 1) {
            url = 'api/' + localStorage.getItem('store') + '/' + 'project/delete';
            data = { projectIds: idArray };
        } else if (tabkey == 2) {
            url = 'api/' + localStorage.getItem('store') + '/' + 'program/delete';
            data = { programIds: idArray };
        }

        $.ajax({
            url: url,
            data: data,
            dataType: 'json',
            type: 'post',
            traditional: true,
            success: (res) => {
                let code = res.code;
                if (code == '0' || code == '18') {
                    let dataSource = [...this.state.data];

                    for (let id of idArray) {
                        dataSource = dataSource.filter((obj) => {
                            return id !== obj.key;
                        });
                    }
                    this.setState({
                        data: dataSource,
                        pagination: update(this.state.pagination, { ['total']: { $set: res.realSize } })
                    });

                } else {
                    message.error(res.msg)
                }
            }
        });
    }

    //删除关联的配件
    onDeleteInv = (index) => {
        let invInfos = this.state.modifyRow.inventoryInfos;
        if (index > -1) {
            invInfos.splice(index, 1);
        }
        this.setState({
            modifyRow: update(this.state.modifyRow, { 'inventoryInfos': { $set: invInfos } }),
        })

    }

    //在智能柜服务中显示
    onSaleOrSoldOut = (record, index) => {
        this.setState({
            modifyRow: record,
            modifyIndex: index,
        })
        let saleStatus = 0;
        if (record.saleStatus == 0) {
            saleStatus = 1;
        }
        $.ajax({
            url: 'api/' + localStorage.getItem('store') + '/' + 'project/onSaleOrSoldOut',
            data: {
                id: record.id,
                saleStatus: saleStatus
            },
            dataType: 'json',
            type: 'get',
            success: (res) => {
                let code = res.code;
                if (code == '0') {
                    message.success("设置成功")
                    let oriData = this.state.data;
                    oriData[this.state.modifyIndex] = res.data;
                    this.setState({
                        data: this.setTableDataKey(oriData),
                        pagination: update(this.state.pagination, { ['total']: { $set: this.state.pagination.total ? (this.state.pagination.total + 1) : 1 } })
                    });
                } else {
                    message.error("设置失败")
                }
            }
        });
    }

    //tab2的函数
    //增加配件
    handleInvOn = () => {
        let obj = {};
        obj.name = this.state.form2.name;
        obj.comment = this.state.form2.comment;

        //check require
        if (obj.name == '') {
            message.warn('配件名称必填项');
            return false;
        }
        //id存在则调修改接口
        if (this.state.form2.id) {
            obj.id = this.state.form2.id;
            console.log(this.state)
            $.ajax({
                url: 'api/' + localStorage.getItem('store') + '/' + 'program/modify',
                data: obj,
                dataType: 'json',
                type: 'post',
                success: (res) => {
                    if (res.code == '0') {
                        let data = this.state.data
                        obj.key = res.data.id;
                        obj.createDate = res.data.createDate;
                        data[this.state.form2.index] = obj
                        this.setState({
                            data: data
                        });
                    }
                }
            })
        } else {
            $.ajax({
                url: 'api/' + localStorage.getItem('store') + '/' + 'program/add',
                data: obj,
                dataType: 'json',
                type: 'post',
                success: (res) => {
                    if (res.code == '0') {
                        obj.key = res.data.id;
                        obj.createDate = res.data.createDate;
                        this.setState({
                            data: [...this.state.data, obj]
                        });

                    }
                }
            })
        }
        this.setState({ visibleType: false });
    }

    //为state的form
    onValueChange2 = (key, value) => {
        if (key == 'program') {
            this.setState({
                form2: update(this.state.form2, { ['program']: { $set: value.label }, ['programId']: { $set: value.key } })
            })
        } else
            this.setState({
                form2: update(this.state.form2, { [key]: { $set: value } })
            })
    }

    render() {
        const columns = [{
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
            title: '项目类别',
            dataIndex: 'program',
            key: 'program',
            render: (text, record, index) => {
                return <span>{text ? text.name : ''}</span>
            }
        }, {
            title: '项目价格',
            dataIndex: 'price',
            key: 'price'
        }, {
            title: '参考工时',
            dataIndex: 'referWorkTime',
            key: 'referWorkTime'
        }, {
            title: '工时单价',
            dataIndex: 'pricePerUnit',
            key: 'pricePerUnit'
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
            render: (text, record, index) => {
                return (
                    <div>
                        <a onClick={() => { this.onSaleOrSoldOut(record, index) }} style={record.saleStatus == 0 ? { marginRight: '15px' } : { marginRight: '15px', color: '#E03030' }}>{record.saleStatus == 0 ? "智能柜服务" : "取消"}</a>
                        <a onClick={() => { this.modifyMethod(record, index) }} style={{ marginRight: '15px' }}>修改</a>
                        <Popconfirm title="确定要删除?" onConfirm={() => this.onDelete([record.key])}>
                            <a>删除</a>
                        </Popconfirm>
                    </div>
                );
            },
        }];

        //关联配件
        const modalInv = [{
            title: '序号',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => {
                return <span>{index + 1}</span>
            }
        }, {
            title: '配件编号',
            dataIndex: 'inventory.id',
            key: 'inventory.id'
        }, {
            title: '配件名称',
            dataIndex: 'inventory.name',
            key: 'inventory.name'
        }, {
            title: '配件品牌',
            dataIndex: 'inventory.brandName',
            key: 'inventory.brandName'
        }, {
            title: '配件类别',
            dataIndex: 'inventory.typeName',
            key: 'inventory.typeName'
        }, {
            title: '规格属性',
            dataIndex: 'inventory.property',
            key: 'inventory.property'
        }, {
            title: '配件价格',
            dataIndex: 'inventory.price',
            key: 'inventory.price'
        }, {
            title: '可用库存',
            dataIndex: 'inventory.amount',
            key: 'inventory.amount'
        }, {
            title: '数量',
            dataIndex: 'number',
            key: 'number',
            render: (value, record, index) => {
                return <InputNumber min={1} max={100} value={value ? value : 1} onChange={(e) => this.onValueChange('inventoryInfos', e, index)} />
            }
        }, {
            title: '备注',
            dataIndex: 'inventory.comment',
            key: 'inventory.comment'
        }, {
            title: '操作',
            dataIndex: 'operation',
            render: (text, record, index) => {
                return (
                    <div>
                        <Popconfirm title="确定要删除?" onConfirm={() => this.onDeleteInv(index)}>
                            <a href="#">删除</a>
                        </Popconfirm>
                    </div>
                );
            },
        }];

        const columns_tab2 = [{
            title: '序号',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => {
                return <span>{index + 1}</span>
            }
        }, {
            title: '类别名称',
            dataIndex: 'name',
            key: 'name'
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
            render: (text, record, index) => {
                return (
                    <div>
                        <a onClick={() => { this.modifyTab2(record, index) }}>修改</a>
                    </div>
                );
            },
        }];

        // rowSelection object indicates the need for row selection
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                //selectedRowKeys  key-->id
                this.setState({
                    selectedIds: selectedRowKeys
                })
            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User',    // Column configuration not to be checked
            }),
        };

        const props = {
            action: 'api/' + localStorage.getItem('store') + '/' + 'report/file',
            onChange: this.handleUploadChange,
            multiple: false,
        };

        return (
            <div >
                <BreadcrumbCustom first="产品管理" second="项目管理" />
                <Card>
                    <Tabs defaultActiveKey="1" onChange={this.tabCallback}>
                        <TabPane tab="项目管理" key="1">
                            <div>
                                <Row>
                                    <Col span={5} style={{ verticalAlign: 'middle' }}>
                                        <span>项目名称：</span>
                                        <Input style={{ width: '140px' }} value={this.state.projName} onChange={(e) => this.setState({ projName: e.target.value })} />
                                    </Col>

                                    <Col span={5}>
                                        <div>
                                            <span>项目类别：</span>
                                            <Select
                                                style={{ width: '140px' }}
                                                onChange={(e) => this.setState({ progId: e })}
                                            >
                                                <Option key='-1'>全部</Option>
                                                {this.state.programItem}
                                            </Select>
                                        </div>
                                    </Col>
                                    <Col span={8}>
                                        <Button type="primary" onClick={this.queryData}>查询</Button>
                                    </Col>
                                </Row>
                                <Row>

                                </Row>
                                <Row style={{ marginTop: '40px', marginBottom: '20px' }}>
                                    <Col span={2}>
                                        <Button onClick={() => { this.addProject() }} >新增项目</Button>
                                    </Col>
                                    <Col span={8}>
                                        <Popconfirm title="确定要删除?" onConfirm={() => this.onDelete(this.state.selectedIds)}>
                                            <Button >删除项目</Button>
                                        </Popconfirm>
                                    </Col>
                                    <Col span={3}>

                                        <Upload {...props} fileList={this.state.fileList}>
                                            <Button>
                                                <Icon type="upload" /> 上传导入文件
                                            </Button>
                                        </Upload>
                                    </Col>
                                    <Col span={3}>
                                        <a href="model/项目导入.xlsx">
                                            <Button >
                                                <Icon type="download" /> 下载导入模板
                                            </Button>
                                        </a>

                                    </Col>

                                    {/*新增的模态框*/}
                                    <Modal
                                        title={this.state.modalstate == 'add' ? "新增项目" : "修改项目"}
                                        maskClosable={false}
                                        visible={this.state.visible}
                                        onOk={this.handleOk}
                                        onCancel={() => { this.setState({ visible: false }) }}
                                        width='80%'
                                    >
                                        <Form onSubmit={this.changehandleSubmit}>

                                            <Row style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                <Col span={10} offset={2}>
                                                    <FormItem {...formItemLayout}
                                                        label="项目名称"
                                                        hasFeedback
                                                    >
                                                        <Input value={this.state.modifyRow.name} onChange={(e) => this.onValueChange('name', e.target.value)} />
                                                    </FormItem>
                                                </Col>
                                                <Col span={10} >
                                                    <FormItem
                                                        {...formItemLayout}
                                                        label="项目类别"
                                                        hasFeedback
                                                    >
                                                        <Select
                                                            style={{ width: '100%' }}
                                                            onChange={(value) => this.onValueChange('program', value)}
                                                            labelInValue
                                                            value={{ key: this.state.modifyRow.program ? (this.state.modifyRow.program.id ? this.state.modifyRow.program.id + '' : '') : '' }}
                                                        >
                                                            {this.state.programItem}
                                                        </Select>
                                                    </FormItem>
                                                </Col>
                                            </Row>

                                            <Row style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                <Col span={10} offset={2}>
                                                    <FormItem
                                                        {...formItemLayout}
                                                        label="项目价格"
                                                        hasFeedback
                                                    >
                                                        <Input value={this.state.modifyRow.price} onChange={(e) => this.onValueChange('price', e.target.value)} />
                                                    </FormItem>
                                                </Col>
                                                <Col span={10} >
                                                    <FormItem
                                                        {...formItemLayout}
                                                        label="参考工时"
                                                        hasFeedback
                                                    >
                                                        <Input value={this.state.modifyRow.referWorkTime} onChange={(e) => this.onValueChange('referWorkTime', e.target.value)} />
                                                    </FormItem>
                                                </Col>
                                            </Row>

                                            <Row style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                <Col span={10} offset={2}>
                                                    <FormItem
                                                        {...formItemLayout}
                                                        label="备注"
                                                        hasFeedback
                                                    >
                                                        <Input value={this.state.modifyRow.comment} onChange={(e) => this.onValueChange('comment', e.target.value)} />
                                                    </FormItem>
                                                </Col>
                                                <Col span={10} >
                                                    <FormItem
                                                        {...formItemLayout}
                                                        label="工时单价"
                                                        hasFeedback
                                                    >
                                                        <Input value={this.state.modifyRow.pricePerUnit} onChange={(e) => this.onValueChange('pricePerUnit', e.target.value)} />
                                                    </FormItem>
                                                </Col>
                                            </Row>

                                            <Row style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                <Button type="primary" onClick={() => { this.setState({ modal2: true }) }}>新增配件</Button>
                                                <PartsSearch invSelectKeys={this.state.invSelectKeys}
                                                    view={this.state.modal2}
                                                    handleCancel={() => { this.setState({ modal2: false }) }}
                                                    handleOk={(selectedRows) => { this.onValueChange('inventoryInfos-update', selectedRows) }}></PartsSearch>
                                            </Row>

                                            <Row style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                <Table
                                                    columns={modalInv}
                                                    dataSource={this.setTableDataKey(this.state.modifyRow.inventoryInfos)}
                                                    bordered
                                                    pagination={false}
                                                />
                                            </Row>

                                        </Form>
                                    </Modal>

                                </Row>

                                <Row>
                                    <Col span={24}>
                                        <Table
                                            rowSelection={rowSelection}
                                            columns={columns}
                                            dataSource={this.state.data}
                                            bordered
                                            pagination={this.state.pagination}
                                            onChange={(pagination) => this.handleChange(pagination)}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </TabPane>
                        <TabPane tab="项目类别" key="2">
                            <div>

                                <Row style={{ marginTop: '40px', marginBottom: '20px' }}>
                                    <Col span={2}>
                                        <Button onClick={() => this.setState({ visibleType: true,
                                            form2: {name: '', comment: ''}})}>新增</Button>
                                        {/*新增的模态框*/}
                                        <Modal
                                            title="新增类别"
                                            visible={this.state.visibleType}
                                            onOk={() => this.handleInvOn()}
                                            maskClosable={false}
                                            onCancel={() => this.setState({ visibleType: false })}
                                            width='50%'
                                        >
                                            <Form onSubmit={this.changehandleSubmit}>

                                                <Row style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                    <Col>
                                                        <FormItem {...formItemLayout}
                                                            label="类别名称"
                                                            hasFeedback
                                                        >
                                                            <Input value={this.state.form2.name} onChange={(e) => this.onValueChange2('name', e.target.value)} />
                                                        </FormItem>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <FormItem
                                                            {...formItemLayout}
                                                            label="备注"
                                                            hasFeedback
                                                        >
                                                            <Input value={this.state.form2.comment} onChange={(e) => this.onValueChange2('comment', e.target.value)} />
                                                        </FormItem>
                                                    </Col>
                                                </Row>

                                            </Form>
                                        </Modal>
                                    </Col>
                                    {/*<Col span={8}>
                                        <Button onClick={() => this.onDelete(this.state.selectedIds)}>删除</Button>
                                    </Col>*/}
                                </Row>

                                <Row>
                                    <Col span={24}>
                                        <Table
                                            //rowSelection={rowSelection}
                                            columns={columns_tab2}
                                            dataSource={this.state.data}
                                            bordered
                                            pagination={this.state.pagination}
                                            onChange={(pagination) => this.handleChange(pagination)}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </TabPane>
                    </Tabs>
                </Card>
            </div >
        );
    }
}
export default ItemManage