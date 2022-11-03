import { Title } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ErrorHandlerService } from './../../core/error-handler.service';
import { CategoriasService } from './../../categorias/categorias.service';
import { PessoaService } from './../../pessoas/pessoa.service';
import { LancamentoService } from './../lancamento.service';

import { Lancamento } from 'src/app/core/model';
import { MessageService } from 'primeng/api';

export interface Categoria {
  codigo: string;
  nome: string;
}

export interface Pessoa {
  codigo: string;
  nome: string;
}

@Component({
  selector: 'app-lancamento-cadastro',
  templateUrl: './lancamento-cadastro.component.html',
  styleUrls: ['./lancamento-cadastro.component.css']
})
export class LancamentoCadastroComponent implements OnInit {

tipos = [
  { label: 'Receita', value: 'RECEITA' },
  { label: 'Despesa', value: 'DESPESA' }
];

categorias = [];
pessoas = [];
formulario!: FormGroup;
uploadEmAndamento: boolean = false;

  constructor(
    private categoriasService: CategoriasService,
    private pessoasService: PessoaService,
    private lancamentoService: LancamentoService,
    private messageService: MessageService,
    private errorHandler: ErrorHandlerService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.configurarFormulario();
    const codigoLancamento = this.route.snapshot.params['codigo'];

    this.title.setTitle('Novo lançamento');

    if (codigoLancamento && codigoLancamento !== 'novo') {
      this.carregarLancamento(codigoLancamento);
    }

    this.carregarCategorias();
    this.carregarPessoas();
  }

  get urlUploadAnexo() {
    return this.lancamentoService.urlUploadAnexo();
  }

  get uploadHeaders() {
    return this.lancamentoService.uploadHeaders();
  }

  antesUploadAnexo() {
    this.uploadEmAndamento = true;
  }

  aoTerminarUploadAnexo(event: any) {
    const anexo = event.originalEvent.body;
    this.formulario.patchValue({
      anexo: anexo.nome,
      urlAnexo: anexo.url.replace('\\\\', 'https://')
    });

    this.uploadEmAndamento = false;
  }

  erroUpload(event: any) {
    this.errorHandler.handle('Erro ao tentar enviar anexo!');

    this.uploadEmAndamento = false;
  }

  removerAnexo() {
    this.formulario.patchValue({
      anexo: null,
      urlAnexo: null
    })
  }

  get nomeAnexo() {
    const nome = this.formulario.get('anexo')?.value;

    if (nome) {
      return nome.substring(nome.indexOf('_') + 1);
    }

    return '';
  }

  configurarFormulario() {
    this.formulario = this.formBuilder.group({
      codigo: [],
      tipo: ['RECEITA', Validators.required],
      dataVencimento: [null, Validators.required],
      dataPagamento: [],
      descricao: [null, [this.validarObrigatoriedade, this.validarTamanhoMinimo(5)]],
      valor: [null, Validators.required],
      pessoa: this.formBuilder.group({
        codigo: [Validators.required],
        nome: []
      }),
      categoria: this.formBuilder.group({
        codigo: Validators.required,
        nome: []
      }),
      observacao: [],
      anexo: [],
      urlAnexo: []
    })
  }

  validarObrigatoriedade(input: FormControl) {
    return (input.value ? null : { obrigatoriedade: true });
  }

  validarTamanhoMinimo(valor: number) {
    return (input: FormControl) => {
      return (!input.value || input.value.length >= valor) ? null : { tamanhoMinimo: { tamanho: valor } }
    }
  }

  get editando() {
    return Boolean(this.formulario.get('codigo')?.value);
  }

  carregarLancamento(codigo: number) {
    this.lancamentoService.buscarPorCodigo(codigo)
      .then(lancamento => {
        this.formulario.patchValue(lancamento);

        if (this.formulario.get('urlAnexo')?.value) {
          this.formulario.patchValue({
            urlAnexo: this.formulario.get('urlAnexo')?.value.replace('\\\\', 'https://')
          });
        }
        this.atualizarTituloEdicao();
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  salvar() {
    if (this.editando) {
      this.atualizarLancamento();
    } else {
      this.adicionarLancamento();
    }
  }

  adicionarLancamento() {
    this.lancamentoService.adicionar(this.formulario.value)
      .then(lancamentoAdicionado => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Lançamento adicionado com sucesso!'
        })

        this.router.navigate(['/lancamentos', lancamentoAdicionado.codigo]);
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  atualizarLancamento() {
    this.lancamentoService.atualizar(this.formulario.value)
      .then(lancamento => {
        //this.lancamento = lancamento;
        this.formulario.patchValue(lancamento);
        this.atualizarTituloEdicao();

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Lançamento alterado com sucesso!'
        })
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  carregarCategorias() {
    this.categoriasService.listarTodas()
      .then(categorias => {
        this.categorias = categorias.map((c: Categoria) => ({ label: c.nome, value: c.codigo }))
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  carregarPessoas() {
    this.pessoasService.listarTodas()
      .then(pessoas => {
        this.pessoas = pessoas.content.map((p: Pessoa) => ({ label: p.nome, value: p.codigo }))
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  novo() {
    this.formulario.reset();
    this.formulario.patchValue(new Lancamento());
    this.router.navigate(['/lancamentos/novo']);
  }

  atualizarTituloEdicao() {
    this.title.setTitle(`Edição de lançamento: ${this.formulario.get('descricao')?.value}`)
  }
}
