import React from "react";
import { v4 as uuidv4 } from "uuid";

import Step from "./Step";

class Trail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      goodTrail: true,
      trail: [],
    };
  }

  componentDidMount() {
    // const translatedTrail = this.props.trail.map((val, i) =>{

    // })
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

  render() {
    if (this.state.goodTrail) {
      const steps = this.state.trail.map((val) => {
        return (
          <Step wikiTarget={val} key={uuidv4()} trail={this.state.trail} />
        );
      });

      return <div>{steps}</div>;
    } else {
      return <div>Bad Trail!</div>;
    }
  }
}

export default Trail;
