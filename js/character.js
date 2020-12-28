/**
  * 人物的结构：
  * 人物的移动有两种形式，一种是需要每帧计算的判断移动，一种是攻击时产生的动作移动。
  * 人物的所有动画放在dude中，其他东西，血量，碰撞体积，均放在otherthing中。其中第一个是碰撞体积。（collition）
  * 人物的碰撞体积，均可以从currentcollition获得，方便进行统一判断。
  * 人物的攻击，均由动作给出攻击机会，再每帧判断。
  * 
  * destroy要在charm之后，否则会报错。需要一个setTimeout。
  * 
  * 所有定时器和charm之前都要做一次生命值判断。
  * 
  * 
  * 
  * team是一个json，存储了活着的所有角色。
  * 
  * 当角色开始攻击的时候，他会遍历team，寻找其他阵营的最近的一个目标，并设为攻击目标，若无攻击目标则原地待机。
  * 
  * 针对攻击目标，有接近，远离，两种选项是必须的。
  * 
  * 每个怪的实例都可以更改其team，再将其push进team。
  * 
  */
let motion = {
    "左站": 0, "右站": 1,
    "左走": 2, "右走": 3,
    "左跳": 4, "右跳": 5,
    "左痛": 6, "右痛": 7,
    "左死": 8, "右死": 9,
    "左j": 10, "右j": 11,
    "左l": 12, "右l": 13,
    "左u": 14, "右u": 15,
    "左i": 16, "右i": 17,
    "左j_": 18, "右j_": 19,
    "左l_": 20, "右l_": 21,
    "左u_": 22, "右u_": 23,
    "左i_": 24, "右i_": 25
}
class charactor {
    constructor() {
        this.behavior = false;
        this.behavioristimeout = false;//
        this.isplayer = false;//设为玩家的那个为true,用于扣血的时候，经过判断，将血量传到左上角红心上。
        this.teamid = "野怪";
        this.种类 = "暂无";
        this.站立摩擦x = 0.2;//攻击动作做完了会用这个摩擦力。
        this.摩擦x = 0.02;//当前的
        this.跳跃速度 = -5;
        this.走路速度 = 1.2;
        this.vx = 0;
        this.vy = 0;
        this.ltimeout;
        this.nowstade = 0;//初始化为左站。
    }

    removefromteam() {//在死后，将死亡的角色移除出数组。
        function removefromarray(a) {
            a.forEach((current, index, arr) => {
                if (this == current) {
                    a.splice(index, 1);
                }
            });
        }
        switch (this.teamid) {
            case "玩家":
                removefromarray(team.玩家);
                break;
            case "敌人":
                removefromarray(team.敌人);
                break;
            case "野怪":
                removefromarray(team.野怪);
                break;
        }
    }

    doharm(a) {//根据技能参数改变角色状态
        if (this.当前生命 > 0) {
            console.log(a);
            this.vx = a.vx;
            this.vy = a.vy;
            this.changehp(this, a);
        }
    }

    moveto() {
        setInterval(() => {
            console.log("找人打");
        }, 2000);
    }

    calculatedist(a, b) {//计算两个角色的距离。。。返回一个值。
        let number = a.dude.x - b.dude.x;
        let absnumber = Math.abs(number);
        return {
            number: number,//相对值
            abs: absnumber//绝对值
        }
    }
    moseCloseDude(a, d) {//a:一个team.敌人 或其他  d:dindsb中的distance
        a.forEach(element => {
            let newdist = this.calculatedist(this, element);
            if (newdist.abs < d.abs) {
                d = newdist;
            }
        });
    }

    findsb() {//寻找另外两方中绝对值最小的一个目标，作为攻击对象。
        switch (this.teamid) {
            case "玩家": {
                if (team.敌人[0]) {
                    let distance = this.calculatedist(this, team.敌人[0]);
                    this.moseCloseDude(team.敌人, distance);
                    this.moseCloseDude(team.野怪, distance);
                    return distance;
                }
                else if (team.野怪[0]) {
                    let distance = this.calculatedist(this, team.野怪[0]);
                    this.moseCloseDude(team.野怪, distance);
                    return distance;
                }
                break;
            }
            case "敌人": {
                if (team.玩家[0]) {
                    let distance = this.calculatedist(this, team.玩家[0]);
                    this.moseCloseDude(team.玩家, distance);
                    this.moseCloseDude(team.野怪, distance);
                    return distance;
                }
                else if (team.野怪[0]) {
                    let distance = this.calculatedist(this, team.野怪[0]);
                    this.moseCloseDude(team.野怪, distance);
                    return distance;
                }
                break;
            }
            case "野怪": {
                if (team.敌人[0]) {
                    let distance = this.calculatedist(this, team.敌人[0]);
                    this.moseCloseDude(team.敌人, distance);
                    this.moseCloseDude(team.野怪, distance);
                    return distance;
                }
                else if (team.玩家[0]) {
                    let distance = this.calculatedist(this, team.玩家[0]);
                    this.moseCloseDude(team.玩家, distance);
                    return distance;
                }
                break;
            }
        }
    }
    /**
      * 
      * @param {number} x 
      * @param {number} y 
      * @param {number} w 
      * @param {number} h 
      * @param {boolean} visible 
      * @param {*} alpha
      * @param {*} color 
      * @param {*} parent 父级
      */
    addrect(x, y, w, h, visible, color, alpha, parent) {
        let a;
        a = new PIXI.Graphics();
        a.alpha = alpha;
        a.beginFill(color);
        a.position.set(x, y);
        a.drawRect(0, 0, w, h);
        a.visible = visible;
        parent.addChild(a);
        return a;
    }
    /**
     * 
     * @param {number} a 血位置x
     * @param {number} b 血位置y
     * @param {number} c 血上限
     */
    xuae(a, b, c) {
        this.血x = a;
        this.血y = b;
        this.红血 = this.addrect(a, b, c, 1, true, 0xff0000, 1, this.otherthing);//--------------------s_血,血上限    11
        this.绿血 = this.addrect(a, b, c, 1, true, 0x00ff00, 1, this.otherthing);//--------------------s_绿血,现有血量    12
        this.生命上限 = c;
        this.当前生命 = c;
    }
    /**
     * 
     * @param {*} a 传入一个伤害参数。以后要根据参数来变。
     */
    changehp(character, a) {//死亡放在受伤播放之后更好，这里只改血量。
        function tong() {
            if (a.from === "r") {//直接痛是不对的。
                character.ny(motion.右痛);
            }
            else {
                character.ny(motion.左痛);
            }

            character.当前生命 += a.hp;
            character.绿血.clear();
            character.绿血.beginFill(0x00ff00);
            character.绿血.position.set(character.血x, character.血y);
            character.绿血.drawRect(0, 0, character.当前生命, 1);
            if (character.当前生命 <= 0) {
                character.当前生命 = 0;
                character.红血.clear();
                character.绿血.clear();
                if (character.behavior != false) {//首先要确认有没有behavior
                    if (character.behavioristimeout) {
                        clearTimeout(character.behavior);
                    }
                    else {
                        clearInterval(character.behavior);
                    }

                }
            }
        }
        console.log(this.nowstade);
        if (this.当前生命 > 0) {
            switch (this.nowstade) {
                case motion.右站:
                case motion.左站:
                case motion.右跳:
                case motion.左跳:
                case motion.左走:
                case motion.右走:
                    console.log("本来在站/走");
                    tong();
                    break;
                case motion.左l:
                case motion.右l:
                    break;
                case motion.左j:
                    this.左j.gotoAndStop(0);
                    tong();
                    break;
                case motion.右j:
                    this.右j.gotoAndStop(0);
                    tong();
                    break;
                case motion.左u:
                    this.左u.gotoAndStop(0);
                    tong();
                    break;
                case motion.右u:
                    this.右u.gotoAndStop(0);
                    tong();
                    break;
                case motion.左j_:
                    this.左j_.gotoAndStop(0);
                    tong();
                    break;
                case motion.右j_:
                    this.右j_.gotoAndStop(0);
                    tong();
                    break;

            }

        }
    }
    walk() {
        this.dude.x += this.vx;
        this.dude.y += this.vy;
        // mystage.x = 80 - this.dude.x;
        if (this.dude.x > 1328) {//右空气墙
            this.dude.x = 1328;
        }
        if (this.dude.x < 82) {//左空气墙
            this.dude.x = 82;
        }


        this.vy += 0.2;//重力还是要有的

        if (this.dude.getGlobalPosition().y > 86) {//支持力还是要的
            if (Math.abs(this.vy) < 1) {
                this.vy = 0;
            }
            this.vy *= -0.3;
            this.dude.y = 86;
        }



        if (Math.abs(this.vx) < 0.1) {
            this.vx = 0;
        }
        else if (this.vx > 0) {
            this.vx -= this.摩擦x;
        }
        else {
            this.vx += this.摩擦x;
        }

    }


