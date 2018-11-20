export default function dateHelper(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based 
    var dd = date.getDate().toString();
    var HH = date.getHours().toString(); //获取当前小时数(0-23)
    var MM = date.getMinutes().toString(); //获取当前分钟数(0-59)
    var ss = date.getSeconds().toString();
    return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]) + ' ' + (HH[1] ? HH : "0" + HH[0]) + ':' + (MM[1] ? MM : "0" + MM[0]) + ':' + (ss[1] ? ss : "0" + ss[0]);
};