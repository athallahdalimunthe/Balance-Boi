import { _decorator, Component, director, tween, Node, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Splash')
export class Splash extends Component {
    @property(Node)
    logo!: Node;   // assign your Sprite node here

    start() {
        // Add a UIOpacity component to control fade
        const opacity = this.logo.getComponent(UIOpacity) || this.logo.addComponent(UIOpacity);
        opacity.opacity = 0; // start invisible

        // Fade in -> wait -> fade out -> load StartMenu
        tween(opacity)
            .to(1, { opacity: 255 }) // fade in 1s
            .delay(1.5)               // hold for 1.5s
            .to(1, { opacity: 0 })    // fade out 1s
            .call(() => {
                director.loadScene("StartMenu"); // load StartMenu after splash
            })
            .start();
    }
}
