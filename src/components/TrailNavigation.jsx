import React, { useState } from "react";

import Right from "../icons/right.svg";
import Left from "../icons/left.svg";

import "./TrailNavigation.css";

const TrailNavigation = (props) => {
	const [xPos, setXPos] = useState(window.scrollX);

	window.addEventListener("scroll", () => {
		setXPos(window.scrollX);
	});

	let navClass = "";

	if (props.right && xPos + 1 >= window.scrollMaxX) {
		navClass = "hidden";
	} else if (props.left && xPos <= 0) {
		navClass = "hidden";
	}
	return (
		<div
			className={`trail-navigation ${navClass} ${
				props.right ? "right" : "left"
			}`}
			onClick={() => props.action()}
		>
			<img
				className="icon-inv arrow-icon"
				src={props.right ? Right : Left}
				alt={props.right ? "Arrow right" : "Arrow left"}
				title={props.right ? " Move right" : "Move reft"}
			/>
		</div>
	);
};

export default TrailNavigation;
