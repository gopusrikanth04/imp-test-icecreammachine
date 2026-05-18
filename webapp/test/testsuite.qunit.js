sap.ui.define(function() {
	"use strict";

	return {
		name: "QUnit test suite for IceCream",
		defaults: {
			page: "ui5://test-resources/sap/suite/ui/commons/demokit/icecream/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			},
			ui5: {
				language: "EN",
				theme: "sap_horizon"
			},
			coverage: {
				only: "sap/suite/ui/commons/demokit/icecream/",
				never: [
					"sap/suite/ui/commons/demokit/icecream/test/"
				]
			},
			loader: {
				paths: {
					"sap/suite/ui/commons/demokit/icecream": "../",
                    "sap/suite/ui/commons/demo/tutorial": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for IceCream Machine"
			},
			"opa/opaTests": {
				title: "Integration tests for IceCream Machine"
			}
		}
	};
});