import React from "react";
import { v4 as uuidv4 } from "uuid";
import { BrowserRouter as Router, Redirect } from "react-router-dom";

import Step from "./Step";

class Trail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      goodTrail: true,
      trail: [],
    };

    this.pushStep = this.pushStep.bind(this);
  }

  componentDidMount() {
    const { id } = this.props.match.params;

    try {
      //decode and parse the trail
      const res = atob(id);
      const trail = JSON.parse(res);

      // check that the trail is valid, probably want to do more checking here
      if (!trail[0]) {
        throw "Bad trail";
      }

      this.setState({ trail: trail, goodTrail: true });
    } catch (e) {
      console.log(e);
      this.setState({ goodTrail: false });
    }
  }

  pushStep(newPage) {
    this.setState(
      {
        trail: this.state.trail.concat([newPage]),
      },
      () => {
        // change the url without reloading
        const enc = btoa(JSON.stringify(this.state.trail));
        window.history.pushState({}, "", enc);
      }
    );
  }

  render() {
    if (this.state.goodTrail) {
      const steps = this.state.trail.map((val) => {
        return (
          <Step
            wikiTarget={val}
            key={val}
            pushStep={(val) => this.pushStep(val)}
          />
        );
      });

      const width =
        window.innerWidth < 600
          ? `${100 * steps.length}vw`
          : `${840 * steps.length}px`;
      return <div style={{ width: width }}>{steps}</div>;
    } else {
      return <div>Bad Trail!</div>;
    }
  }
}

export default Trail;
