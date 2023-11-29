sap.ui.define(
    ["sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Filter',
    "sap/ui/core/routing/History",
    "sap/m/MessageToast"
  ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Filter, History, MessageToast) {
      "use strict";
  
      return Controller.extend("fiorippbom.controller.Detail", {
        onInit: function () {
          this.oRouter = this.getOwnerComponent().getRouter();
  
          this.oRouter.getRoute("Detail").attachPatternMatched(this._onPatternMatched, this);
            
          // let oExitButton = this.getView().byId("exitFullScreenBtn"),
          //   oEnterButton = this.getView().byId("enterFullScreenBtn");
  
          // [oExitButton, oEnterButton].forEach(function (oButton) {
          //   oButton.addEventDelegate({
          //     onAfterRendering: function () {
          //       if (this.bFocusFullScreenButton) {
          //         this.bFocusFullScreenButton = false;
          //         oButton.focus();
          //       }
          //     }.bind(this),
          //   });
          // }, this);
        },
  
        /**
         * Route Pattern이 URI와 일치할 경우 실행
         * Title text 세팅
         */
        _onPatternMatched: function (oEvent) {
          
          this.byId("BOMitemTable").removeSelections();
          let oParam = oEvent.getParameters().arguments,
              oFilter = new Filter('Bomid', 'EQ', oParam.BOMid);

          this.byId("headerKey").setText(oParam.BOMid);
          this._product = oParam.BOMid;
  
          this.byId("BOMitemid").setText(oParam.BOMid);
          this.byId("GDNAMEid").setText(oParam.GDNAME);

          switch(oParam.DELFLAG){
            case 'true' :
              this.byId("idflag").setText("가동");
              break;

            case 'false' :
              this.byId("idflag").setText("가동중지");
              break;
          }
          
          this.byId("BOMitemTable").getBinding("items").filter(oFilter);
          this.byId("idflatdata").getBinding("data").filter(oFilter);
  
        },

      onDelflag(oEvent) {
        let btnText = oEvent.getSource().getText(),
            oModel = this.getView().getModel(),
            oBomid = this.byId("BOMitemid").getText(),
            obj = this.getView().getModel().getObject(`/BOM_HSet('${oBomid}')`);

        let idClose =  this.byId("idback");
        // read 함수에서 필터링을 한 후 해당 delflag 업데이트
         switch(btnText){
            case '가동중지' :
              obj.Delflag = true;
              break;

            case '가동' :
              obj.Delflag = false;
              break;
         }
         
         // __metadata 필드는 필요없으므로 해당 필드 삭제
         delete obj.__metadata;
         let today = new Date();

         obj.Chnam = 'SNG-19';
         obj.Chdat = today;
         
         // 업데이트를 위한 해당 키 값 찾기
         let path = oModel.createKey("/BOM_HSet", {
             Bomid : obj.Bomid
         })
         
         oModel.update(path, obj, {
             success : function(oReturn){
              debugger;
                 MessageToast.show(obj.Bomid + " 변경 완료");
                 idClose.fireEvent('press');
             },
             error : function(oError) {
              debugger;
                MessageToast.show("데이터 변경 실패");
                console.log(oError);
                idClose.fireEvent('press');
                // console.log(oError)
             }
         });
      },
  
        /**
         * 닫기 버튼 클릭 시 메인화면으로 이동
         */
        handleClose: function () {
          let oNextUIState = this.getOwnerComponent()
            .getHelper()
            .getNextUIState(0);
            ;
          this.oRouter.navTo("Main", { layout: oNextUIState.layout });
        },
  
        /**
         * 풀스크린 모드 세팅
         */
        handleFullScreen: function () {
          this.bFocusFullScreenButton = true;
          var sNextLayout = "MidColumnFullScreen"; //sap.f.LayoutType
          this.oRouter.navTo("Detail", {
            layout: sNextLayout,
            product: this._product,
          });
        },
  
        /**
         * 풀스크린 모드 종료
         */
        handleExitFullScreen: function () {
          this.bFocusFullScreenButton = true;
          var sNextLayout = "TwoColumnsMidExpanded"; //sap.f.LayoutType
  
          this.oRouter.navTo("Detail", {
            layout: sNextLayout,
            product: this._product,
          });
        }
  
        // onGoDetailDetail: function() {
        //   this.oView.getParent().getParent().setLayout("ThreeColumnsMidExpanded");
        //   this.oRouter.navTo("DetailDetail", {
        //     layout: "ThreeColumnsMidExpanded",
        //     product: this._product,
        //   });
        // }
      });
    }
  );
  