import { _decorator, Button, Component, EditBox, EventHandler, instantiate, Label, Node, NodePool, tween } from 'cc';
import { Slot } from './Slot';
import { Reel } from './Reel/Reel';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property({ type: Slot }) slotMachine: Slot = null;
    @property({ type: Button }) spinButton: Button = null;
    @property(EditBox) setResultEditBox: EditBox = null;
    @property(Button) setResultButton: Button = null;

    @property({ type: Label }) scoreLabel: Label = null;
    private totalscore: number;

    @property({ type: Node }) lineNode: Node = null;
    @property({ type: Node }) lineParent: Node = null;
    private _pool: NodePool = new NodePool();

    public getLine(): Node {
        let lineNode: Node = null!;

        if (this._pool.size() > 0) {
            console.log(`get`);
            lineNode = this._pool.get()!;
        } else {
            console.log(`instantiate`);
            lineNode = instantiate(this.lineNode);
        }
        return lineNode;
    }

    public putLine(lineNode: Node) {
        this._pool.put(lineNode);
    }

    resultArray: number[] = [0, 0, 0,
        1, 2, 2,
        2, 0, 0];

    winLines: number[][] = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    winflag: boolean[] = [false, false, false, false, false];

    start() {
        this.initSpinButton();
        this.initResultButton();
        this.slotMachine.initial(this);
        this.setResult();
    }

    async onSpinClick() {
        console.log('click');

        switch (this.slotMachine.state) {
            case EGameState.Ready:
                // put 回池
                for (let i = this.lineParent.children.length - 1; i >= 0; i--) {
                    this._pool.put(this.lineParent.children[i]);
                };
                break;
            case EGameState.Spinning:
                // 提早停下
                this.slotMachine.stopSpin();
                return;
            default:
                return;
        }

        await this.slotMachine.onSpin();

        this.showResult();
    }



    onSetResultClick() {
        this.resultArray = this.setResultEditBox.string.split(',').map(Number);
        console.log(this.resultArray);
        this.setResult();
    }

    private setResult() {
        let tempArray = [];

        // set Result to reels
        for (let i = 0; i < this.slotMachine.reels.length; i++) {
            tempArray = [];
            for (let j = 0; j < this.resultArray.length; j += 3) {
                tempArray.push(this.resultArray[i + j]);
            }
            console.log(`reel: ${i}, tempArray: ${tempArray}`);
            this.slotMachine.reels[i].setResultSymbols(tempArray);
        }
    }

    async showResult() {
        this.totalscore = 0;
        this.winflag.fill(false);
        this.winLines.forEach((line, index) => {
            const [a, b, c] = line;
            if (this.resultArray[a] === this.resultArray[b] && this.resultArray[b] === this.resultArray[c]) {
                this.winflag[index] = true;
                switch (this.resultArray[a]) {
                    case 0:
                        this.totalscore += 3;
                        break;
                    case 1:
                        this.totalscore += 2;
                        break;
                    case 2:
                        this.totalscore += 1;
                        break;
                }
            }
        });
        this.scoreLabel.string = `${this.totalscore}`;
        await this.showWinLines();
    }

    private async showWinLines() {
        this.winflag.forEach((flag, index) => {

            const lineResult = (flag: boolean, index: number) => {
                if (!flag) return;

                let degree = 0;
                let positionY = 0;
                switch (index) {
                    case 0:
                        degree = 0;
                        positionY = 256;
                        break;
                    case 1:
                        degree = 0;
                        break;
                    case 2:
                        degree = 0;
                        positionY = -256;
                        break;
                    case 3:
                        degree = 45;
                        break;
                    case 4:
                        degree = -45;
                        break;
                }
                let lineNode = this.getLine();
                lineNode.parent = this.lineParent;
                lineNode.setPosition(0, positionY);
                lineNode.setRotationFromEuler(0, 0, degree);
                lineNode.active = true;
            }
            if (flag) {
                console.log(`line: ${index}`);
                lineResult(flag, index);
            }
        });
        // TODO 用 tween
        this.lineParent.active = true;
        tween(this.node).delay(0.2).call(() => {
            this.lineParent.active = false;
        }).delay(0.2).call(() => {
            this.lineParent.active = true;
        }).delay(0.2).call(() => {
            this.lineParent.active = false;
        }).delay(0.2).call(() => {
            this.lineParent.active = true;
        }).call(() => {
            this.slotMachine.state = EGameState.Ready;
        })
            .start();
    }

    private initSpinButton() {
        let event = new EventHandler();
        event.target = this.node;
        event.component = `GameManager`;
        event.handler = 'onSpinClick';

        this.spinButton.clickEvents.push(event);
    }

    private initResultButton() {
        let event = new EventHandler();
        event.target = this.node;
        event.component = `GameManager`;
        event.handler = 'onSetResultClick';

        this.setResultButton.clickEvents.push(event);
    }

    onDestroy() {
        this._pool.clear();
    }
}

export enum EGameState {
    Ready,
    Spinning,
    Stopping,
}