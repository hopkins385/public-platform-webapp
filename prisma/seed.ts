import { PrismaClient } from '@prisma/client';
import { ulid } from 'ulidx';
import * as bcrypt from 'bcrypt';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
}

const prisma = new PrismaClient();

async function main() {
  // create user
  const user = await prisma.user.upsert({
    where: { email: 'sven@svenson.ai' },
    update: {},
    create: {
      id: ulid().toLowerCase(),
      name: 'Sven Stadhouders',
      firstName: 'Sven',
      lastName: 'Stadhouders',
      email: 'sven@svenson.ai',
      password: await hashPassword(process.env.ADMIN_PASSWORD!),
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerifiedAt: new Date(),
    },
  });

  // create organization
  const org = await prisma.organisation.create({
    data: {
      id: ulid().toLowerCase(),
      name: 'Organisation',
    },
  });

  // create team
  const team = await prisma.team.create({
    data: {
      id: ulid().toLowerCase(),
      name: 'Team',
      organisation: { connect: { id: org.id } },
    },
  });

  // connect user with a team
  await prisma.teamUser.create({
    data: {
      id: ulid().toLowerCase(),
      user: { connect: { id: user.id } },
      team: { connect: { id: team.id } },
    },
  });

  // create credit
  await prisma.credit.create({
    data: {
      id: ulid().toLowerCase(),
      user: { connect: { id: user.id } },
      amount: 1000,
    },
  });

  for (let i = 0; i < 1; i++) {
    // create project
    const project = await prisma.project.create({
      data: {
        id: ulid().toLowerCase(),
        name: 'Project Nr. ' + i,
        description: 'This is a project',
        team: { connect: { id: team.id } },
      },
    });

    // create workflow
    const workflow = await prisma.workflow.create({
      data: {
        id: ulid().toLowerCase(),
        name: 'Workflow',
        description: 'This is a workflow',
        project: { connect: { id: project.id } },
      },
    });

    // create i workflow steps
    for (let i = 0; i < 3; i++) {
      // create assistant
      const assistant = await prisma.assistant.create({
        data: {
          id: ulid().toLowerCase(),
          team: { connect: { id: team.id } },
          title: 'Assistant Nr. ' + i,
          description: 'This is an assistant',
          systemPrompt: 'What do you want to do?',
          systemPromptTokenCount: 5,
        },
      });

      // create document
      const document = await prisma.document.create({
        data: {
          id: ulid().toLowerCase(),
          name: 'Document Nr. ' + i,
          description: 'This is a document',
          project: { connect: { id: project.id } },
        },
      });

      // create foreach document 10 document items
      for (let j = 0; j < 10; j++) {
        await prisma.documentItem.create({
          data: {
            id: ulid().toLowerCase(),
            document: { connect: { id: document.id } },
            orderColumn: j,
            content: 'This is a document item',
            type: 'text',
          },
        });
      }

      const workflowStep = await prisma.workflowStep.create({
        data: {
          id: ulid().toLowerCase(),
          name: `Step ${i}`,
          description: 'This is a workflow step',
          orderColumn: i,
          workflow: { connect: { id: workflow.id } },
          document: { connect: { id: document.id } },
          assistant: { connect: { id: assistant.id } },
        },
      });
    }
  }

  // console.log({ sven });
  // read json file and insert into db
  const path = join(__dirname, 'llm_providers.json');
  const data = readFileSync(path, 'utf8');
  const providers = JSON.parse(data);
  for (const provider of providers) {
    await prisma.largeLangModel.create({
      data: {
        id: ulid().toLowerCase(),
        provider: provider.provider,
        apiName: provider.apiName,
        description: provider.description,
        displayName: provider.displayName,
        contextSize: provider.contextSize,
        maxTokens: provider.maxTokens,
        multiModal: provider.multiModal,
        hidden: provider.hidden,
        free: provider.free,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
