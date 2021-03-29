import WasteLess from "./game";
import { WIDTH, HEIGHT } from "./config";

const config = {
	type: Phaser.AUTO,
	backgroundColor: '#125522',
	width: WIDTH,
	height: HEIGHT,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 },
			debug: false
		}
	},
	scene: WasteLess,
};

new Phaser.Game(config);
