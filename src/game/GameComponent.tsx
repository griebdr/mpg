import React, { RefObject, ReactNode } from 'react';

import * as Three from 'three';
import { PerspectiveCamera, WebGLRenderer, Vector3 } from 'three';
import { Target } from './Target';

// import _ from 'lodash';
import './GameComponent.css';
import Game, { Bounds } from './Game'

interface Props {
  onTargetClick?: (target: Target, position: Vector3) => void;
  onBackgroundClick?: (position: Vector3) => void;
  onTargetDrag?: (target: Target, dragVector: Vector3) => void;
  onDirectionDrag?: (target: Target, dragVector: Vector3) => void;
  onClick?: (position: Vector3) => void;
}

export type GameMode = 'Normal' | 'Custom' | 'Testing';

class GameComponent extends React.Component<Props> {
  game: Game;
  gameMode: GameMode;
  canvasRef: RefObject<HTMLCanvasElement>;

  bounds: Bounds;
  pace = Infinity;

  renderer: WebGLRenderer;
  camera: PerspectiveCamera;

  private selectedTarget: Target;
  private shouldDragTarget = false;
  private shouldDragDirection = false;

  mouseDownPosition: Vector3;
  previousMousePosition: Vector3;

  animationFrame: number;
  lastUpdateTime = 0;
  paused = false;

  constructor(props: Props) {
    super(props);
    this.canvasRef = React.createRef();
  }

  componentDidMount(): void {
    const canvas = this.canvasRef.current;
    this.renderer = new WebGLRenderer({ antialias: true, canvas: this.canvasRef.current });
    this.camera = new PerspectiveCamera(50, canvas.width / canvas.height, 0.1, 2000);
    this.camera.position.z = 5;

    this.game = new Game();

    this.onWindowResize();
    window.onresize = this.onWindowResize;

    this.animate(0);
  }

  componentWillUnmount(): void {
    cancelAnimationFrame(this.animationFrame);
  }

  animate = (time: number): void => {
    this.animationFrame = requestAnimationFrame(this.animate);

    if (!this.paused) {
      this.game.update(time - this.lastUpdateTime);
    }

    this.renderer.render(this.game, this.camera);
    this.lastUpdateTime = time;
  }

  reset(): void {
    cancelAnimationFrame(this.animationFrame);
    this.game.reset();
    this.animate(0);
  }

  stop(): void {
    cancelAnimationFrame(this.animationFrame);
  }

  start(): void {
    this.animate(0);
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  onWindowResize = (): void => {
    const canvasWidth = this.canvasRef.current.parentElement.clientWidth;
    const canvasHeight = this.canvasRef.current.parentElement.clientHeight;

    this.canvasRef.current.width = canvasWidth;
    this.canvasRef.current.height = canvasHeight;

    this.camera.aspect = canvasWidth / canvasHeight;
    this.renderer.setSize(canvasWidth, canvasHeight);
    this.camera.updateProjectionMatrix();

    const height = 2 * Math.tan(Three.Math.degToRad(this.camera.fov) / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.bounds = this.game.bounds = { top: height / 2, right: width / 2, left: -width / 2, bottom: -height / 2 };
  }

  clickToScenePos(clickX: number, clickY: number): Vector3 {
    const canvasLeft = this.canvasRef.current.offsetLeft;
    const canvasTop = this.canvasRef.current.offsetTop;

    const canvasPosX = clickX - canvasLeft;
    const canvasPosY = clickY - canvasTop;

    return new Vector3(
      this.pxToScene(canvasPosX - this.canvasRef.current.width / 2),
      -1 * this.pxToScene(canvasPosY - this.canvasRef.current.height / 2),
      0
    )
  }

  toSceneSize(value: number): number {
    const area = (this.bounds.top * 2) * (this.bounds.right * 2);

    // r^2 * PI = area;
    // r = sqrt(area / PI)
    // r ... 100
    // x ... value

    const x = Math.sqrt(area / Math.PI) * value / 100.0;

    return x;
  }

  fromSceneSize(value: number): number {
    const area = (this.bounds.top * 2) * (this.bounds.right * 2);

    // r^2 * PI = area;
    // r = sqrt(area / PI)
    // r     ... 100
    // value ... x

    const x = value * 100 / Math.sqrt(area / Math.PI);

    return x;
  }

  toSceneSpeed(value: number): number {
    const diagonal = new Vector3(this.bounds.left, this.bounds.right, 0).distanceTo(new Vector3(this.bounds.right, this.bounds.top, 0));

    // diagonal ... 100
    // x        ... value

    const x = diagonal * value / 100;

    return x;
  }

  fromSceneSpeed(value: number): number {
    const diagonal = new Vector3(this.bounds.left, this.bounds.right, 0).distanceTo(new Vector3(this.bounds.right, this.bounds.top, 0));

    // diagonal ... 100
    // value    ... x

    const x = 100 * value / diagonal;

    return x;
  }

  pxToScene(value: number): number {
    return value / (this.canvasRef.current.width / (2 * this.bounds.right));
  }

  sceneToPx(value: number): number {
    return value * (this.canvasRef.current.width / (2 * this.bounds.top));
  }

  onMouseDown = (event: React.MouseEvent): void => {
    const mousePosition = this.previousMousePosition = this.mouseDownPosition = this.clickToScenePos(event.pageX, event.pageY);
    this.selectedTarget = this.game.getTargetAt(mousePosition);

    for (const target of this.game.targets) {
      const directionEnd = target.position.clone().add(target.direction.clone().normalize().multiplyScalar(target.speed));
      if (mousePosition.distanceTo(directionEnd) < this.pxToScene(30)) {
        this.selectedTarget = target;
        this.shouldDragDirection = true;
        return;
      }
    }

    if (this.selectedTarget) {
      this.shouldDragTarget = true;
    }
  }

  onClick = (event: React.MouseEvent): void => {
    const position = this.clickToScenePos(event.pageX, event.pageY);
    const target = this.game.getTargetAt(position);

    if (target) {
      if (this.props.onTargetClick) {
        this.props.onTargetClick(target, position);
      }
    } else {
      if (this.props.onBackgroundClick) {
        this.props.onBackgroundClick(position);
      }
    }

    this.shouldDragTarget = false;
    this.shouldDragDirection = false;
  }

  onMouseMove = (event: React.MouseEvent): void => {
    const currentMousePosition = this.clickToScenePos(event.pageX, event.pageY);

    if (this.shouldDragTarget || this.shouldDragDirection) {
      const dragVec = currentMousePosition.clone().sub(this.previousMousePosition);
      if (this.shouldDragTarget && this.props.onTargetDrag) {
        this.props.onTargetDrag(this.selectedTarget, dragVec);
      }
      if (this.shouldDragDirection && this.props.onDirectionDrag) {
        this.props.onDirectionDrag(this.selectedTarget, dragVec);
      }
    }

    this.previousMousePosition = currentMousePosition;
  }


  render(): ReactNode {
    return (
      <canvas
        ref={this.canvasRef}
        onClick={this.onClick}
        onMouseDown={this.onMouseDown}
        // onMouseUp={this.onMouseUp}
        onMouseMove={this.onMouseMove}
      >
      </canvas>
    );
  }

}

export default GameComponent;
