(function (w) {
    w.jApp = {
        options:{
            url:null,	    //网址
            action:null,	//action地址
            prefix:null,	//cookie前缀
            current:null,	//当前页面类型
            usePjax:!1,
            lazyLoad:!1
        },
        prevTop:0,
        headerShow:true,
        loadingShow:true,
        init:function(options){
            $.extend(jApp.options,options);

            jApp.initClick();

            $(window).resize(function(){
                jApp.windowResize();
            });
            $(window).scroll(function(){
                jApp.windowScroll();
            });

            if(true === jApp.options.usePjax){
                jApp.initPjax();
            }

            if('post' == jApp.options.current || 'page' == jApp.options.current){
                jApp.initHighLight();
            }
            if(true === jApp.options.lazyLoad){
                jApp.initLazyLoad();
            }
            jApp.bindCommentAjaxLoad();
            jApp.initMainHiehgt();
            jApp.windowResize();
            jApp.windowScroll();

            //移动页面hover失焦后
            document.body.addEventListener('touchstart', function(){});
        },
        initClick:function(){
			$(document).on('click','.site-name',function(){
                return jApp.menuToggle();
            });
			$(document).on('click','.btn-nav-size',function(){
                jApp.menuSizeToggle($(this));
				return false;
            });
			$(document).on('click','.btn-screen-size',function(){
                jApp.screenSizeToggle($(this));
				return false;
            });
			$(document).on('click','.btn-mode',function(){
                jApp.modeToggle($(this));
				return false;
            });
            $(document).on('click','.btn-like',function(){
                jApp.ajaxLikePost($(this));
                return false;
            });
            $(document).on('click','.btn-gotop',function(e){
                e.preventDefault();
                jApp.goTop();
            });
        },
        initPage:function(options){
            $.extend(jApp.options,options);
            if(jApp.options.title){
                $('title').text(jApp.options.title);
            }
            if('post' == jApp.options.current || 'page' == jApp.options.current){
                jApp.initHighLight();
                $('#wrapper').addClass('single');
            }else{
                $('#wrapper').removeClass('single');
            }
            if(jApp.options.lazyLoad){
                jApp.initLazyLoad($('#main'));
            }
            jApp.bindCommentAjaxLoad();
            jApp.initMainHiehgt();
        },
        bindCommentAjaxLoad:function(){
            $('#comment-ajax-list').bind('DOMNodeInserted',function(){
                jApp.initMainHiehgt();
            });
        },
        initMainHiehgt:function(){
			$('#main').removeAttr('style');
            if($('#main').height() < ($(window).height()-120)){
                $('#main').height($(window).height()-120);
            }
        },
        initHighLight:function(){
			$('#main pre > code').each(function(i, block) {
				hljs.highlightBlock(block);
			});
        },
        initLazyLoad:function(el){
            if(undefined === el){
                $('.lazy').lazyload();
            }else{
                $('.lazy',el).lazyload();
            }
        },
        goTop:function(){
            $("html, body").animate({ scrollTop: 0 }, 200);
        },
        headerToggle:function(){
            if(jApp.headerShow){
                $('.body-header').css("top",0);
                if($(window).width()<768){
                    $('#header').css("top",0);
                }
            }else{
                $('.body-header').css("top", -45);
                if($(window).width()<768){
                    $('#header').css("top",-45);
                }
            }
        },
		modeToggle:function(btn){
			var wrap = $('#wrapper');
			var mode = '';
			if(wrap.hasClass('theme-dark')){
				btn.find('i').attr('class','icon icon-moon');
				wrap.removeClass('theme-dark');
				mode = 'light';
			}else{
				btn.find('i').attr('class','icon icon-sun');
				wrap.addClass('theme-dark');
				mode = 'dark';
			}
			if(mode != jApp.getCookie('themeMode')){
				jApp.setCookie('themeMode',mode);
			}
		},
		menuToggle:function(){
			var w = $(window).width();
			var hide = function(){
				$(document).one("click", function(e){
					if('header' != $(e.target).attr('id') && $(e.target).parents("#header").length == 0){
						wrap.removeClass('holding-right');
					}else{
						hide();
					}
				});
			}
			if(w<768){
				var wrap = $('#wrapper');
				if(wrap.hasClass('holding-right')){
					wrap.removeClass('holding-right');
				}else{
					wrap.addClass('holding-right');
					hide();
				}
				return false;
			}
			return true;
		},
		menuSizeToggle:function(btn){
			var wrap = $('#wrapper');
			var size = '';
			if(wrap.hasClass('mini-nav')){
				btn.find('i').attr('class','icon icon-outdent');
				wrap.removeClass('mini-nav');
				size = 'normal';
			}else{
				btn.find('i').attr('class','icon icon-indent');
				wrap.addClass('mini-nav');
				size = 'mini';
			}
			if(size != jApp.getCookie('menuSize')){
				jApp.setCookie('menuSize',size);
			}
		},
		screenSizeToggle:function(btn){
			var wrap = $('#wrapper');
			var size = '';
			if(wrap.hasClass('mini')){
				btn.find('i').attr('class','icon icon-compress');
				wrap.removeClass('mini');
				size = 'normal';
			}else{
				btn.find('i').attr('class','icon icon-expand');
				wrap.addClass('mini');
				size = 'mini';
			}
			if(size != jApp.getCookie('screenSize')){
				jApp.setCookie('screenSize',size);
			}
		},
        initPjax:function(){
            $(document).pjax('a', '#main');
            $(document).on('pjax:send', function(e) {
                jApp.pjaxLoading('show');
            });
            $(document).on('pjax:complete', function(e) {
                jApp.pjaxLoading('hide');
            });
        },
        pjaxLoading:function(type){
            var loading = $('#pjax-loading'),width = 0;
            var progress = function(){
                if(jApp.loadingShow === true && width < $(window).width()){
                    $('#pjax-loading').width(width).show();
                    width +=4;
                    setTimeout(function(){ progress(); },10);
                }else{
                    $('#pjax-loading').width($(window).width());
                    setTimeout(function(){
                        $('#pjax-loading').width(0).hide();
                    },300);
                }
            }
            if(type=='show'){
                if(loading.length==0){
                    $('<div id="pjax-loading"></div>').appendTo($('body'));
                }
                jApp.loadingShow = true;
                progress();
            }else{
                jApp.loadingShow = false;
            }
        },
        ajaxLikePost:function(el){
            var cid = el.data('cid');
            if(cid === undefined){
                jApp.dialog('内容不存在','error');
                return;
            }
            var num = parseInt(el.find('.likes-num').text());
            $.get(jApp.options.action+'/textends?do=like&cid='+cid+'&_='+window.token,function(rs){
                var type = 'error';
                if(rs.status==1){
                    type= 'success';
                    num = (rs.likesNum !== undefined) ? rs.likesNum : (num+1);
                    el.find('.likes-num').text(' '+num);
                }
                jApp.dialog(rs.msg,type);
            });
        },
        windowResize:function(){	//同步窗口大小
            var size = $(window).width();
            if(size > 768){
                $('#header').css("top",0);
            }
        },
        windowScroll:function(){
            var top = document.body.scrollTop;
            if(top>100){
                $('.btn-gotop').show();
            }else{
                $('.btn-gotop').hide();
            }
            if($('#wrapper').hasClass('single')){
                jApp.headerShow = (top<100 || (jApp.prevTop-top)>0) ? true : false;
                jApp.headerToggle();
            }
            jApp.prevTop = top;
        },
        dialog:function(msg,type,time){		//提示信息
            var id = 'notice-'+(new Date().getTime());
            type = type==='error' ? 'error' :'success';
            time = time === undefined ? (type=='success' ? 3000 : 5000) : time;
            var html = '<div id="'+id+'" class="notice-item '+type+'"><span class="notice-item-close"><i class="icon icon-close"></i></span>'
            +'<span class="notice-item-type"><i class="icon icon-'+type+'"></i></span><p>'+msg+'</p></div>';
            var notice = $('#notice');
            if(notice.length==0){
                $('<div id="notice"></div>').appendTo($('body'));
            }
            $(html).appendTo($('#notice')).on('click','.notice-item-close',function(){
                $(this).parent().remove();
                return false;
            });
            //居中显示
            $('#notice').css('margin-right',-$('#notice').width()/2);
            if(time != 0){
                setTimeout(function(){
                    $('#'+id).remove();
                },time);
            }
        },
        setCookie:function(name,value,expires){
            expires = expires === undefined ? 1 : expires;
            expires = new Date(+new Date + 1000 * 60 * 60 * 24 * expires);
            expires = ';expires=' + expires.toGMTString();
            path = ';path=/';
            document.cookie = jApp.options.prefix+name+"="+escape(value)+expires+path;   //转码并赋值
        },
        getCookie:function(name){
            name = jApp.options.prefix+name;
            var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
            if(arr=document.cookie.match(reg))
                return unescape(arr[2]);
            else
                return null;
        }
    };
})(window);