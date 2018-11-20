
import React from 'react';
import { hashHistory } from 'react-router'
class Page extends React.Component {
    constructor(props) {
        super(props)
        const username = localStorage.getItem("username")
        this.state = {
            loginState: (username != "" && username != undefined) ? true : false
        };
    }

    componentDidMount() {
        if (!this.state.loginState) {
            hashHistory.push('/login')
        }
    }

    componentWillMount() {
       // window.webSocketUrl = 'ws://www.geariot.com/freelycar/echo';  
       window.webSocketUrl = 'ws://www.freelycar.com/freelycar_wechat/webSocket/';
    }


    render() {
        return (
            <div style={{ height: '100%' }}>
                {this.props.children}
            </div>
        )
    } 
}

export default Page;