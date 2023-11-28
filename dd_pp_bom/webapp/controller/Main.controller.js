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

          var oAddBom = new JSONModel({
              'Gdcode' : '',
              'Gdname' : '',
              'Mtcode' : '',
              BOM_ISet : []
          });

          var oAddbomhead = new JSONModel(
            {
              'Gdcode' : '',
              'Gdname' : '',
              'Mtcode' : ''
            }
          )
          var oAddbomitem = new JSONModel({
            Bomitem : []
          });

          this.getView().setModel(oModel, "head");
          this.getView().setModel(oAddBom,"addbom");

          this.getView().setModel(oAddbomitem,"addbomitem");
          this.getView().setModel(oAddbomhead,"addbomhead");
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
            },

            // fnDelflagToString: function (value) {
            //   if (value) {
            //     var oFormat = '가동 중';
            //     return oFormat.format(value);
            //   }
            //   else{
            //     var oFormat = '가동 중지'
            //     return oFormat.format(value);
            //   }
              
            // }
        },
  
        onSearch: function () {
          // let oData = this.getView().getModel("head").getData();
          // let oinput = this.byId("BOMidID").getValue();
          let oGdname = this.byId("gdnameid").getValue();
          let oStatus = this.byId("statusid").getValue();

          // var oModel = this.getView().getModel("main");

          //       this.getView().getModel().read(`/BOM_HSet`, {
          //           success : function(oReturn){
          //               oModel.setProperty("/", oReturn);        
          //           }
          //       });
  
          //   debugger;
          let afilter = [];
          // if (oinput) {
          //     let oFilter =  new Filter('Bomid', 'Contains', oinput)
          //     afilter.push(oFilter);
          // };

          // 기본으로 가동 중인 것만 조회
          if (!oStatus) {
            var oFilter =  new Filter('Delflag', 'EQ', false)
            afilter.push(oFilter);
          }
          else{
            switch(oStatus){
              case '가동 중':
                var oFilter =  new Filter('Delflag', 'EQ', false)
                afilter.push(oFilter);
                break;
                
              case '가동 중지':
                var oFilter =  new Filter('Delflag', 'EQ', true)
                afilter.push(oFilter);
                break;
            }

            
          };
  
          if (oGdname) {
            let oFilter =  new Filter('Gdname', 'Contains', oGdname)
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
          let oModel = this.getView().getModel("addbom");
          let oData = {
            'Gdcode' : '',
            'Gdname' : '',
            'Mtcode' : '',
            BOM_ISet : []
          };

          // 테이블 리스트 초기화
          oModel.setProperty("/",oData);


          // 콤보 박스 및 인풋 필드 초기화
          this.byId("idheadGdcode").setValue("");
          this.byId("idheadGdname").setValue("");
          this.byId("iditemGdcode").setValue("");
          this.byId("iditemGdname").setValue("");
          this.byId("iditemQuan").setValue("");

          this.byId("idheadGdcode").setEditable(true);

          oEvent.getSource().getParent().getParent().close(); 

        },
        onCreate: function(oEvent){
          // var oHeadModel = this.getView().getModel("addbomhead"),
          //     oItemModel = this.getView().getModel("addbomitem");

          // var oHeadData = oHeadModel.getData(),
          //     oItemData = oItemModel.getProperty("/Bomitem");
          var oView = this.getView(),
              oModel = oView.getModel(),
              oBomModel = oView.getModel("addbom"),
              oBomData = oBomModel.getData();

          // var oBomData = {
          //     "Gdcode" : "P099",
          //     "Gdname" : "테스트용",
          //     "Mtcode" : "P",
          //     'BOM_ISet' : [
          //       {
          //         "GdcodeM" : "A099",
          //         "GdnameM" : "테스트용",
          //         "MtcodeM" : "A",
          //       }
          //     ]
          // }

          debugger;
          
          oModel.create("/BOM_HSet", oBomData, {
            success : function(oReturn){
              debugger;
              oView.byId("idaddbomcan").fireEvent('press');
              MessageToast.show("데이터 생성 완료");
            },

            error : function(oError){
              debugger;
              oView.byId("idaddbomcan").fireEvent('press');
              console.log(oError)
            }
        });

        ////////////////// 두개 모델 따로해서 넣기
        //   this.getView().getModel().create("/BOM_HSet", oHeadModel.getData(), {
        //     success : function(oReturn){
        //       debugger;
        //       MessageToast.show("데이터 생성 완료");
        //     },

        //     error : function(oError){
        //       debugger;
        //       MessageToast.show(oError);
        //       console.log(oError)

        //     }

        // });
  
          // for(let i = 0; i < oItemModel.getProperty("/Bomitem").length; i++)
          // {
          //   this.getView().getModel().create("/BOM_ISet", oItemModel.getProperty("/Bomitem")[i], {
          //       success : function(oReturn){
          //         debugger;
          //         MessageToast.show("데이터 생성 완료");
          //       },

          //       error : function(oError){
          //         debugger;
          //         MessageToast.show(oError);
          //         console.log(oError)

          //       }

          //   });
          // }
          

        },
        onDecline: function(oEvent){
          let getid = oEvent.getSource().getId()
          let index = getid.substr(getid.length -1);
          let oData = this.getView().getModel("addbom").getProperty("/BOM_ISet");

          oData.splice(index, 1);

          this.getView().getModel("addbom").refresh(true);

          if(oData.length == 0){
            this.byId("idtabletitle").setText("추가된 리스트");
            this.byId("idheadGdcode").setEditable(true);
          }
        },

        onItemadd: function(oEvent){
          ////////////// 모델 따로해서 하는 방법 진행중
          // let iditemgdcode = this.byId("iditemGdcode").getValue(),
          //     idheadgdcode = this.byId("idheadGdcode").getValue(),
          //     itemobj = this.getView().getModel().getObject(`/MtmasterSet('${iditemgdcode}')`),
          //     headobj = this.getView().getModel().getObject(`/MtmasterSet('${idheadgdcode}')`),
          //     oDatahead = this.getView().getModel("addbomhead").getProperty("/"),
          //     oDataitem = this.getView().getModel("addbomitem").getProperty("/Bomitem");


          // let Bomid = "", GdcodeM = itemobj.Gdcode, GdnameM = itemobj.Gdname, MtcodeM = itemobj.Mtcode, Unit = "EA",
          //     Quan = this.byId("iditemQuan").getValue();

          // let Gdcode = headobj.Gdcode, Gdname = headobj.Gdname, Mtcode = 'P';

          
          //   oDatahead.Gdcode = Gdcode;
          //   oDatahead.Gdname = Gdname;
          //   oDatahead.Mtcode = Mtcode;
          //   debugger;
          
          // if(oDataitem.length > 0){
          //   this.byId("idtabletitle").setText(oDatahead.Gdcode + "의 BOM 리스트");
          // }
          // else{
          //   this.byId("idtabletitle").setText("추가된 리스트");
          // }

          // if(oDataitem.length){
          //   for(let i = 0; i < oDataitem.length; i++){
          //     if(oDataitem[i].GdcodeM === itemobj.Gdcode){
          //       MessageToast.show(iditemgdcode + "는 이미 추가되었습니다.", { width: "15rem" });
          //       break;
          //     }
              
          //     if(i == (oDataitem.length)-1 && oDataitem[i].GdcodeM !== itemobj.GdcodeM){
          //       oDataitem.push({Bomid, GdcodeM, GdnameM, MtcodeM, Quan, Unit});
          //       break;
          //     }
          //   }
          // }
          // else{
          //   this.byId("idtabletitle").setText(oDatahead.Gdcode + "의 BOM 리스트");
          //   oDataitem.push({Bomid, GdcodeM, GdnameM, MtcodeM, Quan, Unit});
          // }

          // this.getView().getModel("addbomitem").setProperty("/Bomitem", oDataitem);
          ///////////////////////////////////////////////////////////////////////////////////////////////

          let iditemgdcode = this.byId("iditemGdcode").getValue(),
              idheadgdcode = this.byId("idheadGdcode").getValue(),
              itemobj = this.getView().getModel().getObject(`/MtmasterSet('${iditemgdcode}')`),
              headobj = this.getView().getModel().getObject(`/MtmasterSet('${idheadgdcode}')`),
              oDatahead = this.getView().getModel("addbom").getProperty("/"),
              oDataitem = this.getView().getModel("addbom").getProperty("/BOM_ISet"),
              Quan = this.byId("iditemQuan").getValue();


          if(idheadgdcode == ""){
            MessageToast.show("완제품 품목코드를 선택해 주세요");
          }
          else if(iditemgdcode == ""){
            MessageToast.show("원자재 또는 부자재 품목코드를 선택해 주세요");
          }
          else if(Quan == ""){
            MessageToast.show("수량을 입력해 주세요");

          }
          else{
            // 헤더 변수 선언
            let Gdcode = headobj.Gdcode, Gdname = headobj.Gdname, Mtcode = 'P';

            // 아이템 변수 선언
            let Bomid = "", GdcodeM = itemobj.Gdcode, GdnameM = itemobj.Gdname, MtcodeM = itemobj.Mtcode, Unit = "EA";
            
            // 헤더 정보 입력
            oDatahead.Gdcode = Gdcode;
            oDatahead.Gdname = Gdname;
            oDatahead.Mtcode = Mtcode;
          
            // 테이블 타이틀 체크
            if(oDataitem.length > 0){
              this.byId("idtabletitle").setText(oDatahead.Gdcode + "의 BOM 리스트");
            }
            else{
              this.byId("idtabletitle").setText("추가된 리스트");
            }

            // 중복 품목 검사
            if(oDataitem.length){
              for(let i = 0; i < oDataitem.length; i++){
                if(oDataitem[i].GdcodeM === itemobj.Gdcode){
                  MessageToast.show(iditemgdcode + "는 이미 추가되었습니다.", { width: "15rem" });
                  break;
                }
                
                if(i == (oDataitem.length)-1 && oDataitem[i].GdcodeM !== itemobj.GdcodeM){
                  oDataitem.push({Bomid, GdcodeM, GdnameM, MtcodeM, Quan, Unit});
                  break;
                }
              }
            }
            else{
              this.byId("idtabletitle").setText(oDatahead.Gdcode + "의 BOM 리스트");
              oDataitem.push({Bomid, GdcodeM, GdnameM, MtcodeM, Quan, Unit});
              this.byId("idheadGdcode").setEditable(false);

            }

            // 테이블 세트
            this.getView().getModel("addbom").setProperty("/BOM_ISet", oDataitem);
          }

        }
      
      });
    
    }
  );
  