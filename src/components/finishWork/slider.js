import React from 'react';

export default function({completed,unfinished}){
    let com = Number(completed) / Number(completed+unfinished) *100+'%';
    let unfi = Number(unfinished) / Number(completed+unfinished)*100+'%';
    return <div style={{width:'100%',height:'20px'}}>
        <div style={{display:'inline-block',width:unfi,height:'20px',background:'#ed8f25',color:'#fff',textAlign:'right'}}>{unfinished}&nbsp;&nbsp;</div>
        <div style={{display:'inline-block',width:com,height:'20px',background:'#36ac4a',color:'#fff'}}>&nbsp;&nbsp;{completed}</div>
    </div>
}