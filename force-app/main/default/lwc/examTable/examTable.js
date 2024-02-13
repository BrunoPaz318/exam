import { LightningElement, track } from 'lwc';
import { reduceErrors } from 'c/ldsUtils';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getContacts from '@salesforce/apex/ExamTableController.getContacts';
import createContact from '@salesforce/apex/LightingTableController.createContact';
import updateContact from '@salesforce/apex/LightingTableController.updateContact';
import deleteContact from '@salesforce/apex/LightingTableController.deleteContact';

export default class ExamTable extends LightningElement {

    errors

    boolDisplayModal = false
    boolIsCreateOrUpdate 
    boolIsDelete 

    strModalTitle = ''
    strSaveBtnText = ''
    strToastMessage = ''
    strToastVariant = ''
    strToastTitle = ''
    strSearchInputValue = ''

    @track jsnRowFields = {}

    lstContacts = []

    lstFoundContacts = []

    lstOldContacts = []

    lstRowActions = [
        {
            label: 'Delete',
            name: 'delete'
        },
        {
            label: 'Show Details',
            name: 'showDetails'
        },
    ];

    lstColumns = [
        {
            label: 'Id',
            fieldName: 'Id',
        },
        {
            label: 'First Name',
            fieldName: 'FirstName',
        },
        {
            label: 'Last Name',
            fieldName: 'LastName',
        },
        {
            label:'Email',
            fieldName:'Email'
        },
        {
            type: 'action',
            typeAttributes: {rowActions: this.lstRowActions}
        }
    ];

    async connectedCallback(){
        await this.getData()
    }

    async getData(){
        try {
            this.lstContacts = await getContacts()
        } catch(e){
            //put a throw ?
            this.errors = reduceErrors(e)
            this.strToastVariant = 'error'
            this.strToastMessage = this.errors
            this.strToastTitle = 'Error!'
        }
    }

    async funcCreateContact(contactData){
        try {
            const createdContact = await createContact({
                FirstName: contactData.FirstName,
                LastName: contactData.LastName,
                Email: contactData.Email
            })
            return createdContact
        } catch(e){
            this.errors = reduceErrors(e)
            this.strToastVariant = 'error'
            this.strToastMessage = this.errors
            this.strToastTitle = 'Error!'
        }
    }

    async funcUpdateContact(contactData){
        const contactId = contactData.Id
        delete contactData.Id
        try {
            const updatedContact = await updateContact({
                contactId: contactId,
                fieldsToUpdate: contactData
            })
            return updatedContact
        } catch(e){
            this.errors = reduceErrors(e)
            this.strToastVariant = 'error'
            this.strToastMessage = this.errors
            this.strToastTitle = 'Error!'
        }
    }

    async funcDeleteContact(contactId){
        try {
            await deleteContact({contactId})
        } catch(e){
            this.errors = reduceErrors(e)
            this.strToastVariant = 'error'
            this.strToastMessage = this.errors[0]
            this.strToastTitle = 'Error!'
        }
    }

    handleOpenModal(){
        this.boolDisplayModal = true
    }

    handleCloseModal(){
        this.boolDisplayModal = false
        this.jsnRowFields = {}

    }

    async handleSave(){
        const recievedData = this.jsnRowFields
        
        const updatedIndex = this.lstContacts.findIndex((item)=>item.Id===recievedData.Id)
        this.strToastVariant = 'success'
        this.strToastTitle = 'Success!'
        // if boolIsDelete means the user has confirmed to delete a contact
        if(this.boolIsDelete){
            this.strToastMessage = 'Record deleted'
            await this.funcDeleteContact(recievedData.Id)
            this.lstContacts.splice(updatedIndex,1)
        } else {
            // if  updatedIndex == -1 means contact is new 
            if(updatedIndex !== -1){
                this.strToastMessage = 'Record updated'
                const updatedContact = await this.funcUpdateContact(recievedData)
                this.lstContacts[updatedIndex] = {...updatedContact}
            } else {
                this.strToastMessage = 'Record created'
                const createdContact = await this.funcCreateContact(recievedData)
                this.lstContacts.push(createdContact)
            }
        }
        
        this.lstContacts = [...this.lstContacts]

        this.handleCloseModal()
        this.showToast()
    }

    showToast(){
        const event = new ShowToastEvent({
            title: this.strToastTitle,
            message: this.strToastMessage,
            variant:this.strToastVariant,
            mode: 'dismissable'
        })
        this.dispatchEvent(event)
    }

    handleRowActions(tableEvent){
        const actionName = tableEvent.detail.action.name
        this.jsnRowFields = tableEvent.detail.row
        switch (actionName) {
            case 'delete':
                this.boolIsDelete = true
                this.boolIsCreateOrUpdate = false
                this.strModalTitle = 'Delete Contact'
                this.strSaveBtnText = 'Yes'
                this.handleOpenModal()
                break;
            case 'showDetails':
                this.boolIsDelete = false
                this.boolIsCreateOrUpdate = true
                this.strModalTitle = 'Update Contact'
                this.strSaveBtnText = 'Save'
                this.handleOpenModal()
                break;
            default:

                break;
        }
    }

    handleInputChange(inputEvent){
        const fieldValue = inputEvent.target.value
        if(this.lstOldContacts.length > 0){
            this.lstContacts = [...this.lstOldContacts]
        }
        if(fieldValue==='' && this.lstOldContacts.length > 0){
            this.lstContacts = [...this.lstOldContacts]
        } else {
            this.lstContacts.forEach(contact=>{
    
                const contactKeys = Object.keys(contact);
                contactKeys.splice(0,1)
                for(let i = 0;i<contactKeys.length;i++){
    
                  const valueOfKey = contact[contactKeys[i]].toLowerCase()
    
                  if(valueOfKey.includes(fieldValue.toLowerCase())){
                    this.lstFoundContacts.push(contact)
                    break
                  }
    
                }
                
            })
            // create the copy
            this.lstOldContacts = [...this.lstContacts]
            // asign the found contacts to the contacts 
            this.lstContacts = [...this.lstFoundContacts]

            this.lstFoundContacts = []
        }

        
       
    }

    handleCreateNewContact(){
        this.boolIsDelete = false
        this.boolIsCreateOrUpdate = true
        this.strModalTitle = 'Create Contact'
        this.strSaveBtnText = 'Save'
        this.handleOpenModal()
    }
    getJsnRowFields(saveEvent){
        this.jsnRowFields = saveEvent.detail.dataToSend
    }
}