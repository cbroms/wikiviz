import React from "react";
import { v4 as uuidv4 } from "uuid";

class WikiSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: "",
            recs: [],
            recUrls: [],
        };

        this.handleChange = this.handleChange.bind(this);
        this.makeWikiQuery = this.makeWikiQuery.bind(this);
    }

    handleChange(event) {
        this.setState({ value: event.target.value }, () => {
            this.makeWikiQuery();
        });
    }

    makeWikiQuery() {
        const formattedVal = this.state.value.replace(" ", "_");
        fetch(
            `https://en.wikipedia.org/w/api.php?action=opensearch&limit=4&format=json&search=${formattedVal}`
        )
            .then((value) => {
                return value.json();
            })
            .then((data) => {
                if (data[1] && data[3])
                    this.setState({ recs: data[1], recUrls: data[3] });
                else this.setState({ recs: [], recUrls: [] });
            });
    }

    render() {
        const recs = this.state.recs.map((val, i) => {
            return (
                <div
                    onClick={() =>
                        this.props.onselection(
                            this.state.recUrls[i].substr(
                                this.state.recUrls[i].lastIndexOf("/") + 1,
                                this.state.recUrls[i].length
                            )
                        )
                    }
                    key={uuidv4()}
                >
                    {val}
                </div>
            );
        });

        return (
            <div>
                <label htmlFor="wikipage">Wikipedia Page: </label>
                <input
                    name="wikipage"
                    type="text"
                    value={this.state.value}
                    onChange={this.handleChange}
                />
                <div>{recs}</div>
            </div>
        );
    }
}

export default WikiSearch;
