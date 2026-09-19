import axios from "axios";

import { APPS_SCRIPT_URL } from "./config";


async function request(action, payload = {}) {

  if (!APPS_SCRIPT_URL) {
    throw new Error(
      "Google Apps Script URL is not configured"
    );
  }


  const response = await axios.get(
    APPS_SCRIPT_URL,
    {
      params: {
        action,
        ...payload
      },

      timeout: 15000
    }
  );


  return response.data;
}


const api = {

  async getRecords() {

    const data =
      await request("getRecords");

    if (!data.ok) {
      throw new Error(
        data.error ||
        "Failed to load records"
      );
    }

    return data.records || [];
  },


  async getPlan() {

    const data =
      await request("getPlan");

    if (!data.ok) {
      throw new Error(
        data.error ||
        "Failed to load plan"
      );
    }

    return data.plan || null;
  },


  async saveRecord(record) {

    const data =
      await request(
        "saveRecord",
        record
      );


    if (!data.ok) {

      throw new Error(
        data.error ||
        "Save failed"
      );

    }


    return data;
  },


  async savePlan(plan) {

    const data =
      await request(
        "savePlan",
        plan
      );


    if (!data.ok) {

      throw new Error(
        data.error ||
        "Save failed"
      );

    }


    return data;
  }

};


export default api;