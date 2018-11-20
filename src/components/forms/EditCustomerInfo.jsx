import React from "react";
import BreadcrumbCustom from "../BreadcrumbCustom.jsx";
import { Link } from "react-router";
import {
  Row,
  Col,
  Select,
  Input,
  Card,
  Dropdown,
  Menu,
  Icon,
  DatePicker,
  Modal,
  Button,
  message
} from "antd";
import styled from "styled-components";
import update from "immutability-helper";
import $ from "jquery";
import moment from "moment";
import yyyymmdd from "../../utils/dateHelper";
const Option = Select.Option;
const { MonthPicker, RangePicker } = DatePicker;
const MemberButton = styled.div`
  display: inline-block;
  padding: 10px 30px;
  font-size: 15px;
  background: #01adff;
  color: #fff;
  border-radius: 5px;
`;
class CustomerInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "",
      option: [],
      visible: false,
      cards: [],
      carInfo: {
        carId: "",
        clientId: "",
        licensePlate: localStorage.getItem("licensePlate"),
        clientName: "",
        carBrand: "",
        phone: "",
        consumAmout: "",
        tips: "",
        gender: "",
        lastMiles: "",
        consumTimes: "",
        lastVisit: "",
        pickCarStaff: { id: "" },
        parkingLocation: "",
        miles: "",
        carType: ""
      }
    };
  }

  componentDidMount() {
    let carPlate = localStorage.getItem("licensePlate");
    this.setState({
      carInfo: update(this.state.carInfo, { licensePlate: { $set: carPlate } })
    });
    this.licenseChange(carPlate);
  }

  componentWillReceiveProps(props) {
    if (
      props.consumOrder &&
      props.consumOrder.licensePlate !== this.state.carInfo.licensePlate
    ) {
      this.setState({
        carInfo: props.consumOrder
      });
    }
  }

  licenseChange = value => {
    this.setState({
      carInfo: update(this.state.carInfo, { licensePlate: { $set: value } })
    });
    if (value.length == 8 || value.length == 7) {
      let data = {};
      data.licensePlate = value;
      $.ajax({
        url: "api/" + localStorage.getItem("store") + "/" + "car/getcar",
        data: data,
        type: "get",
        dataType: "json",
        success: res => {
          console.log(res);
          if (res.code == "0") {
            let data = res.data,
              cars = data.cars,
              carBrand,
              lastMiles,
              carId,
              carType;
            for (let item of cars) {
              if (item.licensePlate == value) {
                carBrand = item.carbrand;
                lastMiles = item.lastMiles;
                carId = item.id;
                carType = item.cartype;
              }
            }
            this.setState(
              {
                cards: data.cards,
                carInfo: update(this.state.carInfo, {
                  ["carId"]: { $set: carId },
                  ["clientId"]: { $set: data.id },
                  ["clientName"]: { $set: data.name },
                  ["isMember"]: { $set: data.isMember },
                  ["carBrand"]: { $set: carBrand },
                  ["phone"]: { $set: data.phone },
                  ["gender"]: { $set: data.gender },
                  ["lastMiles"]: { $set: lastMiles },
                  ["miles"]: { $set: lastMiles },
                  ["consumAmout"]: { $set: data.consumAmout },
                  ["consumTimes"]: { $set: data.consumTimes },
                  ["lastVisit"]: { $set: data.lastVisit },
                  ["licensePlate"]: { $set: value },
                  ["carType"]: { $set: carType }
                })
              },
              () => {
                this.props.saveInfo(this.state.carInfo);
              }
            );
          } else {
            message.error(res.msg);
          }
        }
      });
    }
  };

  handleValueChange = (key, value) => {
    this.setState(
      {
        carInfo: update(this.state.carInfo, { [key]: { $set: value } })
      },
      () => {
        this.props.saveInfo(this.state.carInfo);
      }
    );
  };

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  handleOk = () => {
    this.setState({
      visible: false
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false
    });
  };

  render() {
    const plateOptions = this.props.staffList.map((item, index) => {
      return (
        <Option key={index} value={item.id + ""}>
          {item.name}
        </Option>
      );
    });
    const cardDetail = this.state.cards.map((item, index) => {
      return (
        <Row gutter={16} style={{ marginBottom: "10px" }} key={index}>
          <Col span={8}>
            <span style={{ fontWeight: "bolder", marginRight: "10px" }}>
              卡{index + 1}
            </span>
            会员卡种类: {item.projectInfos.length === 0 ? "储值卡" : "计次卡"}
          </Col>
          <Col span={8}>会员卡名称: {item.service.name}</Col>
          <Col span={8}>
            {item.projectInfos.length === 0 ? "余额" : "剩余次数"}:{" "}
            {item.projectInfos.length === 0
              ? item.balance
              : item.projectInfos.map((item, index) => {
                  return (
                    <span key={index}>
                      {item.project.name}-{item.remaining}次{" "}
                    </span>
                  );
                })}
          </Col>
        </Row>
      );
    });
    return (
      <div className="gutter-example">
        <div style={{ marginBottom: "15px" }}>
          <div style={{ width: "30%", display: "inline-block" }}>
            开单人：
            <span style={{ width: "150px" }}>小易爱车</span>
          </div>
        </div>
        <Card
          bodyStyle={{ background: "#fff" }}
          style={{ marginBottom: "10px" }}
        >
          <Row gutter={16} style={{ marginBottom: "10px" }}>
            <Col span={8}>
              <span
                style={{ marginLeft: "-8px", color: "red", marginRight: "2px" }}
              >
                *
              </span>
              车牌号码：
              {!this.props.consumOrder && (
                <Input
                  value={this.state.carInfo.licensePlate}
                  onChange={e => {
                    this.licenseChange(e.target.value);
                  }}
                  style={{ width: "100px" }}
                />
              )}
              {this.props.consumOrder && (
                <span>{this.state.carInfo.licensePlate}</span>
              )}
              <Link to="/app/member/addclient">
                <Icon
                  type="plus-circle-o"
                  onClick={this.showModal}
                  style={{
                    marginLeft: "10px",
                    color: "#108ee9",
                    cursor: "pointer"
                  }}
                />
              </Link>
            </Col>
            <Col span={8}>
              客户姓名：
              <span style={{ width: "100px" }}>
                {this.state.carInfo.clientName}
              </span>
              <Link to="/app/member/addclient">
                <Icon
                  type="plus-circle-o"
                  style={{ marginLeft: "10px", cursor: "pointer" }}
                />
              </Link>
            </Col>
            <Col span={8}>
              是否会员：
              {this.state.carInfo.clientId && (
                <span style={{ width: "100px" }}>
                  {this.state.carInfo.isMember ? "是" : "否"}
                </span>
              )}
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: "10px" }}>
            <Col span={8}>
              品牌型号：
              <span style={{ width: "100px" }}>
                {this.state.carInfo.carBrand}
              </span>
            </Col>
            <Col span={8}>
              手机号码：
              <span style={{ width: "100px" }}>{this.state.carInfo.phone}</span>
            </Col>
            <Col span={8}>
              <span
                style={{ marginLeft: "-8px", color: "red", marginRight: "2px" }}
              >
                *
              </span>
              接车人员：
              <Select
                style={{ width: "152px" }}
                value={
                  this.state.carInfo.pickCarStaff
                    ? this.state.carInfo.pickCarStaff.id + ""
                    : null
                }
                onChange={value =>
                  this.handleValueChange("pickCarStaff", { id: value })
                }
                dropdownStyle={{ overflow: "scroll" }}
              >
                {plateOptions}
              </Select>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: "10px" }}>
            <Col span={8}>
              上次里程：
              <span style={{ width: "100px" }}>
                {this.state.carInfo.lastMiles}
                km{" "}
              </span>
            </Col>
            <Col span={8}>
              历史消费：
              <span style={{ width: "100px" }}>
                ￥{this.state.carInfo.consumAmout}
              </span>
            </Col>
            <Col span={8}>
              <span
                style={{ marginLeft: "-8px", color: "red", marginRight: "2px" }}
              >
                *
              </span>
              接车时间：
              <DatePicker
                showTime
                defaultValue={moment()}
                format="YYYY-MM-DD HH:mm:ss"
                onChange={(time, dateStrings) => {
                  console.log(dateStrings);
                  this.handleValueChange("pickTime", dateStrings);
                }}
              />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: "10px" }}>
            <Col span={8}>
              本次里程：
              <Input
                style={{ width: "100px" }}
                value={this.state.carInfo.miles}
                onChange={e => {
                  this.handleValueChange("miles", e.target.value);
                }}
              />
              &nbsp;&nbsp;km
            </Col>
            <Col span={8} style={{ height: "28px", lineHeight: "28px" }}>
              提示信息：
              <span style={{ width: "100px" }}>
                共消费
                {this.state.carInfo.consumTimes}
                次, 最近消费
                {this.state.carInfo.lastVisit}
              </span>
            </Col>
          </Row>
        </Card>
        <Card style={{ marginBottom: "10px" }}>{cardDetail}</Card>
      </div>
    );
  }
}
export default CustomerInfo;
