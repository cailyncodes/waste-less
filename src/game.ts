import 'phaser';
import { cartesianProduct } from './lib/cartesian-product';
import { shuffle } from './lib/shuffle';

const KEYS = {
	BIN: 'bin',
	FIELD: 'field',
	NAME: 'waste-less',
	PLAYER: 'player',
	WAREHOUSE: 'warehouse',
	WASTE: 'waste',
}


export default class WasteLess extends Phaser.Scene {
	cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
	bins: Phaser.Physics.Arcade.StaticGroup;
	warehouses: Phaser.Physics.Arcade.StaticGroup;
	topText: Phaser.GameObjects.Text;
	middleText: Phaser.GameObjects.Text;
	bottomText: Phaser.GameObjects.Text;

	constructor() {
		super(KEYS.NAME);
	}

	preload() {
		this.load.spritesheet(KEYS.PLAYER, 'assets/dude.png', { frameWidth: 32, frameHeight: 48 })
		this.load.image(KEYS.BIN, 'assets/bin.png');
		this.load.image(KEYS.WAREHOUSE, 'assets/crate.png');
	}

	create() {
		const x = shuffle(Array.from(Array(7).keys()));
		const y = shuffle(Array.from(Array(5).keys()));
		const positions = shuffle(shuffle(cartesianProduct(x, y)));

		this.addBins(positions);
		this.addWarehouses(positions);

		this.player = this.physics.add.sprite(positions[0][0], positions[0][1], KEYS.PLAYER);
		this.player.setData({ bins: [] });
		this.player.setCollideWorldBounds(true);
		this.physics.add.collider(this.warehouses, this.player, this.depositWaste);
		this.physics.add.collider(this.bins, this.player, this.collectWaste);

		this.anims.create({
			key: 'left',
			frames: this.anims.generateFrameNumbers(KEYS.PLAYER, { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1
		});

		this.anims.create({
			key: 'turn',
			frames: [{ key: KEYS.PLAYER, frame: 4 }],
			frameRate: 20
		});

		this.anims.create({
			key: 'right',
			frames: this.anims.generateFrameNumbers(KEYS.PLAYER, { start: 5, end: 8 }),
			frameRate: 10,
			repeat: -1
		});

		this.topText = this.add.text(0, 0, '').setBackgroundColor('black');
		this.middleText = this.add.text(0, 280, '', { fontSize: '25px' }).setBackgroundColor('black');
		this.bottomText = this.add.text(0, 580, '');

		this.cursors = this.input.keyboard.createCursorKeys();
	}

	update() {
		let isMoving = false;
		if (this.cursors.up.isDown || this.cursors.down.isDown) {
			isMoving = true;
			if (this.cursors.up.isDown) {
				this.player.setVelocityY(-160);
			} else {
				this.player.setVelocityY(160);
			}
			this.player.anims.play('turn');
		} else {
			this.player.setVelocityY(0);
		}
		if (this.cursors.left.isDown || this.cursors.right.isDown) {
			isMoving = true;
			if (this.cursors.left.isDown) {
				this.player.setVelocityX(-160);
				this.player.anims.play('left', true);
			} else {
				this.player.setVelocityX(160);
				this.player.anims.play('right', true);
				isMoving = true;
			}
		} else {
			this.player.setVelocityX(0);
		}
		if (!isMoving) {
			this.player.setVelocityX(0);
			this.player.setVelocityY(0);
			this.player.anims.play('turn');
		}

		const playerCollectedBins = this.player.getData('bins') || [];
		if (playerCollectedBins.length === 3) {
			this.topText.setText("Your van is full! Drop off waste at the warehouse.");
		}
	}

	static randomPosition(dimension) {
		return Math.random() * dimension;
	}

	clashes(x: number, y: number, width: number, height: number, ...objs: any[]) {
		return objs.reduce((clashes, obj) => clashes || this.physics.overlapRect(x, y, width, height).includes(obj), false);
	}

	addBins(positions: number[][]) {
		this.bins = this.physics.add.staticGroup({
			frameQuantity: 15,
		});

		for (let _ = 0; _ < 15; ++_) {
			const jiggle = (Math.random() < 0.5 ? -1 : 1) * Math.random() * 25;
			const position = positions.shift();
			const bin = this.physics.add.staticImage(position[0] * 100 + 50 + jiggle, position[1] * 100 + 50 + jiggle, KEYS.BIN);
			// this.bins.create(positions[_][0] * 100 + 50, positions[_][1] * 100 + 50, KEYS.BIN);
			bin.scale = 0.1;
			bin.setSize(32, 30)
			this.bins.add(bin);
		}
		this.bins.refresh();
	}

	addWarehouses(positions: number[][]) {
		this.warehouses = this.physics.add.staticGroup({
			frameQuantity: 5,
		});

		for (let _ = 0; _ < 5; ++_) {
			const jiggle = (Math.random() < 0.5 ? -1 : 1) * Math.random() * 50;
			const position = positions.shift();
			const warehouse = this.physics.add.staticImage(position[0] * 100 + 50 + jiggle, position[1] * 100 + 50 + jiggle, KEYS.WAREHOUSE);
			warehouse.scale = 0.6;
			warehouse.setSize(36, 30)
			this.warehouses.add(warehouse);
		}
		this.warehouses.refresh();
	}

	collectWaste: ArcadePhysicsCallback = (player, bin) => {
		const collectedBins = player.getData('bins') || [];
		if (collectedBins.length === 3) {
			return;
		}
		const currentBins = [...collectedBins, bin];
		player.setData({
			bins: currentBins
		})
		this.bottomText.setText(`${currentBins.length}/3 van capacity`);
		this.bins.remove(bin, true, true);
	}

	depositWaste: ArcadePhysicsCallback = (player, warehouse) => {
		const collectedBins = player.getData('bins') || [];
		const lastWarehouse = player.getData('lastWarehouse');
		const [, ...remainingBins] = collectedBins;
		if (lastWarehouse !== warehouse) {
			this.player.setData({
				bins: remainingBins,
				lastWarehouse: warehouse,
			});
			this.bottomText.setText(`${remainingBins.length}/3 van capacity`);
		}
		if (collectedBins.length > 0) {
			this.topText.setText("You can only drop off one waste at a time. Go to another warehouse.");
		} else {
			this.topText.setText('');
		}
		this.checkWin();
	}

	checkWin() {
		const collectedBins = this.player.getData('bins') || [];
		const remainingBins = this.bins;
		const didWin = collectedBins.length + remainingBins.getLength() === 0
		if (didWin) {
			this.topText.setText('');
			this.middleText.setText(["You saved all the waste from the landfill!", "Thank you for wasting less!"]);
			this.bottomText.setText('');
		}
	}
}
