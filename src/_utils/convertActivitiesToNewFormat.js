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


    const { data } = await axios.post("/api/saveDoenetML.php", { doenetML: draftDoenetML, pageId, courseId })

    if (!data.success) {
      console.error(data);
      throw Error("couldn't save draft doenetML");
    }

    if (activityData.assignedPageOldCid) {
      const server = await axios.get(`/media/old/${activityData.assignedPageOldCid}.doenet`);

      let assignedDoenetML = server.data;

      const { data } = await axios.post("/api/saveDoenetML.php", {
        doenetML: assignedDoenetML, 
        saveAsCid: 1,
        pageId, courseId
      })

      if (!data.success) {
        console.error(data);
        throw Error("couldn't save assigned doenetML");
      }

    }

  }

}