import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';


async function bootstrap() {
  const app = await NestFactory.create(AppModule,{cors:true});
  app.use(json({limit:'50mb'}))

  if(process.env.NODE_ENV !== 'production'){
    const config = new DocumentBuilder()
    .setTitle('Practice001')
    .setDescription('The User API description')
    .setVersion('1.0')
    .addTag('users')
    .build();
    const document = SwaggerModule.createDocument(app,config);
    SwaggerModule.setup('api',app,document);
  }

  await app.listen(3005);
}
bootstrap();
