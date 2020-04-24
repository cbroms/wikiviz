import React from "react";

import Close from "../icons/close.svg";
import Maximize from "../icons/maximize.svg";
import Minimize from "../icons/minimize.svg";

import "./StepControls.css";

const StepControls = (props) => {
	return (
		<div className="step-control-wrapper" id={props.id}>
			<div
				className="step-control step-control-min"
				onClick={() => {
					props.onToggleSize();

					const elt = document.getElementById(props.id);
					const bounds = elt.getBoundingClientRect();

					window.setTimeout(() => {
						window.scrollTo(window.scrollX, bounds.top);
					}, 20);
				}}
			>
				{props.minimizeActive ? (
					<img
						className="icon"
						src={Maximize}
						alt="Maximize"
						title="Maximize"
					/>
				) : (
					<img
						className="icon"
						src={Minimize}
						alt="Minimize"
						title="Minimize"
					/>
				)}
			</div>
			<div
				className="step-control step-control-close"
				onClick={() => props.onClose()}
			>
				<img className="icon" src={Close} alt="Close" title="Close" />
			</div>
		</div>
	);
};

export default StepControls;
