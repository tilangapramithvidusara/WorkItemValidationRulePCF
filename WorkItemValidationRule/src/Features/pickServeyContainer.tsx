import { Select } from "antd";
import React, { useEffect, useState } from "react";
import { languageConstantsForCountry } from "../constants/languageConstants";
interface NestedRowProps {
  children: React.ReactNode;
}


interface SectionProps {
  surveyList: any;
  setSelectedSurvey: any;
  selectedSurvey: any;
  _nestedRows: any;
  handleSectionRemove: any;
  languageConstants: any
}

function PickServeyContainer({
  surveyList,
  setSelectedSurvey,
  selectedSurvey,
  _nestedRows,
  handleSectionRemove,
  languageConstants
}: SectionProps) {
  
  const onChange = (value: string) => {
    console.log(`selected Survey ${value}`);
    setSelectedSurvey(value)
  };
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>(undefined);

  const onSearch = (value: string) => {
    console.log('search:', value);
  };
  
  // Filter `option.label` match the user type `input`
  const filterOption : any = (input: string, option: { label: string; value: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
  
  handleSectionRemove = (deleteSectionKey: any) => {
    console.log("Section remove hitted", deleteSectionKey)
    setSelectedSurvey(null)
  }

  return (
    <div style={{
      display: 'flex'
    }}>
      <div className="pcklbl mb-32">
        {/* Pick Survey :  */}
        {languageConstants?.ExpressionBuilder_PickSurvey + ` :`}
      </div>
      <div>
      <Select
        showSearch
        placeholder="Select a survey"
        optionFilterProp="children"
        onChange={onChange}
        onSearch={onSearch}
        filterOption={filterOption}
        options={surveyList?.length && surveyList?.map((x: any) => {
          return {
            value: x?.gyde_surveytemplateid,
            label: x?.gyde_name
          }
        })}
          style={{ width: 200 }}
          value={selectedSurvey ? selectedSurvey : null} 
          disabled={_nestedRows?.length === 1}
      />
      </div>
    
    </div>
  );
}
export default PickServeyContainer;
