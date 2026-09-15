import { _decorator, Button, Component, EditBox, EventHandler, instantiate, Label, Node, NodePool } from 'cc';
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

    resultArray: number[] = [0, 1, 1,
        1, 2, 2,
        2, 0, 0];

    winLines: number[][] = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    // 0: 都沒中、1: 橫1、2: 橫2、4: 橫3、8: 斜1、16: 斜2
    winflag: boolean[] = [false, false, false, false, false];

    state: EGameState = EGameState.Ready;

    start() {
        this.initSpinButton();
        this.initResultButton();
        this.slotMachine.initial(this);
        this.setResult();
    }

    protected update(dt: number): void {
        this.slotMachine.updateHandler(this.state, dt);
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

    onSetResultClick() {
        this.resultArray = this.setResultEditBox.string.split(',').map(Number);
        console.log(this.resultArray);
        this.setResult();
    }

    private setResult() {
        let tempArray = [];

        // set Result to reels
        for (let i = 0; i < this.slotMachine.reels.length; i++) {
            let index = i;
            tempArray = [];
            do {
                tempArray.push(this.resultArray[index]);
                index += 3;
            } while (index < this.resultArray.length);
            // console.log(`reel: ${i}, tempArray: ${tempArray}`);
            this.slotMachine.reels[i].setResultSymbols(tempArray);
        }
    }

    onSpinClick() {
        console.log('click');
        switch (this.state) {
            case EGameState.Ready:
                this.state = EGameState.Spinning;
                // this.spinButton.interactable = false;
                this.slotMachine.startSpin();
                // // 3秒後停止
                // this.scheduleOnce(() => {
                //     console.log('stop');
                //     this.state = EGameState.Stopping;
                //     this.slotMachine.stopSpin();
                // }, 3);
                break;

            case EGameState.Spinning:
                this.unscheduleAllCallbacks();
                this.slotMachine.stopSpin();
                this.state = EGameState.Stopping;
                break;

            default:
                break;
        }
    }

    showResult() {
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
        this.showWinLines();
    }

    private showWinLines() {
        this.winflag.forEach((flag, index) => {

            if (flag) {
                console.log(`line: ${index}`);
                lineResult(flag, index);
            }

            function lineResult(flag: boolean, index: number) {
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
                const lineNode = this.getLine();
                lineNode.parent = this.lineParent;
                lineNode.setPosition(0, positionY);
                lineNode.setRotationFromEuler(0, 0, degree);
                lineNode.active = true;
            }
        });
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