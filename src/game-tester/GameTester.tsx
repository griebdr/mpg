// import _ from 'lodash';
import React, { RefObject, ReactNode } from 'react';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import { Pause, PlayArrow, Delete } from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import Slider from '@material-ui/core/Slider';
import Divider from '@material-ui/core/Divider';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import { withStyles, WithStyles, createStyles } from '@material-ui/core';

import './GameTester.css'
import GameComponent from '../game/GameComponent';
import { Target, TargetSizeDistribution, TargetSettings } from '../game/Target';
import Game from '../game/Game';
import { Vector3 } from 'three';

const drawerWidth = 240;

const styles = createStyles({
  drawerPaper: {
    width: drawerWidth,
    overflow: 'visible'
  },
  slider: {
    padding: '22px 0px',
  },
  settings: {
    margin: 20
  },
  mainContent: {
    height: '100vh',
    marginLeft: drawerWidth,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  }
});

type Props = WithStyles<typeof styles>;



interface State {
  open: boolean;
  targetSettings: TargetSettings;
}

class GameTester extends React.Component<Props, State> {
  selectedTarget: Target;
  targetSettings: TargetSettings;
  game: Game;

  gameComponentRef: RefObject<GameComponent>;
  gameComponent: GameComponent;

  ignoreClick = false;

  constructor(props: Props) {
    super(props);
    this.gameComponentRef = React.createRef();
    this.targetSettings = {
      maxSize: 20,
      sizeChangeDistribution: 'Constant',
      sizeChangeValue: 0.5,
      sizeChangeDuration: 6000,
      speed: 10,
      repeating: true,
    };

    this.state = {
      open: true,
      targetSettings: this.targetSettings,
    };
  }

  componentDidMount(): void {
    this.gameComponent = this.gameComponentRef.current;
    this.game = this.gameComponent.game;
  }

  onMaxSizeChange = (event: React.ChangeEvent, value: number): void => {
    this.targetSettings.maxSize = value;
    this.setState({ targetSettings: this.targetSettings });

    if (this.selectedTarget !== undefined) {
      this.selectedTarget.maxSize = this.gameComponent.toSceneSize(value);
    }
  };

  onSizeChangeValueChange = (event: React.ChangeEvent, value: number): void => {
    this.targetSettings.sizeChangeValue = value;
    this.setState({ targetSettings: this.targetSettings });

    if (this.selectedTarget) {
      this.selectedTarget.sizeChangeValue = value;
    }
  }

  onSpeedChange = (event: React.ChangeEvent, value: number): void => {
    this.targetSettings.speed = value;
    this.setState({ targetSettings: this.targetSettings });

    if (this.selectedTarget) {
      this.selectedTarget.speed = this.gameComponent.toSceneSize(value);
    }
  }

  onSizeChangeDurationChange = (event: React.ChangeEvent, value: number): void => {
    this.targetSettings.sizeChangeDuration = value;
    this.setState({ targetSettings: this.targetSettings });

    if (this.selectedTarget) {
      this.selectedTarget.sizeChangeDuration = value;
    }
  }

  sizeChangeDistributionChange = (event: React.ChangeEvent, value: TargetSizeDistribution): void => {
    this.targetSettings.sizeChangeDistribution = value;
    this.setState({ targetSettings: this.targetSettings });

    if (this.selectedTarget) {
      this.selectedTarget.sizeChangeDistribution = value;
    }
  }

  onDelete = (): void => {
    if (this.selectedTarget) {
      this.game.removeTarget(this.selectedTarget);
    } else {
      this.game.targets.forEach(target => this.game.removeTarget(target));
    }
    this.selectedTarget = undefined;
  }

  onPause = (): void => {
    this.gameComponent.pause();
  }

  onResume = (): void => {
    this.gameComponent.resume();
  }

  onTargetSelect = (target: Target): void => {
    this.targetSettings.maxSize = this.gameComponent.fromSceneSize(target.maxSize);
    this.targetSettings.sizeChangeDuration = target.sizeChangeDuration;
    this.targetSettings.sizeChangeValue = target.sizeChangeValue;
    this.targetSettings.speed = this.gameComponent.fromSceneSpeed(target.speed);
    this.targetSettings.sizeChangeDistribution = target.sizeChangeDistribution;

    this.setState({
      targetSettings: this.targetSettings,
    });

    if (this.selectedTarget !== undefined) {
      this.selectedTarget.isSelected = false;
    }

    this.selectedTarget = target;
    this.selectedTarget.isSelected = true;
  }

