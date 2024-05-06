import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PyhtonPdfService {

  constructor(
    private http: HttpClient
  ) { }

  getTextByPdf(): Observable<any> {
    return this.http.get(`${localStorage.getItem('urlLocalhost')}/read-pdf`);
  }

  sendPdf(body: any) {
    return this.http.post(`${localStorage.getItem('urlLocalhost')}/upload`, body)
  }
}