    ocpsetup() {//只在设定了队伍之后执行一次。//技能使用完可以在此冷却。//这个要重写，变成继承式的。
        if (this.右跳) {
            if (this.isplayer) {
                this.右跳.onComplete = () => {
                    this.右跳.gotoAndStop(0);//让动作归零。
                    this.右放完技能衔接走位forplayer();//如果是玩家，则需要衔接走位。
                }
                this.左跳.onComplete = () => {
                    this.左跳.gotoAndStop(0);
                    this.左放完技能衔接走位forplayer();//如果是玩家，则需要衔接走位。
                }
            }
            else {
                this.右跳.onComplete = () => {
                    this.ny(motion.右站);
                    this.摩擦x = this.站立摩擦x;
                    this.右跳.gotoAndStop(0);
                }
                this.左跳.onComplete = () => {
                    this.ny(motion.左站);
                    this.摩擦x = this.站立摩擦x;
                    this.左跳.gotoAndStop(0);
                }
            }
        }
        if (this.左j) {
            if (this.isplayer) {
                this.左j.onComplete = () => {
                    this.左j.gotoAndStop(0);
                    this.左放完技能衔接走位forplayer();
                    this.用完技能后cd(this.技能.j);
                    this.on左jComplete();
                }
                this.右j.onComplete = () => {
                    this.右j.gotoAndStop(0);
                    this.右放完技能衔接走位forplayer();
                    this.用完技能后cd(this.技能.j);
                    this.on右jComplete();
                }
            }
            else {
                this.左j.onComplete = () => {
                    this.左j.gotoAndStop(0);
                    this.ny(motion.左站);
                    this.vx = 0;
                    this.用完技能后cd(this.技能.j);
                    this.on左jComplete();
                }
                this.右j.onComplete = () => {
                    this.右j.gotoAndStop(0);
                    this.ny(motion.右站);
                    this.vx = 0;
                    this.用完技能后cd(this.技能.j);
                    this.on右jComplete();
                }
            }
        }
        if (this.右u) {
            if (this.isplayer) {
                this.右u.onComplete = () => {
                    this.右u.gotoAndStop(0);
                    this.右放完技能衔接走位forplayer();
                    this.用完技能后cd(this.技能.u);
                    this.on右uComplete();
                }
                this.左u.onComplete = () => {
                    this.左u.gotoAndStop(0);
                    this.左放完技能衔接走位forplayer();
                    this.用完技能后cd(this.技能.u);
                    this.on左uComplete();
                }
            }
            else {
                this.右u.onComplete = () => {
                    this.ny(motion.右站);
                    this.vx = 0;
                    this.右u.gotoAndStop(0);
                    this.用完技能后cd(this.技能.u);
                    this.on右uComplete();
                }
                this.左u.onComplete = () => {
                    this.ny(motion.左站);
                    this.vx = 0;
                    this.左u.gotoAndStop(0);
                    this.用完技能后cd(this.技能.u);
                    this.on左uComplete();
                }
            }
        }
        if (this.左l) {
            if (this.isplayer) {
                this.左l.onComplete = () => {
                    this.左l.gotoAndStop(0);
                    this.左放完技能衔接走位forplayer();
                    this.用完技能后cd(this.技能.l);
                    this.on左lComplete();
                }
                this.右l.onComplete = () => {
                    this.右l.gotoAndStop(0);
                    this.右放完技能衔接走位forplayer();
                    this.用完技能后cd(this.技能.l);
                    this.on右lComplete();
                }
            }
            else {
                this.左l.onComplete = () => {
                    this.左l.gotoAndStop(0);
                    this.用完技能后cd(this.技能.l);
                    this.ny(motion.左站);
                }
                this.右lonComplete = () => {
                    this.右l.gotoAndStop(0);
                    this.用完技能后cd(this.技能.l);
                    this.ny(motion.右站);
                }
            }
        }
        if (this.左j_) {
            if (this.isplayer) {
                this.左j_.onComplete = () => {
                    this.左j_.gotoAndStop(0);
                    this.左放完技能衔接走位forplayer();
                    this.用完技能后cd(this.技能.j_);
                    this.on左j_Complete();
                }
                this.右j_.onComplete = () => {
                    this.右j_.gotoAndStop(0);
                    this.右放完技能衔接走位forplayer();
                    this.用完技能后cd(this.技能.j_);
                    this.on右j_Complete();
                }
            }
            else {
                this.左j_.onComplete = () => {
                    this.左j_.gotoAndStop(0);
                    this.ny(motion.左站);
                    this.用完技能后cd(this.技能.j_);
                    this.on左j_Complete();
                }
                this.右j_.onComplete = () => {
                    this.右j_.gotoAndStop(0);
                    this.ny(motion.右站);
                    this.用完技能后cd(this.技能.j_);//技能cd时间
                    this.on右j_Complete();
                }
            }
        }
    }
    左放完技能衔接走位forplayer() {//和ocpsetup一起用的，用于玩家攻击之后衔接走路
        console.log("左放完技能衔接走位调用");
        if (left.isDown) {
            this.摩擦x = 0;
            this.ny(motion.左走);
            this.vx = -1 * this.走路速度;
        }
        else if (right.isDown) {
            this.摩擦x = 0;
            this.ny(motion.右走);
            this.vx = this.走路速度;
        }
        else {
            this.ny(motion.左站);
            this.摩擦x = this.站立摩擦x;
            //this.vx = 0;
        }
    }
    右放完技能衔接走位forplayer() {//和ocpsetup一起用的，用于玩家攻击之后衔接走路
        if (left.isDown) {
            this.摩擦x = 0;
            this.ny(motion.左走);
            this.vx = -1 * this.走路速度;
        }
        else if (right.isDown) {
            this.摩擦x = 0;
            this.ny(motion.右走);
            this.vx = this.走路速度;
        }
        else {
            this.ny(motion.右站);
            this.摩擦x = this.站立摩擦x;
            //this.vx = 0;
        }
    }

    用完技能后cd(a) {//a : this.技能.j_
        a.iscd = false;
        setTimeout(() => {
            a.iscd = true;
            console.log(a.cd + "  s");
        }, a.cd * 1000);
    }

    改变动作(a) {
        this.dude.children[this.nowstade].visible = false;//先隐藏当前动作，
        this.dude.children[a].visible = true;//再显示新的动作。
        this.nowstade = a;//再改状态为新的动作。
    }
    ny(a) {//此处判断是否执行吗？判断。这就是状态机。在这里处理stop和play是对的。
        switch (a) {//再播放新的动作。动作的速度处理和摩擦力可以在这执行，走路的时候没有摩擦力，其他时候要加上摩擦力。
            case motion.左站:
                this.摩擦x = this.站立摩擦x;
                this.改变动作(a);
                break;
            case motion.右站:
                this.摩擦x = this.站立摩擦x;
                this.改变动作(a);
                break;
            case motion.左走:
                this.vx = -this.走路速度;
                this.摩擦x = 0;
                this.改变动作(a);
                break;
            case motion.右走:
                this.vx = this.走路速度;
                this.摩擦x = 0;
                this.改变动作(a);
                break;
            case motion.左跳:
                if (this.dude.y > 84) {
                    this.摩擦x = 0;
                    this.vy = this.跳跃速度;
                }
                this.改变动作(a);
                this.左跳.play();
                break;
            case motion.右跳:
                if (this.dude.y > 84) {
                    this.摩擦x = 0;
                    this.vy = this.跳跃速度;
                }
                this.改变动作(a);
                this.右跳.play();
                break;
            case motion.左痛://痛完继续走路啊！
                this.改变动作(a);
                this.摩擦x = 0;
                setTimeout(() => {

                    if (this.isplayer) {
                        this.左放完技能衔接走位forplayer();
                    }
                    else {
                        this.ny(0);
                    }
                    console.log("痛完！");
                    if (this.当前生命 <= 0) {
                        this.ny(motion.右死);
                    }
                }, 200);
                break;//agongbin.automove();
            case motion.右痛:
                this.改变动作(a);
                this.摩擦x = 0;
                setTimeout(() => {

                    if (this.isplayer) {
                        this.右放完技能衔接走位forplayer();
                    }
                    else {
                        this.ny(1);
                    }
                    if (this.当前生命 <= 0) {
                        this.ny(motion.左死);

                    }
                }, 200);
                break;
            case motion.左死:
                this.removefromteam();
                this.左死.play();
                this.改变动作(a);
                break;
            case motion.右死:
                this.removefromteam();
                this.右死.play();
                this.改变动作(a);
                break;
            case motion.左j:
                if (this.技能.j.iscd) {
                    this.左j.play();
                    this.on左jBegin();
                    this.改变动作(a);
                }
                break;
            case motion.右j:
                if (this.技能.j.iscd) {
                    this.右j.play();
                    this.on右jBegin();//用于处理动作开始。
                    this.改变动作(a);
                }
                break;
            case motion.左l:
                if (this.技能.l.iscd) {
                    this.on左lBegin();//用于处理动作开始。
                    this.改变动作(a);
                }
                break;
            case motion.右l:
                if (this.技能.l.iscd) {
                    this.on右lBegin();//用于处理动作开始。
                    this.改变动作(a);
                }
                break;
            case motion.左u:
                if (this.技能.u.iscd) {
                    this.on左uBegin();
                    this.左u.play();
                    this.改变动作(a);
                }
                break;
            case motion.右u:
                if (this.技能.u.iscd) {
                    this.on右uBegin();
                    this.右u.play();
                    this.改变动作(a);
                }
                break;
            case motion.左i:
                if (this.技能.i.iscd) {
                    this.左i.onBegin();
                    this.改变动作(a);
                }
                break;
            case motion.右i:
                if (this.技能.i.iscd) {
                    this.右i.onBegin();
                    this.改变动作(a);
                }
                break;
            case motion.左j_:
                if (this.技能.j_.iscd) {
                    this.on左j_Begin();
                    this.左j_.play();
                    this.改变动作(a);
                }
                break;
            case motion.右j_:
                if (this.技能.j_.iscd) {
                    this.on右j_Begin();
                    this.右j_.play();
                    this.改变动作(a);
                }
                break;
            case motion.左l_:
                if (this.技能.l_.iscd) {
                    this.改变动作(a);
                }
                break;
            case motion.右l_:
                if (this.技能.l_.iscd) {
                    this.改变动作(a);
                }
                break;
            case motion.左u_:
                if (this.技能.u_.iscd) {
                    this.改变动作(a);
                }
                break;
            case motion.右u_:
                if (this.技能.u_.iscd) {
                    this.改变动作(a);
                }
                break;
            case motion.左i_:
                if (this.技能.i_.iscd) {
                    this.改变动作(a);
                }
                break;
            case motion.右i_:
                if (this.技能.i_.iscd) {
                    this.改变动作(a);
                }
                break;
        }
    }
  
    //hitTestRectangle(,);

    玩家attackupdate() {
        this.attackupdate(team.敌人, team.野怪);
    }
    敌人attackupdate() {
        this.attackupdate(team.玩家, team.野怪);
    }
    野怪attackupdate() {
        this.attackupdate(team.敌人, team.玩家);
    }

    野怪飞行道具attackupdate() {
        this.attackupdate2(team.敌人, team.玩家);

    }

    敌人飞行道具attackupdate() {
        this.attackupdate2(team.玩家, team.野怪);

    }
    玩家飞行道具attackupdate() {
        this.attackupdate2(team.敌人, team.野怪);

    }

