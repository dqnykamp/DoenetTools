import React from 'react';
import ReactDOM from 'react-dom';
import { doenetMLToSerializedComponents } from '../../Core/utils/serializedStateProcessing';
import { parseAndCompile } from '../../Parser/parser'
import { returnAllPossibleVariants } from '../../Core/utils/returnAllPossibleVariants';
//import DateTime from '../../_reactComponents/PanelHeaderComponents/DateTime'
import RelatedItems from '../../_reactComponents/PanelHeaderComponents/RelatedItems';
import axios from 'axios';
import { convertActivitiesToNewFormat } from '../../_utils/convertActivitiesToNewFormat';
import { numberToLetters } from '../../Core/utils/sequence';

// serializeFunctions.expandDoenetMLsToFullSerializedComponents({
//     contentIds: [],
//     doenetMLs: [doenetML],
//     callBack: args => finishReturnAllPossibleVariants(
//       args,
//       { callback, componentInfoObjects }),
//     componentInfoObjects,
//     componentTypeLowerCaseMapping,
//     flags,
//     contentIdsToDoenetMLs
// })
async function updateSortOrder(){
 
  const { data } = await axios.get('/api/conversion_getSortOrder.php', {
    params: {},
  });

  function getSortOrder({parentDoenetId,startInd=0,itemsInCourse}){
    let doenetId_to_sortOrder = {}
    let ind = startInd;
    for (let item of itemsInCourse){
      if (item.parentDoenetId == parentDoenetId){
        doenetId_to_sortOrder[item.doenetId] = numberToLetters(27+ind).toLowerCase();
        ind++;
        let result = getSortOrder({parentDoenetId:item.doenetId,startInd:ind,itemsInCourse})
        ind = result.endInd;
        Object.assign(doenetId_to_sortOrder,result.doenetId_to_sortOrder)
      }
    }
    return {doenetId_to_sortOrder,endInd:ind};
  }

  let doenetId_to_sortOrder = {}
  for(let courseId of data.courseIds.slice(1)){
    let itemsInCourse = data.items_in_order.filter((itemObj)=>{
    // console.log("itemObj",itemObj.courseId,itemObj.courseId == courseId)
    return itemObj.courseId == courseId
    })

    // console.log("itemsInCourse",itemsInCourse,itemsInCourse.length)
    let so = getSortOrder({parentDoenetId:courseId,itemsInCourse})
    Object.assign(doenetId_to_sortOrder,so.doenetId_to_sortOrder);
  }
  // console.log("doenetId_to_sortOrder",doenetId_to_sortOrder)
  const { data:data2 } = await axios.post('/api/conversion_setSortOrder.php', { doenetId_to_sortOrder });
  console.log("data",data2)
}


ReactDOM.render(
  <>
  <button onClick={convertActivitiesToNewFormat}>run script</button>
  <br />
  <br />
  <br />
  <br />
  <button onClick={updateSortOrder}>update sortOrder</button>

  </>,
  document.getElementById('root'),
);

// options.push(<option value='Keagan'>Keagan</option>);


// const doenetMl = "<p>This is a test string <div> with a nested tag </div></p> <test attr=\"value\" /> <two />"

// let doenetMl = `<math test="blah">\\begin{matrix}a & b\\\\c &amp; d\\end{matrix}</math>`


// let t = parse(doenetMl);
// console.log(t);
// // console.log(t.node.getChildren());
// console.log(showCursor(t));

// let o = parseAndCompile(doenetMl);
// console.log(doenetMl)
// console.log(o)

// while(t.next()){
//   console.log(">>>node type",t.type)
//   console.log(">>>node bounds", t.from,t.to)
// }
