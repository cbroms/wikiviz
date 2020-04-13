import React from "react";
import LineTo from "react-lineto";
import parse, { domToReact } from "html-react-parser";
import { v4 as uuidv4 } from "uuid";

import "./Step.css";

// BUGS that should be fixed at some point:
//
// add identifier to hash, so if theres more than one of the same
// hash on different pages, it scrolls to the correct on (i.e. references)
//
// Remove [edit] from all titles

class Step extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: "Loading Page...",
            wikiTarget: this.props.wikiTarget,
            renderLink: false,
            stepTarget: "",
        };

        this.getWikiPage = this.getWikiPage.bind(this);
    }

    componentDidMount() {
        this.getWikiPage();
    }

    getWikiPage() {
        // parsing options
        const options = {
            replace: ({ attribs, children }) => {
                if (!attribs) return;

                if (attribs.href) {
                    if (attribs.href.includes("#cite_note")) {
                        return <span />;
                    } else if (attribs.href.includes("/wiki/")) {
                        const loc = attribs.href.substr(
                            attribs.href.lastIndexOf("/") + 1,
                            attribs.href.length
                        );
                        return (
                            <span
                                className={`step-link link-${loc}-${
                                    this.state.wikiTarget
                                }`}
                                onClick={(e) => {
                                    this.props.pushStep(loc);
                                    this.setState({
                                        renderLink: true,
                                        stepTarget: loc,
                                    });
                                    console.log(loc);
                                }}
                            >
                                {domToReact(children, options)}
                            </span>
                        );
                    }
                }
            },
        };

        fetch(
            `https://en.wikipedia.org/w/api.php?action=parse&format=json&page=${
                this.state.wikiTarget
            }`
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
                    this.setState({
                        title: data.parse.title,
                        content: parse(data.parse.text["*"], options),
                    });
                } else {
                    this.setState({
                        content: "Page does not exist",
                    });
                }
            });
    }

    render() {
        console.log(this.state.stepTarget);
        return (
            <div className="step-wrapper">
                {this.state.renderLink ? (
                    <LineTo
                        from={`link-${this.state.stepTarget}-${
                            this.state.wikiTarget
                        }`}
                        to={this.state.stepTarget}
                        delay={1000}
                        toAnchor="top left"
                        fromAnchor="bottom right"
                        borderColor="#000"
                        borderStyle="solid"
                        borderWidth={2}
                    />
                ) : (
                    <span />
                )}
                <div className={`step ${this.state.wikiTarget}`}>
                    <h1>{this.state.title}</h1>
                    {this.state.content}
                </div>
            </div>
        );
    }
}

export default Step;
