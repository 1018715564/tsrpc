import { ApiServiceDef, MsgServiceDef } from '../proto/ServiceProto';
import { PrefixLogger } from './Logger';
import { ApiError } from '../proto/TransportData';
import { PoolItem } from '../models/Pool';

export interface ApiCallOptions {
    conn: any,
    logger: PrefixLogger,
    service: ApiServiceDef,
    sn: number,
    req: any
}
export abstract class ApiCall<CallOptions extends ApiCallOptions = ApiCallOptions, Req = any, Res = any> extends PoolItem<CallOptions> {
    readonly type = 'api' as const;

    logger!: PrefixLogger;
    service!: ApiServiceDef;
    sn!: number;
    req!: Req;
    // 已发送的响应
    res?: { isSucc: true, data: Res } | ({ isSucc: false } & ApiError);

    reset(options: ApiCallOptions) {
        this.logger = options.logger;
        this.service = options.service;
        this.sn = options.sn;
        this.req = options.req;
        this.res = undefined;
    }

    clean() {
        PrefixLogger.pool.put(this.logger);
        this.logger = this.service = this.sn = this.req = this.res = undefined as any;
    }

    abstract succ(data: Res): void;
    abstract error(message: string, info?: any): void;

    // Put into pool
    abstract destroy(): void;
}

export interface MsgCallOptions {
    conn: any,
    logger: PrefixLogger;
    service: MsgServiceDef,
    msg: any
}
export abstract class MsgCall<CallOptions extends MsgCallOptions = MsgCallOptions, Msg = any> extends PoolItem<CallOptions> {
    readonly type = 'msg' as const;

    logger!: PrefixLogger;
    service!: MsgServiceDef;
    msg!: Msg;

    reset(options: MsgCallOptions) {
        this.logger = options.logger;
        this.service = options.service;
        this.msg = options.msg;
    }

    clean() {
        PrefixLogger.pool.put(this.logger);
        this.logger = this.service = this.msg = undefined as any;
    }

    // Put into pool
    abstract destroy(): void;
}

export type BaseCall = ApiCall<ApiCallOptions> | MsgCall<MsgCallOptions>;