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

        return Controller.extend("ddppprdmanager.controller.Main", {
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                var oModel = new JSONModel();
                oModel.loadData("../model/tree.json");

                this.getView().setModel(oModel, 'tree');
                var oData = new JSONModel({
                    Prdmanage : [],
                    Chart : []
                });

                var oModelData = this.getView().setModel(oData, "main");

                this.oRouter.getRoute("RouteMain").attachPatternMatched(this._onPatternMatched, this);
                
            },

            _onPatternMatched: function() {
                this.getView().getModel("main").refresh(true);
            },

            onSelectChange(oEvent) {
                let index = oEvent.getParameters().rowIndex,
                    sPath = this.byId("TreeTableBasic").getContextByIndex(index).sPath,
                    oData = this.getView().getModel("tree").getProperty(sPath),
                    aFilter = [];
                
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

                        //////////////////////////////////////////////////////////////////////////////////

                        // var totalCnt =  prmData.length;
                        // var productionCnt = 0, waitCnt = 0, completeCnt = 0, totalQuan = 0;
                        // var noQuan = 0, deQuan = 0;

                        // if(totalCnt == 0){
                        //     MessageToast.show("데이터가 존재하지 않습니다.");
                        // }
                        // else{
                        //     for(var i = 0; i < totalCnt; i++){
                        //         if(prmData[i].Status){
                        //             switch(prmData[i].Status){
                        //                 case "2":
                        //                     waitCnt = waitCnt + 1
                        //                     break;
                        //                 // 최종 완료 데이터 카운트
                        //                 case "3":
                        //                     completeCnt = completeCnt + 1
                        //                     totalQuan = totalQuan + Number(prmData[i].Quan)
                        //                     noQuan = noQuan + Number(prmData[i].Noquan);
                        //                     deQuan = deQuan + Number(prmData[i].Dequan);
                        //                     // tempChart.push(prmData[i])
                                            
                        //                     if(tempChart.length !== 0){
                        //                         for(var j = 0; j < tempChart.length; j++){

                        //                             if(prmData[i].Gdcode == tempChart[j].Gdcode ){
                        //                                 tempChart[j].Quan = Number(tempChart[j].Quan) + Number(prmData[i].Quan);
                        //                                 tempChart[j].Noquan = Number(tempChart[j].Noquan) + Number(prmData[i].Noquan);
                        //                                 tempChart[j].Dequan = Number(tempChart[j].Dequan) + Number(prmData[i].Dequan);
                        //                                 break;
                        //                             }
                                                    
                        //                             if(j == ((tempChart.length)-1) && ( prmData[i].Gdcode != tempChart[j].Gdcode) ){
                        //                                 tempChart.push(prmData[i]);

                        //                             }
                        //                         }
                        //                     }
                        //                     else{
                        //                         tempChart.push(prmData[i])
                        //                         break;
                        //                     }
                        //             }
                        //         }
                        //         else{
                        //             // 생산 중 데이터 카운트
                        //             productionCnt = productionCnt + 1
                        //         }
                                
                        //     };

                        // }
                        
                        // // 객체로 count 변경 -> 실패
                        // // tempCount.push({totalCnt, productionCnt, waitCnt, completeCnt})      
                        // // oModelData.setProperty("/Count", tempCount);
                        // oModelData.setProperty("/Chart", tempChart);

                        // 실수 소수점 두 자리까지 허용
                        let percentage = (( deQuan / noQuan ) * 100).toFixed(2);
                        // 숫자형은 문자형으로 변경
                        let quanLength = String(totalQuan).length;

                        // view에 사용 될 데이터 set
                        this.getView().byId("idMicro").setPercentage(Number(percentage));
                        this.byId("idnc1").setTruncateValueTo(quanLength);
                        this.byId("idnc1").setValue(totalQuan);
                        this.getView().byId("idtabTotal").setCount(totalCnt);
                        this.getView().byId("idtabProduction").setCount(productionCnt);
                        this.getView().byId("idtabWait").setCount(waitCnt);
                        this.getView().byId("idtabComplete").setCount(completeCnt);
                    }.bind(this)

                });
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
                        return "sap-icon://factory"; ;
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

                    if (!this._pPopover) {
                        this._pPopover = Fragment.load({
                            name: "ddppprdmanager.view.fragment.popover",
                            controller: this
                        }).then(function(oPopover) {
                            oView.addDependent(oPopover);

                            return oPopover;
                        });
                    }
                    this._pPopover.then(function(oPopover) {
                        // 연도, 월을 구분하여 타이틀 출력
                        if(oData.id == 'year'){
                            oPopover.setTitle(oData.name + "년 정상&불량 수량");
                        }

                        if(oData.month){
                            oPopover.setTitle(oData.year + "년 " + oData.month + "월 정상&불량 수량");
                        }

                        oPopover.openBy(oSource);
                    });
                }

                
                
            },

            onClose: function(){
                sap.ui.getCore().byId('idpopover').close();
            },

            onStatus: function(oEvent){
                let sPath = oEvent.getSource().getParent().getRowBindingContext().sPath,
                    oModel = this.getView().getModel(),
                    oMainmodel = this.getView().getModel("main"),
                    oTable = oMainmodel.getProperty(sPath),
                    obj = this.getView().getModel().getObject(`/PrdmanagerSet('${oTable.Prmnum}')`);

                // 메시지 박스 내용 변경 변수
                let text;
                
                if(obj.Status == '3'){
                    MessageToast.show("생산이 완료된 품목입니다.");
                }
                else{
                    switch(obj.Status){
                        case '':
                            text = "품질 검수 대기"
                            break;
                        case '2':
                            text = "생산 완료"
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
                                        obj.Status = '2';
                                        break;
                                    case '2':
                                        obj.Status = '3';
                                        break;
                                }
                                // 현재 열려있는 테이블 Status 변경
                                oTable.Status = obj.Status

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

                            }
                            else{
                                MessageToast.show("취소되었습니다");
                            }
                    }
                    })
                }
            }
        });
    });
