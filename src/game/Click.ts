import { Mesh, CircleGeometry, MeshBasicMaterial, Vector3, Color } from 'three';
import _ from 'lodash';

const circleGeomety = new CircleGeometry(1, 50);

type ClickType = 'Success' | 'Fail';

export interface ClickSettings {
  pos?: Vector3;
  clickType?: ClickType;
}

export class Click extends Mesh {
  private _pos: Vector3;
  private _changeValue: number;
  private changeDuration: number;
  private maxSize: number;
  private sizeChangeDistribution: (x: number) => number;
  private opacityChangeDistribution: (x: number) => number;

  succcessColor = new Color(0x00ff00);
  failColor = new Color(0xff0000);
  
  constructor(settings?: ClickSettings) {
    super(circleGeomety, new MeshBasicMaterial());

    (this.material as MeshBasicMaterial).transparent = true;
    this.resetSettings(settings);
  }

  init(): void {
    this.sizeChangeDistribution = (x: number): number => {
      if (x < 0) {
        return 0;
      }
      if (x > 1) {
        return 1;
      }
      return x;
    }

    this.opacityChangeDistribution = (x: number): number => {
      if (x < 0) {
        return 1;
      }
      if (x > 1) {
        return 0;
      }
      return 1 - x;
    };

    this._pos = this.position;
    this.changeValue = 0;
    this.changeDuration = 500;
    this.maxSize = 0.16;
  }

  update(time: number): void {
    this.changeValue += time / this.changeDuration;
    (this.material as MeshBasicMaterial).opacity = this.opacityChangeDistribution(this.changeValue);
    const scaler = Math.max(1e-5, this.sizeChangeDistribution(this.changeValue)) * this.maxSize;
    this.scale.set(scaler, scaler, 1);
  }

  resetSettings(settings?: ClickSettings): void {
    this.init();
    this.settings = settings;
  }

  set settings(settings: ClickSettings) {
    _.forOwn(settings, (value, key) => this[key] = value);
  }

  get pos(): Vector3 {
    return this._pos;
  }

  set pos(pos: Vector3) {
    this._pos.set(pos.x, pos.y, pos.z);
  }

  get changeValue(): number {
    return this._changeValue;
  }

  set changeValue(changeValue: number) {
    if (changeValue > 1 || changeValue < 0) {
      this.visible = false;
    } else {
      this.visible = true;
    }

    this._changeValue = changeValue;
  }

  get clickType(): ClickType {
    return this.settings.clickType;
  }

  set clickType(type: ClickType) {
    const material = this.material as MeshBasicMaterial;  
    if (type === 'Success') {
      material.color = this.succcessColor;
    } else {
      material.color = this.failColor;
    }
  }
}