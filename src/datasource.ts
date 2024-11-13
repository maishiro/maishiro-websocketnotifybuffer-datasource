import {
  DataSourceInstanceSettings,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  CircularDataFrame,
  FieldType,
  LoadingState,
  CoreApp
} from '@grafana/data';

import { Observable, merge } from 'rxjs';
import { DEFAULT_QUERY, MyDataSourceOptions, MyQuery } from './types';
// import { getTemplateSrv } from '@grafana/runtime';  // for Variable

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  url?: string;
  username: string;
  password: string;

  private connections: Map<string, WebSocket> = new Map();
  private frames: Map<string, CircularDataFrame> = new Map();

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    console.log('constructor()');
    this.url = instanceSettings.jsonData.url || 'ws://localhost:8080';
    this.username = instanceSettings.jsonData.username || '';
    this.password = instanceSettings.jsonData.password || '';
  }

  getDefaultQuery(_: CoreApp): Partial<MyQuery> {
    return DEFAULT_QUERY;
  }

  query(options: DataQueryRequest<MyQuery>): Observable<DataQueryResponse> {
    const observables = options.targets.map((query) => {
      return new Observable<DataQueryResponse>((subscriber) => {

        let frame = this.frames.get(query.refId);
        if (!frame) {
          const frame = new CircularDataFrame({
            append: 'tail',
            capacity: 5,
          });
          frame.refId = query.refId;
          frame.addField({ name: 'time', type: FieldType.time });
          frame.addField({ name: 'value', type: FieldType.string });
          this.frames.set(query.refId, frame);
        }
        // const frame = new CircularDataFrame({
        //   append: 'tail',
        //   capacity: 5,
        // });
        // frame.refId = query.refId;
        // frame.addField({ name: 'time', type: FieldType.time });
        // frame.addField({ name: 'value', type: FieldType.string });

        let connection = this.connections.get(query.refId);
        if (!connection || connection.readyState === WebSocket.CLOSED) {
          connection = new WebSocket(this.url || '');
          this.connections.set(query.refId, connection);
          connection.onerror = (error: any) => {
            console.log(`WebSocket error for ${query.refId}: ${JSON.stringify(error)}`);
          };
          connection.onopen = () => {
            console.log(`WebSocket connection opened for ${query.refId}`);
            // ここでクエリ固有の初期化処理を行うことができます
            console.log('WebSocket接続が確立されました');
            const connectCommand = {
              type: 'CONNECT',
              message: {
                userName: this.username,
                password: this.password
              }
            };
            console.log('connectCommand', connectCommand);
            connection?.send(JSON.stringify(connectCommand));
          };
          connection.onclose = () => {
            console.log('WebSocket接続が閉じられました');
            // webSocketsからquery.refIdをキーにWebSocketを削除
            // delete this.webSockets[query.refId];
            // subscriber.complete();
          };
          connection.onerror = (error: any) => {
            console.log(`WebSocket error: ${JSON.stringify(error)}`);
          };
  }

        const messageHandler = (msg: MessageEvent) => {
          console.log('messageHandler', msg);
          console.log('data', msg.data);
          const event = JSON.parse(msg.data);

          if (event.type === 'CONNECT_ACK') {
            console.log('Connect成功');
            const connectionId = event.connectId;
            // const target = getTemplateSrv().replace(query.target, options.scopedVars);
            const settingCommand = {
              type: 'SETTING',
              connectId: connectionId,
            };
            console.log('settingCommand', settingCommand);
            connection?.send(JSON.stringify(settingCommand));
          } else if (event.type === 'NOTICE_ACK') {
            console.log('Setting成功');
          } else if (event.type === 'NOTIFY') {
            console.log('NOTIFY', event);
            const time = Date.now();
            const value = JSON.stringify(event.message);
            console.log('time', time);
            console.log('value', value);
            frame?.add({ time, value });
            subscriber.next({
              data: [frame],
              key: query.refId,
              state: LoadingState.Streaming,
            });
          } else {
            console.warn('未知のメッセージ:', event);
          }
          // const { time, value } = JSON.parse(event.data);
          // frame.add({ time, value });
          // subscriber.next({
          //   data: [frame],
          //   key: query.refId,
          //   state: LoadingState.Streaming,
          // });
        };
        connection.addEventListener('message', messageHandler);

        // インターバルでquery更新が来たら更新待ちにならないようにとりあえず前回の情報をすぐに返す
        subscriber.next({
          data: [frame],
          key: query.refId,
          state: LoadingState.Streaming,
        });
        return () => {
          connection!.removeEventListener('message', messageHandler);
          // 接続を閉じる必要がある場合はここで行います
        };
      });
    });
    return merge(...observables);
  }

  // データソースが破棄されるときにすべてのWebSocket接続を閉じるメソッド
  dispose() {
    for (const [refId, connection] of this.connections) {
      connection.close();
      console.log(`Closed WebSocket connection for ${refId}`);
  }
    this.connections.clear();
  }

  /**
   * Checks whether we can connect to the API.
   */
  async testDatasource() {
    // データソースの接続テスト
    try {
      // WebSocketに接続しにいってみる。onopenで接続成功を確認
      await new Promise<void>((resolve, reject) => {
        const ws = new WebSocket(this.url || '');
        ws.onopen = () => {
          console.log('WebSocket接続が確立されました');
          ws.close();
          resolve();
        };
        ws.onerror = (error) => {
          console.error('WebSocket接続エラー:', error);
          reject(error);
      };
      });
      return { status: 'success', message: 'データソース接続成功' };
    } catch (error) {
      return { status: 'error', message: 'データソース接続失敗' };
    }
  }
}