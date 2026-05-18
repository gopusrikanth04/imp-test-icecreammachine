sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/suite/ui/commons/demokit/icecream/test/opa/arrangements/Startup",
	"sap/suite/ui/commons/demokit/icecream/test/opa/StartpageJourney",
	"sap/suite/ui/commons/demokit/icecream/test/opa/ReviewsJourney",
	"sap/suite/ui/commons/demokit/icecream/test/opa/BackNavigationJourney"
], function (Opa5, Startup) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "sap.suite.ui.commons.demo.tutorial.view.",
		autoWait: true
	});
});
