import { Mesh, CircleGeometry, MeshBasicMaterial, Color, Vector3 } from 'three';
import Arrow from './Arrow';
import { Circle } from './GamePhysics';

export class Click extends Mesh {
  private sizeChangeDistribution: (x: number) => number;
  private opacityChangeDistribution: (x: number) => number;
  changeValue: number;
  changeDuration: number;
  maxSize: number;

  readonly color: Color;

  constructor(settings: { 
    position: Vector3, color?: Color
  }) {
    super();

    const { position, color } = settings;

    this.sizeChangeDistribution = (x: number) => { 
      if (x < 0) {
        return 0;
      } 
      if (x > 1) {
        return 1;
      }
      return x;
    }

    this.opacityChangeDistribution = (x: number) => {
      if (x < 0) {
        return 1;
      }
      if (x > 1) {
        return 0;
      }
      return 1 - x;
    };

    this.changeValue = 0;
    this.changeDuration = 500;
    this.maxSize = 0.5;

    if (color) {
      this.color = color;    
    } else {
      this.color = new Color(0x00ff00);
    }

    this.geometry = new CircleGeometry(1, 50);
    this.material = new MeshBasicMaterial();
    this.material['color'] = this.color;
    this.material.opacity = 1;
    this.material.transparent = true;
    this.position.set(position.x, position.y, position.z);

    this.update(0);
  }

  update(time: number) {
    this.changeValue += time / this.changeDuration;
    this.material['opacity'] = this.opacityChangeDistribution(this.changeValue);
    const scaler = Math.max(1e-5, this.sizeChangeDistribution(this.changeValue)) * this.maxSize;
    this.scale.set(scaler, scaler, 1);
  }

}