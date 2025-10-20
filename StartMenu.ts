import { _decorator, Component, director, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StartMenu')
export class StartMenu extends Component {

    @property(Button)
    playButton: Button = null!;

    @property(Button)
    hardcoreButton: Button = null!;

    @property(Button)
    oppButton: Button = null!;

    @property(Button)
    skinButton: Button = null!;   // ✅ New Skin button reference

    start() {
        // Connect Play button
        this.playButton.node.on(Button.EventType.CLICK, this.onPlay, this);

        // Connect Hardcore button
        this.hardcoreButton.node.on(Button.EventType.CLICK, this.onHardcore, this);

        // Connect OPP button
        this.oppButton.node.on(Button.EventType.CLICK, this.onOpp, this);

        // ✅ Connect Skin button
        if (this.skinButton) {
            this.skinButton.node.on(Button.EventType.CLICK, this.onSkin, this);
        }
    }

    onPlay() {
        director.loadScene("GAME");
    }

    onHardcore() {
        director.loadScene("HARDCORE");
    }

    onOpp() {
        director.loadScene("OPP");
    }

    // ✅ New function for Skin Scene
    onSkin() {
        director.loadScene("SKIN");   // Make sure your Skin scene name matches exactly
    }
}
