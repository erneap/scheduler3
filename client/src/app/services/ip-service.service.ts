import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IpService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  public getIPAddress() {
    return this.httpClient.get("https://api.ipify.org/?format=json");
  }
}
