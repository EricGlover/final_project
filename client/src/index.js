import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./components/App";
import registerServiceWorker from "./registerServiceWorker";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import { BrowserRouter as Router } from "react-router-dom";
import thunk from "redux-thunk";
import reducers from "./reducers";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";

const store = createStore(reducers, applyMiddleware(thunk));
console.log(store.getState());
const Index = () => {
  return (
    <MuiThemeProvider>
      <Provider store={store}>
        <Router>
          <App />
        </Router>
      </Provider>
    </MuiThemeProvider>
  );
};

ReactDOM.render(<Index />, document.getElementById("root"));
registerServiceWorker();
