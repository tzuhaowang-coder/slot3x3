import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { SlotSymbol } from './SlotSymbol';
const { ccclass, property } = _decorator;

@ccclass('Reel')
export class Reel extends Component {
    @property sprites: SpriteFrame[] = null;

    symbols: SlotSymbol[];

    start() {
        this.symbols = this.getComponentsInChildren(SlotSymbol);
    }

    async spin() {


    }
}
