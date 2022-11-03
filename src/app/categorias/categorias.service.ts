import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  categoriasUrl: string = '';

  constructor(
    private http: HttpClient,
    ) {
      this.categoriasUrl = `${environment.apiUrl}/categorias`;
    }

  listarTodas(): Promise<any> {
    return this.http.get(this.categoriasUrl)
      .toPromise();
  }
}
