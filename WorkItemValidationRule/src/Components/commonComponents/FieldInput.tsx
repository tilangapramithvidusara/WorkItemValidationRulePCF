import React from 'react';
import { Select } from 'antd';
import sampleInputQuestion from '../../SampleData/sampleInputQuestion';

interface SearchSortProps {
    sampleData: any[]; // Adjust the type/interface as needed
    selectedValue: any,
    overrideSearch: boolean,
    setFieldValue: any,
    changedId: any,
    fieldName: any
    isDisabled: any
}
  
const FieldInput: React.FC<SearchSortProps> = ({sampleData, selectedValue, overrideSearch, setFieldValue, changedId, fieldName, isDisabled}) => {

    const searchFilterSort = (optionA: any, optionB: any) => {
        return (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase());
    }
        
    
    const searchFilterOption = (input: any, option: any) => {
        return (option?.label ?? '').includes(input)
    }
    
    const onChangeSearchEvent = (input: any, option: any) => {
        console.log("INPPPP", input)
        setFieldValue({input, changedId, fieldName})
    }
    return (
        <div>
            <Select
                showSearch={overrideSearch ? overrideSearch : true}
                style={{ width: 200 }}
                placeholder="Search to Select"
                optionFilterProp="children"
                filterOption={searchFilterOption}
                filterSort={searchFilterSort}
                onChange={onChangeSearchEvent}
                options={sampleData}
                defaultValue={selectedValue}
                disabled={isDisabled}
            />
        </div>
    )
}

export default FieldInput;