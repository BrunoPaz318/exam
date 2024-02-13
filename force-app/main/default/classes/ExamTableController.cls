public class ExamTableController {
    @AuraEnabled
    public static List<Contact> getContacts() {
        try {
            List<Contact>  lstContacts = [SELECT Id,FirstName,LastName,Email FROM Contact LIMIT 15];
            return lstContacts;
        } catch (Exception e){
            System.debug(e.getMessage());
            throw  e;
        } 
    }
}