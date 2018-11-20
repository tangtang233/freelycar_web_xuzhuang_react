import React from 'react';
import update from 'immutability-helper'
import { Modal, Menu, Icon, Button } from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import data from '../../data/car.js'
import compare from '../../utils/compare.js'
class CarBrand extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: data.data,
            nowLetter: 'A',
            nowBrand: '',
            nowProcess: 1,
            nowTypes: []
        }
    }

    selectLetter = (item) => {
        this.setState({
            nowLetter: item
        })
    }

    selectCarBrand = (item) => {
        this.setState({
            nowProcess: 2,
            nowBrand: item.brand,
            nowTypes: item.types
        })
    }

    saveType = (type, models) => {
        this.setState({
            nowType: type
        })
        let newType = type
        if (type.indexOf(this.state.nowBrand) != -1) {
            newType = type.slice(this.state.nowBrand.length)
        }
        this.props.saveCarData(this.state.nowBrand + newType, models)
        window.localStorage.setItem('carMark', this.state.nowBrand)
        this.props.handleOk()
    }

    render() {
        let letters = Object.keys(this.state.data).map((item, index) => {
            return <div key={index} style={{ float: 'left', margin: '0 10px', cursor: 'pointer', color: this.state.nowLetter == item ? 'red' : '' }} onClick={() => { this.selectLetter(item) }}>{item}</div>
        })
        let brandNames = this.state.data[this.state.nowLetter].map((item, index) => {
            return <div key={index} style={{ float: 'left', height: '80px', margin: '10px', width: '50px', textAlign: 'center', cursor: 'pointer', color: this.state.nowBrand == item ? 'red' : '' }} onClick={() => { this.selectCarBrand(item) }}><img style={{ width: '50px', height: '50px' }} src={require(`../../images/${item.brand}.jpg`)} alt="" />{item.brand}</div>
        })
        let carTypes = this.state.nowTypes.sort(compare('type')).map((item, index) => {
            return <div key={index} style={{ float: 'left', width: '80px', height: '40px', lineHeight: '20px', textAlign: 'center', cursor: 'pointer' }} onClick={() => { this.saveType(item.type, item.models) }}> {item.type}</div>
        })
        return <div>
            <Modal
                title="品牌车系"
                width={1000}
                maskClosable={false}
                visible={this.props.visible}
                footer={[

                    this.state.nowProcess == 2 && <Button key="back" onClick={() => this.setState({ nowProcess: 1 })}>返回上一步</Button>,
                    this.state.nowProcess == 2 && <Button key="commit" onClick={() => this.saveType('', [])}>确定</Button>,
                    this.state.nowProcess == 1 && <Button key="cancel" onClick={() => this.props.handleCancel()}>取消</Button>

                ]}
                onCancel={() => this.props.handleCancel()}
            >
                {
                    this.state.nowProcess == 1 && <div style={{ width: '100%' }}>
                        <div className="clear">{letters}</div>
                        <div className="clear" style={{ width: '100%' }}>{brandNames}</div>
                    </div>
                }
                {
                    this.state.nowProcess == 2 && <div className="clear">
                        {carTypes}
                    </div>
                }
            </Modal>
        </div>
    }
}

export default CarBrand