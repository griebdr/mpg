import React, { RefObject, ReactNode } from 'react';

import clsx from 'clsx';

import Game from '../game/Game';
import GameComponent from '../game/GameComponent';
import { TargetSettings, Target } from '../game/Target';
import './CustomComponent.css';
// import _ from 'lodash';

import { IconButton, withStyles, WithStyles, createStyles, Drawer, FormControl, TextField, FormGroup, InputAdornment, Slider, Typography } from '@material-ui/core';
import { ArrowBack, ArrowForward } from '@material-ui/icons'
import { Vector3 } from 'three';
// import {  } from 'three';

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
  mainContentShift: {
    marginLeft: 0,
  },
  settingsControl: {
    padding: 12,
  },
  settingInput: {
    margin: '12px 0px',
  },
})

type Props = WithStyles<typeof styles>

interface State {
  open: boolean;
  pace: number;
  difficultyLevel: number;
  targetSettings: TargetSettings;
}

class CustomComponent extends React.Component<Props, State> {
  gameComponentRef: RefObject<GameComponent>;
  gameComponent: GameComponent;
  game: Game;

  targetSettings: TargetSettings = {};
  timer: unknown;
  initialDifficulty = 0.5;

  difficultyValues = {
    minPace: 1, maxPace: 3,
    minSize: 4, maxSize: 8,
    minDuration: 1.5, maxDuration: 3.5,
    minSpeed: 1, maxSpeed: 10,
  }

  constructor(props: Props) {
    super(props);
    this.gameComponentRef = React.createRef();

    const difficulties = this.getDifficulties(this.initialDifficulty);
    this.targetSettings = { sizeChangeDuration: difficulties.sizeChangeDuration, speed: difficulties.speed, maxSize: difficulties.maxSize }

    this.state = {
      open: true,
      pace: difficulties.pace,
      difficultyLevel: this.initialDifficulty,
      targetSettings: this.targetSettings,
    };
  }

  componentDidMount(): void {
    this.gameComponent = this.gameComponentRef.current;
    this.game = this.gameComponent.game;
    this.onDifficultyLevelChange(this.state.difficultyLevel);
    this.addTarget();
  }

  componentWillUnmount(): void {
    clearTimeout(this.timer as number);
  }

  addTarget = (): void => {
    const speed = this.gameComponent.toSceneSpeed(this.targetSettings.speed);
    const maxSize = this.gameComponent.toSceneSize(this.targetSettings.maxSize);
    const sizeChangeDuration = this.targetSettings.sizeChangeDuration * 1000;

    this.game.addTarget({ speed, maxSize, sizeChangeDuration });
    this.timer = setTimeout(this.addTarget, 1000 / this.state.pace);
  }

  getDifficulties(difficultyLevel: number): { pace: number; maxSize: number; sizeChangeDuration: number; speed: number } {
    return {
      pace: difficultyLevel * (this.difficultyValues.maxPace - this.difficultyValues.minPace) + this.difficultyValues.minPace,
      maxSize: (1 - difficultyLevel) * (this.difficultyValues.maxSize - this.difficultyValues.minSize) + this.difficultyValues.minSize,
      sizeChangeDuration: (1 - difficultyLevel) * (this.difficultyValues.maxDuration - this.difficultyValues.minDuration) + this.difficultyValues.minDuration,
      speed: difficultyLevel * (this.difficultyValues.maxSpeed - this.difficultyValues.minSpeed) + this.difficultyValues.minSpeed
    }
  }

  onDifficultyLevelChange = (difficultyLevel: number): void => {
    const difficulties = this.getDifficulties(difficultyLevel);

    this.targetSettings.maxSize = difficulties.maxSize;
    this.targetSettings.sizeChangeDuration = difficulties.sizeChangeDuration;
    this.targetSettings.speed = difficulties.speed;

    this.setState({ difficultyLevel, pace: difficulties.pace, targetSettings: this.targetSettings });
  }

