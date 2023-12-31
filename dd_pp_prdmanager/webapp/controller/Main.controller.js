sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/core/format/DateFormat",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Filter, DateFormat, MessageToast, MessageBox, Fragment) {
        "use strict";
        var goPath;

        // 차트 즉시 업데이트를 위한 클로저 변수
        var goIndex, goData;

        return Controller.extend("ddppprdmanager.controller.Main", {
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                var oModel = new JSONModel();
                // oModel.loadData("../model/tree.json");
                oModel.loadData(`${_rootpath}/model/tree.json`);

                this.getView().setModel(oModel, 'tree');
                var oData = new JSONModel({
                    Prdmanage : [],
                    Chart : [],
                    Count : []
                });

                var oModelData = this.getView().setModel(oData, "main");

                this.oRouter.getRoute("RouteMain").attachPatternMatched(this._onPatternMatched, this);
                
            },

            _onPatternMatched: function() {
                this.getView().getModel("main").refresh(true);
            },

            onSelectChange(oEvent) {
                debugger;
                let index = oEvent.getParameters().rowIndex;

                if(index == -1){
                    this.onCollapseAll();
                }
                else{
                    let sPath = this.byId("TreeTableBasic").getContextByIndex(index).sPath,
                        oData = this.getView().getModel("tree").getProperty(sPath);

                // 차트 즉시 업데이트를 위한 현재 선택한 데이터 경로 클로저 변수에 저장
                    goIndex = index;
                    goData = oData;
                
                // 차트 생성 함수, 즉시 업데이트를 위한 클로저 변수 2개 사용
                    this.setVizframe(oData, index);

                }
            },

            // 포매터 함수들
            formatter: {
                fnDateToString: function (value) {
                    if (value) {
                        var oFormat = DateFormat.getDateInstance({pattern: 'yyyy-MM-dd'});
                        return oFormat.format(value);
    
                    }
                },

                fnStatustoIcon: function (value) {
                    if (value) {
                        switch(value){
                            case "2" :
                                return "sap-icon://commission-check";
                            case "3" :
                                return "sap-icon://complete";
                        }
                    }
                    else
                        return "sap-icon://product"; ;
                },

                fnIconColor: function (value) {
                    if (value) {
                        switch(value){
                            case "2" :
                                return "#FFBB00";
                            case "3" :
                                return "#1DDB16";
                        }
                    }
                    else
                        return "#000000";
                }
            },

            onFilterSelect: function(oEvent){
                var sKey = oEvent.getParameter("key");
                let oFilter,
                    aFilter = [];

                
                switch(sKey){
                    case "Production":
                        oFilter = new Filter('Status', 'EQ', "");
                        break;
                    case "WaitChecking":
                        oFilter = new Filter('Status', 'EQ', "2");
                        break;
                    case "Complete":
                        oFilter = new Filter('Status', 'EQ', "3");
                        break;
                    case "All" :
                        oFilter = new Filter();
                        break;

                };
                aFilter.push(oFilter);

                this.byId("ProductTable").getBinding("rows").filter(aFilter);
            },

            // popover 실행
            onPopover: function(oEvent){
                let oView = this.getView();
                let oSource = oEvent.getSource();
                let oData = oView.getModel("main").getProperty("/Chart");
                if(oData.length === 0){
                    MessageToast.show("연도 또는 월 생산량을 선택해주세요.", {
                        width : "11rem"
                    })
                }
                else{
                    let index = this.byId("TreeTableBasic").getSelectedIndex(),
                        sPath = this.byId("TreeTableBasic").getContextByIndex(index).sPath,
                        oData = this.getView().getModel("tree").getProperty(sPath);

                    // 다이얼로그 박스 버전 오픈
                    if(oData.id == 'year'){
                        this.byId("quanDialog").setTitle(oData.name + "년 정상&불량 수량");
                    }

                    if(oData.month){
                        this.byId("quanDialog").setTitle(oData.year + "년 " + oData.month + "월 정상&불량 수량");
                    }
                    this.getView().byId("quanDialog").open();
                    
                }

                
                
            },

            onClose: function(){
                // sap.ui.getCore().byId('idpopover').close();
                this.getView().byId('quanDialog').close();
            },

            onStatus: function(oEvent){
                goPath = oEvent.getSource().getParent().getRowBindingContext().sPath;

                let oView = this.getView(),
                    oModel = oView.getModel(),
                    oMainmodel = oView.getModel("main"),
                    oTable = oMainmodel.getProperty(goPath),
                    obj = oModel.getObject(`/PrdmanagerSet('${oTable.Prmnum}')`);

                // Complete 뷰 프래그먼트 바인딩을 위한 임시 모델 선언
                let tempModel = new JSONModel();
                oView.setModel(tempModel, "complete");
                oView.getModel("complete").setData(obj);

                // 메시지 박스 내용 변경 변수
                let text;
                
                if(obj.Status == '3'){
                    MessageToast.show("생산이 완료된 품목입니다.");
                }
                else{
                    switch(obj.Status){
                        case '':
                            text = "생산 완료"
                            break;
                        case '2':
                            text = "품질 검수 대기"
                            break;
                    }

                    MessageBox.confirm(text + "로 변경하시겠습니까?", {
                        actions: ["확인", MessageBox.Action.CLOSE],
                        emphasizedAction: "확인",
                        
                        // 버튼 클릭 시 이벤트 활성화
                        onClose: function (sAction) {
                            if(sAction == "확인"){
                                switch(obj.Status){
                                    case '':
                                         // 현재 열려있는 테이블 Status 변경
                                        oTable.Status = '2'
                                        
                                        let path = oModel.createKey("/PrdmanagerSet", {
                                            Prmnum : obj.Prmnum
                                        })

                                        var today = new Date();
                                        // oData에서 할 경우 metadata 필드가 추가되서
                                        // 필드 구성이 안 맞아 abpa에서 update 함수를 안 타기 때문에 삭제
                                        delete obj.__metadata;
                                        
                                        obj.Chnam = "SNG-19";
                                        // date가 빈 값이면 이상한 에러 뜨면서 업데이트 불가
                                        obj.Chdat = today;

                                        oModel.update(path, obj, {
                                            success : function(oReturn){
                                                oMainmodel.refresh(true);
                                                MessageToast.show(text + "로 변경 완료");
                                            },
                                            error : function(oError) {
                                                MessageToast.show("데이터 변경 실패!");
                                            }
                                        });

                                        break;

                                    // 품질 검수
                                    case '2':
                                        oView.byId("completeDialog").open();
                                        break;
                                }
                               

                            }
                            else{
                                MessageToast.show("취소되었습니다");
                            }
                    }
                    })
                }
            },

            onComClose: function(oEvent){
                this.getView().byId('completeDialog').close();
            },

            onComCreate: function(oEvent){
                let oView = this.getView(),
                    oModel = oView.getModel(),
                    oPrmnum = oView.byId("idcomPrmnum").getValue(),
                    oNomalQuan = oView.byId("idcomNomalQuan").getValue(),
                    oDisposlaQuan = oView.byId("idcomDisposalQuan").getValue(),
                    obj = oModel.getObject(`/PrdmanagerSet('${oPrmnum}')`);

                if(oNomalQuan == false || oDisposlaQuan == false ){
                    MessageToast.show("검수 결과 수량을 입력하세요.")
                }
                else if(obj.Quan != (Number(oNomalQuan) + Number(oDisposlaQuan))){
                    MessageToast.show("총 수량과 검수 결과 수량 합이 일치하지 않습니다.")
                }
                else{
                    debugger;
                    let path = oModel.createKey("/PrdmanagerSet", {
                        Prmnum : obj.Prmnum
                    })

                    // goPath는 클로저변수로 처음 스테이터스 아이콘 클릭 위치 저장
                    let oTable = oView.getModel("main").getProperty(goPath);

                    var today = new Date();
                    // oData에서 할 경우 metadata 필드가 추가되서
                    // 필드 구성이 안 맞아 abpa에서 update 함수를 안 타기 때문에 삭제
                    delete obj.__metadata;
                    
                    obj.Chnam = "SNG-19";
                    // date가 빈 값이면 이상한 에러 뜨면서 업데이트 불가
                    obj.Chdat = today;
                    obj.Noquan = oNomalQuan;
                    obj.Dequan = oDisposlaQuan;

                    oModel.update(path, obj, {
                        success : function(oReturn){
                            debugger;
                            oModel.refresh(true);

                            oTable.Status = '3';
                            this.setVizframe(goData,goIndex);
                            oView.getModel("main").refresh(true);
                            
                            oView.byId("idComClose").fireEvent('press');
                            MessageToast.show(obj.Prmnum + " 검수 완료");
                        }.bind(this),
                        error : function(oError) {
                            debugger;
                            MessageToast.show("데이터 변경 실패!");
                        }
                    });
                }
            },

            setVizframe: function(oData, index){
                let aFilter = [];
                let oView = this.getView();
                    
                var oModelData = this.getView().getModel("main");

                if(oData.id == 'year'){
                    let styear = new Date(oData.name + '-01-01'),
                        edyear = new Date(oData.name + '-12-31');

                    let yearFilter = new Filter('Ppstdat', 'BT', styear, edyear);

                    aFilter.push(yearFilter);
                    this.byId("idTitle").setFooter(oData.name + "년 생산량")
                }
                

                if(index && oData.month){
                    // 이유는 모르겠으나 월은 해당 숫자에 +1 에 해당하는 값이 나온다
                    let stdate = new Date(oData.year, oData.month-1, 1),
                        eddate = new Date(oData.year, oData.month, 0);

                    let monthFilter = new Filter('Ppstdat', 'BT', stdate, eddate);

                    aFilter.push(monthFilter);
                    this.byId("idTitle").setFooter((index-1) + "월 생산량")
                };

                // read 함수 실행
                this.getView().getModel().read("/PrdmanagerSet" , {
                    filters : aFilter,
                    success : function(oReturn){
                        // debugger;
                        oModelData.setProperty("/Prdmanage", oReturn.results);

                        let prmData = oReturn.results;
                        let chartData = [];
                        // 테이블 갯수 체크
                        var productionCnt = 0, waitCnt = 0, completeCnt = 0, totalCnt = prmData.length;
                        // 수량 체크
                        var totalQuan = 0, noQuan = 0, deQuan = 0;

                        if(totalCnt == 0){
                            MessageToast.show("데이터가 존재하지 않습니다.", { width: "15rem", });
                        }
                        else{
                        // 테이블 데이터에 따른 카운트 체크
                        for(var i = 0; i < totalCnt; i++){
                            if(prmData[i].Status){
                                switch(prmData[i].Status){

                                    // 품질 검수 대기 데이터 카운트
                                    case "2":
                                        waitCnt = waitCnt + 1
                                        break;
                                    // 최종 완료 데이터 카운트
                                    case "3":
                                        completeCnt = completeCnt + 1
                                        break;
                                }
                            }
                            else{
                                // 생산 중 데이터 카운트
                                productionCnt = productionCnt + 1
                            }
                            
                        };

                        // 테이블 데이터에 따른 각 수량 체크
                        let aCountSum = prmData.reduce(function(pre, item, idx){
                            if(!pre[item.Gdname]){   
                                if(item.Status === '3'){
                                    totalQuan += Number(item.Quan);
                                    noQuan += Number(item.Noquan);
                                    deQuan += Number(item.Dequan);

                                    pre[item.Gdname] = {
                                        Gdname : item.Gdname,
                                        Noquan : Number(item.Noquan),
                                        Dequan : Number(item.Dequan),
                                        Quan : Number(item.Quan)
                                    };
                                }
                            }else{
                                if(item.Status === '3')
                                {
                                    pre[item.Gdname].Gdname = item.Gdname;
                                    pre[item.Gdname].Noquan += Number(item.Noquan);
                                    pre[item.Gdname].Dequan += Number(item.Dequan);
                                    pre[item.Gdname].Quan += Number(item.Quan);                                

                                    totalQuan += Number(item.Quan);
                                    noQuan += Number(item.Noquan);
                                    deQuan += Number(item.Dequan);
                                }
                            }
                            
                            return pre;
                        }, {});

                        for(var i in aCountSum) {
                            if(aCountSum.hasOwnProperty(i)) {
                                aCountSum[i].Gdname = aCountSum[i].Gdname.substr(6);
                                chartData.push(aCountSum[i]);
                            }
                        }

                        
                       
                    }
                    oModelData.setProperty("/Chart", chartData);

                        // 실수 소수점 두 자리까지 허용
                        let percentage = (( deQuan / noQuan ) * 100).toFixed(2);
                        // 숫자형은 문자형으로 변경 , 수량 길이에 따라 타일 타입 길이 설정
                        let quanLength = String(totalQuan).length;

                        let oCount = { 

                            // 아이콘 탭바 바인딩 용
                            "total" : totalCnt, 
                            "production" : productionCnt,
                            "wait" : waitCnt,
                            "complete" : completeCnt,

                            // 제네릭 타일 바인딩 용
                            "quanlength" : quanLength,
                            "totalquan" : Number(totalQuan),
                            "percentage" : Number(percentage)
                        }

                        // IconTabBar 및 GenericTile 데이터 모델에 입력
                        oView.getModel("main").setProperty("/Count", oCount);
                        
                    }.bind(this)

                });
            },

            onCollapseAll: function() {
                var oTreeTable = this.byId("TreeTableBasic");
                oTreeTable.collapseAll();
            }

        
        });
    });