let my_view = document.getElementById("gameview");

function plusReady() {
	// 全屏显示
	plus.navigator.setFullscreen(true);
	plus.navigator.setStatusBarBackground('#000000');
	// Android处理返回键
	plus.key.addEventListener('backbutton', function () {
		('iOS' == plus.os.name) ? plus.nativeUI.confirm('确认退出？', function (e) {
			if (e.index > 0) {
				plus.runtime.quit();
			}
		}, 'HelloH5', ['取消', '确定']) : (confirm('确认退出？') && plus.runtime.quit());
	}, false);
}
if (window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

var app = new PIXI.Application({
	width: 192,
	height: 108,
	view: my_view,
	backgroundColor: 0x1099bb,
	resolution: 8
});
//var app = new PIXI.Application({ width: 50, height: 50,view:my_view, backgroundColor: 0x1099bb, resolution: 8.8, });
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST; //像素模式
//PIXI.settings.ROUND_PIXELS =true;

let rendererer = PIXI.autoDetectRenderer({
	roundPixels: false
});

let background;
let langan;
let player; //玩家角色
let pang;
let state; //游戏状态

let enter;

let left, //玩家按键
	up,
	right,
	down,
	j,
	kk,
	l,
	u,
	i,
	o;
let charm = new Charm(PIXI);
var time = new Date(); //时间！
let jtime = 0;
let mystage;
let 飞行道具 = [];//是一个数组，用来更新飞行道具。
let 血;
let uihuanren, headbar, 选择栏, 人选;
let team = {//每个要战斗的角色new出来，都要扔进其中一个阵营。
	"玩家": [],//主动打敌人。
	"敌人": [],//主动打玩家。
	"野怪": [],//备用。
	"玩家飞行道具": [],
	"敌人飞行道具": [],
	"野怪飞行道具": []
}
let sheet, sheet2, sheet3, sheet4;
let enemy = []; //要在里面下功夫了。要把这个数组引入兵中，在兵中可以控制数组。
document.body.appendChild(app.view);

PIXI.Loader.shared
	.add("./sprite/wukong.json")
	.add("./sprite/pang.json")
	.add("./sprite/smallwolf.json")
	.add("./sprite/bigmap.png")
	.add("./sprite/screenround.png")
	.add("./sprite/colum.png")
	.add("./sprite/light.png")
	.add("./sprite/ban.png")
	.add("./sprite/bigwolf.json")
	.add("./sprite/UI.json")
	.add("./sprite/headbar.png")
	.add("./sprite/choosebar.png")
	.load(setup);


//PIXI.Loader.shared.add("./sprite/colum.png");


function setup() {
	mystage = new PIXI.Container();
	app.stage.addChild(mystage);

	sheet = PIXI.Loader.shared.resources["./sprite/wukong.json"].spritesheet;
	sheet2 = PIXI.Loader.shared.resources["./sprite/pang.json"].spritesheet;
	sheet3 = PIXI.Loader.shared.resources["./sprite/smallwolf.json"].spritesheet;
	sheet4 = PIXI.Loader.shared.resources["./sprite/bigwolf.json"].spritesheet;
	sheetUI = PIXI.Loader.shared.resources["./sprite/UI.json"].spritesheet;

	左键 = new PIXI.Sprite(sheetUI.textures["左键.png"]);
	左键.position.set(3, 89);
	//左键.buttonMode = true;
	左键.interactive = true;
	app.stage.addChild(左键);
	左选框 = new PIXI.Sprite(sheetUI.textures["左右选框.png"]);
	左选框.position.set(1, 87);
	左选框.visible = false;
	app.stage.addChild(左选框);
	右键 = new PIXI.Sprite(sheetUI.textures["右键.png"]);
	右键.position.set(25, 89);
	右键.buttonMode = true;
	右键.interactive = true;
	app.stage.addChild(右键);
	右选框 = new PIXI.Sprite(sheetUI.textures["左右选框.png"]);
	右选框.position.set(23, 87);
	右选框.visible = false;
	app.stage.addChild(右选框);
	暂停 = new PIXI.Sprite(sheetUI.textures["暂停.png"]);
	暂停.position.set(172, 3);
	暂停.interactive = true;

	暂停.on('pointerdown', ()=>{console.log("按了按钮"); app.ticker.stop();});

	app.stage.addChild(暂停);
	继续 = new PIXI.Sprite(sheetUI.textures["继续.png"]);
	继续.position.set(172, 3);
	继续.visible = false;
	app.stage.addChild(继续);

	j键 = new PIXI.AnimatedSprite(sheetUI.animations["j键"]);
	j键.position.set(120 + 33, 90 - 10);
	j键.buttonMode = true;
	j键.interactive = true;
	j键.animationSpeed = 0.03;
	//j键.play();
	app.stage.addChild(j键);

	function keymask(x, y, key) {
		mask = new PIXI.AnimatedSprite(sheetUI.animations["冷却"]);
		mask.position.set(x, y);
		app.stage.addChild(mask);
		//mask.gotoAndStop(8);
		mask.loop = false;
		mask.visible = false;
		return mask;
	}

	j键mask = keymask(153, 80, j键);
	j键mask.onFrameChange = () => {

	}
	j键mask.onComplete = () => {
		console.log("冷却完成");
		mask.visible = false;
	}

	j键选择 = new PIXI.Sprite(sheetUI.textures["技能选框.png"]);
	j键选择.position.set(119 + 33, 89 - 10);
	j键选择.visible = false;
	app.stage.addChild(j键选择);
	k键 = new PIXI.AnimatedSprite(sheetUI.animations["k键"]);
	k键.position.set(131 + 33, 90 - 10);
	k键.interactive = true;
	k键.animationSpeed = 0.03;
	//k键.play();
	app.stage.addChild(k键);
	k键mask = keymask(164, 80, k键);

	k键选择 = new PIXI.Sprite(sheetUI.textures["技能选框.png"]);
	k键选择.visible = false;
	k键选择.position.set(130 + 33, 89 - 10);
	app.stage.addChild(k键选择);
	l键 = new PIXI.AnimatedSprite(sheetUI.animations["l键"]);
	l键.position.set(175, 80);
	l键.animationSpeed = 0.03;
	//l键.play();
	l键.interactive = true;
	app.stage.addChild(l键);

	l键mask = keymask(175, 80, l键);

	l键选择 = new PIXI.Sprite(sheetUI.textures["技能选框.png"]);
	l键选择.visible = false;
	l键选择.position.set(174, 79);


	app.stage.addChild(l键选择);
	u键 = new PIXI.AnimatedSprite(sheetUI.animations["u键"]);
	u键.position.set(153, 95);
	u键.interactive = true;
	app.stage.addChild(u键);
	u键mask = keymask(153, 95, u键);
	u键.animationSpeed = 0.03;
	//u键.play();
	u键选择 = new PIXI.Sprite(sheetUI.textures["技能选框.png"]);
	u键选择.visible = false;
	u键选择.position.set(152, 89 + 5);
	app.stage.addChild(u键选择);
	i键 = new PIXI.AnimatedSprite(sheetUI.animations["i键"]);
	i键.position.set(164, 95);
	i键.interactive = true;
	app.stage.addChild(i键);
	i键.animationSpeed = 0.03;
	//i键.play();
	i键mask = keymask(164, 95, i键);

	i键选择 = new PIXI.Sprite(sheetUI.textures["技能选框.png"]);
	i键选择.visible = false;
	i键选择.position.set(163, 89 + 5);
	app.stage.addChild(i键选择);

	o键 = new PIXI.AnimatedSprite(sheetUI.animations["o键"]);
	o键.position.set(175, 90 + 5);
	o键.buttonMode = true;
	o键.interactive = true;
	//o键.on('pointerdown', opress).on('pointerup', oup);
	o键.animationSpeed = 0.03;
	//o键.play();
	app.stage.addChild(o键);
	o键mask = keymask(175, 95, o键);

	o键选择 = new PIXI.Sprite(sheetUI.textures["技能选框.png"]);
	o键选择.visible = false;
	o键选择.position.set(174, 89);
	app.stage.addChild(o键选择);




	background = new PIXI.Sprite(PIXI.Loader.shared.resources["./sprite/bigmap.png"].texture);
	mystage.addChild(background);
	paizi = new PIXI.Sprite(PIXI.Loader.shared.resources["./sprite/ban.png"].texture);
	paizi.scale.set(0.025, 0.025);
	paizi.position.set(1328, 60);
	边框 = new PIXI.Sprite(PIXI.Loader.shared.resources["./sprite/screenround.png"].texture);
	边框.scale.set(0.1, 0.1);
	app.stage.addChild(边框);
	mystage.addChild(paizi);
	colum = new PIXI.Sprite(PIXI.Loader.shared.resources["./sprite/colum.png"].texture);
	colum.position.set(867, -1);
	mystage.addChild(colum);
	colum.zIndex = 10;
	light = new PIXI.Sprite(PIXI.Loader.shared.resources["./sprite/light.png"].texture);
	light.position.set(1081.6, 65.9);
	light.scale.set(0.1, 0.1);
	mystage.addChild(light);
	langan = new PIXI.Sprite(sheetUI.textures["langan.png"]);
	langan.position.set(666, 80);
	langan.zIndex = 10;
	mystage.addChild(langan);
	mystage.sortableChildren = true;

	let enter = keyboard(13);
	enter.press = () => {
		toggleFullScreen();
	}

	left = keyboard(65),
		up = keyboard(119),
		right = keyboard(68),
		down = keyboard(115),
		j = keyboard(74),
		k = keyboard(75),
		l = keyboard(76),
		u = keyboard(85),
		i = keyboard(73),
		o = keyboard(79);


	//---------------------------------切换角色ui
	uihuanren = new PIXI.Container();
	app.stage.addChild(uihuanren);
	uihuanren.position.set(155, 110);
	headbar = new PIXI.Sprite(PIXI.Loader.shared.resources["./sprite/headbar.png"].texture);
	选择栏 = new PIXI.Sprite(PIXI.Loader.shared.resources["./sprite/choosebar.png"].texture);
	选择栏.position.set(-1, -1);
	uihuanren.addChild(headbar);
	uihuanren.addChild(选择栏);

	o.press = () => {
		xyw();
		console.log("换人模式");
		charm.slide(uihuanren, uihuanren.x, 90, 5);
		right.press = () => {
			charm.slide(选择栏, 12, 选择栏.y, 5);
			//人选 = 1;
		}
		left.press = () => {
			charm.slide(选择栏, -1, 选择栏.y, 5);
			//人选 = 0;
		}
	}
	o键.pointerdown = o.press;
	o.release = () => {
		console.log("换人完毕" + 人选);
		charm.slide(uihuanren, uihuanren.x, 110, 5);
		ketsetup();
	}
	o键.pointerup = o.release;

	//----------------------------------------------------------血量
	血 = new PIXI.Container();
	血.position.set(5, 5);
	血.value = 6;

	血1 = new PIXI.AnimatedSprite(sheetUI.animations["血"]); //--0
	血1.position.set(0, 0);
	血.addChild(血1);

	血2 = new PIXI.AnimatedSprite(sheetUI.animations["血"]); //--0
	血2.position.set(7, 0);
	血.addChild(血2);

	血3 = new PIXI.AnimatedSprite(sheetUI.animations["血"]); //--0
	血3.position.set(14, 0);
	血.addChild(血3);

	app.stage.addChild(血);


	血.change = function (number) {
		血.value += number;
		if (number < 0) {
			//monkey.tint = 0xff0000;
			//setTimeout(() => { monkey.tint = 0x000000 }, 1000);
		}
	}

	血.redraw = function () { //用于血量刷新后重制血量
		k = 血.value % 2;
		m = Math.floor(血.value / 2);
		for (o = 0; o <= 2; o++) {
			if (o < m) {
				血.children[o].gotoAndStop(0);
			} else {
				血.children[o].gotoAndStop(2);
			}
		}
		if (k == 1) {
			血.children[m].gotoAndStop(1);
		}
	}


	//---怪物设定

	// enemy.push(new bin(sheet3, 160));
	// enemy.push(new shanzei(sheet2, 160));
	// enemy.push(new gongbin(sheet3, 160));
	// enemy.push(new fubin(sheet3, 160));
	// enemy.push(new huoba(sheet3, 160));

	// player = new wukong(sheet, 160);
	// player.keysetup();


	ajiaotou = new jiaotou(sheet4, 130);
	beenimy(ajiaotou);

	ashanzei = new shanzei(sheet2, 170);
	beplayer(ashanzei);

	awukong = new wukong(sheet, 100);
	beenimy(awukong);

	abin = new bin(sheet3, 250);
	beenimy(abin);

	afubin = new fubin(sheet3, 150);
	beenimy(afubin);

	agongbin = new gongbin(sheet3, 100);
	beenimy(agongbin);

	ahuoba = new huoba(sheet3, 120);
	beenimy(ahuoba);

	ketsetup();

	//app.ticker.add(delta => gameLoop(delta));

	app.ticker.stop();//先把他停止，确保用的是tweenmax
	TweenMax.ticker.addEventListener('tick', play1);//再用tweenmax作为动画,好处是可以更改挂载的函数的执行顺序。
	//TweenMax.ticker.removeEventListener("tick", play1);

}
function gameLoop(delta) {
	state(delta);
}

function xyw() {//这个有点问题，人物切换的时候没有

	team.敌人.push(player);
	team.玩家.splice(0, 1);//只当玩家只有一个。
	beenimy(player);
	beplayer(team.敌人[0]);

	team.敌人.splice(0, 1);
	ketsetup();
}
function removediren(a, b) {//a:名称b:team.敌人/玩家/野怪
	for (i = 0; i < b.length; i++) {
		if (a === b[i]) {
			console.log("找到了！");
			b.splice(i, 1);
		}
	}
}
function beplayer(a) {
	a.teamid = "玩家";
	player = a;
	team.玩家.push(a);
	a.isplayer = true;
	a.ocpsetup();
}
function beenimy(a) {
	a.teamid = "敌人";
	team.敌人.push(a);
	a.isplayer = false;
	a.ocpsetup();
}

function play1() {
	app.ticker.update();//这个是因为上面停了，要开启。
	charm.update();//看来这个库只能做简单的动画，且不能和其他的混用，我要考用vx，vy写动画。

	agongbin.walk();
	ajiaotou.walk();
	awukong.walk();
	ashanzei.walk();
	abin.walk();
	afubin.walk();
	ahuoba.walk();

	team.玩家.forEach(element => {
		element.玩家attackupdate();
	});
	team.敌人.forEach(element => {
		element.敌人attackupdate();
	});
	team.野怪.forEach(element => {
		element.野怪attackupdate();
	});

	team.玩家飞行道具.forEach(element => {
		element.玩家飞行道具attackupdate();
		element.walk();
	});
	team.敌人飞行道具.forEach(element => {//用的是敌人攻击方式，不是敌人飞行道具攻击方式，所以不会消失。
		element.敌人飞行道具attackupdate();
		element.walk();
	});
	team.野怪飞行道具.forEach(element => {
		element.野怪飞行道具attackupdate();
		element.walk();
	});

	//awukong.findsb();
	//console.log(ashanzei.dude.y)
	// for (i in enemy) {
	// 	enemy[i].wolk();
	// 	enemy[i].attack();
	// }

	mystage.x = 80 - player.dude.x;

	//----------------------------------------------------------------------------------gameloop play1到此结束
}

function huanren(a) {
	//app.ticker.stop();//整个游戏停止
	let temposition = player.dude.x;
	let leftable = player.左站.visible;
	console.log(player.dude.x);
	switch (a) {
		case 0:
			console.log("变成猴子！");
			player.destroy();
			player = null;
			player = new wukong(sheet, temposition);
			player.keysetup();
			if (leftable) {
				player.animationstate(1);
			} else {
				player.animationstate(0);
			}

			break;
		case 1:
			console.log("变成狼！");
			player.destroy();
			player = null;
			player = new jiaotou(sheet4, temposition);
			player.keysetup();
			if (leftable) {
				player.animationstate(0);
			} else {
				player.animationstate(1);
			}
			break;
		case 2:

			break;
	}
}

function animationstate(character, state) { //除了state都消失。
	let a = character.children.length;
	for (let i = 0; i < a - 1; i++) {
		if (i == state) {
			character.children[i].visible = true;
		} else {
			character.children[i].visible = false;
		}
	}
}


//The `keyboard` helper function
function keyboard(keyCode) {
	//key类
	var key = {};
	key.code = keyCode;
	key.isDown = false;
	key.isUp = true;
	key.press = undefined;
	key.release = undefined;

	//The `downHandler`
	key.downHandler = event => {
		if (event.keyCode === key.code) {
			if (key.isUp && key.press) key.press();
			key.isDown = true;
			key.isUp = false;
		}
		event.preventDefault();
	};

	//The `upHandler`
	key.upHandler = event => {
		if (event.keyCode === key.code) {
			if (key.isDown && key.release) key.release();
			key.isDown = false;
			key.isUp = true;
		}
		event.preventDefault();
	};

	//Attach event listeners
	document.addEventListener(
		"keydown", key.downHandler.bind(key), false
	);
	window.addEventListener(
		"keyup", key.upHandler.bind(key), false
	);
	return key;
}

function hitTestRectangle(r1, r2) {

	//Define the variables we'll need to calculate
	let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

	//hit will determine whether there's a collision
	hit = false;

	//Find the center points of each sprite
	r1.centerX = r1.getGlobalPosition().x + r1.width / 2;
	r1.centerY = r1.getGlobalPosition().y + r1.height / 2;
	r2.centerX = r2.getGlobalPosition().x + r2.width / 2;
	r2.centerY = r2.getGlobalPosition().y + r2.height / 2;

	//Find the half-widths and half-heights of each sprite
	r1.halfWidth = r1.width / 2;
	r1.halfHeight = r1.height / 2;
	r2.halfWidth = r2.width / 2;
	r2.halfHeight = r2.height / 2;

	//Calculate the distance vector between the sprites
	vx = r1.centerX - r2.centerX;
	vy = r1.centerY - r2.centerY;

	//Figure out the combined half-widths and half-heights
	combinedHalfWidths = r1.halfWidth + r2.halfWidth;
	combinedHalfHeights = r1.halfHeight + r2.halfHeight;

	//Check for a collision on the x axis
	if (Math.abs(vx) < combinedHalfWidths) {

		//A collision might be occuring. Check for a collision on the y axis
		if (Math.abs(vy) < combinedHalfHeights) {

			//There's definitely a collision happening
			hit = true;
		} else {

			//There's no collision on the y axis
			hit = false;
		}
	} else {

		//There's no collision on the x axis
		hit = false;
	}

	//`hit` will be either `true` or `false`
	return hit;




};

function toggleFullScreen() {
	if (!document.fullscreenElement) {
		my_view.requestFullscreen();
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		}
	}
}

function keymaskplay(time, mask, key) {
	console.log("keyolay");
	mask.visible = true;
	key.visible = false;
	mask.m_time = setInterval(() => {
		mask.gotoAndStop(mask.currentFrame + 1);
	}, (time) * 1000 / 9);//1000/9	
	setTimeout(() => { clearInterval(mask.m_time); mask.visible = false; key.visible = true; }, time * 1000);

}