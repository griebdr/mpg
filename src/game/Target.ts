/* eslint-disable no-self-assign */
import { Mesh, Vector3, Vector2, Group, CircleGeometry, MeshBasicMaterial, Color } from 'three';
import _ from 'lodash';

import Arrow from './Arrow';

const circleGeomety = new CircleGeometry(1, 50);

export type TargetSizeDistribution = 'Linear' | 'Constant'

export interface TargetSettings {
  pos?: Vector3;
  minSize?: number;
  maxSize?: number;
  sizeChangeDuration?: number;
  sizeChangeValue?: number;
  sizeChangeDistribution?: TargetSizeDistribution;
  speed?: number;
  direction?: Vector3;
  color?: Color;
  showDirection?: boolean;
  isSelected?: boolean;
  repeating?: boolean;
}

export class Target extends Group {
  private settings: TargetSettings = {};

  private circleMesh: Mesh;
  private arrow: Arrow;

  private defaultColor = new Color(0x143170);
  private selectedColor = new Color(0x7caaf4);

  constructor(settings?: TargetSettings) {
    super();

    this.circleMesh = new Mesh(circleGeomety, new MeshBasicMaterial());
    this.arrow = new Arrow();
    this.add(this.circleMesh);

    this.init();
    this.setSettings(settings);
  }

  init(): void {
    this.settings.pos = this.position;
    this.pos = new Vector3(0, 0, 0);
    this.minSize = 0;
    this.maxSize = 1;
    this.sizeChangeDuration = 2;
    this.sizeChangeValue = 0;
    this.sizeChangeDistribution = 'Linear';
    this.speed = 0;
    this.direction = new Vector3(0, 0, 0);
    this.showDirection = false;
    this.color = this.defaultColor;
    this.repeating = false;
  }

  updatePosition(time: number): void {
    const distance = time * (this.speed / 1000);
    this.position.add(this.direction.clone().multiplyScalar(distance));
  }

  updateSize(time: number): void {
    if (this.sizeChangeDistribution === 'Linear') {
      this.sizeChangeValue += time / this.sizeChangeDuration;
    }
  }

  resetSettings(settings?: TargetSettings): void {
    this.init();
    this.setSettings(settings);
  }

  setSettings(settings: TargetSettings): void {
    _.forOwn(settings, (value, key) => this[key] = value);
  }

  get pos(): Vector3 {
    return this.settings.pos;
  }

  set pos(pos: Vector3) {
    this.settings.pos.set(pos.x, pos.y, pos.z);
  }

  get size(): number {
    return this.sizeChangeFunction(this.sizeChangeValue) * (this.maxSize - this.minSize) + this.minSize;
  }

  set size(size: number) {
    size = Math.max(1e-5, size);
    this.scale.set(size, size, 1);
    this.speed = this.speed;
  }

  get sizeChangeFunction(): (x: number) => number {
    return (x: number): number => {
      if (this.sizeChangeDistribution === 'Linear') {
        if (x < 0 || x > 1) {
          return 0;
        }
        return 1 - Math.abs(2 * x - 1);
      }
      return 1;
    };
  }

  get minSize(): number {
    return this.settings.minSize;
  }

  set minSize(minSize: number) {
    this.settings.minSize = minSize;
    this.size = this.size;
  }

  get maxSize(): number {
    return this.settings.maxSize;
  }

  set maxSize(maxSize: number) {
    this.settings.maxSize = maxSize;
    this.size = this.size;
  }

  get sizeChangeValue(): number {
    return this.settings.sizeChangeValue;
  }

  set sizeChangeValue(value: number) {
    if (value >= 1) {
      if (this.repeating) {
        this.sizeChangeValue = 0;
        return;
      } else {
        this.visible = false;
      }
    } else {
      this.visible = true;
    }

    this.settings.sizeChangeValue = value;
    this.size = this.size;
  }

  get sizeChangeDistribution(): TargetSizeDistribution {
    return this.settings.sizeChangeDistribution;
  }

  set sizeChangeDistribution(sizeChangeDistribution: TargetSizeDistribution) {
    this.settings.sizeChangeDistribution = sizeChangeDistribution;
    this.size = this.size;
  }

  get sizeChangeDuration(): number {
    return this.settings.sizeChangeDuration;
  }

  set sizeChangeDuration(sizeChangeDuration: number) {
    this.settings.sizeChangeDuration = sizeChangeDuration;
    this.size = this.size;
  }

  get direction(): Vector3 {
    return this.settings.direction;
  }

  set direction(direction: Vector3) {
    this.settings.direction = direction.normalize();
    this.arrow.setRotationFromAxisAngle(new Vector3(0, 0, 1), new Vector2(direction.x, direction.y).angle());
  }

  get speed(): number {
    return this.settings.speed;
  }

  set speed(speed: number) {
    this.settings.speed = speed;
    const arrowSize = Math.max(1e-5, speed / this.size);
    this.arrow.scale.set(arrowSize, arrowSize, 1);
  }

  get color(): Color {
    return (this.circleMesh.material as MeshBasicMaterial).color;
  }

  set color(color: Color) {
    (this.circleMesh.material as MeshBasicMaterial).color = new Color(color);
  }

  get isSelected(): boolean {
    return this.settings.isSelected;
  }

  set isSelected(isSelected: boolean) {
    this.settings.isSelected = isSelected;
    if (isSelected === true) {
      this.color.set(this.selectedColor);
    } else {
      this.color.set(this.defaultColor);
    }
  }

  get showDirection(): boolean {
    return _.find(this.children, this.arrow) !== undefined;
  }

  set showDirection(show: boolean) {
    if (show && !this.showDirection) {
      this.add(this.arrow);
    } if (!show) {
      _.remove(this.children, this.arrow);
    }
  }

  get repeating(): boolean {
    return this.settings.repeating;
  }

  set repeating(repeating: boolean) {
    this.settings.repeating = repeating;
  }

}