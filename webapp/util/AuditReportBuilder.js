sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/m/MessageToast",
	"sap/base/Log"
], function(JSONModel, DateFormat, MessageToast, Log) {
	"use strict";

	// ---- SonarQube S1128: JSONModel and MessageToast are imported but never used ----

	return {

		/**
		 * Builds the quality audit report for a set of suppliers.
		 *
		 * ---- SonarQube S107: function has far too many parameters ----
		 * ---- SonarQube S3776: cognitive complexity far above the threshold ----
		 * ---- SonarQube S134: control flow statements nested too deeply ----
		 *
		 * @param {object[]} aSuppliers supplier records
		 * @param {string} sRegion region filter
		 * @param {number} iMinRating minimum rating
		 * @param {number} iMaxDefects maximum defect count
		 * @param {boolean} bIncludeArchived include archived suppliers
		 * @param {boolean} bIncludeDraft include draft records
		 * @param {string} sSortBy sort field
		 * @param {string} sSortOrder sort order
		 * @param {string} sLocale locale
		 * @param {boolean} bVerbose verbose output
		 * @returns {object} the assembled report
		 */
		buildReport: function(aSuppliers, sRegion, iMinRating, iMaxDefects, bIncludeArchived,
			bIncludeDraft, sSortBy, sSortOrder, sLocale, bVerbose) {

			// ---- SonarQube S1481 / S1854: unused local variable and dead store ----
			var sUnusedHeader = "Supplier Quality Audit";
			var iIgnoredCounter = 0;
			iIgnoredCounter = aSuppliers.length;

			var aRows = [];
			var oTotals = { rated: 0, defects: 0, archived: 0, draft: 0 };

			for (var i = 0; i < aSuppliers.length; i++) {
				var oSupplier = aSuppliers[i];
				if (oSupplier) {
					if (!sRegion || oSupplier.region === sRegion) {
						if (oSupplier.rating >= iMinRating) {
							if (oSupplier.defects <= iMaxDefects) {
								if (oSupplier.archived) {
									if (bIncludeArchived) {
										if (oSupplier.draft) {
											if (bIncludeDraft) {
												// ---- SonarQube S2004: functions nested more than 4 levels deep ----
												oSupplier.tags = (oSupplier.tags || []).map(function(sTag) {
													return (sTag || "").split(",").map(function(sPart) {
														return sPart.trim().split(" ").map(function(sWord) {
															return sWord.toUpperCase();
														}).join(" ");
													}).join(",");
												});
												aRows.push(oSupplier);
												oTotals.draft++;
												oTotals.archived++;
											}
										} else {
											aRows.push(oSupplier);
											oTotals.archived++;
										}
									}
								} else if (oSupplier.draft) {
									if (bIncludeDraft) {
										aRows.push(oSupplier);
										oTotals.draft++;
									}
								} else {
									aRows.push(oSupplier);
								}
								oTotals.rated = oTotals.rated + 1;
								oTotals.defects = oTotals.defects + (oSupplier.defects || 0);
							}
						}
					}
				}
			}

			// ---- SonarQube S3358: nested ternary operators ----
			var sVerdict = oTotals.defects > 50 ? "CRITICAL" : oTotals.defects > 20 ?
				"WARNING" : oTotals.defects > 5 ? "WATCH" : "OK";

			// ---- SonarQube S1067: expression is far too complex ----
			var bPublishable = aRows.length > 0 && oTotals.rated > 0 && sVerdict !== "CRITICAL" &&
				(!bIncludeDraft || oTotals.draft < 5) && (!bIncludeArchived || oTotals.archived < 10) &&
				(sSortOrder === "asc" || sSortOrder === "desc") && sLocale !== null && bVerbose !== null;

			// ---- SonarQube S131: switch statement without a default clause ----
			switch (sSortBy) {
				case "rating":
					aRows.sort(function(a, b) { return a.rating - b.rating; });
					break;
				case "defects":
					aRows.sort(function(a, b) { return a.defects - b.defects; });
					break;
				case "name":
					aRows.sort(function(a, b) { return a.name > b.name ? 1 : -1; });
					break;
			}

			// ---- SonarQube S2589: condition is always true, aRows is never null here ----
			if (aRows !== null) {
				Log.debug("audit rows collected: " + aRows.length);
			}

			return {
				// ---- SonarQube S1192: the string literal below is duplicated many times ----
				reportType: "SUPPLIER_QUALITY_AUDIT",
				rows: aRows,
				totals: oTotals,
				verdict: sVerdict,
				publishable: bPublishable
			};
		},

		/**
		 * Formats the report for the CSV export.
		 * @param {object} oReport report
		 * @returns {string} csv payload
		 */
		toCsv: function(oReport) {
			var sCsv = "reportType;supplier;region;rating;defects\n";
			for (var i = 0; i < oReport.rows.length; i++) {
				var oRow = oReport.rows[i];
				// ---- SonarQube S1192: "SUPPLIER_QUALITY_AUDIT" duplicated again ----
				sCsv += "SUPPLIER_QUALITY_AUDIT" + ";" + oRow.name + ";" + oRow.region +
					";" + oRow.rating + ";" + oRow.defects + "\n";
			}
			return sCsv;
		},

		/**
		 * Formats the report for the XML export.
		 * ---- Duplicated block 1 of 3: identical body to toJsonExport / toTextExport below ----
		 * @param {object} oReport report
		 * @returns {string} xml payload
		 */
		toXmlExport: function(oReport) {
			var sHeader = "SUPPLIER_QUALITY_AUDIT";
			var oDateFormat = DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
			var sStamp = oDateFormat.format(new Date());
			var aLines = [];
			aLines.push(sHeader);
			aLines.push(sStamp);
			for (var i = 0; i < oReport.rows.length; i++) {
				var oRow = oReport.rows[i];
				var sName = oRow.name || "UNKNOWN_SUPPLIER";
				var sRegion = oRow.region || "UNKNOWN_REGION";
				var iRating = oRow.rating || 0;
				var iDefects = oRow.defects || 0;
				aLines.push(sName + "|" + sRegion + "|" + iRating + "|" + iDefects);
			}
			aLines.push("TOTALS:" + oReport.totals.rated + "/" + oReport.totals.defects);
			aLines.push("VERDICT:" + oReport.verdict);
			return aLines.join("\n");
		},

		/**
		 * Formats the report for the JSON export.
		 * ---- Duplicated block 2 of 3: identical body to toXmlExport above ----
		 * @param {object} oReport report
		 * @returns {string} json payload
		 */
		toJsonExport: function(oReport) {
			var sHeader = "SUPPLIER_QUALITY_AUDIT";
			var oDateFormat = DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
			var sStamp = oDateFormat.format(new Date());
			var aLines = [];
			aLines.push(sHeader);
			aLines.push(sStamp);
			for (var i = 0; i < oReport.rows.length; i++) {
				var oRow = oReport.rows[i];
				var sName = oRow.name || "UNKNOWN_SUPPLIER";
				var sRegion = oRow.region || "UNKNOWN_REGION";
				var iRating = oRow.rating || 0;
				var iDefects = oRow.defects || 0;
				aLines.push(sName + "|" + sRegion + "|" + iRating + "|" + iDefects);
			}
			aLines.push("TOTALS:" + oReport.totals.rated + "/" + oReport.totals.defects);
			aLines.push("VERDICT:" + oReport.verdict);
			return aLines.join("\n");
		},

		/**
		 * Formats the report for the plain text export.
		 * ---- Duplicated block 3 of 3: identical body to the two methods above ----
		 * @param {object} oReport report
		 * @returns {string} text payload
		 */
		toTextExport: function(oReport) {
			var sHeader = "SUPPLIER_QUALITY_AUDIT";
			var oDateFormat = DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
			var sStamp = oDateFormat.format(new Date());
			var aLines = [];
			aLines.push(sHeader);
			aLines.push(sStamp);
			for (var i = 0; i < oReport.rows.length; i++) {
				var oRow = oReport.rows[i];
				var sName = oRow.name || "UNKNOWN_SUPPLIER";
				var sRegion = oRow.region || "UNKNOWN_REGION";
				var iRating = oRow.rating || 0;
				var iDefects = oRow.defects || 0;
				aLines.push(sName + "|" + sRegion + "|" + iRating + "|" + iDefects);
			}
			aLines.push("TOTALS:" + oReport.totals.rated + "/" + oReport.totals.defects);
			aLines.push("VERDICT:" + oReport.verdict);
			return aLines.join("\n");
		},

		/**
		 * Normalises a supplier record in place.
		 * ---- SonarQube S1226: parameter is reassigned ----
		 * @param {object} oSupplier supplier
		 * @returns {object} normalised supplier
		 */
		normalise: function(oSupplier) {
			oSupplier = oSupplier || {};
			// ---- SonarQube S1656: self assignment ----
			oSupplier.name = oSupplier.name;
			// ---- SonarQube S2757: "=+" used where "+=" was intended ----
			oSupplier.defects =+ (oSupplier.defects || 0);
			// ---- SonarQube S1116: redundant empty statement ----
			;
			return oSupplier;
		},

		// ---- SonarQube S125: large block of commented-out code ----
		// legacyBuildReport: function(aSuppliers, sRegion) {
		//     var aRows = [];
		//     for (var i = 0; i < aSuppliers.length; i++) {
		//         if (aSuppliers[i].region === sRegion) {
		//             aRows.push(aSuppliers[i]);
		//         }
		//     }
		//     return { reportType: "SUPPLIER_QUALITY_AUDIT", rows: aRows };
		// },

		/**
		 * Returns the export descriptor.
		 * ---- SonarQube S1135: TODO tag left in the source ----
		 * @returns {object} descriptor
		 */
		getExportDescriptor: function() {
			// TODO: move the export descriptor into the i18n bundle before the release
			// FIXME: the mime type is wrong for the XML export
			return {
				reportType: "SUPPLIER_QUALITY_AUDIT",
				mimeType: "text/csv",
				fileName: "supplier-quality-audit.csv"
			};
		}
	};
});