  onTargetClick = (target: Target): void => {
    if (this.ignoreClick) {
      this.ignoreClick = false;
      return;
    }

    if (target === this.selectedTarget) {
      this.selectedTarget.isSelected = false;
      this.selectedTarget = undefined;
    } else {
      this.onTargetSelect(target);
    }
  }

  onBackgroundClick = (position: Vector3): void => {
    if (this.ignoreClick) {
      this.ignoreClick = false;
      return;
    }

    if (this.selectedTarget === undefined) {
      const targetSettings = { ...this.targetSettings };
      targetSettings.maxSize = this.gameComponent.toSceneSize(targetSettings.maxSize);
      targetSettings.speed = this.gameComponent.toSceneSpeed(targetSettings.speed);
      targetSettings.pos = position;
      targetSettings.showDirection = true;
      this.game.addTarget(targetSettings);
    } else {
      this.selectedTarget.isSelected = false;
      this.selectedTarget = undefined;
    }
  }

  onTargetDrag = (target: Target, dragVec: Vector3): void => {
    target.position.add(dragVec);
    this.ignoreClick = true;
  }

  onDirectionDrag = (target: Target, dragVec: Vector3): void => {
    const directionEnd = target.position.clone().add(target.direction.clone().multiplyScalar(target.speed));
    target.direction = directionEnd.clone().add(dragVec).sub(target.position);
    target.speed = target.position.distanceTo(directionEnd.clone().add(dragVec));
    this.ignoreClick = true;
  }

  render(): ReactNode {
    const { classes } = this.props;
    const { maxSize, speed, sizeChangeDistribution, sizeChangeDuration, sizeChangeValue } = this.state.targetSettings;
    const { open } = this.state;

    return (
      <div>
        <Drawer classes={{ paper: classes.drawerPaper }} variant="persistent" anchor="left" open={open}>
          <div className={classes.buttonContainer}>
            <IconButton onClick={this.onDelete} color="primary"><Delete /></IconButton>
          </div>
          <Divider />
          <div className="settings">
            <div>
              <Typography id="label">Max size</Typography>
              <Slider
                min={4}
                max={80}
                className={classes.slider}
                value={maxSize}
                onChange={this.onMaxSizeChange}
              />
            </div>
            <div>
              <Typography id="label">Size change value</Typography>
              <Slider
                min={0}
                max={1}
                step={0.01}
                className={classes.slider}
                value={sizeChangeValue}
                onChange={this.onSizeChangeValueChange}
              />
            </div>
            <div>
              <Typography id="label">Speed</Typography>
              <Slider
                min={0}
                max={100}
                step={1}
                className={classes.slider}
                value={speed}
                onChange={this.onSpeedChange}
              />
            </div>
            <div>
              <Typography id="label">Size change duration</Typography>
              <Slider
                min={1000}
                max={20000}
                step={10}
                className={classes.slider}
                value={sizeChangeDuration}
                onChange={this.onSizeChangeDurationChange}
              />
            </div>
            <div>
              <FormControl>
                <Typography id="label">Size distribution</Typography>
                <RadioGroup
                  value={sizeChangeDistribution}
                  onChange={this.sizeChangeDistributionChange}
                >
                  <FormControlLabel
                    value="Constant"
                    control=
                    {<Radio
                      icon={<RadioButtonUncheckedIcon fontSize="small" />}
                      checkedIcon={<RadioButtonCheckedIcon fontSize="small" />}
  
                    />}
                    label="Constant" />
                  <FormControlLabel
                    value="Linear"
                    control=
                    {<Radio
                      icon={<RadioButtonUncheckedIcon fontSize="small" />}
                      checkedIcon={<RadioButtonCheckedIcon fontSize="small" />}
                    />}
                    label="Linear" />
                </RadioGroup>
              </FormControl>
            </div>
          </div>
          <Divider />
          <div className={classes.buttonContainer}>
            <IconButton onClick={this.onPause} color="primary"><Pause /></IconButton>
            <IconButton onClick={this.onResume} color="primary"><PlayArrow /></IconButton>
          </div>
        </Drawer>
        <main className={classes.mainContent}>
          <GameComponent
            ref={this.gameComponentRef}
            onTargetClick={this.onTargetClick}
            onBackgroundClick={this.onBackgroundClick}
            onTargetDrag={this.onTargetDrag}
            onDirectionDrag={this.onDirectionDrag}
          >
          </GameComponent>
        </main>
      </div>
    )
  }
}

export default withStyles(styles, { withTheme: true })(GameTester);