import React from "react";
import BreadcrumbCustom from "../BreadcrumbCustom.jsx";
import $ from "jquery";
import update from "immutability-helper";
import { Link } from "react-router";
import {
  Row,
  Col,
  Card,
  Button,
  Radio,
  DatePicker,
  Table,
  Input,
  Select,
  Icon,
  Modal,
  Popconfirm,
  message
} from "antd";
const Option = Select.Option;
const { RangePicker } = DatePicker,
  RadioGroup = Radio.Group;
// 日期 format
const dateFormat = "YYYY/MM/DD";

class ReservationManage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      filteredInfo: null,
      sortedInfo: null,
      visible: false,
      data: [],
      selectedIds: [],
      licensePlate: "",
      name: "",
      modifyIndex: null,
      showCabinetModal: false,
      grids:[16],
      cabinetName:''
    };
  }
  componentDidMount() {
    this.queryReservation(1, 10);
  }
  cabinetInfo = sn => {
    $.ajax({
      url: "api/"+ localStorage.getItem("store") + "/deviceStateInfo/showDeviceStateInfo?cabinetSN=" + sn,
      type: "get",
      success: res => {
          if (res.code == 0) {
            console.log('grid',res)
            this.setState({
              grids: res.data
            });
          } else {
            message.error(res.msg);
          }
      }
    });
  };
  queryReservation = (page, number) => {
    $.ajax({
      url: "api/" + localStorage.getItem("store") + "/" + "reservation/list",
      type: "get",
      data: {
        name: this.state.name,
        licensePlate: this.state.licensePlate,
        page: page,
        number: number
      },
      success: result => {
        console.log("result", result);
        if (result.code == "0") {
          let datalist = result.data;
          for (let item of datalist) {
            item.key = item.id;
          }

          this.setState({
            data: datalist,
            loading: false,
            pagination: { total: result.realSize }
          });
        } else {
          this.setState({
            data: [],
            loading: false
          });
          message.error(result.msg);
        }
      }
    });
  };

  handleCancel = () => {
    this.setState({
        showCabinetModal: false,
    })
}


  setFormData = (key, value) => {
    this.setState({
      form: update(this.state.form, {
        [key]: {
          $set: value
        }
      })
    });
  };

  handleChange = (pagination, filters, sorter) => {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter
    });
  };

  handleTableChange = pagination => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });
    this.queryReservation(pagination.current, 10);
  };

  PreFixInterge = (num, n) => {
    //num代表传入的数字，n代表要保留的字符的长度
    return (Array(n).join(0) + num).slice(-n);
  };
  render() {
    const columns = [
      {
        title: "序号",
        dataIndex: "index",
        key: "index",
        render: (text, record, index) => {
          return <span>{index + 1}</span>;
        }
      },
      {
        title: "车牌号码",
        dataIndex: "licensePlate",
        key: "licensePlate"
      },
      {
        title: "车主姓名",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "服务项目",
        dataIndex: "services",
        key: "services"
      },
      {
        title: "停放位置",
        dataIndex: "location",
        key: "location"
      },
      {
        title: "预约时间",
        dataIndex: "createTime",
        key: "createTime"
      },
      {
        title: "取车时间",
        dataIndex: "pickUpTime",
        key: "pickUpTime"
      },
      {
        title: "预约智能柜",
        dataIndex: "cabinetName",
        key: "cabinetName",
        render: (text, record, index) => {
          
          return (
            <span >
              <Link onClick={()=>{
                 console.log(record.cabinetSN)
                  this.cabinetInfo(record.cabinetSN)
                  console.log('grids',this.state.grids)
                  this.setState({
                      showCabinetModal:true,
                      cabinetName:text
                  })
              }}>
                {text + "-" + record.gridSN}
              </Link>
            </span>
          );
        }
      }
    ];

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        let selectedIds = [];
        for (let item of selectedRows) {
          selectedIds.push(item.id);
        }
        this.setState({
          selectedIds: selectedIds
        });
      }
    };
    return (
      <div>
        <BreadcrumbCustom first="消费开单" second="预约管理" />
        <Card>
          <div>
            <Row>
              <Col span={5}>
                <div style={{ marginBottom: 16 }}>
                  车牌号码：
                  <Input
                    style={{ width: "140px" }}
                    value={this.state.licensePlate}
                    onChange={e => {
                      this.setState({ licensePlate: e.target.value });
                    }}
                  />
                </div>
              </Col>
              <Col span={5}>
                <div style={{ marginBottom: 16 }}>
                  车主姓名：
                  <Input
                    style={{ width: "140px" }}
                    value={this.state.name}
                    onChange={e => {
                      this.setState({ name: e.target.value });
                    }}
                  />
                </div>
              </Col>
              <Col span={2}>
                <Button
                  type="primary"
                  onClick={() => {
                    this.queryReservation(1, 10);
                  }}
                >
                  查询
                </Button>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Table
                  loading={this.state.loading}
                  pagination={this.state.pagination}
                  rowSelection={rowSelection}
                  onChange={pagination => this.handleTableChange(pagination)}
                  columns={columns}
                  dataSource={this.state.data}
                  bordered
                />
              </Col>
            </Row>
          </div>
          <div>
            <Modal
              //   style={{ width: "84%" }}
              //   transparent
              // maskClosable={true}
              closable={true}
              maskClosable={false}
              onCancel={this.handleCancel}
              visible={this.state.showCabinetModal}
              footer={null}

              //   onClose={this.setState({
              //     showCabinetModal:false
              //   })}
              //   footer={[
              //     {
              //       text: "确定",
              //       onPress: () => {
              //         console.log("ok");
              //         this.onClose("modal1")();
              //       }
              //     }
              //   ]}
            >
              <div className="dailog-box">
                <div className="dailog-title">
                  <span>
                    {this.state.cabinetName}
                    状态展示
                  </span>
                </div>
                <div className="dailog-grid">
                  {this.state.grids.map((item, index) => {
                    return (
                      <div
                        className={
                          item.state === 0
                            ? "dailog-grid-item"
                            : item.state === 1
                              ? "dailog-grid-item yellow1"
                              : "dailog-grid-item yellow3"
                        }
                        key={index}
                      >
                        <span>{index + 1}</span>
                        {item.state === 0
                          ? ""
                          : item.state === 1
                            ? "已预约"
                            : "已完工"}
                        <br />
                        {item.licensePlate}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Modal>
          </div>
        </Card>
      </div>
    );
  }
}
export default ReservationManage;