    attackupdate2(a, b) {//飞行道具专用，造成伤害之后会消失。
        this.技能.用于遍历的技能碰撞.forEach(element => {
            if (element.using) {//如果在该技能使用在使用
                console.log("use");
                element.collition.forEach(colli => {//把该技能的所有碰撞体拿出来遍历
                    a.forEach(charac => {
                        if (charac.当前生命 > 0) {
                            if (hitTestRectangle(charac.currentcollition, colli)) {//把所有敌人拿出来遍历
                                //if(element.using){//但是我还要在人那里加一个受伤后的无敌时间。
                                element.using = false;
                                this.dude.visible = false;
                                charac.doharm(element.effect);
                                //}
                            }
                        }
                    });
                });
            }
            if (element.using) {//如果在该技能使用在使用
                element.collition.forEach(colli => {//把该技能所有碰撞体拿出来遍历
                    b.forEach(charac => {
                        if (charac.当前生命 > 0) {
                            console.log(charac.currentcollition);
                            if (hitTestRectangle(charac.currentcollition, colli)) {
                                element.using = false;
                                charac.doharm(element.effect);
                            }
                        }
                    });
                });
            }
        });
    }

    attackupdate(a, b) {
        this.技能.用于遍历的技能碰撞.forEach(element => {
            if (element.using) {//如果在该技能使用在使用
                console.log("use");
                element.collition.forEach(colli => {//把该技能的所有碰撞体拿出来遍历
                    a.forEach(charac => {
                        if (hitTestRectangle(charac.currentcollition, colli)) {//把所有敌人拿出来遍历
                            //if(element.using){//但是我还要在人那里加一个受伤后的无敌时间。
                            element.using = false;//为什么会多个碰撞体会出现攻击多次的情况？
                            charac.doharm(element.effect);
                            //}
                        }
                    });
                });
            }
            if (element.using) {//如果在该技能使用在使用
                element.collition.forEach(colli => {//把该技能所有碰撞体拿出来遍历
                    b.forEach(charac => {
                        console.log(charac.currentcollition);
                        if (hitTestRectangle(charac.currentcollition, colli)) {
                            element.using = false;
                            charac.doharm(element.effect);
                        }
                    });
                });
            }
        });
    }

