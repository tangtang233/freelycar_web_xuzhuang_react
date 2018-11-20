export default function compare(property){
    return function(a,b){
        var value1 = a[property];
        var value2 = b[property];
        if(value1>value2){
            return 1
        } else {
            return -1
        }
    }
}