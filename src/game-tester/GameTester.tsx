import Lodash from 'lodash';
import React, { RefObject } from 'react';
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
import GameComponent, { TargetSettings, GameMode } from '../game/GameComponent';
import { TargetSizeDistribution } from '../game/GameComponent';
import { Target } from '../game/Target';
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

interface Props extends WithStyles<typeof styles> {

}

interface State {
  open: boolean;
  targetSettings: TargetSettings;
  gameMode: GameMode;
}

class GameTester extends React.Component<Props, State> {
  selectedTarget: Target;
  targetSettings: TargetSettings;
  game: Game;

  gameComponentRef: RefObject<GameComponent>;
  gameComponent: GameComponent;

  constructor(props: Props) {
    super(props);
    this.gameComponentRef = React.createRef();
    this.targetSettings = {
      maxSize: 100,
      sizeChangeDistribution: 'linear',
      sizeChangeValue: 0.5,
      sizeChangeDuration: 10500,
      speed: 100,
    };

    this.state = {
      open: true,
      targetSettings: this.targetSettings,
      gameMode: 'testing',
    };
  }

  componentDidMount() {
    this.game = this.gameComponentRef.current.game;
    this.gameComponent = this.gameComponentRef.current;
    this.gameComponent.gameMode = 'testing';
    this.game.showLifes = false;
    // this.game.start();
  }



  onMaxSizeChange = (event: React.ChangeEvent, value: number) => {
    this.targetSettings.maxSize = value;
    this.setState({ targetSettings: this.targetSettings });
    if (this.selectedTarget !== undefined) {
      this.selectedTarget.maxSize = this.gameComponentRef.current.pxToScene(value);
    }
  };

  onSizeChangeValueChange = (event: React.ChangeEvent, value: number) => {
    this.targetSettings.sizeChangeValue = value;
    this.setState({ targetSettings: this.targetSettings });
    if (this.selectedTarget !== undefined) {
      this.selectedTarget.sizeChangeValue = value;
    }
  }

  onSpeedChange = (event: React.ChangeEvent, value: number) => {
    this.targetSettings.speed = value;
    this.setState({ targetSettings: this.targetSettings });
    if (this.selectedTarget !== undefined) {
      this.selectedTarget.speed = this.gameComponentRef.current.pxToScene(value);
    }
  }

  onSizeChangeDurationChange = (event: React.ChangeEvent, value: number) => {
    this.targetSettings.sizeChangeDuration = value;
    this.setState({ targetSettings: this.targetSettings });
    if (this.selectedTarget !== undefined) {
      this.selectedTarget.sizeChangeDuration = value;
    }
  }

  sizeChangeDistributionChange = (event: React.ChangeEvent, value: TargetSizeDistribution) => {
    this.targetSettings.sizeChangeDistribution = value;
    this.setState({ targetSettings: this.targetSettings });

    if (this.selectedTarget !== undefined) {
      this.selectedTarget.sizeChangeDistribution = value;
    }
  }

  onGameModeChange = (event: React.ChangeEvent, value: GameMode) => {
    this.setState({ gameMode: value });
    this.setState({ targetSettings: this.targetSettings });
    this.gameComponentRef.current.gameMode = value;
  }

  onDelete = () => {
    if (this.selectedTarget) {
      Lodash.remove(this.game.targets, this.selectedTarget);
    } else {
      Lodash.remove(this.game.targets, { isSelected: false });
    }
    this.selectedTarget = undefined;
  }


  onPause = () => {
    // this.game.pause();
  }

  onResume = () => {
    // this.game.resume();
  }