    /**
        * 
        * @param {string}stringname 切片名称 
        * @param {number}speed 速度 
        * @param {boolean}loopandplay 是否循环并播放
        * @param {boolean}visible 是否可见
        */
    addfromname(sheet, stringname, speed, parent, loopandplay, visible) {
        let a;
        a = new PIXI.AnimatedSprite(sheet.animations[stringname]);
        a.animationSpeed = speed;
        a.updateAnchor = true;
        a.loop = loopandplay;
        if (loopandplay) { a.play(); }
        a.visible = visible;
        parent.addChild(a);
        return a;
    }
}
class jiaotou extends charactor {
    constructor(sheet, x) {
        super();
        this.种类 = "暂无";
        this.摩擦x = 0.02;
        this.跳跃速度 = -4;
        this.走路速度 = 1.2;
        this.dude = new PIXI.Container();
        this.dude.position.set(x, 0);
        mystage.addChild(this.dude);
        this.左站 = super.addfromname(sheet, "z-l", 0.02, this.dude, true, true);//左站0
        this.右站 = super.addfromname(sheet, "z-r", 0.02, this.dude, true, false);//右站1
        this.左走 = super.addfromname(sheet, "左走", 0.15, this.dude, true, false);//左走2
        this.右走 = super.addfromname(sheet, "右走", 0.15, this.dude, true, false);//右走3
        this.左跳 = super.addfromname(sheet, "k-l", 0.05, this.dude, false, false);//左跳4
        this.右跳 = super.addfromname(sheet, "k-r", 0.05, this.dude, false, false);//右跳5
        this.左痛 = new PIXI.Sprite(sheet.textures["教头左被打.png"]);//6
        this.dude.addChild(this.左痛);
        this.左痛.visible = false;

        this.右痛 = new PIXI.Sprite(sheet.textures["教头右被打.png"]);//7
        this.dude.addChild(this.右痛);
        this.右痛.visible = false;

        this.左死 = super.addfromname(sheet, "教头左被打", 0.13, this.dude, false, false);//8
        this.左死.scale.x = -1;

        this.右死 = super.addfromname(sheet, "教头右被打", 0.13, this.dude, false, false);//9

        this.左j = super.addfromname(sheet, "狼教头jl", 0.3, this.dude, false, false);//10
        this.on左jBegin = () => {

        }
        this.左j.onFrameChange = (a) => {
            //this.左j.gotoAndStop(4);
            switch (a) {
                case 2:
                    console.log("j2");
                    this.技能.用于遍历的技能碰撞[this.技能.技能左j1].using = true;
                    break;
                case 4:
                    this.技能.用于遍历的技能碰撞[this.技能.技能左j1].using = false;
                    break;

            }
        }
        this.on左jComplete = () => {
            // this.技能.用于遍历的技能碰撞[this.技能.技能左j1].using = false;
        }
        this.右j = super.addfromname(sheet, "狼教头jr", 0.3, this.dude, false, false);//11
        this.on右jBegin = () => {

        }
        this.右j.onFrameChange = (a) => {
            //this.左j.gotoAndStop(4);
            switch (a) {
                case 2:
                    this.技能.用于遍历的技能碰撞[this.技能.技能右j1].using = true;
                    break;
                case 4:
                    this.技能.用于遍历的技能碰撞[this.技能.技能右j1].using = false;
                    break;

            }
        }
        this.on右jComplete = () => {

        }

        this.左l = new PIXI.Sprite();//12
        this.左l.min_dont_youse = true;
        this.dude.addChild(this.左l);
        this.右l = new PIXI.Sprite();//13
        this.dude.addChild(this.右l);

        this.左u = new PIXI.Sprite();//14
        this.dude.addChild(this.左u);
        this.右u = new PIXI.Sprite();//15
        this.dude.addChild(this.右u);
        this.左i = new PIXI.Sprite();//16
        this.dude.addChild(this.左i);
        this.右i = new PIXI.Sprite();//17
        this.dude.addChild(this.右i);

        this.左u.min_dont_youse = true;


        this.左j_ = super.addfromname(sheet, "j-l", 0.13, this.dude, false, false);//左j——4
        this.on左j_Begin = () => {

        }
        this.左j_.onFrameChange = (a) => {
            switch (a) {
                case 2:
                    this.技能.用于遍历的技能碰撞[this.技能.技能左j_1].using = true;
                    break;
                case 4:
                    this.技能.用于遍历的技能碰撞[this.技能.技能左j_1].using = false;
                    break;

            }
        }
        this.on左j_Complete = () => {

        }
        this.右j_ = super.addfromname(sheet, "j-r", 0.13, this.dude, false, false);//右j——5
        this.on右j_Begin = () => {

        }
        this.右j_.onFrameChange = (a) => {
            switch (a) {
                case 2:
                    this.技能.用于遍历的技能碰撞[this.技能.技能右j_1].using = true;
                    break;
                case 4:
                    this.技能.用于遍历的技能碰撞[this.技能.技能右j_1].using = false;
                    break;

            }
        }
        this.on右j_Complete = () => {

        }
        this.开场演出1 = super.addfromname(sheet, "开场演出", 0.13, this.dude, true, false);//10
        this.开场演出2 = super.addfromname(sheet, "开场演出二", 0.13, this.dude, true, false);//11
        this.开场演出3 = super.addfromname(sheet, "开场演出三", 0.13, this.dude, true, false);//12
        this.开场演出4 = super.addfromname(sheet, "开场演出四", 0.13, this.dude, true, false);//13
        this.otherthing = new PIXI.Container();
        this.dude.addChild(this.otherthing);
        this.collition = super.addrect(-8, -31, 16, 31, false, 0xDE3249, 0.3, this.otherthing);
        this.currentcollition = this.collition;
        this.collition1 = super.addrect(13, -23, 20, 20, false, 0xDE3249, 0.3, this.otherthing);//9
        this.collition2 = super.addrect(-34, -23, 20, 20, false, 0xDE3249, 0.3, this.otherthing);//8
        this.collition3 = super.addrect(-27, -23, 45, 20, false, 0xDE3249, 0.3, this.otherthing);//you
        this.collition4 = super.addrect(-18, -23, 45, 20, false, 0xDE3249, 0.3, this.otherthing);//zuo

        super.xuae(-4, -35, 6);

        //super.ocpsetup();
        this.技能 = {
            j: {
                have: true,
                cd: 2,
                iscd: true,
            },
            j_: {
                have: true,
                cd: 7,
                iscd: true,
            },
            l: {
                have: false,
            },
            u: {
                have: false,
            },
            i: {
                have: false,
            },
            技能左j1: 0,
            技能右j1: 1,
            技能左j_1: 2,
            技能右j_1: 3,
            用于遍历的技能碰撞: [{//反正也没有好方法让判定的时候才判断，不如直接一把嗦来遍历。
                using: false, collition: [this.collition2], effect: { from: 'r', vx: -1, vy: -3, hp: -1 }//左j
            }, {
                using: false, collition: [this.collition1], effect: { from: 'l', vx: 1, vy: -3, hp: -1 }//右j
            }, {
                using: false, collition: [this.collition4], effect: { from: 'r', vx: -1.3, vy: -1, hp: -1 }//右j_
            }, {
                using: false, collition: [this.collition3], effect: { from: 'l', vx: 1.3, vy: -1, hp: -1 }//左j_
            }]
        }
    }
    destroy() {
        this.dude.destroy({ children: true, textures: true, baseTexture: true });
    }
}
class wukong extends charactor {
    constructor(sheet, x) {
        super();
        this.aimdist;

        this.种类 = "猴子";
        this.dude = new PIXI.Container();
        this.dude.position.set(x, 0);
        mystage.addChild(this.dude);
        this.左站 = super.addfromname(sheet, "站", 0.03, this.dude, true, true);//0
        this.左站.width *= -1;
        this.左站.x = -1;
        this.右站 = super.addfromname(sheet, "站", 0.03, this.dude, true, false);//1
        this.左走 = super.addfromname(sheet, "走", 0.1, this.dude, true, false);//2
        this.左走.width *= -1;
        this.左走.x = -1;
        this.右走 = super.addfromname(sheet, "走", 0.1, this.dude, true, false);//3

        this.左跳 = super.addfromname(sheet, "跳", 0.1, this.dude, false, false);//4
        this.左跳.width *= -1;

        this.右跳 = super.addfromname(sheet, "跳", 0.1, this.dude, false, false);//5

        this.左痛 = new PIXI.Sprite(sheet.textures["被打.png"]);//6
        this.dude.addChild(this.左痛);
        this.左痛.visible = false;
        this.左痛.scale.x = -1;

        this.右痛 = new PIXI.Sprite(sheet.textures["被打.png"]);//7
        this.右痛.visible = false;
        this.dude.addChild(this.右痛);

        this.左死 = super.addfromname(sheet, "死亡", 0.2, this.dude, false, false);//8
        this.右死 = super.addfromname(sheet, "死亡", 0.2, this.dude, false, false);//9
        this.右死.scale.x = -1;

        this.左j = super.addfromname(sheet, "j", 0.2, this.dude, false, false);//10
        this.左j.width *= -1;
        this.on左jBegin = () => {
            this.摩擦x = 0;
            this.vx = -1;
            console.log("猴子左j开始");
            console.log(this);
        }
        this.左j.onFrameChange = (a) => {
            switch (a) {
                case 2:
                    console.log("j2");
                    this.技能.用于遍历的技能碰撞[this.技能.技能左j1].using = true;
                    break;
            }
        }
        this.on左jComplete = () => {//这个暂时放这里，最后还是要放到后面。
            this.技能.用于遍历的技能碰撞[this.技能.技能左j1].using = false;
        }

        this.右j = super.addfromname(sheet, "j", 0.2, this.dude, false, false);//11
        this.on右jBegin = () => {
            this.摩擦x = 0;
            this.vx = 1;
        }
        this.右j.onFrameChange = (a) => {
            switch (a) {
                case 2:
                    console.log("j2");
                    this.技能.用于遍历的技能碰撞[this.技能.技能右j1].using = true;
                    break;
            }
        }
        this.on右jComplete = () => {
            this.技能.用于遍历的技能碰撞[this.技能.技能右j1].using = false;
        }

        this.左l = super.addfromname(sheet, "金身", 0.2, this.dude, false, false);
        this.左l.scale.x = -1;
        this.on左lBegin = () => {
            this.用完技能后cd(this.技能.l);
        }
        this.on左lComplete = () => {

        }

        this.右l = super.addfromname(sheet, "金身", 0.2, this.dude, false, false);
        this.on右lBegin = () => {
            this.用完技能后cd(this.技能.l);
        }
        this.on右lComplete = () => {

        }

        this.左u = super.addfromname(sheet, "u", 0.1, this.dude, false, false);
        this.on左uBegin = () => {
            console.log("u");
            this.技能.用于遍历的技能碰撞[this.技能.技能左u1].using = true;
            this.vx = -1.5;
        }
        this.左u.width *= -1;
        this.on左uComplete = () => {
            this.技能.用于遍历的技能碰撞[this.技能.技能左u1].using = false;
        }

        this.右u = super.addfromname(sheet, "u", 0.1, this.dude, false, false);
        this.on右uBegin = () => {
            console.log("u");
            this.技能.用于遍历的技能碰撞[this.技能.技能右u1].using = true;
            this.vx = 1.5;
        }
        this.on右uComplete = () => {
            this.技能.用于遍历的技能碰撞[this.技能.技能右u1].using = false;
        }


        this.左i = new PIXI.Sprite();
        this.dude.addChild(this.左i);
        this.右i = new PIXI.Sprite();
        this.dude.addChild(this.右i);

        this.左j_ = super.addfromname(sheet, "蓄力重击", 0.05, this.dude, false, false);
        this.左j_.width *= -1;
        this.on左j_Begin = () => {
            this.摩擦x = 0.02;
        }
        this.左j_.onFrameChange = (a) => {
            switch (a) {
                case 1:
                    this.vx = -0.5;
                    break;
                case 2:
                    this.vx = -1.5;
                    this.vy = -4;
                    break;
                case 4:
                    this.技能.用于遍历的技能碰撞[this.技能.技能左j_1].using = true;
                    this.vx = -2;
                    this.vy = 4;
                    this.摩擦x = 0.07;
                    break;
            }
        }
        this.on左j_Complete = () => {
            this.技能.用于遍历的技能碰撞[this.技能.技能左j_1].using = false;
        }


        this.右j_ = super.addfromname(sheet, "蓄力重击", 0.05, this.dude, false, false);
        this.on右j_Begin = () => {
            this.摩擦x = 0.02;
        }
        this.右j_.onFrameChange = (a) => {   //0用不到。。
            switch (a) {
                case 1:
                    this.vx = 0.5;
                    break;
                case 2:
                    this.vx = 1.5;
                    this.vy = -4;
                    break;
                case 4:
                    this.技能.用于遍历的技能碰撞[this.技能.技能右j_1].using = true;
                    this.vx = 2;
                    this.vy = 4;
                    this.摩擦x = 0.07;
                    break;
            }
        }
        this.on右j_Complete = () => {
            this.技能.用于遍历的技能碰撞[this.技能.技能右j_1].using = false;
        }
        //#region 猴子体积

        this.otherthing = new PIXI.Container();//所以可以在this.里面找到他，也可以在dude.children里找到他。
        this.dude.addChild(this.otherthing);

        this.collition0 = super.addrect(-9, -29, 17, 28, false, 0xDE3249, 0.3, this.otherthing);//这是本体的0
        this.currentcollition = this.collition0;
        this.collition1 = super.addrect(8.5, -15.5, 15, 5, false, 0xDE3249, 0.3, this.otherthing);//猴子右j1
        this.collition2 = super.addrect(-24.5, -15.5, 15, 5, false, 0xDE3249, 0.3, this.otherthing);//猴子左j2
        this.collition3 = super.addrect(24.5, -15.5, 5, 5, false, 0xDE3249, 0.3, this.otherthing);//猴子右u3
        this.collition4 = super.addrect(-30.5, -15.5, 5, 5, false, 0xDE3249, 0.3, this.otherthing);//猴子左u4
        this.collition5 = super.addrect(14.5, -19, 20, 20, false, 0xDE3249, 0.3, this.otherthing);//猴子右j_5
        this.collition6 = super.addrect(-35, -19, 20, 20, false, 0xDE3249, 0.3, this.otherthing);//猴子左j_6

        //#endregion 猴子体积
        super.xuae(-4, -35, 6);

        this.技能 = {
            j: {
                have: true,
                cd: 0.5,
                iscd: true,
            },
            u: {
                have: true,
                cd: 1.5,
                iscd: true,
            },
            j_: {
                have: true,
                cd: 2,
                iscd: true,
            },
            l: {
                have: true,
                cd: 3,
                iscd: true,
            },
            技能左j1: 0,
            技能右j1: 1,
            技能左u1: 2,
            技能右u1: 3,
            技能左j_1: 4,
            技能右j_1: 5,
            用于遍历的技能碰撞: [{//反正也没有好方法让判定的时候才判断，不如直接一把嗦来遍历。//onbegin/onframechange处变true，onframechange/oncomplete处变false。
                using: false, collition: [this.collition2], effect: { from: 'r', vx: -1.3, vy: -2, hp: -1 }//左j
            }, {
                using: false, collition: [this.collition1], effect: { from: 'l', vx: 1.3, vy: -2, hp: -1 }//右j
            }, {
                using: false, collition: [this.collition4], effect: { from: 'r', vx: -2.3, vy: -1, hp: -1 }//左u
            }, {
                using: false, collition: [this.collition3], effect: { from: 'l', vx: 2.3, vy: -1, hp: -1 }//右u
            }, {
                using: false, collition: [this.collition6], effect: { from: 'r', vx: -2, vy: -2, hp: -1 }//左j_
            }, {
                using: false, collition: [this.collition5], effect: { from: 'l', vx: 2, vy: -2, hp: -1 }//右j_
            }]
        }
        //super.ocpsetup();

    }

