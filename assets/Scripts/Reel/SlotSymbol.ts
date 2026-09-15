import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SlotSymbol')
export class SlotSymbol extends Component {
    symbol: Sprite;
    settingIndex = -1;

    start(): void {
        this.symbol = this.getComponent(Sprite);
    }

    changeSymbol(newSprite: SpriteFrame) {

        this.symbol.spriteFrame = newSprite;
    }

    moveUpAndChangeRandomSymbol(offset: number, sprite: SpriteFrame) {
        this.node.setPosition(0, offset + this.node.position.y);
        this.changeSymbol(sprite);
    }


}


