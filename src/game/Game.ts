import { Subject } from 'rxjs';
import { Scene, Vector3, Color, Group, Box3 } from 'three';
import _ from 'lodash';

import { Click, ClickSettings } from "./Click";
import { Target, TargetSettings } from './Target';
import Heart from "./Heart";


export interface Bounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export default class Game extends Scene {
  private _bounds: Bounds = { bottom: 0, left: 0, right: 0, top: 0 };

  private lifes = new Group();
  private totalLifeCount = 10;

  onLifeOut = new Subject<void>();
  score = 0;

  constructor() {
    super();

    this.background = new Color(0xf9f9f9);
    this.add(this.lifes);
    this.addLifes();
    this.showLifes = false;
  }

  update(time: number): void {
    const targets = this.targets;
    const clicks = this.clicks;

    targets.forEach(target => target.updatePosition(time));
    this.handleCollision();
    targets.forEach(target => target.updateSize(time));
    this.separateCircles(targets);

    clicks.forEach(click => click.update(time));
  }

  handleCollision(): void {
    const circles = this.targets
    for (const circle of circles) {
      if (Math.abs(circle.position.x) + circle.size - this.bounds.right > 0) {
        circle.direction = new Vector3(-circle.direction.x, circle.direction.y, 0);
      }

      if (Math.abs(circle.position.y) + circle.size - this.bounds.top > 0) {
        circle.direction = new Vector3(circle.direction.x, -circle.position.y, 0);
      }
    }

    for (let i = 0; i < circles.length; i++) {
      const circle = circles[i];
      for (let j = i + 1; j < circles.length; j++) {
        const circle2 = circles[j];
        if (circle.size + circle2.size - circle.position.distanceTo(circle2.position) > 0) {
          const v1 = circle.direction.clone();
          const v2 = circle2.direction.clone();
          const x1 = circle.position.clone();
          const x2 = circle2.position.clone();
          circle.direction = v1.clone().sub(x1.clone().sub(x2).multiplyScalar(v1.clone().sub(v2).dot(x1.clone().sub(x2)) / Math.pow(x1.clone().sub(x2).length(), 2)));
          circle2.direction = v2.clone().sub(x2.clone().sub(x1).multiplyScalar(v2.clone().sub(v1).dot(x2.clone().sub(x1)) / Math.pow(x2.clone().sub(x1).length(), 2)));
        }
      }
    }
  }

  separateCircles(circles: Target[]): void {
    const changedCircles: Target[] = [];

    for (const circle of circles) {
      let diff = Math.abs(circle.position.x) + circle.size - this.bounds.right;
      if (diff > 0) {
        circle.position.x -= diff * Math.sign(circle.position.x);
        changedCircles.push(circle);
      }
      diff = Math.abs(circle.position.y) + circle.size - this.bounds.top;
      if (diff > 0) {
        circle.position.y -= diff * Math.sign(circle.position.y);
        changedCircles.push(circle);
      }
    }

    for (let i = 0; i < circles.length; i++) {
      const circle = circles[i];
      for (let j = i + 1; j < circles.length; j++) {
        const circle2 = circles[j];
        const overlapSize = circle.size + circle2.size - circle.position.distanceTo(circle2.position);
        if (overlapSize > 0) {
          const v1 = circle.position.clone().sub(circle2.position).normalize().multiplyScalar(overlapSize / 2 + 1e-10);
          circle.position.add(v1);
          circle2.position.add(v1.negate());
          changedCircles.push(circle, circle2);
        }
      }
    }

    if (changedCircles.length > 0) {
      this.separateCircles(_.uniq(changedCircles));
    }
  }

  reset(): void {
    this.targets.forEach(target => target.visible = false);
    this.lifes.children.forEach((heart: Heart) => heart.visible = true);
  }

  onClick(position: Vector3): void {
    const target = this.getTargetAt(position);

    if (target) {
      this.removeTarget(target)
      this.addClick({ pos: position, clickType: 'Success' });
    } else {
      this.addClick({ pos: position, clickType: 'Fail' });
      this.removeLife();
      if (this.lifeCount === 0) {
        this.onLifeOut.next();
      }
    }
  }


