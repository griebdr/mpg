import React from 'react';
import { createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import './MainComponent.css';
import { Link } from 'react-router-dom';

const styles = createStyles({
  root: {
    flexGrow: 1,
  },
  menuButton: {

  },
  title: {
    flexGrow: 1,
  },
});

interface Props extends WithStyles<typeof styles> {

}

interface State {

}

class MainComponent extends React.Component<Props, State> {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <AppBar elevation={10} position="relative">
          <Toolbar>
            <Button color="inherit"><Link className="link" to="/custom/">Custom</Link></Button>
            <Button color="inherit"><Link className="link" to="/test/">Test</Link></Button>
          </Toolbar>
        </AppBar>
        <header color="primary" className="header">
          <div className="headerText">
            Mouse Practice Game
          </div>
          <Button size="large" variant="contained" color="primary" className="startButton">
            <Link className="link" to="/normal/">Start</Link>
          </Button>
        </header>
      </div >
    );
  }
}

export default withStyles(styles)(MainComponent);;