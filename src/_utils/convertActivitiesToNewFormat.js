import axios from "axios";

export async function convertActivitiesToNewFormat() {
  const { data } = await axios.get('/api/conversion_getCollectedActivityData.php', {
    params: {},
  });

  console.log("data", data);

  for (let activityData of data.activitiesToConvert) {
    console.log("Need to convert", activityData);

    let pageId = activityData.pageId;
    let courseId = activityData.courseId;


    const server = await axios.get(`/media/old/${activityData.draftPageOldCid}.doenet`);

    let draftDoenetML = server.data;
    // console.log("draft server",server)

    const { data } = await axios.post("/api/saveDoenetML.php", { doenetML: draftDoenetML, pageId, courseId })
    // console.log("data",data)

    if (!data.success) {
      console.error(data);
      throw Error("couldn't save draft doenetML");
    }


    let assignedPageCid;

    if (activityData.assignedPageOldCid) {
      const server = await axios.get(`/media/old/${activityData.assignedPageOldCid}.doenet`);
    console.log("activity server",server)

      let assignedDoenetML = server.data;

      const { data } = await axios.post("/api/saveDoenetML.php", {
        doenetML: assignedDoenetML,
        saveAsCid: 1,
        pageId, courseId
      })

    console.log("activitydata",data)

      if (!data.success) {
        console.log( {
          doenetML: assignedDoenetML,
          saveAsCid: 1,
          pageId, courseId
        })
        console.error(data);
        throw Error("couldn't save assigned doenetML");
      }

      assignedPageCid = data.cid;

      // create assigned activity

      let attributeString = ` xmlns="https://doenet.org/spec/doenetml/v0.1.0" type="activity" isSinglePage`

      let orderIndentSpacing = "  ".repeat(1);
      let pageIndentSpacing = "  ".repeat(2);
      let pageML = `${pageIndentSpacing}<page cid="${assignedPageCid}" />\n`;

      let childrenString = `${orderIndentSpacing}<order ${orderParameters}>\n${pageML}${orderIndentSpacing}</order>\n`;

      let activityDoenetML = `<document${attributeString}>\n${childrenString}</document>`;

      let resp = await axios.post('/api/saveCompiledActivity.php', {
        courseId, doenetId: activityData.doenetId,
        isAssigned: true,
        activityDoenetML
      });

      // if(!resp.data.success) {
        console.log({
          courseId, doenetId: activityData.doenetId,
          isAssigned: true,
          activityDoenetML
        })
        console.log(resp);
        // console.error(resp);
      //   throw Error("couldn't save compiled activity");
      // }




    }



  }

}