  addTarget(targetSettings?: TargetSettings): Target {
    let target: Target;

    if (!targetSettings.pos) {
      targetSettings.pos = this.getRandomPosition();
    }

    if (!targetSettings.direction) {
      targetSettings.direction = new Vector3(_.random(-1, 1, true), _.random(-1, 1, true), 0);
    }

    if (this.hiddenTargets.length > 0) {
      target = this.hiddenTargets[0];
      target.visible = true;
    } else {
      target = new Target();
      this.add(target);
    }

    target.resetSettings(targetSettings);

    return target;
  }

  removeTarget(target: Target): void {
    target.visible = false;
  }

  addClick(clickSettings: ClickSettings): Click {
    let click: Click;

    if (this.hiddenClicks.length > 0) {
      click = this.hiddenClicks[0];
      click.visible = true;
    } else {
      click = new Click();
      this.add(click);
    }

    click.resetSettings(clickSettings);

    return click;
  }

  removeClick(click: Click): void {
    click.visible = false;
  }

  addLifes(): void {
    const spaceBetween = 0.03;
    this.add(this.lifes);

    const heart = new Heart();
    const box = new Box3().setFromObject(heart);
    const width = box.max.x - box.min.x;

    let x = 0;
    heart.position.set(0, 0, 0)
    this.lifes.add(heart);
    x -= width + spaceBetween;

    for (let i = 1; i < this.totalLifeCount; i++) {
      const heart = new Heart();
      heart.position.set(x, 0, 0);
      this.lifes.add(heart);
      x -= width + spaceBetween;
    }
  }

  updateLifesPosition(): void {
    const margin = 0.03;
    const heart = this.lifes.children[0] as Heart;

    heart.geometry.computeBoundingBox();
    const boundingBox = heart.geometry.boundingBox;

    const translateX = boundingBox.max.x * heart.scale.x;
    const translateY = boundingBox.max.y * heart.scale.y;
    
    this.lifes.position.set(this.bounds.right - translateX - margin, this.bounds.top - translateY - margin, 0);
  }

  removeLife(): void {
    for (let i = this.lifes.children.length - 1; i >= 0; i--) {
      const heart = this.lifes.children[i] as Heart;
      if (heart.visible) {
        heart.visible = false;
        return;
      }
    }
  }

  get lifeCount(): number {
    return this.lifes.children.filter(life => (life instanceof Heart) && life.visible).length;
  }

  getTargetAt(position: Vector3): Target {
    for (const target of this.targets) {
      if (target.position.distanceTo(position) < target.size) {
        return target;
      }
    }
    return undefined;
  }

  getRandomPosition(): Vector3 {
    let position: Vector3;
    outer:
    for (; ;) {
      position = new Vector3(_.random(this.bounds.left, this.bounds.right), _.random(this.bounds.bottom, this.bounds.top), 0);
      for (const target of this.targets) {
        if (target.position.distanceTo(position) < target.size) {
          continue outer;
        }
      }
      return position;
    }
  }



  get targets(): Target[] {
    return this.children.filter(value => (value instanceof Target) && value.visible) as Target[];
  }

  get hiddenTargets(): Target[] {
    return this.children.filter(value => (value instanceof Target) && !value.visible) as Target[];
  }

  get clicks(): Click[] {
    return this.children.filter(value => (value instanceof Click) && value.visible) as Click[];
  }

  get hiddenClicks(): Click[] {
    return this.children.filter(value => (value instanceof Click) && !value.visible) as Click[];
  }

  get bounds(): Bounds {
    return this._bounds;
  }

  set bounds(bounds: Bounds) {
    this._bounds = bounds;
    this.updateLifesPosition();
  }

  get showLifes(): boolean {
    return this.lifes.visible;
  }

  set showLifes(show: boolean) {
    this.lifes.visible = show;
  }

}