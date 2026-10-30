# Checklist externo — notificações

Passos manuais fora do código. Nada aqui foi executado.

1. Firebase `test-ben-1e234`: confirmar que o app Android `com.benprototype.app` existe e que a Cloud Messaging API (V1) está ativa.
2. Gerar a chave de conta de serviço FCM v1 e subir em `eas credentials` (plataforma Android, projeto `ba75dfd9-8220-4674-bb35-a7f9c812bb99`, owner `dhomini07`).
3. Opcional: criar um token de acesso Expo e defini-lo em `EXPO_ACCESS_TOKEN` no env do deploy de ben.df07.site. Só é necessário se "enhanced push security" estiver ligado no projeto Expo.
4. Fazer o deploy do server com a migration (o Dockerfile roda `migrate:deploy` no start).
5. Gerar um APK novo. Sem expo-updates, as correções só chegam ao aparelho com APK novo.
6. Disparar o push de teste pelo botão "Send test notification" (Configurações, seção Reminders) e conferir a notificação com o app aberto e em segundo plano.
7. Em Configurações do Android, conferir os canais "Reminders" e "Daily summary" e o acesso a alarmes exatos.
