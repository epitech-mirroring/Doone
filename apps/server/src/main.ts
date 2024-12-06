import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const isOpenApiEnable = (argv: string[]): boolean => {
  for (const arg of argv) {
    if (arg.startsWith('openapi=')) {
      return arg[arg.length - 1] === '1';
    }
  }
  return false;
};

async function runPrismaMigrations() {
  console.log(
    Bun.spawnSync(['bunx', 'prisma', 'db', 'push']).stdout.toString(),
  );
  Bun.spawnSync([
    'find',
    '.',
    '-name',
    'seed.ts',
    '-exec',
    'node',
    '{}',
    '||',
    'find',
    '.',
    '-name',
    'seed.js',
    '-exec',
    'node',
    '{}',
    ';',
  ]).stdout.toString();
}

async function main() {
  await runPrismaMigrations();
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
  await app.listen(4040);
}

main().then();
