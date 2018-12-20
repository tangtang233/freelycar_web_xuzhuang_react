import React, { Component } from "react";
import { Layout, Menu, Icon } from "antd";
const { Sider } = Layout;
const SubMenu = Menu.SubMenu;
import { Link } from "react-router";
import $ from "jquery";
import logo from "../styles/imgs/logo.png";
class SiderCustom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      mode: "inline",
      openKey: "",
      selectedKey: "",
      user: "",
      role: 1
    };
  }
  componentDidMount() {
    this.queryAdmin();
    const _path = this.props.path;
    this.setState({
      openKey: _path.substr(0, _path.lastIndexOf("/")),
      selectedKey: _path
    });
  }

  queryAdmin = () => {
    $.ajax({
      url: "api/" + localStorage.getItem("store") + "/" + "admin/getaccount",
      type: "GET",
      data: {
        account: localStorage.getItem("username")
      },
      success: res => {
        this.setState({
          user: res.data.name,
          role: res.data.role.id
        });
      }
    });
  };

  componentWillReceiveProps(nextProps) {
    this.onCollapse(nextProps.collapsed);
  }
  onCollapse = collapsed => {
    this.setState({
      collapsed,
      mode: collapsed ? "vertical" : "inline"
    });
  };
  menuClick = e => {
    this.setState({
      selectedKey: e.key
    });
  };
  openMenu = v => {
    this.setState({
      openKey: v[v.length - 1]
    });
  };
  render() {
    return (
      <Sider
        trigger={null}
        breakpoint="lg"
        collapsible
        collapsed={this.props.collapsed}
        // onCollapse={this.onCollapse}
        style={{ overflowY: "auto" }}
      >
        <div className="logo">
          <img src={logo} />
          <span className="logo-text">小易爱车</span>
        </div>
        <Menu
          onClick={e => this.menuClick(e)}
          theme="dark"
          mode={this.state.mode}
          selectedKeys={[this.state.selectedKey]}
          openKeys={[this.state.openKey]}
          onOpenChange={this.openMenu}
        >
          {this.state.role != 3 && (
            <Menu.Item key="/dashboard/index">
              <Link to={"/dashboard/index"}>
                <Icon type="laptop" />
                <span className="nav-text">首页</span>
              </Link>
            </Menu.Item>
          )}
          {this.state.role != 3 && (
            <SubMenu
              key="/app/consumption"
              title={
                <span>
                  <Icon type="switcher" />
                  <span className="nav-text">消费开单</span>
                </span>
              }
            >
              <Menu.Item key="/app/consumption/order">
                <Link to={"/app/consumption/order"}>快速开单</Link>
              </Menu.Item>
              <Menu.Item key="/app/consumption/ordermanage">
                <Link to={"/app/consumption/orderManage"}>单据管理</Link>
              </Menu.Item>
              <Menu.Item key="/app/consumption/reservationManage">
                <Link to={"/app/consumption/reservationManage"}>预约管理</Link>
              </Menu.Item>
            </SubMenu>
          )}

          {this.state.role != 3 && (
            <SubMenu
              key="/app/incomeManage"
              title={
                <span>
                  <Icon type="pay-circle-o" />
                  <span className="nav-text">收支管理</span>
                </span>
              }
            >
              <Menu.Item key="/app/incomeManage/incomeSearch">
                <Link to={"/app/incomeManage/incomeSearch"}>收支查询</Link>
              </Menu.Item>
              <Menu.Item key="/app/incomeManage/historyAccount">
                <Link to={"/app/incomeManage/historyAccount"}>
                  历史收支查询
                </Link>
              </Menu.Item>
              <Menu.Item key="/app/incomeManage/otherPay">
                <Link to={"/app/incomeManage/otherPay"}>其他支出</Link>
              </Menu.Item>
            </SubMenu>
          )}

          <SubMenu
            key="/app/member"
            title={
              <span>
                <Icon type="usergroup-add" />
                <span className="nav-text">会员管理</span>
              </span>
            }
          >
            {this.state.role != 3 && (
              <Menu.Item key="/app/member/memberShip">
                <Link to={"/app/member/memberShip"}>会员办理</Link>
              </Menu.Item>
            )}
            {this.state.role != 3 && (
              <Menu.Item key="/app/member/customer">
                <Link to={"/app/member/customer"}>客户管理</Link>
              </Menu.Item>
            )}
            <Menu.Item key="/app/member/autoInsurance">
              <Link to={"/app/member/autoInsurance"}>车险客户</Link>
            </Menu.Item>
          </SubMenu>
          {this.state.role != 3 && (
            <SubMenu
              key="/app/buySellStock"
              title={
                <span>
                  <Icon type="shopping-cart" />
                  <span className="nav-text">进销存管理</span>
                </span>
              }
            >
              <Menu.Item key="/app/buySellStock/productSearch">
                <Link to={"/app/buySellStock/productSearch"}>库存查询</Link>
              </Menu.Item>
              <Menu.Item key="/app/buySellStock/putInStorage">
                <Link to={"/app/buySellStock/putInStorage"}>入库</Link>
              </Menu.Item>
              <Menu.Item key="/app/buySellStock/sellProduct">
                <Link to={"/app/buySellStock/sellProduct"}>出库</Link>
              </Menu.Item>
              <Menu.Item key="/app/buySellStock/providerManage">
                <Link to={"/app/buySellStock/providerManage"}>供应商管理</Link>
              </Menu.Item>
            </SubMenu>
          )}
          {this.state.role != 3 && (
            <SubMenu
              key="/app/productManage"
              title={
                <span>
                  <Icon type="appstore-o" />
                  <span className="nav-text">产品管理</span>
                </span>
              }
            >
              <Menu.Item key="/app/productManage/projectManage">
                <Link to={"/app/productManage/itemManage"}>项目管理</Link>
              </Menu.Item>
              <Menu.Item key="/app/productManage/partsManage">
                <Link to={"/app/productManage/partsManage"}>配件管理</Link>
              </Menu.Item>
              <Menu.Item key="/app/productManage/cardManage">
                <Link to={"/app/productManage/cardManage"}>卡类管理</Link>
              </Menu.Item>
            </SubMenu>
          )}
          {this.state.role != 3 && (
            <SubMenu
              key="/app/dataTable"
              title={
                <span>
                  <Icon type="line-chart" />
                  <span className="nav-text">数据报表</span>
                </span>
              }
            >
              <Menu.Item key="/app/dataTable/businessSummary">
                <Link to={"/app/dataTable/businessSummary"}>营业汇总</Link>
              </Menu.Item>
                <Menu.Item key="/app/dataTable/flowDetails">
                    <Link to={"/app/dataTable/flowDetails"}>流水明细</Link>
                </Menu.Item>
            </SubMenu>
          )}
          {this.state.role != 3 && (
            <SubMenu
              key="/app/marketingManagement"
              title={
                <span>
                  <Icon type="bulb" />
                  <span className="nav-text">营销管理</span>
                </span>
              }
            >
              <Menu.Item key="/app/marketingManagement/preferentialActivities">
                <Link to={"/app/marketingManagement/preferentialActivities"}>
                  优惠活动
                </Link>
              </Menu.Item>
            </SubMenu>
          )}
          {this.state.role != 3 && (
            <SubMenu
              key="/app/systemSet"
              title={
                <span>
                  <Icon type="setting" />
                  <span className="nav-text">系统设置</span>
                </span>
              }
            >
              <Menu.Item key="/app/systemSet/staffManage">
                <Link to={"/app/systemSet/staffManage"}>员工管理</Link>
              </Menu.Item>
              <Menu.Item key="/app/systemSet/accountManage">
                <Link to={"/app/systemSet/accountManage"}>账户管理</Link>
              </Menu.Item>
              <Menu.Item key="/app/systemSet/storeManage">
                <Link to={"/app/systemSet/storeManage"}>门店管理</Link>
              </Menu.Item>
              <Menu.Item key="/app/systemSet/cabinetManage">
                <Link to={"/app/systemSet/cabinetManage"}>智能柜管理</Link>
              </Menu.Item>
            </SubMenu>
          )}
        </Menu>
        <style>
          {`
                    #nprogress .spinner{
                        left: ${this.state.collapsed ? "70px" : "206px"};
                        right: 0 !important;
                    }
                    `}
        </style>
      </Sider>
    );
  }
}

export default SiderCustom;
