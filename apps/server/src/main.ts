import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { execSync } from 'node:child_process';

const isOpenApiEnable = (argv: string[]): boolean => {
  for (const arg of argv) {
    if (arg.startsWith('openapi=')) {
      return arg[arg.length - 1] === '1';
    }
  }
  return false;
};

async function runPrismaMigrations() {
  console.log(execSync('bunx prisma db push').toString());
  // Check if seed is ending in js or ts
  if (execSync('ls ./providers/prisma/seed.*').toString().includes('seed.ts')) {
    console.log(execSync('bun run ./providers/prisma/seed.ts').toString());
  } else {
    console.log(execSync('bun run ./providers/prisma/seed.js').toString());
  }
}

async function main() {
  const app = await NestFactory.create(AppModule, { cors: true });

  if (isOpenApiEnable(process.argv)) {
    const config = new DocumentBuilder()
      .setTitle('Doone API')
      .setDescription('The Doone API description')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);

    await Bun.write('./open-api.json', JSON.stringify(document));
    return;
  }

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.setGlobalPrefix('api');

  await runPrismaMigrations();
  await app.listen(4040);
}

main().then();
