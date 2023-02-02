import {HttpContextToken} from "@angular/common/http";

export const SURVEY_TOKEN = new HttpContextToken(() => 'SURVEY_TOKEN');
export const NOT_RETRY_TOKEN = new HttpContextToken(() => false)
