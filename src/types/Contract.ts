export type Contract<TRequest = unknown, TResponse = unknown> = { request: TRequest; response: TResponse };
export type ExtractFromContract<T> = T extends Contract<infer A, infer B> ? { request: A; response: B } : never;

export type ContractHandler<C extends Contract> = (data: C["request"]) => C["response"] | Promise<C["response"]>;

export type ReverseContract<C extends Contract> = Contract<C["response"], C["request"]>;

export type ReverseContractMap<CommonContract> = CommonContract extends Record<string, Contract>
  ? {
      [key in keyof CommonContract]: ReverseContract<CommonContract[key]>;
    }
  : never;
