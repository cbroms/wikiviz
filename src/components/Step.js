import React from "react";
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
                                className="step-link"
                                onClick={(e) => {
                                    this.props.pushStep(loc);
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
                if (data.parse.sections.length === 0) {
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
                } else {
                    this.setState({
                        title: data.parse.title,
                        content: parse(data.parse.text["*"], options),
                    });
                }
            });
    }

    render() {
        return (
            <div className="step">
                <h1>{this.state.title}</h1>
                {this.state.content}{" "}
            </div>
        );
    }
}

export default Step;
