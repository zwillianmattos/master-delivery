
# About

O Master Delivery será uma plataforma unificada para delivery de restaurantes, mercados, farmácias e lojas. O MVP inicial será focado em restaurantes, expandindo posteriormente para outros segmentos. O diferencial será a redução de taxas e a integração eficiente com diferentes serviços.

## **Tecnologias Utilizadas**

### **Frontend**

- **Flutter** → Aplicativos mobile para clientes, lojistas e entregadores.
- **Next.js/Nuxt.js** → Painel web administrativo.

### **Backend**

- **NestJS** → Framework escalável para APIs.
- **Prisma ORM** → Gerenciamento do banco de dados.
- **PostgreSQL** → Banco de dados relacional para pedidos e usuários.
- **MongoDB** → Armazenamento de logs e métricas.
- **Redis** → Cache para performance.
- **Kafka** → Mensageria para comunicação assíncrona.

### **Infraestrutura**

- **Docker + Kubernetes** → Orquestração de serviços.
- **AWS (EC2, RDS, S3, CloudFront)** → Infraestrutura na nuvem.
- **Prometheus + Grafana** → Monitoramento.
- **Cloudflare** → CDN para otimização de carregamento.

## **Arquitetura do Sistema**

### **Frontend (Apps & Painel Web)**

- **App Cliente** → Usuários fazem pedidos e acompanham entregas.
- **App Lojista** → Restaurantes gerenciam cardápios e pedidos.
- **App Entregador** → Recebimento de chamadas e tracking de entregas.
- **Painel Web** → Administração geral da plataforma.

### **Backend (Microsserviços em NestJS)**

1. **Auth Service** → Autenticação via JWT/OAuth.
2. **Order Service** → Gestão de pedidos e status.
3. **Payment Service** → Integração com Stripe, Pix e cartões.
4. **Restaurant Service** → Cadastro de restaurantes e cardápios.
5. **Delivery Service** → Gestão de entregadores e tracking.
6. **Notification Service** → Notificações push e e-mails.
7. **Geolocation Service** → Roteamento e cálculo de tempo de entrega.

### **Banco de Dados & Storage**

- **PostgreSQL** → Dados estruturados (pedidos, usuários, lojas).
- **MongoDB** → Logs, métricas e histórico de eventos.
- **AWS S3** → Armazenamento de imagens e comprovantes.

## **MVP - Funcionalidades Prioritárias**

✅ Cadastro de restaurantes e cardápios.
✅ Pedidos e pagamentos (Pix, cartão, dinheiro).
✅ Sistema de entregas e roteamento.
✅ Notificações em tempo real.
✅ Painel administrativo básico.