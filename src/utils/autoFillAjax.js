let timeout
let currentvalue
import $ from 'jquery';
export default function autoFillAjax(value, callback) {

    if (timeout) {
        clearTimeout(timeout)
        timeout = null
    }
    currentvalue = value
    function fake() {
        let jsonData = {};
        jsonData.name = value;
        jsonData.page = 1;
        jsonData.number = 99;
        $.ajax({
            type: 'get',
            url: 'api/'+localStorage.getItem('store')+'/'+'inventory/querybrand',
            dataType: 'json',
            data: jsonData,
            success: (res) => {
                if (currentvalue === value) {
                    const data = []
                    if (res.code == '0') {
                        res.data.forEach((r) => {
                            data.push({
                                key:r.id,
                                label:r.name
                            })
                        })
                    }
                    callback(data)
                }
            }
        })
    }
    timeout = setTimeout(fake, 300)
}