
import React from 'react';
import { hashHistory } from 'react-router'
import { Form, Icon, Input, Button, Checkbox, message, Select } from 'antd';
import logo from '../styles/imgs/logo.jpg';
import $ from 'jquery';

const FormItem = Form.Item;
const Option = Select.Option;
message.config({
    top: 300,
})
class Login extends React.Component {

    componentDidMount() {
        localStorage.setItem('store', 'xuzhuang')
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.postInfo(values)
                // 
            }
        });
    };

    postInfo = (values) => {
        console.log(localStorage.getItem('store'))
        $.ajax({
            url: `api/${localStorage.getItem('store')}/admin/login`,
            type: "POST",
            data: {
                account: values.userName,
                password: values.password,
                rememberMe: values.remember
            },
            success: (res) => {
                console.log(res)
                if (res.code == 0 || res.code == 13
                ) {
                    localStorage.setItem("username", values.userName);
                    message.success('登录成功', 1);
                    hashHistory.push('/dashboard/index')
                } else {
                    message.error(res.msg, 1);
                }
            }
        })
    }

    handleChange = (value) => {
        localStorage.setItem('store', value)
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="login">
                <div className="login-form" >
                    <div className="login-logo">
                        <img src={logo} />
                        <span>小易爱车后台管理系统</span>
                    </div>
                    <Form onSubmit={this.handleSubmit} style={{ maxWidth: '300px' }}>
                        <FormItem>
                            {getFieldDecorator('store', {
                                rules: [{ required: true, message: '请选择门店' }],
                                initialValue: 'xuzhuang'
                            })(
                                <Select style={{ width: '100%' }} onChange={(value) => this.handleChange(value)} placeholder="请选择门店">
                                    <Option value="xuzhuang">徐庄门店</Option>
                                </Select>
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('userName', {
                                rules: [{ required: true, message: '请输入用户名!' }],
                            })(
                                <Input style={{ width: '100%' }} prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="用户名" />
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('password', {
                                rules: [{ required: true, message: '请输入密码!' }],
                            })(
                                <Input style={{ width: '100%' }} prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="密码" />
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('remember', {
                                valuePropName: 'checked',
                                initialValue: true,
                            })(
                                <Checkbox>记住密码</Checkbox>
                            )}

                        </FormItem>
                        <FormItem  >
                            <Button type="primary" htmlType="submit" className="login-form-button" style={{ width: '100%' }}>
                                登录
                            </Button>
                        </FormItem>
                    </Form>
                </div>
            </div>

        );
    }
}

export default Form.create()(Login);