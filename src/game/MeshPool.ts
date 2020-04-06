import { Target } from "./Target";
import { Click } from "./Click";

class MeshPool {
  targetPoolCount = 100;
  clickPoolCount = 100;

  targets: Target[] = [];
  clicks: Click[] = [];

  constructor() {
    for (let i = 0; i < this.targetPoolCount; i++) {
      this.targets.push(new Target());
    }

    for (let i = 0; i < this.clickPoolCount; i++) {
      this.clicks.push(new Click());
    }
  }

  addTarget(target: Target): void {
    this.targets.push(target);
  }

  getTarget(): Target {
    let target: Target;

    if (this.targets.length > 0) {
      target = this.targets[this.targets.length - 1];
      this.targets.pop();
    }

    return target;
  }

  addClick(click: Click): void {
    this.clicks.push(click);
  }

  getClick(): Click {
    let click: Click;

    if (this.clicks.length > 0) {
      click = this.clicks[this.clicks.length - 1];
      this.clicks.pop();
      
    }

    click.changeValue = 0;
    return click;
  }


}

export const meshPool = new MeshPool();