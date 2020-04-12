import React from "react";
import { v4 as uuidv4 } from "uuid";

import "./Step.css";

class Step extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: "Loading Page...",
        };
    }

    componentDidMount() {
        fetch(
            `https://en.wikipedia.org/w/api.php?action=parse&format=json&page=${
                this.props.wikiTarget
            }`
        )
            .then((value) => {
                return value.json();
            })
            .then((data) => {
                this.setState({ content: data.parse.text["*"] });
            });
    }

    render() {
        return (
            <div
                className="step"
                dangerouslySetInnerHTML={{ __html: this.state.content }}
            />
        );
    }
}

export default Step;
