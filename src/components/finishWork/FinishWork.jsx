import React from 'react';
import { Row, Col,Layout,Card,Input,Button,Table } from 'antd';
const {Header,Footer,Content} = Layout;
import $ from 'jquery';
class FinishWork extends React.Component {
    constructor(props){
        super(props)
        this.state = {

        }
    }

    render(){

        const columns = [{
            title: '序号',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => {
                return <span>{index + 1}</span>
            }
        }, {
            title: '接车时间',
            dataIndex: 'name',
            key: 'name'
        }, {
            title: '车牌号',
            dataIndex: 'type',
            key: 'type',
            render: (text, record, index) => {
                return <div>
                    {text == 1 ? '抵用券' : '代金券'}
                </div>
            }
        }, {
            title: '服务项目',
            dataIndex: 'validTime',
            key: 'validTime'
        },{
            title:'服务人员',
            dataIndex:'servicePeople',
            key:'servicePeople'
        },{
            title:'确认完工',
            dataIndex:'finishWork',
            key:'finishWork.'
        }]
        return <Layout>
            <Header style={{textAlign:'center',color:'#fff',fontSize:'24px'}}>
                <img style={{width:'126px',margin:'12.5px 0',height:'39px',position:'absolute',left:'10px',verticalAlign:'middle'}} src={require('../../styles/imgs/xiaoyiaiche2.png')} alt=""/>
                订单管理
            </Header>
            <Content>
                <Card>
                    <Row style={{marginBottom:'20px'}}>
                    <Col span="8">
                        车牌号码：
                        <Input style={{width:'120'}} />
                    </Col>
                    <Col span="8">
                        <Button type="primary">
                            查询
                        </Button>
                    </Col>
                    </Row>

                    <Table pagination={this.state.pagination} bordered columns={columns} dataSource={this.state.data} onChange={(pagination) => this.handleTableChange(pagination)} />
                </Card>
            </Content>
        </Layout>
    }

}

export default FinishWork