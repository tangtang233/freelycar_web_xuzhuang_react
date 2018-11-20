
export default function getLastDay(year, month) {
    let day = []
    if (((year % 4) == 0) && ((year % 100) != 0) || ((year % 400) == 0)) {
        day = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    } else { 
        day = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
     }
    return new Date(`${year}-${month}-${day[Number(month) - 1]}`)
} 