import _ from 'lodash';
import React, { ReactNode, ReactElement } from 'react';
import { createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Button, Modal, TextField, Typography, Link, Menu, MenuItem, Snackbar } from '@material-ui/core';
import './MainComponent.css';
import { genericService } from '../services/generic-service';
import { User, SignUpResponse, SignInResponse } from '../types';

const styles = createStyles({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
  signupTitle: {
    alignSelf: 'center',
    marginBottom: 40,
    fontWeight: 400,
  },
  headerText: {
    fontFamily: 'Roboto',
    fontWeight: 200,
    fontSize: 62,
    alignSelf: 'center',
    color: 'white',
    opacity: 0.9,
    marginBottom: 70
  }
});

type Props = WithStyles<typeof styles>;

interface State {
  signUpActive?: boolean;
  signUpData?: { email: string; username: string; password: string };
  signUpResponse?: SignUpResponse | undefined;
  signInActive?: boolean;
  signInData?: { username: string; password: string };
  signInResponse?: SignInResponse | undefined;
  user?: User | undefined;
  signUpSuccessOpen?: boolean;
}

class MainComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { signUpActive: false, signInActive: false, signUpSuccessOpen: false };
  }

  async componentDidMount(): Promise<void> {
    const user = await genericService.getUser();

    if (!user) {
      this.setState({ user: null });
    } else {
      this.setState({ user });
    }
  }

  signUp = async (): Promise<void> => {
    const signUpResponse = await genericService.signUp(this.state.signUpData);

    if (signUpResponse.success) {
      const user = await genericService.getUser();
      this.setState({ user, signUpActive: false, signUpSuccessOpen: true });
    } else {
      this.setState({ signUpResponse });
    }

    this.setState({ signUpSuccessOpen: true });
  }

  signIn = async (): Promise<void> => {
    const signInResponse = await genericService.signIn(this.state.signInData);

    if (signInResponse.success) {
      const user = await genericService.getUser();
      this.setState({ user, signInActive: false });
    } else {
      this.setState({ signInResponse });
    }
  }

  signOut = async (): Promise<void> => {
    await genericService.signOut();
    this.setState({ user: null });
  }

  renderSignUp = (): ReactNode => {
    const { signUpActive, signUpResponse: registrationResponse, signUpData: registrationData } = this.state;
    const { usernameErrorMsg = undefined, passwordErrorMsg = undefined, emailErrorMsg = undefined } = registrationResponse || {};
    const { classes } = this.props;

    return (
      <Modal
        open={signUpActive}
        onClose={(): void => this.setState({ signUpActive: false })}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div className="paper">
          <Typography color="primary" variant="h5" className={classes.signupTitle}>Sign up</Typography>
          <div className="user-input">
            <TextField
              style={{ marginBottom: 20, width: "100%" }}
              onChange={(e): void => { this.setState({ signUpData: _.assign(registrationData, { email: e.target.value }) }) }}
              error={emailErrorMsg !== undefined}
              helperText={emailErrorMsg}
              label="E-mail"
            />
            <TextField
              style={{ marginBottom: 20, width: "100%" }}
              onChange={(e): void => { this.setState({ signUpData: _.assign(registrationData, { username: e.target.value }) }) }}
              error={usernameErrorMsg !== undefined}
              helperText={usernameErrorMsg}
              label="Username"
            />
            <TextField
              style={{ marginBottom: 20, width: "100%" }}
              onChange={(e): void => { this.setState({ signUpData: _.assign(registrationData, { password: e.target.value }) }) }}
              error={passwordErrorMsg !== undefined}
              helperText={passwordErrorMsg}
              type="Password"
              label="Password"
            />
          </div>
          <Button variant="contained" onClick={this.signUp} style={{ marginTop: 20 }} color="primary">
            Sign Up
          </Button>

        </div>
      </Modal>
    )
  }

  renderSignIn = (): ReactNode => {
    const { signInActive, signInResponse, signInData } = this.state;
    const { usernameErrorMsg = undefined, passwordErrorMsg = undefined } = signInResponse || {};
    const { classes } = this.props;

    return (
      <Modal
        open={signInActive}
        onClose={(): void => this.setState({ signInActive: false })}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div className="paper">
          <Typography color="primary" variant="h5" className={classes.signupTitle}>Sign in</Typography>
          <div className="user-input">
            <TextField
              style={{ marginBottom: 20, width: "100%" }}
              onChange={(e): void => { this.setState({ signInData: _.assign(signInData, { username: e.target.value }) }) }}
              error={usernameErrorMsg !== undefined}
              helperText={usernameErrorMsg}
              label="Username"
            />
            <TextField
              style={{ marginBottom: 20, width: "100%" }}
              onChange={(e): void => { this.setState({ signInData: _.assign(signInData, { password: e.target.value }) }) }}
              error={passwordErrorMsg !== undefined}
              helperText={passwordErrorMsg}
              type="Password"
              label="Password"
            />
          </div>
          <Button variant="contained" onClick={this.signIn} style={{ marginTop: 20, marginBottom: 40 }} color="primary">
            Sign in
          </Button>
          <Typography variant="body2" style={{ display: 'flex', justifyContent: 'space-around', }}>
            <Link href="#" onClick={(): void => this.setState({ signInActive: false, signUpActive: true })}>
              Sign up
            </Link>
            <Link href="#" onClick={(): void => this.setState({ signInActive: false, signUpActive: true })}>
              Reset password
            </Link>
          </Typography>

        </div>
      </Modal>
    )
  }

  renderSignInMenu = (): ReactElement => {
    const { user } = this.state;

    const SignedOutMenu = (): ReactElement => {
      return <Button color="inherit" onClick={(): void => this.setState({ signInActive: true })}>Sign in</Button>
    }

    const SignedInMenu = (): ReactElement => {
      const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

      const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
        setAnchorEl(event.currentTarget);
      };

      return (
        <div>
          <Button style={{ textTransform: 'none', color: 'white' }} onClick={handleClick}>
            <Typography> {user.username} </Typography>
          </Button>
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={(): void => setAnchorEl(null)}
          >
            <MenuItem onClick={(): void => { setAnchorEl(null); this.signOut(); }}>Sign out</MenuItem>
          </Menu>
        </div>
      )
    }

    if (user) {
      return <SignedInMenu />;
    } else if (user === null) {
      return <SignedOutMenu />
    } else if (user === undefined) {
      return <div></div>
    }
  }

  render(): ReactNode {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <AppBar elevation={10} position="relative">
          <Toolbar className="button-container">
            <div>
              <Button color="inherit"><RouterLink className="link" to="/custom/">Custom</RouterLink></Button>
              <Button color="inherit"><RouterLink className="link" to="/test/">Test</RouterLink></Button>
            </div>
            {this.state.user && !this.state.user.activated &&
              <Typography color="error">Check your email to activate your account!</Typography>
            }
            {this.renderSignInMenu()}
          </Toolbar>
        </AppBar>

        <header color="primary" className="header">
          <div className={classes.headerText}>
            Mouse Practice Game
          </div>
          <Button size="large" variant="contained" color="primary" className="startButton">
            <RouterLink className="link" to="/normal/">Start</RouterLink>
          </Button>
        </header>
        {this.renderSignUp()}
        {this.renderSignIn()}
        <Snackbar
          open={this.state.signUpSuccessOpen}
          onClose={(): void => { this.setState({ signUpSuccessOpen: false }) }}
          autoHideDuration={10000}
          message="You signed up successfully! WARNING: If you don’t activate your email your account will be deleted within two days!"
        />

      </div>
    );
  }
}

export default withStyles(styles)(MainComponent);
