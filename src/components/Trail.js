import React from "react";
import { v4 as uuidv4 } from "uuid";
import { BrowserRouter as Router, Redirect } from "react-router-dom";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import Step from "./Step";

import "./Trail.css";

class Trail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      goodTrail: true,
      trail: {},
    };

    this.pushStep = this.pushStep.bind(this);
    this.searchForParentAndAddStep = this.searchForParentAndAddStep.bind(this);
  }

  componentDidMount() {
    const { id } = this.props.match.params;

    try {
      //decode and parse the trail
      const res = atob(id);
      const trail = JSON.parse(res);

      // check that the trail is valid, probably want to do more checking here
      if (!trail.p) {
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

  // find where to fit the page into the trail (find the link origin step and add
  // next page to that step's trail). Recursive search function
  searchForParentAndAddStep(trailObj, targetName, newPage) {
    if (trailObj.p === targetName) {
      trailObj.t.push({ p: newPage, t: [] });
      return;
    } else {
      for (const step of trailObj.t) {
        this.searchForParentAndAddStep(step, targetName, newPage);
      }
    }
  }

  // add a new step to the trail (called when a link is clicked in a step)
  pushStep(prevPage, newPage) {
    let trail = this.state.trail;
    this.searchForParentAndAddStep(trail, prevPage, newPage);

    this.setState({ trail: trail }, () => {
      // change the url without reloading
      const enc = btoa(JSON.stringify(this.state.trail));
      window.history.pushState({}, "", enc);
    });
  }

  render() {
    // if the trail has been parsed and checked, render it
    if (this.state.goodTrail && this.state.trail.t) {
      let steps = [];

      // recursively add each trail to the list of steps, by level
      const traverseTrail = (trailObj, level) => {
        if (steps[level] === undefined) {
          steps.push([trailObj.p]);
        } else {
          steps[level].push(trailObj.p);
        }

        if (trailObj.t.length === 0) return;
        else {
          for (const obj of trailObj.t) {
            traverseTrail(obj, level + 1);
          }
        }
      };

      traverseTrail(this.state.trail, 0);

      // construct the elements from the list of columns of steps
      const stepsRend = steps.map((col) => {
        return (
          <div className="trail-column">
            {col.map((page) => {
              return (
                <Step
                  wikiTarget={page}
                  initialTarget={page}
                  key={page}
                  pushStep={(val) => this.pushStep(page, val)}
                />
              );
            })}
          </div>
        );
      });

      const width =
        window.innerWidth < 600
          ? `${100 * steps.length}vw`
          : `${840 * steps.length}px`;

      return (
        /*<TransformWrapper
          pinch={{ disabled: true }}
          wheel={{ touchPadEnabled: false, wheelEnabled: false }}
        >
          <TransformComponent>*/
        <div style={{ width: width }} id="trail">
          {stepsRend}
        </div>
        //   </TransformComponent>
        // </TransformWrapper>
      );
    } else if (!this.state.goodTrail) {
      return <div>Bad Trail!</div>;
    } else {
      return <div>Loading...</div>;
    }
  }
}

export default Trail;
