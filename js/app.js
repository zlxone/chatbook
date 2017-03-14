/**
 * 演示程序当前的 “注册/登录” 等操作，是基于 “本地存储” 完成的
 * 当您要参考这个演示程序进行相关 app 的开发时，
 * 请注意将相关方法调整成 “基于服务端Service” 的实现。
 **/
(function($, owner) {
	
		
	
	/**
	 * 用户登录
	 **/
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.username = loginInfo.username || '';
		loginInfo.userpwd = loginInfo.userpwd || '';
		
		/*if (loginInfo.username.length < 5) {
			return callback('账号最短为 5 个字符');
		}
		if (loginInfo.userpwd.length < 6) {
			return callback('密码最短为 6 个字符');
		}*/
		//验证帐号密码
		
		
		
		//本地验证
		var chat_users = JSON.parse(localStorage.getItem('$users') || '[]');
		var authed = chat_users.some(function(user) {
			return loginInfo.username == user.username && loginInfo.userpwd == user.userpwd;
		});
		if (authed) {
			return owner.createState(loginInfo.username, callback);
		} else {
			return callback('用户名或密码错误');
		}
	};

	owner.createState = function(name, callback) {
		var state = owner.getState();
		state.username = name;
		state.token = "token123456789";
		owner.setState(state);
		return callback();
	};

	/**
	 * 登录app------保存用户id到本地
	 * 退出app------清除本地id
	 **/
	owner.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.username = regInfo.username || '';
		regInfo.userpwd = regInfo.userpwd || '';
				
		var chat_users = JSON.parse(localStorage.getItem('$users') || '[]');
		chat_users.push(regInfo);
		localStorage.setItem('$users', JSON.stringify(chat_users));
		return callback();
	};

	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
		//var settings = owner.getSettings();
		//settings.gestures = '';
		//owner.setSettings(settings);
	};

	var checkPhone = function(phone) {
		phone = phone || '';		
		var reg=new RegExp('^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70)\\d{8}$');
		return (reg.test(phone));
	};
	
	var checkEmail = function(email) {
		email = email || '';
		//var reg=new RegExp('^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$');
		var reg=new RegExp('^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$');
		return (reg.test(email));
	};
	
	var checkId = function(id) {//身份证验证功能有问题
		id = id || '';		
		var len = id.length;
		if (len==15) {
			var reg=new RegExp('^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$');
			return (reg.test(id));
		} else if(len==18){
			var reg=new RegExp('/^(\d{18,18}|\d{15,15}|\d{17,17}x)$/');
			return (reg.test(id));
		}else{
			return false;
		}
	};

	/**
	 * 找回密码(使用手机邮箱密保问题任一种方式)
	 **/
	owner.forgetPassword = function(mode,values, callback) {
		callback = callback || $.noop;
		
		if (mode==1) {//手机
			if(!checkPhone(values)){
				return callback('您输入的手机号码不合法，请重新输入！');
			}
			return callback(null, '新的随机密码已经发送到您的手机，请查收邮件。');
		} else if(mode==2){//邮箱
			if (!checkEmail(values)) {
				return callback('您输入的邮箱地址不合法，请重新输入！');
			}
		}else if(mode==3){//密保问题
			if (!checkId(values)) {
				return callback('您输入的身份证号码不合法，请重新输入！');
			}
		}		
				
		return callback(null, 'ok');
	};

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('chat_set', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置  第三方登录
	 **/
	owner.getSettings = function() {
			var settingsText = localStorage.getItem('chat_set') || "{}";
			return JSON.parse(settingsText);
		}
		/**
		 * 获取本地是否安装客户端
		 **/
	owner.isInstalled = function(id) {
		if (id === 'qihoo' && mui.os.plus) {
			return true;
		}
		if (mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var packageManager = main.getPackageManager();
			var PackageManager = plus.android.importClass(packageManager)
			var packageName = {
				"qq": "com.tencent.mobileqq",
				"weixin": "com.tencent.mm",
				"sinaweibo": "com.sina.weibo"
			}
			try {
				return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
			} catch (e) {}
		} else {
			switch (id) {
				case "qq":
					var TencentOAuth = plus.ios.import("TencentOAuth");
					return TencentOAuth.iphoneQQInstalled();
				case "weixin":
					var WXApi = plus.ios.import("WXApi");
					return WXApi.isWXAppInstalled()
				case "sinaweibo":
					var SinaAPI = plus.ios.import("WeiboSDK");
					return SinaAPI.isWeiboAppInstalled()
				default:
					break;
			}
		}
	}
}(mui, window.app = {}));