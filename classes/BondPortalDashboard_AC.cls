/**
* @File Name                : Application_AC
* @Description              : Used to hold the all sever side logic for home page in Bond Portal.  
* @Author                   : Karthik-MST  
* @Last Modified By         : MST
* @Last Modified On         : 17/06/2021, 11:27:00 Am
* @Modification Log         :       
* Ver       Date          Author           Modification        		    
* 1.0   17/06/2021   Karthik-MST      ARCP-204 based the ticket added the logic.
**/ 
public without sharing class BondPortalDashboard_AC {  
    
     @AuraEnabled
    public static List <Bond__c> fetchBonds()
    {
        List <Bond__c> bondList = new List <Bond__c>(); 
        List<User> userInfo = New List<User>([SELECT Id,Contact.Accountid FROM User WHERE Id =: UserInfo.getUserId()]);
        
        if(string.isNotBlank(userInfo[0].Contact.Accountid) ){
            bondList = [SELECT Bond_Number__c,Id,Status__c,
                        Application__r.Account__r.Name,Application__r.Name,License__r.Name,Sub_Status__c 
                        FROM Bond__c WHERE Account_Name__c =:userInfo[0].Contact.Accountid AND
                        (( Cancellation_Date__c = Null OR Cancellation_Date__c >= LAST_N_DAYS:730 )
                         OR ( License__r.Status__c NOT IN ('Expired', 'Revoked') AND
                             License__r.Status_Change_Date__c >= LAST_N_DAYS:730 )) ORDER BY Name DESC];
        }
        return bondList; 
    }    
    
    
    
    @AuraEnabled
    public static List <Application__c> fetchApplications()
    {
        Set<Id> ApplicationWithBonds = new Set<Id>();
        Map<Id,Application__c> applicationMap = new Map<Id,Application__c>();
        List<Application__c> applicationList = new List<Application__c>();
        List<User> userInfo = New List<User>([SELECT Id,Contact.Accountid FROM User WHERE Id =: UserInfo.getUserId()]);
                
        if(string.isNotBlank(userInfo[0].Contact.Accountid) ){
            for(Application__c iterateApplication : [SELECT Name,Account__r.Name,Doing_Business_As__c,License_Subtype__c,
                                                     Submitted_Date__c,OwnerId, (SELECT Application__c,Number__c FROM bonds__r) 
                                                     FROM Application__c WHERE Is_Portal_user_submitted__c = True AND 
                                                     Do_you_have_your_Full_Force_Letter__c ='' AND
                                                     Bond_Company_Bank__c =:userInfo[0].Contact.Accountid ORDER BY Name DESC])
            {
                for(Bond__c iterateBond : iterateApplication.bonds__r){
                    string bondNumber = iterateBond.Number__c;
                  
                    if(bondNumber.contains('>CBND')){
                        ApplicationWithBonds.add(iterateApplication.id);
                    }else if(! ApplicationWithBonds.contains(iterateApplication.id)){
                        applicationMap.put(iterateApplication.id,iterateApplication);    
                    }
                }
                
                if(iterateApplication.bonds__r.size() == 0){
                   applicationMap.put(iterateApplication.id,iterateApplication);  
                }
            }
        }
        
        for(Application__c iterateApplication : applicationMap.values()){
            if(! ApplicationWithBonds.contains(iterateApplication.id)){
              applicationList.add(iterateApplication);  
            }
        }  
        return applicationList;
    }
    
    @AuraEnabled
    public static List <License__c> fetctLicense(string rocLicenseNo)
    {
        string searchKeyWord = 'ROC '+rocLicenseNo;  
        List <License__c> licenseList = new List <License__c>();
        licenseList = [ SELECT Name,Primary_Licensee__r.Name,Doing_Business_As__c,
                       license_subtype__c,Status__c FROM License__c WHERE Name =: searchKeyWord LIMIT 1 ];
        return licenseList;
    }
     @AuraEnabled
    public static void sendEmailOperation(String appId){
        
           List<OrgWideEmailAddress> orgWideId = new List<OrgWideEmailAddress>([SELECT Id,Address 
                                                                         FROM OrgWideEmailAddress 
                                                                         WHERE Address =: 
                                                                         System.Label.Bond_Portal_Email LIMIT 1]);
        
            List<Application__c> arcpRec = [SELECT Id,Account__r.Name, App_Completed_By_Email__c,
                                                 Submitted_Date__c FROM Application__c WHERE ID =:appId] ;
        
            string toAddress;
            if (arcpRec.size()>0) {
               toAddress = arcpRec[0].App_Completed_By_Email__c;
            }
            
        	string submittedDate =  string.valueOfGmt(arcpRec[0].Submitted_Date__c);

            string bondCompany = arcpRec[0].Account__r.Name;
            EmailTemplate emailTemplate = [Select Id,Subject,Description,HtmlValue,DeveloperName,Body FROM
                                           EmailTemplate where name = 'AZROC Bond Company Rejected Bond'];
       
            String subject = emailTemplate.Subject;
            subject = subject;
           
        	String plainBody = emailTemplate.HtmlValue;
            plainBody = plainBody.replace('(&lt;date&gt;)', submittedDate.substring(0,10));
            plainBody = plainBody.replace(']]>', '');
            plainBody = plainBody.replace('&lt;bond company name&gt;',bondCompany);
        
            //build the email message
            Messaging.Singleemailmessage email = new Messaging.Singleemailmessage();
            email.setSaveAsActivity(true);
            email.setToAddresses(new String[] {toAddress});
        
            email.setSubject(subject);
            email.setHtmlBody(plainBody);
        
            if (!orgWideId.isEmpty()) {
                    email.setOrgWideEmailAddressId(orgWideId.get(0).id);
            }
        
            Messaging.sendEmail(new Messaging.SingleEmailmessage[] {email});        
        
    }
}