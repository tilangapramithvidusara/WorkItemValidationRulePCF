export const generateJsonHandler = (dataArray: any[]) => {
  let finalData: {
    ifBlock:
      | { logic: { [x: number]: {} }; actions: any }
      | { logic: {}; actions: any };
    elseBlock: { logic: {}; actions: any } | { logic: {}; actions: any };
  }[] = [];
  dataArray.map((data: object) => {
    const { index, blocks }: any = data;
    if (blocks.length > 0) {
      console.log("block =====> ", blocks, index);
      blocks.map((blockData: any) => {
        if (blockData?.if) {
          const {
            if: { conditions, actions },
          } = blockData;

          if (conditions.length > 0) {
            if (conditions.length > 1) {
              const expressions: any = [];
              const condtionalDataArray: {}[] = [];
              let ifJsonObject = {};
              let elseJsonObject = {};
              conditions.map((conditionData: any, conditionIndex: number) => {
                const operator = conditionData?.Operator;
                const question = conditionData?.Field;
                const value = conditionData?.Value;
                const expression = conditionData?.expression;
                if (expression) expressions.push(expression);
                ifJsonObject = {
                  [operator]: [{ var: question }, value],
                };
                condtionalDataArray.push(ifJsonObject);
              });
              finalData.push({
                ifBlock: {
                  logic: {
                    [expressions[0]]: condtionalDataArray,
                  },
                  actions: actions,
                },
                elseBlock: {
                  logic: elseJsonObject,
                  actions: blockData?.else?.actions,
                },
              });
            } else {
              let ifJsonObject = {};
              let elseJsonObject = {};
              const operator = conditions[0]?.Operator;
              const question = conditions[0]?.Field;
              const value = conditions[0]?.Value;
              ifJsonObject = {
                [operator]: [{ var: question }, value],
              };
              if (blockData?.else?.actions?.length > 0) {
                const notOperator = `!${operator}`;
                elseJsonObject = {
                  [notOperator]: [{ var: question }, value],
                };
              }
              finalData.push({
                ifBlock: {
                  logic: ifJsonObject,
                  actions: actions,
                },
                elseBlock: {
                  logic: elseJsonObject,
                  actions: blockData?.else?.actions,
                },
              });
            }
          }
        }
      });
    }
  });
  return finalData;
};

export const logicJsonToFormatHandler = (logicJson: any) => {};

export const generateJsonLogicHandler = (condtionData: any) => {
  const { ifConditions, elseConditions } = condtionData;
  const finalOutputArray: any[] = [];
  if (ifConditions?.length === 1) {
    console.log("Single If Condtion ======> ", ifConditions);
    ifConditions.map((ifCondtionData: any, ifConditionDataIndex: number) => {
      const output = ifCondtionHandler(ifCondtionData, ifConditionDataIndex);
      console.log("single output ========> ", output);
      finalOutputArray.push({
        ifConditionOutput: output,
        elseConditionOutput: [
          {
            actions: elseConditions[0]?.actions || [],
          },
        ],
        multipleIfCondtions: false,
      });
    });
  } else if (ifConditions?.length > 1) {
    console.log("Multiple If Condtions =====> ", ifConditions);
    const multipleIfOutputArray: any[] = [];
    ifConditions.map((ifCondtionData: any, ifConditionDataIndex: number) => {
      const output = ifCondtionHandler(ifCondtionData, ifConditionDataIndex);
      console.log("multiple output ========> ", output);
      multipleIfOutputArray.push(output);
    });
    finalOutputArray.push({
      ifConditionOutput: [{ or: multipleIfOutputArray }],
      elseConditionOutput: [
        {
          actions: elseConditions[0]?.actions || [],
        },
      ],
      multipleIfCondtions: true,
    });
  } else {
    console.log("No Condtions =======> ", ifConditions);
  }

  return finalOutputArray;
};

const ifCondtionHandler = (
  ifCondtionData: any,
  ifConditionDataIndex: number
) => {
  console.log("comecccccccccccccc===> ", ifCondtionData);

  const { index, blocks } = ifCondtionData;
  const {
    if: { conditions, actions },
  } = blocks[0];
  // const conditions = blocks?
  console.log("boooooooo ===> ", blocks, conditions);

  const condtionLogics: any[] = [];
  const conditionLoop: any[] = [];
  if (conditions.length > 0 && conditions.length === 1) {
    console.log("One ppppp");

    conditions.map((conditionData: any, conditionIndex: number) => {
      const expression = conditionData?.expression;
      const field = conditionData?.Field;
      const value = conditionData?.Value;
      condtionLogics.push({
        [expression]: [{ var: field }, value],
        actions,
      });
    });
  } else if (conditions.length > 1) {
    console.log("multi ppppp");
    conditions.map((conditionData: any, conditionIndex: number) => {
      const expression = conditionData?.expression;
      const field = conditionData?.Field;
      const value = conditionData?.Value;
      const operator = conditions[1].Operator;
      // conditionIndex === 1 ? conditionData.Operator : '';
      conditionLoop.push({
        [expression]: [{ var: field }, value],
      });
      console.log(
        "cccccc =====> ",
        conditionIndex + 1 === conditions.length,
        conditionIndex,
        conditions.length,
        operator
      );

      if (conditionIndex + 1 === conditions.length) {
        condtionLogics.push({
          [operator]: conditionLoop,
          actions,
        });
      }
    });
  } else {
    console.log("else =====>");
  }
  return condtionLogics;
};

