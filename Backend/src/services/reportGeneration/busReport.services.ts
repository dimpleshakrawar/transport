import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { resObj } from "../../utils/types";
import CommonRes from "../../utils/helper/commonResponse";
import {
  BusReportValidationDailySchema,
  BusReportValidationMonthlySchema,
} from "../../validators/busReportGen/busReportValidations.validator";

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

export default class BusGenerateReportServices {
  public prisma = new PrismaClient();

  constructor() {}

  getDayCollection = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const { currentDate, bus_id } = req.body;

      //validation
      await BusReportValidationDailySchema.validate(req.body);

      const setDate = new Date(currentDate);

      //   const dailyCollectionReport = await this.prisma.$queryRaw<any[]>`
      //   select rr.bus_id, rr.total_amount, ss.from_time, ss.to_time from (
      //   (SELECT r.bus_id, SUM(r.amount)::INTEGER AS "total_amount"
      //   FROM receipts r
      //   WHERE r.bus_id = ${bus_id}
      //   AND r.date::date = ${setDate}::date
      //   GROUP BY r.bus_id) rr

      //   left join

      //   (select * from scheduler s
      //   where s.date::date = ${setDate}::date and s.bus_id = ${bus_id}) ss

      //   on rr.bus_id = ss.bus_id);
      //  `;

      //getting daily collection
      const dailyCollectionReport = await this.prisma.$queryRaw<any[]>`
    SELECT *
    FROM receipts 
    WHERE bus_id = ${bus_id} 
    AND date = ${setDate}::date
   `;

      //getting net day amount
      const dailyNetAmount = await this.prisma.$queryRaw<any[]>`
      SELECT bus_id, SUM(receipts.amount)::INTEGER AS "total_amount"
      FROM receipts
      WHERE bus_id = ${bus_id} and date = ${setDate}::date
      GROUP BY bus_id
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

  getMonthlyCollection = async (req: Request, res: Response, apiId: string) => {
    const resObj: resObj = {
      apiId,
      action: "POST",
      version: "1.0",
    };

    try {
      const { month, bus_id } = req.body;

      //validation
      await BusReportValidationMonthlySchema.validate(req.body);

      const onlyMonth = month.split("-")[1];
      const onlyYear = month.split("-")[0];

      if (!onlyMonth || !onlyYear)
        return CommonRes.VALIDATION_ERROR(
          "month and year not found",
          resObj,
          res
        );

      const query: TQuery = await this.prisma.$queryRaw`SELECT *
        from
        receipts
        where bus_id = ${bus_id} and EXTRACT(MONTH FROM date) = ${Number(
        onlyMonth
      )} and EXTRACT(YEAR FROM date) = ${Number(onlyYear)}
        `;
      console.log("first", query);

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
