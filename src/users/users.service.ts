import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateArgs = Parameters<PrismaService['user']['create']>[0];
type CreateUserInput = CreateArgs extends { data: infer D } ? D : never;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: CreateUserInput) {
    return this.prisma.user.create({ data });
  }
}
