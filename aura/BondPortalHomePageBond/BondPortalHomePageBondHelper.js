({
    getData: function(component) {
        var action = component.get("c.fetchBonds");
        action.setCallback(this, function(response) {
            var state = response.getState();
            
            if(state === "SUCCESS") {
                
                if(response.getReturnValue().length > 0){
                    
                    component.set('v.allData', response.getReturnValue()); 
                    component.set('v.filteredData', response.getReturnValue());
                    this.preparePagination(component, response.getReturnValue());
                    component.set("v.showTable",true);  
                }
                else{
                    component.set("v.showTableMsg",true);  
                }
                
            } else if(response.getState === "INCOMPLETE") {
                alert('Response is Incompleted');
            } else if(response.getState === "Error") {
                var errors = response.getError();
                if(errors) {
                    if(errors[0] && errors[0].message) {
                        alert("Error message: " + errors[0].message);
                    }
                } else {
                    alert("Unknown error");
                }
            }
            
        });
        $A.enqueueAction(action);
    },
    
    preparePagination: function(component, totalRecords) {
        let countTotalPage = Math.ceil(totalRecords.length / component.get("v.pageSize"));
        let totalPage = countTotalPage > 0 ? countTotalPage : 1;
        component.set("v.totalPages", totalPage);
        component.set("v.currentPageNumber", 1);
        this.setPageDataAsPerPagination(component);
    },
    
    setPageDataAsPerPagination: function(component) {
        let data = [];
        let pageNumber = component.get("v.currentPageNumber");
        let pageSize = component.get("v.pageSize");
        let filteredData = component.get('v.filteredData');
        let x = (pageNumber - 1) * pageSize;
        for(; x < (pageNumber) * pageSize; x++) {
            if(filteredData[x]) {
                data.push(filteredData[x]);
            }
        }
        component.set("v.tableData", data);
    },
    
    searchRecordsBySearchPhrase: function(component) {
        
        let searchBondsKey = component.get("v.searchBonds");
        let searchRocValueKey = document.getElementById("SearchRocNo").value;
        let searchAppValueKey = document.getElementById("SearchAppNo").value;
        
        let searchBonds;
        let searchRocValue;
        let searchAppValue;
        
        if(searchBondsKey){
            searchBonds = searchBondsKey.trim();
        }
        
        if(searchRocValueKey){
            searchRocValue = searchRocValueKey.trim();
        }
        
        if(searchAppValueKey){  
            searchAppValue = searchAppValueKey.trim();  
        }
        
        var searchLicense;  
        var searchApplication;
        if(searchRocValue) {
            searchLicense = 'ROC ' + searchRocValue;
        }
        if(searchAppValue) {
            searchApplication = 'APP-' + searchAppValue;
        }
        if(!$A.util.isEmpty(searchBonds) || !$A.util.isEmpty(searchLicense) || !$A.util.isEmpty(searchApplication)) {
            let allData = component.get("v.allData");
            let filteredBond = allData.filter(record => {
                
                var sortData = false;
                if(!$A.util.isEmpty(searchBonds) &&  record.Bond_Number__c != undefined) {
                sortData = record.Bond_Number__c.includes(searchBonds);
            }
              if(!$A.util.isEmpty(searchApplication) && !sortData && record.Application__r && record.Application__r.Name) {
                sortData = record.Application__r.Name.includes(searchApplication); 
                
            }
            if(!$A.util.isEmpty(searchLicense) && !sortData && record.License__r && record.License__r.Name) {
                sortData = record.License__r.Name.includes(searchLicense);              
            }
            
            try {
                return sortData;
            }
            catch(e) {
                //console.log('err',e);
            }           
        });
        component.set("v.filteredData", filteredBond);
        this.preparePagination(component, filteredBond);
    }
},
 
 sortBy: function(component, field) {
    var sortAsc = component.get("v.sortAsc"),
        sortField = component.get("v.sortField"), 
        records = component.get("v.allData");
    sortAsc = field == sortField ? !sortAsc : true;
    component.set("v.DoingBusiness",sortAsc);
    records.sort(function(a, b) {
        let obja;
        let objb;               
        
        if(field == "Application__r.Account__r.Name" && typeof a["Application__r"] == 'object' && typeof b["Application__r"] == 'object') {
            
            if(typeof a["Application__r"]["Account__r"] == 'object' && typeof b["Application__r"]["Account__r"] == 'object'){
                obja = a.Application__r.Account__r.Name;
                objb = b.Application__r.Account__r.Name;
            }
            
        } 
        else if(field == "Application__r.Account__r.Name" && typeof a["Application__r"] != 'object'&& typeof b["Application__r"] == 'object') {
            return 1;
        } 
            else if(field == "Application__r.Account__r.Name" && typeof a["Application__r"] == 'object' && typeof b["Application__r"] != 'object') {
                return -1;
            } 
                else if(field == "Application__r.Name" && typeof a["Application__r"] == 'object' && typeof b["Application__r"] == 'object') {
                    obja = a.Application__r.Name;
                    objb = b.Application__r.Name;
                }
                    else if(field == "Application__r.Name" && typeof a["Application__r"] == 'object' && typeof b["Application__r"] != 'object') {
                        return -1;
                    }
                        else if(field == "Application__r.Name" && typeof b["Application__r"] == 'object' && typeof a["Application__r"] != 'object') {
                            return 1;
                        }
                            else if(field == "License__r.Name" && typeof a["License__r"] == 'object' && typeof b["License__r"] == 'object') {
                                obja = a.License__r.Name;
                                objb = b.License__r.Name;
                            }
                                else if(field == "License__r.Name" && typeof a["License__r"] == 'object' && typeof b["License__r"] != 'object') {
                                    return -1;
                                }
                                    else if(field == "License__r.Name" && typeof b["License__r"] == 'object' && typeof a["License__r"] != 'object') {
                                        return 1;
                                    }
                                        else if (!a[field] || a[field] === null) 
                                        {
                                            return 1;
                                        }
                                            else if (!b[field] || b[field] === null) 
                                            {
                                                return -1;
                                            } 
                                                else {
                                                    obja = a[field];
                                                    objb = b[field];
                                                }
        var t1 = obja == objb,
            t2 = obja > objb;
        return t1 ? 0 : (sortAsc ? -1 : 1) * (t2 ? -1 : 1);
    });
    component.set("v.sortAsc", sortAsc);
    component.set("v.sortField", field);
    component.set("v.allData", records);
    component.set("v.filteredData", records);
    this.preparePagination(component, records)
}
})