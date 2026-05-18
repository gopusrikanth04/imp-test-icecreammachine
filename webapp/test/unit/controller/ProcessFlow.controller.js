/*global QUnit,sinon*/

sap.ui.define([
	"sap/suite/ui/commons/demo/tutorial/controller/ProcessFlow.controller",
	"sap/m/MessageToast",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function(ProcessFlowController, MessageToast, ResourceBundle) {
	"use strict";

	QUnit.module("ProcessFlow Controller - getValuesDelta formatter", {
		beforeEach: function() {
			this.oController = new ProcessFlowController();
		},
		afterEach: function() {
			this.oController.destroy();
		}
	});

	QUnit.test("should return the delta with measure", function(assert) {
		var sResult = this.oController.getValuesDelta(5, 3, "%");
		assert.equal(sResult, "-2", "Correct string returned");
	});

	QUnit.module("ProcessFlow Controller - onNodePressed event handler", {
		beforeEach: function() {
			function getResourceBundle() {
				return ResourceBundle.create({ url: "../i18n/i18n.properties", async: true });
			}

			this.oController = new ProcessFlowController();
			this.oController.getOwnerComponent = function() {
				return {
					getModel: function() {
						return {
							getResourceBundle: getResourceBundle
						};
					}
				};
			};
			this.oEventMock = {
				getParameters: function() {
					return {
						getTitle: function () {
							return "Title";
						}
					};
				}
			};
		},
		afterEach: function() {
			this.oController.destroy();
		}
	});

	QUnit.test("Node title should be part of the message toast text", function(assert) {
		var oSpy = sinon.spy(MessageToast, "show"),
			done = assert.async();
		this.oController.onNodePressed(this.oEventMock);
		setTimeout(function() {
			assert.ok(oSpy.calledWith("The node \"Title\" is clicked"), "MessageToast shown with correct text");
			oSpy.restore();
			done();
		},500)
	});
});
