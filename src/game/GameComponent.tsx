import React, { RefObject } from 'react';
import './GameComponent.css';
import Game from './Game'
import * as Three from 'three';
import { PerspectiveCamera, WebGLRenderer, Vector3 } from 'three';
import Lodash from 'lodash';
import { Target } from './Target';
import { Bounds, GamePhysics } from './GamePhysics';


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
  minSize?: number,
  maxSize?: number,
  sizeChangeDuration?: number,
  sizeChangeDistribution?: TargetSizeDistribution,
  sizeChangeValue?: number,
  speed?: number,
  position?: Vector3,
  direction?: Vector3,
  showDirection?: boolean,
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

  constructor(props: Props) {
    super(props);

    this.canvasRef = React.createRef();
    this.shouldDragTarget = this.shouldDragDirection = false;
  }

  componentDidMount() {
    const canvas = this.canvasRef.current;
    this.renderer = new WebGLRenderer({ antialias: true, canvas: this.canvasRef.current });
    this.camera = new PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    this.camera.position.z = 5;
    this.camera.aspect = this.canvasRef.current.parentElement.clientWidth / this.canvasRef.current.parentElement.clientHeight;
    this.renderer.setSize(this.canvasRef.current.parentElement.clientWidth, this.canvasRef.current.parentElement.clientHeight);
    this.camera.updateProjectionMatrix();

    const height = 2 * Math.tan(Three.Math.degToRad(this.camera.fov) / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.bounds = { top: height / 2, right: width / 2, left: -width / 2, bottom: -height / 2 };

    this.game = new Game();
    this.game.bounds = this.bounds;

    this.animate();
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.animationFrame);
  }

  animate = () => {
    this.renderer.render(this.game, this.camera);
    this.animationFrame = requestAnimationFrame(this.animate);
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

  pxToScene(value: number) {
    return value / (this.canvasRef.current.width / (2 * this.bounds.right));
  }

  sceneToPx(value: number) {
    return value * (this.canvasRef.current.width / (2 * this.bounds.top));
  }

  onMouseDown = (event: React.MouseEvent) => {
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

  onMouseUp = (event: React.MouseEvent) => {
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

  onClick = (event: React.MouseEvent) => {
    const position = this.clickToScenePos(event.pageX, event.pageY);
    if (this.props.onClick) {
      this.props.onClick(position);
    }
  }


  onMouseMove = (event: React.MouseEvent) => {
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


  render() {
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