    automove(a) {
        console.log(a);
        this.behavior = setInterval(() => {
            this.behavioristimeout = false;
            this.aimdist = this.findsb();
            if (this.aimdist) {
                //    console.log("有人！");
                if (this.aimdist.number < -40) {//右走
                    this.ny(motion.右走);
                }
                else if (this.aimdist.number < -20 && this.技能.j_.iscd) {//右j_
                    clearInterval(this.behavior);
                    this.ny(motion.右j_);
                    this.resetautomove(1000);
                }
                else if (this.aimdist.number < -5 && this.技能.u.iscd) {//右u
                    clearInterval(this.behavior);
                    this.ny(motion.右u);
                    this.resetautomove(1000);
                }
                else if (this.aimdist.number < 0 && this.技能.j.iscd) {//右j
                    clearInterval(this.behavior);
                    this.ny(motion.右j);
                    this.resetautomove(1000);
                }
                else if (this.aimdist.number < 5 && this.技能.j.iscd) {//左j
                    clearInterval(this.behavior);
                    this.ny(motion.左j);
                    this.resetautomove(1000);
                }
                else if (this.aimdist.number < 20 && this.技能.u.iscd) {//左u
                    clearInterval(this.behavior);
                    this.ny(motion.左u);
                    this.resetautomove(1000);
                }
                else if (this.aimdist.number < 40 && this.技能.j_.iscd) {//左j_
                    clearInterval(this.behavior);
                    this.ny(motion.左j_);
                    this.resetautomove(1000);
                }
                else {//左走
                    this.ny(motion.左走);
                }
            }
        }, 1000);
    }
    resetautomove(number) {//自动行动时，技能放完后继续寻找目标攻击。
        this.behavioristimeout = true;
        this.behavior= setTimeout(() => {
            this.automove(this.技能);
           
        }, number);
    }
    destroy() {
        this.dude.destroy({ children: true, textures: true, baseTexture: true });
    }
}
class shanzei extends charactor {
    constructor(sheet, x) {
        super();
        this.种类 = "山贼";
        this.跳跃速度 = -3;
        this.走路速度 = 1;
        this.摩擦x = 0.03;
        this.dude = new PIXI.Container();
        this.dude.position.set(x, 0);
        this.gongjiyou = false;
        this.gongjizuo = false;
        mystage.addChild(this.dude);
        this.攻击机会 = false;//用if和rect来判断猴子扣血
        this.生命值 = 10;
        this.behavior;


        this.左站 = super.addfromname(sheet, "站立", 0.03, this.dude, true, true);//左站1

        this.右站 = super.addfromname(sheet, "站立", 0.03, this.dude, true, false);//右站2
        this.右站.width *= -1;
        this.右站.x = -3;

        this.左走 = super.addfromname(sheet, "小胖走", 0.15, this.dude, true, false);//左站1
        this.左走.x = -3;
        // this.右走 = super.addfromname(sheet,"小胖走", 0.03, this.dude, true, false);//为啥这个就是有bug。。。
        this.右走 = super.addfromname(sheet, "小胖走", 0.15, this.dude, true, false);//左站1
        this.右走.x = 1;
        this.右走.scale.x = -1;


        this.左跳 = super.addfromname(sheet, "站立", 0.1, this.dude, false, false);//左站1

        this.右跳 = super.addfromname(sheet, "站立", 0.1, this.dude, false, false);//右站2
        this.右跳.width *= -1;
        this.右跳.x = -3;

        this.左痛 = new PIXI.Sprite(sheet.textures["小胖走1.png"]);//6
        this.dude.addChild(this.左痛);
        this.左痛.visible = false;


        this.右痛 = new PIXI.Sprite(sheet.textures["小胖走1.png"]);//7
        this.右痛.visible = false;
        this.dude.addChild(this.右痛);
        this.右痛.scale.x = -1;

        this.左死 = super.addfromname(sheet, "小胖死", 0.1, this.dude, false, false);//左站1
        this.左死.width *= -1;
        this.右死 = super.addfromname(sheet, "小胖死", 0.1, this.dude, false, false);//右站2


        this.左j = super.addfromname(sheet, "胖l", 0.1, this.dude, false, false);//左站1
        this.on左jBegin = () => {

        }
        this.左j.onFrameChange = (a) => {
            switch (a) {
                case 1:
                    this.技能.用于遍历的技能碰撞[this.技能.技能左j1].using = true;
                    break;
            }
        }
        this.on左jComplete = () => {
            this.技能.用于遍历的技能碰撞[this.技能.技能左j1].using = false;
        }
        this.右j = super.addfromname(sheet, "胖l", 0.1, this.dude, false, false);//右站2
        this.右j.width *= -1;
        this.on右jBegin = () => {

        }
        this.右j.onFrameChange = (a) => {
            switch (a) {
                case 1:
                    this.技能.用于遍历的技能碰撞[this.技能.技能右j1].using = true;
                    break;
            }
        }
        this.on右jComplete = () => {
            this.技能.用于遍历的技能碰撞[this.技能.技能右j1].using = false;
        }

        this.左l = new PIXI.Sprite();
        this.dude.addChild(this.左l);
        this.左l.min_dont_youse = true;
        this.右l = new PIXI.Sprite();
        this.dude.addChild(this.右l);

        this.左u = super.addfromname(sheet, "攻击", 0.1, this.dude, false, false);//攻击左3
        this.on左uBegin = () => {
            this.技能.用于遍历的技能碰撞[this.技能.技能左u1].using = true;
            this.vx=2;
            this.vy=-2;
        }
        this.左u.onFrameChange = (a) => {
            if (this.生命值 > 0) {
                this.攻击机会 = true;
                switch (a) {
                    case 2:
                        this.技能.用于遍历的技能碰撞[this.技能.技能左u1].using = false;
                        this.技能.用于遍历的技能碰撞[this.技能.技能左u2].using = true;
                        break;
                    case 3:
                        this.技能.用于遍历的技能碰撞[this.技能.技能左u2].using = false;
                        this.技能.用于遍历的技能碰撞[this.技能.技能左u3].using = true;
                        this.vx=-4;
                        break;
                    case 5:
                        this.技能.用于遍历的技能碰撞[this.技能.技能左u3].using = false;
                        this.技能.用于遍历的技能碰撞[this.技能.技能左u4].using = true;
                        this.vx=-2;
                        break;
                }
            }

        }
        this.on左uComplete = () => {
            this.技能.用于遍历的技能碰撞[this.技能.技能左u4].using = false;
        }


        this.右u = super.addfromname(sheet, "攻击", 0.1, this.dude, false, false);//右攻击4
        this.右u.width *= -1;
        this.右u.x = -6;
        this.on右uBegin = () => {
            this.技能.用于遍历的技能碰撞[this.技能.技能右u1].using = true;
            this.vx=-2;
            this.vy=-2;
        }
        this.右u.onFrameChange = (a) => {
            if (this.生命值 > 0) {
                this.攻击机会 = true;
                switch (a) {
                    case 2:
                        this.技能.用于遍历的技能碰撞[this.技能.技能右u1].using = false;
                        this.技能.用于遍历的技能碰撞[this.技能.技能右u2].using = true;
       
                        break;
                    case 3:
                        this.技能.用于遍历的技能碰撞[this.技能.技能右u2].using = false;
                        this.技能.用于遍历的技能碰撞[this.技能.技能右u3].using = true;
                        this.vx=4;
                        break;
                    case 5:
                        this.技能.用于遍历的技能碰撞[this.技能.技能右u3].using = false;
                        this.技能.用于遍历的技能碰撞[this.技能.技能右u4].using = true;
                        this.vx=2;
                        break;
                }
            }
        }
        this.on右uComplete = () => {
            this.技能.用于遍历的技能碰撞[this.技能.技能右u4].using = false;
        }

        this.休息 = super.addfromname(sheet, "休息", 0.03, this.dude, false, false);//休息0
        this.休息.onComplete = () => {
        }

        this.otherthing = new PIXI.Container();
        this.otherthing.visible = true;
        this.dude.addChild(this.otherthing);


        this.collition = super.addrect(-11, -38, 20, 38, false, 0xDE3249, 0.3, this.otherthing);//-------------------本体0
        this.currentcollition = this.collition;

        this.collition1 = super.addrect(-50, -10, 10, 10, false, 0xDE3249, 0.3, this.otherthing);//左j
        this.collition2 = super.addrect(-40, -20, 10, 15, false, 0xDE3249, 0.3, this.otherthing);
        this.collition3 = super.addrect(-30, -25, 10, 17, false, 0xDE3249, 0.3, this.otherthing);

        this.collition4 = super.addrect(38, -10, 10, 10, false, 0xDE3249, 0.3, this.otherthing);///右j
        this.collition5 = super.addrect(28, -20, 10, 15, false, 0xDE3249, 0.3, this.otherthing);
        this.collition6 = super.addrect(18, -25, 10, 17, false, 0xDE3249, 0.3, this.otherthing);

        this.collition7 = super.addrect(-20, -22, 10, 5, false, 0xDE3249, 0.3, this.otherthing);//-------------------左1-1
        this.collition8 = super.addrect(-13, -31, 10, 5, false, 0xDE3249, 0.3, this.otherthing);//-------------------左1-2

        this.collition9 = super.addrect(6, -38, 13, 5, false, 0xDE3249, 0.3, this.otherthing);//-------------------左2
        this.collition10 = super.addrect(-47, -10, 33, 4, false, 0xDE3249, 0.3, this.otherthing);//-------------------左3
        this.collition11 = super.addrect(-39, -40, 70, 20, false, 0xDE3249, 0.3, this.otherthing);//-------------------左4

        this.collition12 = super.addrect(8, -22, 10, 5, false, 0xDE3249, 0.3, this.otherthing);//-------------------右1-1
        this.collition13 = super.addrect(1, -31, 10, 5, false, 0xDE3249, 0.3, this.otherthing);//-------------------右1-2
        this.collition14 = super.addrect(-21, -38, 13, 5, false, 0x00ff00, 0.3, this.otherthing);//-------------------右2
        this.collition15 = super.addrect(12, -10, 33, 4, false, 0xDE3249, 0.3, this.otherthing);//-------------------右3
        this.collition16 = super.addrect(-33, -40, 70, 20, false, 0xDE3249, 0.3, this.otherthing);//-------------------右4

        super.xuae(-6, -45, 10);

        this.技能 = {
            j: {
                have: true,
                cd: 2,
                iscd: true,
            },
            l: {
                have: false
            },
            u: {
                have: true,
                cd: 5,
                iscd: true,
            },
            技能左j1: 0,
            技能右j1: 1,
            技能左u1: 2,
            技能左u2: 3,
            技能左u3: 4,
            技能左u4: 5,
            技能右u1: 6,
            技能右u2: 7,
            技能右u3: 8,
            技能右u4: 9,

            用于遍历的技能碰撞: [{//反正也没有好方法让判定的时候才判断，不如直接一把嗦来遍历。//onbegin/onframechange处变true，onframechange/oncomplete处变false。
                using: false, collition: [this.collition1, this.collition2, this.collition3], effect: { from: 'r', vx: -1, vy: 0, hp: -0.6 }//左j0
            }, {
                using: false, collition: [this.collition4, this.collition5, this.collition6], effect: { from: 'l', vx: 1, vy: 0, hp: -0.6 }//右j1
            }, {
                using: false, collition: [this.collition7, this.collition8], effect: { from: 'r', vx: 0, vy: 0, hp: -1 }//左u2
            }, {
                using: false, collition: [this.collition9], effect: { from: 'r', vx: 0, vy: 0, hp: -1 }//左u3
            }, {
                using: false, collition: [this.collition10], effect: { from: 'r', vx: -1.5, vy: 0, hp: -1 }//左u4
            }, {
                using: false, collition: [this.collition11], effect: { from: 'l', vx: 1, vy: -3, hp: -1 }//左u5
            }, {
                using: false, collition: [this.collition12, this.collition13], effect: { from: 'l', vx: 0, vy: 0, hp: -1 }//6
            }, {
                using: false, collition: [this.collition14], effect: { from: 'l', vx: 0, vy: 0, hp: -1 }//7
            }, {
                using: false, collition: [this.collition15], effect: { from: 'l', vx: 1.5, vy: 0, hp: -1 }//8
            }, {
                using: false, collition: [this.collition16], effect: { from: 'r', vx: -1, vy: -3, hp: -1 }//9
            }]
        }
    }



}
class bin extends charactor {
    constructor(sheet, x) {
        super();
        this.种类 = "暂无";
        this.摩擦x = 0.02;
        this.跳跃速度 = -3;
        this.走路速度 = 1.2;
        this.dude = new PIXI.Container();
        this.dude.position.set(x, 0);
        this.gongjiyou = false;
        this.gongjizuo = false;
        mystage.addChild(this.dude);

        this.左站 = super.addfromname(sheet, "刀盾狼站", 0.03, this.dude, true, true);//左站0
        this.左站.x = 1;

        this.右站 = super.addfromname(sheet, "刀盾狼站", 0.03, this.dude, true, false);//右站1
        this.右站.width *= -1;
        this.右站.x = 2;

        this.左走 = super.addfromname(sheet, "刀盾狼走", 0.1, this.dude, true, false);//左走2


        this.右走 = super.addfromname(sheet, "刀盾狼走", 0.1, this.dude, true, false);//右走3
        this.右走.width *= -1;

        this.左跳 = super.addfromname(sheet, "刀盾狼站", 0.1, this.dude, false, false);//左站0
        this.左跳.x = 1;

        this.右跳 = super.addfromname(sheet, "刀盾狼站", 0.1, this.dude, false, false);//右站1
        this.右跳.width *= -1;
        this.右跳.x = 2;


        this.左痛 = new PIXI.Sprite(sheet.textures["刀盾狼被打1.png"]);
        this.dude.addChild(this.左痛);
        this.左痛.x = 2;
        this.左痛.visible = false;


        this.右痛 = new PIXI.Sprite(sheet.textures["刀盾狼被打1.png"]);
        this.右痛.visible = false;
        this.dude.addChild(this.右痛);
        this.右痛.scale.x = -1;

        this.左死 = super.addfromname(sheet, "刀盾狼被打", 0.08, this.dude, false, false);
        this.左死.scale.x = -1;
        this.右死 = super.addfromname(sheet, "刀盾狼被打", 0.08, this.dude, false, false);
        this.右死.x = 3;

        this.左j = super.addfromname(sheet, "刀盾狼攻击", 0.05, this.dude, false);//左攻击4
        this.on左jBegin = () => {
            this.摩擦x = 0.2;
        }
        this.左j.onFrameChange = (a) => {
            switch (a) {
                case 1:
                    this.技能.用于遍历的技能碰撞[this.技能.技能左j1].using = true;
                    this.vx = -3;
                    break;
            }
            // if this.生命值 > 0) 

        }
        this.on左jComplete = () => {
            this.技能.用于遍历的技能碰撞[this.技能.技能左j1].using = false;
        }

        this.右j = super.addfromname(sheet, "刀盾狼攻击", 0.05, this.dude, false);//右攻击5
        this.右j.width *= -1;
        this.on右jBegin = () => {
            this.摩擦x = 0.2;
        }
        this.右j.onFrameChange = (a) => {
            switch (a) {
                case 1:
                    this.技能.用于遍历的技能碰撞[this.技能.技能右j1].using = true;
                    this.vx = 3;
                    break;
            }
        }
        this.on右jComplete = () => {
            this.技能.用于遍历的技能碰撞[this.技能.技能右j1].using = false;
        }

        this.左l = super.addfromname(sheet, "刀盾狼防御", 0.3, this.dude, false);//右攻击5
        this.左l.visible = false;
        this.左l.x = 1;
        this.on左lBegin = () => {
            this.摩擦x = this.站立摩擦x;
            this.用完技能后cd(this.技能.l);
        }
        this.on左lComplete = () => {

        }

        this.右l = super.addfromname(sheet, "刀盾狼防御", 0.3, this.dude, false);//右攻击5
        this.右l.width *= -1;
        this.右l.visible = false;
        this.右l.x = 2;
        this.on右lBegin = () => {
            this.摩擦x = this.站立摩擦x;
            this.用完技能后cd(this.技能.l);
        }
        this.on右lComplete = () => {

        }

        this.左u = {};
        this.左u.min_dont_youse = true;


        this.otherthing = new PIXI.Container();//所以可以在this.里面找到他，也可以在dude.children里找到他。
        this.dude.addChild(this.otherthing);

        this.collition1 = super.addrect(-7, -24, 17, 24, false, 0xDE3249, 0.3, this.otherthing);//------------------------------------------狼兵碰撞
        this.currentcollition = this.collition1;

        this.collition2 = super.addrect(-23, -17, 12, 9, false, 0xDE3249, 0.3, this.otherthing);//------------------------------------------狼兵刀左

        this.collition3 = super.addrect(14, -17, 12, 9, false, 0xDE3249, 0.3, this.otherthing);//------------------------------------------狼兵刀右

        super.xuae(-1, -30, 5);

        //super.ocpsetup();
        this.技能 = {//没改过的教头的！
            j: {
                have: true,
                cd: 2,
                iscd: true,
            },
            l: {
                have: true,
                cd: 3,
                iscd: true,
            },
            u: {
                have: false,
            },
            技能左j1: 0,
            技能右j1: 1,
            用于遍历的技能碰撞: [{//反正也没有好方法让判定的时候才判断，不如直接一把嗦来遍历。
                using: false, collition: [this.collition2], effect: { from: 'r', vx: -1, vy: -0.5, hp: -1 }//左j
            }, {
                using: false, collition: [this.collition3], effect: { from: 'l', vx: 1, vy: -0.5, hp: -1 }//右j
            }]
        }


    }

