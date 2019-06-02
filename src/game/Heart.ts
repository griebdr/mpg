import { Mesh, Shape, ShapeGeometry, MeshBasicMaterial } from "three";

export default class Heart extends Mesh {

  constructor() {
    super();
    const heartShape = new Shape();

    heartShape.moveTo(0, -0.5);
    heartShape.bezierCurveTo(1.5, 0.5, 0.25, 1.5, 0, 0.5);
    heartShape.bezierCurveTo(-0.25, 1.5, -1.5, 0.5, 0, -0.5);

    const geometry = new ShapeGeometry(heartShape, 20);
    const material = new MeshBasicMaterial({ color: 0xff0000 });
   
    this.geometry = geometry;
    this.material = material;

    this.scale.set(0.15, 0.15, 1);
  }

}