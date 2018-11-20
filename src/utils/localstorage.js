/*设置与获取Cookie*/
let Cookie = {}
Cookie.write = function (key, value, duration) {
    var d = new Date();
    d.setTime(d.getTime() + 1000 * 60 * 60 * 24 * 30);
    document.cookie = key + "=" + encodeURI(value) + "; expires=" + d.toGMTString();
};
Cookie.read = function (key) {
    var arr = document.cookie.match(new RegExp("(^| )" + key + "=([^;]*)(;|$)"));
    if (arr != null)
        return decodeURIComponent(arr[2]);
    return "";
};
//定义本地存储对象
let storage = {
    getItem: function (key) {//假如浏览器支持本地存储则从localStorage里getItem，否则乖乖用Cookie
        return window.localStorage ? localStorage.getItem(key) : Cookie.read(key);
    },
    setItem: function (key, val) {//假如浏览器支持本地存储则调用localStorage，否则乖乖用Cookie
        if (window.localStorage) {
            localStorage.setItem(key, val);
        } else {
            Cookie.write(key, val);
        }
    }
};

export default storage