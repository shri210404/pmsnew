import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";

export type ContextOptions = {
  fileFieldName?: string;
  isMultiple?: boolean;
  numericFields?: string[];
  dateFields?: string[];
};

@Injectable()
export class MyFileRequestInterceptor implements NestInterceptor {
  constructor(private contextOptions: ContextOptions = {}) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const reqObj = context.switchToHttp().getRequest();
    
    reqObj.body = this.separateFileFields(reqObj.body);
    return next.handle();
  }

  private separateFileFields(requestBody: any) {
    const requestData = {};
    Object.keys(requestBody).map((item) => {
      if (this.contextOptions.fileFieldName && item !== this.contextOptions.fileFieldName) {
        requestData[item] = this.assignFieldValue(item, requestBody[item]);
      }
    });

    let fileDetails = null;

    if (requestBody[this.contextOptions.fileFieldName]) {
      fileDetails = {};
      if (!!this.contextOptions.isMultiple) {
        fileDetails[this.contextOptions.fileFieldName] = Array.isArray(requestBody[this.contextOptions.fileFieldName])
          ? requestBody[this.contextOptions.fileFieldName]
          : [requestBody[this.contextOptions.fileFieldName]];
      } else {
        fileDetails[this.contextOptions.fileFieldName] = Array.isArray(requestBody[this.contextOptions.fileFieldName])
          ? requestBody[this.contextOptions.fileFieldName][0]
          : requestBody[this.contextOptions.fileFieldName];
      }
    }

    return { data: requestData, fileDetails };
  }

  private assignFieldValue(fieldName: string, valueProvider: { [key: string]: any }) {
    const numericFields = this.contextOptions.numericFields ? this.contextOptions.numericFields : [];
    const dateFields = this.contextOptions.dateFields ? this.contextOptions.dateFields : [];

    if (numericFields.length && numericFields.includes(fieldName)) {
      return Number(valueProvider.value);
    } else if (dateFields.length && dateFields.includes(fieldName)) {
      return new Date(valueProvider.value).toISOString();
    } else {
      return valueProvider.value;
    }
  }
}
