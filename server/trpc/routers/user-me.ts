import { UserService } from '~/server/services/user.service';
import fs from 'fs';
import { join } from 'path';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const userMeRouter = router({
  // get me
  one: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findFirst({
      where: { id: ctx.user?.id },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        password: false,
        isAdmin: true,
        emailVerifiedAt: true,
        credit: {
          select: {
            amount: true,
          },
        },
      },
    });
  }),
  // update me
  update: protectedProcedure
    .input(
      z.object({
        data: z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
        }),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { data } = input;
      const name = `${data.firstName} ${data.lastName}`;
      return ctx.prisma.user.update({
        where: { id: ctx.user?.id },
        data: { name, ...data },
      });
    }),
  updatePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(6).max(100),
        newPassword: z.string().min(6).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userService = new UserService(ctx.prisma);
      return userService.updatePassword(
        ctx.user!.id,
        input.currentPassword,
        input.newPassword,
      );
    }),
  getUploads: protectedProcedure.query(({ ctx }) => {
    const files = fs.readdirSync(
      join(process.cwd(), 'public', 'uploads', ctx.user?.id),
    );
    return files.map((file) => ({
      name: file,
      path: join(process.cwd(), 'public', 'uploads', ctx.user?.id, file),
      url: `/uploads/${ctx.user?.id}/${file}`,
    }));
  }),
});
