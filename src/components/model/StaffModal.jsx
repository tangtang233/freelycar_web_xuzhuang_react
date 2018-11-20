import React from 'react';
import $ from 'jquery'
import update from 'immutability-helper'

class StaffModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }
    render() {
        return <Modal
            title="新增员工"
            visible={this.state.visible}
            maskClosable={false}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
        >
            <Row gutter={16} style={{ marginBottom: '10px' }}>
                <Col span={8} style={{ textAlign: 'right' }}>
                    员工姓名：
                </Col>
                <Col span={8}>
                    <Input value={this.state.form.name} onChange={(e) => this.setFormData('name', e.target.value)} />
                </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '10px' }}>
                <Col span={8} style={{ textAlign: 'right' }}>
                    性别：
                                    </Col>
                <Col span={8}>
                    <RadioGroup onChange={(e) => this.setFormData('gender', e.target.value)} value={this.state.form.gender}>
                        <Radio value={'男'}>男</Radio>
                        <Radio value={'女'}>女</Radio>
                    </RadioGroup>
                </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '10px' }}>
                <Col span={8} style={{ textAlign: 'right' }}>
                    手机号码：
                                    </Col>
                <Col span={8}>
                    <Input value={this.state.form.phone} onChange={(e) => this.setFormData('phone', e.target.value)} />
                </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '10px' }} id="provider-area1">
                <Col span={8} style={{ textAlign: 'right' }}>
                    职位：
                                    </Col>
                <Col span={8}>
                    <Select
                        showSearch
                        style={{ width: '150px' }}
                        placeholder="选择职位"
                        optionFilterProp="children"
                        value={this.state.form.position}
                        onChange={(value) => this.setFormData('position', value)}
                        filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                        getPopupContainer={() => document.getElementById('provider-area1')}
                    >
                        {positionOptions}
                    </Select>
                </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '10px' }} id="provider-area">
                <Col span={8} style={{ textAlign: 'right' }}>
                    级别：
                                    </Col>
                <Col span={8}>
                    <Select
                        showSearch
                        style={{ width: '150px' }}
                        placeholder="选择级别"
                        value={this.state.form.level}
                        optionFilterProp="children"
                        onChange={(value) => this.setFormData('level', value)}
                        filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                        getPopupContainer={() => document.getElementById('provider-area')}
                    >
                        {levelOptions}
                    </Select>
                </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '10px' }}>
                <Col span={8} style={{ textAlign: 'right' }}>
                    备注：
                                    </Col>
                <Col span={8}>
                    <Input value={this.state.form.comment} onChange={(e) => this.setFormData('comment', e.target.value)} />
                </Col>
            </Row>
        </Modal>
    }
}