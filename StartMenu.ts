import { _decorator, Component, director, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StartMenu')
export class StartMenu extends Component {

    @property(Button)
    playButton: Button = null!;

    @property(Button)
    hardcoreButton: Button = null!;   // <-- new Hardcore button

    @property(Button)
    oppButton: Button = null!; 

    

    start() {
        // Connect Play button
        this.playButton.node.on(Button.EventType.CLICK, this.onPlay, this);

        // Connect Hardcore button
        this.hardcoreButton.node.on(Button.EventType.CLICK, this.onHardcore, this);

        
        this.oppButton.node.on(Button.EventType.CLICK, this.onOpp, this);

        
    }

    onPlay() {
        // Load the main game scene
        director.loadScene("GAME");
    }

    onHardcore() {
        // Load the Hardcore scene
        director.loadScene("HARDCORE");
    }

    onOpp() {

        director.loadScene("OPP");
    }
}
