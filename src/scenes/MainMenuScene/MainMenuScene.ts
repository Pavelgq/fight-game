import { Point } from "../../model/Point";
import { getMainMenuLayout, MAIN_MENU_ITEMS } from "../../layouts/MainMenuLayout";
import { Button } from "../../views/Button/Button";

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        const layout = getMainMenuLayout();

        this.add.image(layout.background.x, layout.background.y, 'background');
        this.createMenu(layout);
    }

    private createMenu(layout: ReturnType<typeof getMainMenuLayout>) {
        let offsetY = 0;

        MAIN_MENU_ITEMS.forEach((item) => {
            const y = layout.buttons.startY + offsetY;
            const button = new Button(this, new Point(layout.buttons.x, y), item, {
                designWidth: layout.buttons.designWidth,
                fontSize: layout.buttons.fontSize,
            });
            offsetY += button.layoutHeight + layout.buttons.gap;

            button.on('pointerup', () => this.handleMenuItem(item));
        });
    }

    private handleMenuItem(item: typeof MAIN_MENU_ITEMS[number]) {
        switch (item) {
            case 'Начать игру':
                this.scene.start('PlayerBuildScene');
                break;
            case 'Настройки':
                console.log('Настройки');
                break;
        }
    }
}
