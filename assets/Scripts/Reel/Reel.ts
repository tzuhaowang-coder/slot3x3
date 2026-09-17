import { _decorator, Component, instantiate, Node, Prefab, Sprite, SpriteFrame, Vec3 } from 'cc';
import { SlotSymbol } from './SlotSymbol';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

const SYMBOL_HEIGHT = 256;
const SYMBOL_COUNT_EACH_REEL = 5;
const Reel_TOTAL_HEIGHT = SYMBOL_HEIGHT * SYMBOL_COUNT_EACH_REEL;
const BOTTOM_POSITION = SYMBOL_HEIGHT * -2;
const REEL_SPEED = SYMBOL_HEIGHT * 32;

@ccclass('Reel')
export class Reel extends Component {
    @property({ type: SpriteFrame }) public symbolSpriteArray: SpriteFrame[] = [];
    @property(Prefab) symbolPrefab: Prefab = null;
    manager: GameManager = null;
    symbols: SlotSymbol[];
    finals: SlotSymbol[];   // show Result 的symbol

    isSpining: boolean = false;
    finalSymbolIndexIsSet: boolean = false;    // 是否已經設定好要顯示的 Symbol
    firstResultReady: boolean = false; // 最下面的Symbol 是否已經到最上面就位
    isLastMoveSet: boolean = false; // 最後一圈要走的距離
    reelStopped: boolean = false;

    lastMove: number = 0;
    isStopping: boolean = false;
    result: number[] = [];
    state: EReelState = EReelState.Stopped;

    start() {
        this.initSymbols(-(SYMBOL_COUNT_EACH_REEL - 1) / 2);
    }

    private initSymbols(loopStart: number) {
        for (let i = 0; i < SYMBOL_COUNT_EACH_REEL; i++) {
            const n = instantiate(this.symbolPrefab);
            n.setPosition(0, SYMBOL_HEIGHT * loopStart);
            this.node.addChild(n);
            loopStart += 1;
        }

        this.symbols = this.getComponentsInChildren(SlotSymbol);
        return loopStart;
    }

    spin() {
        this.reelStopped = false;
        this.isSpining = true;
    }

    stop() {
        this.isStopping = true;
    }

    // stoppingHandler(dt: number): void {
    //     if (this.isStopping) {
    //         if (!this.finalSymbolIndexIsSet) {

    //             // todo 先抓要顯示的三個Symbols 做標記
    //             let sorted = this.symbols.sort((a, b) => b.node.position.y - a.node.position.y);
    //             this.finals = sorted.slice(2);

    //             this.result.forEach((r, index) => {
    //                 this.finals[index].settingIndex = r;
    //                 console.log(`r: ${r}`);
    //             });

    //             this.finalSymbolIndexIsSet = true;
    //         }
    //         if (this.firstResultReady) { // 最下方的結果Symbol 已經到最上面就位
    //             if (!this.isLastMoveSet) {
    //                 this.lastMove = this.finals[2].node.position.y + 256;
    //                 this.isLastMoveSet = true;
    //             }
    //             this.symbolLoop(dt, this.lastMove * 2);

    //             if (this.finals[2].node.position.y <= -256) {
    //                 this.isSpining = false;
    //                 this.isStopping = false;
    //                 this.finalSymbolIndexIsSet = false;
    //                 this.firstResultReady = false;
    //                 this.reelStopped = true;

    //                 let overrun = -256 - this.finals[2].node.position.y;

    //                 this.symbols.forEach(f => {
    //                     f.node.translate(new Vec3(0, overrun, 0));
    //                     console.log('結束');
    //                 });
    //             }
    //         } else {
    //             this.symbolLoop(dt, REEL_SPEED);
    //         }
    //     } else {
    //         if (this.reelStopped) {
    //             return;
    //         }
    //         this.symbolLoop(dt, REEL_SPEED);
    //     }
    // }

    // spinningHandler(dt: number) {
    //     if (!this.isSpining) {
    //         return;
    //     }
    //     this.symbolLoop(dt, REEL_SPEED);
    // }

