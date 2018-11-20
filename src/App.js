import React, { Component } from 'react';
import { Layout } from 'antd';
const { Content, Footer } = Layout;
import './styles/index.less';
import { hashHistory } from 'react-router'
import SiderCustom from './components/SiderCustom.jsx';
import HeaderCustom from './components/HeaderCustom.jsx';
import Page from './components/Page.jsx';
import $ from 'jquery';

class App extends Component {
    constructor(props) {
        super(props)
        const username = localStorage.getItem("username")
        this.state = {
            collapsed: false,
            loginState: (username != "" && username != undefined) ? true : false,
            //   loginState: true,
            user: '',
            role: 0,

        };
    }

    componentDidMount() {
        if (!this.state.loginState) {
            hashHistory.push('/login')
        }
        this.queryAdmin()
    }
    queryAdmin = () => {
        $.ajax({
            url: `api/${localStorage.getItem('store')}/admin/getaccount`,
            type: "GET",
            data: {
                account: localStorage.getItem('username'),

            },
            success: (res) => {
                this.setState({
                    user: res.data.name,
                    role: res.data.role.id,
                })
            }
        })
    }
    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };
    render() {
        return this.state.loginState && (<Layout className="ant-layout-has-sider" >
            <SiderCustom path={this.props.location.pathname}
                collapsed={this.state.collapsed} role={this.state.role}
            />
            <Layout style={{ height: '100%', overflow: 'scroll' }}>
                <HeaderCustom toggle={this.toggle} />
                <Content style={{ margin: '0 16px', overflow: 'initial' }} role={this.state.role}> {this.props.children} </Content>
                <Footer style={
                    { textAlign: 'center' }} >
                </Footer>
            </Layout>
        </Layout>
        );
    }
}

export default App;