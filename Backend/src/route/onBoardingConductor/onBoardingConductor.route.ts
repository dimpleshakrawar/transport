import express, { Request, Response } from "express";
import { baseUrl } from "../../utils/common";
import OnBoardingConductorServices from "../../services/onBoardingConductor/onBoardingConductor.services";

export default class OnBoardingConductorRoute {
  constructor(app: express.Application) {
    const onBoardingConductorServices = new OnBoardingConductorServices();
    this.init(app, onBoardingConductorServices);
  }

  init(
    app: express.Application,
    onBoardingConductorServices: OnBoardingConductorServices
  ): void {
    app
      .route(`${baseUrl}/onBoardingConductor`)
      .post((req: Request, res: Response) =>
        onBoardingConductorServices.onBoardingNewConductor(req, res, "031P")
      );

    app
      .route(`${baseUrl}/getAllConductorsList`)
      .get((req: Request, res: Response) =>
        onBoardingConductorServices.getAllConductorList(req, res, "031G")
      );
  }
}
