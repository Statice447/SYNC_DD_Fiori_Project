/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"fiori_pp_bom/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
