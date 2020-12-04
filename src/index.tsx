import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import reportWebVitals from './reportWebVitals';
import {Amplify} from "aws-amplify";
import {AWSConfig} from "./config/AwsConfig";
import {createMuiTheme, ThemeProvider} from '@material-ui/core';
import {fetchApplicationConfiguration, history} from "./config/Configuration";
import {Provider} from "react-redux";
import {PersistGate} from 'redux-persist/integration/react';
import {ConnectedRouter} from "connected-react-router";

Amplify.configure(AWSConfig);

const theme = createMuiTheme({
  props: {
    MuiButtonBase: {
      disableRipple: true,
    }
  },
  palette: {
    type: "dark",
    primary: {
      main: '#2a2d44', // header color
      contrastText: "#bbbbbb"
    },
    secondary: {
      main: '#578CDA'
    },
    background: {
      paper: "#262940", // text editor
      default: "#282b42", // base background
    },
    text: {
      primary: "#bbb",
      secondary: "#7b8bab",
      disabled: "#585F6F",
    },
    divider: "#2a334b", // border color
    action: {
      hover: "#2d3047", // highlight color
      focus: "#2d3047", // highlight color
      selected: "#2d3047" // highlight color
    }
  },
});


const {store, persistor} = fetchApplicationConfiguration();

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <ConnectedRouter history={history}>
          <ThemeProvider theme={theme}>
            <App/>
          </ThemeProvider>
        </ConnectedRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
