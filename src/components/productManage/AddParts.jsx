import React from 'react';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import { Card, Button, Input, Select, Row, Col } from 'antd';
import $ from 'jquery';
import autoFillAjax from '../../utils/autoFillAjax.js';
const Option = Select.Option;
class AddParts extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            value:{key:'',label:''},
        }
    }

    handleChange = (value) => {
        this.setState({ value });
        if (value.key) {
            autoFillAjax(value.key, data => this.setState({ data }));
        }
    }



    render() {
        const options = this.state.data.map((d, index) => {
            return <Option key={index} value={d.key + ''}>{d.label}</Option>
        })
        return <div>
            <BreadcrumbCustom first="配件管理" second="新增配件" />
            <Card>
                <div style={{ fontSize: '20px', marginBottom: '10px' }}>
                    配件信息
                    </div>
                <Row style={{ marginBottom: '10px' }}>
                    <Col span={12} style={{ textAlign: 'center' }}>
                        厂家编号：<Input style={{ width: '120px' }} />
                    </Col>
                    <Col span={12} style={{ textAlign: 'center' }}>
                        配件名称：<Input style={{ width: '120px' }} />
                    </Col>
                </Row>
                <Row style={{ marginBottom: '10px' }}>
                    <Col span={12} style={{ textAlign: 'center' }}>
                        配件品牌：<Select
                            mode="combobox"
                            style={{ width: '120px' }}
                            notFoundContent=""
                            value = {this.state.value}
                            labelInValue
                            defaultActiveFirstOption={false}
                            showArrow={false}
                            filterOption={false}
                            onChange={(value)=>this.handleChange(value)}
                        >
                            {options}
                        </Select>
                    </Col>
                    <Col span={12} style={{ textAlign: 'center' }}>
                        所属分类：<Input style={{ width: '120px' }} />
                    </Col>
                </Row>
                <Row style={{ marginBottom: '10px' }}>
                    <Col span={12} style={{ textAlign: 'center' }}>
                        规格属性：<Input style={{ width: '120px' }} />
                    </Col>
                    <Col span={12} style={{ textAlign: 'center' }}>
                        配件售价：<Input style={{ width: '120px' }} />
                    </Col>
                </Row>
                <Row style={{ marginBottom: '10px' }}>
                    <Col span={12} style={{ textAlign: 'center' }}>
                        供应商：<Input style={{ width: '120px' }} />
                    </Col>
                    <Col span={12} style={{ textAlign: 'center' }}>
                        备注：<Input style={{ width: '120px' }} />
                    </Col>
                </Row>
                <Row style={{ marginBottom: '10px', textAlign: 'center' }}>
                    <Button style={{ marginRight: '60px' }}>
                        取消
                        </Button>
                    <Button type="primary">
                        保存
                        </Button>
                </Row>
            </Card>
        </div>
    }
}

export default AddParts