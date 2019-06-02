import React, { RefObject } from 'react';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/lab/Slider';
import Divider from '@material-ui/core/Divider';
import Game from '../game/Game';
import { Target } from '../game/Target';
import GameComponent, { TargetSettings } from '../game/GameComponent';
import './CustomComponent.css';
import Lodash from 'lodash';

import { withStyles, WithStyles, createStyles } from '@material-ui/core';
import { Vector3 } from 'three';

const drawerWidth = 240;

const styles = createStyles({
  drawerPaper: {
    width: drawerWidth,
    overflow: 'visible'
  },
  mainContent: {
    height: '100vh',
    marginLeft: drawerWidth,
  },
})

interface Props extends WithStyles<typeof styles> {

}

interface State {
  open: boolean;
  pace: number;
  targetSettings: TargetSettings;
}

class CustomComponent extends React.Component<Props, State> {
  selectedTarget: Target;
  targetSettings: TargetSettings;
  game: Game;

  gameComponentRef: RefObject<GameComponent>;
  gameComponent: GameComponent;

  timer: any;

  constructor(props: Props) {
    super(props);
    this.gameComponentRef = React.createRef();
    this.targetSettings = {
      maxSize: 100,
      sizeChangeDistribution: 'linear',
      sizeChangeValue: 0,
      sizeChangeDuration: 5000,
      speed: 50,
    };
    this.state = {
      open: true,
      pace: 1000,
      targetSettings: this.targetSettings,
    };
  }

  componentDidMount() {
    this.game = this.gameComponentRef.current.game;
    this.gameComponent = this.gameComponentRef.current;
    this.gameComponent.gameMode = 'normal';
    this.game.showLifes = false;
    this.game.start();
    this.timer = setInterval(this.addTarget, this.state.pace);
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

  onPaceChange = (event: React.ChangeEvent, value: number) => {
    this.setState({ pace: value });
    clearInterval(this.timer);

    this.timer = setInterval(this.addTarget, this.state.pace);
  }

  onMaxSizeChange = (event: React.ChangeEvent, value: number) => {
    this.targetSettings.maxSize = value;
    this.setState({ targetSettings: this.targetSettings });
  }

  onSpeedChange = (event: React.ChangeEvent, value: number) => {
    this.targetSettings.speed = value;
    this.setState({ targetSettings: this.targetSettings });
  }

  onSizeChangeDurationChange = (event: React.ChangeEvent, value: number) => {
    this.targetSettings.sizeChangeDuration = value;
    this.setState({ targetSettings: this.targetSettings });
  }

  render() {
    const { maxSize, speed, sizeChangeDuration } = this.state.targetSettings;
    const { open, pace } = this.state;
    const { classes } = this.props;

    return (
      <div>
        <Drawer classes={{ paper: classes.drawerPaper }} variant="persistent" anchor="left" open={open}>
          <div className="settings">
            <div>
              <Typography id="label">Pace</Typography>
              <Slider
                className="slider"
                min={2000}
                max={200}
                step={-10}
                disabled={false}
                aria-labelledby="label"
                value={pace}
                onChange={this.onPaceChange}
              />
            </div>
            <div>
              <Typography id="label">Max size</Typography>
              <Slider
                className="slider"
                min={0}
                max={200}
                disabled={false}
                aria-labelledby="label"
                value={maxSize}
                onChange={this.onMaxSizeChange}
              />
            </div>
            <div>
              <Typography id="label">Speed</Typography>
              <Slider
                className="slider"
                min={0}
                max={200}
                value={speed}
                onChange={this.onSpeedChange}
              />
            </div>
            <div>
              <Typography id="label">Size change duration</Typography>
              <Slider
                className="slider"
                min={1000}
                max={20000}
                step={10}
                value={sizeChangeDuration}
                onChange={this.onSizeChangeDurationChange}
              />
            </div>
          </div>
        </Drawer>
        <main className={classes.mainContent}>
          <GameComponent
            ref={this.gameComponentRef}
            onClick={(position) => this.game.onClick(position)}
          >
          </GameComponent>
        </main>
      </div>
    )
  }
}

export default withStyles(styles, { withTheme: true })(CustomComponent);