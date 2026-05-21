# Base de Conhecimento: Administração de Condomínios no Brasil

> **Versão pt_BR.** Este documento é a tradução em Português Brasileiro (pt_BR) de [`knowledge-base.md`](knowledge-base.md).
> Toda edição feita em `knowledge-base.md` deve ser refletida neste arquivo, e vice-versa.
> Em caso de conflito de conteúdo, a versão em inglês (`knowledge-base.md`) é a canônica.

---

## Índice

1. [Estrutura Legal e Regulatória](#1-estrutura-legal-e-regulatória)
2. [Atores e Papéis](#2-atores-e-papéis)
3. [Governança e Assembleias](#3-governança-e-assembleias)
4. [Gestão Financeira](#4-gestão-financeira)
5. [Gestão de Funcionários e RH](#5-gestão-de-funcionários-e-rh)
6. [Segurança e Controle de Acesso](#6-segurança-e-controle-de-acesso)
7. [Manutenção Predial e Normas Técnicas](#7-manutenção-predial-e-normas-técnicas)
8. [Conformidade com LGPD](#8-conformidade-com-lgpd)
9. [Comunicação e Relacionamento com Moradores](#9-comunicação-e-relacionamento-com-moradores)
10. [Tecnologia e Digitalização](#10-tecnologia-e-digitalização)
11. [Domínio de Dados — Entidades e Atributos](#11-domínio-de-dados--entidades-e-atributos)
12. [Regras de Negócio Críticas](#12-regras-de-negócio-críticas)
13. [Glossário Condominial](#13-glossário-condominial)
14. [Arquitetura Multi-Tenancy](#14-arquitetura-multi-tenancy)
15. [Gestão de Patrimônio Condominial](#15-gestão-de-patrimônio-condominial)
16. [Gestão de Estoque de Itens de Consumo](#16-gestão-de-estoque-de-itens-de-consumo)

---

## 1. Estrutura Legal e Regulatória

### 1.1 Legislação Principal

|Lei / Norma                                 |Descrição                                                                                                                                            |Âmbito  |
|--------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|--------|
|**Lei nº 4.591/1964**                       |Lei de Condomínios e Incorporações Imobiliárias. Marco fundador. Regula constituição, incorporação e aspectos estruturais do condomínio.             |Nacional|
|**Lei nº 10.406/2002 — Código Civil**       |Arts. 1.331 a 1.358: "Condomínio Edilício". Regula o dia a dia condominial — direitos, deveres, assembleias, síndico, convenção. Em vigor desde 2003.|Nacional|
|**Lei nº 8.245/1991 (Lei do Inquilinato)**  |Regula relações locatícias. Define quais despesas condominiais são de responsabilidade do inquilino vs. proprietário.                                |Nacional|
|**Lei nº 13.709/2018 (LGPD)**               |Lei Geral de Proteção de Dados Pessoais. Impacta todo tratamento de dados de moradores, visitantes e funcionários.                                   |Nacional|
|**CLT — Decreto-Lei nº 5.452/1943**         |Regula a relação de emprego do condomínio com seus funcionários.                                                                                     |Nacional|
|**Reforma Trabalhista — Lei nº 13.467/2017**|Atualiza a CLT: contratos intermitentes, banco de horas individual, jornada 12x36 por acordo escrito, terceirização ampla.                           |Nacional|
|**Decreto nº 11.905/2024**                  |Atualiza obrigações trabalhistas; consolida uso do eSocial e do DET (Domicílio Eletrônico Trabalhista) para condomínios.                             |Nacional|
|**ABNT NBR 5674:2024**                      |Requisitos para gestão de manutenção de edificações. Referência técnica central.                                                                     |Técnica |

### 1.2 Hierarquia Normativa Condominial

```
Constituição Federal
       ↓
  Código Civil (Lei 10.406/2002) — arts. 1.331–1.358
       ↓
   Lei 4.591/64 (complementar para incorporações)
       ↓
  Convenção de Condomínio (registrada em Cartório de Imóveis)
       ↓
  Regimento Interno
       ↓
  Deliberações de Assembleia
```

**Regra:** Nenhum documento condominial pode contrariar norma de hierarquia superior.

### 1.3 Documentos Constitutivos

**Convenção de Condomínio**

- Instrumento jurídico que define as regras de convivência e administração.
- Precisa do registro em Cartório de Registro de Imóveis para ter validade legal (Art. 9º, §1º, Lei 4.591/64).
- Aprovação: assinaturas representando no mínimo **2/3 das frações ideais** do condomínio.
- Alterações: também exigem 2/3 dos votos.
- Conteúdo obrigatório mínimo: discriminação e individualização das unidades, fração ideal de cada unidade, fim a que se destinam áreas comuns, modo de uso e de administração, encargos condominiais e forma de rateio.

**Regimento Interno**

- Regula uso das áreas comuns, horários, animais, reformas, comportamento.
- Pode ser parte da Convenção ou documento separado.
- Aprovação: maioria simples dos condôminos presentes em assembleia.

---

## 2. Atores e Papéis

### 2.1 Síndico

**Base legal:** Arts. 1.347 e 1.348 do Código Civil.

**Perfil:**

- Morador (condômino) ou profissional externo (síndico profissional).
- Mandato de **até 2 anos**, com possibilidade de reeleição.
- Eleito em assembleia.

**Atribuições (Art. 1.348 CC):**

- Convocar a assembleia dos condôminos.
- Representar o condomínio, ativa e passivamente, em juízo ou fora dele.
- Dar imediato conhecimento à assembleia da existência de procedimento judicial ou administrativo de interesse do condomínio.
- Cumprir e fazer cumprir a convenção, o regimento interno e as determinações da assembleia.
- Diligenciar a conservação e a guarda das partes comuns e zelar pela prestação dos serviços que interessem aos possuidores.
- Elaborar o **orçamento da receita e da despesa** relativa a cada ano.
- Cobrar dos condôminos as suas contribuições, bem como impor e cobrar as multas devidas.
- Prestar contas à assembleia, anualmente e quando exigidas.
- Realizar o seguro da edificação.
- Contratar e demitir funcionários.

**Regime jurídico do síndico:**

- Não tem vínculo empregatício com o condomínio (não está sujeito à CLT).
- Remuneração (pro labore) ou isenção de taxa condominial, se previsto na convenção ou deliberado em assembleia.
- Recolhe INSS como contribuinte individual (alíquota 11%); o condomínio recolhe 20%.
- Pode ser destituído a qualquer momento por assembleia convocada por 1/4 dos condôminos.

**Síndico Profissional:**

- Presta serviços via contrato de prestação de serviços (não é empregado).
- Tendência crescente de profissionalização da gestão condominial.

### 2.2 Conselho Fiscal (Conselho Consultivo)

**Base legal:** Art. 1.356 do Código Civil.

- Composto por **3 membros** eleitos em assembleia.
- Mandato de até **2 anos**.
- Função principal: apreciar as contas do síndico e emitir parecer.
- Pode ser também consultivo, auxiliando o síndico nas decisões.

### 2.3 Administradora de Condomínios

- Empresa contratada para apoiar o síndico na gestão operacional, financeira e documental.
- A responsabilidade legal permanece com o síndico; a administradora responde contratualmente.
- Funções típicas: emissão de boletos, folha de pagamento, prestação de contas, contratos, assembleias.

### 2.4 Condômino (Proprietário)

**Direitos:**

- Usar e fruir as partes comuns conforme sua destinação (piscina, salão, etc.).
- Votar nas assembleias (desde que em dia com o condomínio).
- Ter acesso às contas e documentos do condomínio.
- Acessar vagas de garagem vinculadas à unidade (decisão STJ 2024: vagas vinculadas são propriedade exclusiva, salvo disposição contrária na convenção).

**Deveres:**

- Pagar a taxa condominial em dia (cota condominial).
- Cumprir a convenção e o regimento interno.
- Não realizar reformas sem comunicação ao síndico (NBR 16280).
- Contribuir para o fundo de reserva conforme convenção.

### 2.5 Inquilino (Locatário)

- Tem os mesmos deveres de convivência que o proprietário.
- Paga as **despesas ordinárias** do condomínio (manutenção rotineira, salários, etc.).
- O **fundo de reserva** e as **despesas extraordinárias** (obras estruturais, benfeitorias) são de responsabilidade do proprietário, salvo convenção em contrário.
- **Lei do Inquilinato (8.245/91)** define a divisão de responsabilidades.

### 2.6 Funcionários do Condomínio

Cargos típicos (variação por porte):

|Cargo                            |Função Principal                                                      |
|---------------------------------|----------------------------------------------------------------------|
|Zelador                          |Supervisão geral, manutenção de primeiro nível, coordenação de equipes|
|Porteiro                         |Controle de acesso, recepção, atendimento                             |
|Auxiliar de Serviços Gerais (ASG)|Limpeza e conservação das áreas comuns                                |
|Vigia / Segurança                |Monitoramento e ronda                                                 |
|Recepcionista                    |Atendimento em condomínios de alto padrão                             |

---

## 3. Governança e Assembleias

### 3.1 Tipos de Assembleia

**Assembleia Geral Ordinária (AGO):**

- Realizada **ao menos uma vez por ano**.
- Pauta obrigatória: aprovação das contas do exercício anterior, previsão orçamentária do próximo ano, eleição de síndico (quando aplicável).

**Assembleia Geral Extraordinária (AGE):**

- Convocada quando surgir tema urgente ou fora do ciclo ordinário.
- Pode ser convocada pelo síndico ou por 1/4 dos condôminos.

**Formato permitido:**

- Presencial, virtual (online) ou híbrida.
- Votação digital válida desde que garantidas autenticidade e sigilo.
- Procurações digitais aceitas se não houver restrição na convenção.

### 3.2 Convocação

- Responsabilidade do síndico (Art. 1.348, I, CC).
- Deve conter: data, local/link, horário da 1ª e 2ª chamada (mínimo 30 minutos de intervalo), pauta completa (ordem do dia), quórum necessário para cada item.
- **Somente os assuntos indicados no edital de convocação podem ser votados.**
- Prazo de antecedência conforme a convenção (geralmente 5 a 10 dias).

### 3.3 Tabela de Quóruns

|Assunto                                    |1ª Convocação                      |Votação Necessária                             |
|-------------------------------------------|-----------------------------------|-----------------------------------------------|
|Aprovação de contas / Previsão orçamentária|Metade dos condôminos              |Maioria dos presentes                          |
|Eleição / Destituição do síndico           |Metade dos condôminos              |Maioria dos presentes (50%+1 dos presentes)    |
|Destituição do síndico por condôminos      |1/4 convoca; qualquer número aprova|Maioria simples dos presentes                  |
|Transferência de poderes do síndico        |—                                  |Maioria absoluta (50%+1 de TODOS os condôminos)|
|Obras voluptuárias (melhoria)              |Metade dos condôminos              |Maioria absoluta (todos os condôminos)         |
|Obras úteis (portaria remota, hidrômetros) |Metade dos condôminos              |Maioria absoluta (todos os condôminos)         |
|Obras necessárias urgentes                 |Qualquer número                    |Maioria dos presentes                          |
|Alteração da Convenção                     |Qualquer número                    |2/3 de todos os condôminos                     |
|Alteração do Regimento Interno             |Qualquer número                    |Maioria simples dos presentes                  |
|2ª Convocação (regra geral)                |Qualquer número                    |Maioria dos presentes                          |

> **Observação:** Em 2ª convocação, a assembleia delibera com a maioria dos votos dos presentes, salvo quórum especial previsto em lei ou convenção (Art. 1.352 CC). Se quórum especial não for atingido, pode-se converter em sessão permanente, com nova data em até 60 dias.

### 3.4 Ata da Assembleia

- Documento que formaliza todas as deliberações.
- Deve ser lavrada pelo secretário eleito na assembleia.
- Deve ser distribuída a todos os condôminos após a assembleia.
- Para alterações de convenção: deve ser registrada em Cartório de Registro de Imóveis.
- Em assembleias digitais: recomenda-se gravar a sessão para apoio na elaboração da ata.

---

## 4. Gestão Financeira

### 4.1 Taxa Condominial (Cota Condominial)

- Contribuição mensal obrigatória de cada unidade para custeio das despesas do condomínio.
- Calculada com base na fração ideal ou em cotas iguais por unidade (definido na convenção).
- Deve cobrir: despesas ordinárias + fundo de reserva + provisões para emergências.
- Reajuste: deve ser aprovado em assembleia com transparência.

**Critérios de rateio (definidos na convenção):**

- **Por fração ideal:** cada unidade contribui proporcionalmente ao seu tamanho/fração.
- **Por unidade (igualitário):** cada unidade paga o mesmo valor.
- **Híbrido:** algumas despesas por fração ideal, outras por unidade.

### 4.2 Categorias de Despesas

**Despesas Ordinárias (responsabilidade do inquilino ou proprietário):**

- Folha de pagamento de funcionários (salários, encargos, benefícios)
- Água, gás, energia elétrica das áreas comuns
- Manutenção preventiva e corretiva de equipamentos
- Serviços terceirizados de limpeza, jardinagem, segurança
- Seguros obrigatórios
- Material de limpeza e consumo
- Contribuição para o fundo de reserva (reposição)
- Honorários da administradora

**Despesas Extraordinárias (responsabilidade do proprietário):**

- Obras estruturais e de benfeitorias
- Modernização de elevadores
- Pintura da fachada
- Aquisição de equipamentos para as áreas comuns
- Constituição inicial do fundo de reserva

### 4.3 Fundo de Reserva

**Base legal:** Art. 1.336 do Código Civil (obrigação de contribuir conforme convenção); Convenção deve definir percentual e finalidade.

**Características:**

- Funciona como "poupança" do condomínio para cobrir despesas emergenciais não previstas no orçamento ordinário.
- Contribuição mensal: entre **5% e 10%** da taxa condominial.
- Saldo ideal: entre **1x e 3x** o valor da arrecadação mensal.
- Deve ter conta bancária exclusiva para controle.
- **NÃO deve ser utilizado** para despesas ordinárias ou rotineiras.
- Constituição: aprovação de **2/3 dos condôminos** em assembleia.
- Por lei (8.245/91): o fundo de reserva é encargo do proprietário, exceto em caso de reposição parcial ou total pelo inquilino.

**Usos permitidos:**

- Reparos emergenciais (rompimento de tubulação, falha estrutural, etc.)
- Cobertura temporária de inadimplência elevada (se previsto na convenção)
- Despesas imprevisíveis de grande porte

**Usos NÃO permitidos:**

- Despesas correntes e programadas
- Substituição de caixa do condomínio para cobrir déficit de caixa recorrente

### 4.4 Previsão Orçamentária

**Base legal:** Art. 1.348, VIII, CC — o síndico é obrigado a elaborar o orçamento anual.

**Processo:**

1. Levantar histórico financeiro dos últimos 24 meses (balancetes, contratos, consumo).
2. Mapear e categorizar todas as despesas: fixas, variáveis, emergenciais, fundo de reserva.
3. Estimar reajustes: inflação (IPCA/IGPM), pisos salariais, contratos de serviço.
4. Calcular taxa de inadimplência histórica e projetar impacto no fluxo de caixa.
5. Calcular o fundo de reserva necessário.
6. Definir a cota condominial justa e equilibrada.
7. Apresentar e aprovar em **Assembleia Geral Ordinária**.

**Erros comuns a evitar:**

- Ignorar a inadimplência histórica na projeção de receitas.
- Não prever despesas extraordinárias eventuais.
- Não atualizar contratos com índices de reajuste corretos.
- Aumentar a taxa sem comunicação clara e transparente.

### 4.5 Inadimplência

**Consequências legais para o condômino inadimplente:**

- Multa de até **2% sobre o débito** (Art. 1.336, §1º CC).
- Juros de 1% ao mês.
- Não pode votar em assembleia enquanto inadimplente.
- A dívida pode ser executada judicialmente (ação de cobrança ou execução de título extrajudicial).
- O imóvel pode ser penhorado mesmo sendo bem de família (decisão STJ confirmada).

**Estratégias de gestão:**

- Comunicação preventiva (notificação antes do vencimento).
- Oferta de parcelamento (aprovado em assembleia).
- Cobrança amigável antes da via judicial.
- Negociação via câmara de mediação.

### 4.6 Prestação de Contas

- Obrigação do síndico: anual, em AGO, e quando exigida pelos condôminos.
- Deve incluir: balancetes mensais, demonstrativo de receitas e despesas, extrato do fundo de reserva, cópia de contratos e notas fiscais relevantes.
- Conselho Fiscal emite parecer sobre as contas.
- Documentação deve ser mantida por no mínimo 5 anos.

### 4.7 Seguro Obrigatório

**Base legal:** Art. 1.346 do Código Civil.

- O condomínio é **obrigado** a contratar seguro de incêndio e outros sinistros que causem destruição.
- Valor de cobertura: valor total de reconstrução do edifício.
- Responsabilidade de contratação: síndico.
- Apólice deve ser renovada anualmente e mantida em arquivo.

---

## 5. Gestão de Funcionários e RH

### 5.1 Enquadramento Legal

- O condomínio, ao contratar empregados, equipara-se ao empregador (Art. 2º, §1º, CLT).
- Todos os direitos trabalhistas da CLT se aplicam integralmente.
- O condomínio possui CNPJ e é responsável direto por todas as obrigações trabalhistas.

### 5.2 Cargos e Jornadas Típicas

|Cargo            |Jornada Comum                             |
|-----------------|------------------------------------------|
|Zelador          |8h/dia, 44h/semana; ou 12x36 conforme CCT |
|Porteiro         |12x36 horas (previsto na maioria das CCTs)|
|Vigia / Segurança|12x36 horas                               |
|ASG / Faxineiro  |8h/dia, 44h/semana; ou contrato parcial   |

**Jornada 12x36:** 12 horas de trabalho seguidas por 36 horas de descanso. Pode ser estabelecida por **acordo escrito individual** desde a Reforma Trabalhista de 2017 (antes exigia convenção sindical).

### 5.3 Encargos e Obrigações Trabalhistas

Obrigações do condomínio como empregador:

- Registro em carteira (CTPS digital via eSocial)
- Cadastro no eSocial (obrigatório e pleno para condomínios)
- Monitoramento e envio ao DET (Domicílio Eletrônico Trabalhista) — Decreto 11.905/2024
- Pagamento de salário até o **5º dia útil**
- Recolhimento de FGTS (8% do salário)
- Recolhimento de INSS patronal (20%)
- 13º salário: 1ª parcela até novembro; 2ª até 20 de dezembro
- Férias: 30 dias corridos a cada 12 meses, com adicional de 1/3
- Vale-transporte (salvo convenção)
- Benefícios conforme CCT (Convenção Coletiva de Trabalho) da categoria e município
- Medicina do trabalho: ASO, PCMSO, PPRA (conforme porte)
- Controle de ponto obrigatório

### 5.4 Horas Extras

- Adicional mínimo de **50%** sobre o valor da hora normal (segunda a sábado).
- Adicional de **100%** em domingos e feriados.
- Banco de horas: pode ser estabelecido por acordo individual escrito (mensal, semestral ou anual).
- Compensação mensal: acordo escrito obrigatório.

### 5.5 Terceirização

- Permitida para qualquer atividade após a Reforma Trabalhista (inclusive portaria, limpeza e segurança).
- O condomínio mantém **responsabilidade subsidiária** caso a empresa terceirizada não cumpra obrigações trabalhistas.
- O síndico não pode exercer poder diretivo sobre os funcionários terceirizados (risco de caracterização de vínculo direto).
- Antes de contratar: verificar CNPJ, alvarás, certidões negativas de débito (Receita Federal, Trabalhista), histórico de reclamações.
- No contrato: cláusula obrigando entrega mensal de comprovantes de pagamento (INSS, FGTS, guias de tributos).

### 5.6 Rescisão Contratual

- Prazo de pagamento das verbas rescisórias: **10 dias** após a demissão.
- Distrato (rescisão mútua): trabalhador recebe 80% do FGTS, 50% do aviso prévio e da multa rescisória, mas não tem direito a seguro-desemprego.
- Homologação com sindicato: **não mais obrigatória** desde a Reforma Trabalhista.

### 5.7 Síndico × Funcionário

- O síndico **não** é funcionário do condomínio.
- Não há relação de emprego; não há sujeição à CLT.
- Síndico condômino: pode ser remunerado via pro labore ou isento da taxa condominial, se previsto na convenção ou aprovado em assembleia.
- Síndico profissional: presta serviços via contrato de prestação de serviços (PJ ou autônomo).

---

## 6. Segurança e Controle de Acesso

### 6.1 Modelos de Portaria

**Portaria Presencial (Orgânica):**

- Porteiro funcionário do condomínio (CLT) ou terceirizado.
- Presença física 24 horas ou em turnos.
- Custo mais elevado; vínculo humano com moradores.

**Portaria Remota (Virtual):**

- Central de monitoramento externa opera câmeras, interfones e controles de acesso.
- Crescimento de 24% ao ano no setor (ABESE, 2024).
- Mais de 14 mil condomínios no Brasil já utilizam o modelo.
- Expectativa de crescimento de 25,3% em 2025 (ABESE).
- Tecnologia: câmeras com IA, reconhecimento facial, inteligência para identificar riscos.
- Exige conformidade rigorosa com a LGPD.
- **Atenção:** Distrito Federal proibiu por lei; SP tem PL em discussão (nº 906/2023).

**Portaria Híbrida:**

- Combinação de porteiro presencial em horários de pico + monitoramento remoto nos demais horários.
- Modelo que equilibra custo e presença humana.

### 6.2 Controle de Acesso

**Tecnologias utilizadas:**

- Interfone analógico e digital (app)
- Tags RFID / crachás
- QR Code para visitantes
- Reconhecimento facial (biometria) — uso cresceu 47% entre 2022 e 2024 (ABESE)
- Leitores de placa veicular (OCR)
- Totens de autoatendimento

**Fluxos de acesso típicos:**

- **Morador:** acesso via tag, facial, ou app sem interação com portaria.
- **Visitante:** liberação pelo morador via app ou interfone; registro de dados (nome, CPF, foto).
- **Prestador de serviço:** autorização prévia ou em tempo real pelo morador; registro obrigatório.
- **Entregador:** gestão via armário inteligente (locker) ou protocolo simplificado.

### 6.3 CFTV (Câmeras de Segurança)

**Regras legais:**

- Câmeras só podem ser instaladas em **áreas comuns** (não em áreas privativas).
- Posicionamento deve evitar captura de interior dos apartamentos.
- Em São Paulo: obrigatoriedade de placas informativas em todos os pontos monitorados (Lei 13.541/2003).
- Acesso às imagens: restrito ao síndico e conselho; apenas autoridades em investigações formais.
- Condomínios NÃO devem fornecer imagens diretamente a condôminos (viola LGPD — TJSP reiterado).
- Armazenamento: período limitado e definido; acesso controlado.
- Treinamento obrigatório para quem manipula as imagens.

**Reconhecimento Facial — atenção especial:**

- Dado biométrico é dado sensível pela LGPD.
- Exige **consentimento explícito e individual** de cada condômino.
- Deve haver **alternativa de acesso** para quem não consente.
- Relatório de Impacto de Proteção de Dados (RIPD) é necessário.
- O condomínio não pode penalizar nem restringir acesso de quem recusar o uso biométrico.

### 6.4 Segurança Perimetral

- Sensores de movimento e intrusão integrados a câmeras e centrais de monitoramento.
- Análise de vídeo por IA: detecção de pessoas, objetos abandonados, comportamentos suspeitos.
- Alarmes perimetrais zonais (cada trecho do perímetro é monitorado independentemente).
- Integração: portaria remota + CFTV + controle de acesso = ecossistema unificado.

---

## 7. Manutenção Predial e Normas Técnicas

### 7.1 Princípio Geral

A manutenção predial é obrigação do síndico (Art. 1.348 CC) e é regida principalmente pela **ABNT NBR 5674:2024**, que exige a criação de um **Plano de Manutenção** com atividades preventivas, corretivas e preditivas, controle de prazos e documentação formal.

### 7.2 Principais Normas ABNT para Condomínios

Existem mais de 100 normas ABNT que impactam condomínios. As mais críticas:

|Norma         |Tema                                                    |
|--------------|--------------------------------------------------------|
|NBR 5674:2024 |Gestão de manutenção de edificações — referência central|
|NBR 5410      |Instalações elétricas de baixa tensão                   |
|NBR 5419      |Proteção contra descargas atmosféricas (SPDA)           |
|NBR 5626      |Instalações prediais de água fria                       |
|NBR 8160      |Instalação predial de esgoto sanitário                  |
|NBR 9050      |Acessibilidade a edificações e espaços                  |
|NBR 9077      |Saídas de emergência em edifícios                       |
|NBR 9441      |Sistemas de detecção e alarme de incêndio               |
|NBR 10818     |Qualidade da água de piscinas                           |
|NBR 12693     |Sistemas de proteção por sprinklers                     |
|NBR 13752     |Perícias de engenharia na construção civil              |
|NBR 14037     |Manual de uso, operação e manutenção da edificação      |
|NBR 15527     |Reaproveitamento de águas pluviais                      |
|NBR 15575-1   |Desempenho de edificações habitacionais                 |
|NBR 16042     |Inspeção semestral de elevadores                        |
|NBR 16071     |Playgrounds — projeto, instalação e manutenção          |
|NBR 16280:2024|Reformas em edificações — sistema de gestão             |
|NBR 16537:2024|Sinalização tátil no piso                               |
|NBR 16747     |Inspeção predial (NBR de vistoria predial)              |
|NBR 16858     |Elevadores de passageiros — segurança                   |

### 7.3 Documentos e Certificações Obrigatórios

|Documento / Certificado                                              |Periodicidade                                       |Responsável                  |
|---------------------------------------------------------------------|----------------------------------------------------|-----------------------------|
|**AVCB** (Auto de Vistoria do Corpo de Bombeiros)                    |3 anos (SP — Decreto 69.118/2024 e IT-01/2025)      |Síndico                      |
|**RIA** (Relatório de Inspeção Anual de Elevadores)                  |Anual (lei municipal em muitas cidades)             |Empresa de manutenção        |
|**Limpeza e análise bacteriológica de caixa d'água**                 |Semestral (recomendação) ou conforme norma municipal|Empresa especializada        |
|**Recarga de extintores**                                            |Anual + após uso                                    |Empresa certificada          |
|**Ensaio hidrostático de extintores**                                |A cada 5 anos                                       |Empresa certificada          |
|**Inspeção da rede de gás**                                          |Anual                                               |Empresa habilitada           |
|**Certificado de Brigada de Incêndio**                               |Anual                                               |Treinamento coletivo         |
|**PMOC** (Plano de Manutenção, Operação e Controle — ar-condicionado)|Conforme RDC ANVISA                                 |Empresa especializada        |
|**Desinsetização / Desratização**                                    |Semestral (mínimo)                                  |Empresa habilitada           |
|**Seguro de incêndio**                                               |Anual (renovação)                                   |Síndico (obrigatório por lei)|
|**ART/RRT de obras e reformas**                                      |A cada obra/reforma                                 |Engenheiro/Arquiteto         |
|**Laudo de impermeabilização**                                       |Conforme vistoria predial                           |Engenheiro                   |

### 7.4 Manutenção de Elevadores

- **NBR 16042:** inspeções **semestrais** obrigatórias por empresa credenciada.
- **NBR 16083:** manutenção preventiva mensal.
- **NBR NM 313:** requisitos de acessibilidade.
- Normas ISO 8100-1 e 8100-2 em implementação (2025–2028).
- Descumprimento: multas, interdição e responsabilização civil do síndico.

### 7.5 Reformas em Unidades Privativas

**Base: ABNT NBR 16280:2024**

- Morador deve comunicar o síndico **antes** de iniciar qualquer reforma.
- Reformas que impactem estrutura, hidráulica, elétrica ou fachada exigem laudo técnico com **ART** (engenheiro) ou **RRT** (arquiteto).
- O síndico deve analisar e autorizar formalmente.
- Prazo e processo devem estar definidos no regimento interno.

### 7.6 Vistoria Predial (NBR 16747)

- Avalia condições de segurança, habitabilidade e manutenção da edificação.
- Resultado orienta o Plano de Manutenção.
- Periodicidade recomendada: anual (prédios com até 5 anos), bienal (5 a 15 anos), anual novamente (acima de 15 anos).
- Realizada por engenheiro ou arquiteto habilitado.
- Gera relatório técnico que deve ser arquivado e disponibilizado ao condomínio.

---

## 8. Conformidade com LGPD

### 8.1 Enquadramento do Condomínio

- O condomínio é **controlador de dados pessoais** nos termos da LGPD (Lei 13.709/2018).
- Síndico e administradora respondem **solidariamente** por violações.
- Multas: até **2% do faturamento** (para entidades com fins lucrativos) ou até **R$ 50 milhões** por infração.
- Para condomínios: a aplicação é inequívoca; responsabilidade civil e administrativa é clara (Art. 42 e 52 LGPD).

### 8.2 Categorias de Dados Tratados pelo Condomínio

**Dados comuns:**

- Nome, CPF, RG, endereço, contato de moradores e proprietários.
- Dados de visitantes e prestadores: nome, CPF, foto, placa de veículo, horário de acesso.
- Dados de funcionários: integrais para fins trabalhistas.

**Dados sensíveis (exigem base legal específica e atenção redobrada):**

- Dados biométricos (reconhecimento facial, impressão digital).
- Dados de saúde (afastamentos, atestados).
- Imagens de câmeras que permitam identificação de pessoas.

### 8.3 Obrigações Práticas

- Elaborar **Política de Privacidade** do condomínio.
- Mapear todos os fluxos de dados pessoais (portaria, câmeras, eSocial, comunicados).
- Definir base legal para cada tratamento (legítimo interesse, obrigação legal, consentimento).
- Para dados biométricos: **consentimento livre, informado e inequívoco** de cada titular.
- Oferecer alternativa de acesso para quem não consente com biometria.
- Implantar **RIPD** (Relatório de Impacto em Proteção de Dados) para sistemas de reconhecimento facial.
- Garantir direitos dos titulares: acesso, correção, exclusão, portabilidade — prazo de resposta: **15 dias úteis**.
- Treinar porteiros, zeladores e equipe administrativa para lidar com solicitações de dados.
- Contratos com terceiros (administradora, empresa de portaria remota, fornecedores de sistemas): incluir cláusulas de proteção de dados.
- Câmeras: placas informativas visíveis; armazenamento limitado; acesso restrito ao síndico e conselho.

### 8.4 Risco de Compartilhamento de Imagens

- **Imagens de câmeras são dados pessoais** (Art. 5º, I, LGPD).
- Fornecer imagens diretamente a condôminos (mesmo vítimas de infrações) **viola a LGPD**.
- Procedimento correto: acionar autoridades (polícia, MP) que solicitam formalmente ao condomínio.
- TJSP: já decidiu que fornecimento indevido de imagens viola direitos de personalidade, gerando dever de indenizar.

---

## 9. Comunicação e Relacionamento com Moradores

### 9.1 Canais de Comunicação

#### Tipos de Canal

|Canal                          |Uso Principal                                                                            |Formalidade       |
|-------------------------------|-----------------------------------------------------------------------------------------|------------------|
|Aplicativo do condomínio       |Comunicados, votações, reservas, ocorrências, boletos, enquetes                          |Digital / Formal  |
|Push notification (app)        |Alertas urgentes, lembretes de vencimento, confirmações                                  |Digital / Imediato|
|E-mail                         |Comunicados formais, convocações de assembleia, prestação de contas                      |Formal            |
|SMS                            |Alertas críticos (falta de água, emergência, inadimplência)                              |Urgente           |
|Mural físico / Quadro de avisos|Avisos gerais nas áreas comuns (elevador, hall)                                          |Físico / Informal |
|Circulares impressas           |Convocações formais quando exigido pela convenção                                        |Físico / Formal   |
|Grupos de WhatsApp             |Comunicados informais; risco de desordem e conflitos — não recomendado como canal oficial|Informal          |
|Interfone / App de portaria    |Controle de acesso, comunicação com portaria                                             |Operacional       |

#### Tipos de Comunicado

|Tipo                      |Descrição                                                               |Exemplos                                                    |
|--------------------------|------------------------------------------------------------------------|------------------------------------------------------------|
|**Aviso Geral**           |Informação sem ação requerida, para todos os moradores                  |Interrupção de água, obra agendada, manutenção de elevador  |
|**Aviso Segmentado**      |Informação para subconjunto de moradores (bloco, andar, tipo de unidade)|Problema no bloco B, manutenção no 5º andar                 |
|**Convocação**            |Chamado formal para assembleia ou reunião                               |AGO, AGE, reunião de conselho                               |
|**Notificação Financeira**|Alertas sobre cobranças, vencimentos, inadimplência                     |Boleto disponível, cobrança vencida, acordo aprovado        |
|**Alerta de Segurança**   |Comunicados urgentes de segurança patrimonial                           |Tentativa de invasão, falha no portão, câmera offline       |
|**Comunicado Normativo**  |Mudanças em regras, regimento, convenção                                |Nova regra de uso da piscina, mudança no horário de silêncio|
|**Resposta a Ocorrência** |Retorno formal ao morador sobre uma reclamação registrada               |Atualização de status, resolução, prazo estimado            |

#### Configurações de Notificação por Morador

Cada morador deve poder configurar preferências individuais:

- Canais habilitados (app, e-mail, SMS)
- Tipos de notificação que deseja receber
- Horários permitidos para notificações (ex: não receber push após 22h)
- Frequência de resumos (diário, semanal)

#### Regras de Comunicação

- **RN-COM-001:** Convocações de assembleia devem ser enviadas pelo canal formal definido na convenção (geralmente e-mail + app + mural).
- **RN-COM-002:** Comunicados sobre inadimplência devem ser enviados exclusivamente ao proprietário/responsável pela unidade, nunca em grupos coletivos.
- **RN-COM-003:** Comunicados devem ter confirmação de leitura registrada (read receipt) para fins de comprovação.
- **RN-COM-004:** O histórico de todos os comunicados enviados deve ser arquivado com data, hora, destinatários e conteúdo.
- **RN-COM-005:** Alertas de emergência (falta de água, gás, estrutura) devem disparar simultaneamente em todos os canais ativos.

---

### 9.2 Reserva de Espaços e Áreas de Lazer

#### Conceito

A reserva de áreas comuns é um direito do condômino adimplente, regulamentado pelo regimento interno. O sistema deve garantir que não haja sobreposição de reservas, que as regras de uso sejam aplicadas automaticamente e que o processo seja transparente para todos os moradores.

#### Tipos de Áreas Comuns Reserváveis

|Área                          |Características Típicas                                                                |
|------------------------------|---------------------------------------------------------------------------------------|
|Salão de Festas               |Capacidade definida; reserva por período (manhã/tarde/noite); taxa de limpeza ou caução|
|Churrasqueira / Espaço Gourmet|Geralmente acoplado ao salão; pode ter reserva independente                            |
|Quadra Poliesportiva          |Horários fixos (ex: 1h por reserva); sem taxa                                          |
|Piscina                       |Pode ter horários exclusivos ou apenas controle de lotação                             |
|Salão de Jogos / Cinema       |Reserva por hora; capacidade limitada                                                  |
|Espaço Coworking              |Reserva por hora ou meio período; uso individual ou grupo                              |
|Espaço Pet                    |Reserva opcional ou livre conforme regimento                                           |
|Área de Churrasco Descoberta  |Mesmas regras do espaço gourmet                                                        |
|Quadra de Tênis               |Horários; pode exigir cadastro de convidados                                           |

#### Fluxo de Reserva

```
Morador acessa app
       ↓
Seleciona área e data
       ↓
Sistema verifica: disponibilidade + inadimplência + limite de reservas
       ↓
   [Bloqueado] → Notificação de motivo (indisponível / inadimplente / limite atingido)
       ↓
   [Disponível] → Morador confirma → Reserva criada
       ↓
Confirmação enviada + dados adicionados ao calendário compartilhado
       ↓
Lembrete automático (ex: 24h e 2h antes)
       ↓
Após uso: checklist de vistoria (opcional) + liberação da área
```

#### Regras de Negócio — Reserva

- **RN-RES-001:** Condômino inadimplente não pode realizar novas reservas.
- **RN-RES-002:** Cada unidade pode ter no máximo N reservas ativas por mês (N definido no regimento interno).
- **RN-RES-003:** Cancelamentos devem respeitar prazo mínimo (ex: 24h de antecedência) para não gerar penalidade.
- **RN-RES-004:** Cancelamento tardio ou não comparecimento pode gerar bloqueio temporário de novas reservas (conforme regimento).
- **RN-RES-005:** Reservas para datas com mais de 30 dias de antecedência devem exigir confirmação próximo à data (ex: 7 dias antes).
- **RN-RES-006:** Moradores convidados (não condôminos) só podem acessar a área reservada acompanhados do condômino reservante ou com autorização prévia registrada.
- **RN-RES-007:** A área reservada deve ser entregue limpa e em conformidade com o checklist de saída; descumprimento gera cobrança de taxa de limpeza.
- **RN-RES-008:** Conflito de reservas (erro de sistema) deve ser resolvido pelo síndico; o segundo reservante recebe prioridade na próxima data disponível.
- **RN-RES-009:** Reservas em feriados ou fins de semana podem ter regras diferenciadas (taxa adicional, horário reduzido).

---

### 9.3 Ocorrências e Reclamações

#### Conceito

Ocorrência é qualquer relato formal de um morador sobre problema, infração, irregularidade ou solicitação que requer resposta ou ação da administração. É instrumento essencial de gestão e transparência, e seu registro protege tanto o morador quanto o síndico.

#### Categorias de Ocorrências

|Categoria                      |Subcategorias / Exemplos                                                                  |
|-------------------------------|------------------------------------------------------------------------------------------|
|**Barulho e Perturbação**      |Música alta, obras fora do horário, festas após limite, animais, brigas                   |
|**Descumprimento de Regras**   |Uso indevido de área comum, fumar em área proibida, animais sem coleira, vagas irregulares|
|**Manutenção / Infraestrutura**|Vazamento, lâmpada queimada, elevador com defeito, portão com falha, infiltração          |
|**Segurança**                  |Porta de emergência travada, câmera offline, suspeito no condomínio, acesso indevido      |
|**Limpeza e Conservação**      |Área comum suja, lixo fora do horário, entulho abandonado                                 |
|**Conduta de Funcionários**    |Reclamação sobre porteiro, zelador, prestador de serviço                                  |
|**Danos a Áreas Comuns**       |Equipamento danificado, pichação, vandalismo                                              |
|**Sugestões e Melhorias**      |Propostas de melhoria, pedidos de novos serviços                                          |
|**Financeiro**                 |Contestação de cobrança, dúvida sobre boleto, pedido de acordo                            |
|**Outros**                     |Assuntos não enquadrados nas categorias acima                                             |

#### SLA (Prazo de Resposta por Prioridade)

|Prioridade |Critério                                                       |Prazo de 1ª Resposta|Prazo de Resolução                  |
|-----------|---------------------------------------------------------------|--------------------|------------------------------------|
|**Crítica**|Risco à vida, segurança ou estrutura                           |Imediato (até 1h)   |Até 24h ou acionamento de emergência|
|**Alta**   |Falha de equipamento essencial (elevador, portão, bomba d'água)|Até 4h              |Até 48h                             |
|**Média**  |Perturbação, limpeza, manutenção não urgente                   |Até 24h             |Até 7 dias                          |
|**Baixa**  |Sugestões, dúvidas, melhorias estéticas                        |Até 48h             |Até 30 dias ou próxima assembleia   |

#### Regras de Negócio — Ocorrências

- **RN-OCO-001:** Toda ocorrência registrada deve receber protocolo único imediatamente.
- **RN-OCO-002:** O reclamante deve receber notificação automática a cada mudança de status.
- **RN-OCO-003:** Ocorrências de segurança com prioridade crítica devem notificar o síndico via push e SMS simultaneamente.
- **RN-OCO-004:** O síndico não pode arquivar uma ocorrência sem registrar a resolução adotada.
- **RN-OCO-005:** Ocorrências de manutenção devem gerar automaticamente uma Ordem de Serviço vinculada.
- **RN-OCO-006:** Notificações de infração ao regimento interno devem ter comprovante de entrega registrado (para validade em eventual cobrança de multa).
- **RN-OCO-007:** O histórico de ocorrências de uma unidade deve ser consultável pelo síndico para análise de reincidência.
- **RN-OCO-008:** Ocorrências anônimas são permitidas apenas para denúncias; reclamações que gerem multa ao infrator exigem identificação do reclamante.

---

### 9.4 Enquetes

#### Regras de Negócio — Enquetes

- **RN-ENQ-001:** Enquetes são **não vinculantes**; seus resultados não substituem votação em assembleia para decisões que exigem quórum legal.
- **RN-ENQ-002:** Cada unidade (não cada pessoa) tem direito a um único voto por enquete, salvo configuração diferente.
- **RN-ENQ-003:** O prazo mínimo de uma enquete deve ser de 48 horas para garantir participação razoável.
- **RN-ENQ-004:** Enquetes podem ser anônimas ou nominais; a configuração deve ser informada antes da participação.
- **RN-ENQ-005:** Enquetes anônimas: o sistema registra que a unidade votou, mas não associa o voto à identidade do morador.
- **RN-ENQ-006:** O resultado de enquetes deve ser publicado para todos os moradores do condomínio após o encerramento.
- **RN-ENQ-007:** Enquetes não podem ser editadas após o início da votação; apenas canceladas (com notificação de cancelamento e motivo).
- **RN-ENQ-008:** Condôminos inadimplentes podem participar de enquetes (diferente de assembleias, onde perdem o direito de voto).
- **RN-ENQ-009:** Enquetes de satisfação com o síndico ou administradora devem ter participação garantida a todos os moradores, sem restrição.

---

### 9.5 Encomendas e Delivery

- Gestão de encomendas: protocolo de recebimento, notificação ao morador, prazo de retirada.
- Tendência: armários inteligentes (lockers) para retirada autônoma 24h.
- Delivery: políticas de acesso de entregadores (acesso à portaria apenas, sem acesso aos andares).

---

## 10. Tecnologia e Digitalização

### 10.1 Categorias de Sistemas para Condomínios

|Categoria                        |Funcionalidades                                                  |
|---------------------------------|-----------------------------------------------------------------|
|**ERP Condominial**              |Financeiro, boletos, prestação de contas, contratos, eSocial     |
|**App do Morador**               |Comunicados, reservas, ocorrências, acesso digital, votações     |
|**Portaria / Controle de Acesso**|CFTV, reconhecimento facial, QR code, interfone digital          |
|**Manutenção Predial**           |Ordens de serviço, check-lists, alertas de vencimento, documentos|
|**Segurança**                    |Monitoramento 24h, análise de vídeo por IA, alertas de intrusão  |
|**Comunicação**                  |Notificações push, e-mail, mural digital                         |

### 10.2 Tendências e Inovações (2025–2026)

- **IA na segurança:** análise de vídeo em tempo real, detecção de comportamentos anômalos, previsão de riscos.
- **Portaria remota com IA:** centrais redundantes, IA para triagem de acesso.
- **Assembleias digitais:** votação online com validação biométrica ou de identidade.
- **Automação de cobranças:** geração automática de notificações de inadimplência, parcelamentos, acordos.
- **Veículos elétricos:** infraestrutura de recarga em condomínios (norma SP em desenvolvimento, 2025).
- **Sustentabilidade:** reuso de água pluvial (NBR 15527), energia solar, medição individualizada de água.
- **Armários inteligentes (lockers):** gestão autônoma de encomendas e delivery.

---

## 11. Domínio de Dados — Entidades e Atributos

> Os nomes de campos nas entidades abaixo seguem a versão em inglês (`knowledge-base.md`), que é a referência canônica para implementação.
> Esta seção é mantida em português para facilitar a leitura pelos membros do time.

Consulte [`knowledge-base.md` — Seção 11](knowledge-base.md#11-data-domain--entities-and-attributes) para as definições completas e canônicas das entidades.

---

## 12. Regras de Negócio Críticas

### Comunicação

- **RN-COM-001:** Convocações de assembleia devem ser enviadas pelo canal formal definido na convenção (e-mail + app + mural).
- **RN-COM-002:** Comunicados sobre inadimplência devem ser enviados exclusivamente ao responsável pela unidade, nunca em grupos coletivos.
- **RN-COM-003:** Todo comunicado deve ter confirmação de leitura registrada para fins de comprovação legal.
- **RN-COM-004:** O histórico de todos os comunicados enviados deve ser arquivado com data, destinatários e conteúdo.
- **RN-COM-005:** Alertas de emergência devem disparar simultaneamente em todos os canais ativos (app + SMS + e-mail).

### Reserva de Espaços

- **RN-RES-001:** Condômino inadimplente não pode realizar novas reservas de áreas comuns.
- **RN-RES-002:** Cada unidade pode ter no máximo N reservas ativas por mês, conforme regimento.
- **RN-RES-003:** Cancelamentos fora do prazo mínimo (padrão: 24h) geram penalidade conforme regimento.
- **RN-RES-004:** Não comparecimento sem cancelamento pode gerar bloqueio temporário de novas reservas.
- **RN-RES-005:** Área com manutenção ativa deve ser bloqueada automaticamente para novas reservas.
- **RN-RES-006:** Conflito de reservas deve ser resolvido pelo síndico; segundo reservante recebe prioridade na próxima data disponível.
- **RN-RES-007:** A disponibilidade no calendário deve ser pública (livre/ocupado), mas sem expor o nome do reservante.

### Ocorrências e Reclamações

- **RN-OCO-001:** Toda ocorrência registrada deve receber protocolo único imediatamente.
- **RN-OCO-002:** O reclamante deve receber notificação automática a cada mudança de status.
- **RN-OCO-003:** Ocorrências de segurança com prioridade crítica devem notificar o síndico via push e SMS simultaneamente.
- **RN-OCO-004:** O síndico não pode arquivar uma ocorrência sem registrar a resolução adotada.
- **RN-OCO-005:** Ocorrências de manutenção devem gerar automaticamente uma Ordem de Serviço vinculada.
- **RN-OCO-006:** Notificações de infração ao regimento devem ter comprovante de entrega registrado (para validade em eventual multa).
- **RN-OCO-007:** O histórico de ocorrências de uma unidade deve ser consultável pelo síndico para análise de reincidência.

### Enquetes

- **RN-ENQ-001 a RN-ENQ-007:** Ver Seção 9.4.
- **RN-FIN-001:** A cota condominial vencida gera multa de 2% + juros de 1% ao mês automaticamente.
- **RN-FIN-002:** Condômino com débito em aberto não pode votar em assembleia.
- **RN-FIN-003:** O fundo de reserva não pode ser utilizado para despesas ordinárias previstas no orçamento.
- **RN-FIN-004:** A previsão orçamentária deve ser aprovada em AGO antes de entrar em vigor.
- **RN-FIN-005:** O fundo de reserva deve ter conta bancária separada da conta corrente operacional.
- **RN-FIN-006:** O seguro de incêndio é obrigatório; sua ausência expõe o síndico a responsabilidade pessoal.

### Governança

- **RN-GOV-001:** Alterações na Convenção exigem aprovação de 2/3 de TODOS os condôminos.
- **RN-GOV-002:** A pauta de assembleia é fechada; apenas itens do edital podem ser votados.
- **RN-GOV-003:** O síndico nunca pode presidir a própria assembleia.
- **RN-GOV-004:** Convocações de assembleia por condôminos requerem representação de pelo menos 1/4 do total.
- **RN-GOV-005:** A ata de assembleia que altera a convenção deve ser registrada em cartório.
- **RN-GOV-006:** O mandato do síndico é de no máximo 2 anos, renovável.

### Segurança e Acesso

- **RN-SEG-001:** O uso de biometria facial exige consentimento individual e explícito; deve haver meio alternativo de acesso.
- **RN-SEG-002:** Imagens de câmeras só podem ser compartilhadas com autoridades via requisição formal; nunca diretamente a condôminos.
- **RN-SEG-003:** Dados de visitantes devem ter prazo de retenção definido e ser excluídos após o período.
- **RN-SEG-004:** Câmeras não podem ser posicionadas de modo a capturar áreas privativas.

### Manutenção

- **RN-MAN-001:** AVCB vencido expõe o síndico a responsabilização pessoal por qualquer sinistro.
- **RN-MAN-002:** Elevadores devem ter manutenção preventiva mensal e inspeção semestral documentadas.
- **RN-MAN-003:** Reformas em unidades privativas que afetem estrutura, hidráulica ou elétrica exigem ART/RRT antes do início.
- **RN-MAN-004:** Documentos de manutenção devem ser arquivados por no mínimo 5 anos.

### Trabalhista

- **RN-RH-001:** Todo funcionário CLT deve ser registrado no eSocial antes do início das atividades.
- **RN-RH-002:** O síndico não tem vínculo empregatício com o condomínio.
- **RN-RH-003:** Funcionários terceirizados não podem receber ordens diretas do síndico (risco de vínculo empregatício).
- **RN-RH-004:** Pagamento de verbas rescisórias deve ocorrer em até 10 dias após o desligamento.

---

## 13. Glossário Condominial

|Termo                   |Definição                                                                                                                                                       |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
|**AVCB**                |Auto de Vistoria do Corpo de Bombeiros. Certificado de conformidade com normas de segurança contra incêndio.                                                    |
|**ART**                 |Anotação de Responsabilidade Técnica. Documento emitido por engenheiro ao CREA para obras e laudos.                                                             |
|**RRT**                 |Registro de Responsabilidade Técnica. Equivalente do ART para arquitetos (CAU).                                                                                 |
|**AGO**                 |Assembleia Geral Ordinária. Realizada ao menos uma vez por ano.                                                                                                 |
|**AGE**                 |Assembleia Geral Extraordinária. Convocada para temas urgentes ou fora do ciclo anual.                                                                          |
|**Convenção**           |Estatuto do condomínio. Documento registrado em cartório que define regras de convivência e administração.                                                      |
|**Regimento Interno**   |Normas de uso cotidiano das áreas comuns; pode ser parte da convenção ou documento separado.                                                                    |
|**Fração Ideal**        |Percentual da área comum que corresponde a cada unidade privativa. Base para cálculo de contribuições e votos.                                                  |
|**Cota Condominial**    |Taxa mensal paga por cada unidade para custeio das despesas do condomínio.                                                                                      |
|**Fundo de Reserva**    |Reserva financeira do condomínio para despesas emergenciais e extraordinárias.                                                                                  |
|**Inadimplência**       |Situação de não pagamento da cota condominial. Implica multa, juros e suspensão do direito de voto.                                                             |
|**Pro Labore**          |Remuneração do síndico pelos serviços de gestão, quando previsto.                                                                                               |
|**Quórum**              |Número mínimo de condôminos necessário para que uma assembleia ou votação seja válida.                                                                          |
|**Maioria Simples**     |50% + 1 dos presentes na assembleia.                                                                                                                            |
|**Maioria Absoluta**    |50% + 1 de TODOS os condôminos do condomínio.                                                                                                                   |
|**CCT**                 |Convenção Coletiva de Trabalho. Acordo entre sindicato de trabalhadores e de empregadores que define direitos e pisos salariais por categoria e região.         |
|**eSocial**             |Sistema do governo federal que centraliza informações trabalhistas, previdenciárias e fiscais dos empregados. Obrigatório para condomínios com funcionários CLT.|
|**DET**                 |Domicílio Eletrônico Trabalhista. Canal oficial de comunicação entre o Ministério do Trabalho e os empregadores (Decreto 11.905/2024).                          |
|**PCMSO**               |Programa de Controle Médico de Saúde Ocupacional. Obrigatório para condomínios com funcionários.                                                                |
|**PPRA**                |Programa de Prevenção de Riscos Ambientais. Complementar ao PCMSO.                                                                                             |
|**CIPA**                |Comissão Interna de Prevenção de Acidentes. Obrigatória em condomínios com determinado número de funcionários.                                                  |
|**LGPD**                |Lei Geral de Proteção de Dados (Lei 13.709/2018). Regula o tratamento de dados pessoais no Brasil.                                                              |
|**RIPD**                |Relatório de Impacto à Proteção de Dados. Documento obrigatório para tratamento de dados sensíveis (ex: biometria).                                             |
|**CFTV**                |Circuito Fechado de TV. Sistema de câmeras de segurança.                                                                                                        |
|**RIA**                 |Relatório de Inspeção Anual de Elevadores. Obrigatório em muitos municípios.                                                                                    |
|**PMOC**                |Plano de Manutenção, Operação e Controle. Obrigatório para sistemas de ar-condicionado conforme norma ANVISA.                                                   |
|**Síndico Profissional**|Síndico externo (não morador), contratado como prestador de serviços para gestão profissional do condomínio.                                                    |
|**Administradora**      |Empresa contratada para suporte administrativo, financeiro e operacional do síndico.                                                                            |
|**Portaria Remota**     |Modelo de portaria sem presença física, operada por central de monitoramento via câmeras, interfones e IA.                                                      |
|**NBR**                 |Norma Brasileira. Documento técnico publicado pela ABNT (Associação Brasileira de Normas Técnicas).                                                             |
|**Área Comum**          |Partes do condomínio de uso coletivo (hall, piscina, salão, garagem coletiva, escadas, etc.).                                                                   |
|**Área Privativa**      |Unidade autônoma de uso exclusivo do condômino (apartamento, sala, vaga vinculada).                                                                             |

---

## 14. Arquitetura Multi-Tenancy

Consulte [`knowledge-base.md` — Seção 14](knowledge-base.md#14-multi-tenancy-architecture) para a versão canônica desta seção.

O ZenAndVillage opera em um modelo **multi-tenant hierárquico**:

```
Plataforma (ZenAndVillage)
└── Tenant (Administradora | Condomínio Independente)
    └── Condomínio
        └── Bloco
            └── Unidade
                └── Morador / Proprietário / Inquilino
```

As regras de isolamento, papéis, planos, assinaturas, white-label, auditoria e ciclo de vida do tenant seguem integralmente a especificação da versão em inglês.

---

## 15. Gestão de Patrimônio Condominial

O **patrimônio condominial** é o conjunto de bens móveis e imóveis de propriedade coletiva do condomínio.

**Responsabilidade legal:** o síndico é responsável pela guarda, conservação e controle (Art. 1.348, V, CC). A venda ou descarte de bens de valor relevante exige deliberação em assembleia.

As entidades, regras de negócio, fluxo de ciclo de vida, categorias de bens e tabelas de depreciação seguem integralmente a especificação da versão em inglês ([`knowledge-base.md` — Seção 15](knowledge-base.md#15-condominium-asset-management)).

**Regras de negócio resumidas:**

- **RN-PAT-001 a RN-PAT-009:** Ver versão canônica em inglês.

---

## 16. Gestão de Estoque de Itens de Consumo

Itens de consumo são materiais utilizados nas operações cotidianas do condomínio que se esgotam com o uso e precisam de reposição periódica (diferente do patrimônio, que são bens duráveis).

As entidades, regras de negócio, fluxo de gestão, controle de validade, ponto de pedido e relatórios seguem integralmente a especificação da versão em inglês ([`knowledge-base.md` — Seção 16](knowledge-base.md#16-consumable-inventory-management)).

**Regras de negócio resumidas:**

- **RN-EST-001 a RN-EST-009:** Ver versão canônica em inglês.

---

## Referências

- Código Civil Brasileiro — Lei nº 10.406/2002 (Arts. 1.331 a 1.358)
- Lei nº 4.591/1964 — Lei de Condomínios e Incorporações Imobiliárias
- Lei nº 8.245/1991 — Lei do Inquilinato
- Lei nº 13.709/2018 — Lei Geral de Proteção de Dados (LGPD)
- CLT — Decreto-Lei nº 5.452/1943 e Reforma Trabalhista (Lei 13.467/2017)
- Decreto nº 11.905/2024 — DET e obrigações trabalhistas
- ABNT NBR 5674:2024 — Manutenção de Edificações
- ABNT NBR 16280:2024 — Reformas em Edificações
- Decreto Estadual nº 69.118/2024 (SP) e IT-01/2025 — AVCB
- ABESE — Panorama do Mercado de Segurança Eletrônica 2024/2025
- SíndicoNet, Direcional Condomínios, Migalhas Edilicias — Jurisprudência e boas práticas
- STJ — Jurisprudência condominial (vagas de garagem, 2024)
- TJSP — Jurisprudência LGPD em condomínios (2024–2025)

---

*Documento para uso interno de desenvolvimento. Revisar periodicamente para manter atualização com alterações legislativas e normativas. Última revisão: Maio 2026 — v1.4.*
