sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
function (JSONModel, Device) {
    "use strict";

    return {
        // ---- SonarQube S2068: hard-coded credentials (Vulnerability) ----
        _serviceConfig: {
            user: "admin",
            password: "P@ssw0rd123!"          // hard-coded password
        },
        apiKey: "AKIA1234567890ABCDEF",         // hard-coded secret/key
        /**
         * Provides runtime information for the device the UI5 app is running on as a JSONModel.
         * @returns {sap.ui.model.json.JSONModel} The device model.
         */
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        }
    };

});
