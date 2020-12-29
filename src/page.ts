
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
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

let game: Phaser.Game = new Phaser.Game(config);

function preload(this: any) {
    this.load.image('sky', './assets/sky.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('dede', 'dude.png');
}

let platforms: Phaser.Physics.Arcade.StaticGroup;//一个静态物理组
let player: Phaser.Physics.Arcade.Sprite;//使用arcada物理引擎下的Sprite

function create(this: any) {

    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();


    //setSize只改变体积大小，setDisplaySize改变渲染的大小，setScale两者都改变。

    let a: Phaser.GameObjects.GameObject = platforms.create(400, 568, 'ground').setScale(2).refreshBody();//refreshBody是修改静态物体位置的方法,动态物体不用他。

    platforms.create(600, 400, 'ground');

    platforms.create(50, 250, "ground");

    platforms.create(750, 220, 'ground');

    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);


}

function update() {
}//？？