﻿(function (w) {
	w.TeCmt = {
		options:{
            current:null,
            url:null,	    //网址
            action:null,	    //网址
            respondId:null,
        },
		text:null,
		tool:null,
        cmd:null,
        commentAjaxLoadElement:'#comment-ajax-list',
        commentAjaxLoad:false,
        commentLoading:false,
		init:function(options){
            $.extend(TeCmt.options,options);
            TeCmt.commentLoading = false;
            if($(TeCmt.commentAjaxLoadElement).length >0){
                TeCmt.commentAjaxLoad = true;
            }else{
                TeCmt.commentAjaxLoad = false;
            }
            if('post' != TeCmt.options.current && 'page' != TeCmt.options.current){
                return;
            }
			TeCmt.text = $('#textarea');
			TeCmt.tool = $('#te-cmt-tool');
			//显示工具栏
			TeCmt.text.focus(function(){
				TeCmt.tool.slideDown();
			});
			//点击文本框时关闭
			TeCmt.text.click(function(){
				TeCmt.tool.find('.te-cmt-smilies').slideUp();
			});
			//解析工具栏命令
			$('#te-cmt-cmd a').click(function(){
				TeCmt.cmd = $(this).data('cmd');
				TeCmt.parseCmd();
				return false;
			});
			TeCmt.tool.find('.te-cmt-smilies span').click(function(){
				var tag = $(this).data('tag');
				TeCmt.write(tag);
				return false;
            });
            
            $(window).scroll(function(){
                TeCmt.windowScroll();
            });
            TeCmt.initComment();
            TeCmt.windowScroll();
        },
		initComment:function(){
            var appendComment = function(html,parent){
                var el = $('#comments > .comments-inner').find('.comment-list');
                if(el.length == 0){
                    $('#comments > .respond').before('<div class="comments-inner"><ol class="comment-list"></ol></div>');
                    el = $('#comments > .comments-inner').find('.comment-list');
                }
                if(parent !== undefined){
                    var el = $('#comment-'+parent);
                    var respond = el.find('.respond');
                    if(el.find('.comment-children').length <1){
                        var children = '<div class="comment-children"><ol class="comment-list"></ol></div>';
                        if(respond.length > 0){
                            respond.before(children);
                        }else{
                            $(children).appendTo(el);
                        }
                    }else if(el.find('.comment-children > .comment-list').length <1){
                        $('<ol class="comment-list"></ol>').appendTo(el.find('.comment-children'));
                    }
                    el = $('#comment-'+parent).find('.comment-children').find('.comment-list');
                }
                $(html).appendTo(el);
            }
            $('#comment-form').submit(function(e){
				e.preventDefault();
                var that = $(this);action = that.attr('action'), params = that.serialize(), parent = that.find('input[name=parent]').val();
                if(action.indexOf('?')<0){
                    action +='?_='+window.token;
                }
                $.ajax({
                    url: action,
                    type: 'POST',
                    data: params,
                    dataType: 'json',
                    beforeSend: function() { that.find('.submit').addClass('loading').html('<i class="fa fa-spinner fa-pulse fa-spin"></i> 提交中...')},
                    complete: function() { that.find('.submit').removeClass('loading').html('提交评论')},
                    success: function(result){
                        if(result.status == 1){
                            that.find('textarea').val('');
                            appendComment(result.body,parent);
                        }
                        if(result.msg !== undefined && result.msg != ''){
                            TeCmt.dialog(result.msg,result.status == 1 ? 'success': 'error');
                        }
                    },
                    error:function(xhr, ajaxOptions, thrownError){
                        TeCmt.dialog('评论失败，请重试','error');
                    }
                });
                return false;
            });
        },
        LoadComment:function(){
            var list = $(TeCmt.commentAjaxLoadElement), cid = list.data('cid'),num = list.data('num');
            if(0 == list.length || undefined == cid || 0 === num){
                return false;
            }
            if(history.pushState){
                window.addEventListener("popstate", function(e) {
                    var nowPage = (null != e.state && undefined != e.state.page) ? e.state.page : null;
                    if(null != nowPage){
                        TeCmt.commentPage(e.state.url, nowPage,true);
                    }            
                });
            }
            var commentPage = list.data('comment-page');
            var url = window.location.href;
            if('' === commentPage){
                commentPage = 1;
                if( 0 < url.indexOf('#')){
                    url = url.substr(0,url.indexOf('#'));
                }
                url += '/comment-page-1';
            }
            TeCmt.commentPage(url, commentPage);
        },
        commentPage:function(url, nowPage, replace){
            var page = $(TeCmt.commentAjaxLoadElement).data('page');
            if('' === nowPage){
                return false;
            }
            
            replace = undefined === replace ? false : replace;
            if(page != nowPage){
                if(!replace){
                    var state = {page:nowPage,url:url};
                    history.pushState(state, '', url);
                }
                TeCmt.ajaxLoadComment(nowPage);
                return true;
            }else{
                return false;
            }
        },
        ajaxLoadComment:function(page){
            var list = $(TeCmt.commentAjaxLoadElement), cid = list.data('cid');
            list.data('page', page);
            list.html('<div style="margin:100px auto;text-align:center;"><i class="icon icon-loading icon-large icon-pulse" title="加载中"></i></div>');
            $.get(TeCmt.options.action+'/TeComment?comment='+cid+'&commentPage='+page+'&_='+window.token,function(rs){
                var type = 'error';
                if(rs.status==1){
                    $('body').find('#tecmt-token').remove();
                    $(rs.token).appendTo($('body'));
                    list.html(rs.comments+rs.pageNav);
                    list.find('.page-navigator a').click(function(){
                        var url = $(this).attr('href');
                        if(history.pushState){
                            var pageArr = url.match(/comment-page-(\d*)#comments/);
                            var nowPage = null != pageArr ? parseInt(pageArr[1]) : '';
                            TeCmt.commentPage(url, nowPage);
                            $("html, body").animate({ scrollTop: ($('#comments').offset().top - 60) }, 200);
                            return false;
                        }else{
                            return true;
                        }
                    });
                }else{
                    list.html('');
                    TeCmt.dialog(rs.msg,'error');
                }
            });
        },
		parseCmd:function(){
			if(TeCmt.cmd==null || TeCmt.cmd===undefined){
				return false;
			}
			switch(TeCmt.cmd){
				case 'signin':TeCmt.write('签到成功！每日签到，生活更精彩哦~');break;
				case 'smilies':TeCmt.tool.find('.te-cmt-smilies').slideToggle();break;
				case 'bold':TeCmt.write("<strong>", "</strong>");break;
				case 'italic':TeCmt.write("<em>", "</em>");break;
				case 'quote':TeCmt.write("<blockquote>", "</blockquote>");break;
				case 'underline':TeCmt.write("<u>", "</u>");break;
				case 'deline':TeCmt.write("<del>", "</del>");break;
				case 'code':TeCmt.write('<pre>', '</pre>');break;
				case 'img':TeCmt.insestImg();break;
			}
		},
		insestImg:function(){
			var a = prompt("请输入图片地址", "http://");
			if (a) {
				TeCmt.write('<img src="' + a + '" rel="external nofollow" id="comments-img" alt="评论贴图" />', "")
			}
		},
		write:function(l,r){
			if(l===undefined) return false;
			var el = TeCmt.text[0];
			if (document.selection) {
				el.focus();
				sel = document.selection.createRange();
				r ? sel.text = l + sel.text + r : sel.text = l;
				el.focus();
			} else {
				if (el.selectionStart || el.selectionStart == "0") {
					var d = el.selectionStart;
					var e = el.selectionEnd;
					var f = e;
					r ? el.value = el.value.substring(0, d) + l + el.value.substring(d, e) + r + el.value.substring(e, el.value.length) : el.value = el.value.substring(0, d) + l + el.value.substring(e, el.value.length);
					r ? f += l.length + r.length : f += l.length - e + d;
					if (d == e && r) {
						f -= r.length;
					}
					el.focus();
					el.selectionStart = f;
					el.selectionEnd = f;
				} else {
					el.value += l + r;
					el.focus();
				}
			}
        },
        dialog:function(msg,type,time){
            if(undefined === jApp){
                alert(msg);
            }else{
                jApp.dialog(msg,type,time);
            }
        },
        windowScroll:function(){
            if(TeCmt.commentAjaxLoad){
                var height = $(window).height(), windowTop = document.body.scrollTop, listTop = $(TeCmt.commentAjaxLoadElement).offset().top;
                if((windowTop+height) > listTop && false == TeCmt.commentLoading){
                    TeCmt.commentLoading = true;
                    TeCmt.LoadComment();
                }
            }
            
        }
	}
})(window);
(function () {
    window.TypechoComment = {
        dom : function (id) {
            return document.getElementById(id);
        },
        create : function (tag, attr) {
            var el = document.createElement(tag);
            for (var key in attr) {
                el.setAttribute(key, attr[key]);
            }
            return el;
        },
        reply : function (cid, coid) {
            var comment = this.dom(cid), parent = comment.parentNode,
                response = this.dom(TeCmt.options.respondId), input = this.dom('comment-parent'),
                form = 'form' == response.tagName ? response : response.getElementsByTagName('form')[0],
                textarea = response.getElementsByTagName('textarea')[0];
            if (null == input) {
                input = this.create('input', {
                    'type' : 'hidden',
                    'name' : 'parent',
                    'id'   : 'comment-parent'
                });
                form.appendChild(input);
            }
            input.setAttribute('value', coid);
            if (null == this.dom('comment-form-place-holder')) {
                var holder = this.create('div', {
                    'id' : 'comment-form-place-holder'
                });
                response.parentNode.insertBefore(holder, response);
            }
            if($(comment).children('.comment-children').length){
                $(comment).children('.comment-children').before(response)
            }else{
                comment.appendChild(response);
            }
            this.dom('cancel-comment-reply-link').style.display = '';
            if (null != textarea && 'text' == textarea.name) {
                textarea.focus();
            }
            return false;
        },
        cancelReply : function () {
            var response = this.dom(TeCmt.options.respondId),
            holder = this.dom('comment-form-place-holder'), input = this.dom('comment-parent');
            if (null != input) {
                input.parentNode.removeChild(input);
            }
            if (null == holder) {
                return true;
            }
            this.dom('cancel-comment-reply-link').style.display = 'none';
            holder.parentNode.insertBefore(response, holder);
            return false;
        }
    };
})();