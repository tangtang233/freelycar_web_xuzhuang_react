 export default function(num,n){  
  //num代表传入的数字，n代表要保留的字符的长度  
         return (Array(n).join(0)+num).slice(-n);  
}  //JavaScript实现按照指定长度为数字前面补零输出

