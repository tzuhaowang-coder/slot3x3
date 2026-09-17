import { _decorator, Component, instantiate, Node, Prefab, tween } from 'cc';
import { Reel } from './Reel/Reel';
import { EGameState, GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('ReelManager')
export class Slot extends Component {
    @property({ type: Prefab }) ReelPrefab: Prefab = null;
    @property({ type: Node }) mask: Node = null;
    game: GameManager = null;

    reels: Reel[] = [];

    reelWidth: number = 256;

    private _currentResolve: (value: void | PromiseLike<void>) => void;

    private _state: EGameState = EGameState.Ready;


    public get state(): EGameState {
        return this._state;
    }
    public set state(value: EGameState) {
        if (this._state == value) return;
        this._state = value;
    }

    // 生成輪子
    initReels() {
        let count = -1;
        // 從左到右生成3個輪子  0,1,2
        for (let i = 0; i < 3; i++) {
            const reel = instantiate(this.ReelPrefab);
            this.mask.addChild(reel);
            // todo: Set position
            reel.setPosition(this.reelWidth * count, 0);
            count++;
            this.reels.push(reel.getComponent(Reel));
        }
    }

    async onSpin() {

        return new Promise<void>((resolve) => {
            // 外包给update呼叫解決
            this._currentResolve = resolve;

            this.startSpin();
        });
    }

    async startSpin() {
        console.log('start spin');
        this.state = EGameState.Spinning;

        // 2秒後停止
        this.scheduleOnce(() => {
            this.stopSpin();
        }, 2);

        for (let index = 0; index < this.reels.length; index++) {
            const reel = this.reels[index];
            reel.spin();
            await new Promise<void>((resolve) => {
                tween(this.node).delay(0.3).call(() => { resolve(); })
                    .start();
            });
        }
    }

    async stopSpin() {
        console.log('stop spin');
        this.unscheduleAllCallbacks();

        this.state = EGameState.Stopping;
        for (let index = 0; index < this.reels.length; index++) {
            const reel = this.reels[index];
            reel.stop();
            await new Promise<void>((resolve) => {
                tween(this.node).delay(0.3).call(() => { resolve(); })
                    .start();
            });
        }
    }

    initial(manager: GameManager) {
        this.game = manager;
        this.initReels();
    }

    update(dt: number) {
        switch (this.state) {
            case EGameState.Ready:
                break;
            case EGameState.Spinning:
            // this.reels.forEach(reel => {
            //     // reel.spinningHandler(dt);
            //     reel.newHandler(dt);
            // });
            // break;
            case EGameState.Stopping:
                this.reels.forEach(reel => {
                    // reel.stoppingHandler(dt);
                    reel.newHandler(dt);
                });
                // 如果三個輪子都停下，換狀態
                if (this.reels.every(r => { return r.reelStopped; })) {
                    // 在這裡解決promise
                    this._currentResolve();
                }
                break;
            default:
                break;
        }
    }
}