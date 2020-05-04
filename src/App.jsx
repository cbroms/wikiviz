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
      trail: {},
      redir: false,
      redirTarget: "",
    };

    this.updateTrail = this.updateTrail.bind(this);
    this.redirected = this.redirected.bind(this);
  }

  componentDidMount() {}

  updateTrail(newPage) {
    this.setState(
      {
        trail: { p: newPage, t: [] },
      },
      () => {
        const enc = btoa(JSON.stringify(this.state.trail));
        this.setState({ redir: true, redirTarget: enc });
      }
    );
  }

  redirected() {
    this.setState({ redir: false });
  }

  render() {
    if (this.state.redir) {
      this.redirected();

      // redirect to the trail once its been parsed
      return (
        <Router>
          <Redirect to={`/trail/${this.state.redirTarget}`} push />
        </Router>
      );
    }

    return (
      <Router>
        <Switch>
          <Route path="/trail/:id" component={Trail} />
          <Route path="/">
           <h1 id="logo">WikiViz</h1>
           <div id="centered">
           <p id="subtitle">Browse through Wikipedia pages side by side and see how they're linked with visual hyperlink connections.</p>
            <WikiSearch
              onselection={(value) => {
                this.updateTrail(value);
              }}
            />
            </div>
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default App;
