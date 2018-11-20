import React from 'react';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import { Row, Col, Card, Table, Select, InputNumber, Input, Button, Icon, DatePicker, Modal, Radio, Popconfirm } from 'antd';
import { Link } from 'react-router';

class Settlement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            option: [],
            visible: false
        }
    }
    render() {
        <div className="gutter-example">
            <BreadcrumbCustom first="会员办理" second="结算中心" />
            <div style={{ fontSize: '20px', textAlign: 'center', marginBottom: '10px' }}>结算中心</div>
            <Row gutter={12} >
                应收金额：
                      <Input style={{ width: '100px' }} />
            </Row>
            <Row gutter={16}>
                <div style={{ display: 'inline-block', width: '80%' }}>支付方式:
                         <div style={{ display: 'inline-block', marginLeft: '10px' }}>
                        <Select defaultValue="现金" style={{ width: 120 }} onChange={handleChange} >
                            <Option value="0">现金</Option>
                            <Option value="1">刷卡</Option>
                            <Option value="2">支付宝</Option>
                            <Option value="3">微信</Option>
                            <Option value="4">易付宝</Option>
                        </Select>
                    </div>
                </div>
            </Row>
            <Button type="primary" style={{ marginRight: '50px' }} size='large'>保存</Button>
            <Button type="primary" size='large'>取消</Button>
        </div>
    }
}
export default Settlement