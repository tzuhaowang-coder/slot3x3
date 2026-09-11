import { _decorator, Button, Component, EventHandler, Label, Node } from 'cc';
import { Slot } from './Slot';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property({ type: Slot }) slotMachine: Slot = null;
    @property({ type: Button }) spinButton: Button = null;
    @property({ type: Label }) scoreLabel: Label = null;
    state: EGameState = EGameState.Ready;

    start() {
        this.initSpinButton();

    }

    setScore(score: number) {
        this.scoreLabel.string = `${score}`;
    }

    private initSpinButton() {
        let event = new EventHandler();
        event.target = this.node;
        event.component = this.name;
        event.handler = 'onSpinClick';

        this.spinButton.clickEvents.push(event);
    }

    onSpinClick() {
        console.log('spin');
        switch (this.state) {
            case EGameState.Ready:
                this.state = EGameState.Spining;
                this.spinButton.interactable = false;
                this.slotMachine.startSpin();
                break;

            case EGameState.Spining:
                this.slotMachine.stopSpin();
                break;

            default:
                break;
        }
    }
}

enum EGameState {
    Ready,
    Spining,
    Stop,
}