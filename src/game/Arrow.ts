import { Mesh, Geometry, LineBasicMaterial, Line, Vector3, Group, Face3, MeshBasicMaterial, DoubleSide } from 'three';

export default class Arrow extends Group {
  triangleMesh: Mesh;
  line: Line;

  constructor() {
    super();

    const geometry = new Geometry();
    geometry.vertices.push(new Vector3(0, 0, 0), new Vector3(0.8, 0, 0));

    const material = new LineBasicMaterial({ color: 0xff0000, linewidth: 1.85 });
    
    this.line = new Line(geometry, material);
    
    const triangleGeometry = new Geometry();
    triangleGeometry.vertices.push(new Vector3(0.8, 0.1, 0));
    triangleGeometry.vertices.push(new Vector3(0.8, -0.1, 0));
    triangleGeometry.vertices.push(new Vector3(1, 0, 0));
    triangleGeometry.faces.push(new Face3(0, 1, 2));
    
    const triangleMaterial = new MeshBasicMaterial({
      color: 0xff0000,
      side: DoubleSide
    });

    this.triangleMesh = new Mesh(triangleGeometry, triangleMaterial);

    this.add(this.line);
    this.add(this.triangleMesh);
  }


}