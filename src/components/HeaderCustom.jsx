/**
 * Created by hao.cheng on 2017/4/13.
 */
import React, { Component } from "react";
import { Menu, Icon, Layout, Badge, message } from "antd";
import { hashHistory } from "react-router";
const { Header } = Layout;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
import screenfull from "screenfull";
import $ from "jquery";
import avater from "../styles/imgs/user.png";
import reddot from "../styles/imgs/red.png";

message.config({
  top: 300
});

let webSocket;
let redVisible=false;
class HeaderCustom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: "",
      dotVisible: false
    };
  }
  componentDidMount() {
    // console.log(window.webSocketUrl);
    webSocket = new WebSocket(
      "ws://www.freelycar.com/freelycar_wechat/webSocket/admin"
    );
    this.openSocket();
    this.queryAdmin();
  }
  openSocket = () => {
    if (webSocket !== undefined && webSocket.readyState !== WebSocket.CLOSED) {
      console.log("WebSocket is already opened.");
    }
    webSocket.onopen = function(event) {
      if (event.data === undefined) {
        return;
      }
    };
    webSocket.onmessage = event => {
      console.log(event);
      if (event.data) var data = JSON.parse(event.data);
      if (
        data.message &&
        data.message.type &&
        data.message.type == "newReservation"
      ) {
        console.log("query");
        // this.setState({
        //     dotVisible:true
        // })
        // redVisible = true;
        document.getElementById('reddot').style.display = "inline"
        // console.log(this.state.dotVisible);
      }
    };
  };

  queryAdmin = () => {
    $.ajax({
      url: "api/" + localStorage.getItem("store") + "/" + "admin/getaccount",
      type: "GET",
      data: {
        account: localStorage.getItem("username")
      },
      success: res => {
        this.setState({
          user: res.data.name
        });
        localStorage.setItem("userId", res.data.id);
      }
    });
  };
  logOut = () => {
    localStorage.removeItem("username");
    this.setState({
      user: localStorage.getItem("username")
    });
    $.ajax({
      url: "api/" + localStorage.getItem("store") + "/" + "admin/logout",
      type: "GET",
      success: () => {
        message.success("退出成功！");
        hashHistory.push("/login");
      }
    });
  };
  handleClick = e => {
    if (e.key == "1") {
      this.logOut();
    }
    this.setState({ current: e.key });
  };

  render() {
    return (
      <Header
        style={{ background: "#fff", padding: 0, height: 65 }}
        className="custom-theme"
      >
        <Icon
          className="trigger custom-trigger"
          type={this.state.collapsed ? "menu-unfold" : "menu-fold"}
          onClick={this.props.toggle}
        />

        <span
          style={{
            float: "right",
            marginRight: "40px",
            fontWeight: "600",
            fontSize: "16px"
          }}
        >
          {this.state.user}
        </span>
        <Menu
          mode="horizontal"
          style={{ lineHeight: "64px", float: "right" }}
          onClick={this.handleClick}
        >
          <SubMenu
            title={
              <span className="avatar">
                <img src={avater} alt="头像" />
                <i className="on bottom b-white" />
              </span>
            }
          >
            <MenuItemGroup title="用户中心">
              <Menu.Item key="1">退出登录</Menu.Item>
            </MenuItemGroup>
            {/* <MenuItemGroup title="设置中心">
                            <Menu.Item key="setting:3">个人设置</Menu.Item>
                            <Menu.Item key="setting:4">系统设置</Menu.Item>
                        </MenuItemGroup> */}
          </SubMenu>
        </Menu>
        <div style={{ float: "right", marginRight: "40px", marginTop: "5px" }}>
          <Icon
            onClick={() => {
            //   this.setState({
            //     dotVisible: true
            //   });
            document.getElementById('reddot').style.display = 'none'
             hashHistory.push("/app/consumption/reservationManage");
            }}
            type="bell"
            style={{ fontSize: 18 }}
          />
          <img
            id="reddot"
            src={reddot}
            alt="提醒"
            style={{
              position: "relative",
              left: "-7px",
            //   display: redVisible ? "display" : "none"
            display:'none'
            }}
          />
        </div>

        <style>{`
                    .ant-menu-submenu-horizontal > .ant-menu {
                        width: 120px;
                        left: -40px;
                    }
                `}</style>
      </Header>
    );
  }
}

export default HeaderCustom;
