//人物控制系统
function ketsetup() {
    function leftpress() {
        left.isDown = true;
        if (player.左站.visible || player.右站.visible || player.右走.visible) {
            player.ny(motion.左走);
            // console.log(player.ny);
        }
        else if (player.左跳.visible || player.右跳.visible) {
            player.vx = -player.走路速度;
        }
    }
    function leftrelease() {
        left.isDown = false;
        //console.log("左松开");
        if (player.左走.visible) {
            if (right.isUp) {
                player.ny(motion.左站);
            }
            else {
                player.ny(motion.右走);
            }
        }
    }
    function rightpress() {
        //console.log("右按下");
        right.isDown = true;
        if (player.左站.visible || player.右站.visible || player.左走.visible) {
            player.ny(motion.右走);
        }
        else if (player.左跳.visible || player.右跳.visible) {
            player.vx = player.走路速度;
        }
    }

    function rightrelease() {
        right.isDown = false;
        //console.log("右松开");
        if (player.右走.visible) {
            if (left.isUp) {
                player.ny(motion.右站);
            }
            else {
                player.ny(motion.左走);
            }
        }
    }
    function kpress() {
        console.log("k");
        if (player.右走.visible || player.右站.visible) {
            player.ny(motion.右跳);
        }
        else if (player.左走.visible || player.左站.visible) {
            player.ny(motion.左跳);
        }
    }
    function krelease() {
        //  console.log(233);
    }
    function jpress() {
        if (player.右站.visible) {
            jtime = setTimeout(() => {
                player.ny(motion.右j_);
                console.log("右蓄力0.5s");

            }, 300);//1000为1s  这玩意儿会返回一个id  所以会不断增加。
        }
        else if (player.右走.visible && player.技能.j.iscd) {
            player.ny(motion.右j);
            keymaskplay(player.技能.j.cd, j键mask,j键);
            player.右j.play();
        }
        else if (player.左站.visible) {
            jtime = setTimeout(() => {
                player.ny(motion.左j_);
                console.log("左蓄力0.5s");

            }, 300);//1000为1s  这玩意儿会返回一个id  所以会不断增加。
        }
        else if (player.左走.visible && player.技能.j.iscd) {
            player.ny(motion.左j);
            keymaskplay(player.技能.j.cd, j键mask,j键);
            player.左j.play();
        }
    }
    function jrelease() {
        clearTimeout(jtime);
        if (player.右站.visible && player.技能.j.iscd) {
            keymaskplay(player.技能.j.cd, j键mask,j键);
            player.ny(motion.右j);
        }
        else if (player.左站.visible && player.技能.j.iscd) {
            keymaskplay(player.技能.j.cd, j键mask,j键);
            player.ny(motion.左j);
        }
    }
    function lpress() {
        if (player.技能.l.iscd) {
            if (player.右站.visible) {
                keymaskplay(player.技能.l.cd, l键mask,l键);
                player.ny(motion.右l);
                player.右l.play();
            }
            else if (player.左站.visible) {
                keymaskplay(player.技能.l.cd, l键mask,l键);
                player.ny(motion.左l);
                player.左l.play();
            }
        }

    }
    function lrelease() {//l
        player.右l.gotoAndStop(0);
        player.左l.gotoAndStop(0);
        if (player.左l.visible) {
            player.ny(motion.左站);
            player.左放完技能衔接走位forplayer();
        }
        else if (player.右l.visible) {
            player.ny(motion.右站);
            player.右放完技能衔接走位forplayer();
        }
    }



    function upress() {

        if(player.技能.u.iscd){
            if (player.右走.visible || player.右站.visible) {
                player.ny(motion.右u);
                keymaskplay(player.技能.u.cd, u键mask,u键);
            }
            else if (player.左走.visible || player.左站.visible) {
                player.ny(motion.左u);
                keymaskplay(player.技能.u.cd, u键mask,u键);
            }
        }
        
    }



    function urelease() {

    }
    function ipress() {

    }
    function irelease() {

    }

    left.press = leftpress;
    left.release = leftrelease;
    左键.pointerdown = leftpress;
    左键.pointerup = leftrelease;

    right.press = rightpress;
    right.release = rightrelease;
    右键.pointerdown = rightpress;
    右键.pointerup = rightrelease;

    k.press = kpress;
    k.release = krelease;
    k键.pointerdown = kpress;
    k键.pointerup = krelease;

    j.press = jpress;
    j.release = jrelease;
    j键.pointerdown = jpress;
    j键.pointerup = jrelease;


    if (player.技能.l.have) {//在技能表里判断有没有该技能。
        console.log("有l");
        l.release = lrelease;//有动画的（猴）
        l键.pointerup = lrelease;
        l键.pointerdown = lpress;
        l.press = lpress;
    }
    else {
        console.log("无l");
        l.press = null;
        l.release = null;
        l键.pointerdown = null;
        l键.pointerup = null;
    }



    if (player.技能.u.have) {
        u.press = upress;
        u键.pointerdown = upress;
    } else {
        u.press = null;
        u键.pointerdown = null;
    }

}