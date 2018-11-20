import React from 'react';
import { Row, Col, Button, Table, Modal, Select, Input, Radio } from 'antd';
import $ from 'jquery'
import update from 'immutability-helper'
import AddPartModal from '../model/AddPartModal.jsx';
const Search = Input.Search,
  Option = Select.Option,
  RadioGroup = Radio.Group;
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
    title: "配件编号",
    dataIndex: "id",
    key: "id"
  },
  {
    title: "配件名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "配件品牌",
    dataIndex: "brandName",
    key: "brandName"
  },
  {
    title: "配件类别",
    dataIndex: "typeName",
    key: "typeName"
  },
  {
    title: "属性",
    dataIndex: "property",
    key: "property"
  },
  {
    title: "规格",
    dataIndex: "standard",
    key: "standard"
  },
  {
    title: "配件价格",
    dataIndex: "price",
    key: "price"
  },
  {
    title: "供应商",
    dataIndex: "providerName",
    key: "providerName"
  },
  {
    title: "可用库存",
    dataIndex: "amount",
    key: "amount"
  },
  {
    title: "备注",
    dataIndex: "comment",
    key: "comment"
  }
];
class PartsSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      selectedRows: [],
      selectedRowKeys: [],
      typeList: [],
      providerList: [],
      provider: "",
      type: "",
      visible: this.props.view,
      partName: "",
      pagination: {},
      data: [],
      showAddPartModal: false
    };
  }
  componentDidMount() {
    this.getList(null, null, 1, 10);
    this.getTypeList(1, 99);
    this.getProvider();
  }
  componentWillReceiveProps(newProps) {
    if (newProps.view !== this.state.visible) {
      this.getList(this.state.partName, this.state.type, 1, 10);
      this.setState({
        visible: newProps.view,
        selectedRowKeys:
          this.state.selectedRowKeys.length == 0
            ? this.props.invSelectKeys
              ? this.props.invSelectKeys
              : []
            : this.state.selectedRowKeys
      });
    }
  }
  getTypeList = (page, pageSize) => {
    $.ajax({
      url: "api/" + localStorage.getItem("store") + "/" + "inventory/querytype",
      data: {
        page: page,
        number: pageSize
      },
      success: res => {
        if (res.code == "0") {
          this.setState({
            typeList: res.data
          });
        }
      }
    });
  };
  //获取供应商
  getProvider = () => {
    $.ajax({
      type: "get",
      data: { page: 1, number: 99 },
      url: "api/" + localStorage.getItem("store") + "/" + "provider/list",
      dataType: "json",
      success: result => {
        if (result.code == "0") {
          this.setState({
            providerList: result.data
          });
        }
      }
    });
  };
  getList = (name, typeId, page, pageSize) => {
    $.ajax({
      url: "api/" + localStorage.getItem("store") + "/" + "inventory/list",
      data: {
        name: name,
        typeId: !typeId || typeId == -1 ? "" : typeId,
        page: page,
        number: pageSize,
        providerId: this.props.providerId
      },
      success: result => {
        if (result.code == "0") {
          this.setState({ loading: false });
          let datalist = result.data;

          for (let item of datalist) {
            item.providerName = item.provider.name;
            item.key = item.id;
          }
          this.setState({
            data: datalist,
            pagination: { total: result.realSize }
          });
        } else if (result.code == "2") {
          this.setState({
            data: [],
            pagination: { total: 0 }
          });
        }
      }
    });
  };

  handleTableChange = pagination => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });

    this.getList(this.state.partName, this.state.type, pagination.current, 10);
  };

  setSearchName = value => {
    this.setState({
      partName: value
    });
  };

  setSearchType = value => {
    this.setState({
      type: value
    });
  };

  setSearchProvider = value => {
    this.setState({
      providerId: value
    });
  };

  onChange = e => {
    this.setState({
      value: e.target.value
    });
  };

  handleCancel = () => {
    this.setState({
      showAddPartModal: false
    });
  };

  handleAddPartOk = item => {
    this.setState({
      showAddPartModal: false,
      pagination: {
        current: 1
      }
    });

    this.getList(null, null, 1, 10);
  };

  render() {
    const rowSelection = {
        //针对全选
        onSelectAll: (selected, selectedRows, changeRows) => {
          let origKeys = this.state.selectedRowKeys;
          let origRows = this.state.selectedRows;
          if (selected) {
            origRows = [...origRows, ...changeRows];
            for (let item of changeRows) {
              origKeys.push(item.id);
            }
          } else {
            for (let change of changeRows) {
              origKeys = origKeys.filter(obj => {
                return obj !== change.key;
              });
              origRows = origRows.filter(obj => {
                return obj.key !== change.key;
              });
            }
          }
          this.setState({
            selectedRowKeys: origKeys,
            selectedRows: origRows
          });
        },
        selectedRowKeys: this.state.selectedRowKeys,
        onSelect: (changableRow, selected, selectedRows) => {
          //state里面记住这两个变量就好
          let origKeys = this.state.selectedRowKeys;
          let origRows = this.state.selectedRows;
          if (selected) {
            Array.prototype.push.apply(origKeys, [changableRow.key]);
            Array.prototype.push.apply(origRows, [changableRow]);
          } else {
            origKeys = origKeys.filter(obj => {
              return obj !== changableRow.key;
            });
            origRows = origRows.filter(obj => {
              return obj.key !== changableRow.key;
            });
          }
          this.setState({
            selectedRowKeys: origKeys,
            selectedRows: origRows
          });
        },

        getCheckboxProps: record => ({
          disabled: record.name === "Disabled User" // Column configuration not to be checked
        })
      },
      partTypeOptions = this.state.typeList.map((item, index) => {
        return (
          <Option key={index} value={item.id + ""}>
            {item.typeName}
          </Option>
        );
      }),
      radioStyle = {
        display: "block",
        height: "30px",
        lineHeight: "30px"
      },
      providersOptions = this.state.providerList.map((item, index) => {
        return (
          <Option key={index} value={item.id + ""}>
            {item.name}
          </Option>
        );
      });
    return (
      <Modal
        visible={this.state.visible}
        maskClosable={false}
        width="80%"
        title="配件查询"
        onOk={() => {
          this.props.handleOk(this.state.selectedRows);
        }}
        onCancel={() => this.props.handleCancel()}
      >
        <Row gutter={16} style={{ marginBottom: "10px" }} id="parts-area">
          <Col span={7} style={{ verticalAlign: "middle" }}>
            配件名称：
            <Input
              style={{
                width: "150px",
                marginBottom: "10px",
                marginLeft: "20px"
              }}
              onChange={e => this.setSearchName(e.target.value)}
              value={this.state.partName}
            />
          </Col>
          <Col span={7} style={{ verticalAlign: "middle" }}>
            配件类别：
            <Select
              showSearch
              style={{ width: "150px", marginLeft: "20px" }}
              optionFilterProp="children"
              getPopupContainer={() => document.getElementById("parts-area")}
              onChange={value => this.setSearchType(value)}
              filterOption={(input, option) =>
                option.props.children.indexOf(input) >= 0
              }
            >
              <Option key="-1">全部</Option>
              {partTypeOptions}
            </Select>
          </Col>
          <Col span={2}>
            <Button
              type="primary"
              onClick={() => {
                this.getList(this.state.partName, this.state.type, 1, 10);
              }}
            >
              查询
            </Button>
          </Col>
        </Row>
        <Row style={{ marginBottom: "20px", marginLeft: "5px" }} gutter={24}>
          <Button
            onClick={() => {
              this.setState({ showAddPartModal: true });
            }}
          >
            新增配件
          </Button>
        </Row>
        <AddPartModal
          pageName="PartsSearch"
          cancel={() => this.handleCancel()}
          onOk={() => this.handleAddPartOk()}
          visible={this.state.showAddPartModal}
        />
        <Table
          loading={this.state.loading}
          pagination={this.state.pagination}
          bordered
          onChange={pagination => this.handleTableChange(pagination)}
          columns={columns}
          dataSource={this.state.data}
          rowSelection={rowSelection}
        />
      </Modal>
    );
  }
}
export default PartsSearch;
