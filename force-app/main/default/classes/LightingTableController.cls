public class LightingTableController {
    @AuraEnabled
    public static List<Contact> getContacts() {
        try {
            List<Contact>  lstContact = [SELECT FirstName,LastName,Email,Phone FROM Contact LIMIT 10];
            return lstContact;
        } catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        } 
    }

    @AuraEnabled
    public static Contact createContact(String FirstName,String LastName, String Email){
        try {
            Contact contact = new Contact(FirstName=FirstName,LastName=LastName,Email=Email);
            insert contact;
            return contact;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Contact updateContact(Id contactId, Map<String, Object> fieldsToUpdate){
        try {
            Contact contact = [SELECT Id, FirstName, LastName, Email, Phone FROM Contact WHERE Id = :contactId LIMIT 1];
        
            // Update fields based on the provided map
            for (String fieldName : fieldsToUpdate.keySet()) {
                if (contact.get(fieldName) != null) {
                    contact.put(fieldName, fieldsToUpdate.get(fieldName));
                } else {
                    throw new AuraHandledException('Field does no exist');
                }
            }
            
            // Update the contact
            update contact;
            
            return contact;
            
        } catch(Exception e) {
            System.debug(e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteContact(String contactId){
        try {
            Contact contact = [SELECT Id FROM Contact WHERE Id = :contactId LIMIT 1];
            delete contact;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}