interface ChainExecution {
  chain: {
    chain_question: string
    chain_answer: string
    chain_start: string
    chain_end: string
    chain_status: string
  }
  traces: Array<{
    id: string
    node_type: string
    trace_start: string
    trace_end: string
    trace_status: string
  }>
}

export type { ChainExecution }
