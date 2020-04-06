import { Mesh, Vector3, Group, CircleGeometry, MeshBasicMaterial, Vector2, Color } from 'three';
import Arrow from './Arrow';
import { Circle } from './GamePhysics';
import { TargetSizeDistribution, TargetSettings } from './GameComponent';
import Lodash from 'lodash';

export class Target extends Group implements Circle {
  private direction2: Vector3;
  private speed2: number;
  private maxSize2: number;
  private sizeChangeValue2: number;
  private sizeChangeDuration2: number;

  sizeChangeDistribution: TargetSizeDistribution;
  sizeChangeDuration: number;
  minSize: number;

  circle: Mesh;
  arrow: Arrow;

  private isSelected2: boolean;
  readonly color: Color;
  defaultColor: Color;
  selectedColor: Color;

  get sizeChangeFunction(): (x: number) => number {
    if (this.sizeChangeDistribution === 'constant') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return (x: number): number => {
        return 1;
      };
    }
    return (x: number): number => {
      if (x < 0 || x > 1) {
        return 0;
      }
      return 1 - Math.abs(2 * x - 1);
    }
  }

  constructor(settings?: TargetSettings) {
    super();

    this.defaultColor = new Color(0x143170);
    this.selectedColor = new Color(0x7caaf4);
    this.color = new Color(this.defaultColor);

    const circleMaterial = new MeshBasicMaterial();
    circleMaterial.color = this.color;
    this.circle = new Mesh(new CircleGeometry(1, 50), circleMaterial);
    this.arrow = new Arrow();
    this.isSelected2 = false;
    this.settings = settings || {};
  
    this.add(this.circle);
    this.update();
  }

  update(): void {
    // eslint-disable-next-line no-self-assign
    this.size = this.size;
    // eslint-disable-next-line no-self-assign
    this.direction = this.direction;
    // eslint-disable-next-line no-self-assign
    this.speed = this.speed;
    // eslint-disable-next-line no-self-assign
    this.isSelected = this.isSelected;
  }

  set settings(settings: TargetSettings) {
    const { position, minSize, maxSize, sizeChangeDistribution, sizeChangeDuration, speed, direction, sizeChangeValue, showDirection } = settings;

    if (position !== undefined) {
      this.position.set(position.x, position.y, position.z);
    } else {
      this.position.set(0, 0, 0);
    }

    if (sizeChangeDistribution !== undefined) {
      this.sizeChangeDistribution = sizeChangeDistribution;
    } else {
      this.sizeChangeDistribution = 'constant';
    }

    if (sizeChangeDuration !== undefined) {
      this.sizeChangeDuration = sizeChangeDuration;
    } else {
      this.sizeChangeDuration = Infinity;
    }

    if (minSize !== undefined) {
      this.minSize = minSize;
    } else {
      this.minSize = 0;
    }

    if (maxSize !== undefined) {
      this.maxSize = maxSize;
    } else {
      this.maxSize = 1;
    }

    if (speed !== undefined) {
      this.speed = speed;
    } else {
      this.speed = 0;
    }

    if (direction !== undefined) {
      this.direction = direction;
    } else {
      this.direction = new Vector3(1, 1, 0);
    }

    if (sizeChangeValue) {
      this.sizeChangeValue = sizeChangeValue;
    } else {
      this.sizeChangeValue = 0;
    }

    if (showDirection !== undefined) {
      this.showDirection = showDirection;
    }
  }

  get maxSize(): number {
    return this.maxSize2;
  }

  set maxSize(maxSize: number) {
    this.maxSize2 = maxSize;
    // eslint-disable-next-line no-self-assign
    this.size = this.size;
  }

  get size(): number {
    return this.sizeChangeFunction(this.sizeChangeValue) * (this.maxSize - this.minSize) + this.minSize;
  }

  set size(size: number) {
    size = Math.max(1e-5, size);
    this.scale.set(size, size, 1);
    // eslint-disable-next-line no-self-assign
    this.speed = this.speed;
  }

  get sizeChangeValue(): number {
    return this.sizeChangeValue2;
  }

  set sizeChangeValue(value: number) {
    this.sizeChangeValue2 = value;
    // eslint-disable-next-line no-self-assign
    this.size = this.size;
  }

  get isSelected(): boolean {
    return this.isSelected2;
  }

  set isSelected(isSelected: boolean) {
    this.isSelected2 = isSelected;
    if (isSelected === true) {
      this.color.set(this.selectedColor);
    } else {
      this.color.set(this.defaultColor);
    }
  }

  get direction(): Vector3 {
    return this.direction2;
  }

  set direction(direction: Vector3) {
    this.arrow.setRotationFromAxisAngle(new Vector3(0, 0, 1), new Vector2(direction.x, direction.y).angle());
    this.direction2 = direction.normalize();
  }

  get speed(): number {
    return this.speed2;
  }

  set speed(speed: number) {
    this.speed2 = speed;

    const arrowSize = Math.max(1e-5, speed / this.size);
    this.arrow.scale.set(arrowSize, arrowSize, 1);
  }

  get showDirection(): boolean {
    return Lodash.find(this.children, this.arrow) !== undefined;
  }

  set showDirection(show: boolean) {
    if (show && !this.showDirection) {
      this.add(this.arrow);
    } if (!show) {
      Lodash.remove(this.children, this.arrow);
    }
  }

}