import React from "react";

const CategoryColors = (props) => {
	const allCats = [];

	for (const page of props.categories) {
		for (const cat of page.c) {
			allCats.push({ p: page.p, c: cat["*"] });
		}
	}
	console.log(allCats);

	return <div>Hi</div>;
};

export default CategoryColors;
