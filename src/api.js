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

  // =====================================================
  // ОТРИМАТИ ВСІ ЗАПИСИ
  // =====================================================

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


  // =====================================================
  // ОТРИМАТИ ПЛАН
  // =====================================================

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


  // =====================================================
  // СТАРЕ ЗБЕРЕЖЕННЯ ОКРЕМОГО ЗАПИСУ
  // =====================================================

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


  // =====================================================
  // ПОВНІСТЮ ЗАМІНИТИ ІСТОРІЮ
  //
  // Використовується для:
  // - редагування
  // - видалення
  // - автоматичного перерахунку
  // =====================================================

  async replaceRecords(records) {
    const data =
      await request(
        "replaceRecords",
        {
          records:
            JSON.stringify(records)
        }
      );

    if (!data.ok) {
      throw new Error(
        data.error ||
        "Failed to update records"
      );
    }

    return data;
  },


  // =====================================================
  // ЗБЕРЕГТИ ПЛАН
  // =====================================================

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