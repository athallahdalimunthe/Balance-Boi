import {
  _decorator, Component, Node, RigidBody2D, Vec2,
  input, Input, EventKeyboard, KeyCode,
  Label, director, tween, Vec3, Color, UITransform
} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
  @property(RigidBody2D) body!: RigidBody2D;
  @property(Label) scoreLabel!: Label;
  @property(Node) gameOverPanel!: Node;
  /** optional: if your Canvas node has another name or isn't root, drag it here in Inspector */
  @property(Node) canvasNode: Node | null = null;

  private gravity = -10;
  private alive = true;
  private score = 0;
  private margin = 20; // extra margin in px outside canvas before dying

  private rainbowColors: Color[] = [
    new Color(255, 0, 0),
    new Color(255, 127, 0),
    new Color(255, 255, 0),
    new Color(0, 255, 0),
    new Color(0, 0, 255),
    new Color(75, 0, 130),
    new Color(148, 0, 211),
  ];
  private rainbowIndex = 0;

  onLoad() {
    // input
    input.on(Input.EventType.TOUCH_START, this.flip, this);
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);

    // initial physics
    if (this.body) this.body.gravityScale = this.gravity;

    // tick score every second
    this.schedule(this.tickScore, 1);

    // hide panel at start
    if (this.gameOverPanel) this.gameOverPanel.active = false;

// auto-bind Retry button
const retryBtn = this.gameOverPanel?.getChildByName("RetryButton");
if (retryBtn) {
  const btnComp = retryBtn.getComponent('cc.Button');
  if (btnComp) {
    // listen to click
    retryBtn.on(Node.EventType.MOUSE_DOWN, this.retry, this);
    retryBtn.on(Node.EventType.TOUCH_END, this.retry, this); // works on mobile too
  }
}


  }

  onDestroy() {
    input.off(Input.EventType.TOUCH_START, this.flip, this);
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    this.unschedule(this.tickScore);
  }

  // debug key (press R in editor/play) to force game over
  private onKeyDown(ev: EventKeyboard) {
    if (ev.keyCode === KeyCode.KEY_R) {
      this.gameOver();
    }
  }

  flip() {
    if (!this.alive) return;
    // invert gravity
    this.gravity *= -1;
    if (this.body) this.body.gravityScale = this.gravity;

    // a small squash & stretch to feel responsive
    tween(this.node)
      .to(0.08, { scale: new Vec3(1.2, 0.8, 1) })
      .to(0.08, { scale: new Vec3(1, 1, 1) })
      .start();

    // small velocity bump for snappier feel (optional)
    if (this.body) {
      this.body.linearVelocity = new Vec2(0, this.gravity > 0 ? -12 : 12);
    }
  }

  // score tick: rainbow + pop
  tickScore() {
    if (!this.alive) return;
    this.score++;
    if (this.scoreLabel) {
      this.scoreLabel.string = `${this.score}`;

      // pop animation
      this.scoreLabel.node.scale = new Vec3(1, 1, 1);
      tween(this.scoreLabel.node)
        .to(0.1, { scale: new Vec3(1.4, 1.4, 1) })
        .to(0.1, { scale: new Vec3(1, 1, 1) })
        .start();

      // rainbow color
      const col = this.rainbowColors[this.rainbowIndex];
      this.rainbowIndex = (this.rainbowIndex + 1) % this.rainbowColors.length;
      this.scoreLabel.color = col;
    }
  }

  update() {
    if (!this.alive) return;

    // Get canvas node (use provided one or fallback to scene "Canvas")
    const canvas = this.canvasNode ?? director.getScene()!.getChildByName('Canvas');
    if (!canvas) return;

    const ui = canvas.getComponent(UITransform);
    if (!ui) return;

    // UI coordinate: center is (0,0) for nodes under Canvas
    const halfH = ui.contentSize.height / 2;

    // player's y (assuming player is child of Canvas). If player is NOT a child of Canvas,
    // you can convert world->canvas space; for simplicity this assumes player is under Canvas.
    const y = this.node.position.y;

    // if outside visible canvas bounds (top or bottom) -> die
    if (y > halfH + this.margin || y < -halfH - this.margin) {
      this.gameOver();
    }
  }

  gameOver() {
    if (!this.alive) return;
    this.alive = false;
    this.unschedule(this.tickScore);

    // show panel (your "RETRY??" label should be inside this panel)
    if (this.gameOverPanel) this.gameOverPanel.active = true;

    // optional: small screen shake if you have a camera node called "Main Camera"
    const cam = director.getScene()!.getChildByName('Main Camera');
    if (cam) {
      const originalPos = cam.position.clone();
      tween(cam)
        .to(0.05, { position: originalPos.add3f(10, 0, 0) })
        .to(0.05, { position: originalPos.add3f(-20, 0, 0) })
        .to(0.05, { position: originalPos.add3f(10, 0, 0) })
        .to(0.05, { position: originalPos })
        .start();
    }
  }

  // Called from Retry button (or from code)
  retry() {
    console.log('🔄 Retry requested');
    director.loadScene(director.getScene()!.name!);
  }
}
