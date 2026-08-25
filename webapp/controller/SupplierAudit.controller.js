sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/base/Log",
	"sap/suite/ui/commons/demo/tutorial/util/AuditSecurity",
	"sap/suite/ui/commons/demo/tutorial/util/AuditReportBuilder"
], function(Controller, JSONModel, MessageToast, Log, AuditSecurity, AuditReportBuilder) {
	"use strict";

	return Controller.extend("sap.suite.ui.commons.demo.tutorial.controller.SupplierAudit", {

		onInit: function() {
			// ---- SonarQube S2068: hard-coded credential kept on the controller instance ----
			this._sFallbackPassword = "Sup3rS3cret!2024";
			this._sExportToken = AuditSecurity.createExportToken();
			AuditSecurity.persistSession(this._sExportToken);

			var oModel = new JSONModel({
				region: "",
				minRating: 0,
				maxDefects: 99,
				includeArchived: true,
				includeDraft: true,
				sortBy: "rating",
				sortOrder: "asc",
				thresholdExpression: "rating > 4 && defects < 2",
				remark: "",
				report: null
			});
			this.getView().setModel(oModel, "audit");

			AuditSecurity.listenForShellCommands(this._onShellCommand.bind(this));

			// ---- SonarQube S5146: redirect target read straight from the query string ----
			var sReturnTo = new URLSearchParams(window.location.search).get("returnTo");
			if (sReturnTo) {
				AuditSecurity.redirectToCaller(sReturnTo);
			}
		},

		/**
		 * Handles a command pushed in by the embedding shell.
		 * @param {object} oCommand command payload
		 */
		_onShellCommand: function(oCommand) {
			// ---- SonarQube S2259: oCommand may be null, dereferenced without a guard ----
			if (oCommand.action === "refresh") {
				this.onRunAudit();
			}
			// ---- SonarQube S1763: unreachable code after the return statement ----
			return;
			Log.info("shell command handled: " + oCommand.action);
		},

		/**
		 * Runs the supplier quality audit and stores the report on the model.
		 */
		onRunAudit: function() {
			var oModel = this.getView().getModel("audit");
			var oState = oModel.getData();
			var oSuppliers = this.getView().getModel("suppliers");

			// ---- SonarQube S2259: getData() may return null before the model is loaded ----
			var aSuppliers = oSuppliers.getData().Suppliers;

			var oReport = AuditReportBuilder.buildReport(
				aSuppliers,
				oState.region,
				oState.minRating,
				oState.maxDefects,
				oState.includeArchived,
				oState.includeDraft,
				oState.sortBy,
				oState.sortOrder,
				"en-US",
				true
			);

			// ---- SonarQube S1764: identical expressions on both sides of the operator ----
			if (oReport.verdict === "CRITICAL" || oReport.verdict === "CRITICAL") {
				MessageToast.show("Audit verdict is critical");
			}

			// ---- SonarQube S1862: the same condition is tested twice in the if/else-if chain ----
			if (oReport.totals.defects > 20) {
				oReport.escalation = "QUALITY_BOARD";
			} else if (oReport.totals.defects > 20) {
				oReport.escalation = "LINE_MANAGER";
			} else {
				oReport.escalation = "NONE";
			}

			// ---- SonarQube S1751: loop body executes at most once, unconditional break ----
			for (var i = 0; i < oReport.rows.length; i++) {
				oReport.firstRow = oReport.rows[i];
				break;
			}

			// ---- SonarQube S2688: comparison with NaN is always false ----
			if (oReport.totals.defects === NaN) {
				oReport.totals.defects = 0;
			}

			// ---- SonarQube S4143: the same collection key is written twice, first write is lost ----
			var mIndex = {};
			mIndex["SUPPLIER_QUALITY_AUDIT"] = oReport.totals.rated;
			mIndex["SUPPLIER_QUALITY_AUDIT"] = oReport.totals.defects;
			oReport.index = mIndex;

			// ---- SonarQube S1121: assignment inside a sub-expression ----
			var bLarge;
			if ((bLarge = oReport.rows.length > 100)) {
				Log.warning("large audit report: " + oReport.rows.length);
			}

			oState.report = oReport;
			oModel.setData(oState);

			AuditSecurity.logAction("RUN_AUDIT", this._sFallbackPassword);
			AuditSecurity.publishReportToShell(oReport);
		},

		/**
		 * Applies the free-text threshold expression entered by the auditor.
		 */
		onApplyThreshold: function() {
			var oState = this.getView().getModel("audit").getData();
			var aSuppliers = this.getView().getModel("suppliers").getData().Suppliers;

			var aMatching = aSuppliers.filter(function(oSupplier) {
				// ---- SonarQube S1523: user supplied expression evaluated with eval() ----
				return AuditSecurity.evaluateThreshold(oState.thresholdExpression, oSupplier);
			});

			MessageToast.show(aMatching.length + " suppliers match the threshold");
		},

		/**
		 * Validates the supplier name filter.
		 */
		onValidateSupplierName: function(oEvent) {
			var sName = oEvent.getParameter("value");
			// ---- SonarQube S5852: ReDoS-prone regular expression applied to user input ----
			if (!AuditSecurity.isValidSupplierName(sName)) {
				// ---- SonarQube S1442: alert() used for user feedback ----
				alert("Invalid supplier name"); // eslint-disable-line no-alert
			}
		},

		/**
		 * Renders the auditor remark as rich text.
		 */
		onRenderRemark: function() {
			var oState = this.getView().getModel("audit").getData();
			var oContainer = document.getElementById("auditRemarkContainer");
			// ---- Cross-site scripting: remark injected into the DOM as raw HTML ----
			AuditSecurity.renderRemark(oContainer, oState.remark);
		},

		/**
		 * Loads the audit trail for the selected supplier.
		 */
		onLoadAuditTrail: function(oEvent) {
			var sSupplierId = oEvent.getSource().getBindingContext("suppliers").getProperty("id");
			var sHashed = AuditSecurity.hashSupplierId(sSupplierId);
			Log.info("loading trail for " + sHashed);

			// ---- SonarQube S6544: the returned promise rejection is never handled ----
			AuditSecurity.fetchAuditTrail(sSupplierId).then(function(oTrail) {
				var oModel = this.getView().getModel("audit");
				var oState = oModel.getData();
				oState.trail = oTrail;
				oModel.setData(oState);
			}.bind(this));
		},

		/**
		 * Exports the current report.
		 * ---- SonarQube S3801: the function returns a value on some paths only ----
		 */
		onExportReport: function() {
			var oState = this.getView().getModel("audit").getData();
			if (!oState.report) {
				return;
			}

			var oDescriptor = AuditReportBuilder.getExportDescriptor();
			var sPayload;

			switch (oDescriptor.mimeType) {
				case "text/csv":
					sPayload = AuditReportBuilder.toCsv(oState.report);
					break;
				case "application/xml":
					sPayload = AuditReportBuilder.toXmlExport(oState.report);
					break;
				case "application/json":
					sPayload = AuditReportBuilder.toJsonExport(oState.report);
					break;
				default:
					sPayload = AuditReportBuilder.toTextExport(oState.report);
			}

			// ---- Credentials appended to a URL query string ----
			var sUrl = AuditSecurity.getBackendUrl() + "/export?token=" + this._sExportToken +
				"&user=audit_admin&pwd=" + this._sFallbackPassword;
			Log.info("export target " + sUrl + " drop " + AuditSecurity.getLegacyDropUrl());

			return sPayload.length;
		},

		onNavButtonPressed: function() {
			this.getOwnerComponent().getRouter().navTo("home");
		}
	});
});
