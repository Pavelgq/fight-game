import { Point } from "../../model/Point";
import { Button } from "../../views/Button/Button";

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        this.add.image(640, 360, 'background');
        this.createMenu();
    }

    createMenu() {
        let menuItems = ["Начать игру", "Настройки"];
        let lastY = 0;

        menuItems.forEach((item, index) => {
            const button = new Button(this, new Point(640, 300 + lastY), item);

            lastY += button.height + 20;

            button.on('pointerdown', function () {
                switch(item) {
                    case 'Начать игру':
                        // Здесь можно переключиться на сцену игры
                        console.log('Начать игру');
                        break;
                    case 'Настройки':
                        // Здесь можно открыть сцену настроек
                        console.log('Настройки');
                        break;
                }
            }, this);
        });
    }
}