  onPaceChange = (pace: number): void => {
    this.setState({ pace: pace });
  }

  onMaxSizeChange = (size: number): void => {
    this.targetSettings.maxSize = size;
    this.setState({ targetSettings: this.targetSettings });
  }

  onSpeedChange = (speed: number): void => {
    this.targetSettings.speed = speed;
    this.setState({ targetSettings: this.targetSettings });
  }

  onSizeChangeDurationChange = (duration: number): void => {
    this.targetSettings.sizeChangeDuration = duration;
    this.setState({ targetSettings: this.targetSettings });
  }

  hideDrawer = (): void => {
    this.setState({ open: false });
    setTimeout(this.gameComponent.onWindowResize, 0);
  }

  showDrawer = (): void => {
    this.setState({ open: true });
    setTimeout(this.gameComponent.onWindowResize, 0);
  }

  onTargetClick = (target: Target, pos: Vector3): void => {
    this.game.removeTarget(target)
    this.game.addClick({ pos, clickType: 'Success' });
  }

  onBackgroudClick = (pos: Vector3): void => {
    this.game.addClick({ pos, clickType: 'Fail' });
  }

  render(): ReactNode {
    const { maxSize, speed, sizeChangeDuration } = this.state.targetSettings;
    const { open, pace, difficultyLevel } = this.state;
    const { classes } = this.props;

    return (
      <div>
        <IconButton style={{ position: 'absolute' }} onClick={this.showDrawer}><ArrowForward /></IconButton>
        <Drawer classes={{ paper: classes.drawerPaper }} variant="persistent" anchor="left" open={open}>
          <div>
            <IconButton
              onClick={this.hideDrawer}
            >
              <ArrowBack />
            </IconButton>
          </div>
          <FormControl style={{ margin: 12, marginBottom: 30 }} variant="outlined">
            <Typography id="discrete-slider" gutterBottom>
              Difficulty
            </Typography>
            <Slider
              defaultValue={this.initialDifficulty}
              step={0.1}
              marks
              min={0}
              max={1}
              value={difficultyLevel}
              onChange={(e, v): void => this.onDifficultyLevelChange(v as number)}
            />
          </FormControl>
          <FormGroup className={classes.settingsControl}>
            <Typography gutterBottom>
              Settings
            </Typography>
            <TextField
              className={classes.settingInput} variant="outlined" label="Pace" type="number"
              value={pace}
              InputProps={{
                endAdornment: <InputAdornment position="end">target/s</InputAdornment>,
              }}
              onChange={(e): void => this.onPaceChange(Number.parseFloat(e.target.value))}
            />
            <TextField
              className={classes.settingInput} variant="outlined" label="Size" type="number"
              value={maxSize}
              InputProps={{
                endAdornment: <InputAdornment position="end">px</InputAdornment>,
              }}
              onChange={(e): void => this.onMaxSizeChange(Number.parseFloat(e.target.value))}
            />
            <TextField
              className={classes.settingInput} variant="outlined" label="Duration" type="number"
              value={sizeChangeDuration}
              InputProps={{
                endAdornment: <InputAdornment position="end">s</InputAdornment>,
              }}
              onChange={(e): void => this.onSizeChangeDurationChange(Number.parseFloat(e.target.value))}
            />
            <TextField
              className={classes.settingInput} variant="outlined" label="Speed" type="number"
              value={speed}
              InputProps={{
                endAdornment: <InputAdornment position="end">px/s</InputAdornment>,
              }}
              onChange={(e): void => this.onSpeedChange(Number.parseFloat(e.target.value))}
            />
          </FormGroup>
        </Drawer>
        <main className={clsx(classes.mainContent, { [classes.mainContentShift]: !open })}>
          <GameComponent
            ref={this.gameComponentRef}
            onTargetClick={this.onTargetClick}
            onBackgroundClick={this.onBackgroudClick}
          >
          </GameComponent>
        </main>
      </div>
    )
  }
}

export default withStyles(styles, { withTheme: true })(CustomComponent);