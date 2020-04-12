import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import "./App.css";

import WikiSearch from "./components/WikiSearch";
import Trail from "./components/Trail";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      trail: [],
      redir: false,
      redirTarget: "",
    };

    this.updateTrail = this.updateTrail.bind(this);
  }

  componentDidMount() {}

  updateTrail(newPage) {
    this.setState(
      {
        trail: [newPage],
      },
      () => {
        const enc = btoa(JSON.stringify(this.state.trail));
        this.setState({ redir: true, redirTarget: enc });
      }
    );
  }

  render() {
    if (this.state.redir) {
      this.setState({ redir: false });
      return (
        <Router>
          <Redirect to={`/trail/${this.state.redirTarget}`} />
        </Router>
      );
    }

    return (
      <Router>
        <Switch>
          <Route path="/trail/:id" component={Trail} />
          <Route path="/">
            <WikiSearch
              onselection={(value) => {
                this.updateTrail(value);
              }}
            />
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default App;
