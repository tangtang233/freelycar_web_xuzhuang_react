import React from "react";
import {
  Row,
  Col,
  Card,
  Select,
  Table,
  Iconconst,
  Popconfirm,
  InputNumber,
  Icon
} from "antd";
import EditableCell from "./EditableCell.jsx";
import update from "immutability-helper";
import $ from "jquery";
import PartsSearch from "../model/PartsSearch.jsx";
const Option = Select.Option,
  total = {
    key: "",
    view: false,
    id: "total",
    index: "",
    parts: [],
    total: "合计",
    singleSummation: "0"
  };
class PartsDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      parts: [],
      total: 0
    };
  }
  componentDidMount() {
    let parts = [];
    for (let item of this.props.parts) {
      parts.push(item.inventory);
    }
    parts.push(total);
    for (let item of parts) {
      item.key = item.id;
    }
    this.setState(
      {
        parts: parts
      },
      () => {
        this.handleformat();
      }
    );
  }

  //格式化配件数据格式
  modifyParts = (key, value, index) => {
    this.setState(
      {
        parts: update(this.state.parts, { [index]: { [key]: { $set: value } } })
      },
      () => {
        this.handleformat();
      }
    );
  };

  handleCancel = () => {
    this.setState({
      view: false
    });
  };

  handleformat = () => {
    let inventorys = [];
    for (let item of this.state.parts) {
      item.id = item.key;
      if (item.key != "total") {
        inventorys.push({
          inventory: item,
          number: item.number ? item.number : 1,
          projectId: this.props.id
        });
      }
    }
    this.props.pushInventory(inventorys, this.props.id);
  };

  handleOk = data => {
    //let datalist = this.state.parts
    // if (datalist.length > 0) {
    //     for (let i = 0; i < data.length; i++) {
    //         let same = 0;
    //         for (let j = 0; j < datalist.length; j++) {
    //             if (data[i].id == datalist[j].id) {
    //                 same++
    //             }
    //         }
    //         if (same == 0) {
    //             let obj = data[i];
    //             datalist.unshift(obj)
    //         }
    //     }
    // } else {
    //     datalist.unshift(...data)
    // }

    // let newPart = [];
    // newPart = this.state.parts.concat(data);
    // newPart.push(total);

    this.setState(
      {
        view: false,
        parts: [...data, total]
        // parts: newPart
      },
      () => {
        this.handleformat();
      }
    );
  };

  onDelete = index => {
    const dataSource = [...this.state.parts];
    dataSource.splice(index, 1);
    this.setState({ parts: dataSource }, () => {
      this.handleformat();
    });
  };

  render() {
    const projectOptions = this.props.optionInventory.map((item, index) => {
      return (
        <Option key={index} value={item.id + ""}>
          {item.name}
        </Option>
      );
    });
    return (
      <Card bodyStyle={{ background: "#fff" }} style={{ marginBottom: "10px" }}>
        <div style={{ fontSize: "16px", marginBottom: "10px" }}>
          {" "}
          {this.props.title}
          配件&nbsp;&nbsp;&nbsp;
          <div
            style={{
              display: "inline-block",
              color: "#49a9ee",
              cursor: "pointer"
            }}
            onClick={() => {
              this.setState({ view: true });
            }}
          >
            <Icon type="plus-circle-o" />
            &nbsp;增加
          </div>
        </div>
        <PartsSearch
          view={this.state.view}
          handleCancel={this.handleCancel}
          handleOk={this.handleOk}
        />
        {this.state.parts.length > 1 && (
          <Table
            className="accountTable"
            dataSource={this.state.parts}
            pagination={false}
            bordered
          >
            <Col
              title="序号"
              dataIndex="index"
              key="index"
              render={(text, record, index) => {
                return <span>{index + 1}</span>;
              }}
            />
            <Col title="" dataIndex="total" key="total" />
            <Col title="配件名称" key="name" dataIndex="name" />
            <Col title="配件品牌" key="brandName" dataIndex="brandName" />
            <Col title="规格" key="standard" dataIndex="standard" />
            <Col title="属性" key="property" dataIndex="property" />
            <Col title="配件价格" key="price" dataIndex="price" />
            <Col
              title="可用库存"
              key="amount"
              dataIndex="amount"
              render={(text, record, index) => {
                if (index + 1 < this.state.parts.length) {
                  return (
                    <span style={{ color: text == 0 ? "red" : "" }}>
                      {text}
                    </span>
                  );
                }
              }}
            />
            <Col
              title="数量"
              key="number"
              dataIndex="number"
              render={(text, record, index) => {
                if (index + 1 < this.state.parts.length) {
                  return (
                    <InputNumber
                      min={1}
                      max={record.amount}
                      defaultValue={1}
                      onChange={value => {
                        this.modifyParts("number", value, index);
                      }}
                    />
                  );
                }
              }}
            />
            <Col
              title="单项合计"
              key="singleSummation"
              dataIndex="singleSummation"
              render={(text, record, index) => {
                if (index == this.state.parts.length - 1) {
                  let total = 0;
                  for (let item of this.state.parts) {
                    if (item.price) {
                      total =
                        total + (item.number ? item.number : 1) * item.price;
                    }
                  }
                  return <span>{total}</span>;
                }
                return (
                  <span>
                    {(record.number ? record.number : 1) * record.price}
                  </span>
                );
              }}
            />
            <Col
              title="操作"
              key="action"
              render={(text, record, index) => {
                if (!record.total) {
                  return (
                    <span>
                      <Popconfirm
                        title="确认要删除嘛?"
                        onConfirm={() => this.onDelete(index)}
                      >
                        <a href="javascript:void(0);">删除</a>
                      </Popconfirm>
                    </span>
                  );
                }
              }}
            />
          </Table>
        )}
      </Card>
    );
  }
}
export default PartsDetail;
