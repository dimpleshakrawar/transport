import * as Yup from "yup";

export const ConductorReportValidationSchema = Yup.object({
  currentDate: Yup.date().required(),
  conductor_id: Yup.string().required(),
});

export const ConductorReportMonthlyValidationSchema = Yup.object({
  time: Yup.string().required(),
  conductor_id: Yup.string().required(),
});

export const ConductorReportWithAmountValidationSchema = Yup.object({
  amount: Yup.string().required(),
  conductor_id: Yup.string().required(),
  bus_id: Yup.string().required(),
  date: Yup.string().required(),
});
