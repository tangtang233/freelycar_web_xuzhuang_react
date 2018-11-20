import React from 'react';
import { Row, Col, Card, Table, Select, InputNumber, Input } from 'antd';
import { Link } from 'react-router';
import BreadcrumbCustom from '../BreadcrumbCustom.jsx';
import $ from 'jquery';
const Option = Select.Option;
const columns = [
    {
        title: '序号', dataIndex: 'indexNum', key: 'indexNum', render: (text, record, index) => {
            return <span>{index + 1}</span>
        }
    },
    { title: '时间', dataIndex: 'payDate', key: 'payDate' },
    {
        title: '实收金额', dataIndex: 'income', key: 'income',
        render: (text, record, index) => {
            return <Link to={`/app/incomeManage/historyIncomeDetail/${record.payDate}`}>{text}</Link>
        }
    },
    {
        title: '实际支出', dataIndex: 'expend', key: 'expend', render: (text, record, index) => {
            return <Link to={`/app/incomeManage/historyOutcomeDetail/${record.payDate}`}>{text}</Link>
        }
    },
]

class HistoricalAccount extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: []
        }
    }
    componentDidMount() {
        let myDate = new Date()
        this.getYearList(myDate.getFullYear() + '')
    }
    getYearList = (year) => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'stat/monthlybyyear',
            data: {
                selectYear: new Date(year)
            },
            success: (result) => {
                if (result.code == "0") {
                    let newdata = result.data
                    for (let i = 0; i < newdata.length; i++) {
                        newdata[i]['key'] = i
                    }
                    this.setState({
                        data: newdata
                    })
                }
            }
        })
    }
    render() {

        let nowtime = new Date()
        return (
            <div>
                <BreadcrumbCustom first="收支管理" second="历史收支查询" />
                <div style={{ display: 'inline-block', marginTop: '20px' }}>选择年份:
                    <div style={{ display: 'inline-block', marginLeft: '10px' }}>
                        <Select defaultValue={nowtime.getFullYear() + ''} style={{ width: 120 }} onChange={this.getYearList}>
                            <Option value={nowtime.getFullYear() + ''}>{nowtime.getFullYear()}</Option>
                            <Option value={(nowtime.getFullYear() - 1) + ''}>{nowtime.getFullYear() - 1}</Option>
                            <Option value={(nowtime.getFullYear() - 2) + ''}>{nowtime.getFullYear() - 2}</Option>
                            <Option value={(nowtime.getFullYear() - 3) + ''}>{nowtime.getFullYear() - 3}</Option>
                            <Option value={(nowtime.getFullYear() - 4) + ''}>{nowtime.getFullYear() - 4}</Option>
                            <Option value={(nowtime.getFullYear() - 5) + ''}>{nowtime.getFullYear() - 5}</Option>
                        </Select>
                    </div>
                </div>
                <Card style={{ marginTop: '20px' }}>
                    <Table className="accountTable" columns={columns} dataSource={this.state.data} ></Table>
                </Card>
            </div>
        )
    }
}
export default HistoricalAccount