  onTargetSelect = (target: Target) => {
    this.targetSettings.maxSize = this.gameComponentRef.current.sceneToPx(target.maxSize);
    this.targetSettings.sizeChangeDuration = target.sizeChangeDuration;
    this.targetSettings.sizeChangeValue = target.sizeChangeValue;
    this.targetSettings.speed = this.gameComponentRef.current.sceneToPx(target.speed);
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

  onTargetClick = (target: Target, position: Vector3) => {
    switch (this.state.gameMode) {
      case 'normal':
        this.game.onClick(position);
        break;
      case 'testing':
        if (target === this.selectedTarget) {
          this.selectedTarget.isSelected = false;
          this.selectedTarget = undefined;
        } else {
          this.onTargetSelect(target);
        }
        break;
    }
  }

  onBackgroundClick = (position: Vector3) => {
    switch (this.state.gameMode) {
      case 'normal':
        this.game.onClick(position);
        break;
      case 'testing':
        if (this.selectedTarget === undefined) {
          const targetSettings = { ...this.targetSettings };
          targetSettings.maxSize = this.gameComponent.pxToScene(targetSettings.maxSize);
          targetSettings.speed = this.gameComponent.pxToScene(targetSettings.speed);
          targetSettings.position = position;
          targetSettings.showDirection = true;
          const target = new Target(targetSettings);
          this.game.targets.push(target);
        } else {
          this.selectedTarget.isSelected = false;
          this.selectedTarget = undefined;
        }
        break;
      default:
        break;
    }

  }

  onTargetDrag = (target: Target, dragVec: Vector3) => {
    target.position.add(dragVec);
  }

  onDirectionDrag = (target: Target, dragVec: Vector3) => {
    const directionEnd = target.position.clone().add(target.direction.clone().multiplyScalar(target.speed));
    target.direction = directionEnd.clone().add(dragVec).sub(target.position);
    target.speed = target.position.distanceTo(directionEnd.clone().add(dragVec));
  }

  render() {
    const { classes } = this.props;
    const { maxSize, speed, sizeChangeDistribution, sizeChangeDuration, sizeChangeValue } = this.state.targetSettings;
    const { gameMode } = this.state;

    return (
      <div>
        <Drawer classes={{ paper: classes.drawerPaper }} variant="persistent" anchor="left" open={this.state.open}>
          <div className={classes.buttonContainer}>
            <IconButton onClick={this.onDelete} color="primary"><Delete /></IconButton>
          </div>
          <Divider />
          <div className="settings">
            <div>
              <Typography id="label">Max size</Typography>
              <Slider
                min={0}
                max={200}
                disabled={false}
                className={classes.slider}
                aria-labelledby="label"
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
                disabled={false}
                className={classes.slider}
                aria-labelledby="label"
                value={sizeChangeValue}
                onChange={this.onSizeChangeValueChange}
              />
            </div>
            <div>
              <Typography id="label">Speed</Typography>
              <Slider
                min={0}
                max={500}
                step={1}
                disabled={false}
                className={classes.slider}
                aria-labelledby="label"
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
                disabled={false}
                className={classes.slider}
                aria-labelledby="label"
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
                    value="constant"
                    control=
                    {<Radio
                      icon={<RadioButtonUncheckedIcon fontSize="small" />}
                      checkedIcon={<RadioButtonCheckedIcon fontSize="small" />}
                    />}
                    label="Constant" />
                  <FormControlLabel
                    value="linear"
                    control=
                    {<Radio
                      icon={<RadioButtonUncheckedIcon fontSize="small" />}
                      checkedIcon={<RadioButtonCheckedIcon fontSize="small" />}
                    />}
                    label="Linear" />
                </RadioGroup>
              </FormControl>
            </div>
            <div>
              <FormControl>
                <Typography id="label">Game mode</Typography>
                <RadioGroup
                  value={gameMode}
                  onChange={this.onGameModeChange}
                >
                  <FormControlLabel
                    value="normal"
                    control=
                    {<Radio
                      icon={<RadioButtonUncheckedIcon fontSize="small" />}
                      checkedIcon={<RadioButtonCheckedIcon fontSize="small" />}
                    />}
                    label="Normal" />
                  <FormControlLabel
                    value="testing"
                    control=
                    {<Radio
                      icon={<RadioButtonUncheckedIcon fontSize="small" />}
                      checkedIcon={<RadioButtonCheckedIcon fontSize="small" />}
                    />}
                    label="Testing" />
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
            onTargetDrag={this.onTargetDrag}
            onDirectionDrag={this.onDirectionDrag}
            onBackgroundClick={this.onBackgroundClick}
          >
          </GameComponent>
        </main>
      </div>
    )
  }
}

export default withStyles(styles, { withTheme: true })(GameTester);