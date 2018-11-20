import React from 'react';
import CustomerInfo from '../forms/CustomerInfo.jsx'
import ServiceTable from '../tables/ServiceTable.jsx'
import PartsDetail from '../tables/PartsDetail.jsx'
import BreadcrumbCustom from '../BreadcrumbCustom.jsx'
import update from 'immutability-helper'
import { Row, Col, Card, Button, Radio, DatePicker, Table, Tabs, Input, Select, Icon, Modal, Popconfirm, Form, message,Upload } from 'antd';
import moment from 'moment';
import $ from 'jquery';
const Option = Select.Option;
import { Link } from 'react-router';
import AddPartModal from '../model/AddPartModal.jsx';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;

// 日期 format
const dateFormat = 'YYYY/MM/DD';
const TabPane = Tabs.TabPane;

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 10 }
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 10 }
    }
};

class BeautyOrder extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedRowKeys: [],
            providers: [],
            loading: false,
            visible: false,
            visible2: false,
            visible3: false,
            modalTitle: '',//modal titile
            data: [],
            tabkey: 1,
            fileList:[],
            modifyIndex: undefined,//编辑的行数
            form: {},
            form2: {
                typeName: '',
                comment: '',
                name: ''
            },
            brandItem: [],//配件品牌
            typeItem: [],
            inventoryName: '',//条件查询的配件名称
            inventoryTypeId: '',//条件查询的配件类别id
            inventoryBrandName: '',//条件查询的配件品牌名称
            pagination: {}
        }
    }

    //表格操作
    onCellChange = (index, key) => {
        return (value) => {
            const dataSource = [...this.state.data];
            dataSource[index][key] = value;
            this.setState({ dataSource });
        };
    }
    onDelete = (idArray) => {
        let url = '';
        let data = {};
        if (this.state.tabkey == 1) {
            url = 'api/'+localStorage.getItem('store')+'/'+'inventory/delete';
            data = { inventoryIds: idArray };
        } else if (this.state.tabkey == 2) {
            url = 'api/'+localStorage.getItem('store')+'/'+'inventory/deltype';
            data = { inventoryTypeIds: idArray };
        } else if (this.state.tabkey == 3) {
            url = 'api/'+localStorage.getItem('store')+'/'+'inventory/delbrand';
            data = { inventoryBrandIds: idArray };
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
                    message.warning(res.msg);
                }
            }
        });
    }

    // tab1模态框的处理函数
    showModal = (modalTitle, record, index) => {
        console.log(record);
        if (record) {
            record.providerId = record.provider.id;
            record.providerName = record.provider.name;
        }
        this.setState({
            // visible: true,
            modalTitle: modalTitle,
            form: record ? record : {},
            modifyIndex: (index >= 0) ? index : undefined,
        },() => this.setState({visible: true}));
    }

    handleCancel = (e) => {
        this.setState({
            visible: false,
            form: {}
        });
    }

    addPartSuccess = () => {
        this.setState({
            visible: false,
            form: {},
            pagination: {current: 1}
        });
        this.loadData(1, 10);
    }

    //切换tab 在这里调用ajax获取数组 赋值给data
    tabCallback = (key) => {
        if (key == 1) {
            this.loadData(1, 10);
            this.loadPjBrand(1, 99);
            this.loadPjType(1, 99);
        } else if (key == 2) {
            this.loadPjData(1, 10);
        } else if (key == 3) {
            this.loadPjBrandData(1, 10);
        }
        //async
        this.setState({ tabkey: key });
    }

    //初始化数据
    componentDidMount() {
        this.loadData(1, 10);
        this.loadPjBrand(1, 99);
        this.loadPjType(1, 99);
        this.getProvider();
    }

    //获取供应商
    getProvider = () => {
        $.ajax({
            type: 'get',
            data: { page: 1, number: 99 },
            url: 'api/'+localStorage.getItem('store')+'/'+'provider/list',
            dataType: 'json',
            success: (result) => {
                if (result.code == '0') {
                    this.setState({
                        providers: result.data
                    });
                }
            }
        });
    }

    //条件查询
    queryData = () => {
        this.loadData(1, 10, this.state.inventoryName, this.state.inventoryTypeId);
    }

    //tab2条件查询
    showModal2 = () => {
        this.setState({
            visible2: true,
        });
    }

    handleCancel2 = (e) => {
        this.setState({
            visible2: false,
            form2: {
                typeName: '',
                comment: '',
                name: ''
            }
        });
    }

    queryData2 = () => {
        this.loadPjData(1, 10, this.state.inventoryName);
    }

    handleOk2 = (e) => {
        let form = this.state.form2;
        var obj = {};
        obj.typeName = form.typeName;
        obj.comment = form.comment;


        //check require
        if (obj.typeName == '') {
            message.warn('配件类别名称必填项');
            return false;
        }

        $.ajax({
            type: 'post',
            url: 'api/'+localStorage.getItem('store')+'/'+'inventory/addtype',
            dataType: 'json',
            data: obj,
            success: (result) => {
                if (result.code == '0') {
                    let obj = result.data;
                    obj.key = obj.id;
                    this.setState({
                        data: [...this.state.data, obj],
                        visible2: false,
                        form2: {
                            typeName: '',
                            comment: '',
                            name: ''
                        }
                    });
                }
            }
        });
    }

    //tab3条件查询
    queryData3 = () => {
        this.loadPjBrandData(1, 10, this.state.inventoryBrandName);
    }

    showModal3 = () => {
        this.setState({
            visible3: true,
            form2: {
                typeName: '',
                comment: '',
                name: ''
            }
        });
    }
    handleOk3 = (e) => {
        let form = this.state.form2;
        var obj = {};
        obj.name = form.name;
        obj.comment = form.comment;

        if (form.name == '') {
            message.warn('品牌名称必填项');
            return false;
        }
        $.ajax({
            type: 'post',
            url: 'api/'+localStorage.getItem('store')+'/'+'inventory/addbrand',
            dataType: 'json',
            data: obj,
            success: (result) => {
                if (result.code == '0') {
                    let obj = result.data;
                    obj.key = obj.id;
                    this.setState({
                        data: [...this.state.data, obj],
                        visible3: false,
                        form2: {
                            typeName: '',
                            comment: '',
                            name: ''
                        }
                    });
                }
            }
        });
    }

    handleCancel3 = (e) => {
        this.setState({
            visible3: false,
        });
    }

    handlePageChange = (tab, p) => {
        if (tab == 'tab1') {
            this.loadData(p.current, 10, this.state.inventoryName, this.state.inventoryTypeId);
        } else if (tab == 'tab2') {
            this.loadPjData(p.current, 10, this.state.inventoryName);
        } else if (tab == 'tab3') {
            this.loadPjBrandData(p.current, 10, this.state.inventoryBrandName);
        }
    }

    //获取数据的函数
    loadData = (page, number, name, typeId) => {
        let jsonData = {};
        jsonData.name = name;
        jsonData.typeId = (!typeId || typeId == -1) ? "" : typeId;
        jsonData.page = page;
        jsonData.number = number;
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'inventory/list',
            data: jsonData,
            dataType: 'json',
            type: 'get',
            success: (res) => {
                let code = res.code;
                let tableDate = [];//表格显示的数据
                if (code == '0') {
                    let arr = res.data;
                    for (let item of arr) {
                        item.key = item.id;
                    }
                    this.setState({ data: arr, pagination: { total: res.realSize }, });
                }
            }
        });
    }
    //获取配件类型
    loadPjData = (page, number, name) => {
        let jsonData = {};
        jsonData.name = name;
        jsonData.page = page;
        jsonData.number = number;
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'inventory/querytype',
            data: jsonData,
            dataType: 'json',
            type: 'get',
            success: (res) => {
                let code = res.code;
                let tableDate = [];//表格显示的数据
                if (code == '0') {
                    let arr = res.data;
                    for (let i = 0, len = arr.length; i < len; i++) {
                        let obj = arr[i];
                        let tableItem = {};
                        for (let item in obj) {
                            if (item == 'id') {
                                tableItem.key = obj[item];
                                tableItem.number = obj[item];
                            }
                            else if (item == 'type')
                                tableItem.typeName = obj[item].typeName;
                            else if (item == 'brand')
                                tableItem.brand = obj[item].name;
                            else
                                tableItem[item] = obj[item];
                        }
                        tableDate.push(tableItem);
                    }
                    this.setState({ data: tableDate, pagination: { total: res.realSize } });
                } else {
                    this.setState({ data: tableDate });
                }
            }
        });
    }

    //获取配件品牌
    loadPjBrandData = (page, number, name) => {
        let jsonData = {};
        jsonData.page = page;
        jsonData.number = number;
        jsonData.name = name;
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'inventory/querybrand',
            data: jsonData,
            dataType: 'json',
            type: 'get',
            success: (res) => {
                let code = res.code;
                let tableDate = [];//表格显示的数据
                if (code == '0') {
                    let arr = res.data;
                    for (let i = 0, len = arr.length; i < len; i++) {
                        let obj = arr[i];
                        let tableItem = {};
                        for (let item in obj) {
                            if (item == 'id') {
                                tableItem.key = obj[item];
                                tableItem.number = obj[item];
                            }
                            else if (item == 'type')
                                tableItem.typeName = obj[item].typeName;
                            else if (item == 'brand')
                                tableItem.brand = obj[item].name;
                            else
                                tableItem[item] = obj[item];
                        }
                        tableDate.push(tableItem);
                    }
                    this.setState({ data: tableDate, pagination: { total: res.realSize } });
                } else {
                    this.setState({ data: tableDate });
                }
            }
        });
    }

    //获取配件品牌 下拉select
    loadPjBrand = (page, number) => {
        let jsonData = {};
        jsonData.page = page;
        jsonData.number = number;
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'inventory/querybrand',
            dataType: 'json',
            data: jsonData,
            type: 'get',
            success: (res) => {
                let code = res.code;
                if (code == '0') {
                    let brandItem = [];//表格显示的数据
                    let arr = res.data;
                    for (let i = 0, len = arr.length; i < len; i++) {
                        let obj = arr[i];
                        brandItem.push(<Option key={obj.id}>{obj.name}</Option>);
                    }
                    this.setState({ brandItem: brandItem });
                }
            }
        });
    }

    //获取配件类别 下拉
    loadPjType = (page, number) => {
        let jsonData = {};
        jsonData.page = page;
        jsonData.number = number;
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'inventory/querytype',
            dataType: 'json',
            data: jsonData,
            type: 'get',
            success: (res) => {
                let code = res.code;
                if (code == '0') {
                    let typeItem = [];//表格显示的数据
                    let arr = res.data;
                    for (let i = 0, len = arr.length; i < len; i++) {
                        let obj = arr[i];
                        typeItem.push(<Option key={obj.id}>{obj.typeName}</Option>);
                    }
                    this.setState({ typeItem: typeItem });
                }
            }
        });
    }

    //为state的form2
    onValueChange2 = (key, value) => {
        this.setState({
            form2: update(this.state.form2, { [key]: { $set: value } })
        })
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
            console.log(file.response)
            if (file.response) {
                if (file.response.code == 0) {
                    message.success("上传成功");
                    if (file.response.repeat && file.response.repeat.length > 0) {
                        message.warn('第 ' + file.response.repeat.toString() + ' 与原数据冲突！');
                    }
                    return file.response.status === 'success';
                } else {
                    message.error("上传失败！");
                    return false;
                }
            }
            return true;
        });

        this.setState({ fileList });
    }

    render() {
        //tab1的 表头
        const columns = [{
            title: '序号',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => {
                return <span>{index + 1}</span>
            }
        }, {
            title: '配件编号',
            dataIndex: 'id',
            key: 'id'
        }, {
            title: '厂家编号',
            dataIndex: 'manufactureNumber',
            key: 'manufactureNumber'
        }, {
            title: '配件名称',
            dataIndex: 'name',
            key: 'name'
        }, {
            title: '配件类别',
            dataIndex: 'typeName',
            key: 'typeName'
        }, {
            title: '配件品牌',
            dataIndex: 'brandName',
            key: 'brandName'
        }, {
            title: '规格',
            dataIndex: 'standard',
            key: 'standard'
        }, {
            title: '属性',
            dataIndex: 'property',
            key: 'property'
        }, {
            title: '配件价格',
            dataIndex: 'price',
            key: 'price'
        }, {
            title: '供应商',
            dataIndex: 'provider',
            key: 'provider',
            render: (text, record, index) => {
                return <span>{text ? text.name : record.provider}</span>
            }
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
                        <a onClick={() => this.showModal('编辑配件', record, index)}>修改</a>
                        &nbsp;
                        &nbsp;
                        &nbsp;
                        <Popconfirm title="确认要删除吗?" onConfirm={() => this.onDelete([record.key])}>
                            <a href="#">删除</a>
                        </Popconfirm>
                    </div>
                );
            }
        }];

        // tab2中的表头
        const columns2 = [{
            title: '序号',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => {
                return <span>{index + 1}</span>
            }
        }, {
            title: '类别名称',
            dataIndex: 'typeName',
            key: 'typeName'
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
                        <Popconfirm title="确认要删除吗?" onConfirm={() => this.onDelete([record.key])}>
                            <a href="#">删除</a>
                        </Popconfirm>
                    </div>
                );
            }
        }];

        // tab3中的表格
        const columns3 = [{
            title: '序号',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => {
                return <span>{index + 1}</span>
            }
        }, {
            title: '配件品牌',
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
                        <Popconfirm title="确认要删除吗?" onConfirm={() => this.onDelete([record.key])}>
                            <a href="#">删除</a>
                        </Popconfirm>
                    </div>
                );
            }
        }];

        //表格公用的多选框
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                //selectedRowKeys  key-->id
                this.setState({
                    selectedRowKeys: selectedRowKeys
                })
            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User',    // Column configuration not to be checked
            }),
        };

        const providers = this.state.providers.map((item, index) => {
            return <Option key={item.id} value={item.id + ''} >{item.name}</Option>
        })
 
        const props = {
            action: 'api/'+localStorage.getItem('store')+'/'+'report/inventory',
            onChange: this.handleUploadChange,
            multiple: false,
        };

        return (
            <div>
                <BreadcrumbCustom first="产品管理" second="配件管理" />
                <Card>
                    <Tabs defaultActiveKey="1" onTabClick={(key) => this.tabCallback(key)}>
                        <TabPane tab="配件管理" key="1">
                            <div>
                                <Row>
                                    <Col span={5} style={{ verticalAlign: 'middle' }}>
                                        <div style={{ marginBottom: 16 }} >
                                            <span>配件名称：</span>
                                            <Input style={{ width: '140px' }} onChange={(e) => this.setState({ inventoryName: e.target.value })} />
                                        </div>
                                    </Col>

                                    <Col span={5} style={{ verticalAlign: 'middle' }}>
                                        <span>配件类别: </span>
                                        <Select
                                            addonBefore="配件类别"
                                            style={{ width: '140px' }}
                                            onChange={(value) => this.setState({ inventoryTypeId: value })}
                                        >
                                            <Option key='-1'>全部</Option>
                                            {this.state.typeItem}
                                        </Select>
                                    </Col>

                                    <Col span={2}>
                                        <Button type="primary" onClick={this.queryData}>查询</Button>
                                    </Col>
                                    <Col span={3}>

                                        <Upload {...props} fileList={this.state.fileList}>
                                            <Button>
                                                <Icon type="upload" /> 上传导入文件
                                            </Button>
                                        </Upload>
                                    </Col>
                                    <Col span={3}>
                                        <a href="model/配件导入.xlsx">
                                            <Button >
                                                <Icon type="download" /> 下载导入模板
                                            </Button>
                                        </a>

                                    </Col>
                                </Row>
                                <Row style={{ marginTop: '40px', marginBottom: '20px' }}>
                                    <Col span={2}>
                                        <Button onClick={() => this.showModal('新增配件')}>新增配件</Button>
                                    </Col>
                                    <Col span={8}>
                                        <Popconfirm title="确定要删除?" onConfirm={() => this.onDelete(this.state.selectedRowKeys)}>
                                            <Button >删除配件</Button>
                                        </Popconfirm>
                                    </Col>
                                    <AddPartModal
                                        pageName='PartsManage'
                                        cancel={() => this.handleCancel()}
                                        onOk={() => this.addPartSuccess()}
                                        visible={this.state.visible}
                                        data={this.state.form}
                                        >
                                    </AddPartModal>
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        <Table
                                            rowSelection={rowSelection}
                                            columns={columns}
                                            dataSource={this.state.data}
                                            bordered
                                            pagination={this.state.pagination}
                                            onChange={(pagination) => this.handlePageChange('tab1', pagination)}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </TabPane>
                        <TabPane tab="配件类别" key="2">
                            <div>
                                <Row>
                                    <Col span={5}>
                                        <div style={{ marginBottom: 16 }}>
                                            配件类别：<Input style={{ width: '120px' }} onChange={(e) => this.setState({ inventoryName: e.target.value })} />
                                        </div>
                                    </Col>
                                    <Col span={2} offset={1}>
                                        <Button type="primary" onClick={this.queryData2}>查询</Button>
                                    </Col>
                                </Row>
                                <Row style={{ marginTop: '40px', marginBottom: '20px' }}>
                                    <Col span={2}>
                                        <Button onClick={this.showModal2}>新增类别</Button>
                                    </Col>
                                    <Col span={8}>
                                        <Popconfirm title="确定要删除?" onConfirm={() => this.onDelete(this.state.selectedRowKeys)}>
                                            <Button >删除类别</Button>
                                        </Popconfirm>
                                    </Col>
                                    {/*查询的模态框*/}
                                    <Modal
                                        title="新增配件"
                                        visible={this.state.visible2}
                                        maskClosable={false}
                                        onOk={this.handleOk2}
                                        onCancel={this.handleCancel2}
                                        width='30%' >
                                        <Form onSubmit={this.handleSubmit} >
                                            <FormItem
                                                {...formItemLayout}
                                                label="类别名称"
                                            >
                                                <Input placeholder="" value={this.state.form2.typeName} onChange={(e) => this.onValueChange2('typeName', e.target.value)} />
                                            </FormItem>
                                            <FormItem
                                                {...formItemLayout}
                                                label="备注"
                                            >
                                                <Input placeholder="" value={this.state.form2.comment} onChange={(e) => this.onValueChange2('comment', e.target.value)} />
                                            </FormItem>
                                        </Form>
                                    </Modal>
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        <Table
                                            rowSelection={rowSelection}
                                            columns={columns2}
                                            dataSource={this.state.data}
                                            bordered
                                            pagination={this.state.pagination}
                                            onChange={(pagination) => this.handlePageChange('tab2', pagination)}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </TabPane>
                        <TabPane tab="配件品牌" key="3">
                            <div>
                                <Row>
                                    <Col span={5}>
                                        <div style={{ marginBottom: 16 }}>
                                            配件品牌：
                                            <Input style={{ width: '120px' }} onChange={(e) => this.setState({ inventoryBrandName: e.target.value })} />
                                        </div>
                                    </Col>

                                    <Col span={2} offset={1}>
                                        <Button type="primary" onClick={this.queryData3}>查询</Button>
                                    </Col>
                                </Row>
                                <Row style={{ marginTop: '40px', marginBottom: '20px' }}>
                                    <Col span={2}>
                                        <Button onClick={this.showModal3}>新增品牌</Button>
                                    </Col>
                                    <Col span={8}>
                                        <Popconfirm title="确定要删除?" onConfirm={() => this.onDelete(this.state.selectedRowKeys)}>
                                            <Button >删除品牌</Button>
                                        </Popconfirm>
                                    </Col>
                                    {/*查询的模态框*/}
                                    <Modal
                                        title="新增品牌"
                                        visible={this.state.visible3}
                                        onOk={this.handleOk3}
                                        maskClosable={false}
                                        onCancel={this.handleCancel3}
                                        width='30%' >

                                        <Form onSubmit={this.handleSubmit} >
                                            <FormItem
                                                {...formItemLayout}
                                                label="品牌名称"
                                            >
                                                <Input placeholder="" value={this.state.form2.name} onChange={(e) => this.onValueChange2('name', e.target.value)} />
                                            </FormItem>
                                            <FormItem
                                                {...formItemLayout}
                                                label="备注"
                                            >
                                                <Input placeholder="" value={this.state.form2.comment} onChange={(e) => this.onValueChange2('comment', e.target.value)} />
                                            </FormItem>

                                        </Form>
                                    </Modal>
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        <Table
                                            rowSelection={rowSelection}
                                            columns={columns3}
                                            dataSource={this.state.data}
                                            bordered
                                            pagination={this.state.pagination}
                                            onChange={(pagination) => this.handlePageChange('tab3', pagination)}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </TabPane>
                    </Tabs>
                </Card>
            </div>
        );
    }
}
export default BeautyOrder