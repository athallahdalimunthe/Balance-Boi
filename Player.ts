import {
  _decorator, Component, Node, RigidBody2D, Vec2,
  input, Input, EventKeyboard, KeyCode,
  Label, director, tween, Vec3, Color, UITransform, AudioSource, AudioClip, sys // 🆕 added sys
} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
  @property(RigidBody2D) body!: RigidBody2D;
  @property(Label) scoreLabel!: Label;
  @property(Node) gameOverPanel!: Node;
  @property(Node) canvasNode: Node | null = null;

  @property(AudioSource) sfxSource: AudioSource = null!;
  @property(AudioClip) flipSfx: AudioClip = null!;
  @property(AudioClip) deathSfx: AudioClip = null!;

  private gravity = -10;
  private alive = true;
  private score = 0;
  private margin = 288;

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
    input.on(Input.EventType.TOUCH_START, this.flip, this);
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    if (this.body) this.body.gravityScale = this.gravity;
    this.schedule(this.tickScore, 1);

    if (this.gameOverPanel) this.gameOverPanel.active = false;

    const retryBtn = this.gameOverPanel?.getChildByName("RetryButton");
    if (retryBtn) {
      retryBtn.on(Node.EventType.MOUSE_DOWN, this.retry, this);
      retryBtn.on(Node.EventType.TOUCH_END, this.retry, this);
    }
  }

  onDestroy() {
    input.off(Input.EventType.TOUCH_START, this.flip, this);
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    this.unschedule(this.tickScore);
  }

  private onKeyDown(ev: EventKeyboard) {
    if (ev.keyCode === KeyCode.KEY_R) {
      this.gameOver();
    }
  }

  flip() {
    if (!this.alive) return;
    this.gravity *= -1;
    if (this.body) this.body.gravityScale = this.gravity;

    tween(this.node)
      .to(0.08, { scale: new Vec3(0.1, 0.3, 0.5) })
      .to(0.08, { scale: new Vec3(0.3, 0.3, 0.2) })
      .start();

    if (this.flipSfx && this.sfxSource) {
      this.sfxSource.playOneShot(this.flipSfx, 1);
    }

    if (this.body) {
      this.body.linearVelocity = new Vec2(0, this.gravity > 0 ? -6 : 7);
    }
  }

  tickScore() {
    if (!this.alive) return;
    this.score++;
    if (this.scoreLabel) {
      this.scoreLabel.string = `${this.score}`;
      this.scoreLabel.node.scale = new Vec3(1, 1, 1);
      tween(this.scoreLabel.node)
        .to(0.1, { scale: new Vec3(2.4, 2.4, 2) })
        .to(0.1, { scale: new Vec3(2, 3, 3) })
        .start();

      const col = this.rainbowColors[this.rainbowIndex];
      this.rainbowIndex = (this.rainbowIndex + 1) % this.rainbowColors.length;
      this.scoreLabel.color = col;
    }
  }

  update() {
    if (!this.alive) return;

    const canvas = this.canvasNode ?? director.getScene()!.getChildByName('Canvas');
    if (!canvas) return;

    const ui = canvas.getComponent(UITransform);
    if (!ui) return;

    const halfH = ui.contentSize.height / 2;
    const y = this.node.position.y;

    if (y > halfH + this.margin || y < -halfH - this.margin) {
      this.gameOver();
    }
  }

  gameOver() {
    if (!this.alive) return;
    this.alive = false;
    this.unschedule(this.tickScore);

    if (this.sfxSource && this.deathSfx) {
      this.sfxSource.stop();
      this.sfxSource.playOneShot(this.deathSfx, 1);
    }

    if (this.gameOverPanel) this.gameOverPanel.active = true;

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

    const bgmNode = director.getScene()!.getChildByName("BGM");
    if (bgmNode) {
      const bgmSource = bgmNode.getComponent(AudioSource);
      if (bgmSource && bgmSource.playing) {
        bgmSource.stop();
      }
    }

    // 🆕 Save score progress here:
    this.saveProgress();

// 🏁 Save best score (only for GAME mode)
const bestGame = parseInt(localStorage.getItem("bestGameScore") || "0");
if (this.score > bestGame) {
    localStorage.setItem("bestGameScore", this.score.toString());
}




  }

  retry() {
    director.loadScene(director.getScene()!.name!);
  }

  // 🆕 Save the score to localStorage
  private saveProgress() {
    const sceneName = director.getScene()!.name;
    if (sceneName === "HARDCORE") return; // ❌ Don't save Hardcore

    const key = sceneName === "OPP" ? "opp_highscore" : "game_highscore";
    const prev = sys.localStorage.getItem(key);
    const prevScore = prev ? parseInt(prev) : 0;

    if (this.score > prevScore) {
      sys.localStorage.setItem(key, this.score.toString());
      console.log(`🏆 New high score saved for ${sceneName}: ${this.score}`);
    } else {
      console.log(`ℹ️ Score not higher than previous (${prevScore}), not saved.`);
    }
  }
}
