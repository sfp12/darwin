$(function(){
	

	$('.carousel').carousel({
	  interval: 2000
	});

	//validate_login_image
	$('#v_l_img').unbind().bind('click', function(){
		$(this).attr('src', 'login/getCode?'+new Date().getTime());
	})

	//validate_regist_image
	$('#v_r_img').unbind().bind('click', function(){
		$(this).attr('src', 'login/getCode?'+new Date().getTime());
	})

	//	登陆
	$('#submit_l').unbind().bind('click', function(e){
		e.preventDefault();
		var uname = $('#uname').val();
		var password = $('#password').val();
		var validation = $('#validate_login').val();

		var argu = {};
		argu.email = uname;
		argu.pwd = password;
		argu.code = validation;		

		$.post('/login/doLogin', argu, function(data){
			data = JSON.parse(data);
			if(data.status == 0){				
				$.cookie('uname',data.data.userName);
				$.cookie('uid', data.data.userId);
				window.location.href="/";
			}else{
				alert(data.data);
			}
		});
	})

	//	注册
	$('#submit_r').unbind().bind('click', function(e){
		e.preventDefault();
		var email = $('#email').val();
		var validation = $('#validate_regist').val();

		var argu = {};
		argu.email = uname;
		argu.code = validation;

		console.log('click, regist');
// $('#test').ajaxStart(function(e, xhr, opt){
// 			$(this).html(opt.url);
// 		})
		// $.post('http://www.w3school.com.cn/example/jquery/demo_ajax_load.asp', argu, function(){
		// 	console.log('register');
		// });
		$("div").load("/example/jquery/demo_ajax_load.asp");

	})	


})