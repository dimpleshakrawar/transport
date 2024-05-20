import * as Yup from "yup";

export const BusReportValidationDailySchema = Yup.object({
  currentDate: Yup.date().required(),
  bus_id: Yup.string().required(),
});

export const BusReportValidationMonthlySchema = Yup.object({
  month: Yup.date().required(),
  bus_id: Yup.string().required(),
});
