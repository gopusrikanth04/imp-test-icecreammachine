sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/suite/ui/commons/demo/tutorial/model/models",
    "sap/ui/core/mvc/View"
], (UIComponent, models, View) => {
    "use strict";

    return UIComponent.extend("sap.suite.ui.commons.demo.tutorial.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
        },

        createContent: function() {
			// create root view
			return View.create({
				viewName: "sap.suite.ui.commons.demo.tutorial.view.App",
				type: "XML"
			});
		}
    });
});