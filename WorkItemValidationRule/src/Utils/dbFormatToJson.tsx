// let sampleArr = { "or": [{ "and": [{ "==": [{ "var": "Q_120_100" }, "3"] }, { "==": [{ "var": "Q_140_100" }, "10"] }, { "==": [{ "var": "Q_130_100" }, "10"] } ] }, { "==": [{ "var": "Q_110_100" }, "3"] } ] };

// Break to levels


const normalConverter = (sampleArr: any) => {
    
let finalResultArray: any = []

const convertFunc = (sampleArr: any[], level = 1) => {
  const normalParents = sampleArr.filter((x: {}) => Object.keys(x)[0] === 'eq' || Object.keys(x)[0] === '==' || Object.keys(x)[0] === '>'|| Object.keys(x)[0] === 'gt' || Object.keys(x)[0] === '>='|| Object.keys(x)[0] === 'gte' || Object.keys(x)[0] === '<'|| Object.keys(x)[0] === 'lt' || Object.keys(x)[0] === '<='|| Object.keys(x)[0] === 'lte');
  const nestedParents = sampleArr.filter((x: {}) => Object.keys(x)[0] === 'or' || Object.keys(x)[0] === 'and');
  const parentExpression = nestedParents.map((x: {}) => Object.keys(x)[0])[0];

  if (nestedParents && nestedParents.length) {
    nestedParents.forEach((x: any) => {
      const nestedLevelParents = Object.keys(x)[0];
      const equalOperators = x[nestedLevelParents].filter((x: {}) => Object.keys(x)[0] === '==' || Object.keys(x)[0] === 'eq' || Object.keys(x)[0] === '>'|| Object.keys(x)[0] === 'gt' || Object.keys(x)[0] === '>='|| Object.keys(x)[0] === 'gte' || Object.keys(x)[0] === '<'|| Object.keys(x)[0] === 'lt' || Object.keys(x)[0] === '<='|| Object.keys(x)[0] === 'lte');
      const andOrOperators = x[nestedLevelParents].filter((x: {}) => Object.keys(x)[0] === 'and' || Object.keys(x)[0] === 'or');
        console.log("")
      x[nestedLevelParents] = equalOperators.map((prnt: { [x: string]: any[]; }) => ({
        field: prnt["=="] ? prnt["=="][0].var : prnt[">"] ? prnt[">"][0].var : prnt[">="] ? prnt[">="][0].var :  prnt["<"] ? prnt["<"][0].var : prnt["<="] ? prnt["<="][0].var : prnt.eq[0].var,
          condition: Object.keys(prnt)[0] === 'eq' ?
              "==" : Object.keys(prnt)[0] === 'gt' ?
                  '>' : Object.keys(prnt)[0] === 'gte' ?
                      '>=' : Object.keys(prnt)[0] === 'lt' ?
                          '<' : Object.keys(prnt)[0] === 'lte' ?
                              '<=' : Object.keys(prnt)[0],
        value: prnt["=="] ? prnt["=="][1] : prnt[">"] ? prnt[">"][1] : prnt[">="] ? prnt[">="][1] :  prnt["<"] ? prnt["<"][1] :  prnt["<="] ? prnt["<="][1] : prnt.eq[1],
        sort: 1,
        level: level++,
        expression: nestedLevelParents === 'and' || nestedLevelParents === 'AND' || nestedLevelParents === '&&' ? '&&' : "||",
        innerConditions: [],
        hasNested: false,
      }));

      if (andOrOperators.length > 0) {
        x[nestedLevelParents][x[nestedLevelParents].length - 1].hasNested = true
        x[nestedLevelParents][x[nestedLevelParents].length - 1].innerConditions = andOrOperators;

        console.log("andOrOperators", andOrOperators)
        convertFunc(x[nestedLevelParents][x[nestedLevelParents].length - 1].innerConditions, level);
      }
    });
    return nestedParents;
  }
  return finalResultArray;
};
const finalRes = convertFunc(sampleArr)

console.log("DB Converted Arrayyy finalRes", JSON.stringify(finalRes, null, 2));

function removeAndOrKeys(obj: any): any {
    if (Array.isArray(obj)) {
      if (obj.length === 1) {
        return removeAndOrKeys(obj[0]);
      } else {
        return obj.map(removeAndOrKeys);
      }
    }
  
    if (typeof obj === 'object' && obj !== null) {
      if (Object.prototype.hasOwnProperty.call(obj, 'and')) {
        obj = removeAndOrKeys(obj.and);
        return obj;
      } else if (Object.prototype.hasOwnProperty.call(obj, 'or')) {
        obj = removeAndOrKeys(obj.or);
        return obj;
      }
  
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          obj[key] = removeAndOrKeys(obj[key]);
        }
      }
    }
    return obj;
}
    
// This function is use If the inner condition is object make it array
function convertNestedToArrays(conditions: string | any[]) {
    if (!Array.isArray(conditions)) {
      conditions = [conditions]; // Convert single condition to an array
    }
  
    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i];
  
      if (condition.hasNested) {
        condition.innerConditions = convertNestedToArrays(condition.innerConditions);
      }
    }
  
    return conditions;
  }
  

    const res = convertNestedToArrays(removeAndOrKeys(finalRes));
    if (res && res[0] && res[0]?.expression) {
        res[0].expression = ""
    }


    console.log("DB Converted Arrayyy ", JSON.stringify(res, null, 2));
    return res;

  } 

export { normalConverter };
