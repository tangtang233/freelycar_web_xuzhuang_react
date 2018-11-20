
export default function(type,url,param,ajaxdone){
	param = (typeof param === 'undefined') ? '' : param;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onload =ajaxdone;
	xmlhttp.open(type,url,true);
	if(type=='get' || type=='GET'){
		xmlhttp.send();
		
	} else if(type=='post' || type=='POST'){
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xmlhttp.send(param);
	}
	
}