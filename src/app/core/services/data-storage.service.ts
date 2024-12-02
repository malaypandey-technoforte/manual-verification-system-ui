import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { RequestModel } from "../../shared/models/request-model/RequestModel";
import { ConfigService } from "./config.service";
import { AppConfigService } from "../../app-config.service";
import * as appConstants from "../../app.constants";
@Injectable({
  providedIn: "root",
})
export class DataStorageService {
  /**
   * @description Creates an instance of DataStorageService.
   * @see HttpClient
   * @param {HttpClient} httpClient
   * @param {AppConfigService} appConfigService
   * @param {ConfigService} configService
   * @memberof DataStorageService
   */

  serverDtFormat = "YYYY/MM/DD";
  BASE_URL: string;
  MVS_URL: string;
  constructor(
    private httpClient: HttpClient,
    private appConfigService: AppConfigService,
    private configService: ConfigService
  ) {
    this.BASE_URL = this.appConfigService.getConfig()["BASE_URL"];
    this.MVS_URL = this.appConfigService.getConfig()["MVS_URL"];
  }

  userLogin(userName: string, password: string) {
    const req = {
      userName: userName,
      password: password
    };
    const obj = new RequestModel(appConstants.IDS.login, req);
    const url =
      this.BASE_URL +
      this.MVS_URL +
      appConstants.APPEND_URL.auth +
      "login";
    return this.httpClient.post(url, obj);
  }

  fetchApplicationList(userId: string, filters: any = [], sort: any = [], pagination: any = { pageStart: 0, pageFetch: 10 }) {
    const url =
      this.BASE_URL +
      this.MVS_URL +
      appConstants.APPEND_URL.applications +
      appConstants.APPEND_URL.search;

    const params: any = {
      userId,
      pageStart: pagination.pageStart,
      pageFetch: pagination.pageFetch,
    };

    // Dynamically build filters and sort arrays
    const filterArray = filters.map((filter: any) => ({
      columnName: filter.columnName,
      value: filter.value,
      type: filter.type
  }));

  const sortArray = sort.map((sortObj: any) => ({
      sortField: sortObj.sortField,
      sortType: sortObj.sortType
  }));
  // Prepare the request payload
  const requestPayload = {
    filters: [
        ...filterArray,
        {
            columnName: "userId", // Adding userId as a filter
            value: userId,
            type: "EQUALS"
        }
    ],
    sort: sortArray,
    pagination
};

// Create an instance of RequestModel
const requestModel = new RequestModel(appConstants.IDS.applicationList, requestPayload);

    return this.httpClient.post(url, requestModel);
  }

  getApplicationDetails(applicationId: string) {
    const url =
      this.BASE_URL +
      this.MVS_URL +
      appConstants.APPEND_URL.applications +
      applicationId;
    return this.httpClient.get(url);
  }

  changeStatus(applicationId: string, status: string, comment: string = '', rejectionCategory: string = '') {
    const request: any = {
      status: status,
      comment: comment,
    };
    if (status === 'REJECT' && rejectionCategory) {
      request.rejectionCategory = rejectionCategory;
    }
    const obj = new RequestModel(appConstants.IDS.login, request);
    const url =
      this.BASE_URL +
      this.MVS_URL +
      appConstants.APPEND_URL.applications +
      applicationId +
      appConstants.APPEND_URL.status;
    return this.httpClient.put(url, obj);
  }

}