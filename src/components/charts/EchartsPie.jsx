
import React from 'react';
import ReactEcharts from 'echarts-for-react';


const EchartsPie = ({ proportionData }) => {
    let data = [], title = []
    proportionData.map((item, key) => {
        data.push({ value: item.count, name: item.programName })
        title.push(item.programName)
    })

    const option = {
        title: {
            text: '项目类别占比图',
            left: 'center',
            top: 20,
            textStyle: {
                color: '#777'
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: title
        },
        // visualMap: {
        //     show: false,
        //     min: 80,
        //     max: 600,
        //     inRange: {
        //         colorLightness: [0, 1],
        //     }
        // },
        series: [
            {
                name: '项目类别',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: data.sort(function (a, b) { return a.value - b.value }),
                label: {
                    normal: {
                        textStyle: {
                            color: '#777'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        lineStyle: {
                            color: '#777'
                        },
                        smooth: 0.2,
                        length: 10,
                        length2: 20
                    }
                },
                itemStyle: {
                    normal: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0,0,0,0.5)'
                    },

                },

                animationType: 'scale',
                animationEasing: 'elasticOut',
                animationDelay: function (idx) {
                    return Math.random() * 200;
                }
            }
        ]
    };
    return <ReactEcharts
        option={option}
        style={{ height: '300px', width: '100%' }}
        className={'react_for_echarts'}
    />
};

export default EchartsPie;