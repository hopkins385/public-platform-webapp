import { describe, expect, it, beforeEach } from 'vitest';
import { AssistantService } from '~/server/services/assistant.service';
import {
  CreateAssistantDto,
  DeleteAssistantDto,
  FindAssistantDto,
} from '~/server/services/dto/assistant.dto';
import type { ExtendedPrismaClient } from '~/server/utils/prisma/usePrisma';
import { getPrismaClient } from '~/server/utils/prisma/usePrisma';

describe('AssistantService', () => {
  const assistantService = new AssistantService();
  const prisma: ExtendedPrismaClient = getPrismaClient();
  let teamUser: any;
  let llm: any;

  beforeEach(async () => {
    // get the first team user
    teamUser = await prisma.teamUser.findFirst();
    // get the first llm
    llm = await prisma.largeLangModel.findFirst();
  });

  it('can create an assistant', async () => {
    const assistant = await assistantService.create(
      CreateAssistantDto.fromInput({
        teamId: teamUser.teamId,
        llmId: llm.id,
        title: 'title',
        description: 'description',
        systemPrompt: 'systemPrompt',
        isShared: false,
        systemPromptTokenCount: 0,
      }),
    );

    expect(assistant).toMatchObject({
      teamId: teamUser.teamId,
      llmId: llm.id,
      title: 'title',
      description: 'description',
      systemPrompt: 'systemPrompt',
      isShared: false,
      systemPromptTokenCount: 0,
    });
  });

  it('can get an assistant by id', async () => {
    // create an assistant
    const assistant = await assistantService.create(
      CreateAssistantDto.fromInput({
        teamId: teamUser.teamId,
        llmId: llm.id,
        title: 'title',
        description: 'description',
        systemPrompt: 'systemPrompt',
        isShared: false,
        systemPromptTokenCount: 0,
      }),
    );

    // get the assistant by id
    const assistantById = await assistantService.findFirst(
      FindAssistantDto.fromInput({
        id: assistant.id,
      }),
    );

    expect(assistantById).toMatchObject({
      id: assistant.id,
      llm: { id: llm.id },
      title: 'title',
      description: 'description',
      systemPrompt: 'systemPrompt',
      isShared: false,
      systemPromptTokenCount: 0,
    });
  });

  it('can delete an assistant by id', async () => {
    // create an assistant
    const assistant = await assistantService.create(
      CreateAssistantDto.fromInput({
        teamId: teamUser.teamId,
        llmId: llm.id,
        title: 'title',
        description: 'description',
        systemPrompt: 'systemPrompt',
        isShared: false,
        systemPromptTokenCount: 0,
      }),
    );

    // delete the assistant by id
    await assistantService.delete(
      DeleteAssistantDto.fromInput({
        id: assistant.id,
        teamId: teamUser.teamId,
      }),
    );

    // get the assistant by id
    const assistantById = await assistantService.findFirst(
      FindAssistantDto.fromInput({
        id: assistant.id,
      }),
    );

    expect(assistantById).toBeNull();
  });

  it('can soft delete an assistant by id', async () => {
    // create an assistant
    const assistant = await assistantService.create(
      CreateAssistantDto.fromInput({
        teamId: teamUser.teamId,
        llmId: llm.id,
        title: 'title',
        description: 'description',
        systemPrompt: 'systemPrompt',
        isShared: false,
        systemPromptTokenCount: 0,
      }),
    );

    // soft delete the assistant by id
    await assistantService.softDelete(
      DeleteAssistantDto.fromInput({
        id: assistant.id,
        teamId: teamUser.teamId,
      }),
    );

    // get the assistant by id
    const assistantById = await assistantService.findFirst(
      FindAssistantDto.fromInput({
        id: assistant.id,
      }),
    );

    expect(assistantById).toBeNull();
  });
});
