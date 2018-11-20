import React from 'react';
import { Input, Select, Modal, Row, Col, message, Button, Form } from 'antd';
import $ from 'jquery';
import update from 'immutability-helper';
import autoFillAjax from '../../utils/autoFillAjax.js';


const Option = Select.Option;
const FormItem = Form.Item;
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
class AddPartModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            form: {
                amount: 0
            },
            provider: {},
            brandItem: [],
            typeItem: [],
            providers: [],
            brands: [],
            brandValue: { key: '', label: '' },
            defaultValue: {},
            showAddBrandModal: false,
            showAddProviderModal: false,
            form2: {
                typeName: '',
                comment: '',
                name: ''
            },
            form3: {
                name: '',
                contactName: '',
                phone: '',
                email: '',
                landline: '',
                address: '',
                comment: ''
            },
        };
    }

    //初始化数据
    componentDidMount() {
        this.loadPjType(1, 99);
        this.getProvider();
        this.getBrand();
    }

    componentWillReceiveProps() { //组件显示或消失是调用
        if (!this.props.data || !this.props.data.id) {
            this.setState({
                form: {
                    amount: 0
                },
                // provider: {},
                type: {},
                // brandValue: { key: '', label: '' }
            })
            return;
        }
        let form = {
            manufactureNumber: this.props.data.manufactureNumber ? this.props.data.manufactureNumber : '',
            name: this.props.data.name ? this.props.data.name : '',
            price: this.props.data.price ? this.props.data.price : '',
            standard: this.props.data.standard ? this.props.data.standard : '',
            property: this.props.data.property ? this.props.data.property : '',
            id: this.props.data.id ? this.props.data.id : null,
            comment: this.props.data.comment ? this.props.data.comment : '',
            typeId: this.props.data.typeId ? this.props.data.typeId : '',
            typeName: this.props.data.typeName ? this.props.data.typeName : ''
        }
        let provider = this.props.data.provider ? this.props.data.provider : {}
        let brandValue = {
            key: this.props.data.brandId ? this.props.data.brandId + '' : '',
            label: this.props.data.brandName ? this.props.data.brandName : ''
        }
        let brandItem = [brandValue]
        let defaultValue = {
            key: this.props.data.brandName ? this.props.data.brandName : '',
            label: this.props.data.brandName ? this.props.data.brandName : ''
        }
        this.setState({
            form: form,
            provider: provider,
            brandValue: brandValue,
            brandItem: brandItem
        })
    }

    getBrand = () => {
        let jsonData = {};
        jsonData.page = 1;
        jsonData.number = 99;
        $.ajax({
            type: 'get',
            url: 'api/'+localStorage.getItem('store')+'/'+'inventory/querybrand',
            dataType: 'json',
            data: jsonData,
            success: (res) => {
                if (res.code == '0') {
                    this.setState({
                        brands: res.data
                    });
                }
            }
        })
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

    //为state的form
    onValueChange = (key, value) => {
        if (key == 'type') {
            this.setState({
                form: update(this.state.form, { ['typeId']: { $set: value.key }, ['typeName']: { $set: value.label } })
            })
        } else if (key == 'brand') {
            this.setState({
                brandValue: value
            });

            if (value.key) {
                autoFillAjax(value.key, data => {
                    if (data.length) { this.setState({ brandItem: data }) }
                });
            }
        } else if (key == 'provider') {
            console.log(value);
            this.setState({
                provider: update(this.state.provider, { ['id']: { $set: value.key }, ['name']: { $set: value.label } })
            })
        }
        else {
            this.setState({
                form: update(this.state.form, { [key]: { $set: value } })
            })
        }
    }
    onValueChange3 = (key, value) => {
        if (key == "name") {
            this.setState({
                errorMsg: ''
            })
        }

        this.setState({
            form3: update(this.state.form3, { [key]: { $set: value } })
        })
    }
    handleOk4 = (e) => {
        var reg = /^1[3|4|5|7|8][0-9]{9}$/
        var phonenum = this.state.form3.phone
        var test = reg.test(phonenum);
        var phonecheck
        if (phonenum == '') {
            phonecheck = false;
        } else if (test) {

            phonecheck = false;
        } else {
            phonecheck = true
        }

        if (this.state.form3.name == '') {
            this.setState({
                errorMsg: '请输入供应商名称'
            })
        } else {
            this.addProvider();
        }
    }
    addProvider = () => {
        $.ajax({
            type: 'post',
            url: 'api/'+localStorage.getItem('store')+'/'+'provider/add',
            // contentType:'application/json;charset=utf-8',
            dataType: 'json',
            data: {
                name: this.state.form3.name,
                contactName: this.state.form3.contactName,
                phone: this.state.form3.phone,
                email: this.state.form3.email,
                landline: this.state.form3.landline,
                address: this.state.form3.address,
                comment: this.state.form3.comment
            },
            success: (result) => {
                (result);
                if (result.code == "0") {
                    message.success('添加成功！', 1);
                    result.data.key = result.data.id;

                    this.setState({
                        providers: update(this.state.providers, { $push: [result.data] }),
                        form3: {
                            name: '',
                            contactName: '',
                            phone: '',
                            email: '',
                            landline: '',
                            address: '',
                            comment: ''
                        },
                        showAddProviderModal: false
                    });
                }
            }
        })
    }

    modifyProvider = () => {
        $.ajax({
            type: 'post',
            url: 'api/'+localStorage.getItem('store')+'/'+'provider/modify',
            dataType: 'json',
            data: {
                name: this.state.form3.name,
                contactName: this.state.form3.contactName,
                phone: this.state.form3.phone,
                email: this.state.form3.email,
                landline: this.state.form3.landline,
                address: this.state.form3.address,
                comment: this.state.form3.comment,
                id: this.state.form3.id,
            },
            success: (result) => {
                (result);
                if (result.code == "0") {
                    message.success('修改成功！', 1);
                    const data = this.state.data;
                    const id = result.data.id;
                    data.map((item, index) => {
                        if (item.id == id) {
                            data[index] = result.data;
                            data[index].key = result.data.id;
                        }
                    })
                    result.data.key = result.data.id;

                    this.setState({
                        providers: update(this.state.providers, { $push: [result.data] }),
                        form3: {
                            name: '',
                            contactName: '',
                            phone: '',
                            email: '',
                            landline: '',
                            address: '',
                            comment: ''
                        },
                        showAddProviderModal: false
                    });
                }
            }
        })
    }

    handleCancel4 = (e) => {
        this.setState({
            showAddProviderModal: false,
            form3: {
                name: '',
                contactName: '',
                phone: '',
                email: '',
                landline: '',
                address: '',
                comment: ''
            },
        });
    }

    addInventory = (data) => {
        $.ajax({
            type: 'post',
            url: 'api/'+localStorage.getItem('store')+'/'+'inventory/add',
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(data),
            success: (result) => {
                let code = result.code;
                if (code == '0') {
                    message.success('新增配件成功', 1.5);
                    // this.clearAllData();
                    this.props.onOk();
                    this.setState({
                        form: {
                            amount: 0
                        },
                        // provider: {},
                        // brandItem: [],
                        // brandValue: { key: '', label: '' },
                    })
                    

                } else {
                    message.error(result.msg)
                }
            }
        });
    }


    modifyInventory = (data) => {
        $.ajax({
            type: 'post',
            url: 'api/'+localStorage.getItem('store')+'/'+'inventory/modify',
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(data),
            success: (result) => {
                let code = result.code;
                if (code == '0') {
                    message.success('编辑配件成功', 1.5);
                    // this.clearAllData();
                    this.props.onOk();
                    this.setState({
                        form: {
                            amount: 0
                        },
                        // provider: {},
                        // brandItem: [],
                        // brandValue: { key: '', label: '' },
                    })
                } else {
                    message.error(result.msg)
                }
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
                        brands: [...this.state.brands, obj],
                        showAddBrandModal: false,
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
            showAddBrandModal: false,
        });
    }

    onValueChange2 = (key, value) => {
        this.setState({
            form2: update(this.state.form2, { [key]: { $set: value } })
        })
    }

    handleOk = () => {
        console.log('handleOk');
        let state = this.state;
        let form = state.form;
        if (!state.provider.id) {
            message.warn('请选择供应商');
            return false;
        }
        if (!form.name) {
            message.warn('请输入配件名称');
            return false;
        }
        if (!state.brandValue.key) {
            message.warn('请输入配件品牌');
            return false;
        }
        if (!form.typeId) {
            message.warn('请选择类别');
            return false;
        }
        if (!form.price) {
            message.warn('请输入配件价格');
            return false;
        }
        form.provider = { id: state.provider.id };
        form.brandId = state.brandValue.key;
        form.brandName = state.brandValue.label;
        if (form.id) {
            this.modifyInventory(form);
        } else {
            this.addInventory(form);
        }
    }

    

// handleOk = (e) => {
//     var reg = /^1[3|4|5|7|8][0-9]{9}$/
//     var phonenum = this.state.form.phone
//     var test = reg.test(phonenum);
//     var phonecheck
//     if (phonenum == '') {
//         phonecheck = false;
//     } else if (test) {

//         phonecheck = false;
//     } else {
//         phonecheck = true
//     }

//     if (this.state.form.name == '') {
//         this.setState({
//             errorMsg: '请输入供应商名称'
//         })
//     } else {
//         if (this.state.form.id) {
//             this.modifyInventory(this.state.form);
//         } else {
//             this.addInventory(this.state.form);
//         }

//     }
// }


handleCancel = (e) => {
    this.props.cancel();
    this.clearAllData();
}

clearAllData = () => {
    this.setState({
        form: {},
        // brandItem: [],
        // typeItem: [],
        // providers: [],
        // brandValue: { key: '', label: '' }
    });
}

showAddBrandModal = () => {
    this.setState({
        showAddBrandModal: true
    })
}

showAddProviderModal = () => {
    this.setState({
        showAddProviderModal: true
    })
}

render() {
    const providers = this.state.providers.map((item, index) => {
        return <Option key={item.id} value={item.id + ''} >{item.name}</Option>
    })
    const brands = this.state.brands.map((item, index) => {
        return <Option key={item.id} value={item.id + ''} >{item.name}</Option>
    })

    const options = this.state.brandItem.map(d => <Option key={d.key} value={d.key + ''} >{d.label}</Option>);

    return <Modal
        title={this.state.form.id ? '编辑配件' : '新增配件'}
        onOk={() => this.handleOk()}
        maskClosable={false}
        onCancel={() => this.handleCancel()}
        visible={this.props.visible}
        width='70%' >

        <Row style={{ marginBottom: '20px' }}>
            <Col span={12} style={{ textAlign: 'center' }}>
                厂家编号：<Input style={{ width: '220px' }}
                    value={this.state.form.manufactureNumber}
                    onChange={(e) => this.onValueChange('manufactureNumber', e.target.value)} />
            </Col>
            <Col span={12} style={{ textAlign: 'center' }}>
                配件名称：<Input style={{ width: '220px' }}
                    value={this.state.form.name}
                    onChange={(e) => this.onValueChange('name', e.target.value)} />
            </Col>
        </Row>
        <Row style={{ marginBottom: '20px' }}>
            <Col span={12} style={{ textAlign: 'center', paddingLeft: "85px" }}>
                配件品牌：
                    <Select
                    showSearch
                    optionFilterProp="children"
                    optionLabelProp="children"
                    style={{ width: '220px' }}
                    labelInValue
                    value={{key:this.state.brandValue.key?this.state.brandValue.key+'':'',label:this.state.brandValue.label?this.state.brandValue.label:''}}
                    filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                    onChange={(value) => this.onValueChange('brand', value)}
                >
                    {brands}
                </Select>
                <Button style={{ marginLeft: "10px" }} onClick={this.showAddBrandModal}>新增品牌</Button>
                <Modal
                    title="新增品牌"
                    visible={this.state.showAddBrandModal}
                    maskClosable={false}
                    onOk={this.handleOk3}
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
            </Col>
            <Col span={12} style={{ textAlign: 'center' }}>
                所属分类：<Select
                    style={{ width: '220px' }}
                    onChange={(value) => this.onValueChange('type', value)}
                    value={{ key: this.state.form.typeId ? this.state.form.typeId + '' : '' }}
                    labelInValue >
                    {this.state.typeItem}
                </Select>
            </Col>
        </Row>
        <Row style={{ marginBottom: '20px' }}>
            <Col span={12} style={{ textAlign: 'center' }}>
                <span style={{ color: '#fff' }}>占位</span>规格：<Input
                    placeholder=""
                    style={{ width: '220px' }}
                    value={this.state.form.standard}
                    onChange={(e) => this.onValueChange('standard', e.target.value)} />
            </Col>
            <Col span={12} style={{ textAlign: 'center' }}>
                <span style={{ color: '#fff' }}>占位</span>属性：<Input
                    placeholder=""
                    style={{ width: '220px' }}
                    value={this.state.form.property}
                    onChange={(e) => this.onValueChange('property', e.target.value)} />
            </Col>
        </Row>
        <Row style={{ marginBottom: '20px' }}>
            <Col span={12} style={{ textAlign: 'center' }}>
                配件售价： <Input
                    style={{ width: '220px' }}
                    placeholder=""
                    value={this.state.form.price}
                    onChange={(e) => this.onValueChange('price', e.target.value)} />
            </Col>
            <Col span={12} style={{ textAlign: 'center', paddingLeft: "85px" }}>
                <span style={{ color: '#fff' }}>位</span>供应商：
                    <Select
                    showSearch
                    optionFilterProp="children"
                    optionLabelProp="children"
                    style={{ width: '220px' }}
                    onChange={(value) => this.onValueChange('provider', value)}
                    value={{ key: this.state.provider.id ? this.state.provider.id + '' : '' }}
                    filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                    labelInValue >
                    {providers}
                </Select>

                <Button style={{ marginLeft: "10px" }} onClick={this.showAddProviderModal}>新增供应商</Button>
                <Modal
                    title={'新增供应商'}
                    visible={this.state.showAddProviderModal}
                    onOk={this.handleOk4}
                    maskClosable={false}
                    onCancel={this.handleCancel4}
                >

                    <Row gutter={16} style={{ marginBottom: '10px' }}>
                        <Col span={8} style={{ textAlign: 'right' }}>
                            供应商名称：
                            </Col>
                        <Col span={8} >
                            {!this.state.form3.id && <Input value={this.state.form3.name} onChange={(e) => this.onValueChange3('name', e.target.value)} />}
                            {this.state.form3.id && <span>{this.state.form3.name}</span>}
                        </Col>
                        <Col span={8}>
                            <span style={{ color: 'red' }}> {!this.state.form3.name != '' && this.state.errorMsg ? this.state.errorMsg : ''}</span>
                        </Col>
                    </Row>

                    <Row gutter={16} style={{ marginBottom: '10px' }}>
                        <Col span={8} style={{ textAlign: 'right' }}>
                            联系人：
                            </Col>
                        <Col span={8}>
                            <Input value={this.state.form3.contactName} onChange={(e) => this.onValueChange3('contactName', e.target.value)} />
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '10px' }}>
                        <Col span={8} style={{ textAlign: 'right' }}>
                            手机号码：
                            </Col>
                        <Col span={8}>
                            <Input value={this.state.form3.phone} onChange={(e) => this.onValueChange3('phone', e.target.value)} />
                        </Col>
                        <Col span={8}>
                            <span style={{ color: 'red' }}> {this.state.phonecheck}</span>
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '10px' }}>
                        <Col span={8} style={{ textAlign: 'right' }}>
                            座机：
                            </Col>
                        <Col span={8}>
                            <Input value={this.state.form3.landline} onChange={(e) => this.onValueChange3('landline', e.target.value)} />
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '10px' }}>
                        <Col span={8} style={{ textAlign: 'right' }}>
                            邮箱地址：
                            </Col>
                        <Col span={8}>
                            <Input value={this.state.form3.email} onChange={(e) => this.onValueChange3('email', e.target.value)} />
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '10px' }}>
                        <Col span={8} style={{ textAlign: 'right' }}>
                            联系地址：
                            </Col>
                        <Col span={8}>
                            <Input value={this.state.form3.address} onChange={(e) => this.onValueChange3('address', e.target.value)} />
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: '10px' }}>
                        <Col span={8} style={{ textAlign: 'right' }}>
                            备注：
                            </Col>
                        <Col span={8}>
                            <Input type="textarea" rows={3} value={this.state.form3.comment} onChange={(e) => this.onValueChange3('comment', e.target.value)} />
                        </Col>
                    </Row>
                </Modal>
            </Col>
        </Row>
        {(this.props.pageName == 'PartsSearch') &&
            (<Row style={{ marginBottom: '20px' }}>
                <Col span={12} style={{ textAlign: 'center' }}>
                    配件进价：<Input
                        placeholder=""
                        style={{ width: '220px' }}
                        value={this.state.form.purchasingPrice}
                        onChange={(e) => this.onValueChange('purchasingPrice', e.target.value)} />
                </Col>
                <Col span={12} style={{ textAlign: 'center' }}>
                    入库数量：<Input
                        placeholder=""
                        style={{ width: '220px' }}
                        value={this.state.form.amount}
                        onChange={(e) => this.onValueChange('amount', e.target.value)} />
                </Col>
            </Row>)}
        <Row style={{ marginBottom: '20px' }}>
            <Col span={12} style={{ textAlign: 'center' }}>
                <span style={{ color: '#fff' }}>占位</span>备注：<Input
                    style={{ width: '220px' }}
                    placeholder=""
                    value={this.state.form.comment}
                    onChange={(e) => this.onValueChange('comment', e.target.value)} />
            </Col>
        </Row>
    </Modal>
}
}

export default AddPartModal
