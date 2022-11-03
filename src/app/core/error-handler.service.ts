import { AuthService } from './../seguranca/auth.service';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { MessageService } from 'primeng/api';

import { NotAuthenticatedError } from './../seguranca/money-http-interceptor';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private router: Router
  ) { }

  handle(errorResponse: any) {
    let msg: string;

    if (typeof errorResponse === 'string') {
      msg = errorResponse;

    } else if (errorResponse instanceof NotAuthenticatedError ) {
      msg = 'Sua sessão expirou!';
      this.authService.login();

    } else if (errorResponse instanceof HttpErrorResponse
        && errorResponse.status >= 400 && errorResponse.status <= 499) {
      msg = "Ocorreu um erro ao processar sua solicitação";

      if (errorResponse.status === 403) {
        msg = 'Você não tem permissão para executar esta ação'
      }

    try {
      msg = errorResponse.error[0].mensagemUsuario;
    } catch (e) { }

      console.log('Ocorreu um erro', errorResponse);

    } else {
      msg = 'Erro ao processar serviço remoto. Tente novamente.';
      console.log('Occoreu um erro', errorResponse);
    }

    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: msg
    });

  }
}
