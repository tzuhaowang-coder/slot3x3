import { _decorator, Component, instantiate, lerp, Node, Prefab, Sprite, SpriteFrame, Toggle, Vec3 } from 'cc';
import { SlotSymbol } from './Reel/SlotSymbol';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {
    @property({ type: SpriteFrame }) public symbolSpriteArray: SpriteFrame[] = [];

    @property(Prefab) symbolPrefab: Prefab = null;

    @property(Toggle) public myToggle: Toggle = null!;

    symbols: SlotSymbol[];
    finals: SlotSymbol[];   // show Result 的symbol
    symbolCount = 5;
    symbolHeight: number = 256;

    bottomPosition: number = 0;
    totalHeight: number = 0;
    speed: number = 2048;

    isSpining: boolean = false;
    marked: boolean = false;
    firstResultReady: boolean = false;
    private _isStopping: boolean = false;
    alreadyGotLastMove: any;
    lastMove: number;

    public get isStopping(): boolean {
        return this._isStopping;
    }
    public set isStopping(value: boolean) {
        if (value) {
            // todo 先抓Symbols 做標記要顯示的三個
            let sorted = this.symbols.sort((a, b) => b.node.position.y - a.node.position.y);
            let finals = sorted.slice(2);
            let targetIndex = 0;

            // A,B,C
            finals.forEach((f) => {
                f.settingIndex = targetIndex;
                targetIndex++;
            });
        }
        this._isStopping = value;
    }

    start() {
        let loopStart = -(this.symbolCount - 1) / 2;
        this.bottomPosition = this.symbolHeight * loopStart;
        console.log(`bottomPosition: ${this.bottomPosition}`);
        this.totalHeight = this.symbolCount * this.symbolHeight;

        this.initSymbols(loopStart);

        if (this.myToggle) {
            this.myToggle.isChecked = this.isSpining;
        }
        this.myToggle.node.on('toggle', this.onToggleChanged, this);
    }

    private initSymbols(loopStart: number) {
        for (let i = 0; i < this.symbolCount; i++) {
            const n = instantiate(this.symbolPrefab);
            n.setPosition(0, this.symbolHeight * loopStart);
            this.node.addChild(n);
            loopStart += 1;
        }

        this.symbols = this.getComponentsInChildren(SlotSymbol);
        return loopStart;
    }

    /**
     * 2. 定義事件回呼函式（當 Toggle 被點擊時觸發）
     * @param toggle 當前的 Toggle 組件
     */
    onToggleChanged(toggle: Toggle) {
        // 將 Toggle 的最新狀態賦值給你的布林值變數
        this.isSpining = toggle.isChecked;
        this.scheduleOnce(() => {
            this.isStopping = true;
        }, 3);
        console.log(`目前布林值狀態變更為: ${this.isSpining}`);
    }

    async spin() {
        this.isSpining = true;
    }

    protected update(dt: number): void {
        if (this.isSpining) {
            if (this.isStopping) {
                if (!this.marked) {
                    // todo 先抓Symbols 做標記要顯示的三個
                    let sorted = this.symbols.sort((a, b) => b.node.position.y - a.node.position.y);
                    this.finals = sorted.slice(2);
                    let targetIndex = 0;

                    // A,B,C
                    this.finals.forEach((f) => {
                        f.settingIndex = targetIndex;
                        targetIndex++;
                    });
                    this.marked = true;
                }
                if (this.firstResultReady) { // 最下面顯示 Symbol 已經到最上面就位
                    if (!this.alreadyGotLastMove) {
                        this.lastMove = -(this.finals[2].node.position.y + 256);
                        this.alreadyGotLastMove = true;
                    }
                    this.symbols.forEach(s => {
                        s.node.translate(new Vec3(0, this.lastMove / 2 * dt, 0));

                        if (s.node.position.y <= this.bottomPosition) {
                            let newIndex = s.settingIndex == -1 ? Math.floor(Math.random() * this.symbolSpriteArray.length) : s.settingIndex;
                            s.moveUpAndChangeRandomSymbol(this.totalHeight, this.symbolSpriteArray[newIndex]);
                        }
                    });
                    if (this.finals[2].node.position.y <= -256) {
                        this.isSpining = false;
                        this.isStopping = false;
                        this.marked = false;
                        this.firstResultReady = false;

                        this.myToggle.isChecked = false;

                        let overrun = -256 - this.finals[2].node.position.y;
                        console.log(`overrun: ${overrun}`);
                        this.symbols.forEach(s => {
                            s.node.translate(new Vec3(0, overrun, 0));
                            console.log('結束')
                        });
                    }
                } else {
                    const move = new Vec3(0, -1 * this.speed * dt, 0);
                    this.symbols.forEach(s => {
                        s.node.translate(move);
                        if (s.node.position.y <= this.bottomPosition) {
                            // console.log(`${s.node.position.y} <= ${this.bottomPosition}`);
                            if (s.settingIndex == -1) {
                                const randomIndex = Math.floor(Math.random() * this.symbolSpriteArray.length);
                                s.moveUpAndChangeRandomSymbol(this.totalHeight, this.symbolSpriteArray[randomIndex]);
                            } else {
                                if (this.marked) {
                                    if (!this.firstResultReady) {
                                        s.moveUpAndChangeRandomSymbol(this.totalHeight, this.symbolSpriteArray[s.settingIndex]);
                                        this.firstResultReady = true;
                                        console.log('最下面顯示 Symbol 已經到最上面就位');
                                    }
                                }
                            }
                        }
                    });
                }

            } else {
                const move = new Vec3(0, -1 * this.speed * dt, 0);
                this.symbols.forEach(s => {
                    s.node.translate(move);
                    if (s.node.position.y <= this.bottomPosition) {
                        // console.log(`${s.node.position.y} <= ${this.bottomPosition}`);
                        const randomIndex = Math.floor(Math.random() * this.symbolSpriteArray.length);
                        s.moveUpAndChangeRandomSymbol(this.totalHeight, this.symbolSpriteArray[randomIndex]);
                    }
                });
            }


        }
    }
}

