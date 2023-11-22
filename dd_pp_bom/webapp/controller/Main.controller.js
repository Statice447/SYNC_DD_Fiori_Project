sap.ui.define(
    [
      "sap/ui/core/mvc/Controller",
      "sap/f/LayoutType",
      "sap/ui/model/json/JSONModel",
      'sap/ui/model/Filter',
      "sap/ui/core/format/DateFormat"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, LayoutType, JSONModel, Filter, DateFormat) {
      "use strict";
  
      return Controller.extend("fiorippbom.controller.Main", {
        onInit: function () {
          this.oRouter = this.getOwnerComponent().getRouter();
          this.oView = this.getView();

          var oModel = new JSONModel();
          this.getView().setModel(oModel, "head");
          this.oRouter.getRoute("Main").attachPatternMatched(this._onPatternMatched, this);
        },

        _onPatternMatched: function() {
          this.getView().getModel().refresh(true);
        },
        
        formatter: {
            fnDateToString: function (value) {
                if (value) {
                    var oFormat = DateFormat.getDateInstance({pattern: 'yyyy-MM-dd'});
                    return oFormat.format(value);

                }
            }
        },
  
        onSearch: function () {
          // let oData = this.getView().getModel("head").getData();
          let oinput = this.byId("BOMidID").getValue();
          let ocombo = this.byId("comboid").getValue();

          // var oModel = this.getView().getModel("main");

          //       this.getView().getModel().read(`/BOM_HSet`, {
          //           success : function(oReturn){
          //               oModel.setProperty("/", oReturn);        
          //           }
          //       });
  
        //   debugger;
          let afilter = [];
          if (oinput) {
              let oFilter =  new Filter('Bomid', 'Contains', oinput)
              afilter.push(oFilter);
          };
  
          if (ocombo) {
            let oFilter =  new Filter('Gdname', 'Contains', ocombo)
            afilter.push(oFilter);
          };
          // 데이터 바인딩된 정보 경로를 지정(items, rows 등) 테이블 객체를 가져와서, 바인딩 정보를 가져온 후, 필터 적용
          this.getView().byId("idbomTable").getBinding("items").filter(afilter);
      },
  
        /**
         * 아이템 클릭 시 미드컬럼 페이지 확장
         */
        onListItemPress: function (oEvent) {
          var sPath = oEvent.getSource().getBindingContextPath();
          var oData = this.getView().getModel().getObject(sPath);
          var oNextUIState = this.getOwnerComponent()
            .getHelper()
            .getNextUIState(1);

          this.oView.getParent().getParent().setLayout(LayoutType.TwoColumnsMidExpanded);
          
          this.oRouter.navTo("Detail", {
            layout: oNextUIState.layout,
            BOMid: oData.Bomid,
            GDNAME : oData.Gdname,
            DELFLAG : oData.Delflag
          });
        },
  
        onGoNewPage: function () {
          this.oView.getParent().getParent().setLayout("MidColumnFullScreen");
          this.oRouter.navTo("NewPage", {
            layout: "MidColumnFullScreen",
            product: this._product
          });
        }
  
      });
    }
  );
  