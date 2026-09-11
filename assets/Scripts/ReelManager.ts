import { _decorator, Component, instantiate, Node, Prefab, tween } from 'cc';
import { Reel } from './Reel/Reel';
const { ccclass, property } = _decorator;

@ccclass('ReelManager')
export class ReelManager extends Component {
    stopSpin() {
        throw new Error('Method not implemented.');
    }
    @property({ type: Prefab })
    ReelPrefab: Prefab = null;

    reels: Reel[] = [];

    reelWidth: number = 256;
    reelHeight: number = 256;

    start() {

    }

    // 生成輪子
    initReels() {
        for (let i = 0; i < 3; i++) {
            const reel = instantiate(this.ReelPrefab);
            this.node.addChild(reel);
            // todo: Set position
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


}