    newHandler(dt: number) {
        if (this.isStopping) {
            if (!this.finalSymbolIndexIsSet) {

                // todo 先抓要顯示的三個Symbols 做標記
                let sorted = this.symbols.sort((a, b) => b.node.position.y - a.node.position.y);
                this.finals = sorted.slice(2);

                this.result.forEach((r, index) => {
                    this.finals[index].settingIndex = r;
                    console.log(`r: ${r}`);
                });

                this.finalSymbolIndexIsSet = true;
            }
            if (this.firstResultReady) { // 最下方的結果Symbol 已經到最上面就位
                if (!this.isLastMoveSet) {
                    this.lastMove = this.finals[2].node.position.y + 256;
                    this.isLastMoveSet = true;
                }
                this.symbolLoop(dt, this.lastMove * 2);

                if (this.finals[2].node.position.y <= -256) {
                    this.isSpining = false;
                    this.isStopping = false;
                    this.finalSymbolIndexIsSet = false;
                    this.firstResultReady = false;
                    this.reelStopped = true;

                    let overrun = -256 - this.finals[2].node.position.y;

                    this.symbols.forEach(f => {
                        f.node.translate(new Vec3(0, overrun, 0));
                        console.log('結束');
                    });
                }
            } else {
                this.symbolLoop(dt, REEL_SPEED);
            }
        } else {
            if (this.reelStopped) {
                return;
            }
            this.symbolLoop(dt, REEL_SPEED);
        }
    }

    stateTestHandler(dt: number) {
        switch (this.state) {
            case EReelState.Spinning:
                this.symbolLoop(dt, REEL_SPEED);
                break;

            case EReelState.PreparingFinalSymbol:
                // TODO: 設定結果的部份移到這裡
                this.symbolLoop(dt, REEL_SPEED);
                break;

            case EReelState.Stopping:
                if (!this.finalSymbolIndexIsSet) {

                    // todo 先抓要顯示的三個Symbols 做標記
                    let sorted = this.symbols.sort((a, b) => b.node.position.y - a.node.position.y);
                    this.finals = sorted.slice(2);

                    this.result.forEach((r, index) => {
                        this.finals[index].settingIndex = r;
                        console.log(`r: ${r}`);
                    });

                    this.finalSymbolIndexIsSet = true;
                }
                if (this.firstResultReady) { // 最下方的結果Symbol 已經到最上面就位
                    if (!this.isLastMoveSet) {
                        this.lastMove = this.finals[2].node.position.y + 256;
                        this.isLastMoveSet = true;
                    }
                    this.symbolLoop(dt, this.lastMove * 2);

                    if (this.finals[2].node.position.y <= -256) {
                        this.isSpining = false;
                        this.isStopping = false;
                        this.finalSymbolIndexIsSet = false;
                        this.firstResultReady = false;
                        this.reelStopped = true;

                        let overrun = -256 - this.finals[2].node.position.y;

                        this.symbols.forEach(f => {
                            f.node.translate(new Vec3(0, overrun, 0));
                            console.log('結束');
                        });
                    }
                } else {
                    this.symbolLoop(dt, REEL_SPEED);
                }

                break;

            case EReelState.Stopped:

                break;
        }
    }



    private symbolLoop(dt: number, speed: number) {
        const move = new Vec3(0, -1 * speed * dt, 0);
        this.symbols.forEach(s => {
            s.node.translate(move);

            if (s.node.position.y <= BOTTOM_POSITION) {
                let newIndex = s.settingIndex == -1 ? Math.floor(Math.random() * this.symbolSpriteArray.length) : s.settingIndex;
                s.moveUpAndChangeRandomSymbol(Reel_TOTAL_HEIGHT, this.symbolSpriteArray[newIndex]);
                if (this.finalSymbolIndexIsSet && !this.firstResultReady) {
                    this.firstResultReady = true;
                    console.log('最下面顯示 Symbol 已經到最上面就位');
                }
            }
        });
    }

    setResultSymbols(result: number[]) {
        this.result = result;
    }
}
enum EReelState {
    Spinning,
    PreparingFinalSymbol,   // 設定好Symbol，才能開始減速停止
    Stopping,               // 停止
    Stopped,                // 完全停下來
}