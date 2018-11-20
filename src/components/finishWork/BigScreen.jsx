import React from 'react';
import { Row, Col, Layout, Card, Input, Button, Table } from 'antd';
const { Header, Footer, Content } = Layout;
import $ from 'jquery';
import update from 'immutability-helper'
import '../../styles/bigScreen.less'
import Slider from './slider'
import dateHelper from '../../utils/dateHelper.js'
import getDateStr from '../../utils/getDateStr.js'
const show_day = new Array('星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日')
const columns = [{
    title: '车牌号',
    dataIndex: 'licensePlate',
    key: 'licensePlate'
}, {
    title: '车型',
    dataIndex: 'carBrand',
    key: 'carBrand'
}, {
    title: '服务项目',
    dataIndex: 'projects',
    key: 'projects',
    render: (text, record, index) => {
        {
            let content = ''
            for (let item of text) {
                content = content + item.name + '、'
            }
            content = content.substring(0, content.length - 1)
            return <span>{content}</span>
        }
    }
}, {
    title: '车辆状态',
    dataIndex: 'state',
    key: 'state',
    render: (text, record, index) => {
        let content = ''
        switch (text) {
            case 1: content = '已接车'; break;
            case 2: content = '已完工'; break;
            case 3: content = '已交车'; break;
        }
        return <span>{content}</span>
    }
}, {
    title: '停放位置',
    dataIndex: 'parkingLocation',
    key: 'parkingLocation'
}, {
    title: '完工时间',
    dataIndex: 'finishTime',
    key: 'finishTime'
}]

class BigScreen extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            totalDataArray: [],
            nowDate: ''
        }

    }

    componentDidMount() {
        let res = this.getList;
        let first = true;
        res(1, first);
        this.timer = setInterval(this.myClock, 1000)
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    myClock = () => {
        let time = new Date()
        this.setState({
            nowDate: dateHelper(time) + ' ' + show_day[time.getDay() - 1]
        })
    }


    getList = (pageNumber, first) => {
        $.ajax({
            url: 'api/'+localStorage.getItem('store')+'/'+'order/screen',
            dataType: 'json',
            data: {
                page: pageNumber,
                number: 8
            },
            success: (res) => {
                if (res.code == '0') {
                    let dataArray = res.data;
                    let timer
                    for (let item of dataArray) {
                        item.key = item.id
                    }
                    if (res.size < 2) {
                        timer = setTimeout(() => this.getList(1), 10000)
                    } else {
                        clearInterval(timer)
                    }
                  
                    if (pageNumber <= res.size||res.size==0) {
                        this.setState({
                            totalDataArray: update(this.state.totalDataArray, { [pageNumber - 1]: { $set: dataArray } }),
                            pageNumber: pageNumber,
                            pick: res.pick,
                            finish: res.finish
                        }, () => {
                            if (pageNumber + 1 <= res.size) {
                                this.getList(pageNumber + 1)
                            }
                            console.log(this.state.totalDataArray)
                            this.setState({
                                swiperTable:this.state.totalDataArray.length>0?this.state.totalDataArray.map((item, index) => {
                                    return <div className="swiper-slide" key={index} style={{ height: 'auto' }}>
                                        <Slider unfinished={this.state.pick} completed={this.state.finish} />
                                        <Table className="bigscreen-table" pagination={false} bordered columns={columns} dataSource={item} />
                                        <Row style={{ marginBottom: '28px', marginTop: '20px' }}>
                                            <Col span="16" >
                                                <img style={{ width: '112.5px', height: '112.5px', verticalAlign: 'middle' }} src={require('../../styles/imgs/erweima.png')} alt="" />
                                                <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                                    <div style={{ fontSize: ' 1.2vw', color: '#fff', verticalAlign: 'middle' }}>&nbsp;&nbsp;小易爱车，您身边的汽车管家</div>
                                                    <div style={{ marginTop: '15px', fontSize: ' 1.2vw', color: '#fff', verticalAlign: 'middle' }}>&nbsp;&nbsp;更多精彩扫描二维码关注我们</div>
                                                </div>
                                            </Col>
                                            <Col span="8" style={{ textAlign: 'right' }}>
                                                <div className="bigscreen-pageNumber">{index + 1}</div>
                                            </Col>
                                        </Row>
                                    </div>
                                }):''
                            }, () => {
                                let func = this.getList;
                                let dataLength = this.state.totalDataArray.length
                                let size = res.size;
                                if (!this.mySwiper) {
                                    console.log('初始化')
                                    this.mySwiper = new Swiper(this.swiperID, {
                                        observer: true,
                                        observeParents: true,
                                        direction: 'horizontal',
                                        // loop: true,
                                        // loopAdditionalSlides : 2,
                                        // followFinger: false,
                                        speed: 2000,
                                        autoplay: 10000,
                                        initialSlide: 0,
                                        effect: 'coverflow',
                                        spaceBetween: 500,
                                        coverflowEffect: {
                                            rotate: 50,
                                            stretch: 50,
                                            depth: 100,
                                            modifier: 1,
                                            slideShadows: true
                                        },
                                        onTransitionStart: function (swiper) {
                                            console.log('transition', swiper.activeIndex)
                                            if ((swiper.activeIndex + 1) <= size) {
                                                func(swiper.activeIndex + 1);
                                            }
                                        }
                                    });
                                    this.mySwiper.update()
                                } else {
                                    console.log('更新了')
                                    this.mySwiper.stopAutoplay()
                                    this.mySwiper.update()
                                    this.mySwiper.startAutoplay()
                                }
                            })
                        })
                    }
                }
            }
        })
    }

    render() {


        return <Layout className="big-screen-bac">
            <Content>
                <Row style={{ marginBottom: '28px' }}>
                    <Col span="8">
                        <img style={{ margin: '16px 0px', width: '36px', height: '36px', verticalAlign: 'middle' }} src={require('../../styles/imgs/icon_time.png')} alt="" />
                        <span style={{ fontSize: '20px', color: '#fff', verticalAlign: 'middle' }}>&nbsp;&nbsp;{this.state.nowDate}</span>
                    </Col>
                    <Col span="16" style={{ textAlign: 'right' }}>
                        <img style={{ width: '221px', height: '68px', verticalAlign: 'middle' }} src={require('../../styles/imgs/xylogo.png')} alt="" />
                    </Col>
                </Row>
                <div className="swiper-container" style={{ width: '100%' }} ref={self => this.swiperID = self}>
                    <div className="swiper-wrapper">
                        {this.state.swiperTable}
                    </div>
                </div>
            </Content>
        </Layout>
    }
}

export default BigScreen