// ==UserScript==
// @name         百度去除广告与百家号
// @namespace    http://tampermonkey.net/
// @include      *//www.baidu.com/s*
// @include      *//*/*
// @description  删除搜索结果中关于广告以及百家号的内容
// @author       术与道
// @grant        GM.xmlHttpRequest
// @run-at       document-end
// @version	     0.10
// @connect      www.baidu.com
// ==/UserScript==

var version = "0.10";

// 运行
(function () {
	var domain =  document.domain;
    if (domain.indexOf("www.baidu.com")>-1) {
    	//去除右上方相关搜索图片
	    $("#container #con-ar div").first().hide();
	    //去除右方的推广链接
	    $(".layout").hide()
		clean_bjh();
	    clear_bdad();
    }else{
    	clean_ad();
    }
})();


function clean_ad(){
	var iframe_list = document.getElementsByTagName('iframe');
	for(var i = 0 ; i < iframe_list.length ; i++){
		if(iframe_list[i].src.indexOf("pos.baidu.com")>-1||iframe_list[i].src.indexOf("yylady.cn")>-1){
			iframe_list[i].style.display = "none";
		}
	}
}

function clear_bdad(){
    function clean(){
    	//获取推广广告元素
	    var list = document.getElementById('content_left').getElementsByTagName('div');
	    //去除
	    for(var i = 0 ; i < list.length ; i++){
	    	if (list[i].innerHTML.indexOf("display:block !important;visibility:visible !important")!=-1) {
	    		list[i].style.display="none";
	    	}
	    }
    }
    //
    setInterval(function(){
        //去除右上方相关搜索图片
        $("#container #con-ar").find("div").first().hide();
        //去除右方的推广链接
        $(".layout").hide()
    	var arr = $(".f13 span");
    	for(var i = 0 ; i < arr.length ; i++){
    		if (arr[i].innerText.indexOf("广告") > -1) {
    			arr[i].parentNode.parentNode.style.display = "none";
    		}
    	}
    	clean();
	},1000)
}


// 百家号
function clean_bjh() {
	'use strict';

	let tags = $('#content_left a[href^="http://www.baidu.com/link?url="]');

	let top = $('.c-offset');

	let video = $('.op-short-video-pc');

	let counter = 0;

	let bjhCounter = 0;

	let resultCounter = $(".nums_text");
	let resultCounterText = $(".nums_text").text();

	// 轮询每个链接，获取链接背后的真实url
	// 发现URL包含baijiahao，删除之
	// 如果是聚合搜索结果，且聚合搜索结果中全是百家号，则删除整个聚合搜索框
	tags.each(function (i, v) {
		let url = $(this).attr('href');
		(function (url, currentNode) {
			url = url.indexOf("eqid") < 0 ? url + "&wd=&eqid=" : url;

			// 这里不能使用$.ajax()，因为浏览器默认禁止发起修改headers的请求
			GM.xmlHttpRequest({
				method: "GET",
				url: url,
				async: true,
				headers: {
					"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36",
					"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
					"Host": "www.baidu.com",
					"Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7",
					"Pragma": "no-cache",
					"Cache-Control": "no-cache",
					"Accept-Encoding": "gzip, deflate, br",
					"Connection": "keep-alive"
				},
				onload: function (response) {
					let reg = /URL=['|"]([^'|"]+)/;

					if (reg.test(response.responseText)) {

						let realUrl = response.responseText.match(reg)[1];

						if (realUrl.indexOf('baijia') !== -1) {
							bjhCounter ++;

							// 去除父元素 直接删除该搜索结果
							// 针对单独搜索结果
							$(currentNode).parents('.c-container').remove();

							// 如果『聚合搜索』内容为空，直接删除父元素
							// 针对聚合搜索结果
							if (!top.children().length) {
								top.parent().remove();
							}

						} else {
							// 还原真实地址
							// 减小百度采集用户链接点击信息的概率
							// 保护隐私，从我做起
							$(currentNode).attr('href', realUrl);
						}

						resultCounter.text(resultCounterText + "，其中包含" + bjhCounter + "个百家号链接，已全部去除");
					}
				},
			});
		})(url, this);
	});

}
