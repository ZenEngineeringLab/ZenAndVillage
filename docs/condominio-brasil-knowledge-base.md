---
inclusion: always
---

# Base de Conhecimento: Administração de Condomínios no Brasil

**Projeto:** ZenAndVillage — AI-powered SaaS for Smart Condominium & Community Management
**Organização:** ZenEngineeringLab
**Versão:** 1.4
**Data:** Maio 2026
**Finalidade:** Referência estruturada para desenvolvimento automatizado por IA via SDD (Spec-Driven Development)

-----

## Índice

1. [Estrutura Legal e Regulatória](#1-estrutura-legal-e-regulatória)
1. [Atores e Papéis](#2-atores-e-papéis)
1. [Governança e Assembleias](#3-governança-e-assembleias)
1. [Gestão Financeira](#4-gestão-financeira)
1. [Gestão de Funcionários e RH](#5-gestão-de-funcionários-e-rh)
1. [Segurança e Controle de Acesso](#6-segurança-e-controle-de-acesso)
1. [Manutenção Predial e Normas Técnicas](#7-manutenção-predial-e-normas-técnicas)
1. [Conformidade com LGPD](#8-conformidade-com-lgpd)
1. [Comunicação e Relacionamento com Moradores](#9-comunicação-e-relacionamento-com-moradores)
1. [Tecnologia e Digitalização](#10-tecnologia-e-digitalização)
1. [Domínio de Dados — Entidades e Atributos](#11-domínio-de-dados--entidades-e-atributos)
1. [Regras de Negócio Críticas](#12-regras-de-negócio-críticas)
1. [Glossário Condominial](#13-glossário-condominial)
1. [Arquitetura Multi-Tenancy](#14-arquitetura-multi-tenancy)
1. [Gestão de Patrimônio Condominial](#15-gestão-de-patrimônio-condominial)
1. [Gestão de Estoque de Itens de Consumo](#16-gestão-de-estoque-de-itens-de-consumo)

-----

## 1. Estrutura Legal e Regulatória

### 1.1 Legislação Principal

|Lei / Norma                                 |Descrição                                                                                                                                            |Âmbito  |
|--------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|--------|
|**Lei nº 4.591/1964**                       |Lei de Condomínios e Incorporações Imobiliárias. Marco fundador. Regula constituição, incorporação e aspectos estruturais do condomínio.             |Nacional|
|**Lei nº 10.406/2002 — Código Civil**       |Arts. 1.331 a 1.358: “Condomínio Edilício”. Regula o dia a dia condominial — direitos, deveres, assembleias, síndico, convenção. Em vigor desde 2003.|Nacional|
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

-----

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

-----

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

-----

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

- Funciona como “poupança” do condomínio para cobrir despesas emergenciais não previstas no orçamento ordinário.
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
1. Mapear e categorizar todas as despesas: fixas, variáveis, emergenciais, fundo de reserva.
1. Estimar reajustes: inflação (IPCA/IGPM), pisos salariais, contratos de serviço.
1. Calcular taxa de inadimplência histórica e projetar impacto no fluxo de caixa.
1. Calcular o fundo de reserva necessário.
1. Definir a cota condominial justa e equilibrada.
1. Apresentar e aprovar em **Assembleia Geral Ordinária**.

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

-----

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

-----

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

-----

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
|**Limpeza e análise bacteriológica de caixa d’água**                 |Semestral (recomendação) ou conforme norma municipal|Empresa especializada        |
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
- Periodocidade recomendada: anual (prédios com até 5 anos), bienal (5 a 15 anos), anual novamente (acima de 15 anos).
- Realizada por engenheiro ou arquiteto habilitado.
- Gera relatório técnico que deve ser arquivado e disponibilizado ao condomínio.

-----

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

-----

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

#### Entidade: `Comunicado`

```
id, condominio_id,
titulo, conteudo, tipo (aviso_geral | segmentado | convocacao | financeiro | seguranca | normativo | resposta_ocorrencia),
remetente_id (sindico | administradora | sistema),
destinatarios (todos | bloco | unidades_especificas | inadimplentes),
canais_envio: [app | email | sms | mural_digital],
data_publicacao, data_expiracao?,
prioridade (normal | urgente | critica),
requer_confirmacao_leitura (bool),
confirmacoes_leitura: [{morador_id, data_hora}],
anexos: [url],
status (rascunho | agendado | enviado | expirado)
```

-----

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

#### Calendário de Disponibilidade

- Visível para todos os moradores (somente o status: livre/ocupado, sem identificar o reservante por privacidade).
- Administrador pode bloquear datas para manutenção, eventos do condomínio, etc.
- Integração com sistema de ocorrências: área com manutenção pendente fica automaticamente bloqueada.

#### Entidade: `AreaComum`

```
id, condominio_id, nome, descricao,
tipo (salao_festas | churrasqueira | quadra | piscina | coworking | cinema | pet | outro),
capacidade_maxima, capacidade_convidados_max,
permite_reserva (bool),
antecedencia_min_horas, antecedencia_max_dias,
cancelamento_min_horas,
limite_reservas_mes_por_unidade,
taxa_uso?, taxa_limpeza?, valor_caucao?,
horario_abertura, horario_fechamento,
dias_disponiveis: [seg|ter|qua|qui|sex|sab|dom],
requer_checklist_saida (bool),
instrucoes_uso, fotos: [url],
status (ativa | em_manutencao | desativada)
```

#### Entidade: `ReservaAreaComum` (expandida)

```
id, condominio_id, area_id, unidade_id, morador_id,
data_reserva, hora_inicio, hora_fim,
num_convidados_esperados,
taxa_cobrada?, caucao_retida?,
status (pendente | confirmada | cancelada | realizada | nao_compareceu),
motivo_cancelamento?, cancelado_por?,
data_cancelamento?,
checklist_saida_url?,
taxa_limpeza_aplicada?,
observacoes,
notificacoes_enviadas: [{tipo, data_hora}]
```

-----

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

#### Fluxo de uma Ocorrência

```
Morador registra ocorrência (app/e-mail/presencial)
       ↓
Sistema gera protocolo único + notifica síndico/administradora
       ↓
Responsável analisa e categoriza
       ↓
   [Infração de regra] → Notificação formal ao infrator + prazo para regularização
   [Manutenção]       → Abertura de OS (Ordem de Serviço) vinculada
   [Segurança]        → Alerta imediato + acionamento de protocolo
   [Sugestão]         → Registrada para pauta de assembleia ou decisão da gestão
       ↓
Atualizações de status enviadas automaticamente ao reclamante
       ↓
Resolução → Síndico registra encerramento com descrição da solução
       ↓
Morador pode confirmar resolução ou contestar (reabrir ocorrência)
       ↓
Ocorrência arquivada com histórico completo
```

#### SLA (Prazo de Resposta por Prioridade)

|Prioridade |Critério                                                       |Prazo de 1ª Resposta|Prazo de Resolução                  |
|-----------|---------------------------------------------------------------|--------------------|------------------------------------|
|**Crítica**|Risco à vida, segurança ou estrutura                           |Imediato (até 1h)   |Até 24h ou acionamento de emergência|
|**Alta**   |Falha de equipamento essencial (elevador, portão, bomba d’água)|Até 4h              |Até 48h                             |
|**Média**  |Perturbação, limpeza, manutenção não urgente                   |Até 24h             |Até 7 dias                          |
|**Baixa**  |Sugestões, dúvidas, melhorias estéticas                        |Até 48h             |Até 30 dias ou próxima assembleia   |


> Os prazos acima são referência de boas práticas; o regimento interno pode definir SLAs próprios.

#### Processo de Aplicação de Multa por Infração

Quando a ocorrência envolve descumprimento do regimento:

1. **1ª ocorrência:** Notificação formal por escrito (advertência); prazo para regularização.
1. **2ª ocorrência (mesmo tipo):** Notificação + multa prevista no regimento (base: Art. 1.336 CC — até 5x a cota condominial por descumprimento).
1. **Reincidência:** Multa + possibilidade de convocação de assembleia para deliberação sobre penalidades adicionais.
1. **Comportamento antissocial grave (Art. 1.337 CC):** Assembleia pode deliberar multa de até **10x a cota condominial**.

> A multa por infração de regimento é diferente da multa por inadimplência. Ambas têm natureza condominial e podem ser cobradas judicialmente.

#### Regras de Negócio — Ocorrências

- **RN-OCO-001:** Toda ocorrência registrada deve receber protocolo único imediatamente.
- **RN-OCO-002:** O reclamante deve receber notificação automática a cada mudança de status.
- **RN-OCO-003:** Ocorrências do tipo segurança com prioridade crítica devem notificar o síndico via push e SMS simultaneamente.
- **RN-OCO-004:** O síndico não pode arquivar uma ocorrência sem registrar a resolução adotada.
- **RN-OCO-005:** Ocorrências de manutenção devem gerar automaticamente uma Ordem de Serviço vinculada.
- **RN-OCO-006:** Notificações de infração ao regimento interno devem ter comprovante de entrega registrado (para validade em eventual cobrança de multa).
- **RN-OCO-007:** O histórico de ocorrências de uma unidade deve ser consultável pelo síndico para análise de reincidência.
- **RN-OCO-008:** Ocorrências anônimas são permitidas apenas para denúncias; reclamações que gerem multa ao infrator exigem identificação do reclamante.

#### Entidade: `Ocorrencia`

```
id, condominio_id, protocolo (único, gerado automaticamente),
unidade_origem_id, morador_id,
categoria (barulho | descumprimento | manutencao | seguranca | limpeza | funcionario | danos | sugestao | financeiro | outro),
subcategoria?,
titulo, descricao, evidencias: [url],
data_registro, hora_registro,
prioridade (critica | alta | media | baixa),
anonima (bool),
unidade_alvo_id? (unidade sobre quem é a reclamação, se aplicável),
responsavel_id? (síndico ou gestor designado),
os_vinculada_id? (ordem de serviço, se manutenção),
status (registrada | em_analise | em_andamento | aguardando_infrator | resolvida | arquivada | reaberta),
historico_status: [{status, data_hora, responsavel_id, descricao}],
notificacao_infrator_enviada (bool),
multa_aplicada?, valor_multa?,
data_resolucao?,
descricao_resolucao?,
avaliacao_morador? (1–5),
comentario_avaliacao?
```

-----

### 9.4 Enquetes

#### Conceito

Enquetes são consultas não vinculantes realizadas pelo síndico ou administração para coletar a opinião dos moradores sobre temas de interesse coletivo. Diferem das **votações de assembleia** (que têm força deliberativa legal) por serem instrumentos de escuta e planejamento, sem gerar obrigações jurídicas.

#### Finalidades Típicas

- Levantar preferências antes de propor uma pauta em assembleia (ex: “Prefere portaria remota ou presencial?”)
- Avaliar satisfação com serviços contratados (limpeza, segurança, administradora)
- Decidir temas de uso cotidiano sem necessidade de assembleia (ex: cor do mural, horário da academia)
- Priorizar obras ou melhorias quando há múltiplas opções e orçamento limitado
- Coletar sugestões de pauta para a próxima AGO
- Pesquisa de satisfação periódica com a gestão do síndico

#### Tipos de Enquete

|Tipo                     |Descrição                             |Exemplos                                          |
|-------------------------|--------------------------------------|--------------------------------------------------|
|**Escolha Única**        |Morador escolhe uma entre N opções    |“Qual empresa de limpeza prefere?”                |
|**Múltipla Escolha**     |Morador escolhe uma ou mais opções    |“Quais melhorias deseja para 2026?”               |
|**Escala de Satisfação** |Avaliação numérica (1 a 5 ou NPS 0–10)|“Como avalia o atendimento da portaria?”          |
|**Pergunta Aberta**      |Campo de texto livre                  |“Qual sua sugestão para melhorar a área de lazer?”|
|**Ranking / Priorização**|Morador ordena opções por preferência |“Classifique as obras por prioridade”             |

#### Fluxo de uma Enquete

```
Síndico cria enquete (título, pergunta, tipo, opções, prazo, público-alvo)
       ↓
Sistema publica e notifica os moradores elegíveis
       ↓
Moradores respondem dentro do prazo (app ou e-mail)
       ↓
Sistema registra respostas (com ou sem identificação, conforme configuração)
       ↓
Prazo encerrado → resultados compilados automaticamente
       ↓
Síndico analisa resultados + decide próximo passo
       ↓
Resultado publicado para todos os participantes (transparência)
```

#### Regras de Negócio — Enquetes

- **RN-ENQ-001:** Enquetes são **não vinculantes**; seus resultados não substituem votação em assembleia para decisões que exigem quórum legal.
- **RN-ENQ-002:** Cada unidade (não cada pessoa) tem direito a um único voto por enquete, salvo configuração diferente.
- **RN-ENQ-003:** O prazo mínimo de uma enquete deve ser de 48 horas para garantir participação razoável.
- **RN-ENQ-004:** Enquetes podem ser anônimas (resultado sem identificação) ou nominais (síndico vê quem votou em quê); a configuração deve ser informada antes da participação.
- **RN-ENQ-005:** Enquetes anônimas: o sistema registra que a unidade votou, mas não associa o voto à identidade do morador.
- **RN-ENQ-006:** O resultado de enquetes deve ser publicado para todos os moradores do condomínio após o encerramento.
- **RN-ENQ-007:** Enquetes não podem ser editadas após o início da votação; apenas canceladas (com notificação de cancelamento e motivo).
- **RN-ENQ-008:** Condôminos inadimplentes podem participar de enquetes (diferente de assembleias, onde perdem o direito de voto).
- **RN-ENQ-009:** Enquetes de satisfação com o síndico ou administradora devem ter participação garantida a todos os moradores, sem restrição.

#### Entidade: `Enquete`

```
id, condominio_id,
titulo, descricao, objetivo?,
tipo (escolha_unica | multipla_escolha | escala | aberta | ranking),
opcoes: [{id, texto, ordem}]?, (nulo para pergunta aberta)
escala_min?, escala_max?, escala_labels?,
criador_id,
publico_alvo (todos | proprietarios | inquilinos | bloco_especifico),
anonima (bool),
data_inicio, data_fim,
status (rascunho | ativa | encerrada | cancelada),
motivo_cancelamento?,
resultado_publicado (bool),
total_elegíveis, total_respondentes,
resultados: [{opcao_id, contagem, percentual}],
respostas_abertas: [{unidade_id?, texto}]?
```

#### Entidade: `RespostaEnquete`

```
id, enquete_id, unidade_id,
morador_id? (nulo se anônima),
data_hora_resposta,
opcoes_escolhidas: [opcao_id],
valor_escala?,
texto_aberto?,
ranking_opcoes: [{opcao_id, posicao}]?
```

-----

### 9.5 Encomendas e Delivery

- Gestão de encomendas: protocolo de recebimento, notificação ao morador, prazo de retirada.
- Tendência: armários inteligentes (lockers) para retirada autônoma 24h.
- Delivery: políticas de acesso de entregadores (acesso à portaria apenas, sem acesso aos andares).

-----

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

- **IA na segurança:** análise de vídeo em tempo real, detecção de comportamentos anômalos, previsão de riscos — de 54% para 64,3% das soluções incluindo IA (ABESE, 2024).
- **Portaria remota com IA:** centrais redundantes, IA para triagem de acesso.
- **Assembleias digitais:** votação online com validação biométrica ou de identidade.
- **Automação de cobranças:** geração automática de notificações de inadimplência, parcelamentos, acordos.
- **Veículos elétricos:** infraestrutura de recarga em condomínios (norma SP em desenvolvimento, 2025).
- **Sustentabilidade:** reuso de água pluvial (NBR 15527), energia solar, medição individualizada de água.
- **Armários inteligentes (lockers):** gestão autônoma de encomendas e delivery.

### 10.3 Integração de Sistemas

Arquitetura ideal para plataforma de gestão condominial:

```
[App Morador] ←→ [Plataforma Central] ←→ [Sistema Financeiro/ERP]
                         ↕
             [Controle de Acesso / Portaria]
                         ↕
               [CFTV / IA de Segurança]
                         ↕
            [Módulo de Manutenção Predial]
                         ↕
             [Módulo Trabalhista / eSocial]
```

-----

## 11. Domínio de Dados — Entidades e Atributos

Esta seção define as entidades centrais do domínio de negócio para modelagem de dados e geração de código via SDD.

### Entidade: `Condominio`

```
id, nome, cnpj, endereco, cidade, estado, cep,
tipo (residencial | comercial | misto),
num_unidades, num_blocos, num_andares,
area_total_m2, fracao_ideal_base,
data_inauguracao, matricula_imovel,
convenção_url, regimento_url,
status (ativo | inativo)
```

### Entidade: `Unidade`

```
id, condominio_id, bloco, andar, numero,
tipo (apartamento | sala | loja | vaga),
area_privativa_m2, fracao_ideal,
vaga_garagem_vinculada,
status_ocupacao (proprio | alugado | vago)
```

### Entidade: `Condômino` (Proprietário)

```
id, nome, cpf, rg, email, telefone,
unidade_id, data_aquisicao,
status_financeiro (adimplente | inadimplente),
is_sindico, is_conselho
```

### Entidade: `Inquilino`

```
id, nome, cpf, email, telefone,
unidade_id, data_inicio_contrato, data_fim_contrato,
contrato_url
```

### Entidade: `Funcionario`

```
id, condominio_id, nome, cpf, pis_pasep,
cargo (zelador | porteiro | asg | vigia | recepcionista),
tipo_contrato (clt_direto | terceirizado),
empresa_terceirizada_id?,
data_admissao, data_demissao?,
salario_base, jornada (44h | 12x36 | parcial),
status (ativo | inativo | afastado)
```

### Entidade: `Assembleia`

```
id, condominio_id, tipo (ago | age),
data, hora_inicio, hora_fim,
formato (presencial | virtual | hibrido),
link_acesso?,
pauta_itens: [{titulo, quorum_necessario, resultado_votacao}],
ata_url, status (convocada | realizada | cancelada)
```

### Entidade: `CobrancaCondominial`

```
id, unidade_id, competencia (MM/YYYY),
valor_cota, valor_fundo_reserva, valor_extras,
valor_total, data_vencimento,
status (pendente | pago | vencido | acordo),
data_pagamento?, multa?, juros?,
boleto_url
```

### Entidade: `OcorrenciaManutencao`

```
id, condominio_id, tipo (preventiva | corretiva | emergencial),
local, descricao, prioridade (baixa | media | alta | critica),
data_abertura, data_conclusao?,
responsavel_id?, fornecedor_id?,
custo_estimado?, custo_real?,
status (aberta | em_andamento | concluida | cancelada),
documentos: [url]
```

### Entidade: `DocumentoLegal`

```
id, condominio_id, tipo (avcb | seguro | ria_elevador | caixa_dagua | extintor | brigada | ...),
descricao, data_emissao, data_vencimento,
empresa_responsavel, arquivo_url,
status (valido | vencido | a_vencer)
```

### Entidade: `RegistroAcesso`

```
id, condominio_id, unidade_destino_id?,
tipo_pessoa (morador | visitante | prestador | entregador),
pessoa_id?, nome_visitante?, cpf_visitante?,
data_hora_entrada, data_hora_saida?,
metodo_acesso (tag | facial | qr_code | manual | app),
autorizado_por_id?,
foto_url?,
veiculo_placa?
```

### Entidade: `Comunicado`

```
id, condominio_id,
titulo, conteudo,
tipo (aviso_geral | segmentado | convocacao | financeiro | seguranca | normativo | resposta_ocorrencia),
remetente_id,
destinatarios (todos | bloco | unidades_especificas | inadimplentes),
canais_envio: [app | email | sms | mural_digital],
data_publicacao, data_expiracao?,
prioridade (normal | urgente | critica),
requer_confirmacao_leitura (bool),
confirmacoes_leitura: [{morador_id, data_hora}],
anexos: [url],
status (rascunho | agendado | enviado | expirado)
```

### Entidade: `AreaComum`

```
id, condominio_id, nome, descricao,
tipo (salao_festas | churrasqueira | quadra | piscina | coworking | cinema | pet | outro),
capacidade_maxima, capacidade_convidados_max,
permite_reserva (bool),
antecedencia_min_horas, antecedencia_max_dias,
cancelamento_min_horas,
limite_reservas_mes_por_unidade,
taxa_uso?, taxa_limpeza?, valor_caucao?,
horario_abertura, horario_fechamento,
dias_disponiveis: [seg|ter|qua|qui|sex|sab|dom],
requer_checklist_saida (bool),
instrucoes_uso, fotos: [url],
status (ativa | em_manutencao | desativada)
```

### Entidade: `ReservaAreaComum`

```
id, condominio_id, area_id, unidade_id, morador_id,
data_reserva, hora_inicio, hora_fim,
num_convidados_esperados,
taxa_cobrada?, caucao_retida?,
status (pendente | confirmada | cancelada | realizada | nao_compareceu),
motivo_cancelamento?, cancelado_por?,
data_cancelamento?,
checklist_saida_url?,
taxa_limpeza_aplicada?,
observacoes,
notificacoes_enviadas: [{tipo, data_hora}]
```

### Entidade: `Ocorrencia`

```
id, condominio_id, protocolo,
unidade_origem_id, morador_id,
categoria (barulho | descumprimento | manutencao | seguranca | limpeza | funcionario | danos | sugestao | financeiro | outro),
subcategoria?,
titulo, descricao, evidencias: [url],
data_registro, hora_registro,
prioridade (critica | alta | media | baixa),
anonima (bool),
unidade_alvo_id?,
responsavel_id?,
os_vinculada_id?,
status (registrada | em_analise | em_andamento | aguardando_infrator | resolvida | arquivada | reaberta),
historico_status: [{status, data_hora, responsavel_id, descricao}],
notificacao_infrator_enviada (bool),
multa_aplicada?, valor_multa?,
data_resolucao?,
descricao_resolucao?,
avaliacao_morador?,
comentario_avaliacao?
```

### Entidade: `Enquete`

```
id, condominio_id,
titulo, descricao, objetivo?,
tipo (escolha_unica | multipla_escolha | escala | aberta | ranking),
opcoes: [{id, texto, ordem}]?,
escala_min?, escala_max?, escala_labels?,
criador_id,
publico_alvo (todos | proprietarios | inquilinos | bloco_especifico),
anonima (bool),
data_inicio, data_fim,
status (rascunho | ativa | encerrada | cancelada),
motivo_cancelamento?,
resultado_publicado (bool),
total_elegiveis, total_respondentes,
resultados: [{opcao_id, contagem, percentual}],
respostas_abertas: [{unidade_id?, texto}]?
```

### Entidade: `RespostaEnquete`

```
id, enquete_id, unidade_id,
morador_id?,
data_hora_resposta,
opcoes_escolhidas: [opcao_id],
valor_escala?,
texto_aberto?,
ranking_opcoes: [{opcao_id, posicao}]?
```

-----

## 12. Regras de Negócio Críticas

Esta seção lista as regras de negócio mais relevantes para implementação em sistemas de IA e automação.

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

- **RN-ENQ-001:** Enquetes são não vinculantes e não substituem votação em assembleia para deliberações legais.
- **RN-ENQ-002:** Cada unidade tem direito a um único voto por enquete, salvo configuração diferente.
- **RN-ENQ-003:** O prazo mínimo de uma enquete é de 48 horas.
- **RN-ENQ-004:** Enquetes anônimas registram que a unidade votou, mas não associam voto à identidade.
- **RN-ENQ-005:** Resultado de enquetes deve ser publicado para todos os moradores após o encerramento.
- **RN-ENQ-006:** Enquetes não podem ser editadas após início da votação; apenas canceladas com notificação de motivo.
- **RN-ENQ-007:** Condôminos inadimplentes podem participar de enquetes (diferente de assembleias formais).
- **RN-FIN-001:** A cota condominial vencida gera multa de 2% + juros de 1% ao mês automaticamente após a data de vencimento.
- **RN-FIN-002:** Condômino com débito em aberto não pode votar em assembleia (flag `status_financeiro = inadimplente`).
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

-----

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
|**PPRA**                |Programa de Prevenção de Riscos Ambientais. Complementar ao PCMSO.                                                                                              |
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

-----

## 14. Arquitetura Multi-Tenancy

Esta seção define o modelo de multi-tenancy do ZenAndVillage como plataforma SaaS B2B2C, cobrindo hierarquia de tenants, isolamento de dados, planos, permissões e regras de operação entre níveis.

-----

### 14.1 Visão Geral do Modelo

O ZenAndVillage opera em um modelo **multi-tenant hierárquico**, onde um único deployment da plataforma serve múltiplos clientes completamente isolados. O “cliente” pode ser uma administradora de condomínios (que gerencia vários condomínios) ou um condomínio auto-gerido (com síndico independente).

```
┌─────────────────────────────────────────────┐
│            ZENANDVILLAGE PLATFORM            │
│                  (SaaS Layer)                │
└──────────────┬──────────────────────────────┘
               │
   ┌───────────┼────────────┐
   ▼           ▼            ▼
[Tenant A]  [Tenant B]   [Tenant C]
Administr.  Administr.   Condomínio
XYZ         ABC          Independente
   │           │
 ┌─┴─┐       ┌─┴─┐
[C1][C2]   [C3][C4]
Cond.      Cond.
```

**Tenant de nível 1 — Administradora:**
Empresa que gerencia N condomínios na plataforma. Tem visão consolidada, pode ter branding próprio (white-label) e configura padrões que os condomínios filhos herdam.

**Tenant de nível 1 — Condomínio Independente:**
Condomínio auto-gerido, sem administradora vinculada. Síndico acessa diretamente sem intermediário.

**Tenant de nível 2 — Condomínio:**
Sempre filho de uma administradora ou independente. Unidade operacional mínima com dados, usuários e configurações próprias.

-----

### 14.2 Hierarquia de Tenants

```
Platform (ZenAndVillage)
└── Tenant (Administradora | Condomínio Independente)
    └── Condomínio
        └── Bloco
            └── Unidade
                └── Morador / Proprietário / Inquilino
```

|Nível |Entidade     |Descrição                                                                                  |
|------|-------------|-------------------------------------------------------------------------------------------|
|**L0**|Platform     |A própria plataforma ZenAndVillage; acesso exclusivo da equipe ZenEngineeringLab           |
|**L1**|Tenant       |Administradora de condomínios ou condomínio independente (contrato direto com a plataforma)|
|**L2**|Condomínio   |Unidade operacional; sempre pertence a um Tenant L1                                        |
|**L3**|Bloco / Torre|Agrupamento físico dentro do condomínio (opcional)                                         |
|**L4**|Unidade      |Apartamento, sala, loja, vaga                                                              |
|**L5**|Usuário Final|Morador, proprietário, inquilino — vinculado a uma ou mais unidades                        |

-----

### 14.3 Estratégia de Isolamento de Dados

O isolamento garante que nenhum tenant acesse dados de outro tenant, mesmo em caso de falha de autorização.

#### Modelo Recomendado: Schema-per-Tenant + Row-Level Security

|Estratégia                  |Descrição                                                          |Adequação para ZenAndVillage                         |
|----------------------------|-------------------------------------------------------------------|-----------------------------------------------------|
|**Database-per-Tenant**     |Cada tenant tem seu próprio banco de dados                         |Alta segurança; alto custo operacional para N tenants|
|**Schema-per-Tenant**       |Mesmo banco; schemas separados por tenant                          |Bom equilíbrio segurança/custo; recomendado          |
|**Row-Level Security (RLS)**|Mesmo schema; tenant_id em todas as tabelas com RLS no banco       |Mais econômico; exige disciplina de implementação    |
|**Híbrido**                 |Schema-per-tenant para dados sensíveis; RLS para dados operacionais|Solução ideal para plataformas em crescimento        |

**Regra de ouro:** O `tenant_id` (ou `condominio_id`) deve estar presente em **todas** as tabelas de dados e em **todas** as queries. Nunca realizar queries sem filtro de tenant.

#### Campos de Isolamento por Camada

```sql
-- Toda entidade operacional deve ter:
tenant_id       UUID NOT NULL  -- Identifica o L1 (administradora ou independente)
condominio_id   UUID NOT NULL  -- Identifica o L2

-- Índices compostos obrigatórios:
INDEX (tenant_id, condominio_id, <chave_entidade>)
```

-----

### 14.4 Hierarquia de Usuários e Permissões

Cada usuário pertence a um ou mais níveis da hierarquia e tem um papel (*role*) que define suas permissões.

#### Papéis (Roles) por Nível

|Role              |Nível|Capacidades                                                                |
|------------------|-----|---------------------------------------------------------------------------|
|`platform_admin`  |L0   |Acesso total à plataforma; gestão de tenants, planos, suporte              |
|`platform_support`|L0   |Acesso de leitura para suporte; sem alterar dados de tenant                |
|`tenant_owner`    |L1   |Proprietário da conta do tenant; configura plano, cobrança, usuários L1    |
|`tenant_admin`    |L1   |Administrador da administradora; acesso a todos os condomínios do tenant   |
|`tenant_viewer`   |L1   |Leitura consolidada dos dados de todos os condomínios do tenant            |
|`condo_syndic`    |L2   |Síndico do condomínio; gestão completa daquele condomínio                  |
|`condo_manager`   |L2   |Gestor delegado (ex: funcionário da administradora designado ao condomínio)|
|`condo_council`   |L2   |Conselheiro fiscal; acesso a relatórios financeiros daquele condomínio     |
|`condo_staff`     |L2   |Funcionário interno (zelador, porteiro); acesso operacional limitado       |
|`resident_owner`  |L4/L5|Proprietário de unidade; acesso aos recursos do morador                    |
|`resident_tenant` |L4/L5|Inquilino; acesso aos recursos do morador (sem financeiro do proprietário) |

#### Regras de Herança de Permissões

- `tenant_admin` tem acesso implícito a todos os condomínios do seu tenant.
- `condo_syndic` tem acesso somente ao(s) condomínio(s) ao qual está vinculado.
- Um usuário pode ter roles diferentes em condomínios diferentes (ex: síndico no Cond. A, conselheiro no Cond. B).
- Moradores só acessam dados da(s) própria(s) unidade(s); nunca dados de outras unidades.
- Cross-tenant: **estritamente proibido**; nenhum usuário de um tenant pode acessar dados de outro tenant, nem mesmo `platform_support` sem autorização explícita e auditada.

#### Entidade: `Usuario`

```
id, email, nome, cpf?,
senha_hash, mfa_habilitado (bool),
status (ativo | inativo | bloqueado | pendente_verificacao),
data_criacao, ultimo_acesso?,
roles: [{
  role,
  tenant_id,
  condominio_id?,  (nulo para roles de nível tenant)
  unidade_id?,     (nulo para roles de nível condomínio)
  data_inicio, data_fim?
}],
preferencias_notificacao: {canais, horarios, tipos}
```

-----

### 14.5 Planos e Assinaturas

O modelo de comercialização é baseado em assinaturas do Tenant (L1), com limites por plano que se aplicam ao conjunto de condomínios gerenciados.

#### Dimensões de Limitação por Plano

|Dimensão              |Descrição                                               |
|----------------------|--------------------------------------------------------|
|`max_condominios`     |Número máximo de condomínios ativos no tenant           |
|`max_unidades_total`  |Total de unidades somadas em todos os condomínios       |
|`max_usuarios_admin`  |Número de usuários com roles L1/L2 (síndicos, gestores) |
|`modulos_habilitados` |Lista de módulos disponíveis para o tenant              |
|`retencao_dados_meses`|Por quantos meses os dados são retidos (histórico)      |
|`suporte_nivel`       |Nível de SLA de suporte (básico, prioritário, dedicado) |
|`white_label`         |Personalização de marca habilitada (bool)               |
|`api_access`          |Acesso à API REST para integrações (bool)               |
|`assembleia_digital`  |Módulo de assembleias digitais habilitado (bool)        |
|`ia_insights`         |Módulo de insights e automações por IA habilitado (bool)|

#### Módulos da Plataforma

|Módulo              |Descrição                                                 |
|--------------------|----------------------------------------------------------|
|`financeiro`        |Cobrança, boletos, previsão orçamentária, inadimplência   |
|`portaria_acesso`   |Controle de acesso, visitantes, QR Code                   |
|`comunicacao`       |Comunicados, notificações push, mural digital             |
|`reservas`          |Reserva de áreas comuns                                   |
|`ocorrencias`       |Registro e gestão de reclamações e ocorrências            |
|`enquetes`          |Criação e gestão de enquetes                              |
|`manutencao`        |Ordens de serviço, checklist, documentos técnicos         |
|`rh_trabalhista`    |Gestão de funcionários, eSocial, folha                    |
|`assembleia_digital`|Assembleias e votações online                             |
|`documentos`        |Armazenamento e gestão de documentos legais               |
|`ia_insights`       |Relatórios inteligentes, alertas preditivos, IA assistente|
|`white_label`       |Personalização de marca, domínio customizado, tema        |

#### Entidade: `Plano`

```
id, nome, descricao,
preco_mensal, preco_anual,
max_condominios, max_unidades_total, max_usuarios_admin,
modulos_habilitados: [modulo_id],
retencao_dados_meses,
suporte_nivel (basico | prioritario | dedicado),
white_label (bool),
api_access (bool),
status (ativo | descontinuado),
publico (bool)   -- se aparece na página de preços
```

#### Entidade: `Tenant`

```
id, nome, tipo (administradora | condominio_independente),
cnpj, email_contato, telefone,
responsavel_nome, responsavel_email,
plano_id, status_assinatura (trial | ativa | inadimplente | cancelada | suspensa),
data_inicio_assinatura, data_fim_trial?,
ciclo_cobranca (mensal | anual),
white_label_config?: {
  nome_plataforma, logo_url, cor_primaria, cor_secundaria,
  dominio_customizado, email_remetente_customizado
},
limites_uso: {
  condominios_ativos, unidades_total, usuarios_admin
},
status (ativo | suspenso | cancelado)
```

#### Entidade: `Assinatura`

```
id, tenant_id, plano_id,
data_inicio, data_fim?,
ciclo (mensal | anual),
valor_contratado, desconto?,
status (trial | ativa | vencida | cancelada),
historico_pagamentos: [{data, valor, status, referencia}],
proxima_cobranca?,
metodo_pagamento (cartao | boleto | pix | transferencia)
```

-----

### 14.6 White-Label e Personalização

Tenants com o módulo `white_label` habilitado podem personalizar a experiência para seus condomínios:

- **Nome da plataforma:** substituir “ZenAndVillage” pelo nome da administradora
- **Logotipo:** logo próprio exibido no app e nos e-mails
- **Paleta de cores:** cores primária e secundária da identidade visual
- **Domínio customizado:** app acessível em `gestao.administradoraxyz.com.br`
- **E-mail remetente:** comunicados enviados de `noreply@administradoraxyz.com.br`
- **Splash screen customizada:** tela de carregamento do app mobile

**Regras white-label:**

- **RN-WL-001:** A personalização é por tenant (L1); todos os condomínios do tenant herdam o mesmo branding.
- **RN-WL-002:** Condomínios independentes sem white-label usam a identidade padrão ZenAndVillage.
- **RN-WL-003:** O rodapé do app deve sempre manter referência discreta “Powered by ZenAndVillage” mesmo em white-label (exceto planos enterprise com contrato específico).

-----

### 14.7 Operações Cross-Tenant (Administradora)

Usuários com role `tenant_admin` têm acesso unificado a todos os condomínios do seu tenant. Isso permite:

- **Dashboard consolidado:** visão de inadimplência, ocorrências abertas, documentos vencidos e manutenções pendentes de todos os condomínios em um único painel.
- **Relatórios agregados:** extratos financeiros, benchmarks entre condomínios (ex: custo médio por unidade, taxa de inadimplência média).
- **Gestão de usuários centralizada:** criar/revogar acessos de síndicos e gestores em qualquer condomínio do tenant.
- **Templates compartilhados:** modelos de regulamentos, comunicados, checklist de manutenção reutilizáveis entre condomínios.
- **Calendário multi-condomínio:** visualizar vencimentos de AVCB, seguros e outros documentos de todos os condomínios em um único calendário.

**Regras cross-tenant:**

- **RN-CT-001:** `tenant_admin` nunca acessa dados de outro tenant, mesmo que seja administradora de condomínios do mesmo grupo empresarial — cada tenant é isolado.
- **RN-CT-002:** Relatórios consolidados só agregam dados dentro do mesmo tenant.
- **RN-CT-003:** Um condomínio não pode ser transferido de tenant sem processo formal de migração com consentimento do síndico responsável.
- **RN-CT-004:** A plataforma (L0) pode acessar qualquer tenant apenas para fins de suporte, com log de auditoria imutável registrado.

-----

### 14.8 Ciclo de Vida do Tenant

```
Cadastro / Trial
      ↓
Ativação (contrato + pagamento)
      ↓
Operação ativa
      ↓
   [Inadimplência] → Notificação → Grace period (ex: 7 dias) → Suspensão
   [Cancelamento]  → Período de graça → Encerramento
      ↓
Suspensão: acesso somente leitura; funcionalidades de escrita bloqueadas
      ↓
Encerramento: dados retidos por prazo contratual → Exportação disponibilizada → Exclusão
```

#### Estados do Tenant

|Status        |Descrição                                |Capacidades                                        |
|--------------|-----------------------------------------|---------------------------------------------------|
|`trial`       |Período gratuito de avaliação            |Acesso completo com limites reduzidos              |
|`ativa`       |Assinatura ativa e em dia                |Acesso completo conforme plano                     |
|`inadimplente`|Pagamento vencido; dentro do grace period|Acesso completo; avisos de cobrança                |
|`suspensa`    |Grace period encerrado sem pagamento     |Somente leitura; sem criação/edição                |
|`cancelada`   |Cancelamento solicitado                  |Somente exportação de dados; sem acesso operacional|

-----

### 14.9 Auditoria e Rastreabilidade

Toda operação na plataforma deve gerar um log de auditoria associado ao tenant e ao usuário responsável.

#### Entidade: `AuditLog`

```
id, tenant_id, condominio_id?,
usuario_id, usuario_role,
acao (create | update | delete | read_sensitive | login | logout | export),
entidade_afetada, entidade_id,
dados_anteriores?: (JSON snapshot),
dados_novos?: (JSON snapshot),
ip_origem, user_agent,
data_hora,
sucesso (bool), motivo_falha?
```

**Regras de auditoria:**

- **RN-AUD-001:** Logs de auditoria são **imutáveis**; nenhum usuário, nem `platform_admin`, pode deletar registros de auditoria.
- **RN-AUD-002:** Ações sensíveis (exportação de dados, alteração de plano, acesso L0 a tenant) devem gerar alerta em tempo real para o `tenant_owner`.
- **RN-AUD-003:** Logs devem ser retidos pelo período definido no plano, com mínimo de 12 meses.
- **RN-AUD-004:** Em caso de incidente de segurança, os logs devem ser suficientes para reconstruir toda a sequência de ações.

-----

### 14.10 Regras de Negócio Gerais — Multi-Tenancy

- **RN-MT-001:** Todo request à API deve validar `tenant_id` antes de qualquer operação de dados.
- **RN-MT-002:** Queries de banco sem filtro de `tenant_id` são proibidas em código de produção.
- **RN-MT-003:** Ao atingir o limite de condomínios ou unidades do plano, novas criações são bloqueadas com mensagem clara de upgrade.
- **RN-MT-004:** Dados de um tenant nunca são visíveis por outro tenant em nenhuma circunstância.
- **RN-MT-005:** Trial não converte em assinatura paga automaticamente; requer ação explícita do `tenant_owner`.
- **RN-MT-006:** Na suspensão, moradores (L5) continuam com acesso de leitura ao app (visualizar boletos, histórico), para não impactar a experiência do usuário final por inadimplência do tenant (administradora).
- **RN-MT-007:** A exclusão de um tenant deve ser precedida de exportação completa dos dados em formato estruturado (JSON/CSV) disponibilizado por no mínimo 30 dias.
- **RN-MT-008:** Módulos não incluídos no plano devem retornar erro `403 Feature not available in current plan` — nunca exibir dados parciais.

-----

## 15. Gestão de Patrimônio Condominial

Esta seção cobre o inventário, controle, manutenção e ciclo de vida dos bens físicos pertencentes ao condomínio — desde grandes equipamentos de infraestrutura até utensílios do salão de festas.

-----

### 15.1 Conceito e Responsabilidade Legal

O **patrimônio condominial** é o conjunto de bens móveis e imóveis de propriedade coletiva do condomínio, adquiridos com recursos da arrecadação condominial e destinados ao uso e benefício de todos os condôminos.

**Responsabilidade legal:**

- O síndico é responsável pela guarda, conservação e controle do patrimônio (Art. 1.348, V, CC).
- A prestação de contas anual deve incluir o estado patrimonial do condomínio.
- Bens adquiridos com recursos do condomínio são propriedade coletiva; o síndico não pode alienar, ceder ou dar em garantia bens do condomínio sem aprovação em assembleia.
- A venda ou descarte de bens patrimoniais de valor relevante exige deliberação em assembleia.

-----

### 15.2 Categorias de Bens Patrimoniais

|Categoria                         |Subcategoria         |Exemplos                                                         |
|----------------------------------|---------------------|-----------------------------------------------------------------|
|**Equipamentos de Infraestrutura**|Elétrico / Hidráulico|Bombas d’água, geradores, quadros elétricos, nobreaks            |
|                                  |Elevação             |Elevadores, plataformas de acessibilidade                        |
|                                  |Climatização         |Ar-condicionado de áreas comuns, exaustores                      |
|                                  |Segurança            |Câmeras CFTV, centrais de alarme, cercas elétricas, interfones   |
|                                  |Portaria / Acesso    |Cancelas, portões automáticos, leitores biométricos, totens      |
|**Equipamentos de Lazer**         |Fitness              |Esteiras, bikes, aparelhos de musculação, pesos, halteres        |
|                                  |Recreação            |Mesas de bilhar, ping-pong, pebolim, videogame, jogos de mesa    |
|                                  |Audiovisual          |TVs, projetores, sistemas de som, home theater, caixas de som    |
|                                  |Piscina              |Bombas, aquecedores, aspiradores, medidores de cloro             |
|**Mobiliário**                    |Salão de Festas      |Mesas, cadeiras, sofás, aparadores, estantes                     |
|                                  |Espaço Gourmet       |Freezers, geladeiras, fornos, fogões, micro-ondas, churrasqueiras|
|                                  |Escritório / Adm     |Mesas, cadeiras, armários, arquivos                              |
|                                  |Áreas Comuns         |Bancos, espreguiçadeiras, guarda-sóis, lixeiras                  |
|**Utensílios e Louças**           |Cozinha              |Talheres, pratos, copos, taças, travessas, panelas, assadeiras   |
|                                  |Limpeza              |Aspiradores, enceradeiras, mangueiras, carrinho de limpeza       |
|                                  |Ferramentas          |Furadeiras, lixadeiras, caixas de ferramenta, escadas            |
|**Equipamentos de TI**            |Administração        |Computadores, impressoras, tablets, roteadores                   |
|                                  |Monitoramento        |Servidores de gravação CFTV, switches de rede                    |
|**Veículos e Outros**             |—                    |Carrinho de mão, carrinhos de mudança, bicicletas comunitárias   |
|**Documentos Físicos**            |—                    |Apólices de seguro, manuais de equipamentos, plantas e projetos  |

-----

### 15.3 Inventário e Tombamento

**Tombamento** é o processo de registro formal de cada bem patrimonial, atribuindo-lhe um identificador único (número de tombamento / etiqueta) e documentando suas características.

#### Informações do Tombamento por Item

- **Número de tombamento:** código único sequencial por condomínio (ex: `COND-2024-00142`)
- **Descrição completa:** nome, marca, modelo, cor, características físicas
- **Categoria e subcategoria**
- **Localização:** área comum onde está alocado (salão, academia, portaria, etc.)
- **Data de aquisição** e **valor de aquisição** com nota fiscal
- **Fornecedor** e número da nota fiscal
- **Garantia:** data de início e término
- **Estado de conservação:** ótimo / bom / regular / ruim / inservível
- **Responsável pela guarda** (zelador, porteiro, administração)
- **Fotos** do estado na inclusão e nas revisões periódicas

#### Inventário Periódico

Realizado ao menos **uma vez por ano**, preferencialmente antes da AGO, para:

- Confirmar a existência física dos bens registrados
- Atualizar o estado de conservação de cada item
- Identificar bens faltantes, danificados ou extraviados
- Subsidiar a prestação de contas ao conselho fiscal

-----

### 15.4 Ciclo de Vida do Bem Patrimonial

```
Aquisição (nota fiscal)
       ↓
Recebimento + Conferência
       ↓
Tombamento (registro + etiqueta física)
       ↓
Alocação na área comum
       ↓
Uso + Manutenção periódica ◄──────────────────┐
       ↓                                        │
Revisão do estado de conservação               │ loop
       ↓                                        │
  [Bom / Regular] ──────────────────────────────┘
       ↓
  [Ruim / Inservível]
       ↓
  Decisão de destino (síndico + conselho)
  Venda de valor relevante → exige assembleia
       ↓              ↓              ↓
    Reparo         Descarte      Alienação
    (OS)        (documentado)  (venda/doação)
                     ↓              ↓
               Baixa patrimonial com registro
```

-----

### 15.5 Depreciação Patrimonial

Boas práticas de gestão recomendam o controle de depreciação para planejar reposição de bens.

|Categoria                                   |Vida Útil Estimada|Taxa Anual Aprox.|
|--------------------------------------------|------------------|-----------------|
|Eletrônicos (TV, projetor, computador)      |3–5 anos          |20–33%           |
|Utensílios e louças                         |3–5 anos          |20–33%           |
|Equipamentos de fitness                     |5–8 anos          |12–20%           |
|Câmeras de segurança / CFTV                 |5–7 anos          |14–20%           |
|Ferramentas                                 |5–10 anos         |10–20%           |
|Eletrodomésticos (freezer, forno, geladeira)|8–10 anos         |10–12%           |
|Portões e cancelas automáticos              |8–10 anos         |10–12%           |
|Mobiliário (mesas, cadeiras, sofás)         |10–15 anos        |7–10%            |
|Equipamentos hidráulicos (bombas)           |10–15 anos        |7–10%            |
|Elevadores                                  |20–25 anos        |4–5%             |


> Valores de referência para planejamento. O condomínio pode adotar tabelas próprias definidas em assembleia.

-----

### 15.6 Tipos de Movimentação Patrimonial

|Tipo                     |Descrição                                               |
|-------------------------|--------------------------------------------------------|
|**Entrada**              |Aquisição, doação, permuta                              |
|**Transferência**        |Mudança de localização dentro do condomínio             |
|**Empréstimo Interno**   |Cessão temporária para uso em evento do condomínio      |
|**Saída para Manutenção**|Bem enviado para reparo externo                         |
|**Retorno de Manutenção**|Bem retornado após reparo                               |
|**Baixa por Descarte**   |Bem inutilizado e descartado                            |
|**Baixa por Alienação**  |Bem vendido, doado ou permutado                         |
|**Baixa por Extravio**   |Bem desaparecido; gera ocorrência vinculada             |
|**Atualização de Estado**|Revisão do estado de conservação sem movimentação física|

-----

### 15.7 Regras de Negócio — Patrimônio

- **RN-PAT-001:** Todo bem adquirido com recursos do condomínio deve ser tombado antes de entrar em uso, com nota fiscal vinculada.
- **RN-PAT-002:** A alienação de bens com valor acima do limite definido na convenção exige aprovação em assembleia.
- **RN-PAT-003:** Bens faltantes no inventário físico devem gerar ocorrência automática de extravio para investigação.
- **RN-PAT-004:** Bens com garantia ativa devem gerar alerta automático 60 dias antes do vencimento.
- **RN-PAT-005:** Nenhum bem pode ser removido do condomínio sem registro de movimentação patrimonial.
- **RN-PAT-006:** Bens com estado “inservível” devem ter destino registrado em até 30 dias.
- **RN-PAT-007:** O relatório de patrimônio deve integrar a prestação de contas anual do síndico.
- **RN-PAT-008:** Dano a bem patrimonial causado por morador ou visitante gera ocorrência vinculada ao item, com possibilidade de cobrança ao responsável.
- **RN-PAT-009:** Itens vinculados a áreas comuns em manutenção devem ser sinalizados como indisponíveis no módulo de reservas.

-----

### 15.8 Entidades

#### Entidade: `ItemPatrimonio`

```
id, condominio_id,
numero_tombamento,        -- único por condomínio, gerado automaticamente
descricao, marca?, modelo?, numero_serie?, cor?,
categoria, subcategoria?,
area_alocacao_id,         -- área comum onde está alocado
data_aquisicao, valor_aquisicao?,
nota_fiscal_url?,
fornecedor_nome?, fornecedor_cnpj?,
garantia_inicio?, garantia_fim?,
vida_util_anos?,
valor_depreciado_atual?,
estado_conservacao (otimo | bom | regular | ruim | inservivel),
responsavel_guarda_id?,
fotos: [url],
observacoes?,
status (ativo | em_manutencao | baixado),
data_baixa?, motivo_baixa?,
documento_baixa_url?
```

#### Entidade: `MovimentacaoPatrimonio`

```
id, condominio_id, item_id,
tipo (entrada | transferencia | emprestimo_interno | saida_manutencao |
      retorno_manutencao | baixa_descarte | baixa_alienacao |
      baixa_extravio | atualizacao_estado),
data_movimentacao,
origem_area_id?,
destino_area_id?,
responsavel_id,
estado_antes?, estado_depois?,
valor_alienacao?, beneficiario_alienacao?,
os_vinculada_id?,
ocorrencia_vinculada_id?,
observacoes, documentos: [url]
```

#### Entidade: `InventarioFisico`

```
id, condominio_id,
data_realizacao,
responsavel_id,
itens_verificados: [{
  item_id,
  encontrado (bool),
  estado_verificado (otimo | bom | regular | ruim | inservivel),
  observacao?
}],
itens_nao_encontrados: [item_id],
status (em_andamento | concluido),
relatorio_url?
```

-----

## 16. Gestão de Estoque de Itens de Consumo

Esta seção trata do controle de materiais de consumo do condomínio — itens que são utilizados nas operações cotidianas, se esgotam com o uso e precisam de reposição periódica. Diferente do patrimônio (bens duráveis), os consumíveis têm ciclo curto e gestão orientada a quantidade, validade e custo.

-----

### 16.1 Distinção entre Patrimônio e Consumível

|Dimensão             |Patrimônio (Seção 15)            |Consumível (Esta Seção)                         |
|---------------------|---------------------------------|------------------------------------------------|
|**Natureza**         |Bem durável; não se esgota no uso|Item de uso contínuo; se esgota ou expira       |
|**Controle**         |Tombamento individual por item   |Controle por produto/SKU e quantidade em estoque|
|**Vida útil**        |Anos                             |Dias a meses                                    |
|**Gestão financeira**|Depreciação, valor residual      |Custo por uso, consumo médio mensal             |
|**Reposição**        |Eventual, por decisão            |Periódica, por nível mínimo de estoque          |
|**Exemplos**         |TV, freezer, talher, furadeira   |Detergente, papel higiênico, cloro, lâmpada     |


> **Nota:** Alguns itens transitam entre as categorias conforme o contexto. Ferramentas manuais simples (esponjas, vassouras) são consumíveis; ferramentas elétricas (aspirador, furadeira) são patrimônio.

-----

### 16.2 Categorias de Itens de Consumo

|Categoria                            |Exemplos                                                                                                                                                                                                                      |
|-------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|**Limpeza e Higiene**                |Detergente, desinfetante, água sanitária, sabão em pó, multiuso, desentupidor, limpa-vidro, cera de piso, desincrustante, pano de chão, esponja, vassoura, rodo, saco de lixo, papel toalha, papel higiênico, sabonete líquido|
|**Jardinagem**                       |Adubo, substrato, inseticida, herbicida, sementes, mudas, fertilizante foliar                                                                                                                                                 |
|**Piscina e Área de Lazer**          |Cloro granulado, algicida, clarificante, pH-minus, pH-plus, flocante, pastilha de cloro                                                                                                                                       |
|**Elétrica e Iluminação**            |Lâmpadas (LED, fluorescente), fusíveis, fita isolante, tomadas, interruptores, cabos                                                                                                                                          |
|**Hidráulica**                       |Veda-rosca, cola PVC, lixa, abraçadeiras, conexões PVC, fita veda-calha, produtos desentupidores                                                                                                                              |
|**Manutenção Geral**                 |Parafusos, pregos, buchas, lixas, massa corrida, tinta para retoques, fita crepe, silicone, cola                                                                                                                              |
|**Escritório / Administração**       |Papel A4, canetas, grampos, clipes, envelopes, cartuchos de impressora, pastas, etiquetas                                                                                                                                     |
|**Segurança e EPI**                  |Luvas descartáveis, máscaras, óculos de proteção, capacetes, sinalizadores de área molhada                                                                                                                                    |
|**Portaria e Recepção**              |Fichas de visitante, etiquetas de identificação, rollos de papel para impressora de acesso                                                                                                                                    |
|**Copa / Refeitório de Funcionários**|Café, açúcar, copo descartável, filtro de papel, detergente de pia                                                                                                                                                            |

-----

### 16.3 Fluxo de Gestão do Estoque

```
Cadastro do produto (SKU, categoria, unidade, estoque mínimo)
                    ↓
         Entrada no estoque
    (compra, doação, transferência)
                    ↓
         Uso / Saída registrada
    (requisição por funcionário ou OS)
                    ↓
         Atualização do saldo em tempo real
                    ↓
    Saldo ≤ estoque mínimo?
         Sim → Alerta de reposição gerado
         Não → Continua monitoramento
                    ↓
    Solicitação de compra
    (gerada automaticamente ou manualmente)
                    ↓
    Aprovação (síndico / zelador conforme alçada)
                    ↓
    Compra realizada → NF registrada → Entrada no estoque
```

-----

### 16.4 Controle de Estoque Mínimo e Ponto de Pedido

- **Estoque mínimo:** quantidade abaixo da qual o condomínio não pode ficar sem risco operacional. Gatilho para alerta de reposição.
- **Estoque máximo:** limite superior para evitar desperdício, vencimento e custo excessivo de capital parado.
- **Ponto de pedido:** quantidade na qual o pedido deve ser disparado, considerando o prazo médio de entrega do fornecedor.
- **Consumo médio mensal:** calculado automaticamente com base no histórico de saídas dos últimos 3–6 meses.

```
Ponto de Pedido = Consumo Médio Diário × Prazo de Entrega (dias) + Estoque Mínimo
```

**Exemplo:**

- Detergente: consumo 2 frascos/dia, prazo entrega 3 dias, estoque mínimo 5 frascos.
- Ponto de pedido = (2 × 3) + 5 = **11 frascos**. Ao atingir 11, dispara o alerta.

-----

### 16.5 Requisição e Saída de Itens

- Toda retirada de item do estoque deve ser registrada por um responsável identificado.
- A requisição pode estar vinculada a uma Ordem de Serviço (manutenção) ou a um centro de custo (limpeza, portaria, administração).
- Isso permite calcular o **custo real por área / atividade**, cruzando com o orçamento previsto.

**Centros de custo típicos:**

- Limpeza e conservação
- Manutenção predial
- Portaria e segurança
- Piscina e lazer
- Jardim e paisagismo
- Administração

-----

### 16.6 Controle de Validade

- Produtos com validade (desinfetantes, cloro, itens de copa, EPI) devem ter data de validade registrada no lote de entrada.
- O sistema deve alertar sobre itens próximos ao vencimento (ex: 30 dias de antecedência).
- Política FIFO (*First In, First Out*): os itens mais antigos são consumidos primeiro.
- Itens vencidos devem ser baixados do estoque com registro do descarte (evitar contabilização como custo de uso).

-----

### 16.7 Gestão de Fornecedores de Consumíveis

- Cada produto pode ter um ou mais fornecedores cadastrados, com preço de referência e prazo de entrega.
- O histórico de compras permite identificar variações de preço e apoiar negociações.
- Cotação prévia: para compras acima de valor definido em assembleia, recomenda-se mínimo de 3 cotações.
- Critérios de avaliação: preço, prazo, qualidade, regularidade fiscal (CNPJ ativo, certidões).

-----

### 16.8 Relatórios e Inteligência de Estoque

|Relatório                        |Finalidade                                                     |
|---------------------------------|---------------------------------------------------------------|
|**Posição de Estoque**           |Saldo atual de todos os itens; identifica críticos e excessos  |
|**Consumo Mensal por Categoria** |Custo real de insumos por mês e por centro de custo            |
|**Histórico de Movimentações**   |Rastreio de entradas, saídas e responsáveis                    |
|**Itens Próximos ao Vencimento** |Alerta preventivo para uso ou descarte                         |
|**Análise de Fornecedores**      |Comparativo de preços e prazos por fornecedor ao longo do tempo|
|**Desvio Orçamentário**          |Comparação entre custo previsto e realizado de consumíveis     |
|**Alertas de Reposição Pendente**|Itens abaixo do ponto de pedido sem compra solicitada          |

-----

### 16.9 Regras de Negócio — Estoque

- **RN-EST-001:** Toda entrada de item deve estar vinculada a uma nota fiscal ou documento de recebimento.
- **RN-EST-002:** Toda saída deve ser registrada com responsável identificado e centro de custo.
- **RN-EST-003:** Ao atingir o ponto de pedido, o sistema deve gerar automaticamente um alerta de reposição para o síndico ou zelador.
- **RN-EST-004:** Itens com validade devem gerar alerta automático 30 dias antes do vencimento.
- **RN-EST-005:** Itens vencidos ou descartados devem ser baixados do estoque com registro de motivo; não podem ser contabilizados como consumo operacional.
- **RN-EST-006:** Compras acima do valor de alçada definido na convenção devem passar por aprovação do síndico antes de serem efetivadas.
- **RN-EST-007:** O custo de consumíveis deve ser classificado por centro de custo e refletir no balancete mensal como despesa ordinária.
- **RN-EST-008:** O relatório de estoque deve integrar a prestação de contas do síndico, demonstrando o gasto real com insumos versus o previsto no orçamento.
- **RN-EST-009:** A política de estoque (mínimo, máximo, ponto de pedido) pode ser configurada por item, respeitando o porte e as necessidades do condomínio.

-----

### 16.10 Entidades

#### Entidade: `ProdutoEstoque`

```
id, condominio_id,
codigo_sku,                   -- código interno único por produto
nome, descricao?,
categoria (limpeza | jardinagem | piscina | eletrica | hidraulica |
           manutencao | escritorio | seguranca | portaria | copa | outro),
unidade_medida (un | kg | l | m | cx | pct | rolo),
tem_validade (bool),
estoque_atual,
estoque_minimo,
estoque_maximo,
ponto_pedido,
consumo_medio_mensal?,        -- calculado automaticamente
fornecedores_preferidos: [{
  fornecedor_id, preco_referencia, prazo_entrega_dias
}],
localizacao_fisica?,          -- onde está guardado no condomínio
foto_url?,
observacoes?,
status (ativo | descontinuado)
```

#### Entidade: `MovimentacaoEstoque`

```
id, condominio_id, produto_id,
tipo (entrada | saida | ajuste | descarte_validade | transferencia),
quantidade, unidade_medida,
saldo_anterior, saldo_posterior,
data_movimentacao,
responsavel_id,
centro_custo (limpeza | manutencao | portaria | piscina | jardim | administracao | outro),
os_vinculada_id?,             -- se saída vinculada a uma Ordem de Serviço
nota_fiscal_url?,             -- se entrada por compra
lote?, data_validade?,
preco_unitario?,
fornecedor_id?,
motivo_ajuste?,               -- para ajustes de inventário
observacoes?
```

#### Entidade: `SolicitacaoCompra`

```
id, condominio_id,
itens: [{
  produto_id, quantidade_solicitada,
  justificativa?, urgente (bool)
}],
solicitante_id,
data_solicitacao,
status (pendente | aprovada | rejeitada | comprada | parcialmente_comprada),
aprovador_id?, data_aprovacao?,
motivo_rejeicao?,
cotacoes: [{
  fornecedor_id, valor_unitario, prazo_entrega, observacao
}],
fornecedor_escolhido_id?,
valor_total_aprovado?,
data_compra?, nota_fiscal_url?
```

#### Entidade: `InventarioEstoque`

```
id, condominio_id,
data_realizacao,
responsavel_id,
itens_contados: [{
  produto_id,
  quantidade_sistema,    -- saldo esperado pelo sistema
  quantidade_fisica,     -- saldo contado fisicamente
  diferenca,             -- física - sistema
  ajuste_aplicado (bool),
  observacao?
}],
status (em_andamento | concluido | com_divergencias),
relatorio_url?
```

-----

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

-----

*Documento gerado para uso interno de desenvolvimento. Revisar periodicamente para manter atualização com alterações legislativas e normativas. Última revisão: Maio 2026 — v1.4 (expansão: Comunicação, Reserva de Espaços, Ocorrências/Reclamações, Enquetes, Multi-Tenancy, Gestão de Patrimônio, Gestão de Estoque de Consumíveis).*