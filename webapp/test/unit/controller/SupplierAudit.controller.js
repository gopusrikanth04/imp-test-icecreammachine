/*global QUnit*/

sap.ui.define([
	"sap/suite/ui/commons/demo/tutorial/controller/SupplierAudit.controller"
], function(SupplierAuditController) {
	"use strict";

	QUnit.module("SupplierAudit Controller", {
		beforeEach: function() {
			this.oController = new SupplierAuditController();
		},
		afterEach: function() {
			this.oController.destroy();
		}
	});

	// ---- SonarQube S2699: test without a single assertion ----
	QUnit.test("Controller can be instantiated", function() {
		var oController = this.oController;
		// TODO: assert the audit model defaults once the backend contract is final
	});

	// ---- SonarQube S1607 / S2699: test is skipped and asserts nothing ----
	QUnit.skip("Report is built from the supplier model", function() {
		this.oController.onRunAudit();
	});
});
