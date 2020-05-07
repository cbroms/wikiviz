import React from "react";
import LineTo from "react-lineto";
import parse, { domToReact } from "html-react-parser";
import { v4 as uuidv4 } from "uuid";

import StepControls from "./StepControls";

import "./Step.css";

// BUGS that should be fixed at some point:
//
// add identifier to hash, so if theres more than one of the same
// hash on different pages, it scrolls to the correct on (i.e. references)

class Step extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: "Loading Page...",
            stepTargets: [],
            wikiTarget: this.props.wikiTarget,
            initialTarget: this.props.initialTarget,
            renderLink: false,
            stepTarget: "",
            scrolled: 0,
            minimized: this.props.minimized,
        };

        this.getWikiPage = this.getWikiPage.bind(this);
    }

    componentDidMount() {
        let pageNames = [];
        for (const page of this.props.nextSteps) {
            pageNames.push(page.p);
        }
        this.getWikiPage(pageNames);
        //  console.log(this.props.wikiTarget, pageNames);
    }

    getWikiPage(connections) {
        // add a page to the list of links
        const addToStepTargets = (loc, uuid, callback) => {
            this.setState(
                {
                    renderLink: true,
                    stepTargets: this.state.stepTargets.concat([
                        {
                            stepTarget: loc,
                            stepTargetInitial: loc,
                            stepTargetLinkUuid: uuid,
                            stepTargetRef: React.createRef(),
                        },
                    ]),
                },
                () => {
                    callback();
                }
            );
        };

        // parsing options
        const options = {
            replace: ({ attribs, children }) => {
                if (!attribs) return;

                if (attribs.src) {
                    // console.log(attribs.src);
                } else if (attribs.href) {
                    if (
                        attribs.href.includes("/wiki/") &&
                        !attribs.href.includes("File:")
                    ) {
                        const loc = attribs.href.substr(
                            attribs.href.lastIndexOf("/") + 1,
                            attribs.href.length
                        );

                        const elemUuid = uuidv4();

                        if (
                            connections !== undefined &&
                            connections.includes(loc)
                        ) {
                            addToStepTargets(loc, elemUuid, () => {
                                //    console.log("added " + loc);
                            });

                            connections.splice(connections.indexOf(loc), 1);
                        }

                        // currently this is dynamic and changes each time the page is rerendered
                        // would be good to make the uuid static and preserved in state so the
                        // correct instance of the link is preserved

                        return (
                            <span
                                className={`step-link ${elemUuid}`}
                                onClick={(e) => {
                                    const lastBeforeChange = this.props
                                        .lastStep;
                                    this.props.pushStep(loc);
                                    addToStepTargets(loc, elemUuid, () => {
                                        // only scroll if it's the last step in the trail

                                        if (lastBeforeChange)
                                            this.props.scrollRight();

                                        document
                                            .getElementsByClassName(elemUuid)[0]
                                            .classList.add(
                                                "step-link-selected"
                                            );
                                    });
                                }}
                            >
                                {domToReact(children, options)}
                            </span>
                        );
                    } else if (attribs.href.includes("File:")) {
                        // if the link is to a file, get the make an api call to get the full-resolution image
                        const filename = attribs.href.substr(
                            attribs.href.lastIndexOf("/") + 1,
                            attribs.href.length - 1
                        );
                        const getUrl = () => {
                            fetch(
                                `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&titles=${filename}&origin=*`
                            )
                                .then((value) => {
                                    return value.json();
                                })
                                .then((data) => {
                                    let url = "";
                                    for (const key in data["query"]["pages"]) {
                                        url =
                                            data["query"]["pages"][key][
                                                "imageinfo"
                                            ][0].url;
                                    }

                                    window.open(url, "_blank");
                                });
                        };

                        return (
                            <span className="image" onClick={() => getUrl()}>
                                {domToReact(children, options)}
                            </span>
                        );
                    } else if (attribs.href.includes("redlink=1")) {
                        return <span>{domToReact(children, options)}</span>;
                    }
                }
            },
        };

        //    console.log("fetch ", this.state.wikiTarget);
        fetch(
            `https://en.wikipedia.org/w/api.php?action=parse&format=json&page=${this.state.wikiTarget}&origin=*`
        )
            .then((value) => {
                return value.json();
            })
            .then((data) => {
                if (data.parse && data.parse.sections.length === 0) {
                    // page is a redirect, extract the new target
                    const redir = data.parse.text["*"].match(
                        /\/wiki\/([A-Z])\w+/
                    )[0];

                    const newLoc = redir.substr(
                        redir.lastIndexOf("/") + 1,
                        redir.length
                    );

                    this.setState({ wikiTarget: newLoc }, () => {
                        this.getWikiPage();
                    });
                } else if (data.parse) {
                    try {
                        // parse the content and set it in state
                        const parsed = parse(data.parse.text["*"], options);
                        this.setState({
                            title: data.parse.title,
                            content: parsed,
                        });

                        // parese and add page categories to trail
                        const cats = data.parse.categories.filter((obj) => {
                            return obj.hidden === undefined;
                        });
                        this.props.addCategories(cats, this.state.wikiTarget);
                    } catch (e) {
                        this.setState({ content: "Error parsing page" });
                    }
                } else {
                    this.setState({
                        content: "Page does not exist",
                    });
                }
            });
    }

    render() {
        const links = this.state.stepTargets.map((val) => {
            // the class the line will be drawn from
            let fromClass = this.state.wikiTarget;

            const elt = document.getElementsByClassName(
                val.stepTargetLinkUuid
            )[0];

            // determine if the line start element is visible
            if (elt !== undefined) {
                const rect = elt.getBoundingClientRect();
                const vis = document.elementFromPoint(rect.x, rect.y);

                if (vis === elt) fromClass = val.stepTargetLinkUuid;
                else if (vis !== null) {
                    // case where the link is two lines and the x/y pos is inaccurate
                    const vis2 = document.elementFromPoint(
                        rect.right - 10,
                        rect.y
                    );
                    if (vis2 === elt) fromClass = val.stepTargetLinkUuid;
                }

                if (
                    fromClass === val.stepTargetLinkUuid &&
                    document.getElementsByClassName(val.stepTarget).length > 0
                ) {
                    elt.classList.add("step-link-selected");
                } else {
                    elt.classList.remove("step-link-selected");
                }
            }

            return (
                <LineTo
                    from={fromClass}
                    to={val.stepTarget}
                    delay={20}
                    toAnchor="top left"
                    fromAnchor="top right"
                    borderColor="#000"
                    borderStyle="solid"
                    borderWidth={4}
                    key={`${val.stepTargetLinkUuid}-${val.stepTarget}`}
                />
            );
        });

        return (
            <div className="step-wrapper">
                {links}
                <div
                    className={`step ${this.state.initialTarget} ${
                        this.state.minimized ? "step-mini" : "step-maxi"
                    }`}
                    onScroll={(e) =>
                        this.setState({ scrolled: e.target.scrollTop })
                    }
                >
                    <div className="step-header">
                        <div>{this.state.title}</div>
                        <StepControls
                            minimizeActive={this.state.minimized}
                            lastInRow={this.props.lastInRow}
                            onClose={() => this.props.delStep()}
                            id={`${this.state.wikiTarget}-controls`}
                            onToggleSize={() => {
                                this.setState({
                                    minimized: !this.state.minimized,
                                });
                                this.props.updateParent();
                            }}
                        />
                    </div>
                    <div className="step-int">
                        <h1>{this.state.title}</h1>
                        {this.state.content}
                    </div>
                </div>
            </div>
        );
    }
}

export default Step;
