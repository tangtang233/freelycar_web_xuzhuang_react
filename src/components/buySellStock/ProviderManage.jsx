import React from "react";
import { Link } from "react-router";
import CustomerInfo from "../forms/EditCustomerInfo.jsx";
import ServiceTable from "../tables/ServiceTable.jsx";
import BreadcrumbCustom from "../BreadcrumbCustom.jsx";
import PartsDetail from "../tables/PartsDetail.jsx";
import update from "immutability-helper";
import {
  Row,
  Col,
  Card,
  Button,
  Select,
  Table,
  message,
  Popconfirm,
  Form,
  InputNumber,
  Modal,
  Input
} from "antd";
import $ from "jquery";
const FormItem = Form.Item;
const Option = Select.Option;
class ProviderManage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      options: [],
      phonecheck: "",
      pagination: {},
      errorMsg: "",
      loading: true,
      selectedRowKeys: [],
      selectedIds: [],
      queryValue: "",
      form: {
        name: "",
        contactName: "",
        phone: "",
        email: "",
        landline: "",
        address: "",
        comment: ""
      },
      conlums: [
        {
          title: "序号",
          dataIndex: "index",
          key: "index",
          render: (text, record, index) => {
            return <span>{index + 1}</span>;
          }
        },
        {
          title: "供应商名称",
          dataIndex: "name",
          key: "name",
          render: (text, record, index) => {
            return (
              <span>
                <Link to={"/app/buySellStock/providerDetail/" + record.id}>
                  {text}
                </Link>
              </span>
            );
          }
        },
        {
          title: "联系人",
          dataIndex: "contactName",
          key: "contactName"
        },
        {
          title: "手机号码",
          dataIndex: "phone",
          key: "phone"
        },
        {
          title: "座机号码",
          dataIndex: "landline",
          key: "landline"
        },
        {
          title: "邮箱地址",
          dataIndex: "email",
          key: "email"
        },
        {
          title: "联系地址",
          dataIndex: "address",
          key: "address"
        },
        {
          title: "备注",
          dataIndex: "comment",
          key: "comment"
        },
        {
          title: "创建时间",
          dataIndex: "createDate",
          key: "createDate"
        },
        {
          title: "操作",
          dataIndex: "action",
          key: "action",
          render: (text, record, index) => {
            return (
              <span>
                {/* <Popconfirm title="确认要删除嘛?" onConfirm={() => this.onDelete([record.id])}>
                            <a href="javascript:void(0);">修改</a>
                        </Popconfirm> */}
                <a onClick={() => this.showModal(record)}>修改</a>
              </span>
            );
          }
        }
      ],
      data: []
    };
  }

  componentDidMount() {
    this.getList(1, 10);
    this.getName();
  }

  getName = () => {
    $.ajax({
      url: "api/" + localStorage.getItem("store") + "/" + "provider/name",
      data: {},
      success: result => {
        if (result.code == "0") {
          this.setState({
            options: result.data
          });
        }
      }
    });
  };

  getList = (page, pageSize) => {
    $.ajax({
      url: "api/" + localStorage.getItem("store") + "/" + "provider/list",
      data: {
        page: page,
        number: pageSize
      },
      success: result => {
        this.setState({
          loading: false
        });

        if (result.code == "0") {
          for (let item of result.data) {
            item.key = item.id;
          }
          this.setState({
            data: result.data,
            pagination: { total: result.realSize }
          });
        } else {
          this.setState({
            data: [],
            pagination: { total: 0 }
          });
        }
      }
    });
  };
  showModal = record => {
    if (record && record.id) {
      const form = this.state.form;
      form.id = record.id;
      form.name = record.name ? record.name : "";
      form.contactName = record.contactName ? record.contactName : "";
      form.phone = record.phone ? record.phone : "";
      form.email = record.email ? record.email : "";
      form.landline = record.landline ? record.landline : "";
      form.address = record.address ? record.address : "";
      form.comment = record.comment ? record.comment : "";
      this.setState({
        form: form
      });
    }
    this.setState({
      visible: true
    });
  };
  handleOk = e => {
    var reg = /^1[3|4|5|7|8][0-9]{9}$/;
    var phonenum = this.state.form.phone;
    var test = reg.test(phonenum);
    var phonecheck;
    if (phonenum == "") {
      phonecheck = false;
    } else if (test) {
      phonecheck = false;
    } else {
      phonecheck = true;
    }

    if (this.state.form.name == "") {
      this.setState({
        errorMsg: "请输入供应商名称"
      });
    } else {
      if (this.state.form.id) {
        this.modifyProvider();
      } else {
        this.addProvider();
      }
    }
  };

  addProvider = () => {
    $.ajax({
      type: "post",
      url: "api/" + localStorage.getItem("store") + "/" + "provider/add",
      // contentType:'application/json;charset=utf-8',
      dataType: "json",
      data: {
        name: this.state.form.name,
        contactName: this.state.form.contactName,
        phone: this.state.form.phone,
        email: this.state.form.email,
        landline: this.state.form.landline,
        address: this.state.form.address,
        comment: this.state.form.comment
      },
      success: result => {
        result;
        if (result.code == "0") {
          message.success("添加成功！", 1.5);

          result.data.key = result.data.id;

          this.setState({
            data: update(this.state.data, { $push: [result.data] }),
            form: {
              name: "",
              contactName: "",
              phone: "",
              email: "",
              landline: "",
              address: "",
              comment: ""
            },
            visible: false,
            pagination: update(this.state.pagination, {
              ["total"]: { $set: result.realSize }
            })
          });
          pagination: {
            total: 0;
          }
          // this.getList(1, 10);
        }
      }
    });
  };

  modifyProvider = () => {
    $.ajax({
      type: "post",
      url: "api/" + localStorage.getItem("store") + "/" + "provider/modify",
      // contentType:'application/json;charset=utf-8',
      dataType: "json",
      data: {
        name: this.state.form.name,
        contactName: this.state.form.contactName,
        phone: this.state.form.phone,
        email: this.state.form.email,
        landline: this.state.form.landline,
        address: this.state.form.address,
        comment: this.state.form.comment,
        id: this.state.form.id
      },
      success: result => {
        if (result.code == "0") {
          message.success("添加成功！", 1.5);
          const data = this.state.data;
          const id = result.data.id;
          data.map((item, index) => {
            if (item.id == id) {
              data[index] = result.data;
              data[index].key = result.data.id;
            }
          });
          this.setState({
            data: data,
            form: {
              name: "",
              contactName: "",
              phone: "",
              email: "",
              landline: "",
              address: "",
              comment: ""
            },
            visible: false
          });
        }
      }
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false,
      form: {
        name: "",
        contactName: "",
        phone: "",
        email: "",
        landline: "",
        address: "",
        comment: ""
      }
    });
  };

  startQuery = () => {
    $.ajax({
      type: "GET",
      url: "api/" + localStorage.getItem("store") + "/" + "provider/query",
      // contentType:'application/json;charset=utf-8',
      dataType: "json",
      data: {
        name: this.state.queryValue,
        page: 1,
        number: 10
      },
      traditional: true,
      success: result => {
        if (result.code == "0") {
          let datalist = [];
          result.data.map((item, index) => {
            result.data[index].key = result.data[index].id;
          });
          this.setState({
            data: result.data,
            pagination: { total: result.realSize }
          });
        } else {
          message.error(result.msg);
          this.setState({
            data: [],
            pagination: { total: 0 }
          });
        }
      }
    });
  };

  onDelete = idArray => {
    $.ajax({
      type: "post",
      url: "api/" + localStorage.getItem("store") + "/" + "provider/delete",
      // contentType:'application/json;charset=utf-8',
      dataType: "json",
      data: {
        providerIds: idArray
      },
      traditional: true,
      success: result => {
        if (result.code == "0") {
          let dataSource = [...this.state.data];
          for (let id of idArray) {
            dataSource = dataSource.filter(obj => {
              return id !== obj.id;
            });
          }
          this.setState({
            data: dataSource,
            pagination: update(this.state.pagination, {
              ["total"]: { $set: result.realSize }
            })
          });
        }
      }
    });
  };
  onValueChange = (key, value) => {
    if (key == "name") {
      this.setState({
        errorMsg: ""
      });
    }

    this.setState({
      form: update(this.state.form, { [key]: { $set: value } })
    });
  };

  handleTableChange = pagination => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });
    this.getList(pagination.current, 10);
  };
  render() {
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
          let selectedIds = [];
          for (let item of selectedRows) {
            selectedIds.push(item.id);
          }
          this.setState({
            selectedRowKeys: selectedRowKeys,
            selectedIds: selectedIds
          });
        },
        getCheckboxProps: record => ({
          disabled: record.name === "Disabled User" // Column configuration not to be checked
        })
      },
      plateOptions = [...new Set(this.state.options)].map((item, index) => {
        return (
          <Option key={index} value={item + ""}>
            {item}
          </Option>
        );
      });
    return (
      <div>
        <BreadcrumbCustom first="进销存管理" second="供应商管理" />
        <Card>
          {" "}
          {/*onSelect={(value) => this.handleSelected(value)}*/}
          <div style={{ marginBottom: "40px" }} id="provider-area">
            <span>供应商名称：</span>
            <Select
              showSearch
              mode="combobox"
              style={{ width: "200px" }}
              placeholder="输入供应商名称"
              allowClear={true}
              optionFilterProp="children"
              value={this.state.queryValue}
              defaultActiveFirstOption={false}
              onChange={value => {
                this.setState({ queryValue: value });
              }}
              onBlur={value => {
                this.setState({ queryValue: value });
              }}
              filterOption={(input, option) =>
                option.props.children.indexOf(input) >= 0
              }
              getPopupContainer={() => document.getElementById("provider-area")}
              dropdownStyle={
                !this.state.queryValue || this.state.queryValue.length < 2
                  ? { display: "none" }
                  : {}
              }
            >
              {plateOptions}
            </Select>
            <Button
              onClick={() => this.startQuery()}
              type="primary"
              style={{ margin: "0 0 0 40px" }}
            >
              查询
            </Button>
          </div>
          <div className="table-operations">
            <Button onClick={this.showModal}>新增供应商</Button>
            <Modal
              maskClosable={false}
              title={this.state.form.id ? "修改供应商" : "新增供应商"}
              visible={this.state.visible}
              onOk={this.handleOk}
              onCancel={this.handleCancel}
            >
              <Row gutter={16} style={{ marginBottom: "10px" }}>
                <Col span={8} style={{ textAlign: "right" }}>
                  供应商名称：
                </Col>
                <Col span={8}>
                  {!this.state.form.id && (
                    <Input
                      value={this.state.form.name}
                      onChange={e => this.onValueChange("name", e.target.value)}
                    />
                  )}
                  {this.state.form.id && <span>{this.state.form.name}</span>}
                </Col>
                <Col span={8}>
                  <span style={{ color: "red" }}>
                    {" "}
                    {!this.state.form.name != "" && this.state.errorMsg
                      ? this.state.errorMsg
                      : ""}
                  </span>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginBottom: "10px" }}>
                <Col span={8} style={{ textAlign: "right" }}>
                  联系人：
                </Col>
                <Col span={8}>
                  <Input
                    value={this.state.form.contactName}
                    onChange={e =>
                      this.onValueChange("contactName", e.target.value)
                    }
                  />
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: "10px" }}>
                <Col span={8} style={{ textAlign: "right" }}>
                  手机号码：
                </Col>
                <Col span={8}>
                  <Input
                    value={this.state.form.phone}
                    onChange={e => this.onValueChange("phone", e.target.value)}
                  />
                </Col>
                <Col span={8}>
                  <span style={{ color: "red" }}> {this.state.phonecheck}</span>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: "10px" }}>
                <Col span={8} style={{ textAlign: "right" }}>
                  座机：
                </Col>
                <Col span={8}>
                  <Input
                    value={this.state.form.landline}
                    onChange={e =>
                      this.onValueChange("landline", e.target.value)
                    }
                  />
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: "10px" }}>
                <Col span={8} style={{ textAlign: "right" }}>
                  邮箱地址：
                </Col>
                <Col span={8}>
                  <Input
                    value={this.state.form.email}
                    onChange={e => this.onValueChange("email", e.target.value)}
                  />
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: "10px" }}>
                <Col span={8} style={{ textAlign: "right" }}>
                  联系地址：
                </Col>
                <Col span={8}>
                  <Input
                    value={this.state.form.address}
                    onChange={e =>
                      this.onValueChange("address", e.target.value)
                    }
                  />
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: "10px" }}>
                <Col span={8} style={{ textAlign: "right" }}>
                  备注：
                </Col>
                <Col span={8}>
                  <Input
                    type="textarea"
                    rows={3}
                    value={this.state.form.comment}
                    onChange={e =>
                      this.onValueChange("comment", e.target.value)
                    }
                  />
                </Col>
              </Row>
            </Modal>
            <Popconfirm
              title="确认要删除嘛?"
              onConfirm={() => this.onDelete(this.state.selectedIds)}
            >
              <Button>删除供应商</Button>
            </Popconfirm>
          </div>
          <Table
            loading={this.state.loading}
            pagination={this.state.pagination}
            bordered
            onChange={pagination => this.handleTableChange(pagination)}
            columns={this.state.conlums}
            dataSource={this.state.data}
            rowSelection={rowSelection}
          />
        </Card>
      </div>
    );
  }
}
export default ProviderManage;
