export type LegalContentType = 'terms' | 'privacy';

export const legalContent: Record<
  LegalContentType,
  { title: string; updatedAt: string; sections: Array<{ heading: string; body: string[] }> }
> = {
  terms: {
    title: 'Termos de Uso',
    updatedAt: '14 de março de 2026',
    sections: [
      {
        heading: '1. Aceite de uso',
        body: [
          'Este texto ficticio existe apenas para testes de interface. Ao continuar, voce concorda em utilizar o GlicoSIM como ambiente demonstrativo para avaliacao de fluxos, navegacao e apresentacao de conteudo.',
          'Nenhuma clausula abaixo possui validade juridica real e deve ser substituida por um documento oficial antes de qualquer publicacao em producao.',
        ],
      },
      {
        heading: '2. Responsabilidades do usuario',
        body: [
          'O usuario se compromete a informar dados de teste coerentes, evitar conteudo ofensivo e nao utilizar a aplicacao para fins ilicitos.',
          'Em um cenario real, tambem seria responsabilidade do usuario proteger credenciais, revisar informacoes cadastradas e manter seus dispositivos seguros.',
        ],
      },
      {
        heading: '3. Disponibilidade do servico',
        body: [
          'Por se tratar de texto ficticio, assumimos aqui que o sistema pode sofrer manutencoes, instabilidades e indisponibilidades temporarias sem aviso previo.',
          'Mesmo em ambiente de demonstracao, a equipe busca estabilidade, mas nao garante operacao ininterrupta durante testes internos.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Politica de Privacidade',
    updatedAt: '14 de março de 2026',
    sections: [
      {
        heading: '1. Dados coletados',
        body: [
          'Este conteudo e ficticio e serve para validar a experiencia do modal. Para fins de teste, considere que nome, email e informacoes de uso podem ser exibidos e armazenados de forma simulada.',
          'Antes da publicacao oficial, o documento definitivo deve explicar com clareza quais dados sao coletados, por que sao tratados e qual a base legal correspondente.',
        ],
      },
      {
        heading: '2. Uso das informacoes',
        body: [
          'As informacoes de teste seriam utilizadas para autenticar acessos, personalizar a interface e melhorar o desempenho da aplicacao.',
          'Tambem seriam empregadas para auditoria tecnica, diagnostico de erros e analise de comportamento do produto, sempre respeitando os limites definidos pela politica real.',
        ],
      },
      {
        heading: '3. Compartilhamento e seguranca',
        body: [
          'Neste texto ficticio, presumimos que os dados nao sao comercializados e que qualquer compartilhamento ocorre apenas com fornecedores essenciais para a operacao do servico.',
          'Medidas de seguranca tecnicas e organizacionais devem ser descritas em documento oficial antes do lancamento para clientes reais.',
        ],
      },
    ],
  },
};
