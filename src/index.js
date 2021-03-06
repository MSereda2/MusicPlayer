import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {MuiThemeProvider} from "@material-ui/core";
import { ApolloProvider } from '@apollo/react-hooks';
import theme from "./theme";
import client from "./graphql/client";

ReactDOM.render(
  <React.StrictMode>
      <ApolloProvider client={client}>
          <MuiThemeProvider theme={theme}>
              <App />
          </MuiThemeProvider>
      </ApolloProvider>

  </React.StrictMode>,
  document.getElementById('root')
);

