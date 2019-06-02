import { Target } from "./Target";
import Lodash from 'lodash';
import * as Three from 'three';
import { Scene, Vector3, CircleGeometry, MeshBasicMaterial, Color, Mesh, FontLoader, TextGeometry, Group } from 'three';
import { GamePhysics, Bounds } from './GamePhysics'
import helvetikerRegular from '../fonts/helvetiker_regular.typeface.json';
import { Click } from "./Click";
import { TargetSizeDistribution } from "./GameComponent";
import Heart from "./Heart";

import { Subject } from 'rxjs';

export default class Game extends Scene {
  private bounds2: Bounds;
  timer: any;

  gameTime: number;
  lastUpdateTime: number;
  pauseTime: number;
  targets: Target[];
  clicks: Click[];



  targetPace: number;
  targetSpeed: number;
  targetSize: number;
  targetDuration: number;

  gamePhysics: GamePhysics;

  paused: boolean;

  hearts: Group;
  score: number;
  lifeCount: number;
  onLifeOut: Subject<any>;

  constructor() {
    super();

    this.background = new Color(0xf9f9f9);
    this.gamePhysics = new GamePhysics(this.targets);

    this.hearts = new Group();
    this.onLifeOut = new Subject();
    this.add(this.hearts);
    this.lifeCount = 10;

  }

  init() {
    const handler = {
      set: (a: any[], i: string, value: any) => {
        if (i === 'length') {
          return true;
        }

        if (a[i] === undefined) {
          this.children.push(value);
        } else {
          const index = Lodash.findIndex(this.children, a[i])
          this.children[index] = value;
        }

        a[i] = value;

        return true;
      },

      deleteProperty: (targets: any[], prop: string) => {
        Lodash.pullAt(this.children, Lodash.findIndex(this.children, targets[prop]));
        Lodash.pullAt(targets, parseInt(prop));
        return true;
      }
    }

    this.gameTime = 0;
    this.targets = [];
    this.clicks = [];
    this.paused = false;
    this.score = 0;
  
    this.targets = new Proxy(this.targets, handler);
    this.clicks = new Proxy(this.clicks, handler);


    for (let i = 0; i < this.lifeCount; i++) {
      const heart = new Heart();
      this.lifes.push(heart);
    }
    this.bounds = this.bounds;
    this.gamePhysics.circles = this.targets;
  }

  start() {
    this.init();
    this.lastUpdateTime = performance.now();
    this.timer = setInterval(() => this.update(), 0);
  }

  stop() {
    Lodash.remove(this.targets);
    Lodash.remove(this.clicks);
    clearInterval(this.timer);
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.lastUpdateTime = performance.now();
    this.paused = false;
  }

  update() {
    if (this.paused) {
      return;
    }

    const time = performance.now();
    const timeDiff = time - this.lastUpdateTime;
    this.gamePhysics.updateState(timeDiff);
    this.clicks.forEach(click => click.update(timeDiff));
    Lodash.remove(this.clicks, (click) => click.changeValue > 1);
    Lodash.remove(this.targets, (target) => target.sizeChangeValue > 1 && target.size === 0);
    this.gameTime += timeDiff;
    this.lastUpdateTime = time;
  }

  addTarget(settings: {
    position?: Vector3, maxSize?: number, sizeChangeValue?: number, sizeChangeDuration?: number, speed?: number, direction?: Vector3
    sizeChangeDistribution?: TargetSizeDistribution;
  }): Target {
    const target = new Target(settings);
    this.targets.push(target);
    return target;
  }

  onClick(position: Vector3) {
    const click = new Click({ position: position });
    const target = this.getTargetAt(position);

    if (target !== undefined) {
      Lodash.remove(this.targets, target);
      click.color.set(new Color(0x00ff00));
      this.score++;
    } else {
      click.color.set(new Color(0xff0000));
      this.lifes.pop();
      if (this.lifes.length === 0) {
        this.onLifeOut.next();
      }
    }

    this.clicks.push(click);
  }

  addText() {
    const loader = new FontLoader();
    const font = loader.parse(helvetikerRegular);
    const geometry = new TextGeometry('123', {
      font: font,
      size: 1,
      height: 0,
    });

    const textMaterial = new Three.MeshStandardMaterial(
      { color: 0xff0000 }
    );

    const mesh = new Mesh(geometry, textMaterial);
    mesh.position.set(0, 0, 0);
    mesh.scale.set(0.7, 0.7, 1);
    this.add(mesh);
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
    while (true) {
      position = new Vector3(Lodash.random(this.bounds.left, this.bounds.right), Lodash.random(this.bounds.bottom, this.bounds.top), 0);
      for (const target of this.targets) {
        if (target.position.distanceTo(position) < target.size) {
          continue outer;
        }
      }
      return position;
    }
  }

  get lifes(): Heart[] {
    return this.hearts.children as Heart[];
  }

  get bounds() {
    return this.bounds2;
  }

  set bounds(bounds: Bounds) {
    this.bounds2 = bounds;

    let x = this.bounds.right - 0.2;
    for (const life of this.lifes) {
      life.position.set(x, this.bounds.top - 0.2, 0);
      x -= 0.3;
    }

    this.gamePhysics.bounds = bounds;
  }

  get showLifes(): boolean {
    return Lodash.find(this.children, this.hearts) !== undefined;
  }

  set showLifes(show: boolean) {
    if (show) {
      this.add(this.hearts);
    } else {
      this.remove(this.hearts);
    }
  }

}