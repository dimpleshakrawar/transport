import express, { Request, Response } from "express";
import { baseUrl } from "../../utils/common";
import ConductorGenerateReportServices from "../../services/reportGeneration/conductorReport.services";

export default class ConductorReportRoute {
  constructor(app: express.Application) {
    const conductorGenerateReportServices =
      new ConductorGenerateReportServices();
    this.init(app, conductorGenerateReportServices);
  }

  init(
    app: express.Application,
    conductorGenerateReportServices: ConductorGenerateReportServices
  ): void {
    app
      .route(`${baseUrl}/report/conductor-daywise`)
      .post((req: Request, res: Response) =>
        conductorGenerateReportServices.getDayCollection(req, res, "051P")
      );

    app
      .route(`${baseUrl}/report/conductor-report/:amount`)
      .post((req: Request, res: Response) =>
        conductorGenerateReportServices.getReportByamount(req, res, "052P")
      );

    app
      .route(`${baseUrl}/report/conductor-monthwise`)
      .post((req: Request, res: Response) =>
        conductorGenerateReportServices.getMonthlyCollection(req, res, "053P")
      );
  }
}
