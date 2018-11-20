import $ from 'jquery';

export default function isPositiveNumber(value) {   //是否是正数
    const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
    if ((!isNaN(value) && reg.test(value)) || value === '') {
        return true;
    }
    else {
        return false;
    }
}

export default function isNumber(value) {   //是否是数字（正负）
    const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
    if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
        return true;
    }
    else {
        return false;
    }
}

// string 2014-07-10 10:21:12
export default function getTimestampFromString(string) {
    let timestamp = Date.parse(new Date(string));
    timestamp = timestamp / 1000;
    return timestamp
}
