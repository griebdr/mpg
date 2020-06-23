import React, { RefObject, ReactNode } from 'react';
import Game from '../game/Game';
import { Target } from '../game/Target';
import GameComponent from '../game/GameComponent';
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
  paceChanges = [[1, 0], [4, 60]];
  sizeChange = [[8, 0], [4, 60]];
  durationChange = [[3.5, 0], [1.5, 60]];
  speedChange = [[0, 0], [10, 60]];

  game: Game;
  gameComponentRef: RefObject<GameComponent>;
  gameComponent: GameComponent;

  timer: NodeJS.Timeout;
  gameStartTime: number;

  constructor(props: {}) {
    super(props);
    this.gameComponentRef = React.createRef();
    this.state = { open: false };
  }

  componentDidMount(): void {
    this.gameComponent = this.gameComponentRef.current;
    this.game = this.gameComponent.game;
    this.game.showLifes = true;
    this.start();
  }

  componentWillUnmount(): void {
    clearTimeout(this.timer);
  }

  start = (): void => {
    this.gameStartTime = performance.now();
    this.addTarget();
  }

  addTarget = (): void => {
    const settings = this.getSettings(this.gameTime);

    const speed = this.gameComponent.toSceneSpeed(settings.speed);
    const maxSize = this.gameComponent.toSceneSize(settings.maxSize);
    const sizeChangeDuration = settings.sizeChangeDuration * 1000;

    this.game.addTarget({ speed, maxSize, sizeChangeDuration });
    this.timer = setTimeout(this.addTarget, 1000 / settings.pace);
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

  getSettings(gameTime: number): { pace: number; maxSize: number; sizeChangeDuration: number; speed: number } {
    const pace = this.getSetting(gameTime, this.paceChanges);
    const maxSize = this.getSetting(gameTime, this.sizeChange);
    const sizeChangeDuration = this.getSetting(gameTime, this.durationChange);
    const speed = this.getSetting(gameTime, this.speedChange);

    return { pace, maxSize, sizeChangeDuration, speed };
  }

  onLifeOut = (): void => {
    this.setState({ open: true });
    setTimeout(() => this.gameComponent.pause(), 0);
    clearTimeout(this.timer);
  }

  tryAgain = (): void => {
    this.setState({ open: false });
    this.game.reset();
    this.gameComponent.resume();
    this.start();
  }

  get gameTime(): number {
    return performance.now() - this.gameStartTime;
  }

  onTargetClick = (target: Target, pos: Vector3): void => {
    this.game.removeTarget(target)
    this.game.addClick({ pos, clickType: 'Success' });
  }

  onBackgroudClick = (pos: Vector3): void => {
    this.game.addClick({ pos, clickType: 'Fail' });
    this.game.removeLife();
    if (this.game.lifeCount === 0) {
      this.onLifeOut();
    }
  }

  render(): ReactNode {
    const { open } = this.state;

    return (
      <div style={{ height: '100vh' }}>
        <GameComponent
          ref={this.gameComponentRef}
          onTargetClick={this.onTargetClick}
          onBackgroundClick={this.onBackgroudClick}
        >
        </GameComponent>
        <Modal
          open={open}
          onClose={(): void => this.setState({ open: false })}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          disableBackdropClick={true}
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