import React, { RefObject, ReactNode } from 'react';
import './GameComponent.css';
import Game from './Game'
import * as Three from 'three';
import { PerspectiveCamera, WebGLRenderer, Vector3 } from 'three';
import { Target } from './Target';
import { Bounds } from './GamePhysics';
// import _ from 'lodash';

interface Props {
  onTargetClick?: (target: Target, position: Vector3) => void;
  onBackgroundClick?: (position: Vector3) => void;
  onTargetDrag?: (target: Target, dragVector: Vector3) => void;
  onDirectionDrag?: (target: Target, dragVector: Vector3) => void;
  onClick?: (position: Vector3) => void;
}

export type TargetSizeDistribution = 'linear' | 'constant';
export type GameMode = 'normal' | 'testing';

export interface TargetSettings {
  minSize?: number;
  maxSize?: number;
  sizeChangeDuration?: number;
  sizeChangeDistribution?: TargetSizeDistribution;
  sizeChangeValue?: number;
  speed?: number;
  position?: Vector3;
  direction?: Vector3;
  showDirection?: boolean;
}

class GameComponent extends React.Component<Props> {
  game: Game;
  gameMode: GameMode;
  canvasRef: RefObject<HTMLCanvasElement>;

  bounds: Bounds;

  renderer: WebGLRenderer;
  camera: PerspectiveCamera;

  private selectedTarget: Target;
  private shouldDragTarget: boolean;
  private shouldDragDirection: boolean;

  mouseDownPosition: Vector3;
  previousMousePosition: Vector3;

  animationFrame: number;
  lastUpdateTime = performance.now();

  constructor(props: Props) {
    super(props);
    this.canvasRef = React.createRef();
    this.shouldDragTarget = this.shouldDragDirection = false;
  }

  componentDidMount(): void {
    const canvas = this.canvasRef.current;
    this.renderer = new WebGLRenderer({ antialias: true, canvas: this.canvasRef.current });
    this.camera = new PerspectiveCamera(50, canvas.width / canvas.height, 0.1, 2000);
    this.camera.position.z = 5;
    
    this.game = new Game();

    this.onWindowResize();
    window.onresize = this.onWindowResize;
    
    this.animate();
  }

  componentWillUnmount(): void {
    cancelAnimationFrame(this.animationFrame);
  }

  animate = (): void => {
    this.animationFrame = requestAnimationFrame(this.animate);

    const currentTime = performance.now();
    const diff = currentTime - this.lastUpdateTime;
    this.game.update(diff);

    this.lastUpdateTime = currentTime;
    this.renderer.render(this.game, this.camera);
  }

  reset(): void {
    this.game.reset();
    cancelAnimationFrame(this.animationFrame);
    this.animate();
  }

  pause(): void {
    cancelAnimationFrame(this.animationFrame);
  }

  resume(): void {
    this.animate();
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

  onMouseUp = (event: React.MouseEvent): void => {
    if (this.mouseDownPosition === undefined) {
      return;
    }

    const position = this.clickToScenePos(event.pageX, event.pageY);
    const target = this.game.getTargetAt(position);

    if (this.mouseDownPosition.distanceTo(position) < this.pxToScene(30)) {
      if (target === undefined && this.props.onBackgroundClick !== undefined) {
        this.props.onBackgroundClick(position);
      } else if (this.props.onTargetClick !== undefined) {
        this.props.onTargetClick(target, position);
      }
    }

    this.shouldDragTarget = false;
    this.shouldDragDirection = false;
  }

  onClick = (event: React.MouseEvent): void => {
    const position = this.clickToScenePos(event.pageX, event.pageY);
    if (this.props.onClick) {
      this.props.onClick(position);
    }
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
        onMouseUp={this.onMouseUp}
        onMouseMove={this.onMouseMove}
      >
      </canvas>
    );
  }

}

export default GameComponent;
