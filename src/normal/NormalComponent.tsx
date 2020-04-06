import React, { RefObject, ReactNode } from 'react';
import Game from '../game/Game';
import { Target } from '../game/Target';
import GameComponent, { TargetSettings } from '../game/GameComponent';
import Lodash from 'lodash';
import { Vector3 } from 'three';
import Modal from '@material-ui/core/Modal';
import Typography from '@material-ui/core/Typography'
import { Button } from '@material-ui/core';
import { Link } from 'react-router-dom';

import './NormalComponent.css'

interface State {
  open: boolean;
}

class NormalComponent extends React.Component<{}, State> {
  targetSettings: TargetSettings;
  pace: number;

  paceChanges = [[0.5, 0], [1, 10], [1.5, 20], [2, 30], [2.5, 45], [3, 60], [10, 60 * 5]];
  sizeChange = [[75, 0], [40, 30], [30, 60], [15, 60 * 5]];
  durationChange = [[3000, 0], [2500, 30], [2000, 60], [1000, 60 * 5]];
  speedChange = [[0, 0], [75, 10], [100, 60], [300, 60 * 5]];

  game: Game;
  gameComponentRef: RefObject<GameComponent>;
  gameComponent: GameComponent;

  timer: number;
  nextTargetTime: number;
  gameStartTime: number;

  constructor(props: {}) {
    super(props);
    this.gameComponentRef = React.createRef();
    this.state = { open: false };
  }

  init(): void {
    this.targetSettings = {
      maxSize: 100,
      sizeChangeDistribution: 'linear',
      sizeChangeValue: 0,
      sizeChangeDuration: 5000,
      speed: 50,
    };
    this.nextTargetTime = 0;
    this.pace = 1000;
  }

  start(): void {
    this.init();
    this.timer = setInterval(this.updateSettings, 50) as unknown as number; 
    this.gameStartTime = this.nextTargetTime = performance.now();
    this.addTarget();
  }

  onLifeOut = (): void => {
    this.setState({ open: true });
    this.gameComponent.reset();
    this.gameComponent.pause();
    clearInterval(this.timer);
  }

  componentDidMount(): void {
    this.game = this.gameComponentRef.current.game;
    this.gameComponent = this.gameComponentRef.current;
    this.game.onLifeOut.subscribe(this.onLifeOut);
    this.start();
  }

  componentWillUnmount(): void {
    clearInterval(this.timer);
  }

  addTarget = (): void => {
    const targetSettings = { ...this.targetSettings };
    targetSettings.position = this.game.getRandomPosition();
    targetSettings.speed = this.gameComponent.pxToScene(targetSettings.speed);
    targetSettings.maxSize = this.gameComponent.pxToScene(targetSettings.maxSize);
    targetSettings.direction = new Vector3(Lodash.random(-1, 1, true), Lodash.random(-1, 1, true), 0);
    this.game.targets.push(new Target(targetSettings));
  }

  updateSettings = (): void => {
    const currentTime = performance.now();
    const gameTime = currentTime - this.gameStartTime;

    this.targetSettings.maxSize = this.getSetting(gameTime, this.sizeChange);
    this.targetSettings.sizeChangeDuration = this.getSetting(gameTime, this.durationChange);
    this.targetSettings.speed = this.getSetting(gameTime, this.speedChange);

    if (currentTime > this.nextTargetTime + this.pace) {
      this.addTarget();
      this.pace = this.getSetting(gameTime, this.paceChanges);
      this.nextTargetTime = currentTime + 1000 / this.pace;
    }
  }

  getSetting(gameTime: number, changes: Array<Array<number>>): number {
    gameTime /= 1000;
    for (let i = 0; i < changes.length - 1; i++) {
      if (gameTime > changes[i][1] && gameTime < changes[i + 1][1]) {
        const multiplier = (gameTime - changes[i][1]) / (changes[i + 1][1] - changes[i][1])
        return changes[i][0] + (changes[i + 1][0] - changes[i][0]) * multiplier;
      }
    }
    return changes[changes.length - 1][0];
  }

  tryAgain = (): void => {
    this.gameComponent.resume();
    this.start();
    this.setState({ open: false });
  }

  render(): ReactNode {
    const { open } = this.state;

    return (
      <div style={{ height: '100vh' }}>
        <GameComponent
          ref={this.gameComponentRef}
          onClick={(position): void => this.game.onClick(position)}
        >
        </GameComponent>
        <Modal
          open={open}
          onClose={(): void => this.setState({ open: false })}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div className="paper">
            <Typography style={{ paddingBottom: '20px' }} variant="h6" id="modal-title">
              Your score is: {(this.game && this.game.score)}
            </Typography>
            <Button onClick={this.tryAgain}> Try Again </Button>
            <Button color="inherit"><Link className="link" to="/">Quit</Link></Button>
          </div>
        </Modal>
      </div>
    )
  }
}

export default NormalComponent;