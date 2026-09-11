import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SlotSymbol')
export class SlotSymbol extends Component {

    symbol: Sprite;

    start(): void {
        this.symbol = this.getComponent(Sprite);
    }

    changeSymbol(newSprite: SpriteFrame) {

        this.symbol.spriteFrame = newSprite;
    }

}


