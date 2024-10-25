import type { MediaService } from '~/server/services/media.service';
import type { DocumentService } from '~/server/services/document.service';
import type { ChatService } from '~/server/services/chat.service';
import type { UserService } from '~/server/services/user.service';
import type { ExtendedPrismaClient } from '../prisma';
import { Pipe } from '../pipe/pipeline';

export class DeletesUserAction {
  constructor(
    private readonly prisma: ExtendedPrismaClient,
    private readonly userService: UserService,
    private readonly chatService: ChatService,
    private readonly documentService: DocumentService,
    private readonly mediaService: MediaService,
  ) {}

  async findUser(userId: string) {
    return this.userService.getUserById(userId);
  }

  async deleteAllChatsByUserId(userId: string, projectId: string) {
    await this.chatService.deleteAllChatsByUserId(userId);
    return { userId, projectId };
  }

  async deleteAllDocumentsByProjectId(projectId: string) {
    return this.documentService.deleteAllDocumentsByProjectId(projectId);
  }

  async deleteAllMediaByProjectId(projectId: string) {
    // return this.mediaService.deleteAllMediaByProjectId(projectId);
  }

  async deleteUserTeams(userId: string) {
    const res = await this.prisma.teamUser.deleteMany({
      where: {
        userId,
      },
    });
    return { userId };
  }

  async deleteUserRoles(userId: string) {
    const res = await this.prisma.userRole.deleteMany({
      where: {
        userId,
      },
    });
    return { userId };
  }

  async deleteUserAccounts(userId: string) {
    const res = await this.prisma.account.deleteMany({
      where: {
        userId,
      },
    });
    return { userId };
  }

  async deleteUserSessions(userId: string) {
    const res = await this.prisma.session.deleteMany({
      where: {
        userId,
      },
    });
    return { userId };
  }

  async deleteUser(userId: string) {
    return this.userService.deleteUser(userId);
  }

  async runPipeline({ usrId }: { usrId: string }): Promise<void> {
    const pipe = Pipe.create(3, (p) => {
      p.addStep(async ({ usrId }) => this.findUser(usrId));
      p.addStep(async ({ id: userId, projectId }) => this.deleteAllChatsByUserId(userId, projectId));
      // p.addStep(async ({ projectId }) => await this.deleteAllDocumentsByProjectId(projectId));
      // p.addStep(async ({ projectId }) => await this.deleteAllMediaByProjectId(projectId));
      p.addStep(async ({ userId }) => this.deleteUserSessions(userId));
      p.addStep(async ({ userId }) => this.deleteUserAccounts(userId));
      p.addStep(async ({ userId }) => this.deleteUserTeams(userId));
      p.addStep(async ({ userId }) => this.deleteUserRoles(userId));
      p.addStep(async ({ userId }) => this.deleteUser(userId));
    });

    pipe.finally(async () => {
      console.log('User fully hard deleted');
    });

    await pipe.run({ usrId });
  }
}
