import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { LangchainCompletionFactory } from '~/server/factories/langchainCompletionFactory';
import { calculatorTool } from './chatTools';

export async function runAgent(body: any, controller: AbortController, config: any, callback: (token: string) => void) {
  const lastMessage = body.messages[body.messages.length - 1];

  const completion = new LangchainCompletionFactory(body.provider, body.model, config);
  const model = completion.create({
    temperature: body.temperature,
    maxTokens: body.maxTokens,
    stream: true,
  });

  // Prompt template must have "input" and "agent_scratchpad input variables"
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a helpful assistant'],
    ['placeholder', '{chat_history}'],
    ['human', '{input}'],
    ['placeholder', '{agent_scratchpad}'],
  ]);

  const agent = createToolCallingAgent({
    llm: model,
    tools: [calculatorTool],
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools: [calculatorTool],
  });

  const stream = await agentExecutor.stream(
    {
      input: lastMessage.content,
    },
    // {
    //   version: 'v2',
    // },
    /*{
      callbacks: [
        {
          handleLLMNewToken(token, idx, runId, parentRunId, tags, fields) {
            callback(token);
          },
          handleAgentAction(action, runId, parentRunId, tags) {
            console.log('action: ', action);
          },
        },
      ],
    },*/
  );
  // for await (const item of streamingEvents) {
  //   stream.update(JSON.parse(JSON.stringify(item, null, 2)));
  // }
  //
  // stream.done();
  //
  // return { streamData: stream.value };
  return stream;
}
