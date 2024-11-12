# BackendInStudio

Para correr el backend es necesario tener instalado Node, Docker y NX

> **Nota:** Recuerda que se deben de colocar las variables de entorno correspondientes a los servicios de Amazon Web Services para el correcto funcionamiento. No están incluidas en el repositorio debido al público acceso

## Inicialiar Kafka

Para permitir la comunicación de los servicios por medio de Kafka se debe usar:

```sh
docker-compose up
```

## Iniciar Servicios

### Iniciar todo la aplicación

Para correr el servidor de desarrollo:

```sh
npx nx serve backend-InStudio
```

Crear una producción:

```sh
npx nx build backend-InStudio
```
### Iniciar por servicios

Para iniciar por servicio la estructura es:

```sh
nx serve <nombre-del-servicio>
```

Como por ejemplo:

Iniciar el servicio de autenticación

```sh
nx serve auth-service
```
Iniciar el servicio de notificaciones

```sh
nx serve notification-service
```

Iniciar el servcio de admin

```sh
nx serve admin-service
```

Iniciar el servcio de analiticas

```sh
nx serve analytics-service
```
