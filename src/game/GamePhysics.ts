import { Vector3 } from 'three';
import _ from 'lodash';

export interface Circle {
  position: Vector3;
  direction: Vector3;
  speed: number;
  sizeChangeFunction: (x: number) => number;
  sizeChangeValue: number;
  sizeChangeDuration: number;
  minSize: number;
  maxSize: number;
  size: number;
}

export interface Bounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export class GamePhysics {
  constructor(public circles?: Circle[], public bounds?: Bounds) { }

  updateState(time: number): void {
    this.updatePosition(time);
    this.handleCollision();
    this.updateSize(time);
    this.separateCircles(this.circles);
  }


  updatePosition(time: number): void {
    this.circles.forEach(circle => {
      const distance = time * (circle.speed / 1000);
      circle.position.add(circle.direction.clone().multiplyScalar(distance));
    });
  }

  updateSize(time: number): void {
    this.circles.forEach(circle => {
      circle.sizeChangeValue += time / circle.sizeChangeDuration;
    });
  }

  handleCollision(): void {
    for (const circle of this.circles) {
      if (Math.abs(circle.position.x) + circle.size - this.bounds.right > 0) {
        circle.direction = new Vector3(-circle.direction.x, circle.direction.y, 0);
      }

      if (Math.abs(circle.position.y) + circle.size - this.bounds.top > 0) {
        circle.direction = new Vector3(circle.direction.x, -circle.position.y, 0);
      }
    }

    for (let i = 0; i < this.circles.length; i++) {
      const circle = this.circles[i];
      for (let j = i + 1; j < this.circles.length; j++) {
        const circle2 = this.circles[j];
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

  separateCircles(circles: Circle[]): void {
    const changedCircles: Circle[] = [];

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
}