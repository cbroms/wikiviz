import React from "react";
import { v4 as uuidv4 } from "uuid";
import { BrowserRouter as Router, Redirect } from "react-router-dom";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

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

      this.setState({
        trail: trail,
        goodTrail: true,
      });
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
      const steps = this.state.trail.map((val, i) => {
        return (
          <Step
            wikiTarget={val}
            initialTarget={val}
            key={val}
            pushStep={(val) => this.pushStep(val)}
          />
        );
      });

      const width =
        window.innerWidth < 600
          ? `${100 * steps.length}vw`
          : `${840 * steps.length}px`;

      return (
        <TransformWrapper
          pinch={{ disabled: true }}
          wheel={{ touchPadEnabled: false, wheelEnabled: false }}
        >
          <TransformComponent>
            <div style={{ width: width }}>{steps}</div>
          </TransformComponent>
        </TransformWrapper>
      );
    } else {
      return <div>Bad Trail!</div>;
    }
  }
}

export default Trail;
