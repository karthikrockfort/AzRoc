({
    doInit : function(component, event, helper) {
       var action = component.get("c.fetchUser");
       action.setCallback(this, function(response) {
            var state = response.getState();
            //console.log('test state'+state);
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();
                //component.set("v.userInfos", storeResponse);
                var profileName  = JSON.stringify(storeResponse.Name).replace(/^"(.*)"$/, '$1');
                component.set("v.profileName", profileName);
            }
        });
        $A.enqueueAction(action);
        
        var userId = $A.get("$SObjectType.CurrentUser.Id");
        if(userId != undefined || userId != null){
            var stringArray = ["My Profile", "Log Out"];
            component.set('v.options',stringArray);
            component.set('v.isActiveUsers',true);
        }else{
            var URL = document.URL;
            var splitURL = URL.split('/s/');
            var profileUrl = splitURL[0];
            var link = profileUrl+'/s/login';
            component.set('v.loginLink',link);
            component.set('v.isActiveUsers',false);
        }
    },
    
    // Navigate to FAQ page.
    navigateFAQ : function(component, event, helper){
       // var url_string = window.location.href;
        
        //var faqPage = url_string.replace("banner-page", "faq-page");
         var url_string = window.location.href;
        var splitUrl = url_string.split("/s",10);
        var faqPage = splitUrl[0]+'/s/faq-page';
        component.set("v.faqPage",faqPage);
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
            "url":component.get("v.faqPage")
        });
        urlEvent.fire();
    },
    
    // Navigate to Profile Page & Logout Handle
    handleClick : function(component, event, helper) {
        var source = event.getSource();
        var label = source.get("v.label");
        var URL = document.URL;
        var splitURL = URL.split('/s/');
        var profileUrl = splitURL[0];
        if(label == "My Profile") {
            window.location.href = profileUrl+'/s/profile/'+$A.get("$SObjectType.CurrentUser.Id");
        }
        else {
            window.location.href = profileUrl+'/secur/logout.jsp?retUrl='+profileUrl+'/s/login';
            var link = profileUrl+'/secur/logout.jsp?retUrl='+profileUrl+'/s/login';
            component.set('v.loginLink',link);
        }
    },
    // Navigate to Dashboard Page when Click on Logo
    logoClick : function(component, event, helper) {
        component.getSuper().navigate(0);
    },
    //Mobile Navigation Menu
    navMenuOpen : function(component, event, helper) {
        component.set('v.isNavMenu',true);
    },
    navMenuClose : function(component, event, helper) {
        component.set('v.isNavMenu',false);
    },
    // Navigate to Respective pages when click on the menu items
    onMenuClick : function(component, event, helper) {
        var id = event.target.dataset.menuItemId;
        if (id) {
            component.set('v.isNavMenu',false);
            component.getSuper().navigate(id);
        }
    }
})