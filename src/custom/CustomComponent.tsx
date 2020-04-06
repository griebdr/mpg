import React, { RefObject, ReactNode } from 'react';

import clsx from 'clsx';

import Game from '../game/Game';
import { Target } from '../game/Target';
import GameComponent, { TargetSettings } from '../game/GameComponent';
import './CustomComponent.css';
import _ from 'lodash';

import { IconButton, withStyles, WithStyles, createStyles, Select, MenuItem, InputLabel, Drawer, FormControl, TextField, FormLabel, FormGroup, InputAdornment } from '@material-ui/core';
import { ArrowBack, ArrowForward } from '@material-ui/icons'
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

interface DifficultySetting {
  pace: number;
  size: number;
  duration: number;
  speed: number;
}

class CustomComponent extends React.Component<Props, State> {
  gameComponentRef: RefObject<GameComponent>;
  gameComponent: GameComponent;
  game: Game;

  selectedTarget: Target;
  targetSettings: TargetSettings;

  timer: unknown;

  difficultyLevelValues = new Map<number, DifficultySetting>(
    [
      [1, { pace: 0, size: 0, duration: 0, speed: 0 }],
      [2, { pace: 0, size: 0, duration: 0, speed: 0 }],
      [3, { pace: 0, size: 0, duration: 0, speed: 0 }],
      [4, { pace: 0, size: 0, duration: 0, speed: 0 }],
      [5, { pace: 2, size: 30, duration: 2.5, speed: 50 }],
      [6, { pace: 0, size: 0, duration: 0, speed: 0 }],
      [7, { pace: 0, size: 0, duration: 0, speed: 0 }],
      [8, { pace: 0, size: 0, duration: 0, speed: 0 }],
      [9, { pace: 0, size: 0, duration: 0, speed: 0 }],
      [10, { pace: 0, size: 0, duration: 0, speed: 0 }],
    ]
  );


  constructor(props: Props) {
    super(props);
    this.gameComponentRef = React.createRef();
    this.targetSettings = {
      maxSize: 100,
      sizeChangeDistribution: 'linear',
      sizeChangeValue: 0,
      sizeChangeDuration: 5,
      speed: 50,
    };
    this.state = {
      open: true,
      pace: 1,
      difficultyLevel: 5,
      targetSettings: this.targetSettings,
    };
  }

  componentDidMount(): void {
    this.game = this.gameComponentRef.current.game;
    this.gameComponent = this.gameComponentRef.current;
    this.gameComponent.gameMode = 'normal';
    this.game.showLifes = false;
    this.timer = setInterval(this.addTarget, this.state.pace * 1000);
    this.onDifficultyLevelChange(this.state.difficultyLevel);
  }

  componentWillUnmount(): void {
    clearInterval(this.timer as number);
  }

  addTarget = (): void => {
    const targetSettings = { ...this.targetSettings };
    targetSettings.position = this.game.getRandomPosition();
    targetSettings.speed = this.gameComponent.pxToScene(targetSettings.speed);
    targetSettings.maxSize = this.gameComponent.pxToScene(targetSettings.maxSize);
    targetSettings.sizeChangeDuration *= 1000;
    targetSettings.direction = new Vector3(_.random(-1, 1, true), _.random(-1, 1, true), 0);
    this.game.addTarget(targetSettings);
  }

  onDifficultyLevelChange = (difficultyLevel: number): void => {
    this.setState({ difficultyLevel: difficultyLevel });

    this.onPaceChange(this.difficultyLevelValues.get(difficultyLevel).pace);
    this.onMaxSizeChange(this.difficultyLevelValues.get(difficultyLevel).size);
    this.onSizeChangeDurationChange(this.difficultyLevelValues.get(difficultyLevel).duration);
    this.onSpeedChange(this.difficultyLevelValues.get(difficultyLevel).speed);
  }

  onPaceChange = (pace: number): void => {
    this.setState({ pace: pace });

    if (!isNaN(pace)) {
      clearInterval(this.timer as number);
      if (pace > 0) {
        this.timer = setInterval(this.addTarget, 1000 / pace);
      }
    }
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
          <FormControl style={{ margin: 20, marginBottom: 40 }} variant="outlined">
            <InputLabel id="difficulty">Difficulty Level</InputLabel>
            <Select
              labelId="difficulty" value={difficultyLevel} label="Difficulty Level"
              onChange={(e): void => this.onDifficultyLevelChange(Number.parseFloat(e.target.value as string))}>
              {Array.from(this.difficultyLevelValues).map(([key]) => <MenuItem key={key} value={key}>{key}</MenuItem>)}
            </Select>
          </FormControl>
          <FormGroup className={classes.settingsControl}>
            <FormLabel>Settings</FormLabel>
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
        <main className={clsx(classes.mainContent, {[classes.mainContentShift]: !open})}>
          <GameComponent
            ref={this.gameComponentRef}
            onClick={(position): void => this.game.onClick(position)}
          >
          </GameComponent>
        </main>
      </div>
    )
  }
}

export default withStyles(styles, { withTheme: true })(CustomComponent);