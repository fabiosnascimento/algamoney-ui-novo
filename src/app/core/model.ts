export class Pessoa {
  codigo!: number;
  nome!: string;
  ativo = true;
  endereco = new Endereco();
  contatos = new Array<Contato>();
}

export class Categoria {
  codigo!: number;
}

export class Estado {
  codigo!: number;
  nome!: string
}

export class Cidade {
  codigo!: any;
  nome!: string;
  estado = new Estado();
}

export class Endereco {
  logradouro!: string;
  numero!: string;
  complemento!: string;
  bairro!: string;
  cep!: number;
  cidade = new Cidade();
}

export class Contato {
  codigo?: number;
  nome?: string;
  email?: string;
  telefone?: string;

  constructor(
    codigo?: number,
    nome?: string,
    email?: string,
    telefone?: string
    ) {
      this.codigo = codigo;
      this.nome = nome;
      this.email = email;
      this.telefone = telefone;
    }
}

export class Lancamento {
  codigo!: number;
  tipo = 'RECEITA';
  descricao!: string;
  dataVencimento!: Date;
  dataPagamento!: Date;
  valor!: number;
  observacao!: string;
  pessoa = new Pessoa();
  categoria = new Categoria();
  anexo!: string;
  urlAnexo!: string;
}
