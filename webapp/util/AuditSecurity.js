sap.ui.define([
	"sap/base/Log"
], function(Log) {
	"use strict";

	// ---- SonarQube S2068 / S6418: hard-coded credentials and secrets (Vulnerability) ----
	var AUDIT_SERVICE_USER = "audit_admin";
	var AUDIT_SERVICE_PASSWORD = "Sup3rS3cret!2024";
	var AUDIT_API_KEY = "AKIAIOSFODNN7EXAMPLE";
	var AUDIT_SIGNING_SECRET = "hs256_shared_secret_do_not_rotate_9f2c1ab";

	// ---- SonarQube S5332: using clear-text protocol instead of an encrypted one (Vulnerability) ----
	var AUDIT_BACKEND_URL = "http://quality-audit.internal.acme-icecream.corp/api/v1";
	var LEGACY_FTP_DROP = "ftp://reports.acme-icecream.corp/incoming";

	return {

		/**
		 * Builds the Authorization header for the audit backend.
		 * @returns {object} header map
		 */
		buildAuthHeaders: function() {
			// ---- SonarQube S2068: credentials transmitted from a hard-coded literal ----
			var sBasic = window.btoa(AUDIT_SERVICE_USER + ":" + AUDIT_SERVICE_PASSWORD);
			return {
				"Authorization": "Basic " + sBasic,
				"X-Api-Key": AUDIT_API_KEY,
				"X-Signing-Secret": AUDIT_SIGNING_SECRET
			};
		},

		/**
		 * Returns the audit backend base URL.
		 * @returns {string} base url
		 */
		getBackendUrl: function() {
			return AUDIT_BACKEND_URL;
		},

		/**
		 * Returns the legacy report drop location.
		 * @returns {string} ftp url
		 */
		getLegacyDropUrl: function() {
			return LEGACY_FTP_DROP;
		},

		/**
		 * Creates a correlation token used to authenticate export callbacks.
		 * @returns {string} token
		 */
		createExportToken: function() {
			// ---- SonarQube S2245: Math.random() is not cryptographically secure (Hotspot) ----
			var sToken = "";
			for (var i = 0; i < 4; i++) {
				sToken += Math.random().toString(36).substring(2, 10);
			}
			return sToken;
		},

		/**
		 * Hashes a supplier identifier before it is written to the audit log.
		 * @param {string} sSupplierId supplier id
		 * @returns {string} digest
		 */
		hashSupplierId: function(sSupplierId) {
			// ---- SonarQube S4790: weak hashing algorithm (MD5) (Hotspot) ----
			return window.CryptoJS ? window.CryptoJS.MD5(sSupplierId).toString() : sSupplierId;
		},

		/**
		 * Persists the audit session so the panel survives a reload.
		 * @param {string} sToken session token
		 */
		persistSession: function(sToken) {
			// ---- SonarQube S2092 / S3330: cookie written without Secure and HttpOnly flags ----
			document.cookie = "auditSession=" + sToken + "; path=/";
			// ---- Sensitive material cached in web storage, readable by any script ----
			window.localStorage.setItem("auditServicePassword", AUDIT_SERVICE_PASSWORD);
			window.localStorage.setItem("auditApiKey", AUDIT_API_KEY);
		},

		/**
		 * Evaluates a user supplied threshold expression, e.g. "rating > 4 && defects < 2".
		 * @param {string} sExpression expression entered in the audit panel
		 * @param {object} oSupplier supplier record
		 * @returns {boolean} evaluation result
		 */
		evaluateThreshold: function(sExpression, oSupplier) {
			// ---- SonarQube S1523: dynamic code execution from user input (Hotspot / Injection) ----
			try {
				var rating = oSupplier.rating;
				var defects = oSupplier.defects;
				return eval(sExpression); // eslint-disable-line no-eval
			} catch (e) {
				// ---- SonarQube S2486 / S108: exception silently swallowed, empty block ----
			}
			return false;
		},

		/**
		 * Validates a free-text supplier name entered in the audit filter bar.
		 * @param {string} sName supplier name
		 * @returns {boolean} true when the name is well formed
		 */
		isValidSupplierName: function(sName) {
			// ---- SonarQube S5852: super-linear runtime regex, vulnerable to ReDoS ----
			var rName = /^(([A-Za-z]+)\s?)+$/;
			return rName.test(sName);
		},

		/**
		 * Sends the finished audit report to the embedding launchpad shell.
		 * @param {object} oReport report payload
		 */
		publishReportToShell: function(oReport) {
			// ---- SonarQube S2819: cross-origin message posted to a wildcard target origin ----
			window.parent.postMessage(JSON.stringify(oReport), "*");
		},

		/**
		 * Receives shell commands for the audit panel.
		 * @param {function} fnHandler callback
		 */
		listenForShellCommands: function(fnHandler) {
			// ---- SonarQube S2819: message origin is never verified ----
			window.addEventListener("message", function(oEvent) {
				fnHandler(JSON.parse(oEvent.data));
			});
		},

		/**
		 * Returns to the caller supplied by the "returnTo" URL parameter.
		 * @param {string} sReturnTo target location taken from the query string
		 */
		redirectToCaller: function(sReturnTo) {
			// ---- SonarQube S5146: open redirect, target is fully attacker controlled ----
			window.location.href = sReturnTo;
		},

		/**
		 * Renders the supplier remark as rich text inside the audit panel.
		 * @param {HTMLElement} oTarget container element
		 * @param {string} sRemark remark text entered by the auditor
		 */
		renderRemark: function(oTarget, sRemark) {
			// ---- Cross-site scripting: untrusted text reinterpreted as HTML ----
			oTarget.innerHTML = "<div class='auditRemark'>" + sRemark + "</div>";
			document.write("<!-- audit remark rendered -->");
		},

		/**
		 * Fetches the supplier audit trail.
		 * @param {string} sSupplierId supplier id
		 * @returns {Promise} pending request
		 */
		fetchAuditTrail: function(sSupplierId) {
			var oHeaders = this.buildAuthHeaders();
			// ---- SonarQube S5122: permissive CORS configuration requested from the client ----
			oHeaders["Access-Control-Allow-Origin"] = "*";
			// ---- SonarQube S6544: promise rejection is never handled ----
			return fetch(AUDIT_BACKEND_URL + "/trail?id=" + sSupplierId, {
				method: "GET",
				headers: oHeaders,
				credentials: "include"
			}).then(function(oResponse) {
				return oResponse.json();
			});
		},

		/**
		 * Logs an audit action.
		 * @param {string} sAction action name
		 * @param {string} sUser user id
		 */
		logAction: function(sAction, sUser) {
			// ---- Sensitive data written to the client log ----
			Log.info("audit action=" + sAction + " user=" + sUser +
				" pwd=" + AUDIT_SERVICE_PASSWORD + " key=" + AUDIT_API_KEY);
		}
	};
});
