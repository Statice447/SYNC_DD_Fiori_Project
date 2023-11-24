sap.ui.define(
    [
      "sap/ui/core/mvc/Controller",
      "sap/f/LayoutType",
      "sap/ui/model/json/JSONModel",
      'sap/ui/model/Filter',
      "sap/ui/core/format/DateFormat",
      "sap/m/MessageToast"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, LayoutType, JSONModel, Filter, DateFormat, MessageToast) {
      "use strict";
  
      return Controller.extend("fiorippbom.controller.Main", {
        onInit: function () {
          this.oRouter = this.getOwnerComponent().getRouter();
          this.oView = this.getView();

          var oModel = new JSONModel();
          var oAddbom = new JSONModel({
            'Bomid' : '',
            'Gdcode' : '',
            'Gdname' : '',
            'Mtcode' : '',
            'Delflag' : '',
            'Crnam' : '',
            'Erdat' : '',
            'Ertim' : '',
            'Chnam' : '',
            'Chdat' : '',
            'Chtim' : '',
            Headertoitem : []
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
          let cHeadgdname = this.byId("idheadGdname"),
              cHeadgdcode = this.byId("idheadGdcode");

          let cItemgdname = this.byId("iditemGdname"),
              cItemgdcode = this.byId("iditemGdcode");

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
          let id = oEvent.getParameters().id.slice(-12);

          switch(id){
            // 헤더 품목코드 콤보박스
            case 'idheadGdcode':
              var gdname = oEvent.getParameters().selectedItem.mProperties.additionalText;
              // 헤더 품목명 자동생성
              this.byId("idheadGdname").setValue(gdname);
              break;
            
            // // 헤더 품목명 콤보박스
            // case 'idheadGdname':
            //   var gdcode = oEvent.getParameters().selectedItem.mProperties.additionalText;
            //   // 헤더 품목명 자동생성
            //   this.byId("idheadGdcode").setValue(gdcode);
            //   break;

            // 아이템 품목명 콤보박스
            case 'iditemGdcode':
              var gdcode = oEvent.getParameters().selectedItem.mProperties.additionalText;
              // 아이템 품목명 자동생성
              this.byId("iditemGdname").setValue(gdcode);
              break;

            // // 아이템 품목명 콤보박스
            // case 'iditemGdname':
            //   var gdcode = oEvent.getParameters().selectedItem.mProperties.additionalText;
            //   // 아이템 품목명 자동생성
            //   this.byId("iditemGdcode").setValue(gdcode);
            //   break;
          }
        },

        onClose: function(oEvent){
          oEvent.getSource().getParent().getParent().close(); 

        },
        onCreate: function(oEvent){
          let oMainModel = this.getView().getModel("addTable");
          let oData = oMainModel.getData();
              // view에서 바인딩 된 input 값들이 들어온다.
              /*
                  들어갈 변수 지정
                  {
                      Memid : '입력 값',
                      Memnm : '입력 값',
                      Telno : '입력 값',
                      Email : '입력 값',
                  }
              */
                  debugger;
              this.getView().getModel().create("/BOM_HSet", oData, {
                
                  success : function(oReturn){
                    debugger;
                    
                      MessageToast.show("데이터 생성 완료");

                  },
                  error : function(oError){
                    debugger;
                    MessageToast.show(oError);
                      console.log(oError)

                  }

              });

        },
        onDecline: function(oEvent){
          debugger;
          let getid = oEvent.getSource().getId()
          let index = getid.substr(getid.length -1);
          let oModel = this.getView().getModel("addTable").getProperty("/Headertoitem");

          oModel.splice(index, 1);

          this.getView().getModel("addTable").refresh(true);
        },

        onItemadd: function(oEvent){
          let iditemgdcode = this.byId("iditemGdcode").getValue(),
              idheadgdcode = this.byId("idheadGdcode").getValue(),
              itemobj = this.getView().getModel().getObject(`/MtmasterSet('${iditemgdcode}')`),
              headobj = this.getView().getModel().getObject(`/MtmasterSet('${idheadgdcode}')`),
              oDatahead = this.getView().getModel("addTable").getProperty("/"),
              oDatalist = this.getView().getModel("addTable").getProperty("/Headertoitem");


          let Bomid = "", GdcodeM = itemobj.Gdcode, GdnameM = itemobj.Gdname, MtcodeM = itemobj.Mtcode, Unit = "EA",
              Quan = this.byId("iditemQuan").getValue();

          let today = new Date();
          let Gdcode = headobj.Gdcode, Gdname = headobj.Gdname, Mtcode = 'P', Delflag = "", Crnam = "SNG-19", Erdat = today, Chdat = today;

          
            oDatahead.Gdcode = Gdcode;
            oDatahead.Gdname = Gdname;
            oDatahead.Mtcode = Mtcode;
            oDatahead.Crnam = Crnam;
            oDatahead.Erdat = Erdat;
            oDatahead.Chdat = Chdat;
            debugger;
          
          
          if(oDatalist.length){
            for(let i = 0; i < oDatalist.length; i++){
              if(oDatalist[i].GdcodeM === itemobj.Gdcode){
                MessageToast.show(iditemgdcode + "는 이미 추가되었습니다.", { width: "15rem" });
                break;
              }
              
              if(i == (oDatalist.length)-1 && oDatalist[i].GdcodeM !== itemobj.GdcodeM){
                oDatalist.push({Bomid, GdcodeM, GdnameM, MtcodeM, Quan, Unit});
                break;
              }
            }
          }
          else{
            oDatalist.push({Bomid, GdcodeM, GdnameM, MtcodeM, Quan, Unit});
          }

          this.getView().getModel("addTable").setProperty("/Headertoitem", oDatalist);

        },
  
      });
    }
  );
  