// new Logics ------------>

const convertJSONFormatToDBFormat = (
  allSections: any,
  visibilityRuleOverride: boolean
) => {
  let result = [];
  const arr = allSections.fields;
  let parentExpression = '';
  if (arr[1] && arr[1]?.expression) {
    parentExpression = arr[1]?.expression === '&&' ? 'and' : 'or';
  } else if (
    arr[1] &&
    arr[1].expression &&
    arr[1].expression?.innerConditions[0]?.expression
  ) {
    parentExpression =
      arr[1].expression?.innerConditions[0]?.expression === '&&' ? 'and' : 'or';
  }

  function buildCondition(conditionObj: {
    condition: any;
    field: any;
    value: any;
  }) {
    let condition;

    switch (conditionObj.condition) {
      case "==":
        condition = 
          { "if": [{ "==": [{ var: conditionObj.field }, conditionObj.value] }] }
        break;
      case "<":
        condition = 
          { "if": [{ "<": [{ var: conditionObj.field }, conditionObj.value] }] }
        break;
      case "<=":
        condition = 
          { "if": [{ "<=": [{ var: conditionObj.field }, conditionObj.value] }] }
        break;
      case ">":
        condition = 
          { "if": [{ ">": [{ var: conditionObj.field }, conditionObj.value] }] }
        break;
      case ">=":
        condition = 
          { "if":[{">=": [{ var: conditionObj.field }, conditionObj.value] }] }
        break;
        case "!=":
          condition = 
            { "if":[{"!=": [{ var: conditionObj.field }, conditionObj.value] }] }
          break;
        case "con":
          condition = 
            { "if": [{ var: conditionObj.field }, true, false] }
          break;
      default:
        condition = null;
        break;
    }
    return condition;
  }

  // function buildInnerConditions(innerConditions: any): any {
  //   let innerResult : any = [];
  //   for (const innerCondition of innerConditions)  {
  //     const condition = buildCondition(innerCondition);
  //     // console.log("condition", innerCondition)
  //     const exp = innerCondition?.innerConditions[1]?.expression
  //     // console.log("condition exp", exp?.innerConditions[1]?.expression)

  //     if (condition) {
  //       innerResult.push(condition);
  //     }
  //     // if (
  //     //   innerCondition?.hasNested &&
  //     //   innerCondition?.innerConditions.length > 0
  //     // ) {
  //     //   const nestedConditions = buildInnerConditions(
  //     //     innerCondition.innerConditions
  //     //   );
  //     //   innerResult.push({ [exp === '&&' || exp === 'and' || exp === 'AND' ? 'and' : 'or']: nestedConditions });
  //     // }
  //   }
  //   return innerResult;
  // }


  for (const conditionObj of arr) {
    const condition = buildCondition(conditionObj);
    if (condition) {
      result.push(condition);
    }
    // if (conditionObj.hasNested && conditionObj.innerConditions.length > 0) {
    //   const nestedConditions = buildInnerConditions(
    //     conditionObj.innerConditions
    //   );
      
    //   const exp = conditionObj?.innerConditions[1]?.expression
    //   result.push({ [exp === '&&' || exp === 'and' || exp === 'AND' ? 'and' : 'or']: nestedConditions });
    // }
  }

  // return { "and": result };
  return { [parentExpression]: result };
};

function findAndUpdateLastNestedIf(obj: any[], condition: any, overrideMinMax: boolean) {
  if (!obj.length) return [condition];

  let updated = false; // Flag to track if the update has been done

  return obj.map((x: { if: any[]; }, index: any) => {
      if (x?.if && !updated) {
          const isLastIf = x.if.filter((item: { if: any; }) => item.if);
          if (!isLastIf.length) {
              x.if[overrideMinMax ? 2 : 1] = condition;
              updated = true;
          } else {
              x.if = findAndUpdateLastNestedIf(x.if, condition, overrideMinMax);
          }
      }
      return x;
  });
}

function removeIfKeyAndGetDbProperty(obj: any[]){
  const ifConditions: any[] = [];
  obj.map((x: { if: any[]; }) => {
    if (x?.if) {
      if (!x.if.length) {
        ifConditions.push(x.if);
      } else {
        const filteredVal = x?.if?.find((x: { and: any; or: any; }) => x.and || x.or);
        if (filteredVal) {
          ifConditions.push(filteredVal);
        }
        ifConditions.push(...removeIfKeyAndGetDbProperty(x.if));
      }
    }
  });
  return ifConditions;
}


export { convertJSONFormatToDBFormat, findAndUpdateLastNestedIf, removeIfKeyAndGetDbProperty };
