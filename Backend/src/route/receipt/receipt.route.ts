import express, { Request, Response } from "express";
import ReceiptServices from "../../services/receipt/receipt.services";
import { baseUrl } from "../../utils/common";
import { responseTime } from "../../middleware/responseTime";

class ReceiptRoute {
  constructor(app: express.Application) {
    const receiptServices = new ReceiptServices();
    this.init(app, receiptServices);
  }

  init(app: express.Application, receiptServices: ReceiptServices): void {
    app
      .route(`${baseUrl}/receipt/create`)
      .post((req: Request, res: Response) =>
        receiptServices.post(req, res, "0101")
      );

    app
      .route(`${baseUrl}/receipt/get`)
      .get(responseTime, (req: Request, res: Response) =>
        receiptServices.get(req, res, "0102")
      );
  }
}
export default ReceiptRoute;
