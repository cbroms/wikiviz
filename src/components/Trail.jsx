import React from "react";
// import { BrowserRouter as Router } from "react-router-dom";
// import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import Step from "./Step";
import TrailNavigation from "./TrailNavigation";

import "./Trail.css";

class Trail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      goodTrail: true,
      redraw: false,
      trail: {},
    };

    this.modifyTrail = this.modifyTrail.bind(this);
    this.searchForParentAndModifyStep = this.searchForParentAndModifyStep.bind(
      this
    );
    this.scrollLeft = this.scrollLeft.bind(this);
    this.scrollRight = this.scrollRight.bind(this);
    this.scroll = this.scroll.bind(this);
  }

  componentDidMount() {
    const { id } = this.props.match.params;

    try {
      //decode and parse the trail
      const res = atob(id);
      const trail = JSON.parse(res);

      // check that the trail is valid, probably want to do more checking here
      if (!trail.p) {
        throw new Error("Bad trail");
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

  scroll(left) {
    const width = window.innerWidth < 600 ? window.innerWidth : 840;
    window.scrollBy(left ? -width : width, 0);
  }

  scrollLeft() {
    this.scroll(true);
  }

  scrollRight() {
    this.scroll(false);
  }

  // find where to fit the page into the trail (find the link origin step and add
  // next page to that step's trail). Recursive search function
  searchForParentAndModifyStep(
    prevObj,
    trailObj,
    action,
    targetName,
    newPage = ""
  ) {
    if (trailObj.p === targetName) {
      // found the correct object, now modify it
      if (action === "ADD") {
        trailObj.t.push({ p: newPage, t: [] });
      } else if (action === "DEL") {
        const index = prevObj.t.indexOf(trailObj);
        prevObj.t.splice(index, 1);
      }

      return;
    } else {
      for (const step of trailObj.t) {
        this.searchForParentAndModifyStep(
          trailObj,
          step,
          action,
          targetName,
          newPage
        );
      }
    }
  }

  // add a new step to the trail (called when a link is clicked in a step)
  modifyTrail(prevPage, newPage, action) {
    let trail = this.state.trail;
    this.searchForParentAndModifyStep({}, trail, action, prevPage, newPage);

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
          steps.push([trailObj]);
        } else {
          steps[level].push(trailObj);
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
      const stepsRend = steps.map((col, level) => {
        return (
          <div className="trail-column" key={level}>
            {col.map((page, row) => {
              return (
                <Step
                  wikiTarget={page.p}
                  initialTarget={page.p}
                  key={page.p}
                  pushStep={(val) => this.modifyTrail(page.p, val, "ADD")}
                  delStep={() => {
                    if (level !== 0) this.modifyTrail(page.p, "", "DEL");
                    else window.location.href = "/";
                  }}
                  minimized={level >= 1}
                  nextSteps={page.t}
                  scrollRight={this.scrollRight}
                  lastStep={level === steps.length - 1}
                  lastInRow={row === col.length - 1}
                  updateParent={() => {
                    this.setState({ redraw: !this.state.redraw });
                  }}
                  redraw={this.state.redraw}
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
          <TrailNavigation left action={this.scrollLeft} />
          {stepsRend}
          <TrailNavigation right action={this.scrollRight} />
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
