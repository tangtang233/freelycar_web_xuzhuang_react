 export  default function getDateStr(addDayCount){
    let dd = new Date();
    dd.setDate(dd.getDate()+addDayCount);
    let y = dd.getFullYear();
    let m = dd.getMonth()+1;
    let d = dd.getDate();
    return y+'/'+m+'/'+d;
 }