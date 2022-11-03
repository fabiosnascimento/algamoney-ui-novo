import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';

import { environment } from './../../environments/environment';
import { Lancamento } from '../core/model';

export class LancamentoFiltro {
  descricao: string = '';
  dataVencimentoInicio?: Date;
  dataVencimentoFim?: Date;
  pagina = 0;
  itensPorPagina = 5;
}

@Injectable({
  providedIn: 'root'
})
export class LancamentoService {

  lancamentosUrl: string = '';

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe
    ) {
      this.lancamentosUrl = `${environment.apiUrl}/lancamentos`;
    }

  urlUploadAnexo(): string {
    return `${this.lancamentosUrl}/anexo`;
  }

  uploadHeaders() {
    return new HttpHeaders()
      .append('Authorization', 'Bearer ' + localStorage.getItem('token'));
  }

  pesquisar(filtro: LancamentoFiltro): Promise<any> {

    let params = new HttpParams();

    params = params.set('page', filtro.pagina);
    params = params.set('size', filtro.itensPorPagina);

    if (filtro.descricao) {
      params = params.set('descricao', filtro.descricao);
    }

    if (filtro.dataVencimentoInicio) {
      params = params.set('dataVencimentoDe', this.datePipe.transform(filtro.dataVencimentoInicio, 'yyyy-MM-dd')!);
    }

    if (filtro.dataVencimentoFim) {
      params = params.set('dataVencimentoAte', this.datePipe.transform(filtro.dataVencimentoFim, 'yyyy-MM-dd')!);
    }

    return this.http.get(`${this.lancamentosUrl}?resumo`, { params })
      .toPromise()
      .then((response:any) => {
        const lancamentos = response['content'];

        const resultado = {
          lancamentos,
          total: response['totalElements']
        };

        return resultado;
      });
  }

  excluir(codigo: number): Promise<any> {
    return this.http.delete(`${this.lancamentosUrl}/${codigo}`)
      .toPromise()
      .then(() => null);
  }

  adicionar(lancamento: Lancamento): Promise<any> {
      return this.http.post<Lancamento>(this.lancamentosUrl, lancamento)
        .toPromise();
  }

  atualizar(lancamento: Lancamento): Promise<Lancamento> {
    return this.http.put<Lancamento>(`${this.lancamentosUrl}/${lancamento.codigo}`, lancamento)
      .toPromise()
      .then((response: any) => {
        const lancamentoAlterado = response;

        this.converterStringsParaData([lancamentoAlterado]);

        return lancamentoAlterado;
      })
  }

  buscarPorCodigo(codigo: number): Promise<Lancamento> {
    return this.http.get<Lancamento>(`${this.lancamentosUrl}/${codigo}`)
      .toPromise()
      .then((response: any) => {

        const lancamento = response;

        this.converterStringsParaData([lancamento]);

        return lancamento;
      })
  }

  private converterStringsParaData(lancamentos: any[]) {

    for (const lancamento of lancamentos) {

      let offset = new Date().getTimezoneOffset() * 60000;

      lancamento.dataVencimento = new Date(new Date(lancamento.dataVencimento).getTime() + offset);

      if (lancamento.dataPagamento) {
        lancamento.dataPagamento = new Date(new Date(lancamento.dataPagamento).getTime() + offset);
      }
    }
  }
}
