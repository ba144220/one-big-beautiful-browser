// npm install @langchain-anthropic
import { agentTools, askTools } from './tools';
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph';
import type { RunnableConfig } from '@langchain/core/runnables';
import { ConfigurationSchema, ensureConfiguration, loadChatModel } from './utils';
import { type AIMessage } from '@langchain/core/messages';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { MemorySaver } from '@langchain/langgraph-checkpoint';

const checkpointer = new MemorySaver();

async function callModel(
  state: typeof MessagesAnnotation.State,
  config: RunnableConfig,
): Promise<typeof MessagesAnnotation.Update> {
  const configuration = ensureConfiguration(config);
  const tools = configuration.mode === 'agent' ? agentTools : askTools;
  const model = loadChatModel(configuration.model).bindTools(tools);

  const response = await model.invoke([
    {
      role: 'system',
      content: configuration.systemPromptTemplate.replace('{system_time}', new Date().toISOString()),
    },
    ...state.messages,
  ]);

  return {
    messages: [response],
  };
}

function routeModelOutput(state: typeof MessagesAnnotation.State, config: RunnableConfig): string {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];
  const mode = ensureConfiguration(config).mode;
  // If the LLM is invoking tools, route there.
  if ((lastMessage as AIMessage)?.tool_calls?.length || 0 > 0) {
    if (mode === 'agent') {
      return 'agent_tools';
    } else {
      return 'ask_tools';
    }
  }
  // Otherwise end the graph.
  else {
    return '__end__';
  }
}
const workflow = new StateGraph(MessagesAnnotation, ConfigurationSchema)
  // Define the nodes
  .addNode('callModel', callModel)
  .addNode('ask_tools', new ToolNode(askTools))
  .addNode('agent_tools', new ToolNode(agentTools))
  // Set the entrypoint as `callModel`
  // This means that this node is the first one called
  .addEdge('__start__', 'callModel')
  .addConditionalEdges(
    // First, we define the edges' source node. We use `callModel`.
    // This means these are the edges taken after the `callModel` node is called.
    'callModel',
    // Next, we pass in the function that will determine the sink node(s), which
    // will be called after the source node is called.
    routeModelOutput,
  )
  // This means that after `tools` is called, `callModel` node is called next.
  .addEdge('ask_tools', 'callModel')
  .addEdge('agent_tools', 'callModel');

// Finally, we compile it!
// This compiles it into a graph you can invoke and deploy.
export const graph = workflow.compile({
  interruptBefore: [], // if you want to update the state before calling the tools
  interruptAfter: [],
  checkpointer,
});
