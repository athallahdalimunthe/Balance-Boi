import { _decorator, Component, director, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StartMenu')
export class StartMenu extends Component {

    @property(Button)
    playButton: Button = null!;

    start() {
        // Connect Play button
        this.playButton.node.on(Button.EventType.CLICK, this.onPlay, this);
    }

    onPlay() {
        // Load the main game scene
        director.loadScene("GAME");
    }
}
