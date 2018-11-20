import React from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Select,
  InputNumber,
  Input,
  Button,
  Form,
  Icon,
  Popconfirm,
  DatePicker,
  Modal,
  Radio,
  message,
  Popover
} from "antd";
import { Link } from "react-router";
import BreadcrumbCustom from "../BreadcrumbCustom.jsx";
import CarTable from "../tables/CarTable.jsx";
import $ from "jquery";
import update from "immutability-helper";
import PreFixInterge from "../../utils/PreFixInterge.js";
import CarBrand from "../model/CarBrand.jsx";
import compare from "../../utils/compare.js";
import { hashHistory } from "react-router";
const { MonthPicker, RangePicker } = DatePicker;
const Option = Select.Option;
const FormItem = Form.Item;
const columns = [
  {
    title: "项目名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "可用次数",
    dataIndex: "times",
    key: "times"
  }
];
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

class ClientDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      option: [],
      type: [],
      carModal: false,
      carbrand: "",
      models: [],
      model: "",
      client: this.props.params.id,
      value: this.props.value,
      editable: false,
      licensePlateClassName: "hidden",
      visible: false,
      cardvisible: false,
      renewalvisible: false,
      cardDetailData: [],
      cardDetail: {},
      carNum: 0,
      cardColumns: [
        {
          title: "卡号",
          dataIndex: "cardNum",
          key: "cardNum",
          render: text => {
            return <span>{text}</span>;
          }
        },
        {
          title: "卡名称",
          dataIndex: "cardname",
          key: "cardname"
        },
        {
          title: "会员卡类",
          dataIndex: "cardClasses",
          key: "cardClasses"
        },
        {
          title: "开卡时间",
          dataIndex: "payDate",
          key: "payDate"
        },
        {
          title: "制单人",
          dataIndex: "makePeople",
          key: "makePeople"
        },
        {
          title: "操作",
          dataIndex: "queryInfo",
          key: "query",
          render: (text, record, index) => {
            if (record.type == "2") {
              return (
                <Row>
                  <Col span="12">
                    <a
                      href="javascript:void(0);"
                      style={{ marginLeft: "5px" }}
                      onClick={() => this.showCardModal(record)}
                    >
                      查看详情
                    </a>
                  </Col>
                  <Col span="12">
                    <a
                      href="javascript:void(0);"
                      onClick={() => {
                        this.cardRenewal(record);
                      }}
                    >
                      续卡
                    </a>
                  </Col>
                </Row>
              );
            } else {
              return (
                <div>
                  <a
                    href="javascript:void(0);"
                    onClick={() => this.showCardModal(record)}
                  >
                    查看详情
                  </a>
                </div>
              );
            }
          }
        }
      ],
      couponColumns: [
        {
          title: "券名",
          dataIndex: "favour",
          key: "title",
          render: (text, record, index) => {
            return <span>{text.name}</span>;
          }
        },
        {
          title: "券种",
          dataIndex: "favour",
          key: "couponCategory",
          render: (text, record, index) => {
            return <span>{text.type == 1 ? "抵用券" : "代金券"}</span>;
          }
        },
        {
          title: "到期日",
          dataIndex: "expirationDate",
          key: "expirationDate"
        },
        {
          title: "优惠项目",
          dataIndex: "favour",
          key: "discountProgram",
          render: (text, record, index) => {
            let program = "";
            for (let item of text.set) {
              program =
                program + (program != "" ? "、" : "") + item.project.name;
            }
            return <span>{program}</span>;
          }
        },
        {
          title: "项目原价",
          dataIndex: "favour",
          key: "originPrice",
          render: (text, record, index) => {
            let price = 0;
            for (let item of text.set) {
              price = price + item.project.price;
            }
            return <span>{price}</span>;
          }
        },
        {
          title: "项目现价",
          dataIndex: "favour",
          key: "currentPrice",
          render: (text, record, index) => {
            let price = 0;
            for (let item of text.set) {
              price = price + item.presentPrice;
            }
            return <span>{price}</span>;
          }
        },
        {
          title: "购券价格",
          dataIndex: "favour",
          key: "buyPrice",
          render: (text, record, index) => {
            let price = 0;
            for (let item of text.set) {
              price = price + item.buyPrice;
            }
            return <span>{price}</span>;
          }
        }
      ],
      carColumns: [
        {
          title: "车牌号码",
          dataIndex: "carNum",
          key: "carNum"
        },
        {
          title: "品牌",
          dataIndex: "brand",
          key: "brand"
        },
        {
          title: "车辆型号",
          dataIndex: "carType",
          key: "carType"
        },
        {
          title: "里程数",
          dataIndex: "mileageNum",
          key: "mileageNum"
        },
        {
          title: "发动机号",
          dataIndex: "engineNumber",
          key: "engineNumber"
        },
        {
          title: "是否新车",
          dataIndex: "newcar",
          key: "newcar"
        },
        {
          title: "保险金额",
          dataIndex: "insuranceMoney",
          key: "insuranceMoney"
        },
        {
          title: "保险有效期",
          dataIndex: "insuranceTime",
          key: "insuranceTime"
        },
        // { title: '备注', dataIndex: 'other', key: 'other' },
        {
          title: "操作",
          dataIndex: "operation",
          key: "operation",
          render: (text, record, index) => {
            return (
              <span>
                <span style={{ marginRight: "10px" }}>
                  <Popconfirm
                    title="确认要删除嘛?"
                    onConfirm={() => this.onDelete(record.id)}
                  >
                    <a href="javascript:void(0);" style={{ marginLeft: "5px" }}>
                      删除
                    </a>
                  </Popconfirm>
                </span>
              </span>
            );
          }
        }
      ],

      payColumns: [
        {
          title: "序号",
          dataIndex: "index",
          key: "index",
          render: (text, record, index) => {
            return <span>{index + 1}</span>;
          }
        },
        {
          title: "项目",
          dataIndex: "maintainItem",
          key: "maintainItem"
        },
        {
          title: "消费金额",
          dataIndex: "payMoney",
          key: "payMoney"
        },
        {
          title: "支付方式",
          dataIndex: "payType",
          key: "payType"
        },
        {
          title: "服务时间",
          dataIndex: "serviceTime",
          key: "serviceTime"
        }
      ],

      form: {
        name: "",
        phone: "",
        birthday: "",
        gender: "",
        driverLicense: "",
        idNumber: "",
        points: "",
        licensePlate: "",
        insuranceStarttime: "",
        insuranceEndtime: "",
        insuranceAmount: "",
        frameNumber: "",
        engineNumber: "",
        licenseDate: "",
        newCar: "",
        lastMiles: "",
        miles: ""
      },
      cardData: [],
      carData: [],
      payData: [],

      renewalData: {
        payMoney: 1000,
        cardMoney: 1000,
        payMethod: 0
      },
      staffList: []
    };
  }

  componentDidMount() {
    this.getClientInfo();
    this.getStaffList();
    //this.queryConsumOrder();
  }

  getClientInfo = () => {
    $.ajax({
      url: "api/" + localStorage.getItem("store") + "/" + "client/detail",
      dataType: "json",
      type: "GET",
      data: {
        clientId: this.props.params.id
      },

      success: res => {
        console.log("客户", res);
        if (res.code == "0") {
          var obj = res.client;
          var objcar = obj.cars;
          var objcard = obj.cards;
          var objpay = res.data;
          let carlist = [];
          let cardlist = [];
          let paylist = [];
          let cardDetaillist = [];
          //获取车辆信息
          // objpay.sort(compare('serviceDate'))
          for (let i = 0; i < objcar.length; i++) {
            let carItem = {
              key: objcar[i].id,
              id: objcar[i].id,
              carNum: objcar[i].licensePlate,
              brand: objcar[i].carbrand,
              carType: objcar[i].cartype,
              mileageNum: objcar[i].lastMiles,
              newcar: objcar[i].newCar ? "是" : "否",
              engineNumber: objcar[i].engineNumber,
              insuranceMoney: objcar[i].insuranceAmount,
              insuranceTime: objcar[i].insuranceEndtime,
              other: ""
            };
            carlist.push(carItem);
            if (carlist.length == objcar.length) {
              this.setState({
                carData: carlist
              });
            }
          }
          //获取卡信息

          for (let j = 0; j < objcard.length; j++) {
            let projectInfo = objcard[j].projectInfos;
            let projectlist = [];
            projectInfo.map((item, index) => {
              let projectItem = {
                key: index,
                name: item.project.name,
                times: item.remaining
              };
              projectlist.push(projectItem);
            });
            let cardClassesType = objcard[j].service.type;
            let cardClasses = "";
            switch (cardClassesType) {
              case 0:
                cardClasses = "次卡";
                break;
              case 1:
                cardClasses = "组合次卡";
                break;
              case 2:
                cardClasses = "储值卡";
                break;
              default:
                break;
            }
            let cardItem = {
              type: objcard[j].service.type,
              key: objcard[j].id,
              cardNum: objcard[j].cardNumber,
              cardClasses: cardClasses,
              payDate: objcard[j].payDate,
              cardname: objcard[j].service.name,
              makePeople: objcard[j].orderMaker
                ? objcard[j].orderMaker.name
                : "",
              projectInfos: projectlist,
              expirationDate: objcard[j].expirationDate,
              price: objcard[j].service.price,
              validTime: objcard[j].service.validTime,
              balance: objcard[j].balance,
              discount: objcard[j].service.discount
            };
            cardlist.push(cardItem);
            if (cardlist.length == objcard.length) {
              this.setState({
                cardData: cardlist
              });
            }
          }

          let clientInfo = {
            name: obj.name,
            phone: obj.phone,
            birthday: obj.birthday != undefined ? obj.birthday : "",
            gender: obj.gender,
            driverLicense: obj.driverLicense,
            idNumber: obj.idNumber,
            points: obj.points
          };

          this.setState({
            carNum: obj.cars.length,
            form: clientInfo,
            tickets: res.client.tickets
          });

          //获取消费记录

          for (let k = 0; k < (objpay.length > 3 ? 3 : objpay.length); k++) {
            let payMethod = objpay[k].payMethod;
            let paymeth;
            switch (payMethod) {
              case 0:
                paymeth = "现金";
                break;
              case 1:
                paymeth = "刷卡";
                break;
              case 2:
                paymeth = "支付宝";
                break;
              case 3:
                paymeth = "微信";
                break;
              case 4:
                paymeth = "易付宝";
                break;
            }
            //      let servicePeople=objpay[k].programName=="Card"?objcard[k].orderMaker.name: objpay[k].staffNames;

            let payItem = {
              key: objpay[k].id,
              id: objpay[k].id,
              maintainItem: objpay[k].project,
              payMoney: objpay[k].consumAmount,
              payType: paymeth,
              // carType: "911",
              //   servicePeople: servicePeople,
              serviceTime: objpay[k].serviceDate,
              insuranceMoney: objpay[k].amount
              //   serviceState: "完成",
            };
            paylist.push(payItem);
          }

          this.setState({
            payData: paylist
          });
        }
      }
    });
  };

  getStaffList = () => {
    $.ajax({
      url: "api/" + localStorage.getItem("store") + "/" + "staff/list",
      type: "get",
      dataType: "json",
      data: {
        page: 1,
        number: 99
      },
      success: res => {
        if (res.code == "0") {
          this.setState({ staffList: res.data });
        }
      }
    });
  };

  onDelete = idnum => {
    $.ajax({
      type: "post",
      url: "api/" + localStorage.getItem("store") + "/" + "client/delcar",
      // contentType:'application/json;charset=utf-8',
      dataType: "json",
      data: {
        clientId: this.props.params.id,
        carId: idnum
      },
      traditional: true,
      success: result => {
        this.getClientInfo();
        message.success("删除成功", 1.5);
      }
    });
  };
  onChange = e => {
    this.setState({
      value: e.target.value
    });
  };
  onreturn = () => {
    hashHistory.push("/app/member/customer?from=xq");
  };

  handleChange = e => {
    let typelist;
    this.state.option.map((item, index) => {
      if (item.id == e) {
        typelist = item.types;
      }
    });
    this.setState({
      carId: e,
      type: typelist,
      //  type:""
      typeId: ""
    });
  };

  check = () => {
    this.setState({ editable: false });
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  };

  edit = () => {
    this.setState({ editable: true });
  };

  onHandleChange = (e, key) => {
    let form = this.state.form;
    form[key] = e.target.value;
    this.setState({
      form: form
    });
  };

  showModal = () => {
    if (this.state.carNum < 3) {
      this.setState({
        visible: true
      });
    } else {
      alert("同一用户名下不得添加超过3辆车!");
    }
  };

  showCardModal(obj) {
    this.setState({
      cardvisible: true,
      cardDetail: obj
    });
  }

  cardRenewal(obj) {
    this.setState({
      renewalvisible: true,
      cardDetail: obj
    });
  }
  renewalhandleOk = () => {
    const cardDetail = this.state.cardDetail;
    const renewalData = this.state.renewalData;
    if (!renewalData.handlerId) {
      message.warning("请选择办理人员！");
      return;
    }
    if (!renewalData.cardMoney || renewalData.cardMoney <= 0) {
      message.warning("请输入卡面金额！");
      return;
    }
    $.ajax({
      type: "post",
      url: "api/" + localStorage.getItem("store") + "/" + "card/renewal",
      // contentType:'application/json;charset=utf-8',
      dataType: "json",
      data: {
        cardId: cardDetail.key,
        payMoney: renewalData.payMoney,
        cardMoney: renewalData.cardMoney,
        payMethod: renewalData.payMethod,
        handlerId: renewalData.handlerId
      },
      traditional: true,
      success: result => {
        if (result.code == 0) {
          message.success("续卡成功！", 1.5);
          this.getClientInfo();
        } else {
          message.warning("续卡失败，请重试", 1.5);
        }
      }
    });

    this.setState({
      renewalvisible: false
    });
  };

  renewalhandleCancel = () => {
    this.setState({
      renewalvisible: false
    });
  };
  handleOk = () => {
    this.saveData();
    this.getClientInfo();
  };

  cardhandleOk = () => {
    this.setState({
      cardvisible: false
    });
  };

  cardhandleCancel = () => {
    this.setState({
      cardvisible: false
    });
  };

  handleCancel2 = () => {
    this.setState({
      carModal: false
    });
  };

  saveCarData = (str, modelArray) => {
    this.setState({
      carbrand: str,
      models: modelArray
    });
  };

  saveData = () => {
    let forms = this.state.form;
    if (this.licensePlateCheckInfo()) {
      if (!(forms.licensePlate && this.state.carbrand)) {
        message.error("请输入必填信息");
      } else {
        $.ajax({
          type: "post",
          url: "api/" + localStorage.getItem("store") + "/" + "client/addcar",
          datatype: "json",
          contentType: "application/json;charset=utf-8",
          data: JSON.stringify({
            carbrand: this.state.carbrand,
            cartype: this.state.model,
            carMark: window.localStorage.getItem("carMark"),
            licensePlate: forms.licensePlate,
            //时间选择
            insuranceStarttime: forms.insuranceStarttime,
            //时间选择
            insuranceEndtime: forms.insuranceEndtime,
            insuranceAmount: forms.insuranceAmount,
            frameNumber: forms.frameNumber,
            engineNumber: forms.engineNumber,
            //时间选择
            licenseDate: forms.licenseDate,
            newCar: forms.newCar,
            lastMiles: forms.lastMiles,
            miles: forms.miles,
            client: {
              id: this.props.params.id
            }
          }),
          success: res => {
            if (res.code == 0) {
              this.getClientInfo();
              this.setState({
                visible: false
              });
            } else {
              message.error(res.msg);
            }
          }
        });
      }
    }
  };

  insuranceStarttimeonChange = time => {
    this.setState({
      form: update(this.state.form, {
        insuranceStarttime: { $set: new Date(time) }
      })
    });
  };
  insuranceEndtimeonChange = time => {
    let start =
      this.state.form.insuranceStarttime == ""
        ? new Date(time).getTime() - 1
        : this.state.form.insuranceStarttime.getTime();
    if (new Date(time).getTime() < start) {
      message.warning("截止时间必须大于开始时间");
    } else {
      this.setState({
        form: update(this.state.form, {
          insuranceEndtime: { $set: new Date(time) }
        })
      });
    }
  };
  licensetimeonChange = time => {
    this.state.form.licensetime = new Date(time);
  };
  onValueChange = (key, value) => {
    this.setState({
      form: update(this.state.form, { [key]: { $set: value } })
    });
  };
  isnewcar = e => {
    this.setState({
      carvalue: e.target.value
    });
    this.state.form.newCar = e.target.value;
  };

  TypehandleChange = value => {
    this.setState({
      model: value
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false
    });
  };
  onOk = value => {};
  licensePlateCheckInfo = () => {
    var licensePlatecheck = this.state.form.licensePlate;
    var re = /^[\u4e00-\u9fa5]{1}[A-Z]{1}[A-Z_0-9]{5}$/;
    if (!re.test(licensePlatecheck)) {
      this.setState({
        licensePlateClassName: "display"
      });
      return false;
    } else {
      this.setState({
        licensePlateClassName: "hidden"
      });
      return true;
    }
  };

  handleRenewalChange = (key, value) => {
    if (key == "cardMoney") {
      const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
      if (!((!isNaN(value) && reg.test(value)) || value === "")) {
        return;
      }
    }
    this.setState({
      renewalData: update(this.state.renewalData, { [key]: { $set: value } })
    });
  };

  render() {
    const { value, editable } = this.state;
    const RadioGroup = Radio.Group;
    const brandOptions = this.state.option.map((item, index) => {
      return (
        <Option key={index + 1} value={item.id + ""}>
          {item.name}
        </Option>
      );
    });
    const typeOptions = this.state.models.map((item, index) => {
      return (
        <Option key={index} value={item.model}>
          {item.model}
        </Option>
      );
    });
    const staffOptions = this.state.staffList.map((item, index) => {
      return (
        <Option key={index} value={item.id + ""}>
          {item.name}
        </Option>
      );
    });
    return (
      <div>
        <BreadcrumbCustom first="会员管理" second="客户信息" third="详细信息" />
        <Card
          title="客户资料"
          bordered={false}
          style={{ marginBottom: "15px" }}
        >
          <Row gutter={16} style={{ marginBottom: "15px" }}>
            <Col span={3} />
            <Col span={6}>
              姓名：
              <span style={{ width: "200px" }}>{this.state.form.name}</span>
            </Col>
            <Col span={6}>
              手机号：
              <span style={{ width: "200px" }}>{this.state.form.phone} </span>
            </Col>
            <Col span={6}>
              生日：
              <span>{this.state.form.birthday.substring(0, 10)}</span>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: "15px" }}>
            <Col span={3} />
            <Col span={6}>
              性别：
              <span style={{ width: "200px" }}>{this.state.form.gender}</span>
            </Col>
            <Col span={6}>
              身份证号：
              <span style={{ width: "200px" }}>{this.state.form.idNumber}</span>
            </Col>
            <Col span={6}>
              行驶证号：
              <span style={{ width: "200px" }}>
                {this.state.form.driverLicense}
              </span>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: "15px" }}>
            <Col span={3} />
            <Col span={6}>
              积分：
              <span>{this.state.form.points}</span>
            </Col>
          </Row>
        </Card>
        <Card
          title="会员卡信息"
          className="accountTable"
          style={{ marginBottom: "15px" }}
        >
          <Button style={{ marginBottom: "20px" }}>
            <Link to={"/app/member/memberShip/" + this.props.params.id}>
              <Icon type="idcard" />
              <span>开卡</span>
            </Link>
          </Button>

          <Table
            columns={this.state.cardColumns}
            dataSource={this.state.cardData}
            bordered
          />
        </Card>
        <Card
          title="优惠券信息"
          className="accountTable"
          style={{ marginBottom: "15px" }}
        >
          <Table
            columns={this.state.couponColumns}
            dataSource={this.state.tickets}
            pagination={false}
            bordered
          />
        </Card>
        <Card
          title="车辆信息"
          className="accountTable"
          style={{ marginBottom: "15px" }}
        >
          <Button style={{ marginBottom: "20px" }} onClick={this.showModal}>
            <Icon type="car" />
            新增车辆
          </Button>
          <Table
            columns={this.state.carColumns}
            dataSource={this.state.carData}
          />
        </Card>
        <Card title="消费记录" className="accountTable">
          <Table
            columns={this.state.payColumns}
            dataSource={this.state.payData}
            bordered
          />
          <p style={{ float: "right", marginRight: "30px" }}>
            <Link
              to={
                "app/member/customer/" + this.props.params.id + "/payhistory/"
              }
            >
              {" "}
              更多
            </Link>
          </p>
        </Card>
        <Modal
          title="新增车辆"
          visible={this.state.visible}
          maskClosable={false}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okText="保存"
          cancelText="取消"
          width="60%"
        >
          <Row gutter={16} style={{ marginBottom: "15px" }}>
            <Col span={3} />
            <Col span={10}>
              <span style={{ marginLeft: "-5px", color: "red" }}>*</span>
              车牌号：
              <Input
                style={{ width: "150px", marginLeft: "10px" }}
                value={this.state.form.licensePlate}
                onChange={e =>
                  this.onValueChange("licensePlate", e.target.value)
                }
              />
              <span
                style={{
                  color: "red",
                  fontSize: "12px",
                  verticalAlign: "middle",
                  marginLeft: "10px"
                }}
                className={this.state.licensePlateClassName}
              >
                车牌号格式有误
              </span>
            </Col>
            <Col span={10} id="car-brand">
              <span style={{ marginLeft: "-5px", color: "red" }}>*</span>
              品牌车系:
              <span style={{ marginLeft: "10px" }}>{this.state.carbrand}</span>
              {this.state.carbrand == "" && (
                <Icon
                  type="plus-circle-o"
                  style={{ fontSize: 20, color: "#08c" }}
                  onClick={() => {
                    this.setState({ carModal: true });
                  }}
                />
              )}
              {this.state.carbrand != "" && (
                <Icon
                  type="close-circle-o"
                  style={{ marginLeft: "10px", fontSize: 16, color: "#08c" }}
                  onClick={() => {
                    this.setState({ carModal: true });
                  }}
                />
              )}
              {this.state.carModal && (
                <CarBrand
                  handleOk={() => {
                    this.setState({ carModal: false });
                  }}
                  saveCarData={this.saveCarData}
                  handleCancel={this.handleCancel2}
                  visible={this.state.carModal}
                />
              )}
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: "15px" }}>
            <Col span={3} />
            <Col span={10}>
              是否新车：
              <div style={{ display: "inline-block", marginLeft: "5px" }}>
                <RadioGroup
                  onChange={this.isnewcar}
                  value={this.state.carvalue}
                >
                  <Radio value={"true"}>是</Radio>
                  <Radio value={"false"}>否</Radio>
                </RadioGroup>
              </div>
            </Col>
            <Col span={10} id="car-type">
              车辆型号:
              <Select
                showSearch
                style={{ width: "150px", marginLeft: "10px" }}
                placeholder="请选择车辆型号"
                optionFilterProp="children"
                dropdownMatchSelectWidth={false}
                allowClear={true}
                onChange={this.TypehandleChange}
                filterOption={(input, option) =>
                  option.props.children.indexOf(input) >= 0
                }
              >
                {typeOptions}
              </Select>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: "15px" }}>
            <Col span={3} />
            <Col span={10}>
              保险金额：
              <Input
                style={{ width: "150px", marginLeft: "2px" }}
                value={this.state.form.insuranceAmount}
                onChange={e =>
                  this.onValueChange("insuranceAmount", e.target.value)
                }
              />
            </Col>

            <Col span={10}>
              保险开始日期:
              <DatePicker
                onChange={value => this.insuranceStarttimeonChange(value)}
                style={{ marginLeft: "10px" }}
              />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: "15px" }}>
            <Col span={3} />
            <Col span={10}>
              上次里程：
              <Input
                style={{ width: "150px", marginLeft: "2px" }}
                value={this.state.form.lastMiles}
                onChange={e => this.onValueChange("lastMiles", e.target.value)}
              />
            </Col>
            <Col span={10}>
              保险截止日期:
              <DatePicker
                onChange={value => this.insuranceEndtimeonChange(value)}
                style={{ marginLeft: "10px" }}
              />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: "15px" }}>
            <Col span={3} />
            <Col span={10}>
              本次里程：
              <Input
                style={{ width: "150px", marginLeft: "2px" }}
                value={this.state.form.miles}
                onChange={e => this.onValueChange("miles", e.target.value)}
              />
            </Col>
            <Col span={10}>
              上牌时间:
              <DatePicker
                onChange={this.licensetimeonChange}
                style={{ marginLeft: "35px", width: "150px" }}
              />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: "15px" }}>
            <Col span={3} />
            <Col span={10}>
              车架号：
              <Input
                style={{ width: "150px", marginLeft: "15px" }}
                value={this.state.form.frameNumber}
                onChange={e =>
                  this.onValueChange("frameNumber", e.target.value)
                }
              />
            </Col>
            <Col span={10}>
              发动机号：
              <Input
                style={{ width: "150px", marginLeft: "25px" }}
                value={this.state.form.engineNumber}
                onChange={e =>
                  this.onValueChange("engineNumber", e.target.value)
                }
              />
            </Col>
          </Row>
        </Modal>
        <Modal
          title="会员卡详情"
          visible={this.state.cardvisible}
          onOk={this.cardhandleOk}
          onCancel={this.cardhandleCancel}
          maskClosable={false}
          okText="确定"
          className="cardDetail"
        >
          <div>
            <Row gutter={16} style={{ marginBottom: "15px" }}>
              <Col span={12}>
                卡类名称：
                <span>{this.state.cardDetail.cardname}</span>
              </Col>
              <Col span={12}>
                卡类属性：
                <span>{this.state.cardDetail.cardClasses}</span>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: "15px" }}>
              <Col span={12}>
                售卡金额：
                <span>{this.state.cardDetail.price}</span>
              </Col>
              <Col span={12}>
                有效期：
                <span>{this.state.cardDetail.validTime}年</span>
              </Col>
            </Row>
            {this.state.cardDetail.type == "2" && (
              <Row gutter={16} style={{ marginBottom: "15px" }}>
                <Col span={12}>
                  剩余金额：
                  <span>{this.state.cardDetail.balance}</span>
                </Col>
              </Row>
            )}
            {this.state.cardDetail.type != "2" && (
              <div>
                <Row gutter={16} style={{ marginBottom: "15px" }}>
                  <Col span={12}>剩余次数明细：</Col>
                </Row>
                <Table
                  size={"small"}
                  pagination={false}
                  bordered
                  columns={columns}
                  dataSource={this.state.cardDetail.projectInfos}
                />{" "}
              </div>
            )}
          </div>
        </Modal>

        <Modal
          title="续卡充值"
          visible={this.state.renewalvisible}
          onOk={this.renewalhandleOk}
          onCancel={this.renewalhandleCancel}
          maskClosable={false}
          okText="办理"
        >
          <Form onSubmit={this.handleSubmit}>
            <FormItem {...formItemLayout} label="会员卡号" hasFeedback>
              <span>{this.state.cardDetail.cardNum}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="卡名称" hasFeedback>
              <span>{this.state.cardDetail.cardname}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="会员卡类" hasFeedback>
              <span>{this.state.cardDetail.cardClasses}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="有效期（年）" hasFeedback>
              <span>{this.state.cardDetail.validTime}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="折扣比例" hasFeedback>
              <span>{this.state.cardDetail.discount}%</span>
            </FormItem>
            <FormItem {...formItemLayout} label="卡内余额" hasFeedback>
              <span>{this.state.cardDetail.balance}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="续卡金额" hasFeedback>
              <Select
                style={{ width: 120 }}
                defaultValue="1000"
                onChange={value => {
                  this.handleRenewalChange("payMoney", value);
                }}
              >
                <Option value="1000" key="1000">
                  1000
                </Option>
                <Option value="2000" key="2000">
                  2000
                </Option>
                <Option value="5000" key="5000">
                  5000
                </Option>
              </Select>
            </FormItem>
            <FormItem {...formItemLayout} label="卡面金额" hasFeedback>
              <Input
                style={{ width: 120 }}
                value={this.state.renewalData.cardMoney}
                onChange={e => {
                  this.handleRenewalChange("cardMoney", e.target.value);
                }}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="支付方式" hasFeedback>
              <Select
                style={{ width: 120 }}
                defaultValue="0"
                onChange={value => {
                  this.handleRenewalChange("payMethod", value);
                }}
              >
                <Option value="0">现金</Option>
                <Option value="1">刷卡</Option>
                <Option value="2">支付宝</Option>
                <Option value="3">微信</Option>
                <Option value="4">易付宝</Option>
              </Select>
            </FormItem>
            <FormItem {...formItemLayout} label="办理人员" hasFeedback>
              <Select
                style={{ width: 120 }}
                onChange={value => {
                  this.handleRenewalChange("handlerId", value);
                }}
              >
                {staffOptions}
              </Select>
            </FormItem>
          </Form>
        </Modal>
        <div>
          <Button
            type="primary"
            style={{
              float: "right",
              margin: "10px",
              width: "100px",
              height: "50px"
            }}
            size={"large"}
            onClick={() => this.onreturn()}
          >
            返回
          </Button>
        </div>
      </div>
    );
  }
}
export default ClientDetail;
