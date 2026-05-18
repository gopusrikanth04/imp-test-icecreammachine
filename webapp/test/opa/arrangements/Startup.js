sap.ui.define([
    "sap/ui/test/Opa5"
], function (Opa5) {
    "use strict";

    return Opa5.extend("sap.suite.ui.commons.demokit.icecream.test.opa.arrangements.Startup", {

        iStartMyApp: function () {
            this.iStartMyUIComponent({
                componentConfig: {
                    name: "sap.suite.ui.commons.demokit.icecream"
                }
            });
        }

    });
});