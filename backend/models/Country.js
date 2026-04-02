const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
			trim: true,
			unique: true,
			index: true,
		},
		label: {
			type: String,
			required: true,
			trim: true,
		},
		flag: {
			type: String,
			default: "",
			trim: true,
		},
		order: {
			type: Number,
			default: 0,
			index: true,
		},
	},
	{
		timestamps: true,
		id: false,
	},
);

module.exports = mongoose.model("Country", countrySchema);