    automove() {
        this.behavioristimeout = false;
        this.behavior = setInterval(//两秒一选择
            () => {
                this.xuanze();
            }
            , 2000//反应时间
        );

    }

    sayhello() {
        // console.log(monkey.x+"你好"+this.dude.x);
    }


    wolk() {//-----添加速度
        if (this.右站.visible == true) {
            // console.log(233);
            this.dude.x += 1;
        }
        else if (this.左站.visible == true) {
            // console.log(233);
            this.dude.x -= 1;
        }
    }

    chong() {//向我走过来，距离为80的时候砍一刀，在原地等待一秒后，找我的位置，向远离我的地方走两秒后，面对着我，做一次选择。 
        var 距离 = Number(this.findsb().number);
        console.log(距离);
        if (this.当前生命 > 0) {//这里出错了！
            console.log("活着");
            if (距离 < -40) {
                this.ny(motion.右走);
                console.log("向右接近");
            }
            else if (距离 < 0) {
                console.log("攻击");
                this.ny(motion.右j);
                clearInterval(this.behavior);
                this.behavioristimeout = true;
                this.behavior = setTimeout(() => { this.tao() }, 2000);
            }
            else if (距离 < 40) {
                console.log("攻击");
                this.ny(motion.左j);
                clearInterval(this.behavior);
                this.behavioristimeout = true;
                this.behavior = setTimeout(() => { this.tao() }, 2000);
            }
            else {
                this.ny(motion.左走);
                console.log("向左接近");
            }
        }
    }

    dang() {//向我走来，并在80距离内面对我举盾，随机等待一定时间，连砍两刀，在原地等两秒后向远离我的地方走三秒，面对着我，做一次选择。
        var 距离 = Number(this.findsb().number);
        console.log(距离);
        if (this.当前生命 > 0) {//这里出错了！
            console.log("活着");
            if (距离 < -40) {
                this.ny(motion.右走);
                console.log("向右接近");
            }
            else if (距离 < 0) {
                console.log("攻击");
                this.ny(motion.右l);
                clearInterval(this.behavior);
                this.behavioristimeout = false;
                this.behavior = setInterval(() => { this.xuanze() }, 2000);//一秒一选择
            }
            else if (距离 < 40) {
                console.log("攻击");
                this.ny(motion.左l);
                clearInterval(this.behavior);
                this.behavioristimeout = false;
                this.behavior = setInterval(() => { this.xuanze() }, 2000);//一秒一选择
            }
            else {
                this.ny(motion.左走);
                console.log("向左接近");
            }
        }



    }

    tao() {
        console.log("逃啊");
        var 距离 = Number(this.findsb().number)
        if (距离 > 0) {
            this.ny(motion.右走);
        }
        else {
            this.ny(motion.左走);
        }
        clearInterval(this.behavior);
        this.behavioristimeout = true;
        this.behavior = setTimeout(() => { this.zhuanshen(); }, 2000);//两秒后转身
    }
    zhuanshen() {
        // console.log("转身");
        var 距离 = this.findsb();
        if (距离.zuo) {
            this.ny(1);
        }
        else {
            this.ny(0);
        }
        clearInterval(this.behavior);
        this.behavioristimeout = false;
        this.behavior = setInterval(() => { this.xuanze(); }, 2000);//一秒一选择

    }


