sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/base/strings/formatMessage"
], function(jQuery, Controller, formatMessage) {
	"use strict";

	return Controller.extend("sap.suite.ui.commons.demo.tutorial.controller.ChartContainer", {
		formatMessage: formatMessage,
		onNavButtonPressed: function() {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("home");
		},

		/**
		 * Determines the visual state for a temperature reading based on its deviation from target.
		 *
		 * @param {float} fTemperature Measured temperature
		 * @param {float} fTarget Target temperature
		 * @returns {string} sap.ui.core.ValueState-compatible state
		 */
		getTemperatureState: function(fTemperature, fTarget) {
			var fDeviation = Math.abs(fTemperature - fTarget);

			if (fDeviation <= 0.5) {
				return "Success";
			} else if (fTemperature > fTarget) {
				return fDeviation <= 1.5 ? "Warning" : "Error";
			} else {
				return fDeviation <= 1.5 ? "Warning" : "Error";
			}
		}
	});
});
