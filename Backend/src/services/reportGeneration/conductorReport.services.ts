import express, { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { resObj } from "../../utils/types";
import CommonRes from "../../utils/helper/commonResponse";
import {
  ConductorReportMonthlyValidationSchema,
  ConductorReportValidationSchema,
  ConductorReportWithAmountValidationSchema,
} from "../../validators/conductorReportGen/conductorReportValidator";

type TQuery = [
  {
    id: number;
    receipt_no: string;
    amount: number;
    date: Date;
    time: string;
    conductor_id: string;
    created_at: Date;
    updated_at: Date;
  }
];

type Collection = {
  id: number;
  conductor_id: number;
  bus_id: string;
  receipt_no: string;
  amount: number;
  date: Date;
  time: number;
  created_at?: Date;
  updated_at?: Date;
};

export default class ConductorGenerateReportServices {
  public prisma = new PrismaClient();

  constructor() {}

  getDayCollection = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const { currentDate, conductor_id } = req.body;
      const intConductorId = parseInt(conductor_id);

      //validation
      await ConductorReportValidationSchema.validate(req.body);

      const setDate = new Date(currentDate);

      //   const dailyCollectionReport = await this.prisma.$queryRaw<any[]>`
      //   select rr.bus_id, rr.total_amount, ss.from_time, ss.to_time from (
      //   (SELECT r.bus_id, SUM(r.amount)::INTEGER AS "total_amount"
      //   FROM receipts r
      //   WHERE r.conductor_id = ${intConductorId}
      //   AND r.date::date = ${setDate}::date
      //   GROUP BY r.bus_id) rr

      //   left join

      //   (select * from scheduler s
      //   where s.date::date = ${setDate}::date and s.conductor_id = ${intConductorId}) ss

      //   on rr.bus_id = ss.bus_id);
      //  `;

      //getting daily collection
      const dailyCollectionReport = await this.prisma.$queryRaw<any[]>`
        SELECT *
        FROM receipts 
        WHERE conductor_id = ${intConductorId} 
        AND date = ${setDate}::date
       `;

      //getting net day amount
      const dailyNetAmount = await this.prisma.$queryRaw<any[]>`
      SELECT conductor_id, SUM(receipts.amount)::INTEGER AS "total_amount"
      FROM receipts
      WHERE conductor_id = ${intConductorId} and date = ${setDate}::date
      GROUP BY conductor_id
       `;

      console.log(dailyNetAmount, "ammount===============");

      const collData: { [key: string]: Collection[] } = {};

      //filtering data acc to busId received from db
      dailyCollectionReport.length &&
        dailyCollectionReport.forEach((data) => {
          if (!collData[data.bus_id]) {
            collData[data.bus_id] = []; // Initialize as an empty array if it does not exist
          }
          collData[data.bus_id].push(data); // Push the data into the array
        });

      console.log(collData, "collData==================>>>>");

      console.log(dailyCollectionReport, "dailyCollectionReport=========>>");

      const newData = {
        total_amount: dailyNetAmount[0]?.total_amount,
        data: collData,
      };

      return CommonRes.SUCCESS(
        "Daily collection generated successfully",
        newData,
        resObj,
        res
      );
    } catch (err) {
      console.log(err, "error in generating daily collection");
      return CommonRes.SERVER_ERROR(err, resObj, res);
    }
  };

  getReportByamount = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };
    try {
      const { amount } = req.params;
      const intAmount = parseInt(amount);

      const { conductor_id, bus_id, date } = req.body;

      //validations
      await ConductorReportWithAmountValidationSchema.validate({
        ...req.body,
        amount,
      });

      //data based on amount from params
      const fetchedData = await this.prisma.$queryRaw`
      select * from receipts 
      where conductor_id = ${conductor_id} and bus_id = ${bus_id} and amount = ${intAmount} and date=${date}::date
      `;

      console.log(fetchedData, "fetchedDData==========>>>");

      //total collection of amount received from params
      const fetchedAmount = await this.prisma.$queryRaw<any[]>`
      select conductor_id,bus_id, SUM(receipts.amount)::INTEGER AS "total_amount" from receipts
      where conductor_id = ${conductor_id} and bus_id = ${bus_id} and amount = ${intAmount} and date=${date}::date
      group by conductor_id,bus_id
      `;

      const resWithAmount = {
        data: fetchedData,
        total_amount: fetchedAmount[0]?.total_amount,
      };

      console.log(fetchedAmount, "fetchedAmount==========>>>");

      return CommonRes.SUCCESS(
        "Daily collection generated successfully",
        resWithAmount,
        resObj,
        res
      );
    } catch (err) {
      console.log(err, "error in generating daily collection by amount");
      return CommonRes.SERVER_ERROR(err, resObj, res);
    }

    // const getAmountByConductorId =
  };

  getMonthlyCollection = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const { time, conductor_id } = req.body;

      //validation
      await ConductorReportMonthlyValidationSchema.validate(req.body);

      const onlyMonth = time.split("-")[1];
      const onlyYear = time.split("-")[0];

      if (!onlyMonth || !onlyYear)
        return CommonRes.VALIDATION_ERROR(
          "month and year not found",
          resObj,
          res
        );

      const query: TQuery = await this.prisma.$queryRaw`
      SELECT * from receipts
      where conductor_id = ${Number(
        conductor_id
      )} and EXTRACT(MONTH FROM date) = ${Number(
        onlyMonth
      )} and EXTRACT(YEAR FROM date) = ${Number(onlyYear)}
        `;

      // const query = await this.prisma.$queryRaw<any[]>`
      //   select bus_id from receipts
      //   where conductor_id = ${Number(
      //     conductor_id
      //   )} and EXTRACT(MONTH FROM date) = ${Number(
      //   onlyMonth
      // )} and EXTRACT(YEAR FROM date) = ${Number(onlyYear)}
      // group by conductor_id = ${Number(conductor_id)}
      //   `;
      // console.log("first", query);

      const totalAmount = query.reduce((total, item) => total + item.amount, 0);
      const newRes = { data: query, totalAmount };

      return CommonRes.SUCCESS(
        "Monthly collection generated successfully",
        newRes,
        resObj,
        res
      );
    } catch (err) {
      console.log(err, "error in generating monthly collection");
      return CommonRes.SERVER_ERROR(err, resObj, res);
    }
  };
}
