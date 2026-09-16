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

    async startSpin() {
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
    updateHandler(state: EGameState, dt: number) {
        switch (state) {
            case EGameState.Ready:
                break;
            case EGameState.Spinning:
                this.reels.forEach(reel => {
                    reel.spinningHandler(dt);
                });
                break;
            case EGameState.Stopping:
                this.reels.forEach(reel => {
                    reel.stoppingHandler(dt);
                });
                // 如果三個輪子都停下，換狀態
                if (this.reels.every(r => { return r.reelStopped; })) {
                    this.game.state = EGameState.Scoring;
                }
                break;
            case EGameState.Scoring:
                break;
            default:
                break;
        }
    }
}

