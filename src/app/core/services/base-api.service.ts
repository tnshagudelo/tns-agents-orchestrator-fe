import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export abstract class BaseApiService {
  protected readonly baseUrl = environment.apiUrl;

  constructor(protected readonly http: HttpClient) {}

  protected get<T>(path: string, params?: Record<string, string | number>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http.get<T>(`${this.baseUrl}${path}`, { params: httpParams });
  }

  protected post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body);
  }

  protected put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body);
  }

  protected patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body);
  }

  protected delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`);
  }

  protected getList<T>(path: string, page = 1, pageSize = 20): Observable<PagedResponse<T>> {
    return this.get<PagedResponse<T>>(path, { page, pageSize });
  }

  protected getOne<T>(path: string): Observable<ApiResponse<T>> {
    return this.get<ApiResponse<T>>(path);
  }
}
