/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"dd_pp_prdmanager/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
