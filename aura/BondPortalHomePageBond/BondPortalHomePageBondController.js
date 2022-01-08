({
    doInit: function(component, event, helper) {
        helper.getData(component);
    },
    loadOptions: function(component, event, helper) {
        var opts = [{
            value: "Update Existing Bond/Bond Rider/Bond Payout/Full Force & Effect",
            label: "Update Existing Bond/Bond Rider/Bond Payout/Full Force & Effect"
        }, {
            value: "Bond Cancellation",
            label: "Bond Cancellation"
        }, {  
            value: "Bond Reinstatement/Rescind Cancellation",
            label: "Bond Reinstatement/Rescind Cancellation"
        }];
        component.set("v.options", opts);
    },
    loadCancelOptions: function(component, event, helper) {
        var opts = [{
            value: "Update Existing Bond/Bond Rider/Bond Payout/Full Force & Effect",
            label: "Update Existing Bond/Bond Rider/Bond Payout/Full Force & Effect"
        }, {
            value: "Bond Reinstatement/Rescind Cancellation",
            label: "Bond Reinstatement/Rescind Cancellation"
        }];
        component.set("v.Canceloptions", opts);
    },
    onNext: function(component, event, helper) {
        let pageNumber = component.get("v.currentPageNumber");
        component.set("v.currentPageNumber", pageNumber + 1);
        helper.setPageDataAsPerPagination(component);
    },
    onPrev: function(component, event, helper) {
        let pageNumber = component.get("v.currentPageNumber");
        component.set("v.currentPageNumber", pageNumber - 1);
        helper.setPageDataAsPerPagination(component);
    },
    onFirst: function(component, event, helper) {
        component.set("v.currentPageNumber", 1);
        helper.setPageDataAsPerPagination(component);
    },
    onLast: function(component, event, helper) {
        component.set("v.currentPageNumber", component.get("v.totalPages"));
        helper.setPageDataAsPerPagination(component);
    },
    onPageSizeChange: function(component, event, helper) {
        helper.preparePagination(component, component.get('v.filteredData'));
    },
    handleSearch: function(component, event, helper) {
        helper.searchRecordsBySearchPhrase(component);
    },
    sortByBondNumber: function(component, event, helper) {
        helper.sortBy(component, "Bond_Number__c");
    },
    sortByBondStatus: function(component, event, helper) {
        helper.sortBy(component, "Status__c");
    },
     sortByBondSubStatus: function(component, event, helper) {
        helper.sortBy(component, "Sub_Status__c");  
    },
    sortByBusinessName: function(component, event, helper) {
        helper.sortBy(component, "Application__r.Account__r.Name");
    },
    sortByApplicationNumber: function(component, event, helper) {
        helper.sortBy(component, "Application__r.Name");
    },
    sortByROCNumber: function(component, event, helper) {
        helper.sortBy(component, "License__r.Name");
    },
    openBondPage: function(component, event, helper){
        var url = window.location.origin;
       var selectedIdvalue = event.getSource().get('v.value');
       var selectedId = event.getSource().get('v.name');
       window.open(url+"/AZROCBondPortal/s/bond/?id="+selectedId+"&value="+selectedIdvalue+"&section=1&type=bond","_self"); 
    },
    clearSerch: function(component, event, helper){
        helper.getData(component);
        component.set("v.searchBonds", '');
        document.getElementById("SearchAppNo").value ="";   
        document.getElementById("SearchRocNo").value ="";
    }
})