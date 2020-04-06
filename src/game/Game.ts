import { Target } from "./Target";
import _ from 'lodash';
import * as Three from 'three';
import { Scene, Vector3, Color, Mesh, FontLoader, TextGeometry, Group } from 'three';
import { GamePhysics, Bounds } from './GamePhysics'
import helvetikerRegular from '../fonts/helvetiker_regular.typeface.json';
import { Click, ClickSettings } from "./Click";
import { TargetSettings } from "./GameComponent";
import Heart from "./Heart";

import { Subject } from 'rxjs';
import { meshPool } from "./MeshPool";

export default class Game extends Scene {
  private bounds2: Bounds = { bottom: 0, left: 0, right: 0, top: 0 };
  private score2 = 0;

  targets: Target[] = [];
  clicks: Click[] = [];

  gamePhysics = new GamePhysics();
  hearts = new Group();
  lifeCount = 10;
  onLifeOut = new Subject<void>();
  scoreMesh: Mesh;

  constructor() {
    super();

    this.background = new Color(0xf9f9f9);
    // this.add(this.hearts);
    // this.addLifes();
    this.gamePhysics.circles = this.targets;
  }

  reset(): void {
    _.remove(this.targets);
    _.remove(this.clicks);
    _.remove(this.children);

    this.score = 0;

    this.addLifes();
  }

  update(time: number): void {
    this.gamePhysics.updateState(time);
    this.clicks.forEach(click => click.update(time));

    for (let i = 0; i < this.clicks.length; i++) {
      const click = this.clicks[i];
      if (click.changeValue > 1) {
        this.removeClick(click);
        break;
      }
    }

    for (let i = 0; i < this.targets.length; i++) {
      const target = this.targets[i];
      if (target.sizeChangeValue > 1 && target.size === 0) {
        this.removeTarget(target);
        break;
      }
    }
  }


  onClick(position: Vector3): void {
    const target = this.getTargetAt(position);

    if (target !== undefined) {
      this.removeTarget(target);
      this.addClick({ position, color: new Color(0x00ff00) });
    } else {
      this.addClick({ position, color: new Color(0xff0000) });
      this.lifes.pop();
      if (this.lifes.length === 0) {
        this.onLifeOut.next();
      }
    }


  }

  addTarget(targetSettings?: TargetSettings): Target {
    const target = meshPool.getTarget();
    
    target.settings = targetSettings;
    this.targets.push(target);
    this.add(target);
    return target;
  }

  removeTarget(target: Target): void {
    _.remove(this.targets, target);
    this.remove(target);
    meshPool.addTarget(target);
  }

  addClick(clickSettings: ClickSettings): Click {
    const click = meshPool.getClick();
    click.settings = clickSettings;
    this.clicks.push(click);
    this.add(click);
    return click;
  }

  removeClick(click: Click): void {
    _.remove(this.clicks, click);
    this.remove(click);
    _.remove(this.children, click);
    meshPool.addClick(click);
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

  getText(text: string, position: Vector3): Mesh {
    const loader = new FontLoader();
    const font = loader.parse(helvetikerRegular);

    const geometry = new TextGeometry(text, {
      font,
      size: 1,
      height: 0,
    });

    const textMaterial = new Three.MeshStandardMaterial(
      { color: 0xff0000 }
    );

    const mesh = new Mesh(geometry, textMaterial);

    mesh.position.set(position.x, position.y, position.z);
    mesh.scale.set(0.2, 0.2, 1);

    return mesh;
  }

  addLifes(): void {
    _.remove(this.lifes);

    let x = this.bounds.right - 0.2;

    for (let i = 0; i < this.lifeCount; i++) {
      const heart = new Heart();
      heart.position.set(x, this.bounds.top - 0.2, 0);
      this.lifes.push(heart);
      x -= 0.3;
    }
  }

  set score(score: number) {
    // this.score2 = score;


    // if (!this.scoreMesh) {
    //   this.scoreMesh = this.getText(this.score + '', new Vector3(this.bounds.left + 0.1, this.bounds.top - 0.25, 0));
    //   this.add(this.scoreMesh);
    // } else {
    //   const geometry = new TextGeometry(this.score + '', {
    //     font: this.font,
    //     size: 1,
    //     height: 0,
    //     curveSegments: 10,

    //   });
    //   this.scoreMesh.geometry = geometry;
    // }

  }

  get score(): number {
    return this.score2;
  }

  get lifes(): Heart[] {
    return this.hearts.children as Heart[];
  }

  get bounds(): Bounds {
    return this.bounds2;
  }

  set bounds(bounds: Bounds) {
    this.bounds2 = bounds;
    this.addLifes();
    this.gamePhysics.bounds = bounds;
  }

  get showLifes(): boolean {
    return _.find(this.children, this.hearts) !== undefined;
  }

  set showLifes(show: boolean) {
    if (show) {
      this.add(this.hearts);
    } else {
      this.remove(this.hearts);
    }
  }

}