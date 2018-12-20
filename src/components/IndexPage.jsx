import React from 'react';
import { Link } from 'react-router';
import BreadcrumbCustom from './BreadcrumbCustom.jsx';
import { Row, Col, Card, Table, Select, InputNumber, Input, Button, Icon, Modal, Tree, message } from 'antd';
import styled from "styled-components"

const UlBox = styled.ul`
    margin:30px;
    width:calc( 100% - 60px);
`, Li = styled.li`
    margin:20px;
    float:left;
    display:inline-block;
    height:120px;
    width:calc(( 100% - 160px)/4);
    line-height:120px;
    color:#fff;
    font-size:22px;
    text-align:center;
    border-radius:5px;
`
const TreeNode = Tree.TreeNode;
class IndexPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            checkedKeys: [],
            shadowStyle: false,
            tab: [
                {
                    title: '消费开单',
                    items: [{
                        background: 'rgb(51,105,232)',
                        text: '快速开单',
                        url: '/app/consumption/order',
                        over: 'none'
                    }, {
                        background: 'rgb(51,105,232)',
                        text: '单据管理',
                        url: '/app/consumption/orderManage',
                        over: 'none'
                    },{
                        background: 'rgb(51,105,232)',
                        text: '预约管理',
                        url: '/app/consumption/reservationManage',
                        over: 'none'
                    }]
                }, {
                    title: '收支管理',
                    items: [
                        {
                            background: 'rgb(238,178,17)',
                            text: '收支查询',
                            url: '/app/incomeManage/incomeSearch',
                            over: 'none'
                        }, {
                            background: 'rgb(238,178,17)',
                            text: '历史收支查询',
                            url: '/app/incomeManage/historyAccount',
                            over: 'none'
                        }, {
                            background: 'rgb(238,178,17)',
                            text: '其他支出',
                            url: '/app/incomeManage/otherPay',
                            over: 'none'
                        }
                    ]
                }, {
                    title: '会员管理',
                    items: [
                        {
                            background: 'rgb(0,153,37)',
                            text: '会员办理',
                            url: '/app/member/memberShip',
                            over: 'none'
                        }, {
                            background: 'rgb(0,153,37)',
                            text: '客户管理',
                            url: '/app/member/customer',
                            over: 'none'
                        }
                    ]
                }, {
                    title: '进销存管理',
                    items: [
                        {
                            background: 'rgb(213,15,37)',
                            text: '库存查询',
                            url: '/app/buySellStock/productSearch',
                            over: 'none'
                        }, {
                            background: 'rgb(213,15,37)',
                            text: '入库',
                            url: '/app/buySellStock/putInStorage',
                            over: 'none'
                        }, {
                            background: 'rgb(213,15,37)',
                            text: '出库',
                            url: '/app/buySellStock/sellProduct',
                            over: 'none'
                        }, {
                            background: 'rgb(213,15,37)',
                            text: '库存单据',
                            url: '/app/buySellStock/productReceipts',
                            over: 'none'
                        }, {
                            background: 'rgb(213,15,37)',
                            text: '供应商管理',
                            url: '/app/buySellStock/providerManage',
                            over: 'none'
                        }
                    ]
                }, {
                    title: '产品管理',
                    items: [{
                        background: '#ff9b6d',
                        text: '项目管理',
                        url: '/app/productManage/itemManage',
                        over: 'none'
                    }, {
                        background: '#ff9b6d',
                        text: '配件管理',
                        url: '/app/productManage/partsManage',
                        over: 'none'
                    }, {
                        background: '#ff9b6d',
                        text: '卡类管理',
                        url: '/app/productManage/cardManage',
                        over: 'none'
                    }]
                }, {
                    title: '数据报表',
                    items: [{
                        background: '#ffd37c',
                        text: '营业汇总',
                        url: '/app/dataTable/businessSummary',
                        over: 'none'
                    },{
                        background: '#ffd37c',
                        text: '流水明细',
                        url: '/app/dataTable/flowDetails',
                        over: 'none'
                    }]
                }, {
                    title: '系统设置',
                    items: [{
                        background: 'rgb(39,0,153)',
                        text: '员工管理',
                        url: '/app/productManage/itemManage',
                        over: 'none'
                    }, {
                        background: 'rgb(39,0,190)',
                        text: '账户管理',
                        url: '/app/productManage/itemManage',
                        over: 'none'
                    } ,{
                        background: 'rgb(39,0,190)',
                        text: '智能柜管理',
                        url: '/app/productManage/cabinetManage',
                        over: 'none'
                    }]
                }
            ],
            nowTab: localStorage.getItem('nowTab') ? JSON.parse(localStorage.getItem('nowTab')) : []
        }
    }
    componentWillUnmount = () => {
        localStorage.setItem('nowTab', JSON.stringify(this.state.nowTab));
    }
    componentDidMount() {
        this.setState({
            nowTab: localStorage.getItem('nowTab') ? JSON.parse(localStorage.getItem('nowTab')) : []
        })
    }
    deleteTab = (index) => {
        let nowTab = this.state.nowTab
        nowTab.splice(index, 1)
        this.setState({
            nowTab: nowTab
        })
    }

    showIcon = (index) => {
        let nowTab = this.state.nowTab
        nowTab[index]['over'] = 'block'
        this.setState({
            nowTab: nowTab
        })
    }

    hiddenIcon = (index) => {
        let nowTab = this.state.nowTab
        nowTab[index]['over'] = 'none'
        this.setState({
            nowTab: nowTab
        })
    }
    showModal = () => {
        this.setState({
            visible: true
        });
    }
    handleOk = () => {
        this.setState({
            visible: false
        });
        let nowTab = this.state.nowTab
        if (this.state.nowTab.length < 7) {
            for (let onekey of this.state.checkedKeys) {
                let newtab = onekey.split('-')

                if (newtab.length == 1) {
                    if (this.state.nowTab.length == 0) {
                        nowTab.push(...this.state.tab[newtab].items)
                    } else {
                        this.state.nowTab.map((item, index) => {
                            let same = 0
                            this.state.tab[newtab].items.map((item2, index2) => {
                             
                                if (item.text == item2.text) {
                                    same++
                                }
                            })
                            if (same == 0) {
                                nowTab.push(item)
                            }
                        })
                    }
                    // nowTab.push(...this.state.tab[newtab].items)
                } else {
                    if (this.state.nowTab.length == 0) {
                        nowTab.push(this.state.tab[newtab[0]].items[newtab[1]])
                    } else {
                        let same = 0
                        this.state.nowTab.map((item, index) => {

                            if (this.state.tab[newtab[0]].items[newtab[1]].text == item.text) {
                                same++
                            }
                        })
                        if (same == 0) {
                            nowTab.push(this.state.tab[newtab[0]].items[newtab[1]])
                        }
                    }
                    // nowTab.push(this.state.tab[newtab[0]].items[newtab[1]])
                }
            }

            this.setState({ nowTab: [...new Set(nowTab.slice(0, 7))] }, () => {
                localStorage.setItem('nowTab', JSON.stringify(this.state.nowTab));
            })
            if (nowTab.length > 8) {
                message.error('所选项目不得多于八条')
            }
        } else {
            message.error('所选项目不得多于八条')
        }
    }
    handleCancel = () => {
        this.setState({
            visible: false
        });
    }
    onSelect = (selectedKeys, info) => {

    }
    onCheck = (checkedKeys, info) => {
        this.setState({
            checkedKeys: checkedKeys
        })
    }
    render() {
        let nowLi = this.state.nowTab.map((item, index) => {
            return <Li style={{ position: 'relative', background: item.background, boxShadow: item.over == 'none' ? 'none' : '0 0 5px #888' }} key={index} onMouseOver={() => this.showIcon(index)} onMouseOut={() => this.hiddenIcon(index)}>
                <Icon type="close-circle-o" style={{ position: 'absolute', right: '5px', top: '5px', display: item.over }} onClick={() => this.deleteTab(index)} />
                <Link to={item.url} style={{ color: '#fff' }}>
                    {item.text}
                </Link>
            </Li>
        })

        const treenode = this.state.tab.map((onetab, index) => {
            return <TreeNode title={onetab.title} key={index}>
                {
                    onetab.items.map((oneitem, itemindex) => {
                        return <TreeNode title={oneitem.text} key={`${index}-${itemindex}`} />
                    })
                }
            </TreeNode>
        })
        return (
            <div style={{ background: '#ECECEC' }}>
                <BreadcrumbCustom />
                <UlBox className="clear" >
                    {nowLi}
                    <Li style={{ background: '#f8e4dd', boxShadow: this.state.shadowStyle ? '0 0 5px #888' : 'none' }} onMouseOver={() => this.setState({ shadowStyle: true })} onMouseOut={() => this.setState({ shadowStyle: false })}>
                        <Icon type="plus-circle-o" style={{ fontSize: '70px', color: '#fff', lineHeight: '120px', cursor: 'pointer' }} onClick={this.showModal} />
                    </Li>
                </UlBox>
                <Modal visible={this.state.visible}
                    onOk={this.handleOk} onCancel={this.handleCancel}
                    maskClosable={false}
                    okText="确定" cancelText="取消" width='25%'>
                    <div >
                        <Tree
                            checkable
                            onSelect={this.onSelect}
                            onCheck={this.onCheck}
                        >
                            {treenode}
                        </Tree>
                    </div>
                </Modal>
            </div>
        )
    }

}
export default IndexPage