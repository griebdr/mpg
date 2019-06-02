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

  get sizeChangeFunction() {
    if (this.sizeChangeDistribution === 'constant') {
      return (x: number) => 1;
    }
    return (x: number) => {
      if (x < 0 || x > 1) {
        return 0;
      }
      return 1 - Math.abs(2 * x - 1);
    }
  }

  constructor(settings: TargetSettings) {
    super();

    this.defaultColor = new Color(0x143170);
    this.selectedColor = new Color(0x7caaf4);
    this.color = new Color(this.defaultColor);

    const circleMaterial = new MeshBasicMaterial();
    circleMaterial.color = this.color;
    this.circle = new Mesh(new CircleGeometry(1, 50), circleMaterial);

    this.arrow = new Arrow();

    this.add(this.circle);
    // this.add(this.arrow);

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
      this.maxSize2 = maxSize;
    } else {
      this.maxSize2 = 1;
    }

    if (speed !== undefined) {
      this.speed2 = speed;
    } else {
      this.speed2 = 0;
    }

    if (direction !== undefined) {
      this.direction2 = direction;
    } else {
      this.direction2 = new Vector3(1, 1, 0);
    }

    if (sizeChangeValue) {
      this.sizeChangeValue2 = sizeChangeValue;
    } else {
      this.sizeChangeValue2 = 0;
    }

    if (showDirection !== undefined) {
      this.showDirection = showDirection;
    }

    this.isSelected2 = false;

    this.update();
  }

  update() {
    this.size = this.size;
    this.direction = this.direction;
    this.speed = this.speed;
    this.isSelected = this.isSelected;
  }


  get maxSize() {
    return this.maxSize2;
  }

  set maxSize(maxSize: number) {
    this.maxSize2 = maxSize;
    this.size = this.size;
  }

  get size() {
    return this.sizeChangeFunction(this.sizeChangeValue) * (this.maxSize - this.minSize) + this.minSize;
  }

  set size(size: number) {
    size = Math.max(1e-5, size);
    this.scale.set(size, size, 1);
    this.speed = this.speed;
  }

  get sizeChangeValue() {
    return this.sizeChangeValue2;
  }

  set sizeChangeValue(value: number) {
    this.sizeChangeValue2 = value;
    this.size = this.size;
  }

  get isSelected() {
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

  get direction() {
    return this.direction2;
  }

  set direction(direction: Vector3) {
    this.arrow.setRotationFromAxisAngle(new Vector3(0, 0, 1), new Vector2(direction.x, direction.y).angle());
    this.direction2 = direction.normalize();
  }

  get speed() {
    return this.speed2;
  }

  set speed(speed: number) {
    const arrowSize = Math.max(1e-5, speed / this.size);
    this.arrow.scale.set(arrowSize, arrowSize, 1);
    this.speed2 = speed;
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