    xuanze() {//若血量低于3，百分之五十几率dang(),若血量高于3，chonga()。
        // console.log("id" + this.behavior);
        //console.log("选择！");
        var a = Math.random();
        //  console.log(a);

        if (this.当前生命 < 3 && a < 0.5) {
            //console.log("没勇气");
            this.dang();
        }
        else {
            //console.log("勇气");
            this.chong();

        }
    }


}
class gongbin extends charactor {
    constructor(sheet, x) {
        super();
        this.种类 = "暂无";
        this.摩擦x = 0.02;
        this.跳跃速度 = -3;
        this.走路速度 = 0.8;
        this.飞行道具push;
        this.dude = new PIXI.Container();
        this.dude.position.set(x, 0);
        mystage.addChild(this.dude);
        this.攻击机会 = false;
        this.生命值 = 4;
        this.behavior;

        this.左站 = super.addfromname(sheet, "弓箭狼站", 0.03, this.dude, true, true);//休息左0
        this.右站 = super.addfromname(sheet, "弓箭狼站", 0.03, this.dude, true, false);//休息右1
        this.右站.width *= -1;
        this.右站.x = -1;

        this.左走 = super.addfromname(sheet, "弓箭走路", 0.1, this.dude, true, false);//向左拿箭走2


        this.右走 = super.addfromname(sheet, "弓箭走路", 0.1, this.dude, true, false);//向右拿箭走3
        this.右走.width *= -1;
        this.右走.x = -1;

        this.左跳 = super.addfromname(sheet, "弓箭狼站", 0.07, this.dude, false, false);//休息左0
        this.右跳 = super.addfromname(sheet, "弓箭狼站", 0.07, this.dude, false, false);//休息右1
        this.右跳.width *= -1;
        this.右跳.x = -1;


        this.左痛 = new PIXI.Sprite(sheet.textures["弓箭狼被打1.png"]);
        this.dude.addChild(this.左痛);
        this.左痛.x = 2;
        this.左痛.visible = false;


        this.右痛 = new PIXI.Sprite(sheet.textures["弓箭狼被打1.png"]);
        this.右痛.visible = false;
        this.dude.addChild(this.右痛);
        this.右痛.scale.x = -1;

        this.左死 = super.addfromname(sheet, "弓箭狼被打", 0.08, this.dude, false, false);
        this.左死.scale.x = -1;
        this.右死 = super.addfromname(sheet, "弓箭狼被打", 0.08, this.dude, false, false);
        this.右死.x = 3;




        this.左j = super.addfromname(sheet, "弓箭狼拉弓", 0.1, this.dude, false, false);//向左射4
        this.on左jBegin = () => {
            this.摩擦x = 0.2;
        }
        this.左j.onFrameChange = (a) => {
            if (this.生命值 > 0) {
                switch (a) {
                    case 1:
                        break;
                    case 2:
                        this.飞行道具push.push(new zuojian(sheet3, this.dude.x - 10));
                        charm.slide(this.dude, this.dude.x + 3, this.dude.y, 15);

                        break;
                }
            }
        }
        this.on左jComplete = () => {
        }

        this.右j = super.addfromname(sheet, "弓箭狼拉弓", 0.1, this.dude, false, false);//向右射5
        this.右j.width *= -1;
        this.右j.x = -1;
        this.on右jBegin = () => {
            this.摩擦x = 0.2;
        }
        this.右j.onFrameChange = (a) => {
            if (this.生命值 > 0) {
                switch (a) {
                    case 1:
                        break;
                    case 2:
                        this.飞行道具push.push(new youjian(sheet3, this.dude.x + 10));
                        charm.slide(this.dude, this.dude.x - 3, this.dude.y, 15);

                        break;
                }
            }
        }
        this.on右jComplete = () => {

        }
        this.otherthing = new PIXI.Container();
        this.dude.addChild(this.otherthing);
        this.collition = super.addrect(-9, -24, 17, 24, false, 0xDE3249, 0.3, this.otherthing);//-------------------本体0
        this.currentcollition = this.collition;

        super.xuae(-3, -30, 4);


        this.技能 = {//他的技能没有碰撞体。。。
            j: {
                have: true,
                cd: 2,
                iscd: true,
            },
            l: {
                have: false,
            },
            u: {
                have: false,
            },
            i: {
                have: false,
            },
            没有技能: 0,
            用于遍历的技能碰撞: [{
                using: false, collition: [], from: 'r'//不存在的碰撞体。
            },]
        }
    }
    automove() {
        this.behavior = setInterval(() => {
            this.behavioristimeout = false;
            this.xuanze();
        }, 1000);
    }
    ocpsetup() {
        super.ocpsetup();
        switch (this.teamid) {
            case "玩家": {
                this.飞行道具push = team.玩家飞行道具;
                break;
            }
            case "敌人": {
                this.飞行道具push = team.敌人飞行道具;
                break;
            }
            case "野怪": {
                this.飞行道具push = team.野怪飞行道具;
                break;
            }
        }

    }

    xuanze() {
        var 距离 = Number(this.findsb().number);
        //console.log(距离);
        if (距离 < -100) {
            this.ny(motion.右走);
            //   console.log("安全过头");
        }
        else if (距离 < -60) {
            this.ny(motion.右站);
            // console.log("安全");
            clearTimeout(this.behavior);
            setTimeout(this.射箭(this), 2000);
            this.behavioristimeout = true;
        }
        else if (距离 < 0) {
            //  console.log("不安全");
            this.ny(motion.左走);
        }
        else if (距离 < 60) {
            // console.log("不安全");
            this.ny(motion.右走);
        }
        else if (距离 < 100) {
            this.ny(motion.左站);
            // console.log("安全");
            clearTimeout(this.behavior);
            setTimeout(this.射箭(this), 2000);
            this.behavioristimeout = true;
        }
        else {
            this.ny(motion.左走);
            // console.log("安全过头");
        }
    }

    射箭(a) {//拉弓后执行，判断猴子的位置，并向猴子的位置射箭。
        //  console.log(this);
        var 距离 = Number(a.findsb().number);
        if (距离 < 0) {
            this.ny(motion.右j);
            setTimeout(a.automove(), 4000);
            this.behavioristimeout = true;
        }
        else {
            this.ny(motion.左j);
            setTimeout(a.automove(), 4000);
            this.behavioristimeout = true;
        }
    }


}
class zuojian extends charactor {
    constructor(sheet, x) {
        super();
        this.dude = new PIXI.Sprite(sheet.textures["箭.png"], 160);//用作显示，也用作碰撞。
        this.visible = true;
        this.dude.x = x;
        this.dude.y = 72;
        this.攻击机会 = true;
        mystage.addChild(this.dude);
        // console.log("wozai!");
        this.currentcollition = super.addrect(-7, -3, 15, 3, false, "#00ffff", 0.3, this.dude,);
        this.技能 = {
            我就是技能: {
                cd: 2,
                iscd: true,
            },
            没有技能: 0,
            用于遍历的技能碰撞: [{
                using: true, collition: [this.dude], effect: { from: 'r', vx: -0.5, vy: 0, hp: -1 }//不存在的碰撞体。
            },]
        }
        this.behavior = setTimeout(() => {
            this.技能.用于遍历的技能碰撞[this.技能.没有技能].using = false;
        }, 2000);
    }
    walk() {
        this.dude.x -= 3;
    }
    人道毁灭() {
        this.destroy;
    }
}
class youjian extends zuojian {
    constructor(sheet, x) {
        super(sheet, x);
        this.dude.width *= -1;
        this.技能 = {
            我就是技能: {
                cd: 2,
                iscd: true,
            },
            没有技能: 0,
            用于遍历的技能碰撞: [{
                using: true, collition: [this.dude], effect: { from: 'l', vx: 0.5, vy: 0, hp: -1 }//不存在的碰撞体。
            },]
        }
        this.behavior = setTimeout(() => {
            this.技能.用于遍历的技能碰撞[this.技能.没有技能].using = false;
            this.人道毁灭();
        }, 2000);
    }
    walk() {
        this.dude.x += 3;
    }
}
class fubin extends charactor {
    constructor(sheet, x) {
        super();
        this.种类 = "暂无";
        this.摩擦x = 0.02;
        this.跳跃速度 = -3;
        this.走路速度 = 0.8;
        this.生命值 = 5;
        this.攻击机会 = false;
        this.dude = new PIXI.Container();
        this.dude.position.set(x, 0);
        this.gongjiyou = false;
        this.gongjizuo = false;
        mystage.addChild(this.dude);

        this.左站 = super.addfromname(sheet, "斧头狼站", 0.03, this.dude, true, true);//左站0
        this.右站 = super.addfromname(sheet, "斧头狼站", 0.03, this.dude, true, false);//右站1
        this.右站.width *= -1;
        this.右站.x = 1;
        this.左走 = super.addfromname(sheet, "斧头狼走", 0.15, this.dude, true, false);//走左2
        this.右走 = super.addfromname(sheet, "斧头狼走", 0.15, this.dude, true, false);//走右3
        this.右走.width *= -1;
        this.右走.x = 1;
        this.左跳 = super.addfromname(sheet, "斧头狼站", 0.07, this.dude, false, false);//休息左0
        this.右跳 = super.addfromname(sheet, "斧头狼站", 0.07, this.dude, false, false);//休息右1
        this.右跳.width *= -1;
        this.右跳.x = -1;
        this.左痛 = new PIXI.Sprite(sheet.textures["斧头狼被打1.png"]);
        this.dude.addChild(this.左痛);
        this.左痛.x = 2;
        this.左痛.visible = false;
        this.右痛 = new PIXI.Sprite(sheet.textures["斧头狼被打1.png"]);
        this.右痛.visible = false;
        this.dude.addChild(this.右痛);
        this.右痛.scale.x = -1;
        this.左死 = super.addfromname(sheet, "斧头狼被打", 0.08, this.dude, false, false);
        this.左死.scale.x = -1;
        this.右死 = super.addfromname(sheet, "斧头狼被打", 0.08, this.dude, false, false);
        this.右死.x = 3;
        this.左j = super.addfromname(sheet, "斧头狼攻击", 0.02, this.dude, false, false);//左攻击左4
        this.on左jBegin = () => {
            this.技能.用于遍历的技能碰撞[this.技能.技能左j上].using = true;
            setTimeout(() => { this.vy = -1.5; this.摩擦x = 0; this.vx = -1.5; }, 0);
            setTimeout(() => { this.vy = -1.5; }, 300);
            setTimeout(() => { this.vy = -1.5; }, 600);
        }
        this.左j.onFrameChange = (a) => {
            switch (a) {
                case 1:
                    this.技能.用于遍历的技能碰撞[this.技能.技能左j上].using = false;
                    this.技能.用于遍历的技能碰撞[this.技能.技能左j1].using = true;
                    this.摩擦x = 0.2;
                    console.log("攻击时");
                    break;
            }
        }

        this.on左jComplete = () => {
            this.技能.用于遍历的技能碰撞[this.技能.技能左j1].using = false;
        }

        this.右j = super.addfromname(sheet, "斧头狼攻击", 0.02, this.dude, false, false);//攻击右5
        this.右j.width *= -1;
        this.右j.x = 1;
        this.on右jBegin = () => {
            this.技能.用于遍历的技能碰撞[this.技能.技能右j上].using = true;
            setTimeout(() => { this.vy = -1.5; this.摩擦x = 0; this.vx = 1.5; }, 0);
            setTimeout(() => { this.vy = -1.5; }, 300);
            setTimeout(() => { this.vy = -1.5; }, 600);
        }
        this.右j.onFrameChange = (a) => {
            switch (a) {
                case 1:
                    this.技能.用于遍历的技能碰撞[this.技能.技能右j上].using = false;
                    this.技能.用于遍历的技能碰撞[this.技能.技能右j1].using = true;
                    this.摩擦x = 0.2;
                    break;
            }
        }
        this.on右jComplete = () => {
            this.技能.用于遍历的技能碰撞[this.技能.技能右j1].using = false;
        }

        this.otherthing = new PIXI.Container();//所以可以在this.里面找到他，也可以在dude.children里找到他。
        this.dude.addChild(this.otherthing);

        this.collition1 = super.addrect(-8, -24, 17, 24, false, 0xDE3249, 0.3, this.otherthing);//----------------------狼兵碰撞
        this.currentcollition = this.collition1;

        this.collition2 = super.addrect(-24, -12, 10, 10, false, 0xDE3249, 0.3, this.otherthing);//----------------------左攻击
        this.collition3 = super.addrect(15, -12, 10, 10, false, 0xDE3249, 0.3, this.otherthing);//----------------------右攻击

        this.collition4 = super.addrect(-5, -37, 10, 7, false, 0xDE3249, 0.3, this.otherthing);//--------------------上攻击
        this.collition5 = super.addrect(-5, -37, 10, 7, false, 0xDE3249, 0.3, this.otherthing);//--------------------上攻击

        super.xuae(-2, -30, 5);

        //super.ocpsetup();
        this.技能 = {//没改过的教头的！
            j: {
                have: true,
                cd: 2,
                iscd: true,
            },
            l: {
                have: false,
            },
            u: {
                have: false,
            },
            i: {
                have: false,
            },
            技能左j1: 0,
            技能右j1: 1,
            技能左j上: 2,
            技能右j上: 3,
            用于遍历的技能碰撞: [{//反正也没有好方法让判定的时候才判断，不如直接一把嗦来遍历。
                using: false, collition: [this.collition2], effect: { from: 'r', vx: -0.5, vy: -1, hp: -2 }//左j
            }, {
                using: false, collition: [this.collition3], effect: { from: 'l', vx: 0.5, vy: -1, hp: -2 }//右j
            }, {
                using: false, collition: [this.collition4], effect: { from: 'r', vx: 0, vy: 1, hp: -1 }//上
            }, {
                using: false, collition: [this.collition5], effect: { from: 'l', vx: 0, vy: 1, hp: -1 }//上
            }]
        }

    }

