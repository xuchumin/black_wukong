"use strict";
exports.__esModule = true;
var phaser_1 = require("phaser");
var config = {
    type: phaser_1["default"].AUTO,
    width: 800,
    height: 600,
    physics: {
        "default": 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
var game = new phaser_1["default"].Game(config);
function preload() {
    this.load.image('sky', './assets/sky.png');
    this.load.image('ground', 'assets/ground.png');
}
var platforms; //一个带物理的组
function create() {
    this.add.image(400, 300, 'sky');
    platforms = this.physics.add.staticGroup();
    //setSize只改变体积大小，setDisplaySize改变渲染的大小，setScale两者都改变。
    var a = platforms.create(400, 568, 'ground').setScale(2).refreshBody(); //refreshBody是修改静态物体位置的方法,动态物体不用他。
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, "ground");
    platforms.create(750, 220, 'ground');
}
function update() {
}
