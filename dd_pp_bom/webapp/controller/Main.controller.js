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
          var oAddbom = new JSONModel({
            head : [],
            list : []
          });
          this.getView().setModel(oModel, "head");
          this.getView().setModel(oAddbom,"addTable")
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
        },

        //생성 팝업 콤보 박스 필터 바인딩
        onCreateDialog: function(oEvent){
          let afilter = [];
          let cHeadgdname = this.byId("idCreateGdname"),
              cHeadgdcode = this.byId("idCreateGdcode");

          let cItemgdname = this.byId("idCreateitemGdname"),
              cItemgdcode = this.byId("idCreateitemGdcode");

          var bomHeadFilter = new Filter('Mtcode', 'EQ', 'P'),
              bomitemFilter = new Filter('Mtcode', 'NE', 'P');
          
          debugger;
          // 콤보 박스 필터 바인딩
          cHeadgdname.getBinding("items").filter([bomHeadFilter]);
          cHeadgdcode.getBinding("items").filter([bomHeadFilter]);
          cItemgdname.getBinding("items").filter([bomitemFilter]);
          cItemgdcode.getBinding("items").filter([bomitemFilter]);

          this.getView().byId("createDialog").open();
        },

        // 생성 팝업 콤보박스 필터 적용
        onSelectionChange: function(oEvent){
          let id = oEvent.getParameters().id.slice(-18);

          switch(id){
            // 헤더 품목코드 콤보박스
            case 'in--idCreateGdcode':
              var gdname = oEvent.getParameters().selectedItem.mProperties.additionalText;
              // 헤더 품목명 자동생성
              this.byId("idCreateGdname").setValue(gdname);
              break;
            
            // 헤더 품목명 콤보박스
            case 'in--idCreateGdname':
              var gdcode = oEvent.getParameters().selectedItem.mProperties.additionalText;
              // 헤더 품목명 자동생성
              this.byId("idCreateitemGdcode").setValue(gdcode);
              break;

            // 아이템 품목명 콤보박스
            case 'idCreateitemGdcode':
              var gdcode = oEvent.getParameters().selectedItem.mProperties.additionalText;
              // 아이템 품목명 자동생성
              this.byId("idCreateitemGdname").setValue(gdcode);
              break;

            // 아이템 품목명 콤보박스
            case 'idCreateitemGdname':
              var gdcode = oEvent.getParameters().selectedItem.mProperties.additionalText;
              // 아이템 품목명 자동생성
              this.byId("idCreateitemGdcode").setValue(gdcode);
              break;
          }
        },

        onClose: function(oEvent){
          oEvent.getSource().getParent().getParent().close(); 

        },
        onCreate: function(oEvent){

        },

        onItemadd: function(oEvent){
          debugger;
          let iditemgdcode = this.byId("idCreateitemGdcode").getValue(),
              idheadgdcode = this.byId("idCreateGdcode").getValue(),
              itemobj = this.getView().getModel().getObject(`/MtmasterSet('${iditemgdcode}')`),
              headobj = this.getView().getModel().getObject(`/MtmasterSet('${idheadgdcode}')`),
              oDatahead = this.getView().getModel("addTable").getProperty("/head"),
              oDatalist = this.getView().getModel("addTable").getProperty("/list");


          let Bomid = "", Gdcode_m = itemobj.Gdcode, Gdname_m = itemobj.Gdname, Mtcode_m = itemobj.Mtcode, Unit = "EA",
              Quan = this.byId("idCreateitemQuan").getValue();

          // let today = new Date();
          // let Gdcode = headobj.Gdcode, Gdname = headobj.Gdname, Mtcode = 'P', Delflag = "", Crnam = "SNG-19", Erdat = today, Chdat = today;

          // if(!oDatahead){
          //   oDatahead.push({Bomid, Gdcode, Gdname, Mtcode, Delflag, Crnam, Erdat})
          // }
          
              oDatalist.push({Bomid, Gdcode_m, Gdname_m, Mtcode_m, Quan, Unit});

          this.getView().getModel("addTable").setProperty("/list", oDatalist);


        },
  
      });
    }
  );
  