    automove() {
        this.behavioristimeout = false;
        this.behavior = setInterval(() => {
            this.attack();
        }, 3000);
    }
    attack() {
        var 距离 = Number(this.findsb().number);
        console.log(距离);
        if (距离 < -80) {
            this.ny(motion.右走);
        }
        else if (距离 < 0) {//attack
            this.ny(motion.右j);
            clearInterval(this.behavior);
            this.behavioristimeout = true;
            this.behavior = setTimeout(() => { this.runaway(); }, 4000);//想一下，走开。
        }
        else if (距离 < 80) {//attack
            this.ny(motion.左j);
            clearInterval(this.behavior);
            this.behavioristimeout = true;
            this.behavior = setTimeout(() => { this.runaway(); }, 4000);
        }
        else {
            this.ny(motion.左走);
        }
    }

    runaway() {
        var 距离 = Number(this.findsb().number);
        if (距离 < 0) {
            this.ny(motion.左走);
        }
        else {
            this.ny(motion.右走);
        }
        this.automove();
    }

}
class huoba extends charactor {
    constructor(sheet, x) {
        super();
        this.种类 = "暂无";
        this.摩擦x = 0.02;
        this.跳跃速度 = -3;
        this.走路速度 = 0.8;
        this.生命值 = 5;
        this.攻击机会 = false;
        this.dude = new PIXI.Container();
        this.dude.position.set(x, 0);
        mystage.addChild(this.dude);
        this.左站 = super.addfromname(sheet, "斥候狼站", 0.03, this.dude, true, true);//休息左0
        this.右站 = super.addfromname(sheet, "斥候狼站", 0.03, this.dude, true, false);//休息右1
        this.右站.width *= -1;
        this.右站.x += 1;
        this.左走 = super.addfromname(sheet, "斥候狼走", 0.2, this.dude, true, false);//走左2
        this.右走 = super.addfromname(sheet, "斥候狼走", 0.2, this.dude, true, false);//走右3
        this.右走.width *= -1;
        this.右走.x = 1;
        this.左跳 = super.addfromname(sheet, "斥候狼站", 0.07, this.dude, false, false);//休息左0
        this.右跳 = super.addfromname(sheet, "斥候狼站", 0.07, this.dude, false, false);//休息右1
        this.右跳.width *= -1;
        this.右跳.x += 1;
        this.左痛 = new PIXI.Sprite(sheet.textures["斥候狼被打1.png"]);
        this.dude.addChild(this.左痛);
        this.左痛.x = 2;
        this.左痛.visible = false;
        this.右痛 = new PIXI.Sprite(sheet.textures["斥候狼被打1.png"]);
        this.右痛.visible = false;
        this.dude.addChild(this.右痛);
        this.右痛.scale.x = -1;
        this.左死 = super.addfromname(sheet, "斥候狼被打", 0.08, this.dude, false, false);
        this.左死.scale.x = -1;
        this.右死 = super.addfromname(sheet, "斥候狼被打", 0.08, this.dude, false, false);
        this.右死.x = 3;
        this.左j = super.addfromname(sheet, "火把攻击", 0.15, this.dude, false, false);//挥舞左4
        this.on左jBegin = () => {
            this.摩擦x = 0.1;
            this.vx = -2;
        }
        this.左j.onFrameChange = (a) => {//2,3为攻击。
            switch (a) {
                case 2:
                    this.技能.用于遍历的技能碰撞[this.技能.技能左j].using = true;
                    break;
            }
        }
        this.on左jComplete = () => {
            this.技能.用于遍历的技能碰撞[this.技能.技能左j].using = false;
        }
        this.右j = super.addfromname(sheet, "火把攻击", 0.15, this.dude, false, false);//挥舞右5
        this.on右jBegin = () => {
            this.摩擦x = 0.1;
            this.vx = 2;
        }
        this.右j.onFrameChange = (a) => {
            switch (a) {
                case 2:
                    this.技能.用于遍历的技能碰撞[this.技能.技能右j].using = true;
                    break;
            }
        }
        this.on右jComplete = () => {
            this.技能.用于遍历的技能碰撞[this.技能.技能右j].using = false;
        }
        this.右j.width *= -1;
        this.右j.x = 1;
        this.左l = super.addfromname(sheet, "斥候狼挥舞", 0.1, this.dude, false, false);//挥舞左4
        this.on左lBegin = () => {
            this.用完技能后cd(this.技能.l);
        }
        this.左l.onFrameChange = () => {

        }
        this.on左lComplete = () => {

        }
        this.右l = super.addfromname(sheet, "斥候狼挥舞", 0.1, this.dude, false, false);//挥舞右5
        this.右l.width *= -1;
        this.右l.x = 1;
        this.on右lBegin = () => {
            this.用完技能后cd(this.技能.l);//有的技能用后cd，有的技能用立即cd
        }
        this.右l.onFrameChange = () => {

        }
        this.on右lComplete = () => {

        }

        //this.挥舞.gotoAndStop(1);
        this.otherthing = new PIXI.Container();//所以可以在this.里面找到他，也可以在dude.children里找到他。
        this.dude.addChild(this.otherthing);

        this.collition1 = super.addrect(-8, -24, 17, 24, false, 0xDE3249, 0.3, this.otherthing);//----------------------狼兵碰撞
        this.currentcollition = this.collition1;
        this.collition2 = super.addrect(-19, -15, 12, 6, false, 0xDE3249, 0.3, this.otherthing);//左j
        this.collition3 = super.addrect(8, -15, 12, 6, false, 0xDE3249, 0.3, this.otherthing);//右j

        super.xuae(-2, -30, 5);
        this.技能 = {
            j: {
                have: true,
                cd: 2,
                iscd: true,
            },
            l: {
                have: true,
                cd: 3,
                iscd: true,
            },
            u: {
                have: false,
            },
            i: {
                have: false,
            },
            技能左j: 0,
            技能右j: 1,
            用于遍历的技能碰撞: [{
                using: false, collition: [this.collition2], effect: { from: 'l', vx: -0.5, vy: 0, hp: -0.5 }//左j
            }, {
                using: false, collition: [this.collition3], effect: { from: 'r', vx: 0.5, vy: 0, hp: -0.5 }
            }]
        }
    }
    automove() {
        this.behavioristimeout = false;
        this.behavior = setInterval(() => {
            this.attack();
        }, 3000);
    }
    attack() {
        var 距离 = Number(this.findsb().number);
        console.log(距离);
        if (距离 < -80) {
            this.ny(motion.右走);
        }
        else if (距离 < 0) {//attack
            this.ny(motion.右j);
            clearInterval(this.behavior);
            this.behavioristimeout = true;
            this.behavior = setTimeout(() => { this.runaway(); }, 4000);//想一下，走开。
        }
        else if (距离 < 80) {//attack
            this.ny(motion.左j);
            clearInterval(this.behavior);
            this.behavioristimeout = true;
            this.behavior = setTimeout(() => { this.runaway(); }, 4000);
        }
        else {
            this.ny(motion.左走);
        }
    }

    runaway() {
        var 距离 = Number(this.findsb().number);
        if (距离 < 0) {
            this.ny(motion.左走);
        }
        else {
            this.ny(motion.右走);
        }
        this.behavioristimeout = true;
        this.behavior = setTimeout(() => { this.zhanli(); }, 2000);
    }
    zhanli() {
        var 距离 = Number(this.findsb().number);
        if (距离 < 0) {
            this.ny(motion.右站);
            this.ny(motion.右l);
            this.右l.gotoAndStop(0);
            this.右l.play();
            this.automove();
        }
        else {
            this.ny(motion.左站);
            this.ny(motion.左l);
            this.左l.gotoAndStop(0);
            this.左l.play();
            this.automove();
        }
    }





}