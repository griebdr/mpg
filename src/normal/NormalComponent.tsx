import React, { RefObject } from 'react';
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

interface Props {

}

interface State {
  open: boolean;
}

class NormalComponent extends React.Component<Props, State> {
  targetSettings: TargetSettings;
  pace: number;

  paceChange = [[1000, 200, 0, 60 * 1000]];
  maxSizeChange = [];
  speedChange = [];
  durationChange = [];

  game: Game;
  gameComponentRef: RefObject<GameComponent>;
  gameComponent: GameComponent;

  timer: any;
  targetAddedTime: number;

  constructor(props: Props) {
    super(props);
    this.gameComponentRef = React.createRef();
    this.state = { open: false };
  }

  init() {
    this.targetSettings = {
      maxSize: 100,
      sizeChangeDistribution: 'linear',
      sizeChangeValue: 0,
      sizeChangeDuration: 5000,
      speed: 50,
    };
    this.targetAddedTime = 0;
    this.pace = 1000;
  }

  start() {
    this.init();
    this.game.start();
    this.timer = setInterval(this.updateSettings, 50);
  }

  onLifeOut = () => {
    this.game.stop();
    this.setState({ open: true });
    clearInterval(this.timer);
  }

  componentDidMount() {
    this.game = this.gameComponentRef.current.game;
    this.gameComponent = this.gameComponentRef.current;
    this.game.onLifeOut.subscribe(this.onLifeOut);
    this.start();
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  addTarget = () => {
    const targetSettings = { ...this.targetSettings };
    targetSettings.position = this.game.getRandomPosition();
    targetSettings.speed = this.gameComponent.pxToScene(targetSettings.speed);
    targetSettings.maxSize = this.gameComponent.pxToScene(targetSettings.maxSize);
    targetSettings.direction = new Vector3(Lodash.random(-1, 1, true), Lodash.random(-1, 1, true), 0);
    this.game.targets.push(new Target(targetSettings));
  }

  updateSettings = () => {
    this.pace = this.getValue(this.game.gameTime, this.paceChange);
    if (this.game.gameTime > this.targetAddedTime + this.pace) {
      this.addTarget();
      this.targetAddedTime = this.game.gameTime;
    }
  }

  getValue(time: number, changes: number[][]): number {
    for (const change of changes) {
      if (time > change[2] && time < change[3]) {
        const a = (time - change[2]) / (change[3] - change[2]);
        return a * (change[1] - change[0]) + change[0];
      }
    }
    return changes[changes.length - 1][1];
  }

  tryAgain = () => {
    this.start();
    this.setState({ open: false });
  }

  render() {
    const { open } = this.state;

    return (
      <div style={{ height: '100vh' }}>
        <GameComponent
          ref={this.gameComponentRef}
          onClick={(position) => this.game.onClick(position)}
        >
        </GameComponent>
        <Modal
          open={open}
          onClose={() => this.setState({ open: false })}
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