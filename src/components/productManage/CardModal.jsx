import React from 'react';
import { Row, Col, Card, Button, DatePicker, Table, Input, Select, Popconfirm, Radio, Modal, Form, InputNumber, message } from 'antd';
import { Link } from 'react-router';
import update from 'immutability-helper'
import EditableCell from '../tables/EditableCell.jsx';
import PreferenceItem from '../model/PreferenceItem.jsx'
import $ from 'jquery';
const Option = Select.Option;
const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 11 }
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 10 }
    }
};
/*父组件的表头名称*/


/*项目卡次明细设置表格*/
class ModalTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //项目数据数据
            dataSource: this.props.dataSource,
            columns: this.props.columns,
        };
    }
    componentWillReceiveProps(newProps) {
        if (newProps.dataSource != this.props.dataSource) {
            this.setState({
                dataSource: newProps.dataSource
            })
        }

    }

    render() {

        return (
            <div>
                <Table bordered size="small" pagination={{ pageSize: 5 }} size="small" dataSource={this.state.dataSource} columns={this.state.columns} />
            </div>
        );
    }
}



class CardModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            visible1: false,//第二个模态框的属性
            itemData: [],//项目的数据
            count: 5,
            modifyData: {
                discount: 100
            },//父组件传过来要修改的一行数据
            cardProject: [],//卡关联的项目
            proSelectKeys: [],//一开始以选择的项目key
            selectedRows: [],//再次选的项目
            cardTicket: [],//卡关联的代金券
            ticketSelectKeys: [],//一开始以选择的券key
            pagination: {},
        }
    }
    componentWillReceiveProps(newProps) {

        let md = newProps.modifyData;
        md.discount = 100;
        let projects = [];
        let proSelectKeys = [];
        //提取projectInfos中的项目
        if (md.projectInfos)
            for (let item of md.projectInfos) {
                item.project.pinfoId = item.id;
                item.project.times = item.times;
                projects.push(item.project);
                proSelectKeys.push(item.project.id);
            }

        //提取favourInfos中的代金券
        let favours = [];
        let ticketSelectKeys = [];
        if (md.favourInfos)
            for (let item of md.favourInfos) {
                item.favour.favourId = item.id;
                item.favour.count = item.count;
                favours.push(item.favour);
                ticketSelectKeys.push(item.favour.id);
            }

        this.setState({
            cardProject: this.setTableDateKey(projects),
            cardTicket: this.setTableDateKey(favours),
            proSelectKeys: proSelectKeys,
            ticketSelectKeys: ticketSelectKeys,
            modifyData: md,
            visible: newProps.visible,
        });
    }

    //加载数据
    componentDidMount() {
        this.loadData(1, 10);
    }


    //public fuc 
    //为表格item设置key
    setTableDateKey = (arr) => {
        for (let item of arr) {
            item.key = item.id;
        }
        return arr;
    }



    loadData = (page, number, proName, programId) => {
        let jsonData = {};
        jsonData.name = proName;
        jsonData.programId = programId || "";
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
                    this.setState({ itemData: this.setTableDateKey(res.data), pagination: { total: res.realSize }, });
                } else {
                    this.setState({ itemData: [], pagination: { total: 0 } });
                }
            }
        });
    }


    onItemOk = () => {

        let cp = this.state.cardProject;
        let arr = [...cp, ...this.state.selectedRows];
        this.setState({
            cardProject: arr,
            visible1: false,
        });
    }

    onItemCancel = (index, key) => {
        this.setState({ visible1: false });
    }


    onOk = () => {
        let ajaxData = this.state.modifyData;
        //check field require
        if (ajaxData.name == '') {
            message.warn('卡类名称是必填项');
            return false;
        }
        if (ajaxData.price == '') {
            message.warn('售卡金额是必填项');
            return false;
        }
        if (ajaxData.type == 2 && ajaxData.discount == '') {
            message.warn('折扣比例是必填项');
            return false;
        }
        if (ajaxData.validTime == '') {
            message.warn('有效期是必填项');
            return false;
        }
        if (this.state.cardProject.length == 0 && ajaxData.type != 2) {
            message.warn('必须关联项目');
            return false;
        }


        if (ajaxData.type != 2) {
            //根据cardProject 构建modifyData的projectInfos
            let projectInfos = [];
            for (let item of this.state.cardProject) {
                let obj = { times: item.times >= 0 ? item.times : 1, project: item };
                if (item.pinfoId) {
                    obj.id = item.pinfoId;
                }
                projectInfos.push(obj);
            }

            //根据cardTicket 构建modifyData的favourInfos
            let favourInfos1 = [];
            for (let item of this.state.cardTicket) {
                let obj = { count: item.count >= 0 ? item.count : 1, favour: item };
                if (item.favourId) {
                    obj.id = item.favourId;
                }

                favourInfos1.push(obj);
            }
            ajaxData.favourInfos = favourInfos1;
            ajaxData.projectInfos = projectInfos;
        }

        let thisprops = this.props;

        $.ajax({
            url: 'api/' + localStorage.getItem('store') + '/' + 'service/add',
            data: JSON.stringify(ajaxData),
            dataType: 'json',
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            traditional: true,
            success: (res) => {
                if (res.code != '0') {
                    message.warn('操作失败');
                } else {
                    ajaxData.key = res.data.id;
                    ajaxData.createDate = res.data.createDate;
                }

                thisprops.onOk(ajaxData);
            }
        });
    }

    //处理翻页
    handlePageChange = (p) => {
        this.loadData(p.current, 10)
    }

    //为modifyData的赋值
    handleChange = (key, value) => {
        if (key == 'price' || key == 'actualPrice' || key == 'discount') {
            const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
            if (!((!isNaN(value) && reg.test(value)) || value === '')) {
                return;
            }
            if (key == 'discount') {
                if (value > 100) {
                    return;
                }
            }
        }
        this.setState({
            modifyData: update(this.state.modifyData, { [key]: { $set: value } })
        })
    }

    onCancel = () => {
        this.setState({ visible: false });
    }

    onRefDelete = (index) => {
        let sr = this.state.cardProject;
        sr.splice(index, 1);
        let proSelectKeys = this.state.proSelectKeys;
        proSelectKeys.splice(index, 1);

        this.setState({
            cardProject: sr,
            proSelectKeys: proSelectKeys
        })
    }

    onDaijinDelete = (index) => {
        let sr = this.state.cardTicket;
        sr.splice(index, 1);
        let tsk = this.state.ticketSelectKeys;
        tsk.splice(index, 1);

        this.setState({
            cardTicket: sr,
            ticketSelectKeys: tsk
        })
    }

    onDelete = (index) => {
        const dataSource = [...this.state.dataSource];
        dataSource.splice(index, 1);
        this.setState({ dataSource });
    }

    handleOk = (data) => {

        let ct = this.state.cardTicket;
        let arr = [...ct, ...data];

        this.setState({
            visible2: false,
            cardTicket: arr
        })
    }

    handleCancel = () => {
        this.setState({
            visible2: false
        })
    }

    render() {
        const FormItem = Form.Item;
        const Itemcolumns = [{
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
                return <span>{text.name}</span>
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
        }];


        //card关联的项目
        const Itemcolumns2 = [{
            title: '项目名称',
            dataIndex: 'name',
            key: 'name'
        }, {
            title: '项目类别',
            dataIndex: 'program',
            key: 'program',
            render: (text, record, index) => {
                //数组里面是两种数据结构
                return <span>{text.name ? text.name : text}</span>
            }
        }, {
            title: '可用次数',
            dataIndex: 'times',
            key: 'times',
            render: (text, record, index) => {
                return <InputNumber min={1} max={999} defaultValue={text ? text : 1} onChange={(e) => { record.times = e }} />
            }
        }, {
            title: '操作',
            dataIndex: 'operation',
            render: (text, record, index) => {
                return (
                    <div>
                        <Popconfirm title="确定要删除?" onConfirm={() => this.onRefDelete(index)}>
                            <a>删除</a>
                        </Popconfirm>
                    </div>
                );
            },
        }], couponConlumn = [//关联的代金券
            {
                title: '代金券名称',
                dataIndex: 'name',
                key: 'name'
            }, {
                title: '张数',
                dataIndex: 'count',
                key: 'count',
                render: (text, record, index) => {
                    return <InputNumber min={1} defaultValue={text ? text : 1} onChange={(e) => { record.count = e }} />
                }
            }, {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record, index) => {
                    return (
                        <div>
                            <Popconfirm title="确定要删除?" onConfirm={() => this.onDaijinDelete(index)}>
                                <a>删除</a>
                            </Popconfirm>
                        </div>
                    );
                }
            }
        ]

        const rowSelection = {
            selectedRowKeys: this.state.proSelectKeys,
            onSelect: (changableRow, selected, selectedRows) => {
                //state里面记住这两个变量就好
                let origKeys = this.state.proSelectKeys;
                let origRows = this.state.cardProject;
                if (selected) {
                    Array.prototype.push.apply(origKeys, [changableRow.key]);
                    Array.prototype.push.apply(origRows, [changableRow]);
                } else {
                    origKeys = origKeys.filter((obj) => {
                        return obj !== changableRow.key;
                    });
                    origRows = origRows.filter((obj) => {
                        return obj.key !== changableRow.key;
                    });

                }
                this.setState({
                    proSelectKeys: origKeys,
                    cardProject: origRows
                });
            },


            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User',
            }),
        };

        const rowSelection2 = {
            selectedRowKeys: this.state.ticketSelectKeys,
            onSelect: (changableRow, selected, selectedRows) => {
                //state里面记住这两个变量就好
                let origKeys = this.state.ticketSelectKeys;
                let origRows = this.state.cardTicket;
                if (selected) {
                    Array.prototype.push.apply(origKeys, [changableRow.key]);
                    Array.prototype.push.apply(origRows, [changableRow]);
                } else {
                    origKeys = origKeys.filter((obj) => {
                        return obj !== changableRow.key;
                    });
                    origRows = origRows.filter((obj) => {
                        return obj.key !== changableRow.key;
                    });

                }
                this.setState({
                    ticketSelectKeys: origKeys,
                    cardTicket: origRows
                });
            },


            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User',
            }),
        };


        return (
            <div>
                <Modal
                    title={this.props.modalTitle}
                    maskClosable={false}
                    visible={this.state.visible}
                    onOk={() => this.onOk()}
                    onCancel={() => this.props.onCancel()}
                    width='50%' >

                    <Form onSubmit={this.handleSubmit}>
                        <FormItem
                            {...formItemLayout}
                            label="卡类名称"
                            hasFeedback
                        >
                            <Input style={{ width: 120 }} onChange={(e) => { this.handleChange('name', e.target.value) }} value={this.state.modifyData.name} />
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="卡类属性"
                            hasFeedback
                        >
                            <Select style={{ width: 120 }} onChange={(e) => { this.handleChange('type', e) }} value={this.state.modifyData.type ? this.state.modifyData.type + '' : '0'}>
                                <Option value="0">次卡</Option>
                                <Option value="1">组合卡</Option>
                                <Option value="2">储值卡</Option>
                            </Select>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="售卡金额"
                            hasFeedback
                        >
                            <Input style={{ width: 120 }} onChange={(e) => { this.handleChange('price', e.target.value) }} value={this.state.modifyData.price} />
                        </FormItem>
                        {this.state.modifyData.type == 2 && <FormItem
                            {...formItemLayout}
                            label="卡面金额"
                            hasFeedback
                        >
                            <Input
                                style={{ width: 120 }}
                                onChange={(e) => { this.handleChange('actualPrice', e.target.value) }}
                                value={this.state.modifyData.actualPrice} />
                        </FormItem>}
                        {this.state.modifyData.type == 2 && <FormItem
                            {...formItemLayout}
                            label="折扣比例"
                            hasFeedback
                        >
                            <Input
                                style={{ width: 60 }}
                                onChange={(e) => { this.handleChange('discount', e.target.value) }}
                                value={this.state.modifyData.discount} />&nbsp;%
                        </FormItem>}
                        <FormItem
                            {...formItemLayout}
                            label="有效期(年)"
                            hasFeedback
                        >
                            <Select style={{ width: 120 }} onChange={(value) => { this.handleChange('validTime', value) }} value={this.state.modifyData.validTime}>
                                <Option value="1">1</Option>
                                <Option value="2">2</Option>
                                <Option value="3">3</Option>
                                <Option value="4">4</Option>
                                <Option value="5">5</Option>
                            </Select>
                        </FormItem>

                        <FormItem
                            {...formItemLayout}
                            label="备注"
                            hasFeedback
                        >
                            <Input style={{ width: 120 }} onChange={(e) => { this.handleChange('comment', e.target.value) }} value={this.state.modifyData.comment} />
                        </FormItem>
                    </Form>
                    {this.state.modifyData.type != 2 && <Row style={{ marginBottom: '10px' }}>
                        <Button type="primary" onClick={() => { this.setState({ visible1: true }) }}>卡次明细设置</Button>
                        <Modal
                            title="卡次明细设置"
                            visible={this.state.visible1}
                            maskClosable={false}
                            onOk={() => this.onItemOk()}
                            onCancel={() => this.onItemCancel()}
                            width='50%' >

                            <Table dataSource={this.state.itemData}
                                columns={Itemcolumns}
                                rowSelection={rowSelection}
                                pagination={this.state.pagination}
                                onChange={(pagination) => this.handlePageChange(pagination)} />
                        </Modal>
                    </Row>}
                    {this.state.modifyData.type != 2 && <ModalTable dataSource={this.state.cardProject} columns={Itemcolumns2} />}
                    {this.state.modifyData.type != 2 && <Row style={{ marginBottom: '10px', marginTop: '10px' }}>
                        <Button type="primary" onClick={() => { this.setState({ visible2: true }) }}>关联代金券</Button>
                        <PreferenceItem type={'2'} view={this.state.visible2} handleCancel={this.handleCancel} handleOk={(rows) => this.handleOk(rows)}
                            ticketSelectKeys={this.state.ticketSelectKeys}
                            rowSelection={rowSelection2}
                        />
                    </Row>}
                    {this.state.modifyData.type != 2 && <Table dataSource={this.state.cardTicket} columns={couponConlumn} />}
                </Modal>
            </div>
        )
    }
}
export default CardModal

