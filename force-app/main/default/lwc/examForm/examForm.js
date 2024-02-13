import { LightningElement, api } from 'lwc';

export default class ExamForm extends LightningElement {

    @api jsnRowFields = {}
    @api lstColumns = []

    lstFieldValues = []

    connectedCallback(){
        for (const column of this.lstColumns){
            if(column.fieldName != 'Id' && column.type != 'action'){
                this.lstFieldValues.push({
                    ...column,
                    value: this.jsnRowFields[column.fieldName] 
                })
            } 
        }
    }

    handleFieldChange(onChangeEvent){
        const fieldName = onChangeEvent.target.dataset.id
        const fieldValue = onChangeEvent.target.value
        const rowFields = {...this.jsnRowFields}
        rowFields[fieldName] = fieldValue
        this.jsnRowFields = rowFields
        this.handleSave()
    }

    handleSave(){
        const dataToSend = this.jsnRowFields
        const saveEvent = new CustomEvent('save',{
            detail: {
                dataToSend
            }
        })
        this.dispatchEvent(saveEvent)
    }
}