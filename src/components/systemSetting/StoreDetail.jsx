import React from "react";
import BreadcrumbCustom from "../BreadcrumbCustom.jsx";
import $ from "jquery";
import update from "immutability-helper";
import moment from "moment";
import { Link } from "react-router";
import {
  Row,
  Col,
  Card,
  Button,
  Radio,
  DatePicker,
  TimePicker,
  Table,
  Input,
  Select,
  Icon,
  Modal,
  Popconfirm,
  message,
  Upload
} from "antd";
import { hashHistory } from "react-router";
import ProgramSearch from "../model/ProgramSearch.jsx";
import PreferenceItem from "../model/PreferenceItem.jsx";
const Option = Select.Option;
const { RangePicker } = DatePicker,
  RadioGroup = Radio.Group;
// 日期 format
const format = "HH:mm";

class StaffManage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      previewVisible: false,
      previewImage: "",
      fileList: [],
      loading: true,
      filteredInfo: null,
      storeName: "",
      storeAddress: "",
      openingTime: undefined,
      closingTime: undefined,
      storePhone: "",
      projectModalVisible: false, //项目模态框的显示开关
      projectSelectedRows: [],
      repairModalVisible: false, //维修模态框的显示开关
      repairSelectedRows: [],
      activityModalVisible: false, //优惠活动模态框的显示开关
      activitySelectedRows: [],
      data: [],
      selectedIds: [],
      staffId: null,
      staffName: "",
      modifyIndex: null,
      positionOptions: [
        "店长",
        "维修工",
        "洗车工",
        "客户经理",
        "收银员",
        "会计"
      ],
      levelOptions: ["  ", "初级", "中级", "高级"],
      form: {
        id: "",
        name: "",
        gender: "",
        phone: "",
        position: "",
        level: "",
        comment: ""
      }
    };
  }
  componentDidMount() {
    this.getStoreEvaluation(1, 10);
    this.getStoreDetail();
  }

  getStoreDetail() {
    if (this.props.params.storeId) {
      $.ajax({
        url: "api/" + localStorage.getItem("store") + "/" + "store/detail",
        dataType: "json",
        type: "get",
        data: { storeId: this.props.params.storeId },
        success: result => {
          if (result.code == "0") {
            let obj = result.data;

            //美容项目
            //state
            let proState = this.state.projectSelectedRows;
            let repState = this.state.repairSelectedRows;

            let projects = obj.storeProjects;
            for (let item of projects) {
              let project = item.project;
              project.key = project.id;
              let type = project.program.id;
              if (type == 3) {
                //美容
                proState.push(project);
              } else if (type == 4) {
                //维修
                repState.push(project);
              }
            }

            //图片
            let imgList = [];
            for (let item of result.data.imgUrls) {
              let imgObj = {
                uid: item.id,
                name: "xxx.png",
                status: "done",
                //url: 'freelycar/store/'+item.url,
                url: "http://www.freelycar.com/jinao/store/" + item.url
              };
              imgList.push(imgObj);
            }

            //优惠活动
            let actState = this.state.activitySelectedRows;
            let acts = obj.storefavours;
            for (let item of acts) {
              let favour = item.favour;
              favour.key = favour.id;
              actState.push(favour);
            }

            this.setState({
              fileList: imgList,
              storeName: obj.name,
              storeAddress: obj.address,
              openingTime: obj.openingTime,
              closingTime: obj.closingTime,
              storePhone: obj.phone,
              projectSelectedRows: proState,
              repairSelectedRows: repState,
              activitySelectedRows: actState
            });
          }
        }
      });
    }
  }

  //获取门店评价
  getStoreEvaluation = (page, number) => {
    if (this.props.params.storeId) {
      let objData = {
        page: page,
        number: number,
        storeId: this.props.params.storeId
      };

      $.ajax({
        url: "api/" + localStorage.getItem("store") + "/" + "store/evaluation",
        dataType: "json",
        type: "get",
        data: objData,
        success: result => {
          if (result.code == "0") {
            let arr = result.data;
            for (let item of arr) {
              item.key = item.id;
            }
            this.setState({
              options: arr.slice(0, 3)
            });
          }
        }
      });
    }
  };

  //照片墙的函数
  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = file => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true
    });
  };

  handleChange = ({ file, fileList }) => {
    this.setState({ fileList });
  };
  //end 照片墙的函数

  setFormData = (key, value) => {
    this.setState({
      form: update(this.state.form, {
        [key]: {
          $set: value
        }
      })
    });
  };

  handleTableChange = pagination => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });
    this.queryStaff(pagination.current, 10);
  };

  PreFixInterge = (num, n) => {
    //num代表传入的数字，n代表要保留的字符的长度
    return (Array(n).join(0) + num).slice(-n);
  };

  render() {
    const { previewVisible, previewImage, fileList } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    const positionOptions = this.state.positionOptions.map((item, index) => {
        return (
          <Option key={index} value={item}>
            {item}
          </Option>
        );
      }),
      levelOptions = this.state.levelOptions.map((item, index) => {
        return (
          <Option key={index} value={item}>
            {item}
          </Option>
        );
      }),
      beauty = [
        {
          title: "序号",
          dataIndex: "index",
          key: "index",
          render: (text, record, index) => {
            return <span>{index + 1}</span>;
          }
        },
        {
          title: "项目名称",
          dataIndex: "name",
          key: "name"
        },
        {
          title: "项目价格",
          dataIndex: "price",
          key: "price"
        },
        {
          title: "备注",
          dataIndex: "comment",
          key: "comment"
        }
      ],
      repair = [
        {
          title: "序号",
          dataIndex: "index",
          key: "index",
          render: (text, record, index) => {
            return <span>{index + 1}</span>;
          }
        },
        {
          title: "项目名称",
          dataIndex: "name",
          key: "name"
        },
        {
          title: "参考工时",
          dataIndex: "referWorkTime",
          key: "referWorkTime"
        },
        {
          title: "工时单价",
          dataIndex: "pricePerUnit",
          key: "pricePerUnit"
        },
        {
          title: "参考价格",
          dataIndex: "price",
          key: "price"
        },
        {
          title: "备注",
          dataIndex: "comment",
          key: "comment"
        }
      ],
      //优惠
      preferential = [
        {
          title: "序号",
          dataIndex: "index",
          key: "index",
          render: (text, record, index) => {
            return <span>{index + 1}</span>;
          }
        },
        {
          title: "券名",
          dataIndex: "name",
          key: "name"
        },
        {
          title: "券种",
          dataIndex: "type",
          key: "type",
          render: (text, record, index) => {
            return <span>{text == 1 ? "抵用券" : "代金券"}</span>;
          }
        },
        {
          title: "有效时间",
          dataIndex: "validTime",
          key: "validTime",
          render: (text, record, index) => {
            return (
              <span>
                {text}
                个月
              </span>
            );
          }
        },
        {
          title: "优惠项目",
          dataIndex: "set",
          key: "set",
          render: (text, record, index) => {
            let names = "";
            for (let item of record.set) {
              names = names + (names !== "" ? "、" : "") + item.project.name;
            }
            return <div>{names}</div>;
          }
        },
        {
          title: "项目原价",
          dataIndex: "initalPrice",
          key: "initalPrice",
          render: (text, record, index) => {
            let totalprice = 0;
            for (let item of record.set) {
              totalprice = item.project.price + totalprice;
            }
            return <div>{totalprice}</div>;
          }
        },
        {
          title: "项目现价",
          dataIndex: "presentPrice",
          key: "presentPrice",
          render: (text, record, index) => {
            let totalprice = 0;
            for (let item of record.set) {
              totalprice = item.presentPrice + totalprice;
            }
            return <div>{totalprice}</div>;
          }
        }
      ],
      //评价
      evaluation = [
        {
          title: "序号",
          dataIndex: "index",
          key: "index",
          render: (text, record, index) => {
            return <span>{index + 1}</span>;
          }
        },
        {
          title: "项目名称",
          dataIndex: "projects",
          key: "projects",
          render: (text, record, index) => {
            let str = "";
            for (let item of text) {
              str = item.name + str + "、";
            }
            str = str.slice(0, -1);
            return <span>{str}</span>;
          }
        },
        {
          title: "客户名称",
          dataIndex: "clientName",
          key: "clientName"
        },
        {
          title: "打分",
          dataIndex: "stars",
          key: "stars"
        },
        {
          title: "评价内容",
          dataIndex: "comment",
          key: "comment"
        },
        {
          title: "评价时间",
          dataIndex: "commentDate",
          key: "commentDate"
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
        <BreadcrumbCustom first="门店管理" second="门店详情" />

        <Card title="基本信息" className="store-card-magin">
          <Row gutter={16} className="store-row-magin">
            <Col span={8} offset={4}>
              <Row className="store-row-magin">
                门店名称：
                <span style={{ width: "140px" }}>{this.state.storeName}</span>
              </Row>
              <Row className="store-row-magin">
                门店地址：
                <span style={{ width: "140px" }}>
                  {this.state.storeAddress}
                </span>
              </Row>
              <Row className="store-row-magin">
                营业时间：
                {this.state.openingTime} ~{this.state.closingTime}
              </Row>
              <Row className="store-row-magin">
                客服电话：
                <span style={{ width: "140px" }}>{this.state.storePhone}</span>
              </Row>
            </Col>

            <Col span={12}>
              上传图片
              <div className="clearfix">
                <Upload
                  action={`api/${localStorage.getItem(
                    "store"
                  )}/store/addPicture`}
                  listType="picture-card"
                  fileList={fileList}
                  onPreview={this.handlePreview}
                  onChange={this.handleChange}
                >
                  {/* {fileList.length >= 3 ? null : uploadButton} */}
                </Upload>
                <Modal
                  visible={previewVisible}
                  maskClosable={false}
                  footer={null}
                  onCancel={this.handleCancel}
                >
                  <img
                    alt="example"
                    style={{ width: "100%" }}
                    src={previewImage}
                  />
                </Modal>
              </div>
            </Col>
          </Row>
        </Card>

        <Card title="服务项目" className="store-card-magin">
          <div className="store-table-title">汽车美容&nbsp;&nbsp;</div>
          <Table
            columns={beauty}
            dataSource={this.state.projectSelectedRows}
            bordered
          />
          <ProgramSearch
            view={this.state.projectModalVisible}
            programId={1}
            handleCancel={() => {
              this.setState({ projectModalVisible: false });
            }}
            handleOk={selectedRows => {
              this.setState({
                projectSelectedRows: selectedRows,
                projectModalVisible: false
              });
            }}
          />

          <div className="store-table-title">商品&nbsp;&nbsp;</div>
          <Table
            columns={repair}
            dataSource={this.state.repairSelectedRows}
            bordered
          />
          <ProgramSearch
            view={this.state.repairModalVisible}
            handleCancel={() => {
              this.setState({ repairModalVisible: false });
            }}
            programId={2}
            handleOk={selectedRows => {
              this.setState({
                repairSelectedRows: selectedRows,
                repairModalVisible: false
              });
            }}
          />
        </Card>

        <Card title="优惠活动" className="store-card-magin">
          <div className="store-table-title">优惠项目&nbsp;&nbsp;</div>
          <Table
            columns={preferential}
            dataSource={this.state.activitySelectedRows}
            bordered
          />
          <PreferenceItem
            view={this.state.activityModalVisible}
            handleCancel={() => {
              this.setState({ activityModalVisible: false });
            }}
            handleOk={selectedRows => {
              this.setState({
                activitySelectedRows: selectedRows,
                activityModalVisible: false
              });
            }}
          />
        </Card>

        <Card title="门店评价" className="store-card-magin">
          <Table
            columns={evaluation}
            dataSource={this.state.options}
            pagination={false}
            bordered
          />
          <div
            style={{
              color: "#49a9ee",
              textAlign: "right",
              cursor: "pointer",
              marginTop: "10px"
            }}
            onClick={() => {
              hashHistory.push("/app/systemSet/storeComment");
            }}
          >
            更多》》
          </div>
        </Card>
      </div>
    );
  }
}
export default StaffManage;
