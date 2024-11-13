import React, { ChangeEvent } from 'react';
import { InlineField, Input } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, MySecureJsonData } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions, MySecureJsonData> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  // const { jsonData, secureJsonFields, secureJsonData } = options;

  const onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      url: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  const onUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      username: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  const onPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      password: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };
  
  // const onPathChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   onOptionsChange({
  //     ...options,
  //     jsonData: {
  //       ...jsonData,
  //       path: event.target.value,
  //     },
  //   });
  // };

  // // Secure field (only sent to the backend)
  // const onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   onOptionsChange({
  //     ...options,
  //     secureJsonData: {
  //       apiKey: event.target.value,
  //     },
  //   });
  // };

  // const onResetAPIKey = () => {
  //   onOptionsChange({
  //     ...options,
  //     secureJsonFields: {
  //       ...options.secureJsonFields,
  //       apiKey: false,
  //     },
  //     secureJsonData: {
  //       ...options.secureJsonData,
  //       apiKey: '',
  //     },
  //   });
  // };

  return (
    <div className="gf-form-group">
      <InlineField label="WebSocket URL" labelWidth={12}>
        <Input
          onChange={onUrlChange}
          value={options.jsonData.url || ''}
          placeholder="ws://example.com/websocket"
          width={40}
        />
      </InlineField>
      <InlineField label="ユーザー名" labelWidth={12}>
        <Input
          onChange={onUsernameChange}
          value={options.jsonData.username || ''}
          placeholder="ユーザー名"
          width={40}
        />
      </InlineField>
      <InlineField label="パスワード" labelWidth={12}>
        <Input
          onChange={onPasswordChange}
          value={options.jsonData.password || ''}
          placeholder="パスワード"
          width={40}
          // onReset={onResetPassword}
        />
      </InlineField>
    </div>
    // <>
    //   <InlineField label="Path" labelWidth={14} interactive tooltip={'Json field returned to frontend'}>
    //     <Input
    //       id="config-editor-path"
    //       onChange={onPathChange}
    //       value={jsonData.path}
    //       placeholder="Enter the path, e.g. /api/v1"
    //       width={40}
    //     />
    //   </InlineField>
    //   <InlineField label="API Key" labelWidth={14} interactive tooltip={'Secure json field (backend only)'}>
    //     <SecretInput
    //       required
    //       id="config-editor-api-key"
    //       isConfigured={secureJsonFields.apiKey}
    //       value={secureJsonData?.apiKey}
    //       placeholder="Enter your API key"
    //       width={40}
    //       onReset={onResetAPIKey}
    //       onChange={onAPIKeyChange}
    //     />
    //   </InlineField>
    // </>
  );
}